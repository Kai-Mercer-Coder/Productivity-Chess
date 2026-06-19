// Barrel re-export — keeps all existing `@/lib/chess/MoveEngine` imports working.
// The actual implementations live in `./engine/` (stockfish, cloud-api, huggingface, local-stockfish, types).
export {
  StockfishEngine,
  ChessApiEvalEngine,
  LocalStockfishEvalEngine,
  hfEvaluateFen,
} from "./engine";

export type {
  ChessApiResponse,
  LocalEvalResult,
} from "./engine/types";
