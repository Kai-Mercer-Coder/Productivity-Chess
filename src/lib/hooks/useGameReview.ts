"use client";

import { useState, useCallback } from "react";
import { Chess } from "chess.js";
import { analyse } from "@/lib/chess/analyse";
import type Report from "@/lib/types/Report";
import type { EvaluatedPosition } from "@/lib/types/Position";
import type { EngineLine } from "@/lib/types/Engine";

interface EvalResponse {
  eval: number;
  mate: number | null;
  bestmove: string;
  san: string;
  continuationArr: string[];
  winChance: number;
}

interface UseGameReviewReturn {
  report: Report | null;
  loading: boolean;
  progress: number;
  total: number;
  runReview: (pgn: string) => Promise<void>;
  reset: () => void;
}

export function useGameReview(): UseGameReviewReturn {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);

  const runReview = useCallback(async (pgn: string) => {
    if (!pgn.trim()) return;
    setLoading(true);
    setReport(null);

    try {
      const game = new Chess();
      game.loadPgn(pgn.trim());
      const allMoves = game.history({ verbose: true });
      if (allMoves.length === 0) return;

      setTotal(allMoves.length + 1);

      const positions: EvaluatedPosition[] = [];

      const startGame = new Chess();
      try {
        const startEval = await evaluateFen(startGame.fen(), 0);
        const startEvalCp = Math.round(startEval.eval * 100);
        const startMate = startEval.mate;

        positions.push({
          fen: startGame.fen(),
          move: { san: "", uci: "" },
          topLines: [{
            id: 1, depth: 17,
            evaluation: { type: startMate !== null ? "mate" : "cp", value: startMate ?? startEvalCp },
            moveUCI: startEval.bestmove, moveSAN: startEval.san
          }],
          cutoffEvaluation: undefined,
          classification: undefined,
          worker: "cloud"
        });
      } catch (err) {
        console.warn("Failed to evaluate starting position:", err);
        positions.push({
          fen: startGame.fen(),
          move: { san: "", uci: "" },
          topLines: [{
            id: 1, depth: 0,
            evaluation: { type: "cp", value: 0 },
            moveUCI: "", moveSAN: ""
          }],
          classification: undefined,
          worker: "local"
        });
      }

      setProgress(1);

      const replay = new Chess();
      for (let i = 0; i < allMoves.length; i++) {
        replay.move(allMoves[i]);
        const currentFen = replay.fen();

        try {
          const evalData = await evaluateFen(currentFen, i + 1);
          const evalCp = Math.round(evalData.eval * 100);

          positions.push({
            fen: currentFen,
            move: { san: allMoves[i].san, uci: allMoves[i].from + allMoves[i].to },
            topLines: [{
              id: 1, depth: 17,
              evaluation: { type: evalData.mate !== null ? "mate" : "cp", value: evalData.mate ?? evalCp },
              moveUCI: evalData.bestmove, moveSAN: evalData.san,
              continuation: evalData.continuationArr || []
            }],
            classification: undefined,
            worker: "cloud"
          });
        } catch (err) {
          console.warn(`Failed to evaluate position ${i + 1}:`, err);
          positions.push({
            fen: currentFen,
            move: { san: allMoves[i].san, uci: allMoves[i].from + allMoves[i].to },
            topLines: [{
              id: 1, depth: 0,
              evaluation: { type: "cp", value: 0 },
              moveUCI: "", moveSAN: ""
            }],
            classification: undefined,
            worker: "local"
          });
        }

        setProgress(i + 2);
      }

      const result = await analyse(positions);
      setReport(result);
    } catch (err) {
      console.error("Game review failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setReport(null);
    setLoading(false);
    setProgress(0);
    setTotal(0);
  }, []);

  return { report, loading, progress, total, runReview, reset };
}

async function evaluateFen(fen: string, index: number): Promise<EvalResponse> {
  const response = await fetch("https://chess-api.com/v1", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fen, depth: 17 }),
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);

  const data = await response.json();
  return {
    eval: typeof data.eval === "number" ? data.eval : parseFloat(data.eval || "0"),
    mate: data.mate ?? null,
    bestmove: data.bestmove || "",
    san: data.san || "",
    continuationArr: data.continuationArr || [],
    winChance: data.winChance ?? 50,
  };
}
