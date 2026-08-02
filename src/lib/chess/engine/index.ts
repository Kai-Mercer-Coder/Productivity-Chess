// Barrel — sub-modules of the chess engine layer.
// LocalStockfishEvalEngine handles live analysis via WASM.
// fetchTablebase provides endgame tablebase lookups.
// StockfishEngine and ChessApiEvalEngine kept for backward compatibility.
export { LocalStockfishEvalEngine } from "./local-stockfish";
export { StockfishEngine } from "./stockfish";
export { ChessApiEvalEngine } from "./cloud-api";
export { fetchTablebase } from "./evaluators";
export type { ChessApiResponse, LocalEvalResult } from "./types";
