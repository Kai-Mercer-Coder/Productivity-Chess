import type { OpeningLine } from "@/data/openingLines";

export interface OpeningVariation {
  line: OpeningLine;
  deviationOffset: number;
}

export interface OpeningCourse {
  id: string;
  name: string;
  mainLine: OpeningLine;
  variations: OpeningVariation[];
}

export function computeDeviationOffset(
  variation: OpeningLine,
  mainLine: OpeningLine,
): number {
  const minLen = Math.min(variation.moves.length, mainLine.moves.length);
  for (let i = 0; i < minLen; i++) {
    if (variation.moves[i].san !== mainLine.moves[i].san) {
      return i;
    }
  }
  return variation.moves.length === mainLine.moves.length ? -1 : minLen;
}

export function buildOpeningCourses(lines: OpeningLine[]): OpeningCourse[] {
  const groups = new Map<string, OpeningLine[]>();
  for (const line of lines) {
    const key = line.group ?? "Ungrouped";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)?.push(line);
  }

  const courses: OpeningCourse[] = [];

  for (const [name, groupLines] of groups) {
    const mainLine = groupLines[0];
    const variations: OpeningVariation[] = [];

    for (const line of groupLines) {
      if (line.id === mainLine.id) continue;
      const offset = computeDeviationOffset(line, mainLine);
      variations.push({ line, deviationOffset: offset });
    }

    variations.sort((a, b) => a.deviationOffset - b.deviationOffset);

    courses.push({
      id: mainLine.group ?? mainLine.id,
      name,
      mainLine,
      variations,
    });
  }

  return courses;
}
