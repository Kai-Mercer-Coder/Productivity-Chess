"use client";

import { useState, useCallback, useRef } from "react";
import { Chess } from "chess.js";
import { analyse } from "@/lib/chess/analyse";
import { hfEvaluateFen, LocalStockfishEvalEngine, type LocalEvalResult } from "@/lib/chess/MoveEngine";
import type Report from "@/lib/types/Report";
import type { EvaluatedPosition } from "@/lib/types/Position";

import type { EvalResult } from "@/lib/chess/engine/types";
type EvalResponse = EvalResult;

interface UseGameReviewReturn {
  report: Report | null;
  loading: boolean;
  progress: number;
  total: number;
  deepLoading: boolean;
  runReview: (pgn: string) => Promise<void>;
  runDeepAnalysis: (pgn: string) => Promise<void>;
  reset: () => void;
}

export function useGameReview(): UseGameReviewReturn {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [deepLoading, setDeepLoading] = useState(false);
  const positionsRef = useRef<EvaluatedPosition[]>([]);

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
        const startEval = await evaluateFen(startGame.fen());
        const startEvalCp = Math.round(startEval.eval * 100);
        const startMate = startEval.mate;

        positions.push({
          fen: startGame.fen(),
          move: { san: "", uci: "" },
          topLines: [{
            id: 1, depth: 18,
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
          const evalData = await evaluateFen(currentFen);
          const evalCp = Math.round(evalData.eval * 100);

          positions.push({
            fen: currentFen,
            move: { san: allMoves[i].san, uci: allMoves[i].from + allMoves[i].to },
            topLines: [{
              id: 1, depth: 18,
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

      positionsRef.current = positions;
      const result = await analyse(positions);
      setReport(result);
    } catch (err) {
      console.error("Game review failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const runDeepAnalysis = useCallback(async (pgn: string) => {
    if (!pgn.trim() || deepLoading) return;
    setDeepLoading(true);

    const engine = new LocalStockfishEvalEngine();
    const updated = [...positionsRef.current];

    try {
      const game = new Chess();
      game.loadPgn(pgn.trim());
      const allMoves = game.history({ verbose: true });

      for (let i = 0; i < updated.length; i++) {
        const pos = updated[i];
        const localResult = await engine.evaluatePosition(pos.fen, 5000);

        if (localResult.depth > 0 && localResult.eval !== (pos.topLines[0]?.evaluation.value ?? 0) / 100) {
          const evalCp = Math.round(localResult.eval * 100);
          updated[i] = {
            ...pos,
            topLines: [{
              id: 1,
              depth: localResult.depth,
              evaluation: {
                type: localResult.mate !== null ? "mate" : "cp",
                value: localResult.mate ?? evalCp,
              },
              moveUCI: localResult.bestmove,
              moveSAN: "",
            }],
            worker: "local",
          };
        }
      }

      const updatedReport = await analyse(updated);
      positionsRef.current = updated;
      setReport(updatedReport);
    } catch (err) {
      console.error("Deep analysis failed:", err);
    } finally {
      engine.terminate();
      setDeepLoading(false);
    }
  }, [deepLoading]);

  const reset = useCallback(() => {
    setReport(null);
    setLoading(false);
    setProgress(0);
    setTotal(0);
    setDeepLoading(false);
    positionsRef.current = [];
  }, []);

  return { report, loading, progress, total, deepLoading, runReview, runDeepAnalysis, reset };
}

let sharedLocalEngine: LocalStockfishEvalEngine | null = null;

function getSharedEngine(): LocalStockfishEvalEngine {
  if (!sharedLocalEngine) {
    sharedLocalEngine = new LocalStockfishEvalEngine();
  }
  return sharedLocalEngine;
}

async function evaluateFen(fen: string): Promise<EvalResponse> {
  const cloudResult = await hfEvaluateFen(fen);
  if (cloudResult.eval !== 0 || cloudResult.bestmove) return cloudResult;

  const localEngine = getSharedEngine();
  const result = await localEngine.evaluatePosition(fen, 3000);
  const evalCp = Math.round(result.eval * 100);
  return {
    eval: result.eval,
    mate: result.mate,
    bestmove: result.bestmove,
    san: "",
    continuationArr: result.pv.slice(1),
    winChance: 50 + (evalCp / 200),
  };
}
