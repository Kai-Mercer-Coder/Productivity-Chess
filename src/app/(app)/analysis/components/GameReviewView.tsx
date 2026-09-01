"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Chessboard } from "react-chessboard";
import { customPieces } from "@/components/chess/customPieces";
import { boardTheme } from "@/lib/chess/boardTheme";
import { getCoachMessage } from "@/lib/chess/coach";
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
        <span className="inline-flex items-center gap-2 text-white/30">
          <span className="w-2.5 h-2.5 border-[1.5px] border-white/10 border-t-white/40 rounded-full animate-spin" />
          <span className="text-[11px] tracking-wide">Analysing...</span>
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
                className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300/80 font-mono text-[11px] font-semibold"
              >
                {item.square}
              </span>
            );
          }
          if (item.type === "piece") {
            return (
              <span
                key={key}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300/80 font-mono text-[11px] font-semibold"
              >
                <span className="text-xs">
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
  loading,
  progress,
  total,
  analysisPass,
  completedMoves,
  coachEnabled = true,
}: {
  fen: string;
  report: Report | null;
  onReset: () => void;
  onNavigate: (index: number) => void;
  navIndex: number;
  moves: string[];
  loading: boolean;
  progress: number;
  total: number;
  analysisPass: number;
  completedMoves: number;
  coachEnabled?: boolean;
}) {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [localCoachMsg, setLocalCoachMsg] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const localNavRef = useRef(-1);

  useEffect(() => {
    if (report) setShowAnalysis(true);
  }, [report]);

  const currentClassification = useMemo(() => {
    if (!report) return null;
    const pos = report.positions[navIndex];
    return pos?.classification ?? null;
  }, [report, navIndex]);

  const correctMove = useMemo(() => {
    if (!report || navIndex < 0 || navIndex >= report.positions.length)
      return null;
    const lines = report.positions[navIndex]?.topLines;
    if (!lines || lines.length === 0) return null;
    const san = lines[0]?.moveSAN;
    return san || null;
  }, [report, navIndex]);

  useEffect(() => {
    if (!coachEnabled || !showAnalysis || !report || navIndex < 1) {
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
  }, [showAnalysis, report, navIndex]);

  const localCoachTokens = useMemo(() => {
    if (!localCoachMsg) return [];
    return [{ type: "text", text: localCoachMsg }];
  }, [localCoachMsg]);

  const annotationData = useMemo(() => {
    if (!report || navIndex < 1 || navIndex >= report.positions.length)
      return null;
    const pos = report.positions[navIndex];
    if (!pos?.move?.uci || !pos.classification) return null;
    const targetSquare = pos.move.uci.slice(2, 4);
    return { square: targetSquare, classification: pos.classification };
  }, [report, navIndex]);

  const squareRenderer = useCallback(
    ({ square, children }: { square: string; children?: React.ReactNode }) => {
      const isAnnotated = annotationData && annotationData.square === square;
      const classification = isAnnotated ? annotationData.classification : null;
      const config = classification ? classificationVisuals[classification] : null;
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
          {classification && (
            <img
              src={`/badges/${classification}.png`}
              alt={classification}
              style={{
                position: "absolute",
                top: "2%",
                right: "2%",
                width: "32px",
                height: "32px",
                zIndex: 2,
                pointerEvents: "none",
                userSelect: "none",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
              }}
            />
          )}
        </div>
      );
    },
    [annotationData],
  );

  const movePairsAll = useMemo(() => {
    const pairs: { num: number; white: string; black: string; whiteIdx: number; blackIdx: number }[] = [];
    for (let i = 0; i < moves.length; i += 2) {
      pairs.push({
        num: Math.floor(i / 2) + 1,
        white: moves[i] ?? "",
        black: moves[i + 1] ?? "",
        whiteIdx: i,
        blackIdx: i + 1,
      });
    }
    return pairs;
  }, [moves]);

  if (loading) {
    const depthLabel = analysisPass === 1 ? "Depth 13" : analysisPass === 2 ? "Depth 15" : "Depth 18";
    const dotsCount = total - 1;
    return (
      <div className="grid grid-cols-12 gap-6 items-start animate-in fade-in duration-300">
        <div
          className="col-span-1 h-[600px] rounded-2xl overflow-hidden flex flex-col relative backdrop-blur-sm"
          style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}
        >
          <div className="absolute top-3 left-0 w-full text-center z-10">
            <span className="text-[10px] font-semibold tracking-wider uppercase text-white/30 bg-white/[0.06] backdrop-blur-md px-2.5 py-1 rounded-full">
              {depthLabel}
            </span>
          </div>
          <div className="w-full bg-white/90 h-1/2 transition-all duration-700" />
          <div className="w-full bg-white/[0.03] flex-1" />
        </div>

        <div className="col-span-7 relative">
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black/20 backdrop-blur-sm border border-white/[0.06]">
            <Chessboard
              options={{
                id: "review-board",
                position: fen,
                pieces: customPieces,
                boardOrientation: "white",
                boardStyle: { borderRadius: "0" },
                darkSquareStyle: { backgroundColor: boardTheme.darkSquare },
                lightSquareStyle: { backgroundColor: boardTheme.lightSquare },
                allowDragging: false,
                showAnimations: true,
                animationDurationInMs: 300,
              }}
            />
          </div>

          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-0.5 p-1.5 rounded-full backdrop-blur-xl border border-white/[0.08]" style={{ background: "rgba(255,255,255,0.06)" }}>
            <button type="button" disabled className="p-3 rounded-full opacity-20">
              <span className="material-symbols-outlined text-white/60 text-xl">first_page</span>
            </button>
            <button type="button" disabled className="p-3 rounded-full opacity-20">
              <span className="material-symbols-outlined text-white/60 text-xl">chevron_left</span>
            </button>
            <div className="p-5 rounded-full animate-spin" style={{ background: "rgba(255,255,255,0.08)" }}>
              <span className="material-symbols-outlined text-white/30 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>hourglass_top</span>
            </div>
            <button type="button" disabled className="p-3 rounded-full opacity-20">
              <span className="material-symbols-outlined text-white/60 text-xl">chevron_right</span>
            </button>
            <button type="button" disabled className="p-3 rounded-full opacity-20">
              <span className="material-symbols-outlined text-white/60 text-xl">last_page</span>
            </button>
          </div>
        </div>

        <div className="col-span-4 flex flex-col gap-5 max-h-[680px]">
          <div className="rounded-2xl p-5 backdrop-blur-sm border border-white/[0.06]" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/20">Analysing</h3>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-medium text-emerald-400/60 tabular-nums">{progress}/{total}</span>
              </div>
            </div>
            {dotsCount > 0 && (
              <div className="flex items-center gap-[5px] flex-wrap">
                {Array.from({ length: dotsCount }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-[6px] h-[6px] rounded-full transition-all duration-300 ${
                      i < completedMoves - 1
                        ? "bg-emerald-400/80 scale-100"
                        : "bg-white/10 scale-75"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl flex flex-col flex-1 overflow-hidden backdrop-blur-sm border border-white/[0.06]" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}>
            <div className="px-4 py-3 flex justify-between items-center border-b border-white/[0.04]">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/20">Moves</span>
              <span className="text-[9px] font-medium text-white/10 bg-white/[0.03] px-2 py-0.5 rounded-md">PGN</span>
            </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
              {movePairsAll.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-white/10 p-8">
                  <span className="material-symbols-outlined text-2xl">touch_app</span>
                  <span className="text-[10px] tracking-wider">No moves</span>
                </div>
              ) : (
                movePairsAll.map((pair) => (
                  <div key={pair.num} className="grid grid-cols-12 items-center px-2 py-1.5 rounded-lg hover:bg-white/[0.03] transition-colors duration-200">
                    <div className="col-span-2 text-[9px] font-medium text-white/15 tabular-nums">{pair.num}</div>
                    <div className={`col-span-4 text-[13px] font-medium flex items-center gap-1.5 transition-colors duration-200 ${pair.whiteIdx < completedMoves - 1 ? "text-white/80" : "text-white/15"}`}>
                      {pair.white}
                      {pair.whiteIdx < completedMoves - 1 && (
                        <div className="w-[5px] h-[5px] rounded-full bg-emerald-400/70 shrink-0 transition-all duration-300" />
                      )}
                    </div>
                    <div className={`col-span-4 text-[13px] font-medium flex items-center gap-1.5 transition-colors duration-200 ${pair.blackIdx < completedMoves - 1 ? "text-white/50" : "text-white/10"}`}>
                      {pair.black || "-"}
                      {pair.black && pair.blackIdx < completedMoves - 1 && (
                        <div className="w-[5px] h-[5px] rounded-full bg-emerald-400/70 shrink-0 transition-all duration-300" />
                      )}
                    </div>
                    <div className="col-span-2" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const player = report
    ? {
        name: "White",
        acc: report.accuracies.white,
        classifications: report.classifications.white,
      }
    : null;

  const opponent = report
    ? {
        name: "Black",
        acc: report.accuracies.black,
        classifications: report.classifications.black,
      }
    : null;

  const classificationConfig = currentClassification
    ? classificationVisuals[currentClassification]
    : null;

  const classificationIcon = (classification?: string, size = 16) => {
    if (!classification) return null;
    const vis = classificationVisuals[classification];
    if (!vis) return null;
    return (
      <span
        className="inline-flex items-center justify-center rounded-full shrink-0"
        style={{ width: size, height: size, backgroundColor: vis.badgeBg, color: "#fff", fontSize: size * 0.55, fontWeight: 800 }}
      >
        {typeof vis.icon === "string" ? vis.icon : null}
      </span>
    );
  };

  const currentEval = useMemo(() => {
    if (!report || navIndex < 0 || navIndex >= report.positions.length) return null;
    const pos = report.positions[navIndex];
    const line = pos?.topLines[0];
    if (!line) return null;
    if (line.evaluation.type === "mate") {
      const m = line.evaluation.value;
      return { display: `#${m > 0 ? m : Math.abs(m)}`, whitePct: m > 0 ? 95 : 5 };
    }
    const cp = line.evaluation.value;
    const clamped = Math.max(-1000, Math.min(1000, cp * 100));
    return {
      display: cp > 0 ? `+${cp.toFixed(2)}` : cp.toFixed(2),
      whitePct: 50 + (clamped / 1000) * 45,
    };
  }, [report, navIndex]);

  const movePairs = useMemo(() => {
    const pairs: { num: number; white: string; black: string; whiteIdx: number; blackIdx: number; whiteClass?: string; blackClass?: string }[] = [];
    if (!report) return pairs;
    const positions = report.positions.slice(1);
    for (let i = 0; i < moves.length; i += 2) {
      const whitePos = positions[i];
      const blackPos = positions[i + 1];
      pairs.push({
        num: Math.floor(i / 2) + 1,
        white: moves[i] ?? "",
        black: moves[i + 1] ?? "",
        whiteIdx: i,
        blackIdx: i + 1,
        whiteClass: whitePos?.classification,
        blackClass: blackPos?.classification,
      });
    }
    return pairs;
  }, [report, moves]);

  return (
    <div className="grid grid-cols-12 gap-6 items-start animate-in fade-in duration-300">
      {/* Eval Bar */}
      <div
        className="col-span-1 h-[600px] rounded-2xl overflow-hidden flex flex-col relative backdrop-blur-sm"
        style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}
      >
        <AnimatePresence mode="wait">
          {currentEval && (
            <motion.div
              key={currentEval.display}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.15 }}
              className="absolute top-3 left-0 w-full text-center z-10"
            >
              <span className="text-[11px] font-semibold text-white/50 bg-white/[0.06] backdrop-blur-md px-2.5 py-1 rounded-full tabular-nums">
                {currentEval.display}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          className="w-full bg-white/90"
          animate={{ height: `${currentEval?.whitePct ?? 50}%` }}
          transition={{ type: "spring", stiffness: 40, damping: 15 }}
        />
        <div className="w-full bg-white/[0.03] flex-1" />
        <div className="absolute bottom-3 left-0 w-full text-center">
          <AnimatePresence mode="wait">
            {classificationConfig ? (
              <motion.div
                key={currentClassification}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-5 h-5 rounded-full mx-auto flex items-center justify-center text-[9px] font-black text-white/90"
                style={{ backgroundColor: classificationConfig.badgeBg }}
              >
                {classificationConfig.icon}
              </motion.div>
            ) : (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.1 }}
                exit={{ opacity: 0 }}
                className="material-symbols-outlined text-white text-base"
              >
                electric_bolt
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Board */}
      <div className="col-span-7 relative group">
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black/20 backdrop-blur-sm border border-white/[0.06]">
          <Chessboard
            options={{
              id: "review-board",
              position: fen,
              pieces: customPieces,
              boardOrientation: "white",
              boardStyle: { borderRadius: "0" },
              darkSquareStyle: { backgroundColor: boardTheme.darkSquare },
              lightSquareStyle: { backgroundColor: boardTheme.lightSquare },
              allowDragging: false,
              showAnimations: true,
              animationDurationInMs: 300,
              squareRenderer,
            }}
          />
        </div>

        {/* Nav Bar */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-0.5 p-1.5 rounded-full backdrop-blur-xl border border-white/[0.08]" style={{ background: "rgba(255,255,255,0.06)" }}>
          <button
            type="button"
            onClick={() => onNavigate(0)}
            disabled={navIndex <= 0}
            className="p-3 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-20 disabled:hover:scale-100"
          >
            <span className="material-symbols-outlined text-white/50 hover:text-white text-xl transition-colors">first_page</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate(navIndex - 1)}
            disabled={navIndex <= 0}
            className="p-3 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-20 disabled:hover:scale-100"
          >
            <span className="material-symbols-outlined text-white/50 hover:text-white text-xl transition-colors">chevron_left</span>
          </button>
          <button
            type="button"
            onClick={onReset}
            className="p-5 rounded-full bg-white/[0.9] text-black shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <span className="material-symbols-outlined font-bold text-2xl">close</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate(navIndex + 1)}
            disabled={navIndex >= moves.length}
            className="p-3 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-20 disabled:hover:scale-100"
          >
            <span className="material-symbols-outlined text-white/50 hover:text-white text-xl transition-colors">chevron_right</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate(moves.length)}
            disabled={navIndex >= moves.length}
            className="p-3 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-20 disabled:hover:scale-100"
          >
            <span className="material-symbols-outlined text-white/50 hover:text-white text-xl transition-colors">last_page</span>
          </button>
        </div>
      </div>

      {/* Right Panel */}
      <div className="col-span-4 flex flex-col gap-5 max-h-[680px]">
        <div className="rounded-2xl p-5 backdrop-blur-sm border border-white/[0.06]" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}>
          <AnimatePresence mode="wait">
            {currentClassification && (
              <motion.div
                key={currentClassification}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.04]"
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white shrink-0"
                  style={{ backgroundColor: classificationConfig?.badgeBg }}
                >
                  {classificationConfig?.icon}
                </div>
                <span className="text-[12px] font-semibold text-white/70 capitalize">
                  {currentClassification === "brilliant" ? "Mastermind" : currentClassification}
                </span>
                {correctMove && (
                  <span className="text-[11px] text-white/20 font-mono ml-auto">{correctMove}</span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {(localCoachMsg || localLoading) && (
              <motion.div
                key={localCoachMsg ?? "loading"}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="bg-white/[0.02] rounded-xl px-4 py-3 mt-3 border border-white/[0.04]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-amber-400/40">Coach</span>
                    <span className="text-[8px] text-white/10 font-mono">WASM</span>
                  </div>
                  <div className="text-[13px] text-white/50 leading-relaxed">
                    <CoachMessage items={localCoachTokens} loading={localLoading} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Move History */}
        <div className="rounded-2xl flex flex-col flex-1 min-h-0 overflow-hidden backdrop-blur-sm border border-white/[0.06]" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)" }}>
          <div className="px-4 py-3 flex justify-between items-center border-b border-white/[0.04]">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/20">Moves</span>
            <button
              type="button"
              onClick={() => setShowStats(true)}
              disabled={analysisPass !== 0}
              className="text-[9px] font-medium text-white/20 bg-white/[0.03] px-2.5 py-1 rounded-md hover:bg-white/[0.06] transition-colors duration-200 disabled:opacity-20 disabled:cursor-not-allowed"
            >
              Total
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
            {movePairs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-white/10 p-8">
                <span className="material-symbols-outlined text-2xl">touch_app</span>
                <span className="text-[10px] tracking-wider">No moves</span>
              </div>
            ) : (
              movePairs.map((pair) => {
                const isActive = navIndex === pair.whiteIdx + 1 || navIndex === pair.blackIdx + 1;
                return (
                  <div
                    key={pair.num}
                    className="grid grid-cols-12 items-center px-2 py-1.5 rounded-lg transition-colors duration-200"
                    style={{ background: isActive ? "rgba(255,255,255,0.04)" : "transparent" }}
                  >
                    <div className="col-span-2 text-[9px] font-medium text-white/15 tabular-nums">{pair.num}</div>
                    <button
                      type="button"
                      onClick={() => onNavigate(pair.whiteIdx + 1)}
                      className={`col-span-4 text-[13px] font-medium text-left flex items-center gap-1.5 transition-colors duration-150 ${navIndex === pair.whiteIdx + 1 ? "text-amber-400" : "text-white/60 hover:text-white/80"}`}
                    >
                      {pair.white}
                      <span className="shrink-0">{classificationIcon(pair.whiteClass, 12)}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => pair.black && onNavigate(pair.blackIdx + 1)}
                      className={`col-span-4 text-[13px] font-medium text-left flex items-center gap-1.5 transition-colors duration-150 ${navIndex === pair.blackIdx + 1 ? "text-amber-400" : "text-white/30 hover:text-white/50"}`}
                    >
                      {pair.black || "-"}
                      <span className="shrink-0">{classificationIcon(pair.blackClass, 12)}</span>
                    </button>
                    {navIndex === pair.whiteIdx + 1 || navIndex === pair.blackIdx + 1 ? (
                      <div className="col-span-2 flex justify-end">
                        <span className="material-symbols-outlined text-white/20 text-xs">arrow_forward_ios</span>
                      </div>
                    ) : <div className="col-span-2" />}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setShowStats(true)}
            disabled={analysisPass !== 0}
            className="py-3.5 rounded-xl flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed border border-white/[0.06] backdrop-blur-sm transition-all duration-200 hover:border-white/[0.1] hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "rgba(255,255,255,0.03)" }}
          >
            <span className="material-symbols-outlined text-sm text-white/30 group-hover:text-white/50 transition-colors">calculate</span>
            <span className="text-[11px] font-semibold text-white/30 group-hover:text-white/50 transition-colors">Total</span>
          </button>
          <button
            type="button"
            onClick={onReset}
            className="py-3.5 rounded-xl flex items-center justify-center gap-2 border border-primary/20 hover:border-primary/40 bg-primary/10 hover:bg-primary/15 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-sm text-primary/60" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
            <span className="text-[11px] font-semibold text-primary/60">New</span>
          </button>
        </div>
      </div>

      {/* Stats Overlay */}
      {showStats && report && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowStats(false)} />
          <div className="relative w-full max-w-md rounded-2xl p-6 backdrop-blur-xl border border-white/[0.08] animate-in zoom-in-95 duration-200" style={{ background: "linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(20,20,20,0.95) 100%)" }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-sm font-semibold text-white/70">Game Stats</h2>
              <button
                type="button"
                onClick={() => setShowStats(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <span className="material-symbols-outlined text-white/40 text-lg">close</span>
              </button>
            </div>

            {/* Accuracy */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="rounded-xl p-4 bg-white/[0.04] border border-white/[0.04]">
                <div className="text-[9px] font-medium text-white/20 uppercase tracking-wider mb-1">White</div>
                <div className={`text-2xl font-bold tabular-nums ${accuracyColor(report.accuracies.white)}`}>
                  {report.accuracies.white.toFixed(1)}%
                </div>
              </div>
              <div className="rounded-xl p-4 bg-white/[0.04] border border-white/[0.04]">
                <div className="text-[9px] font-medium text-white/20 uppercase tracking-wider mb-1">Black</div>
                <div className={`text-2xl font-bold tabular-nums ${accuracyColor(report.accuracies.black)}`}>
                  {report.accuracies.black.toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Classification Breakdown */}
            <div className="space-y-1.5">
              {reviewCategories.map((cat) => {
                const wCount = report.classifications.white[cat.key as keyof typeof report.classifications.white] ?? 0;
                const bCount = report.classifications.black[cat.key as keyof typeof report.classifications.black] ?? 0;
                const total = wCount + bCount;
                if (total === 0) return null;
                const vis = classificationVisuals[cat.key];
                return (
                  <div key={cat.key} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                    <div
                      className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold text-white shrink-0"
                      style={{ backgroundColor: vis?.badgeBg ?? "#666" }}
                    >
                      {vis?.icon}
                    </div>
                    <span className="text-[12px] font-medium text-white/60 flex-1">{cat.label}</span>
                    <span className="text-[11px] font-medium text-white/30 tabular-nums w-8 text-right">{wCount}</span>
                    <span className="text-[11px] font-medium text-white/30 tabular-nums w-8 text-right">{bCount}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameReviewView;
