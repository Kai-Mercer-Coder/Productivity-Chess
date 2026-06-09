"use client";

import { useState, useCallback, useMemo } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import type { PieceDropHandlerArgs } from "react-chessboard";
import { useChessGame } from "../../Base_Logic/Base_Functions/useChessGame";
import { useGameReview } from "../../Base_Logic/hooks/useGameReview";
import Sidebar from "@/app/Components/ui/Sidebar";
import MinSidebar from "@/app/Components/ui/MinSidebar";
import type Report from "@/lib/types/Report";
import { getCoachMessage } from "@/lib/coach";

type AnalysisMode = "pgn" | "fen" | "blank";
type ViewMode = "analysis" | "review";

const reviewCategories = [
  { key: "brilliant", label: "Brilliant", color: "text-emerald-400", icon: "auto_awesome" },
  { key: "great", label: "Great", color: "text-teal-400", icon: "star" },
  { key: "best", label: "Best", color: "text-green-400", icon: "check_circle" },
  { key: "excellent", label: "Excellent", color: "text-lime-400", icon: "thumb_up" },
  { key: "good", label: "Good", color: "text-blue-400", icon: "task_alt" },
  { key: "book", label: "Book", color: "text-purple-400", icon: "menu_book" },
  { key: "inaccuracy", label: "Inaccuracy", color: "text-amber-400", icon: "warning" },
  { key: "mistake", label: "Mistake", color: "text-orange-400", icon: "error" },
  { key: "blunder", label: "Blunder", color: "text-red-400", icon: "report" },
  { key: "forced", label: "Forced", color: "text-neutral-400", icon: "link" },
];

function accuracyColor(acc: number) {
  if (acc >= 90) return "text-emerald-400";
  if (acc >= 75) return "text-green-400";
  if (acc >= 60) return "text-yellow-400";
  if (acc >= 40) return "text-orange-400";
  return "text-red-400";
}

function MoveHistory({
  moves,
  navIndex,
  onNavigate,
}: {
  moves: string[];
  navIndex: number;
  onNavigate: (index: number) => void;
}) {
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

  return (
    <>
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-white/60">
          Notation
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onNavigate(0)}
            disabled={navIndex <= 0}
            className="p-1.5 text-neutral-500 hover:text-white transition-colors disabled:opacity-20"
          >
            <span className="material-symbols-outlined text-lg">first_page</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate(navIndex - 1)}
            disabled={navIndex <= 0}
            className="p-1.5 text-neutral-500 hover:text-white transition-colors disabled:opacity-20"
          >
            <span className="material-symbols-outlined text-lg">chevron_left</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate(navIndex + 1)}
            disabled={navIndex >= moves.length}
            className="p-1.5 text-neutral-500 hover:text-white transition-colors disabled:opacity-20"
          >
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate(moves.length)}
            disabled={navIndex >= moves.length}
            className="p-1.5 text-neutral-500 hover:text-white transition-colors disabled:opacity-20"
          >
            <span className="material-symbols-outlined text-lg">last_page</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-1 font-mono text-sm scrollbar-hide">
        {pairs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-neutral-700">
            <span className="material-symbols-outlined text-3xl">touch_app</span>
            <span className="text-[11px]">Make a move</span>
          </div>
        ) : (
          pairs.map((pair) => (
            <div key={pair.num} className="flex items-center gap-2">
              <span className="w-5 text-[11px] text-neutral-600 font-bold text-right shrink-0">
                {pair.num}.
              </span>
              <button
                type="button"
                onClick={() => onNavigate(pair.whiteIdx + 1)}
                className={`flex-1 text-left px-3 py-1.5 rounded-lg transition-all text-[13px] ${navIndex === pair.whiteIdx + 1
                  ? "bg-white/10 text-white font-semibold"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
              >
                {pair.white}
              </button>
              <button
                type="button"
                onClick={pair.black ? () => onNavigate(pair.blackIdx + 1) : undefined}
                className={`flex-1 text-left px-3 py-1.5 rounded-lg transition-all text-[13px] ${pair.black
                  ? navIndex === pair.blackIdx + 1
                    ? "bg-white/10 text-white font-semibold"
                    : "text-neutral-500 hover:bg-white/5 hover:text-white"
                  : "text-neutral-700"
                  }`}
              >
                {pair.black || "-"}
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}

function AnalysisView({
  moves,
  navIndex,
  onNavigate,
  onPieceDrop,
  onReset,
  orientation,
  onFlipBoard,
  onCopyFen,
  fen,
}: {
  moves: string[];
  navIndex: number;
  onNavigate: (index: number) => void;
  onPieceDrop: (args: PieceDropHandlerArgs) => boolean;
  onReset: () => void;
  orientation: "white" | "black";
  onFlipBoard: () => void;
  onCopyFen: () => void;
  fen: string;
}) {
  return (
    <section className="flex gap-8 pt-6 flex-col items-center justify-center w-full xl:flex-row xl:items-start">
      <div className="flex flex-col gap-3 shrink-0">
        <div className="relative p-[3px] bg-neutral-800 rounded-lg ring-1 ring-white/4">
          <div className="relative w-[580px] h-[580px] bg-neutral-900 rounded-md overflow-hidden">
            <Chessboard
              options={{
                id: "analysis-board",
                position: fen,
                onPieceDrop,
                boardOrientation: orientation,
                boardStyle: { borderRadius: "0.5rem" },
                darkSquareStyle: { backgroundColor: "#353535" },
                lightSquareStyle: { backgroundColor: "#ffffff" },
                animationDurationInMs: 400,
                allowDragging: true,
                showAnimations: true,
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onFlipBoard}
            className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] font-black uppercase tracking-widest text-neutral-400 hover:text-white transition-all active:scale-[0.99]"
          >
            <span className="material-symbols-outlined text-lg">flip</span>
            Flip Board
          </button>
          <button
            type="button"
            onClick={onCopyFen}
            className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] font-black uppercase tracking-widest text-neutral-400 hover:text-white transition-all active:scale-[0.99]"
          >
            <span className="material-symbols-outlined text-lg">content_copy</span>
            Copy FEN
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={onReset}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-red-500/20 text-neutral-500 hover:text-red-400 text-[11px] font-black uppercase tracking-widest transition-all active:scale-[0.99]"
          >
            <span className="material-symbols-outlined text-lg">close</span>
            New Analysis
          </button>
        </div>
      </div>

      <div className="w-full xl:w-[380px] shrink-0">
        <div className="rounded-3xl border border-white/5 shadow-xl glass overflow-hidden flex flex-col h-[640px]">
          <MoveHistory
            moves={moves}
            navIndex={navIndex}
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </section>
  );
}

const classificationVisuals: Record<string, { bg: string; badgeBg: string; icon: string }> = {
  brilliant: { bg: "rgba(52,211,153,0.18)", badgeBg: "#34d399", icon: "\u2605" },
  great: { bg: "rgba(20,184,166,0.18)", badgeBg: "#14b8a6", icon: "!" },
  best: { bg: "rgba(34,197,94,0.18)", badgeBg: "#22c55e", icon: "\u2713" },
  excellent: { bg: "rgba(132,204,22,0.18)", badgeBg: "#84cc16", icon: "\u25C9" },
  good: { bg: "rgba(59,130,246,0.18)", badgeBg: "#3b82f6", icon: "\u2022" },
  book: { bg: "rgba(168,85,247,0.18)", badgeBg: "#a855f7", icon: "\uD83D\uDCD6" },
  inaccuracy: { bg: "rgba(245,158,11,0.18)", badgeBg: "#f59e0b", icon: "!?" },
  mistake: { bg: "rgba(249,115,22,0.18)", badgeBg: "#f97316", icon: "?" },
  blunder: { bg: "rgba(239,68,68,0.18)", badgeBg: "#ef4444", icon: "\u2753" },
  forced: { bg: "rgba(163,163,163,0.18)", badgeBg: "#a3a3a3", icon: "\u2192" },
};

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
}) {
  const [showAnalysis, setShowAnalysis] = useState(false);

  const currentClassification = useMemo(() => {
    if (!report) return null;
    const pos = report.positions[navIndex];
    return pos?.classification ?? null;
  }, [report, navIndex]);

  const correctMove = useMemo(() => {
    if (!report || navIndex < 0 || navIndex >= report.positions.length) return null;
    const lines = report.positions[navIndex]?.topLines;
    if (!lines || lines.length === 0) return null;
    const san = lines[0]?.moveSAN;
    return san || null;
  }, [report, navIndex]);

  const coachMessage = useMemo(() => {
    if (!report || navIndex < 1) return null;
    return getCoachMessage(
      report.positions[navIndex] ?? null,
      report.positions[navIndex - 1] ?? null,
      currentClassification,
    );
  }, [report, navIndex, currentClassification]);

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
      const config = isAnnotated ? classificationVisuals[annotationData.classification] : null;
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
                top: "6%",
                right: "6%",
                zIndex: 2,
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                backgroundColor: config.badgeBg,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: 800,
                boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              {config.icon}
            </div>
          )}
        </div>
      );
    },
    [annotationData],
  );

  if (loading) {
    return (
      <section className="flex gap-8 pt-6 flex-col items-center justify-center w-full">
        <div className="flex flex-col items-center gap-4 py-20">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-sm text-neutral-400">Analysing game... {progress}/{total}</p>
        </div>
      </section>
    );
  }

  const player = report ? {
    name: "White",
    acc: report.accuracies.white,
    classifications: report.classifications.white,
  } : null;

  const opponent = report ? {
    name: "Black",
    acc: report.accuracies.black,
    classifications: report.classifications.black,
  } : null;

  return (
    <section className="flex gap-8 pt-6 flex-col items-center justify-center w-full xl:flex-row xl:items-start">
      <div className="flex flex-col gap-3 shrink-0 relative">
        {showAnalysis && (
          <div className="absolute inset-0 z-10 bg-black/40 rounded-lg pointer-events-none" />
        )}
        <div className="relative p-[3px] bg-neutral-800 rounded-lg ring-1 ring-white/4">
          <div className="relative w-[580px] h-[580px] bg-neutral-900 rounded-md overflow-hidden">
            <Chessboard
              options={{
                id: "review-board",
                position: fen,
                boardOrientation: "white",
                boardStyle: { borderRadius: "0.5rem" },
                darkSquareStyle: { backgroundColor: "#353535" },
                lightSquareStyle: { backgroundColor: "#ffffff" },
                allowDragging: false,
                showAnimations: true,
                animationDurationInMs: 300,
                squareRenderer,
              }}
            />
          </div>
        </div>

        {currentClassification && (
          <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-white/5 text-sm font-semibold">
            <span className="text-neutral-400">Move:</span>
            <span className="text-white capitalize">{currentClassification}</span>
          </div>
        )}

        <button
          type="button"
          onClick={onReset}
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-red-500/20 text-neutral-500 hover:text-red-400 text-[11px] font-black uppercase tracking-widest transition-all active:scale-[0.99]"
        >
          <span className="material-symbols-outlined text-lg">close</span>
          New Analysis
        </button>
      </div>

      <div className="w-full xl:w-[380px] shrink-0 flex flex-col gap-4">
        {!showAnalysis ? (
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.015] shadow-xl flex flex-col">
            {player && opponent ? (
              <>
                <div className="px-8 pt-8 pb-5">
                  <h2 className="text-base font-black tracking-tight text-white/90">Review</h2>
                  <div className="flex gap-6 mt-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">White</span>
                      <span className={`ml-2 text-sm font-bold ${accuracyColor(player.acc)}`}>
                        {player.acc.toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Black</span>
                      <span className={`ml-2 text-sm font-bold ${accuracyColor(opponent.acc)}`}>
                        {opponent.acc.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-8 pb-6 scrollbar-hide">
                  <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/[0.04]">
                    <div className="flex-1 text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-600" />
                    <div className="w-12 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-600">W</div>
                    <div className="w-12 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-600">B</div>
                  </div>

                  <div className="space-y-1">
                    {reviewCategories.map((cat) => {
                      const pCount = player.classifications[cat.key as keyof typeof player.classifications] as number || 0;
                      const oCount = opponent.classifications[cat.key as keyof typeof opponent.classifications] as number || 0;
                      return (
                        <div key={cat.key} className="flex items-center gap-3 py-2.5 px-3 -mx-3 rounded-xl hover:bg-white/[0.02] transition-colors">
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <span className={`material-symbols-outlined text-[16px] ${cat.color} shrink-0`}>{cat.icon}</span>
                            <span className="text-[12px] text-neutral-500 font-medium">{cat.label}</span>
                          </div>
                          <div className={`w-12 text-center text-[14px] font-bold tabular-nums ${pCount > 0 ? cat.color : "text-neutral-700"}`}>{pCount}</div>
                          <div className={`w-12 text-center text-[14px] font-bold tabular-nums ${oCount > 0 ? cat.color : "text-neutral-700"}`}>{oCount}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAnalysis(true)}
                  className="border-t border-white/[0.04] py-3.5 text-[13px] font-bold text-white/60 hover:text-white hover:bg-white/[0.02] transition-all"
                >
                  Analyse
                </button>
              </>
            ) : (
              <div className="px-8 py-12 text-center text-neutral-500 text-sm">No review data available</div>
            )}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.015] shadow-xl flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.04]">
              <button
                type="button"
                onClick={() => setShowAnalysis(false)}
                className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-white transition-colors mb-3"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                Back to Review
              </button>
              {correctMove && (
                <div className="bg-emerald-600/15 border border-emerald-600/25 rounded-xl px-4 py-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/70 mb-1">Best Move</div>
                  <div className="text-lg font-black text-emerald-300 font-mono">{correctMove}</div>
                </div>
              )}
              {coachMessage && (
                <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 mt-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-amber-400/70 mb-1">Coach</div>
                  <div className="text-sm text-neutral-300 leading-relaxed">{coachMessage}</div>
                </div>
              )}
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ maxHeight: "340px" }}>
              <MoveHistory
                moves={moves}
                navIndex={navIndex}
                onNavigate={onNavigate}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
function ModeSelector({
  mode,
  setMode,
  pgnInput,
  setPgnInput,
  fenInput,
  setFenInput,
  onLoadPgn,
  onLoadFen,
  onStartBlank,
  onLoadPgnReview,
}: {
  mode: AnalysisMode;
  setMode: (m: AnalysisMode) => void;
  pgnInput: string;
  setPgnInput: (v: string) => void;
  fenInput: string;
  setFenInput: (v: string) => void;
  onLoadPgn: () => void;
  onLoadFen: () => void;
  onStartBlank: () => void;
  onLoadPgnReview: () => void;
}) {
  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center relative">

      {/* Aesthetic Background: Spans the new max-w-4xl width */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
        {/* Vignette */}
        <div className="absolute inset-0  opacity-90" />
        {/* Subtle Grid */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">

        {/* Header */}
        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 shadow-xl mb-2">
            <span className="material-symbols-outlined text-3xl text-white/90">analytics</span>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white mb-1">New Analysis</h1>
            <p className="text-sm font-medium text-neutral-500 uppercase tracking-[0.2em]">Select format to begin</p>
          </div>
        </div>

        {/* Mode Cards */}
        <div className="grid grid-cols-3 gap-4 w-full mb-8">
          {/* PGN */}
          <button
            type="button"
            onClick={() => setMode("pgn")}
            className={`group flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border transition-all duration-300 h-32 ${mode === "pgn"
              ? "bg-white text-black border-white shadow-[0_0_25px_-5px_rgba(255,255,255,0.3)] scale-[1.02]"
              : "bg-[#1a1a1a] border-white/5 text-neutral-400 hover:bg-[#252525] hover:border-white/10 hover:text-white"
              }`}
          >
            <span className="material-symbols-outlined text-2xl">description</span>
            <span className="text-[11px] font-bold tracking-widest">PGN</span>
          </button>

          {/* FEN */}
          <button
            type="button"
            onClick={() => setMode("fen")}
            className={`group flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border transition-all duration-300 h-32 ${mode === "fen"
              ? "bg-white text-black border-white shadow-[0_0_25px_-5px_rgba(255,255,255,0.3)] scale-[1.02]"
              : "bg-[#1a1a1a] border-white/5 text-neutral-400 hover:bg-[#252525] hover:border-white/10 hover:text-white"
              }`}
          >
            <span className="material-symbols-outlined text-2xl">edit_note</span>
            <span className="text-[11px] font-bold tracking-widest">FEN</span>
          </button>

          {/* BLANK */}
          <button
            type="button"
            onClick={() => { setMode("blank"); onStartBlank(); }}
            className="group flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border border-white/5 bg-[#1a1a1a] text-neutral-400 hover:bg-[#252525] hover:border-white/10 hover:text-white transition-all duration-300 h-32"
          >
            <span className="material-symbols-outlined text-2xl">auto_mode</span>
            <span className="text-[11px] font-bold tracking-widest">BLANK</span>
          </button>
        </div>

        {/* Input Area */}
        <div className="w-full transition-all duration-300">

          {/* PGN Input */}
          {mode === "pgn" && (
            <div className="rounded-2xl bg-[#1a1a1a]/80 backdrop-blur-md border border-white/10 p-1 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
              <div className="bg-[#252525]/50 p-3 border-b border-white/5 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20"></div>
                </div>
                <span className="text-[10px] text-neutral-500 font-mono uppercase ml-2">notation.pgn</span>
              </div>
              <div className="p-4">
                <textarea
                  value={pgnInput}
                  onChange={(e) => setPgnInput(e.target.value)}
                  placeholder="1. e4 e5 2. Nf3 Nc6 ..."
                  rows={5}
                  className="w-full bg-transparent text-white/90 text-sm placeholder-neutral-600 resize-none focus:outline-none font-mono leading-relaxed"
                />
              </div>
              <div className="p-4 pt-0 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={onLoadPgn}
                  className="py-3 bg-white text-black text-xs font-bold rounded-xl hover:bg-neutral-200 transition-colors"
                >
                  Analysis Board
                </button>
                <button
                  type="button"
                  onClick={onLoadPgnReview}
                  className="py-3 bg-[#252525] text-white/80 border border-white/5 text-xs font-bold rounded-xl hover:bg-[#303030] hover:text-white transition-colors"
                >
                  Game Review
                </button>
              </div>
            </div>
          )}

          {/* FEN Input */}
          {mode === "fen" && (
            <div className="rounded-2xl bg-[#1a1a1a]/80 backdrop-blur-md border border-white/10 p-6 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
              <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-3 tracking-widest">FEN String</label>
              <input
                value={fenInput}
                onChange={(e) => setFenInput(e.target.value)}
                placeholder="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                className="w-full bg-[#252525] border border-white/5 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-white/20 font-mono rounded-xl py-3 px-4 transition-colors"
              />
              <button
                type="button"
                onClick={onLoadFen}
                className="w-full mt-4 py-3 bg-white text-black text-xs font-bold rounded-xl hover:bg-neutral-200 transition-colors"
              >
                Load Position
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
export default function AnalysisPage() {
  const game = useChessGame();
  const { report, loading, progress, total, runReview, reset: resetReview } = useGameReview();

  const [positionLoaded, setPositionLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("analysis");
  const [mode, setMode] = useState<AnalysisMode>("pgn");
  const [pgnInput, setPgnInput] = useState("");
  const [fenInput, setFenInput] = useState("");
  const [orientation, setOrientation] = useState<"white" | "black">("white");

  const [moves, setMoves] = useState<string[]>([]);
  const [navIndex, setNavIndex] = useState(0);
  const [startFen, setStartFen] = useState("");

  const navigateTo = useCallback(
    (targetIndex: number) => {
      if (targetIndex < 0 || targetIndex > moves.length) return;
      if (!startFen) return;
      const replayGame = new Chess();
      try {
        replayGame.load(startFen);
        for (const san of moves.slice(0, targetIndex)) {
          replayGame.move(san);
        }
        game.loadFen(replayGame.fen());
      } catch { }
      setNavIndex(targetIndex);
    },
    [moves, game, startFen],
  );

  const handlePieceDrop = useCallback(
    (args: PieceDropHandlerArgs): boolean => {
      const { sourceSquare, targetSquare } = args;
      if (!targetSquare || sourceSquare === targetSquare) return false;

      if (navIndex < moves.length) {
        setMoves((prev) => prev.slice(0, navIndex));
      }

      const result = game.makeMove(sourceSquare, targetSquare);
      if (result) {
        const allMoves = game.chessGame.history();
        const newSan = allMoves[allMoves.length - 1];
        setMoves((prev) => [...prev, newSan]);
        setNavIndex((prev) => prev + 1);
      }
      return result;
    },
    [game, moves, navIndex],
  );

  const loadFromPgn = useCallback(() => {
    if (!pgnInput.trim()) return;
    try {
      const p = new Chess();
      p.loadPgn(pgnInput.trim());
      const allMoves = p.history();
      const finalFen = p.fen();
      while (p.undo()) { }
      const initialFen = p.fen();
      game.loadFen(finalFen);
      setStartFen(initialFen);
      setMoves(allMoves);
      setNavIndex(allMoves.length);
      setPositionLoaded(true);
    } catch { }
  }, [pgnInput, game]);

  const loadFromFen = useCallback(() => {
    if (!fenInput.trim()) return;
    try {
      const fen = fenInput.trim();
      game.loadFen(fen);
      setStartFen(fen);
      setMoves([]);
      setNavIndex(0);
      setPositionLoaded(true);
    } catch { }
  }, [fenInput, game]);

  const loadBlank = useCallback(() => {
    const fen = new Chess().fen();
    game.loadFen(fen);
    setStartFen(fen);
    setMoves([]);
    setNavIndex(0);
    setPositionLoaded(true);
  }, [game]);

  const loadFromPgnReview = useCallback(() => {
    if (!pgnInput.trim()) return;
    try {
      const p = new Chess();
      p.loadPgn(pgnInput.trim());
      const allMoves = p.history();
      const finalFen = p.fen();
      while (p.undo()) { }
      const initialFen = p.fen();
      game.loadFen(finalFen);
      setStartFen(initialFen);
      setMoves(allMoves);
      setNavIndex(allMoves.length);
      setViewMode("review");
      setPositionLoaded(true);
      runReview(pgnInput.trim());
    } catch { }
  }, [pgnInput, game, runReview]);

  const reset = useCallback(() => {
    setPositionLoaded(false);
    setViewMode("analysis");
    setMode("pgn");
    setPgnInput("");
    setFenInput("");
    setMoves([]);
    setNavIndex(0);
    setStartFen("");
    resetReview();
  }, [resetReview]);

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased selection:bg-white selection:text-black relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-neutral-900 via-black to-black pointer-events-none" />

      <Sidebar />
      <MinSidebar />

      <main className="md:ml-[220px] lg:ml-[240px] xl:ml-[260px] min-h-screen p-4 lg:p-8 flex items-start justify-start">
        <div className={`w-full relative z-10 transition-all duration-500 ease-in-out ${!positionLoaded ? "max-w-4xl pt-8" : "max-w-[1600px]"
          }`}>
          {!positionLoaded ? (
            <ModeSelector
              mode={mode}
              setMode={setMode}
              pgnInput={pgnInput}
              setPgnInput={setPgnInput}
              fenInput={fenInput}
              setFenInput={setFenInput}
              onLoadPgn={loadFromPgn}
              onLoadFen={loadFromFen}
              onStartBlank={loadBlank}
              onLoadPgnReview={loadFromPgnReview}
            />
          ) : viewMode === "review" ? (
            <GameReviewView
              fen={game.position}
              report={report}
              onReset={reset}
              onNavigate={navigateTo}
              navIndex={navIndex}
              moves={moves}
              loading={loading}
              progress={progress}
              total={total}
            />
          ) : (
            <AnalysisView
              moves={moves}
              navIndex={navIndex}
              onNavigate={navigateTo}
              onPieceDrop={handlePieceDrop}
              onReset={reset}
              orientation={orientation}
              onFlipBoard={() => setOrientation((o) => (o === "white" ? "black" : "white"))}
              onCopyFen={() => {
                try {
                  navigator.clipboard.writeText(game.position);
                } catch { }
              }}
              fen={game.position}
            />
          )}
        </div>
      </main>
    </div>
  );
}
