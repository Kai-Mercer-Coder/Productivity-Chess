export interface PuzzleEntry {
  fen: string;
}

export interface PuzzleCategory {
  name: string;
  positions: PuzzleEntry[];
}

export interface PuzzleGame {
  fen: string;
  target: string;
}

export interface SubcategoryInfo {
  name: string;
  games: PuzzleGame[];
}

export interface PuzzleCategoryWithSubs {
  name: string;
  subcategories: SubcategoryInfo[];
}

let cached: PuzzleCategory[] | null = null;
let cachedWithSubs: PuzzleCategoryWithSubs[] | null = null;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export async function fetchPuzzleCategories(): Promise<PuzzleCategory[]> {
  if (cached) return cached;
  const res = await fetch("/endgamedatabase.json");
  const data = await res.json();
  cached = data.categories.map((cat: any) => ({
    name: cat.name,
    positions: cat.subcategories.flatMap((sub: any) =>
      sub.games.map((g: any) => ({ fen: g.fen })),
    ),
  }));
  return cached!;
}

export async function fetchPuzzleCategoriesWithSubs(): Promise<
  PuzzleCategoryWithSubs[]
> {
  if (cachedWithSubs) return cachedWithSubs;
  const res = await fetch("/endgamedatabase.json");
  const data = await res.json();
  cachedWithSubs = data.categories.map((cat: any) => ({
    name: cat.name,
    subcategories: cat.subcategories.map((sub: any) => ({
      name: sub.name,
      games: sub.games.map((g: any) => ({ fen: g.fen, target: g.target })),
    })),
  }));
  return cachedWithSubs!;
}

export function getCategorySlug(name: string): string {
  return slugify(name);
}

export function findCategoryBySlug(
  slug: string,
  cats: PuzzleCategory[],
): PuzzleCategory | undefined {
  return cats.find((c) => getCategorySlug(c.name) === slug);
}

export function findCategoryWithSubsBySlug(
  slug: string,
  cats: PuzzleCategoryWithSubs[],
): PuzzleCategoryWithSubs | undefined {
  return cats.find((c) => getCategorySlug(c.name) === slug);
}

export function pickSubcategoryFens(
  sub: SubcategoryInfo,
  count = 20,
): string[] {
  return shuffle(sub.games.map((g) => g.fen)).slice(
    0,
    Math.min(count, sub.games.length),
  );
}
