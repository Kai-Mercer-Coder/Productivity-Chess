'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/db/gameDB';

export interface GameStats {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  ratingHistory: { date: string; rating: number }[];
  recentGames: {
    id: number;
    date: string;
    result: string;
    opponentElo: number;
    accuracy: number | null;
    openingName?: string;
  }[];
  averageAccuracy: number;
  blundersPerGame: number;
  openingStats: {
    name: string;
    games: number;
    wins: number;
    winRate: number;
    accuracy: number;
  }[];
  currentStreak: { type: 'win' | 'loss' | 'draw'; count: number };
  localPuzzleCount: number;
  loading: boolean;
}

function computeStreak(games: { result: string }[]): { type: 'win' | 'loss' | 'draw'; count: number } {
  for (let i = games.length - 1; i >= 0; i--) {
    const first = games[i].result;
    let count = 1;
    let j = i - 1;
    while (j >= 0 && games[j].result === first) {
      count++;
      j--;
    }
    return { type: first as 'win' | 'loss' | 'draw', count };
  }
  return { type: 'draw', count: 0 };
}

export function useGameStats() {
  const [stats, setStats] = useState<GameStats>({
    totalGames: 0, wins: 0, losses: 0, draws: 0, winRate: 0,
    ratingHistory: [], recentGames: [], averageAccuracy: 0,
    blundersPerGame: 0, openingStats: [], currentStreak: { type: 'draw', count: 0 },
    localPuzzleCount: 0, loading: true,
  });

  useEffect(() => {
    (async () => {
      try {
        const all = await db.games.orderBy('date').toArray();

        const totalGames = all.length;
        const wins = all.filter(g => g.result === 'win').length;
        const losses = all.filter(g => g.result === 'loss').length;
        const draws = all.filter(g => g.result === 'draw').length;
        const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

        const analyzed = all.filter(g => g.accuracyWhite !== null && g.accuracyBlack !== null);
        const avgAcc = analyzed.length > 0
          ? analyzed.reduce((s, g) => s + (g.accuracyWhite! + g.accuracyBlack!) / 2, 0) / analyzed.length
          : 0;

        const blunders = analyzed.reduce((s, g) => {
          if (!g.classifications) return s;
          return s + (g.classifications.white.blunder ?? 0) + (g.classifications.black.blunder ?? 0);
        }, 0);
        const blundersPerGame = analyzed.length > 0 ? blunders / analyzed.length : 0;

        const ratingHistory = all.map(g => ({ date: g.date.split('T')[0], rating: g.eloAtTime }));

        const recentGames = [...all].reverse().slice(0, 10).map(g => ({
          id: g.id!,
          date: g.date,
          result: g.result,
          opponentElo: g.opponentElo,
          accuracy: g.accuracyWhite ?? g.accuracyBlack ?? null,
          openingName: g.openingName,
        }));

        const openingMap = new Map<string, { games: number; wins: number; accSum: number; accCount: number }>();
        for (const g of all) {
          if (!g.openingName) continue;
          const entry = openingMap.get(g.openingName) ?? { games: 0, wins: 0, accSum: 0, accCount: 0 };
          entry.games++;
          if (g.result === 'win') entry.wins++;
          if (g.accuracyWhite !== null) {
            entry.accSum += (g.accuracyWhite + (g.accuracyBlack ?? g.accuracyWhite)) / 2;
            entry.accCount++;
          }
          openingMap.set(g.openingName, entry);
        }
        const openingStats = [...openingMap.entries()]
          .map(([name, d]) => ({
            name,
            games: d.games,
            wins: d.wins,
            winRate: (d.wins / d.games) * 100,
            accuracy: d.accCount > 0 ? d.accSum / d.accCount : 0,
          }))
          .sort((a, b) => b.games - a.games);

        const currentStreak = computeStreak(all);

        const localPuzzleCount = await db.puzzleSolves.count();

        setStats({
          totalGames, wins, losses, draws, winRate,
          ratingHistory, recentGames, averageAccuracy: avgAcc,
          blundersPerGame, openingStats, currentStreak,
          localPuzzleCount, loading: false,
        });
      } catch (err) {
        console.error('Failed to load game stats:', err);
        setStats(s => ({ ...s, loading: false }));
      }
    })();
  }, []);

  return stats;
}
