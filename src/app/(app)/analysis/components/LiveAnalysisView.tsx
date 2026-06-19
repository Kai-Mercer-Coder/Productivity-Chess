"use client";

// Live analysis board: chessboard + eval bar (bargraph) + Stockfish multi-PV lines
// + move-history table + export/review buttons.
// All data flows in via props (stateless); parent (analysis/page.tsx) owns the engine
// lifecycle and live evaluation state. Arrows drawn from engineResult.pv.
import { useMemo } from "react";
import { Chessboard } from "react-chessboard";
import type { PieceDropHandlerArgs } from "react-chessboard";
import { customPieces } from "@/components/chess/customPieces";
import { boardTheme } from "@/lib/chess/boardTheme";
import type { LocalEvalResult } from "@/lib/chess/MoveEngine";
import { classificationVisuals } from "./classificationVisuals";

interface MovePair {
  num: number; white: string; black: string;
  whiteIdx: number; blackIdx: number;
  whiteClass?: string; blackClass?: string;
}

interface Interaction {
  handlePieceDrop: (args: PieceDropHandlerArgs) => boolean;
  handleSquareClick: (args: { square: string }) => void;
  squareStyles: Record<string, React.CSSProperties>;
}

export function LiveAnalysisView({
  fen,
  engineResult,
  multiPvCount,
  showArrows,
  moves,
  navIndex,
  deepLoading,
  onShowArrowsChange,
  onMultiPvCountChange,
  onNavigate,
  onLoadPgnReview,
  onExport,
  onReset,
  onDeepAnalysis,
  interaction,
}: {
  fen: string;
  engineResult: LocalEvalResult | null;
  multiPvCount: number;
  showArrows: boolean;
  moves: string[];
  navIndex: number;
  deepLoading: boolean;
  onShowArrowsChange: (show: boolean) => void;
  onMultiPvCountChange: (count: number) => void;
  onNavigate: (index: number) => void;
  onLoadPgnReview: () => void;
  onExport: () => void;
  onReset: () => void;
  onDeepAnalysis: () => void;
  interaction: Interaction;
}) {
  const currentEval = useMemo(() => {
    if (!engineResult) return null;
    if (engineResult.mate !== null) {
      return engineResult.mate > 0
        ? { display: `#${engineResult.mate}`, whitePct: 95 }
        : { display: `#${Math.abs(engineResult.mate)}`, whitePct: 5 };
    }
    const cp = engineResult.eval * 100;
    const clamped = Math.max(-1000, Math.min(1000, cp));
    return {
      display: engineResult.eval > 0 ? `+${engineResult.eval.toFixed(2)}` : engineResult.eval.toFixed(2),
      whitePct: 50 + (clamped / 1000) * 45,
    };
  }, [engineResult]);

  const movePairs: MovePair[] = useMemo(() => {
    const pairs: MovePair[] = [];
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

  const arrows = useMemo(() => {
    if (!showArrows || !engineResult || !engineResult.pv.length) return [];
    const result: { startSquare: string; endSquare: string; color: string }[] = [];
    const firstMove = engineResult.pv[0];
    if (firstMove && firstMove.length >= 4) {
      result.push({ startSquare: firstMove.substring(0, 2), endSquare: firstMove.substring(2, 4), color: "#a3e635" });
    }
    if (multiPvCount > 1) {
      for (let i = 1; i < engineResult.multiPv.length; i++) {
        const line = engineResult.multiPv[i];
        if (!line.pv.length) continue;
        const m = line.pv[0];
        if (m && m.length >= 4) {
          result.push({ startSquare: m.substring(0, 2), endSquare: m.substring(2, 4), color: "#facc15" });
        }
      }
    }
    return result;
  }, [engineResult, showArrows, multiPvCount]);

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

  return (
    <div className="grid grid-cols-12 gap-8 items-start">
      <div className="col-span-1 h-[600px] bg-surface-container-low rounded-xl overflow-hidden flex flex-col relative group">
        {currentEval && (
          <div className="absolute top-4 left-0 w-full text-center z-10">
            <span className="text-xs font-black text-surface-dim bg-white/90 px-2 py-0.5 rounded-full">
              {currentEval.display}
            </span>
          </div>
        )}
        <div className="w-full bg-white transition-all duration-700" style={{ height: `${currentEval?.whitePct ?? 50}%` }} />
        <div className="w-full bg-surface-container-highest flex-1" />
        <div className="absolute bottom-4 left-0 w-full text-center">
          <span className="material-symbols-outlined text-white/20 text-lg">electric_bolt</span>
        </div>
      </div>

      <div className="col-span-7 relative group">
        <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-2xl bg-surface-container">
          <Chessboard
            options={{
              id: "analysis-board",
              position: fen,
              pieces: customPieces,
              onPieceDrop: interaction.handlePieceDrop,
              onSquareClick: interaction.handleSquareClick,
              squareStyles: interaction.squareStyles,
              arrows,
              boardOrientation: "white",
              boardStyle: { borderRadius: "0" },
              darkSquareStyle: { backgroundColor: boardTheme.darkSquare },
              lightSquareStyle: { backgroundColor: boardTheme.lightSquare },
              animationDurationInMs: 400,
              allowDragging: true,
              showAnimations: true,
            }}
          />
        </div>

        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-surface-container/60 glass-panel rounded-full shadow-2xl border border-white/5">
          <button type="button" onClick={() => onNavigate(0)} disabled={navIndex <= 0} className="p-4 hover:bg-white/10 rounded-full transition-all duration-300 group disabled:opacity-30">
            <span className="material-symbols-outlined text-white/60 group-hover:text-white">first_page</span>
          </button>
          <button type="button" onClick={() => onNavigate(navIndex - 1)} disabled={navIndex <= 0} className="p-4 hover:bg-white/10 rounded-full transition-all duration-300 group disabled:opacity-30">
            <span className="material-symbols-outlined text-white/60 group-hover:text-white">chevron_left</span>
          </button>
          <button type="button" className="p-6 bg-primary text-surface-dim rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
          </button>
          <button type="button" onClick={() => onNavigate(navIndex + 1)} disabled={navIndex >= moves.length} className="p-4 hover:bg-white/10 rounded-full transition-all duration-300 group disabled:opacity-30">
            <span className="material-symbols-outlined text-white/60 group-hover:text-white">chevron_right</span>
          </button>
          <button type="button" onClick={() => onNavigate(moves.length)} disabled={navIndex >= moves.length} className="p-4 hover:bg-white/10 rounded-full transition-all duration-300 group disabled:opacity-30">
            <span className="material-symbols-outlined text-white/60 group-hover:text-white">last_page</span>
          </button>
        </div>
      </div>

      <div className="col-span-4 flex flex-col gap-6">
        <div className="bg-surface-container rounded-xl p-6 shadow-xl border-b-2 border-white/5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary/40">Stockfish 18 NNUE</h3>
            <div className="flex gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold text-green-500">{engineResult?.depth ? `depth ${engineResult.depth}` : "LIVE"}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center gap-2 text-xs text-on-surface-variant cursor-pointer">
              <input type="checkbox" checked={showArrows} onChange={(e) => onShowArrowsChange(e.target.checked)} className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 accent-primary" />
              Show arrows
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-on-surface-variant">MultiPV</span>
              <button type="button" onClick={() => onMultiPvCountChange(Math.max(1, multiPvCount - 1))} className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold transition-all">-</button>
              <span className="text-sm font-bold text-white w-4 text-center">{multiPvCount}</span>
              <button type="button" onClick={() => onMultiPvCountChange(Math.min(10, multiPvCount + 1))} className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold transition-all">+</button>
            </div>
          </div>

          <div className="space-y-1.5">
            {engineResult && engineResult.multiPv.length > 0 ? (
              engineResult.multiPv.slice(0, multiPvCount).map((line, i) => {
                const displayEval = line.mate !== null
                  ? `#${line.mate > 0 ? line.mate : Math.abs(line.mate)}`
                  : `${line.eval > 0 ? "+" : ""}${line.eval.toFixed(2)}`;
                const pvMoves = line.pv.slice(0, 5).join(" ");
                return (
                  <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${i === 0 ? "bg-primary/10 border border-primary/20" : "bg-white/5"}`}>
                    <span className="w-4 text-[10px] font-bold text-on-surface-variant shrink-0">{i + 1}</span>
                    <span className="font-bold text-yellow-400 shrink-0 w-14 tabular-nums">{displayEval}</span>
                    <span className="text-white/80 font-mono truncate">{pvMoves}</span>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-center py-4 text-on-surface-variant text-xs">
                <span className="material-symbols-outlined text-sm mr-1">psychiatry</span>
                Evaluating...
              </div>
            )}
          </div>
        </div>

        <div className="bg-surface-container rounded-xl flex flex-col flex-1 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-surface-container-high/30">
            <span className="text-xs font-black uppercase tracking-widest text-white">Move History</span>
            <span className="text-[10px] font-bold text-on-surface-variant bg-white/5 px-2 py-1 rounded">PGN</span>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[400px] p-2 space-y-1 custom-scrollbar">
            {movePairs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-neutral-700 p-8">
                <span className="material-symbols-outlined text-3xl">touch_app</span>
                <span className="text-[11px]">Make a move</span>
              </div>
            ) : (
              movePairs.map((pair) => (
                <div key={pair.num}>
                  <div className="grid grid-cols-12 items-center p-2 rounded-lg hover:bg-white/5 transition-colors group">
                    <div className="col-span-2 text-[10px] font-bold text-on-surface-variant">{pair.num}.</div>
                    <button type="button" onClick={() => onNavigate(pair.whiteIdx + 1)}
                      className={`col-span-4 text-sm font-bold text-left flex items-center gap-1.5 ${navIndex === pair.whiteIdx + 1 ? "text-yellow-400" : "text-white"}`}>
                      {pair.white}
                      <span className="shrink-0">{classificationIcon(pair.whiteClass, 14)}</span>
                    </button>
                    <button type="button" onClick={() => pair.black && onNavigate(pair.blackIdx + 1)}
                      className={`col-span-4 text-sm font-bold text-left flex items-center gap-1.5 ${navIndex === pair.blackIdx + 1 ? "text-yellow-400" : "text-white/60"}`}>
                      {pair.black || "-"}
                      <span className="shrink-0">{classificationIcon(pair.blackClass, 14)}</span>
                    </button>
                    {navIndex === pair.whiteIdx + 1 || navIndex === pair.blackIdx + 1 ? (
                      <div className="col-span-2 flex justify-end">
                        <span className="material-symbols-outlined text-white/40 text-sm">arrow_forward_ios</span>
                      </div>
                    ) : <div className="col-span-2" />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button type="button" onClick={onExport} className="py-4 bg-surface-container-high hover:bg-surface-container-highest text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 group cursor-pointer">
            <span className="material-symbols-outlined text-lg group-hover:rotate-12 transition-transform">share</span>
            Export
          </button>
          <button type="button" onClick={onLoadPgnReview} className="py-4 bg-primary text-surface-dim font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>smart_toy</span>
            Review
          </button>
        </div>
      </div>
    </div>
  );
}
