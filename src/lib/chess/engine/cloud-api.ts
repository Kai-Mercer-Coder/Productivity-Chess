import type { ChessApiResponse } from "./types";
import { fetchTablebase, fetchChessDbEval } from "./evaluators";

export class ChessApiEvalEngine {
  private onEvalUpdate: (
    evaluation: number,
    fen: string,
    data: ChessApiResponse,
    mate?: number,
  ) => void;
  private abortController: AbortController | null = null;

  constructor(
    onEvalUpdate: (
      evaluation: number,
      fen: string,
      data: ChessApiResponse,
      mate?: number,
    ) => void,
  ) {
    this.onEvalUpdate = onEvalUpdate;
  }

  public async evaluatePosition(fen: string) {
    if (this.abortController) this.abortController.abort();
    this.abortController = new AbortController();

    const tb = await fetchTablebase(fen);
    if (tb) {
      this.onEvalUpdate(
        tb.eval,
        fen,
        {
          bestmove: tb.bestmove,
          san: "",
          text: "",
          eval: tb.eval,
          mate: tb.mate,
          continuationArr: [],
          winChance: tb.winChance,
        },
        tb.mate ?? undefined,
      );
      return;
    }

    const chessDb = await fetchChessDbEval(fen);
    if (chessDb) {
      this.onEvalUpdate(
        chessDb.eval,
        fen,
        {
          bestmove: chessDb.bestmove,
          san: "",
          text: "",
          eval: chessDb.eval,
          mate: chessDb.mate,
          continuationArr: chessDb.continuationArr,
          winChance: chessDb.winChance,
        },
        chessDb.mate ?? undefined,
      );
      return;
    }

    try {
      const response = await fetch("https://chess-api.com/v1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fen, depth: 18 }),
        signal: this.abortController.signal,
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data: ChessApiResponse = await response.json();

      if (data.eval !== undefined) {
        const mate = data.mate ?? undefined;
        this.onEvalUpdate(data.eval, fen, data, mate);
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") return;
      console.error("Chess API Error:", error);
    }
  }

  public terminate() {
    if (this.abortController) this.abortController.abort();
  }
}
