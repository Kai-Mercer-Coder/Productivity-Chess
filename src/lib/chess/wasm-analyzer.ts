// WASM-based positional chess analyzer bridge.
// Loads the Rust engine (HCE + motif detection) from public/wasm/engine_rs_bg.wasm
// Only initializes on the client side.

type Motif = {
  id: string;
  phrase: string;
  priority: number;
};

type AnalysisResult = {
  san: string;
  fen_after: string;
  motifs: Motif[];
  terminal?: string;
};

type EvalSide = {
  material: number;
  psqt: number;
  mobility: number;
  pawns: number;
  king_safety: number;
  threats: number;
  imbalance: number;
};

type EvalResult = {
  phase: number;
  white: EvalSide;
  black: EvalSide;
  final_cp: number;
};

type PieceContribution = {
  square: string;
  color: "white" | "black";
  role: "pawn" | "knight" | "bishop" | "rook" | "queen";
  value_cp: number;
  material: number;
  psqt: number;
  mobility: number;
  pawns: number;
  king_safety: number;
  threats: number;
  imbalance: number;
};

type Explanation = Record<string, unknown>;

let ready = false;
let initPromise: Promise<boolean> | null = null;

async function loadWasm() {
  try {
    const mod = await import("./wasm-rs/engine_rs.js");
    const result = await mod.default("/wasm/engine_rs_bg.wasm");
    ready = true;
    return result;
  } catch (err) {
    console.error("[wasm-analyzer] init failed:", err);
    ready = false;
    return null;
  }
}

export function ensureReady() {
  if (ready) return Promise.resolve(true);
  if (!initPromise) {
    initPromise = loadWasm().then(() => true);
  }
  return initPromise;
}

export function isReady() {
  return ready;
}

export async function analyzeMove(
  fenBefore: string,
  moveUci: string
): Promise<AnalysisResult | null> {
  if (!ready) {
    await ensureReady();
    if (!ready) return null;
  }
  try {
    const mod = await import("./wasm-rs/engine_rs.js");
    const result = mod.analyze(fenBefore, moveUci);
    if (!result || result.error) return null;
    return result as AnalysisResult;
  } catch {
    return null;
  }
}

export async function evaluateFen(fen: string): Promise<EvalResult | null> {
  if (!ready) {
    await ensureReady();
    if (!ready) return null;
  }
  try {
    const mod = await import("./wasm-rs/engine_rs.js");
    const result = mod.evaluate_fen(fen);
    if (!result || result.error) return null;
    return result as EvalResult;
  } catch {
    return null;
  }
}

export async function explainPosition(
  fen: string
): Promise<Explanation | null> {
  if (!ready) {
    await ensureReady();
    if (!ready) return null;
  }
  try {
    const mod = await import("./wasm-rs/engine_rs.js");
    const result = mod.explain_position(fen);
    if (!result || result.error) return null;
    return result as Explanation;
  } catch {
    return null;
  }
}

export async function pieceContributions(
  fen: string
): Promise<PieceContribution[] | null> {
  if (!ready) {
    await ensureReady();
    if (!ready) return null;
  }
  try {
    const mod = await import("./wasm-rs/engine_rs.js");
    const result = mod.piece_contributions(fen);
    if (!Array.isArray(result)) return null;
    return result as PieceContribution[];
  } catch {
    return null;
  }
}

export async function pieceValueAt(
  fen: string,
  square: string
): Promise<PieceContribution | null> {
  if (!ready) {
    await ensureReady();
    if (!ready) return null;
  }
  try {
    const mod = await import("./wasm-rs/engine_rs.js");
    const result = mod.piece_value_at(fen, square);
    if (!result || result.error) return null;
    return result as PieceContribution;
  } catch {
    return null;
  }
}

// Auto-init on client side
if (typeof window !== "undefined") {
  ensureReady();
}

export type {
  Motif,
  AnalysisResult,
  EvalResult,
  EvalSide,
  PieceContribution,
  Explanation,
};
