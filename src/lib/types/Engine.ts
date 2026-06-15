import type { Chess } from 'chess.js';

export interface Evaluation {
    type: "cp" | "mate",
    value: number
}

export interface EngineLine {
    id: number,
    depth: number,
    evaluation: Evaluation,
    moveUCI: string,
    moveSAN?: string,
    continuation?: string[]
}

export interface PromotionMove {
  sourceSquare: string;
  targetSquare: string;
}

export interface MoveEngine {
  getNextMove(chessGame: Chess): string | null | Promise<string | null>;
  terminate?(): void;
  setElo?(elo: number): void;
}

export interface AnalysisState {
  isOverdefended: boolean;
  isUnderdefended: boolean;
  showCheckHighlights: boolean;
}
