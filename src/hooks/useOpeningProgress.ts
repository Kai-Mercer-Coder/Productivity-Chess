import { useState, useEffect, useCallback } from 'react';
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

  return { lines, totalLines, newCount, completedCount, getLine, markCompleted };
}
