import { useState, useEffect, useCallback, useMemo } from 'react';
import openingLines, { type OpeningLine } from '@/data/openingLines';

type LineStatus = 'new' | 'completed';

interface LineProgress {
  status: LineStatus;
  wrongAttempts: number;
  lastReviewed: number | null;
}

const STORAGE_KEY = 'opening-progress';

function loadAll(): Record<string, LineProgress> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAll(data: Record<string, LineProgress>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Deviation depth: how many initial moves a line shares with the mainline.
// Lines with higher depth stay closer to mainline and are taught first in BFS order.
function deviationDepth(line: OpeningLine, mainline: OpeningLine): number {
  let depth = 0;
  for (let i = 0; i < Math.min(mainline.moves.length, line.moves.length); i++) {
    if (mainline.moves[i].san !== line.moves[i].san) break;
    depth++;
  }
  return depth;
}

function sortLinesBFS(lines: OpeningLine[]): OpeningLine[] {
  const mainlines = lines.filter(l => l.mainline);
  if (mainlines.length === 0) {
    // No mainline (e.g. Defend Noob Attacks) — keep original order
    return [...lines];
  }
  // Use the longest mainline as the BFS reference (deepest trunk)
  const mainline = mainlines.reduce((a, b) => a.moves.length >= b.moves.length ? a : b);
  return [...lines].sort((a, b) => {
    if (a.mainline && !b.mainline) return -1;
    if (!a.mainline && b.mainline) return 1;
    if (a.mainline && b.mainline) return 0;
    // Ascending by deviation depth — shallower branches taught first
    return deviationDepth(a, mainline) - deviationDepth(b, mainline);
  });
}

export function useOpeningProgress() {
  const [progress, setProgress] = useState<Record<string, LineProgress>>({});

  useEffect(() => {
    setProgress(loadAll());
  }, []);

  const getLine = useCallback((id: string): LineProgress => {
    return progress[id] ?? { status: 'new', wrongAttempts: 0, lastReviewed: null };
  }, [progress]);

  const markCompleted = useCallback((id: string, wrongCount: number) => {
    setProgress(prev => {
      const next = { ...prev, [id]: { status: 'completed' as const, wrongAttempts: wrongCount, lastReviewed: Date.now() } };
      saveAll(next);
      return next;
    });
  }, []);

  const lines = openingLines;
  const totalLines = lines.length;
  const newCount = lines.filter(l => getLine(l.id).status === 'new').length;
  const completedCount = lines.filter(l => getLine(l.id).status === 'completed').length;

  // Group lines and sort each group by BFS
  const groups = useMemo(() => {
    const grouped: Record<string, OpeningLine[]> = {};
    const ungrouped: OpeningLine[] = [];
    for (const line of lines) {
      if (line.group) {
        if (!grouped[line.group]) grouped[line.group] = [];
        grouped[line.group].push(line);
      } else {
        ungrouped.push(line);
      }
    }
    const sorted: { groupName: string; lines: OpeningLine[] }[] = [];
    for (const [groupName, groupLines] of Object.entries(grouped)) {
      sorted.push({ groupName, lines: sortLinesBFS(groupLines) });
    }
    sorted.sort((a, b) => a.groupName.localeCompare(b.groupName));
    return { sorted, ungrouped };
  }, [lines]);

  // Find the next line to learn in a group (first uncompleted in BFS order).
  // For groups without a mainline, pick a random uncompleted line.
  const getNextToLearn = useCallback((groupLines: OpeningLine[]): { id: string; mode: 'learn' } | null => {
    const hasMainline = groupLines.some(l => l.mainline);
    const bfsLines = hasMainline ? sortLinesBFS(groupLines) : groupLines;
    const uncompleted = bfsLines.filter(l => getLine(l.id).status === 'new');
    if (uncompleted.length === 0) return null;
    if (hasMainline) {
      return { id: uncompleted[0].id, mode: 'learn' };
    }
    // No mainline — random
    const pick = uncompleted[Math.floor(Math.random() * uncompleted.length)];
    return { id: pick.id, mode: 'learn' };
  }, [getLine]);

  // Find the best line to revise in a group (least recently reviewed).
  const getNextToRevise = useCallback((groupLines: OpeningLine[]): { id: string; mode: 'revise' } | null => {
    const completed = groupLines
      .map(l => ({ id: l.id, progress: getLine(l.id) }))
      .filter(({ progress }) => progress.status === 'completed');
    if (completed.length === 0) return null;
    completed.sort((a, b) => (a.progress.lastReviewed ?? 0) - (b.progress.lastReviewed ?? 0));
    return { id: completed[0].id, mode: 'revise' };
  }, [getLine]);

  return { lines, totalLines, newCount, completedCount, groups, getLine, markCompleted, getNextToLearn, getNextToRevise };
}
