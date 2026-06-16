export interface EndgameLine {
  id: string;
  name: string;
  group: string;
  fen: string;
  orientation: 'white' | 'black';
  description?: string;
  moves: { san: string; hint: string | null }[];
  maxMoves?: number;
}

import rookKingLines from './rook-king';
import queenKingLines from './queen-king';
import pawnKingLines from './pawn-king';

export const endgameLines: EndgameLine[] = [
  ...rookKingLines,
  ...queenKingLines,
  ...pawnKingLines,
];
