// Barrel — sub-modules of the chess engine layer. StockfishEngine (local) and
// ChessApiEvalEngine (cloud) share the EvalEngine interface. LocalStockfishEvalEngine
// handles live analysis. hfEvaluateFen is a one-shot HuggingFace endpoint call.
export { StockfishEngine } from "./stockfish";
export { ChessApiEvalEngine } from "./cloud-api";
export { hfEvaluateFen } from "./huggingface";
export { LocalStockfishEvalEngine } from "./local-stockfish";
export type { ChessApiResponse, LocalEvalResult } from "./types";
