// Barrel re-export — keeps all existing `@/lib/chess/MoveEngine` imports working.
// The actual implementations live in `./engine/` (local-stockfish, evaluators, types).
export {
  LocalStockfishEvalEngine,
  StockfishEngine,
  fetchTablebase,
} from "./engine";

export type {
  HintData,
  LocalEvalResult,
} from "./engine/types";
