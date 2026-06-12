"use client";

import { useState, useCallback, useMemo } from "react";
import { Chess } from "chess.js";
import type { PieceDropHandlerArgs } from "react-chessboard";
import { Chessboard } from "react-chessboard";
import { useChessGame } from "@/lib/hooks/useChessGame";
import { useGameReview } from "@/lib/hooks/useGameReview";

import GameReviewView from "./components/GameReviewView";
import ModeSelector from "./components/ModeSelector";
import {
  accuracyColor,
  classificationVisuals,
} from "./components/classificationVisuals";

type AnalysisMode = "pgn" | "fen" | "blank";

export default function AnalysisPage() {
  const game = useChessGame();
  const { report, loading, progress, total, deepLoading, runReview, runDeepAnalysis, reset: resetReview } = useGameReview();

  const [positionLoaded, setPositionLoaded] = useState(false);
  const [mode, setMode] = useState<AnalysisMode>("pgn");
  const [pgnInput, setPgnInput] = useState("");
  const [fenInput, setFenInput] = useState("");
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
      setPositionLoaded(true);
      runReview(pgnInput.trim());
    } catch { }
  }, [pgnInput, game, runReview]);

  const reset = useCallback(() => {
    setPositionLoaded(false);
    setMode("pgn");
    setPgnInput("");
    setFenInput("");
    setMoves([]);
    setNavIndex(0);
    setStartFen("");
    resetReview();
  }, [resetReview]);

  const currentEval = useMemo(() => {
    if (!report || navIndex < 0 || navIndex >= report.positions.length)
      return null;
    const pos = report.positions[navIndex];
    const line = pos?.topLines?.[0];
    if (!line) return null;
    if (line.evaluation.type === "mate") {
      return line.evaluation.value > 0
        ? { display: `#${line.evaluation.value}`, whitePct: 95 }
        : { display: `#${Math.abs(line.evaluation.value)}`, whitePct: 5 };
    }
    const cp = line.evaluation.value;
    const clamped = Math.max(-1000, Math.min(1000, cp));
    const whitePct = 50 + (clamped / 1000) * 45;
    return {
      display: cp > 0 ? `+${(cp / 100).toFixed(1)}` : (cp / 100).toFixed(1),
      whitePct,
    };
  }, [report, navIndex]);

  const movePairs = useMemo(() => {
    const pairs: {
      num: number; white: string; black: string;
      whiteIdx: number; blackIdx: number;
      whiteClass?: string; blackClass?: string;
    }[] = [];
    for (let i = 0; i < moves.length; i += 2) {
      const whiteIdx = i;
      const blackIdx = i + 1;
      const wPos = report?.positions?.[whiteIdx + 1];
      const bPos = report?.positions?.[blackIdx + 1];
      pairs.push({
        num: Math.floor(i / 2) + 1,
        white: moves[i] ?? "",
        black: moves[i + 1] ?? "",
        whiteIdx,
        blackIdx,
        whiteClass: wPos?.classification,
        blackClass: bPos?.classification,
      });
    }
    return pairs;
  }, [moves, report]);

  const classificationIcon = (classification?: string, size = 16) => {
    if (!classification) return null;
    const vis = classificationVisuals[classification];
    if (!vis) return null;
    return (
      <span
        className="inline-flex items-center justify-center rounded-full shrink-0"
        style={{
          width: size,
          height: size,
          backgroundColor: vis.badgeBg,
          color: "#fff",
          fontSize: size * 0.55,
          fontWeight: 800,
        }}
      >
        {typeof vis.icon === "string" ? vis.icon : null}
      </span>
    );
  };

  const player =
    report && report.accuracies
      ? { name: "White", acc: report.accuracies.white }
      : null;
  const opponent =
    report && report.accuracies
      ? { name: "Black", acc: report.accuracies.black }
      : null;

  const overallPrecision = useMemo(() => {
    if (!player || !opponent) return null;
    return ((player.acc + opponent.acc) / 2).toFixed(1);
  }, [player, opponent]);

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased selection:bg-white selection:text-black relative">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-neutral-900 via-black to-black pointer-events-none" />
      <div
        className="fixed top-0 right-0 -z-10 w-1/2 h-screen opacity-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 70% 30%, rgba(255,255,255,0.1) 0%, transparent 70%)",
        }}
      />

      <main>
        <div className="relative z-10 w-full px-4 lg:px-8 pt-6 pb-24 max-w-[1600px] mx-auto">
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
          ) : loading ? (
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <p className="text-sm text-neutral-400">
                  Analysing game... {progress}/{total}
                </p>
              </div>
            </div>
          ) : (
            <>
              <header className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-4xl font-black tracking-tighter text-white">
                    Analysis{" "}
                    <span className="text-primary/40">Studio</span>
                  </h1>
                  <p className="text-on-surface-variant/60 font-medium text-sm tracking-wide uppercase mt-1">
                    Deep Stockfish 16.1 Cloud
                  </p>
                </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-bold text-primary/60 uppercase tracking-widest">
                        Report
                      </span>
                      <span className="text-white font-bold">
                        {report ? `${moves.length} moves` : "Live board"}
                      </span>
                    </div>
                    {report && (
                      <button
                        type="button"
                        onClick={() => {
                          const currentPgn = pgnInput;
                          if (currentPgn) runDeepAnalysis(currentPgn);
                        }}
                        disabled={deepLoading}
                        className="text-xs bg-primary/20 border border-primary/30 text-primary px-3 py-1.5 rounded-full hover:bg-primary/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {deepLoading ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            Deep analysing...
                          </span>
                        ) : (
                          "Run Deep Local Analysis"
                        )}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={reset}
                      className="w-12 h-12 rounded-full border-2 border-white/10 flex items-center justify-center hover:border-white/30 transition-all text-neutral-400 hover:text-white"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
              </header>

              {report ? (
                <GameReviewView
                  fen={game.position}
                  report={report}
                  onReset={reset}
                  onNavigate={navigateTo}
                  navIndex={navIndex}
                  moves={moves}
                  loading={false}
                  progress={progress}
                  total={total}
                />
              ) : (
                <>
                  <div className="grid grid-cols-12 gap-8 items-start">
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

                    <div className="col-span-7 relative group">
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-2xl bg-surface-container">
                        <Chessboard
                          options={{
                            id: "analysis-board",
                            position: game.position,
                            onPieceDrop: handlePieceDrop,
                            boardOrientation: "white",
                            boardStyle: { borderRadius: "0" },
                            darkSquareStyle: { backgroundColor: "#454747" },
                            lightSquareStyle: { backgroundColor: "#c6c6c7" },
                            animationDurationInMs: 400,
                            allowDragging: true,
                            showAnimations: true,
                          }}
                        />
                      </div>

                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-surface-container/60 glass-panel rounded-full shadow-2xl border border-white/5">
                        <button
                          type="button"
                          onClick={() => navigateTo(0)}
                          disabled={navIndex <= 0}
                          className="p-4 hover:bg-white/10 rounded-full transition-all duration-300 group disabled:opacity-30"
                        >
                          <span className="material-symbols-outlined text-white/60 group-hover:text-white">
                            first_page
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => navigateTo(navIndex - 1)}
                          disabled={navIndex <= 0}
                          className="p-4 hover:bg-white/10 rounded-full transition-all duration-300 group disabled:opacity-30"
                        >
                          <span className="material-symbols-outlined text-white/60 group-hover:text-white">
                            chevron_left
                          </span>
                        </button>
                        <button
                          type="button"
                          className="p-6 bg-primary text-surface-dim rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all"
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            play_arrow
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => navigateTo(navIndex + 1)}
                          disabled={navIndex >= moves.length}
                          className="p-4 hover:bg-white/10 rounded-full transition-all duration-300 group disabled:opacity-30"
                        >
                          <span className="material-symbols-outlined text-white/60 group-hover:text-white">
                            chevron_right
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => navigateTo(moves.length)}
                          disabled={navIndex >= moves.length}
                          className="p-4 hover:bg-white/10 rounded-full transition-all duration-300 group disabled:opacity-30"
                        >
                          <span className="material-symbols-outlined text-white/60 group-hover:text-white">
                            last_page
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="col-span-4 flex flex-col gap-6">
                      <div className="bg-surface-container rounded-xl p-6 shadow-xl border-b-2 border-white/5">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xs font-black uppercase tracking-widest text-primary/40">
                            Engine Metrics
                          </h3>
                          <div className="flex gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-green-500">
                              LIVE
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-surface-container-low p-4 rounded-lg">
                            <p className="text-[10px] text-on-surface-variant font-medium">
                              Depth
                            </p>
                            <p className="text-xl font-bold text-white">24/48</p>
                          </div>
                          <div className="bg-surface-container-low p-4 rounded-lg">
                            <p className="text-[10px] text-on-surface-variant font-medium">
                              Nodes/s
                            </p>
                            <p className="text-xl font-bold text-white">12.4M</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-surface-container rounded-xl flex flex-col flex-1 shadow-xl overflow-hidden">
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-surface-container-high/30">
                          <span className="text-xs font-black uppercase tracking-widest text-white">
                            Move History
                          </span>
                          <span className="text-[10px] font-bold text-on-surface-variant bg-white/5 px-2 py-1 rounded">
                            PGN
                          </span>
                        </div>
                        <div className="flex-1 overflow-y-auto max-h-[400px] p-2 space-y-1 custom-scrollbar">
                          {movePairs.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full gap-3 text-neutral-700 p-8">
                              <span className="material-symbols-outlined text-3xl">
                                touch_app
                              </span>
                              <span className="text-[11px]">Make a move</span>
                            </div>
                          ) : (
                            movePairs.map((pair) => (
                              <div key={pair.num}>
                                <div className="grid grid-cols-12 items-center p-2 rounded-lg hover:bg-white/5 transition-colors group">
                                  <div className="col-span-2 text-[10px] font-bold text-on-surface-variant">
                                    {pair.num}.
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      navigateTo(pair.whiteIdx + 1)
                                    }
                                    className={`col-span-4 text-sm font-bold text-left flex items-center gap-1.5 ${
                                      navIndex === pair.whiteIdx + 1
                                        ? "text-yellow-400"
                                        : "text-white"
                                    }`}
                                  >
                                    {pair.white}
                                    <span className="shrink-0">
                                      {classificationIcon(pair.whiteClass, 14)}
                                    </span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      pair.black &&
                                      navigateTo(pair.blackIdx + 1)
                                    }
                                    className={`col-span-4 text-sm font-bold text-left flex items-center gap-1.5 ${
                                      navIndex === pair.blackIdx + 1
                                        ? "text-yellow-400"
                                        : "text-white/60"
                                    }`}
                                  >
                                    {pair.black || "-"}
                                    <span className="shrink-0">
                                      {classificationIcon(pair.blackClass, 14)}
                                    </span>
                                  </button>
                                  {navIndex === pair.whiteIdx + 1 ||
                                  navIndex === pair.blackIdx + 1 ? (
                                    <div className="col-span-2 flex justify-end">
                                      <span className="material-symbols-outlined text-white/40 text-sm">
                                        arrow_forward_ios
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="col-span-2" />
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          className="py-4 bg-surface-container-high hover:bg-surface-container-highest text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 group"
                        >
                          <span className="material-symbols-outlined text-lg group-hover:rotate-12 transition-transform">
                            share
                          </span>
                          Export
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (pgnInput.trim()) loadFromPgnReview();
                          }}
                          className="py-4 bg-primary text-surface-dim font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
                        >
                          <span
                            className="material-symbols-outlined text-lg"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            smart_toy
                          </span>
                          Review
                        </button>
                      </div>
                    </div>
                  </div>

                  <section className="mt-24 mb-16 grid grid-cols-3 gap-8">
                    <div className="bg-surface-container rounded-xl p-8 glass-panel border-t border-white/10">
                      <div className="flex items-center gap-3 mb-6">
                        <span className="material-symbols-outlined text-primary">
                          analytics
                        </span>
                        <h4 className="text-sm font-black uppercase tracking-widest">
                          Accuracy
                        </h4>
                      </div>
                      <div className="space-y-3">
                        {player && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-neutral-400">
                              White
                            </span>
                            <span
                              className={`text-lg font-black ${accuracyColor(player.acc)}`}
                            >
                              {player.acc.toFixed(1)}%
                            </span>
                          </div>
                        )}
                        {opponent && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-neutral-400">
                              Black
                            </span>
                            <span
                              className={`text-lg font-black ${accuracyColor(opponent.acc)}`}
                            >
                              {opponent.acc.toFixed(1)}%
                            </span>
                          </div>
                        )}
                        {!player && !opponent && (
                          <p className="text-sm text-neutral-500">
                            Load a game to see accuracy
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="bg-surface-container rounded-xl p-8 glass-panel border-t border-white/10">
                      <div className="flex items-center gap-3 mb-6">
                        <span className="material-symbols-outlined text-primary">
                          history_edu
                        </span>
                        <h4 className="text-sm font-black uppercase tracking-widest">
                          Opening Theory
                        </h4>
                      </div>
                      <div className="space-y-4">
                        <p className="text-white font-bold text-lg">
                          {"Custom Position"}
                        </p>
                        <div className="flex gap-2">
                          <span className="text-[10px] px-2 py-1 bg-white/5 rounded-full border border-white/10">
                            Analysis
                          </span>
                          <span className="text-[10px] px-2 py-1 bg-white/5 rounded-full border border-white/10">
                            {moves.length > 0 ? `${moves.length} ply` : "Start"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-surface-container rounded-xl p-8 glass-panel border-t border-white/10 flex flex-col justify-center">
                      <div className="text-center">
                        <p className="text-4xl font-black text-white">
                          {overallPrecision ? `${overallPrecision}%` : "—"}
                        </p>
                        <p className="text-xs font-bold text-primary/40 uppercase tracking-widest mt-2">
                          Overall Precision
                        </p>
                      </div>
                    </div>
                  </section>
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
