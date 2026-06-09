import Dexie, { type Table } from "dexie";

// ✅ ONE definition only, using minRating/maxRating throughout
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

export function getShardsInRange(userElo: number, windowSize: number = 2): ShardRange[] {
  const middleIndex = SHARD_RANGES.findIndex(
    (s) => userElo >= s.minRating && userElo <= s.maxRating
  );

  let targetIndex =
    middleIndex === -1
      ? SHARD_RANGES.findIndex((s) => userElo < s.minRating)
      : middleIndex;

  if (targetIndex === -1) targetIndex = SHARD_RANGES.length - 1;

  const clampedIndex = Math.max(0, Math.min(targetIndex, SHARD_RANGES.length - 1));
  const halfWindow = Math.max(0, Math.floor((windowSize - 1) / 2));
  const startIndex = Math.max(0, clampedIndex - halfWindow);
  const endIndex = Math.min(SHARD_RANGES.length - 1, clampedIndex + halfWindow);

  return SHARD_RANGES.slice(startIndex, endIndex + 1);
}

export async function getOrFetchShard(shard: ShardRange): Promise<CachedPuzzleShard | null> {
  const cached = await puzzleShardDB.shards.get(shard.id);
  if (cached) return cached;

  try {
    const response = await fetch(`/puzzle_shards/${shard.id}.csv`);
    if (!response.ok) throw new Error(`Failed to fetch ${shard.id}`);

    const text = await response.text();
    const newShard: CachedPuzzleShard = {
      id: shard.id,
      minRating: shard.minRating,
      maxRating: shard.maxRating,
      puzzles: text,
      lastLoaded: Date.now(),
    };

    await puzzleShardDB.shards.put(newShard);
    return newShard;
  } catch (error) {
    console.error(`Failed to fetch shard ${shard.id}:`, error);
    return null;
  }
}

export async function getCachedOrFetchPuzzles(userElo: number, windowSize: number = 3): Promise<string[]> {
  const shards = getShardsInRange(userElo, windowSize);
  const puzzleLines: string[] = [];

  for (const shard of shards) {
    const cached = await getOrFetchShard(shard);
    if (cached) {
      const lines = cached.puzzles.split("\n").slice(1);
      puzzleLines.push(...lines.filter((line) => line.trim()));
    }
  }

  return puzzleLines;
}

export async function preloadShardsForElo(userElo: number, windowSize: number = 3): Promise<void> {
  const shards = getShardsInRange(userElo, windowSize);
  await Promise.all(
    shards.map(async (shard) => {
      const cached = await puzzleShardDB.shards.get(shard.id);
      if (!cached) await getOrFetchShard(shard);
    })
  );
}

export async function clearOldShards(maxAgeMs: number = 24 * 60 * 60 * 1000): Promise<void> {
  const cutoff = Date.now() - maxAgeMs;
  await puzzleShardDB.shards.where("lastLoaded").below(cutoff).delete();
}