'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import { Chess, type PieceSymbol, type Square } from 'chess.js';
import type { PieceDropHandlerArgs } from 'react-chessboard';
import { getRelaxedPremoveTargets, simulatePremove } from '@/lib/chess/premove';

export interface Premove {
  sourceSquare: string;
  targetSquare: string;
  piece: PieceDropHandlerArgs['piece'];
}

export interface PremoveResult {
  move: ReturnType<Chess['move']>;
  premove: Premove;
}

function boardToPieces(chessGame: Chess): Record<string, string> {
  const board = chessGame.board();
  const pieces: Record<string, string> = {};
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const sq = `${String.fromCharCode(97 + f)}${8 - r}`;
      const piece = board[r][f];
      if (piece) {
        pieces[sq] = piece.color + piece.type;
      }
    }
  }
  return pieces;
}

function getCastlingRights(chessGame: Chess): string {
  const parts = chessGame.fen().split(' ');
  return parts.length >= 3 ? parts[2] : '-';
}

function buildPreviewPosition(pieces: Record<string, string>): Record<string, { pieceType: string }> {
  const pos: Record<string, { pieceType: string }> = {};
  for (const [sq, pt] of Object.entries(pieces)) {
    pos[sq] = { pieceType: pt };
  }
  return pos;
}

export function usePremove(chessGame: Chess, playerColor: 'w' | 'b') {
  const queueRef = useRef<Premove[]>([]);
  const [queue, setQueue] = useState<Premove[]>([]);

  const fen = chessGame.fen();

  const previewPosition = useMemo(() => {
    console.log('[Premove] computing preview | fen:', fen.slice(0, 30), '| queue:', queueRef.current.length);
    let pieces = boardToPieces(chessGame);
    let rights = getCastlingRights(chessGame);

    const q = queueRef.current;
    for (let i = 0; i < q.length; i++) {
      const p = q[i];
      const color = p.piece.pieceType[0] as 'w' | 'b';
      const isPawn = p.piece.pieceType[1] === 'p';
      const promotion = isPawn && (p.targetSquare[1] === '8' || p.targetSquare[1] === '1') ? 'q' : undefined;

      const result = simulatePremove(pieces, rights, p.sourceSquare, p.targetSquare, color, promotion);
      if (!result) {
        console.log('[Premove] preview chain broke at', i + 1, ':', p.sourceSquare, '->', p.targetSquare);
        break;
      }
      pieces = result.pieces;
      rights = result.castlingRights;
    }

    const pos = buildPreviewPosition(pieces);
    console.log('[Premove] preview pieces:', Object.keys(pos).length, '| e5:', pos['e5'], '| e4:', pos['e4'], '| d5:', pos['d5']);
    return pos;
  }, [fen, queue]); // eslint-disable-line react-hooks/exhaustive-deps

  const enqueue = useCallback((from: string, to: string, piece: Premove['piece']): boolean => {
    console.log('[Premove] enqueue:', from, '->', to, '| piece:', piece.pieceType);

    const previewPieces: Record<string, string> = {};
    for (const [sq, val] of Object.entries(previewPosition)) {
      if (val && typeof val === 'object' && 'pieceType' in val) {
        previewPieces[sq] = val.pieceType;
      }
    }
    const rights = getCastlingRights(chessGame);
    const allowed = getRelaxedPremoveTargets(previewPieces, from, rights);

    console.log('[Premove] source piece:', previewPieces[from], '| targets:', allowed.length, '| includes target:', allowed.includes(to));

    if (!allowed.includes(to)) {
      console.log('[Premove] REJECTED');
      return false;
    }

    const next: Premove = { sourceSquare: from, targetSquare: to, piece };
    queueRef.current = [...queueRef.current, next];
    setQueue([...queueRef.current]);
    console.log('[Premove] QUEUED | total:', queueRef.current.length, '| queue:', queueRef.current.map(p => p.sourceSquare + '->' + p.targetSquare).join(', '));
    return true;
  }, [previewPosition, chessGame]);

  const clear = useCallback(() => {
    console.log('[Premove] CLEAR | was:', queueRef.current.map(p => p.sourceSquare + '->' + p.targetSquare).join(', '));
    queueRef.current = [];
    setQueue([]);
  }, []);

  const executeOne = useCallback((): PremoveResult | null => {
    const q = queueRef.current;
    console.log('[Premove] executeOne | queue:', q.length, '| turn:', chessGame.turn(), '| player:', playerColor, '| gameOver:', chessGame.isGameOver());

    if (q.length === 0) return null;
    if (chessGame.turn() !== playerColor) return null;
    if (chessGame.isGameOver()) return null;

    const premove = q[0];
    const pieceType = premove.piece.pieceType[1];
    const promotion = pieceType === 'p' ? 'q' as PieceSymbol : undefined;

    console.log('[Premove] trying:', premove.sourceSquare, '->', premove.targetSquare, '| fen:', chessGame.fen().slice(0, 30));

    let moveResult;
    try {
      moveResult = chessGame.move({
        from: premove.sourceSquare as Square,
        to: premove.targetSquare as Square,
        promotion,
      });
    } catch (e) {
      console.log('[Premove] chess.js threw:', e);
      moveResult = null;
    }

    if (!moveResult) {
      console.log('[Premove] ILLEGAL - clearing entire queue');
      queueRef.current = [];
      setQueue([]);
      return null;
    }

    console.log('[Premove] SUCCESS:', moveResult.san, '| fen:', chessGame.fen().slice(0, 30));
    queueRef.current = q.slice(1);
    setQueue([...queueRef.current]);
    return { move: moveResult, premove };
  }, [chessGame, playerColor]);

  return {
    queue,
    previewPosition,
    enqueue,
    clear,
    executeOne,
  };
}
