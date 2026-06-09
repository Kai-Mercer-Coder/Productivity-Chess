import Dexie, { type Table } from "dexie";

// 1. Unified TypeScript Interfaces
export interface CachedPuzzleShard {
  id: string;
  puzzles: string[]; // Native array storage prevents repetitive text parsing
  lastLoaded: number;
}

export interface PuzzleRow {
  fen: string;
  moves: string[];
  rating: number;
  themes: string[];
}

// 2. High-Speed Dexie Setup
class PuzzleShardDB extends Dexie {
  shards!: Table<CachedPuzzleShard>;

  constructor() {
    super("PuzzleShardsDB");
    this.version(1).stores({ shards: "id" });
  }
}
const db = new PuzzleShardDB();

// 3. Shard Boundaries Array (Mapped to your exact /public/puzzle_shards/*.csv files)
const RATING_STEPS = [399, 679, 959, 1239, 1519, 1798, 2078, 2358, 2638, 2918, 3198];
const SHARD_IDS = [
  "puzzles_399_678", "puzzles_679_958", "puzzles_959_1238", "puzzles_1239_1518",
  "puzzles_1519_1797", "puzzles_1798_2077", "puzzles_2078_2357", "puzzles_2358_2637",
  "puzzles_2638_2917", "puzzles_2918_3197"
];

/**
 * Automatically finds the exact shard name matching the user's Elo rating
 */
function getShardIdForElo(userElo: number): string {
  let index = RATING_STEPS.findIndex((step) => userElo < step) - 1;
  if (index < 0) index = userElo >= 3198 ? SHARD_IDS.length - 1 : 0;
  return SHARD_IDS[index];
}

/**
 * Dynamic Core Engine: Checks IndexedDB cache first, fallbacks to /public folder
 */
async function getOrFetchSingleShard(shardId: string): Promise<string[]> {
  // Check browser cache first
  const cached = await db.shards.get(shardId);
  if (cached) return cached.puzzles;

  // Fallback: Download from /public folder on the first load
  try {
    const response = await fetch(`/puzzle_shards/${shardId}.csv`);
    if (!response.ok) throw new Error();

    const text = await response.text();
    // Split text rows, trim whitespaces, remove empty lines, and drop the CSV header line
    const lines = text.split("\n").slice(1).map(l => l.trim()).filter(Boolean);

    // Cache it forever inside IndexedDB asynchronously
    await db.shards.put({ id: shardId, puzzles: lines, lastLoaded: Date.now() });
    return lines;
  } catch (error) {
    console.error(`Could not stream file /public/puzzle_shards/${shardId}.csv`, error);
    return [];
  }
}

/**
 * Main Entry Method: Fetches target shard and cleanly returns a matching chess puzzle
 */
export async function getNextPuzzle(
  userElo: number = 1200,
  theme: string = "all",
  isHardMode: boolean = false
): Promise<PuzzleRow | null> {
  const targetElo = isHardMode ? userElo + 300 : userElo;

  // Find and download/load the exactly matched shard file
  const shardId = getShardIdForElo(targetElo);
  const rawLines = await getOrFetchSingleShard(shardId);
  if (!rawLines.length) return null;

  const filteredPuzzles: PuzzleRow[] = [];

  // Parse lines and apply your active theme filters
  for (const line of rawLines) {
    const parts = line.split(",");
    if (parts.length < 4) continue;

    const rating = parseInt(parts[2], 10);
    if (isNaN(rating)) continue;

    const themesArray = parts[3].split(" ").filter(Boolean);
    if (theme && theme !== "all" && !themesArray.includes(theme)) continue;

    filteredPuzzles.push({
      fen: parts[0],
      moves: parts[1].split(" ").filter(Boolean),
      rating,
      themes: themesArray
    });
  }

  if (!filteredPuzzles.length) return null;

  // Sort by closest matching puzzle difficulty
  filteredPuzzles.sort((a, b) => Math.abs(a.rating - targetElo) - Math.abs(b.rating - targetElo));

  // Pick randomly from top 5 best results to keep it dynamic
  const poolSize = Math.min(5, filteredPuzzles.length);
  return filteredPuzzles[Math.floor(Math.random() * poolSize)];
}
