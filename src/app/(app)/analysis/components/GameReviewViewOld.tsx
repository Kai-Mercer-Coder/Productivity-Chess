// @ts-nocheck
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chessboard } from "react-chessboard";
import type { PieceDropHandlerArgs } from "react-chessboard";
import { customPieces } from "@/components/chess/customPieces";
import { boardTheme } from "@/lib/chess/boardTheme";
import { getCoachMessage } from "@/lib/chess/coach";
import { LocalStockfishEvalEngine } from "@/lib/chess/engine";
import { Chess } from "chess.js";
import type Report from "@/lib/types/Report";
import {
  accuracyColor,
  classificationVisuals,
  reviewCategories,
} from "./classificationVisuals";
import MoveHistory from "./MoveHistory";

const PIECE_UNICODE: Record<string, string> = {
  king: "\u265A",
  queen: "\u265B",
  rook: "\u265C",
  bishop: "\u265D",
  knight: "\u265E",
  pawn: "\u265F",
};

interface CoachToken {
  type: string;
  text: string;
  square?: string;
  role?: string;
}

function CoachMessage({
  items,
  loading,
}: {
  items: CoachToken[];
  loading: boolean;
}) {
  return (
    <span className="inline leading-relaxed">
      {loading ? (
        <span className="inline-flex items-center gap-2 text-neutral-500">
          <span className="w-3 h-3 border-2 border-neutral-500/30 border-t-neutral-500 rounded-full animate-spin" />
          Analysing...
        </span>
      ) : items.length === 0 ? null : (
        items.map((item, i) => {
          const key = `${item.type}-${i}`;
          if (item.type === "text") {
            return <span key={key}>{item.text}</span>;
          }
          if (item.type === "square") {
            return (
              <span
                key={key}
                className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-amber-500/15 text-amber-300 font-mono text-xs font-bold"
              >
                {item.square}
              </span>
            );
          }
          if (item.type === "piece") {
            return (
              <span
                key={key}
                className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-amber-500/15 text-amber-300 font-mono text-xs font-bold"
              >
                <span className="text-sm">
                  {item.role ? (PIECE_UNICODE[item.role] || "") : ""}
                </span>
                {item.square}
              </span>
            );
          }
          return null;
        })
      )}
    </span>
  );
}

function GameReviewView({
  fen,
  report,
  onReset,
  onNavigate,
  navIndex,
  moves,
  refining,
  progress,
  total,
}: {
  fen: string;
  report: Report | null;
  onReset: () => void;
  onNavigate: (index: number) => void;
  navIndex: number;
  moves: string[];
  refining: boolean;
  progress: number;
  total: number;
}) {
  const [showAccuracy, setShowAccuracy] = useState(false);
  const [localCoachMsg, setLocalCoachMsg] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const localNavRef = useRef(-1);
  const [playing, setPlaying] = useState(false);

  // Exploration mode
  const [exploring, setExploring] = useState(false);
  const [explorationFen, setExplorationFen] = useState<string | null>(null);
  const [explorationEval, setExplorationEval] = useState<{
    eval: number;
    mate: number | null;
    bestmove: string;
  } | null>(null);
  const [explorationEvalLoading, setExplorationEvalLoading] = useState(false);
  const explorationEngineRef = useRef<LocalStockfishEvalEngine | null>(null);
  const [originalNavIndex, setOriginalNavIndex] = useState(0);

  // Auto-play slideshow
  useEffect(() => {
    if (!playing) return;
    if (navIndex >= moves.length) { setPlaying(false); return; }
    const timer = setTimeout(() => {
      onNavigate(navIndex + 1);
    }, 800);
    return () => clearTimeout(timer);
  }, [playing, navIndex, moves.length, onNavigate]);

  // Exploration engine lifecycle
  useEffect(() => {
    const engine = new LocalStockfishEvalEngine();
    explorationEngineRef.current = engine;
    return () => { engine.terminate(); };
  }, []);

  const returnToGame = useCallback(() => {
    setExploring(false);
    setExplorationFen(null);
    setExplorationEval(null);
    onNavigate(originalNavIndex);
  }, [originalNavIndex, onNavigate]);

  const handleExplorationDrop = useCallback(
    (args: PieceDropHandlerArgs): boolean => {
      const { sourceSquare, targetSquare } = args;
      if (!targetSquare || sourceSquare === targetSquare) return false;

      const baseFen = exploring ? explorationFen! : fen;
      const chess = new Chess();
      try { chess.load(baseFen); } catch { return false; }

      try {
        const move = chess.move({ from: sourceSquare, to: targetSquare, promotion: "q" });
        if (!move) return false;

        const newFen = chess.fen();
        setExploring(true);
        setExplorationFen(newFen);
        if (!exploring) setOriginalNavIndex(navIndex);

        // Evaluate explored position
        const engine = explorationEngineRef.current;
        if (engine) {
          setExplorationEvalLoading(true);
          engine.evaluate(newFen, { timeMs: 2000 }).then((result) => {
            setExplorationEval({
              eval: result.evaluation.type === "cp" ? result.evaluation.value / 100 : result.evaluation.value > 0 ? 100 : -100,
              mate: result.evaluation.type === "mate" ? result.evaluation.value : null,
              bestmove: result.bestmove,
            });
            setExplorationEvalLoading(false);
          }).catch(() => setExplorationEvalLoading(false));
        }

        return true;
      } catch {
        return false;
      }
    },
    [exploring, explorationFen, fen, navIndex],
  );

  const currentPos = useMemo(() => {
    if (!report || navIndex < 0 || navIndex >= report.positions.length) return null;
    return report.positions[navIndex];
  }, [report, navIndex]);

  const currentEval = useMemo(() => {
    if (!currentPos) return null;
    const line = currentPos.topLines[0];
    if (!line) return null;
    const ev = line.evaluation;
    if (ev.type === "mate") {
      return ev.value > 0
        ? { display: `#${ev.value}`, whitePct: 95 }
        : { display: `#${Math.abs(ev.value)}`, whitePct: 5 };
    }
    const cp = ev.value;
    const clamped = Math.max(-1000, Math.min(1000, cp));
    return {
      display: ev.value > 0 ? `+${(ev.value / 100).toFixed(2)}` : (ev.value / 100).toFixed(2),
      whitePct: 50 + (clamped / 1000) * 45,
    };
  }, [currentPos]);

  const currentClassification = useMemo(() => {
    if (!currentPos) return null;
    return currentPos.classification ?? null;
  }, [currentPos]);

  const correctMove = useMemo(() => {
    if (!report || navIndex < 0 || navIndex >= report.positions.length) return null;
    const lines = report.positions[navIndex]?.topLines;
    if (!lines || lines.length === 0) return null;
    const san = lines[0]?.moveSAN;
    return san || null;
  }, [report, navIndex]);

  useEffect(() => {
    if (!report || navIndex < 1) {
      setLocalCoachMsg(null);
      return;
    }
    if (localNavRef.current === navIndex) return;
    localNavRef.current = navIndex;

    const pos = report.positions[navIndex];
    const prevPos = report.positions[navIndex - 1];
    const classification = pos?.classification ?? null;

    setLocalLoading(true);
    getCoachMessage(pos, prevPos, classification).then((msg) => {
      setLocalCoachMsg(msg);
      setLocalLoading(false);
    });
  }, [report, navIndex]);

  const localCoachTokens = useMemo(() => {
    if (!localCoachMsg) return [];
    return [{ type: "text", text: localCoachMsg }];
  }, [localCoachMsg]);

  const annotationData = useMemo(() => {
    if (!report || navIndex < 1 || navIndex >= report.positions.length) return null;
    const pos = report.positions[navIndex];
    if (!pos?.move?.uci || !pos.classification) return null;
    const targetSquare = pos.move.uci.slice(2, 4);
    return { square: targetSquare, classification: pos.classification };
  }, [report, navIndex]);

  const squareRenderer = useCallback(
    ({ square, children }: { square: string; children?: React.ReactNode }) => {
      const isAnnotated = annotationData && annotationData.square === square;
      const config = isAnnotated
        ? classificationVisuals[annotationData.classification]
        : null;
      return (
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            backgroundColor: config ? config.bg : undefined,
          }}
        >
          {children}
          {config && (
            <div
              style={{
                position: "absolute",
                top: "4%",
                right: "4%",
                zIndex: 2,
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                overflow: "hidden",
                boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
                pointerEvents: "none",
                userSelect: "none",
                animation: "badge-pop 0.3s ease-out both",
              }}
            >
              {"image" in config && config.image ? (
                <img
                  src={config.image}
                  alt={annotationData!.classification}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: config.badgeBg,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: 800,
                  }}
                >
                  {config.icon}
                </div>
              )}
            </div>
          )}
        </div>
      );
    },
    [annotationData],
  );

  const player = report
    ? {
        acc: report.accuracies.white,
        classifications: report.classifications.white,
      }
    : null;

  const opponent = report
    ? {
        acc: report.accuracies.black,
        classifications: report.classifications.black,
      }
    : null;

  const currentLines = currentPos?.topLines ?? [];

  return (
    <div className="grid grid-cols-12 gap-8 items-start">
      {/* Eval bar */}
      <div className="col-span-1 h-[600px] bg-surface-container-low rounded-xl overflow-hidden flex flex-col relative group">
        {currentEval && (
          <div className="absolute top-4 left-0 w-full text-center z-10">
            <span className="text-xs font-black text-surface-dim bg-white/90 px-2 py-0.5 rounded-full">
              {currentEval.display}
            </span>
          </div>
        )}
        <div
          className="w-full bg-white transition-all duration-700"
          style={{ height: `${currentEval?.whitePct ?? 50}%` }}
        />
        <div className="w-full bg-surface-container-highest flex-1" />
        <div className="absolute bottom-4 left-0 w-full text-center">
          <span className="material-symbols-outlined text-white/20 text-lg">
            electric_bolt
          </span>
        </div>
      </div>

      {/* Board */}
      <div className="col-span-7 relative group">
        {/* Return to game banner */}
        {exploring && (
          <div className="absolute -top-12 left-0 right-0 flex justify-center z-20">
            <button
              type="button"
              onClick={returnToGame}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-300 text-xs font-bold hover:bg-amber-500/30 transition-all shadow-lg"
            >
              <span className="material-symbols-outlined text-base">undo</span>
              Return to game
            </button>
          </div>
        )}

        <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-2xl bg-surface-container">
          <Chessboard
            options={{
              id: "review-board",
              position: exploring ? explorationFen! : fen,
              pieces: customPieces,
              boardOrientation: "white",
              boardStyle: { borderRadius: "0" },
              darkSquareStyle: { backgroundColor: boardTheme.darkSquare },
              lightSquareStyle: { backgroundColor: boardTheme.lightSquare },
              allowDragging: report !== null,
              showAnimations: true,
              animationDurationInMs: 300,
              squareRenderer,
              onPieceDrop: handleExplorationDrop,
            }}
          />
        </div>

        {/* Nav controls below board */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-surface-container/60 glass-panel rounded-full shadow-2xl border border-white/5">
          <button
            type="button"
            onClick={() => { setPlaying(false); onNavigate(0); }}
            disabled={navIndex <= 0}
            className="p-4 hover:bg-white/10 rounded-full transition-all duration-300 group disabled:opacity-30"
          >
            <span className="material-symbols-outlined text-white/60 group-hover:text-white">
              first_page
            </span>
          </button>
          <button
            type="button"
            onClick={() => { setPlaying(false); onNavigate(navIndex - 1); }}
            disabled={navIndex <= 0}
            className="p-4 hover:bg-white/10 rounded-full transition-all duration-300 group disabled:opacity-30"
          >
            <span className="material-symbols-outlined text-white/60 group-hover:text-white">
              chevron_left
            </span>
          </button>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            className="p-6 bg-primary text-surface-dim rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {playing ? "pause" : "play_arrow"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => { setPlaying(false); onNavigate(navIndex + 1); }}
            disabled={navIndex >= moves.length}
            className="p-4 hover:bg-white/10 rounded-full transition-all duration-300 group disabled:opacity-30"
          >
            <span className="material-symbols-outlined text-white/60 group-hover:text-white">
              chevron_right
            </span>
          </button>
          <button
            type="button"
            onClick={() => { setPlaying(false); onNavigate(moves.length); }}
            disabled={navIndex >= moves.length}
            className="p-4 hover:bg-white/10 rounded-full transition-all duration-300 group disabled:opacity-30"
          >
            <span className="material-symbols-outlined text-white/60 group-hover:text-white">
              last_page
            </span>
          </button>
        </div>
      </div>

      {/* Right panel: engine lines + move history + controls */}
      <div className="col-span-4 flex flex-col gap-6">
        {/* Engine lines panel */}
        <div className="bg-surface-container rounded-xl p-6 shadow-xl border-b-2 border-white/5">
          {/* Exploration eval overlay */}
          {exploring && (
            <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400/70">
                  Exploration
                </span>
                {explorationEvalLoading ? (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                ) : explorationEval ? (
                  <span className="text-sm font-black text-amber-300 tabular-nums">
                    {explorationEval.mate !== null
                      ? `#${Math.abs(explorationEval.mate)}`
                      : `${explorationEval.eval > 0 ? "+" : ""}${explorationEval.eval.toFixed(2)}`}
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                onClick={returnToGame}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-neutral-400 hover:text-white transition-all"
              >
                <span className="material-symbols-outlined text-sm">undo</span>
                Return to game
              </button>
            </div>
          )}

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary/40">
              Stockfish 18 NNUE
            </h3>
            <div className="flex gap-2">
              {refining ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-amber-500">
                    depth {currentPos?.topLines[0]?.depth ?? "..."}
                  </span>
                </>
              ) : currentPos ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-[10px] font-bold text-green-500">
                    depth {currentPos.topLines[0]?.depth ?? 0}
                  </span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-green-500">
                    {progress < total
                      ? `evaluating ${progress}/${total}`
                      : "LIVE"}
                  </span>
                </>
              )}
            </div>
          </div>

          {currentClassification && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Move
              </span>
              <span className="text-sm font-bold text-white capitalize">
                {currentClassification === "brilliant"
                  ? "Mastermind"
                  : currentClassification}
              </span>
            </div>
          )}

          {/* Best move card */}
          {correctMove && !exploring && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-600/10 border border-emerald-600/20 mb-3">
              <span className="material-symbols-outlined text-emerald-400 text-sm">star</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/70">
                Best
              </span>
              <span className="text-sm font-black text-emerald-300 font-mono ml-auto">
                {correctMove}
              </span>
            </div>
          )}

          <div className="space-y-1.5">
            {currentLines.length > 0 ? (
              currentLines.slice(0, 5).map((line, i) => {
                const ev = line.evaluation;
                const displayEval =
                  ev.type === "mate"
                    ? `#${ev.value > 0 ? ev.value : Math.abs(ev.value)}`
                    : `${ev.value > 0 ? "+" : ""}${(ev.value / 100).toFixed(2)}`;
                const pvMoves = [
                  line.moveSAN,
                  ...(line.continuation ?? []),
                ]
                  .slice(0, 5)
                  .join(" ");
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                      i === 0
                        ? "bg-primary/10 border border-primary/20"
                        : "bg-white/5"
                    }`}
                  >
                    <span className="w-4 text-[10px] font-bold text-on-surface-variant shrink-0">
                      {i + 1}
                    </span>
                    <span className="font-bold text-yellow-400 shrink-0 w-14 tabular-nums">
                      {displayEval}
                    </span>
                    <span className="text-white/80 font-mono truncate">
                      {pvMoves}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center py-4 text-on-surface-variant text-xs">
                <span className="material-symbols-outlined text-sm mr-1">
                  psychiatry
                </span>
                {progress < total
                  ? `Evaluating ${progress}/${total}...`
                  : "Evaluating..."}
              </div>
            )}
          </div>
        </div>

        {/* Move history */}
        <div className="bg-surface-container rounded-xl flex flex-col flex-1 shadow-xl overflow-hidden">
          <div className="flex-1 overflow-y-auto max-h-[400px]">
            <MoveHistory
              moves={moves}
              navIndex={navIndex}
              onNavigate={onNavigate}
              report={report}
              progress={progress}
            />
          </div>
        </div>

        {/* Coach + accuracy + new analysis */}
        <div className="flex flex-col gap-3">
          {(localCoachMsg || localLoading) && (
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400/70">
                  Coach
                </span>
                <span className="text-[9px] text-neutral-600 font-mono">
                  WASM
                </span>
              </div>
              <div className="text-sm text-neutral-300 leading-relaxed">
                <CoachMessage items={localCoachTokens} loading={localLoading} />
              </div>
            </div>
          )}

          {player && opponent && (
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setShowAccuracy(true)}
                className="py-4 bg-surface-container-high hover:bg-surface-container-highest text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg group-hover:rotate-12 transition-transform">
                  leaderboard
                </span>
                Total
              </button>
              <button
                type="button"
                onClick={onReset}
                className="py-4 bg-white/5 hover:bg-red-500/20 text-neutral-500 hover:text-red-400 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">close</span>
                New
              </button>
            </div>
          )}

          {!report && progress >= total && (
            <button
              type="button"
              onClick={onReset}
              className="py-4 bg-white/5 hover:bg-red-500/20 text-neutral-500 hover:text-red-400 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">close</span>
              New Analysis
            </button>
          )}
        </div>

        {/* Accuracy overlay */}
        {showAccuracy && player && opponent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="rounded-3xl border border-white/[0.06] bg-neutral-900 shadow-2xl flex flex-col w-full max-w-md max-h-[85vh] overflow-hidden">
              <div className="px-8 pt-8 pb-5">
                <div className="flex justify-between items-start">
                  <h2 className="text-base font-black tracking-tight text-white/90">
                    Review
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowAccuracy(false)}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-neutral-500">
                      close
                    </span>
                  </button>
                </div>
                <div className="flex gap-6 mt-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                      White
                    </span>
                    <span
                      className={`ml-2 text-sm font-bold ${accuracyColor(player.acc)}`}
                    >
                      {player.acc.toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                      Black
                    </span>
                    <span
                      className={`ml-2 text-sm font-bold ${accuracyColor(opponent.acc)}`}
                    >
                      {opponent.acc.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-8 pb-6 scrollbar-hide">
                <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/[0.04]">
                  <div className="flex-1 text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-600" />
                  <div className="w-12 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-600">
                    W
                  </div>
                  <div className="w-12 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-600">
                    B
                  </div>
                </div>

                <div className="space-y-1">
                  {reviewCategories.map((cat) => {
                    const pCount =
                      (player.classifications[
                        cat.key as keyof typeof player.classifications
                      ] as number) || 0;
                    const oCount =
                      (opponent.classifications[
                        cat.key as keyof typeof opponent.classifications
                      ] as number) || 0;
                    return (
                      <div
                        key={cat.key}
                        className="flex items-center gap-3 py-2.5 px-3 -mx-3 rounded-xl hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          {typeof cat.icon === "string" ? (
                            <span
                              className={`material-symbols-outlined text-[16px] ${cat.color} shrink-0`}
                            >
                              {cat.icon}
                            </span>
                          ) : (
                            <span
                              className={`${cat.color} shrink-0 flex items-center justify-center`}
                            >
                              {cat.icon}
                            </span>
                          )}
                          <span className="text-[12px] text-neutral-500 font-medium">
                            {cat.label}
                          </span>
                        </div>
                        <div
                          className={`w-12 text-center text-[14px] font-bold tabular-nums ${pCount > 0 ? cat.color : "text-neutral-700"}`}
                        >
                          {pCount}
                        </div>
                        <div
                          className={`w-12 text-center text-[14px] font-bold tabular-nums ${oCount > 0 ? cat.color : "text-neutral-700"}`}
                        >
                          {oCount}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAccuracy(false)}
                className="border-t border-white/[0.04] py-3.5 text-[13px] font-bold text-white/60 hover:text-white hover:bg-white/[0.02] transition-all"
              >
                Back to Analysis
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default GameReviewView;
