import { useMemo } from 'react';
import { Chess, type Square } from 'chess.js';

interface BoardStylesParams {
  chessGame: Chess;
  isUnderdefended: boolean;
  isOverdefended: boolean;
  showCheckHighlights: boolean;
  optionSquares: Record<string, React.CSSProperties>;
}

const PIECE_VALUES: Record<string, number> = {
  p: 1, n: 3, b: 3, r: 5, q: 9, k: 1000,
};

const FILES = 'abcdefgh';

const squareAt = (i: number, j: number): Square =>
  `${FILES[j]}${8 - i}` as Square;

const ALL_SQUARES = Array.from({ length: 8 }, (_, i) =>
  Array.from({ length: 8 }, (_, j) => squareAt(i, j))
).flat();

export const useBoardStyles = ({
  chessGame,
  isUnderdefended,
  isOverdefended,
  showCheckHighlights,
  optionSquares,
}: BoardStylesParams) => {
  const fen = chessGame.fen();

  return useMemo(() => {
    if (!isUnderdefended && !isOverdefended && !showCheckHighlights && Object.keys(optionSquares).length === 0) {
      return { styles: optionSquares, arrows: [] };
    }
    const boardMap = new Map<Square, ReturnType<typeof chessGame.get>>();
    for (const sq of ALL_SQUARES) {
      const piece = chessGame.get(sq);
      if (piece) boardMap.set(sq, piece);
    }

    const attackersMap = new Map<Square, { w: Square[]; b: Square[] }>();
    for (const sq of ALL_SQUARES) {
      attackersMap.set(sq, {
        w: chessGame.attackers(sq, 'w'),
        b: chessGame.attackers(sq, 'b'),
      });
    }

    // ── CHECKS ───────────────────────────────────────────────────
    const checkSquaresByPiece = new Map<Square, Set<Square>>();
    if (showCheckHighlights) {
      const turn = chessGame.turn();
      const clone = new Chess(fen);
      for (const [sq, piece] of boardMap.entries()) {
        if (!piece || piece.color !== turn) continue;
        const moves = chessGame.moves({ square: sq, verbose: true });
        const checks = new Set<Square>();
        for (const move of moves) {
          clone.load(fen);
          clone.move(move);
          if (clone.inCheck()) checks.add(move.to as Square);
        }
        if (checks.size) checkSquaresByPiece.set(sq, checks);
      }
    }

    // ── STYLES ───────────────────────────────────────────────────
    const styles: Record<string, React.CSSProperties> = { ...optionSquares };

    for (const [sq, piece] of boardMap.entries()) {
      if (!piece) continue;
      const myAttackers = attackersMap.get(sq)?.[piece.color] ?? [];
      const oppAttackers = attackersMap.get(sq)?.[piece.color === 'w' ? 'b' : 'w'] ?? [];
      const val = PIECE_VALUES[piece.type];
      let shadow: string | undefined;

      if (isUnderdefended && oppAttackers.length > myAttackers.length)
        shadow = 'inset 0 0 30px rgba(255,0,0,1)';
      if (isOverdefended && myAttackers.length > oppAttackers.length + 1) {
        const myVal = myAttackers.reduce((s, a) => s + (PIECE_VALUES[boardMap.get(a)?.type ?? ''] ?? 0), 0);
        const oppVal = oppAttackers.reduce((s, a) => s + (PIECE_VALUES[boardMap.get(a)?.type ?? ''] ?? 0), 0);
        const intensity = Math.min((myVal - oppVal) / val, 0.6);
        shadow = `inset 0 0 ${intensity * 40}px green`;
      }
      if (shadow) styles[sq] = { ...styles[sq], boxShadow: shadow };
    }

    for (const [, squares] of checkSquaresByPiece.entries())
      squares.forEach(sq => styles[sq] = { ...styles[sq], boxShadow: 'inset 0 0 0 7px red' });

    const arrows: { startSquare: string; endSquare: string; color: string }[] = [];

    return { styles, arrows };
  }, [
    fen, chessGame, isUnderdefended, isOverdefended,
    showCheckHighlights, optionSquares,
  ]);
};
