// Barrel re-export — keeps all existing `@/lib/chess/MoveEngine` imports working.
// The actual implementations live in `./engine/` (local-stockfish, cloud-api, evaluators, types).
export {
  LocalStockfishEvalEngine,
  StockfishEngine,
  ChessApiEvalEngine,
  fetchTablebase,
} from "./engine";

export type {
  ChessApiResponse,
  LocalEvalResult,
} from "./engine/types";
