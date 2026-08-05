"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { db, type EloRecord } from "@/lib/db/gameDB";
import { updatePuzzleRating } from "@/lib/rating/GlickoRating";

const ELO_ID = 1;
const DEFAULT_RATING = 1200;
const DEFAULT_RD = 200;
const DEFAULT_VOL = 0.06;

async function getElo(): Promise<EloRecord> {
  const record = await db.elo.get(ELO_ID);
  return record || { id: ELO_ID, rating: DEFAULT_RATING, rd: DEFAULT_RD, volatility: DEFAULT_VOL, prevRatings: [], updatedAt: new Date().toISOString() };
}

async function saveElo(elo: { rating: number; rd: number; volatility: number; prevRatings: number[] }) {
  await db.elo.put({ id: ELO_ID, ...elo, updatedAt: new Date().toISOString() });
}

// Legacy records created before the profile-elo seed existed started from the
// 1200 default instead of the user's onboarding elo. Shift them onto the
// correct base once (detected by prevRatings[0] === DEFAULT_RATING).
function rebaseLegacy(record: EloRecord, profileElo?: number): { rating: number; rd: number; volatility: number; prevRatings: number[] } | null {
  if (profileElo == null || profileElo === DEFAULT_RATING) return null;
  if ((record.prevRatings?.[0] ?? null) !== DEFAULT_RATING) return null;
  const offset = profileElo - DEFAULT_RATING;
  return {
    rating: record.rating + offset,
    rd: record.rd,
    volatility: record.volatility,
    prevRatings: (record.prevRatings || []).map((r) => r + offset),
  };
}

export async function recordEloHistory(rating: number, source: 'puzzle' | 'game') {
  await db.eloHistory.add({ rating, date: new Date().toISOString(), source });
}

export function useLocalElo(initialElo?: number) {
  const [userElo, setUserElo] = useState(initialElo ?? DEFAULT_RATING);
  const [eloRd, setEloRd] = useState(DEFAULT_RD);
  const [eloVol, setEloVol] = useState(DEFAULT_VOL);
  const [lastDelta, setLastDelta] = useState<number | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    db.elo.get(ELO_ID).then((record) => {
      if (record) {
        const rebased = rebaseLegacy(record, initialElo);
        if (rebased) {
          saveElo(rebased);
          setUserElo(rebased.rating);
          setEloRd(rebased.rd);
          setEloVol(rebased.volatility);
        } else {
          setUserElo(record.rating);
          setEloRd(record.rd);
          setEloVol(record.volatility);
        }
        initializedRef.current = true;
      } else if (initialElo != null) {
        saveElo({ rating: initialElo, rd: DEFAULT_RD, volatility: DEFAULT_VOL, prevRatings: [] });
        setUserElo(initialElo);
        setEloRd(DEFAULT_RD);
        setEloVol(DEFAULT_VOL);
        initializedRef.current = true;
      }
    });
  }, [initialElo]);

  const updateEloAfterPuzzle = useCallback(
    (puzzleRating: number, solved: boolean, usedHint?: boolean) => {
      const result = updatePuzzleRating(userElo, eloRd, eloVol, puzzleRating, solved, usedHint ?? false);
      setUserElo(result.newRating);
      setEloRd(result.newRd);
      setEloVol(result.newVol);
      setLastDelta(result.delta);
      getElo().then((record) => {
        const prevRatings = record.prevRatings || [];
        prevRatings.push(userElo);
        saveElo({ rating: result.newRating, rd: result.newRd, volatility: result.newVol, prevRatings });
      });
      recordEloHistory(result.newRating, 'puzzle');
      return result;
    },
    [userElo, eloRd, eloVol],
  );

  const clearDelta = useCallback(() => setLastDelta(null), []);

  const resetElo = useCallback(async () => {
    await db.elo.put({ id: ELO_ID, rating: DEFAULT_RATING, rd: DEFAULT_RD, volatility: DEFAULT_VOL, prevRatings: [], updatedAt: new Date().toISOString() });
    setUserElo(DEFAULT_RATING);
    setEloRd(DEFAULT_RD);
    setEloVol(DEFAULT_VOL);
    setLastDelta(null);
  }, []);

  return { userElo, lastDelta, updateEloAfterPuzzle, clearDelta, resetElo };
}
