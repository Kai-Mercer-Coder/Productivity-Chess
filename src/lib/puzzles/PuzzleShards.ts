import Dexie, { type Table } from "dexie";

export interface CachedPuzzleShard {
  id: string;
  minRating: number;
  maxRating: number;
  puzzles: string;
  lastLoaded: number;
}

class PuzzleShardDB extends Dexie {
  shards!: Table<CachedPuzzleShard>;
  constructor() {
    super("PuzzleShardsDB");
    this.version(1).stores({ shards: "id, minRating, maxRating" });
    this.version(2).stores({ shards: "id, minRating, maxRating" }).upgrade((tx) =>
      tx.table("shards").toCollection().modify((shard: any) => {
        if (Array.isArray(shard.puzzles)) {
          shard.puzzles = shard.puzzles.join("\n");
        }
      })
    );
  }
}

export const puzzleShardDB = new PuzzleShardDB();

export interface ShardRange {
  id: string;
  minRating: number;
  maxRating: number;
}

export const SHARD_RANGES: readonly ShardRange[] = [
  { id: "puzzles_399_678", minRating: 399, maxRating: 678 },
  { id: "puzzles_679_958", minRating: 679, maxRating: 958 },
  { id: "puzzles_959_1238", minRating: 959, maxRating: 1238 },
  { id: "puzzles_1239_1518", minRating: 1239, maxRating: 1518 },
  { id: "puzzles_1519_1797", minRating: 1519, maxRating: 1797 },
  { id: "puzzles_1798_2077", minRating: 1798, maxRating: 2077 },
  { id: "puzzles_2078_2357", minRating: 2078, maxRating: 2357 },
  { id: "puzzles_2358_2637", minRating: 2358, maxRating: 2637 },
  { id: "puzzles_2638_2917", minRating: 2638, maxRating: 2917 },
  { id: "puzzles_2918_3197", minRating: 2918, maxRating: 3197 },
] as const;

export function getShardsInRange(
  userElo: number,
  windowSize: number = 2,
): ShardRange[] {
  const middleIndex = SHARD_RANGES.findIndex(
    (s) => userElo >= s.minRating && userElo <= s.maxRating,
  );

  let targetIndex =
    middleIndex === -1
      ? SHARD_RANGES.findIndex((s) => userElo < s.minRating)
      : middleIndex;

  if (targetIndex === -1) targetIndex = SHARD_RANGES.length - 1;

  const clampedIndex = Math.max(
    0,
    Math.min(targetIndex, SHARD_RANGES.length - 1),
  );
  const halfWindow = Math.max(0, Math.floor((windowSize - 1) / 2));
  const startIndex = Math.max(0, clampedIndex - halfWindow);
  const endIndex = Math.min(SHARD_RANGES.length - 1, clampedIndex + halfWindow);

  return SHARD_RANGES.slice(startIndex, endIndex + 1);
}

export function getShardIdForElo(userElo: number): string {
  const ranges = getShardsInRange(userElo, 1);
  return ranges[0]?.id ?? SHARD_RANGES[0].id;
}

// -- Fetch deduplication layer --
const inFlightFetches = new Map<string, Promise<CachedPuzzleShard | null>>();

async function fetchTextWithRetry(
  url: string,
  maxRetries = 2,
): Promise<string> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (err) {
      if (attempt === maxRetries) throw err;
      const delay = Math.min(1000 * 2 ** attempt + Math.random() * 200, 3000);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("Unreachable");
}

async function putWithQuotaRecovery(shard: CachedPuzzleShard): Promise<void> {
  try {
    await puzzleShardDB.shards.put(shard);
  } catch (err) {
    if (err instanceof DOMException && err.name === "QuotaExceededError") {
      const oldest = await puzzleShardDB.shards.orderBy("lastLoaded").first();
      if (oldest) {
        await puzzleShardDB.shards.delete(oldest.id);
        await puzzleShardDB.shards.put(shard);
        return;
      }
    }
    throw err;
  }
}

export async function getOrFetchShard(
  shard: ShardRange,
): Promise<CachedPuzzleShard | null> {
  const cached = await puzzleShardDB.shards.get(shard.id);
  if (cached) return cached;

  const existing = inFlightFetches.get(shard.id);
  if (existing) return existing;

  const promise = (async (): Promise<CachedPuzzleShard | null> => {
    try {
      const text = await fetchTextWithRetry(`/puzzle_shards/${shard.id}.csv`);
      const newShard: CachedPuzzleShard = {
        id: shard.id,
        minRating: shard.minRating,
        maxRating: shard.maxRating,
        puzzles: text,
        lastLoaded: Date.now(),
      };
      await putWithQuotaRecovery(newShard);
      return newShard;
    } catch (error) {
      console.error(`Failed to fetch shard ${shard.id}:`, error);
      return null;
    } finally {
      inFlightFetches.delete(shard.id);
    }
  })();

  inFlightFetches.set(shard.id, promise);
  return promise;
}

export async function getCachedOrFetchPuzzles(
  userElo: number,
  windowSize: number = 3,
): Promise<string[]> {
  const shards = getShardsInRange(userElo, windowSize);
  const puzzleLines: string[] = [];

  for (const shard of shards) {
    const cached = await getOrFetchShard(shard);
    if (cached) {
      const raw = Array.isArray(cached.puzzles) ? (cached.puzzles as any).join("\n") : cached.puzzles;
      const lines = raw.split("\n").slice(1);
      puzzleLines.push(...lines.filter((line: string) => line.trim()));
    }
  }

  return puzzleLines;
}

export async function preloadShardsForElo(
  userElo: number,
  windowSize: number = 3,
): Promise<void> {
  const shards = getShardsInRange(userElo, windowSize);
  await Promise.all(
    shards.map((shard) =>
      puzzleShardDB.shards.get(shard.id).then((cached) => {
        if (!cached) return getOrFetchShard(shard);
      }),
    ),
  );
}

export async function clearOldShards(
  maxAgeMs: number = 24 * 60 * 60 * 1000,
): Promise<number> {
  const cutoff = Date.now() - maxAgeMs;
  return puzzleShardDB.shards.where("lastLoaded").below(cutoff).delete();
}
