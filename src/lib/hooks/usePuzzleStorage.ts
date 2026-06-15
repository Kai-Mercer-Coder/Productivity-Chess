"use client";

import { useCallback, useRef } from 'react';
import { db } from '@/lib/db/gameDB';

const BATCH_SIZE = 10;

export function usePuzzleStorage() {
  const lastBatchRef = useRef(0);

  const recordAttempt = useCallback(async (
    puzzleId: string,
    fen: string,
    correct: boolean,
    hinted?: boolean,
  ) => {
    if (correct) {
      await db.puzzleFails.where('puzzleId').equals(puzzleId).delete();
      await db.puzzleSolves.add({ puzzleId, date: new Date().toISOString(), correct: true, hinted });

      const total = await db.puzzleSolves.where('correct').equals(1).count();
      const prevBatch = lastBatchRef.current;
      const nextBatch = Math.floor(total / BATCH_SIZE);
      if (nextBatch > prevBatch) {
        lastBatchRef.current = nextBatch;
        try {
          await fetch('/api/puzzlecount', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ count: total }),
          });
        } catch { /* ignore */ }
      }
    } else {
      const existing = await db.puzzleFails.where('puzzleId').equals(puzzleId).first();
      await db.puzzleFails.put({
        puzzleId,
        fen,
        attempts: (existing?.attempts ?? 0) + 1,
        lastSeen: Date.now(),
      });
      await db.puzzleSolves.add({ puzzleId, date: new Date().toISOString(), correct: false, hinted });
    }
  }, []);

  const getRecentAttempts = useCallback(async (limit = 20, windowHours = 0) => {
    let cutoff = 0;
    if (windowHours > 0) {
      const stored = localStorage.getItem('puzzleStreakStart');
      const saved = stored ? parseInt(stored, 10) : 0;
      const elapsed = Date.now() - saved;
      if (elapsed > windowHours * 3600000 || !saved) {
        localStorage.setItem('puzzleStreakStart', String(Date.now()));
        return [];
      }
      cutoff = saved;
    }
    const all = await db.puzzleSolves
      .orderBy('id')
      .reverse()
      .toArray();
    const filtered = cutoff ? all.filter((a) => new Date(a.date).getTime() >= cutoff) : all;
    return filtered.slice(0, limit);
  }, []);

  const getFailedPuzzles = useCallback(async (limit = 5) => {
    const fails = await db.puzzleFails.toArray();
    fails.sort((a, b) => b.attempts - a.attempts);
    const totalWeight = fails.reduce((s, f) => s + f.attempts, 0);
    if (totalWeight === 0) return [];
    const selected: typeof fails = [];
    for (let i = 0; i < limit && fails.length > 0; i++) {
      let r = Math.random() * totalWeight;
      for (const f of fails) {
        r -= f.attempts;
        if (r <= 0) {
          selected.push(f);
          break;
        }
      }
    }
    return selected;
  }, []);

  return { recordAttempt, getRecentAttempts, getFailedPuzzles };
}
