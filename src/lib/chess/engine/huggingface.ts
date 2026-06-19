import type { ChessApiResponse, HFApiResponse, EvalResult } from "./types";
import {
  fetchTablebase,
  tryLichessCloudEval,
  fetchChessDbEval,
  fetchChessApiEval,
} from "./evaluators";

const HF_BASE = "https://clonicalcloner-aasopd-stockfish-depth-18.hf.space";
const HF_HEADERS = {
  Authorization: `Bearer ${process.env.HF_TOKEN}`,
  "Content-Type": "application/json",
};

export class HuggingFaceEvalEngine {
  private onEvalUpdate: (
    evaluation: number,
    fen: string,
    data: HFApiResponse,
    mate?: number,
  ) => void;
  private abortController: AbortController | null = null;

  constructor(
    onEvalUpdate: (
      evaluation: number,
      fen: string,
      data: HFApiResponse,
      mate?: number,
    ) => void,
  ) {
    this.onEvalUpdate = onEvalUpdate;
  }

  public async evaluatePosition(fen: string) {
    if (this.abortController) this.abortController.abort();
    this.abortController = new AbortController();

    try {
      const tb = await fetchTablebase(fen);
      if (tb) {
        this.onEvalUpdate(
          tb.eval,
          fen,
          {
            success: true,
            best_move: tb.bestmove,
            score: { type: "centipawns", value: Math.round(tb.eval * 100) },
          },
          tb.mate ?? undefined,
        );
        return;
      }

      const lichessEval = await tryLichessCloudEval(fen);
      if (lichessEval) {
        this.onEvalUpdate(
          lichessEval.eval,
          fen,
          {
            success: true,
            best_move: lichessEval.bestmove,
            score: {
              type: "centipawns",
              value: Math.round(lichessEval.eval * 100),
            },
          },
          lichessEval.mate ?? undefined,
        );
        return;
      }

      const chessDb = await fetchChessDbEval(fen);
      if (chessDb) {
        this.onEvalUpdate(
          chessDb.eval,
          fen,
          {
            success: true,
            best_move: chessDb.bestmove,
            score: {
              type: "centipawns",
              value: Math.round(chessDb.eval * 100),
            },
          },
          chessDb.mate ?? undefined,
        );
        return;
      }

      if (Math.random() < 0.4) {
        const response = await fetch(`${HF_BASE}/evaluate`, {
          method: "POST",
          headers: HF_HEADERS,
          body: JSON.stringify({ fen, depth: 18 }),
          signal: this.abortController.signal,
        });

        if (!response.ok) throw new Error(`HF API error: ${response.status}`);

        const data: HFApiResponse = await response.json();
        const cp = data.score?.value ?? 0;
        this.onEvalUpdate(cp / 100, fen, data, undefined);
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") return;
      console.error("HuggingFace API Error:", error);
    }
  }

  public terminate() {
    if (this.abortController) this.abortController.abort();
  }
}

export async function hfEvaluateFen(fen: string): Promise<EvalResult> {
  const tablebase = await fetchTablebase(fen);
  if (tablebase) {
    return {
      eval: tablebase.eval,
      mate: tablebase.mate,
      bestmove: tablebase.bestmove,
      san: "",
      continuationArr: [],
      winChance: tablebase.winChance,
    };
  }

  type EvalSource = (EvalResult & { _source: string }) | null;
  const sources: Promise<EvalSource>[] = [
    tryLichessCloudEval(fen).then((r) =>
      r ? { ...r, _source: "lichess" } : null,
    ),
    fetchChessDbEval(fen).then((r) =>
      r ? { ...r, san: "", _source: "chessdb" } : null,
    ),
    fetchChessApiEval(fen).then((r) =>
      r ? { ...r, _source: "chessapi" } : null,
    ),
  ];

  if (Math.random() < 0.4) {
    sources.push(
      (async (): Promise<EvalSource> => {
        try {
          const response = await fetch(`${HF_BASE}/evaluate`, {
            method: "POST",
            headers: HF_HEADERS,
            body: JSON.stringify({ fen, depth: 18 }),
            signal: AbortSignal.timeout(8000),
          });
          if (!response.ok) return null;
          const data = await response.json();
          const cp = data.score?.value ?? 0;
          return cp !== 0
            ? {
                eval: cp / 100,
                mate: null,
                bestmove: data.best_move ?? "",
                san: "",
                continuationArr: [],
                winChance: 50 + cp / 200,
                _source: "hf",
              }
            : null;
        } catch {
          return null;
        }
      })(),
    );
  }

  const settled = await Promise.allSettled(sources);
  for (const s of settled) {
    if (s.status === "fulfilled" && s.value) {
      const { _source: _, ...result } = s.value;
      return result;
    }
  }

  return {
    eval: 0,
    mate: null,
    bestmove: "",
    san: "",
    continuationArr: [],
    winChance: 50,
  };
}
