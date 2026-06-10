import { getOrFetchShard, getShardsInRange } from "./PuzzleShards";

export interface PuzzleRow {
  fen: string;
  moves: string[];
  rating: number;
  themes: string[];
}

export async function getNextPuzzle(
  userElo: number = 1200,
  theme: string = "all",
  isHardMode: boolean = false,
): Promise<PuzzleRow | null> {
  const targetElo = isHardMode ? userElo + 300 : userElo;

  const shards = getShardsInRange(targetElo, 1);
  if (!shards.length) return null;

  const shard = shards[0];
  const cached = await getOrFetchShard(shard);
  if (!cached) return null;

  const lines = cached.puzzles.split("\n").slice(1);

  const filteredPuzzles: PuzzleRow[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const parts = trimmed.split(",");
    if (parts.length < 4) continue;

    const rating = parseInt(parts[2], 10);
    if (Number.isNaN(rating)) continue;

    const themesArray = parts[3].split(" ").filter(Boolean);
    if (theme && theme !== "all" && !themesArray.includes(theme)) continue;

    filteredPuzzles.push({
      fen: parts[0],
      moves: parts[1].split(" ").filter(Boolean),
      rating,
      themes: themesArray,
    });
  }

  if (!filteredPuzzles.length) return null;

  filteredPuzzles.sort(
    (a, b) => Math.abs(a.rating - targetElo) - Math.abs(b.rating - targetElo),
  );

  const poolSize = Math.min(5, filteredPuzzles.length);
  return filteredPuzzles[Math.floor(Math.random() * poolSize)];
}
