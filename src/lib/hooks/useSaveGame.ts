'use client';

import { useCallback, useState } from 'react';
import { Chess } from 'chess.js';
import { analyse } from '@/lib/chess/analyse';
import { db, type GameRecord } from '@/lib/db/gameDB';
import type { EvaluatedPosition } from '@/lib/types/Position';

interface SaveGameParams {
  pgn: string;
  playerColor: 'w' | 'b';
  opponentElo: number;
  eloAtTime: number;
  getPositionEval: (fen: string) => { evaluation: { type: 'cp' | 'mate'; value: number }; bestmove: string; bestmoveSan: string } | undefined;
  openingName?: string | null;
}

function computeResult(game: Chess): { result: GameRecord['result']; reason: string } {
  if (game.isCheckmate()) {
    const winner = game.turn() === 'w' ? 'black' : 'white';
    return { result: winner === 'white' ? 'win' : 'loss', reason: 'checkmate' };
  }
  if (game.isDraw()) {
    if (game.isStalemate()) return { result: 'draw', reason: 'stalemate' };
    if (game.isThreefoldRepetition()) return { result: 'draw', reason: 'repetition' };
    if (game.isInsufficientMaterial()) return { result: 'draw', reason: 'insufficient material' };
    return { result: 'draw', reason: '50-move rule' };
  }
  return { result: 'draw', reason: 'agreement' };
}

function reconstructPositions(pgn: string, getPositionEval: SaveGameParams['getPositionEval']): EvaluatedPosition[] {
  const game = new Chess();
  if (pgn) {
    try { game.loadPgn(pgn); } catch { /* partial/invalid pgn */ }
  }

  const allMoves = game.history({ verbose: true });
  const replay = new Chess();
  const positions: EvaluatedPosition[] = [];

  const startEval = getPositionEval(replay.fen());
  positions.push({
    fen: replay.fen(),
    move: { san: '', uci: '' },
    topLines: startEval
      ? [{ id: 1, depth: 18, evaluation: startEval.evaluation, moveUCI: startEval.bestmove, moveSAN: startEval.bestmoveSan }]
      : [{ id: 1, depth: 0, evaluation: { type: 'cp', value: 0 }, moveUCI: '', moveSAN: '' }],
    classification: undefined,
    worker: startEval ? 'cloud' : 'local',
  });

  for (const move of allMoves) {
    replay.move(move);
    const fen = replay.fen();
    const ev = getPositionEval(fen);
    positions.push({
      fen,
      move: { san: move.san, uci: move.from + move.to },
      topLines: ev
        ? [{ id: 1, depth: 18, evaluation: ev.evaluation, moveUCI: ev.bestmove, moveSAN: ev.bestmoveSan }]
        : [{ id: 1, depth: 0, evaluation: { type: 'cp', value: 0 }, moveUCI: '', moveSAN: '' }],
      classification: undefined,
      worker: ev ? 'cloud' : 'local',
    });
  }

  return positions;
}

export function useSaveGame() {
  const [saving, setSaving] = useState(false);

  const saveGame = useCallback(async (params: SaveGameParams): Promise<void> => {
    setSaving(true);

    try {
      const game = new Chess();
      if (params.pgn) {
        try { game.loadPgn(params.pgn); } catch {}
      }

      const { result, reason } = computeResult(game);
      const allMoves = game.history();

      const record: GameRecord = {
        date: new Date().toISOString(),
        playerColor: params.playerColor,
        opponentElo: params.opponentElo,
        result,
        reason,
        moves: allMoves,
        pgn: params.pgn,
        openingName: params.openingName ?? undefined,
        eloAtTime: params.eloAtTime,
        accuracyWhite: null,
        accuracyBlack: null,
        classifications: null,
      };

      const id = await db.games.add(record);

      const positions = reconstructPositions(params.pgn, params.getPositionEval);
      if (positions.length > 1) {
        try {
          const report = await analyse(positions);
          await db.games.update(id, {
            accuracyWhite: report.accuracies.white,
            accuracyBlack: report.accuracies.black,
            classifications: report.classifications,
          });
        } catch (err) {
          console.warn('Background accuracy analysis failed:', err);
        }
      }
    } catch (err) {
      console.error('Failed to save game:', err);
    } finally {
      setSaving(false);
    }
  }, []);

  return { saveGame, saving };
}
