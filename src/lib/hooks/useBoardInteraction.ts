'use client';

import { useState, useCallback, useMemo } from 'react';
import { Chess, type Square } from 'chess.js';
import type { PieceDropHandlerArgs } from 'react-chessboard';
import { playMoveSound } from '@/lib/chess/sounds';

interface BoardInteractionConfig {
  chessGame: Chess;
  onMove: (sourceSquare: string, targetSquare: string) => boolean;
  canSelectPiece?: (square: string) => boolean;
  enabled?: boolean;
}

interface BoardInteractionReturn {
  selectedSquare: string | null;
  legalMoveSquares: string[];
  squareStyles: Record<string, React.CSSProperties>;
  handleSquareClick: (args: { square: string }) => void;
  handlePieceDrop: (args: PieceDropHandlerArgs) => boolean;
  handlePieceDrag: (args: { square: string | null }) => void;
  clearSelection: () => void;
}

export function useBoardInteraction({
  chessGame,
  onMove,
  canSelectPiece,
  enabled = true,
}: BoardInteractionConfig): BoardInteractionReturn {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoveSquares, setLegalMoveSquares] = useState<string[]>([]);

  const clearSelection = useCallback(() => {
    setSelectedSquare(null);
    setLegalMoveSquares([]);
  }, []);

  const computeLegalMoves = useCallback(
    (square: string) => {
      try {
        return chessGame.moves({ square: square as Square, verbose: true }).map((m) => m.to);
      } catch {
        return [];
      }
    },
    [chessGame],
  );

  const handleSquareClick = useCallback(
    ({ square }: { square: string }) => {
      if (!enabled) return;

      if (square === selectedSquare) {
        clearSelection();
        return;
      }

      if (selectedSquare && legalMoveSquares.includes(square)) {
        onMove(selectedSquare, square);
        clearSelection();
        return;
      }

      const piece = chessGame.get(square as Square);
      if (piece && (canSelectPiece ? canSelectPiece(square) : piece.color === chessGame.turn())) {
        setSelectedSquare(square);
        setLegalMoveSquares(computeLegalMoves(square));
      } else {
        clearSelection();
      }
    },
    [enabled, selectedSquare, legalMoveSquares, chessGame, canSelectPiece, onMove, clearSelection, computeLegalMoves],
  );

  const handlePieceDrop = useCallback(
    (args: PieceDropHandlerArgs): boolean => {
      const { sourceSquare, targetSquare } = args;
      if (!targetSquare || sourceSquare === targetSquare) return false;
      clearSelection();
      let isCapture = false;
      let isCheck = false;
      let isGameOver = false;
      try {
        const vm = chessGame.moves({ square: sourceSquare as Square, verbose: true }).find(m => m.to === targetSquare);
        if (vm) {
          isCapture = vm.captured !== undefined;
          isCheck = vm.san.endsWith('+');
          isGameOver = vm.san.endsWith('#');
        }
      } catch {}
      playMoveSound({ isCapture, isCheck, isGameOver });
      return onMove(sourceSquare, targetSquare);
    },
    [onMove, clearSelection, chessGame],
  );

  const handlePieceDrag = useCallback(
    ({ square }: { square: string | null }) => {
      if (!enabled || !square) return;
      const piece = chessGame.get(square as Square);
      if (piece && (canSelectPiece ? canSelectPiece(square) : true)) {
        setSelectedSquare(square);
        setLegalMoveSquares(computeLegalMoves(square));
      }
    },
    [enabled, chessGame, canSelectPiece, computeLegalMoves],
  );

  const squareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    if (selectedSquare) {
      styles[selectedSquare] = { backgroundColor: 'rgba(255,255,0,0.25)' };
    }
    for (const sq of legalMoveSquares) {
      const piece = chessGame.get(sq as Square);
      if (piece) {
        styles[sq] = {
          background: 'radial-gradient(circle, transparent 0%, rgba(255,255,255,0.08) 100%)',
          boxShadow: 'inset 0 0 0 3px rgba(255,255,255,0.6)',
        };
      } else {
        styles[sq] = {
          background: 'radial-gradient(circle, rgba(255,255,255,0.4) 22%, transparent 22%)',
          borderRadius: '50%',
        };
      }
    }
    return styles;
  }, [selectedSquare, legalMoveSquares, chessGame]);

  return {
    selectedSquare,
    legalMoveSquares,
    squareStyles,
    handleSquareClick,
    handlePieceDrop,
    handlePieceDrag,
    clearSelection,
  };
}
