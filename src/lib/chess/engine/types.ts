export interface HintData {
  bestmove: string;
  san: string;
  text: string;
  eval: number;
  mate: number | null;
  continuationArr: string[];
  winChance: number;
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
