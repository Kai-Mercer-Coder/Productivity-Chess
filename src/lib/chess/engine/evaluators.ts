import type { ChessApiResponse } from "./types";

export async function fetchTablebase(fen: string): Promise<{
  eval: number;
  mate: number | null;
  bestmove: string;
  continuationArr: string[];
  winChance: number;
  category: string;
} | null> {
  try {
    const encoded = encodeURIComponent(fen);
    const response = await fetch(
      `https://tablebase.lichess.ovh/standard?fen=${encoded}`,
      {
        signal: AbortSignal.timeout(5000),
      },
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (!data) return null;

    if (
      data.category === "draw" ||
      data.stalemate ||
      data.insufficient_material
    ) {
      return {
        eval: 0,
        mate: null,
        bestmove: "",
        continuationArr: [],
        winChance: 50,
        category: "draw",
      };
    }

    if (data.checkmate) {
      const side = fen.includes(" w ") ? -1 : 1;
      return {
        eval: side * 100,
        mate: 0,
        bestmove: "",
        continuationArr: [],
        winChance: side > 0 ? 100 : 0,
        category: "checkmate",
      };
    }

    const bestMove =
      data.moves?.find((m: any) =>
        data.category === "win"
          ? m.category === "win" && m.dtm !== null
          : m.category === "loss" && m.dtm !== null,
      ) || data.moves?.[0];

    if (!bestMove || bestMove.dtm === null || bestMove.dtm === undefined)
      return null;

    const mateValue = data.category === "win" ? bestMove.dtm : -bestMove.dtm;
    const sign = data.category === "win" ? 1 : -1;

    return {
      eval: sign * 100,
      mate: mateValue,
      bestmove: bestMove.uci || "",
      continuationArr: [],
      winChance: data.category === "win" ? 100 : 0,
      category: data.category,
    };
  } catch {
    return null;
  }
}

export async function fetchChessDbEval(fen: string): Promise<{
  eval: number;
  mate: number | null;
  bestmove: string;
  continuationArr: string[];
  winChance: number;
} | null> {
  try {
    const encoded = encodeURIComponent(fen);
    const pvResponse = await fetch(
      `https://www.chessdb.cn/cdb.php?action=querypv&board=${encoded}`,
      {
        signal: AbortSignal.timeout(5000),
      },
    );

    if (pvResponse.ok) {
      const text = await pvResponse.text();
      if (text && !text.includes("unknown") && !text.includes("invalid")) {
        const scoreMatch = text.match(/score:(-?\d+)/);
        const pvMatch = text.match(/pv:(.+)/);
        const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 0;
        const pv = pvMatch ? pvMatch[1].split("|") : [];
        return {
          eval: score / 100,
          mate: null,
          bestmove: pv[0] || "",
          continuationArr: pv.slice(1),
          winChance: 50 + score / 200,
        };
      }
    }

    const scoreResponse = await fetch(
      `https://www.chessdb.cn/cdb.php?action=queryscore&board=${encoded}`,
      {
        signal: AbortSignal.timeout(3000),
      },
    );

    if (scoreResponse.ok) {
      const text = await scoreResponse.text();
      if (text && text.startsWith("eval:")) {
        const score = parseInt(text.replace("eval:", ""), 10);
        return {
          eval: score / 100,
          mate: null,
          bestmove: "",
          continuationArr: [],
          winChance: 50 + score / 200,
        };
      }
    }
  } catch { /* network failure, fall through */ }
  return null;
}

export async function tryLichessCloudEval(fen: string): Promise<{
  eval: number;
  mate: number | null;
  bestmove: string;
  san: string;
  continuationArr: string[];
  winChance: number;
} | null> {
  try {
    const encoded = encodeURIComponent(fen);
    const response = await fetch(
      `https://lichess.org/api/cloud-eval?fen=${encoded}`,
      {
        signal: AbortSignal.timeout(5000),
      },
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (!data || data.depth === 0 || !data.pvs?.length) return null;

    const pv = data.pvs[0];
    const cp = pv.cp ?? 0;
    const mate = pv.mate ?? null;
    const moves = pv.moves?.split(" ") ?? [];
    const bestmove = moves[0] ?? "";

    return {
      eval: mate !== null ? (mate > 0 ? 100 : -100) : cp / 100,
      mate,
      bestmove,
      san: "",
      continuationArr: moves.slice(1),
      winChance: 50 + cp / 200,
    };
  } catch {
    return null;
  }
}

export async function fetchChessApiEval(fen: string): Promise<{
  eval: number;
  mate: number | null;
  bestmove: string;
  san: string;
  continuationArr: string[];
  winChance: number;
} | null> {
  try {
    const response = await fetch("https://chess-api.com/v1", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fen, depth: 18 }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return null;

    const data: ChessApiResponse = await response.json();
    if (data.eval === undefined) return null;

    const mate = data.mate ?? null;
    return {
        eval: mate !== null ? (mate > 0 ? 100 : -100) : data.eval,
      mate,
      bestmove: data.bestmove || "",
      san: data.san || "",
      continuationArr: data.continuationArr || [],
      winChance: data.winChance ?? 50 + (data.eval * 100) / 200,
    };
  } catch {
    return null;
  }
}
