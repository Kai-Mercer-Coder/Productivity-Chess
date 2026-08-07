// Barrel — sub-modules of the chess engine layer.
// LocalStockfishEvalEngine handles live analysis via WASM.
// fetchTablebase provides endgame tablebase lookups.
// StockfishEngine powers the /play bot via WASM.
export { LocalStockfishEvalEngine } from "./local-stockfish";
export { StockfishEngine } from "./stockfish";
export { fetchTablebase } from "./evaluators";
export type { HintData, LocalEvalResult } from "./types";
