export interface ChessApiResponse {
  bestmove: string;
  san: string;
  text: string;
  eval: number;
  mate: number | null;
  continuationArr: string[];
  winChance: number;
  [key: string]: any;
}

export interface HFApiResponse {
  success?: boolean;
  best_move?: string;
  depth_reached?: number;
  score?: { type?: string; value?: number };
  [key: string]: any;
}

export interface LocalEvalResult {
    fen: string;
    eval: number;
    mate: number | null;
    bestmove: string;
    depth: number;
    pv: string[];
    multiPv: { eval: number; mate: number | null; pv: string[]; depth: number }[];
}

export type EvalResult = {
    eval: number;
    mate: number | null;
    bestmove: string;
    san: string;
    continuationArr: string[];
    winChance: number;
};
