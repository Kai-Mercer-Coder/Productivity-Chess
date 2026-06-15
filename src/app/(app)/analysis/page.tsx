"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Chess } from "chess.js";
import { useBoardInteraction } from "@/lib/hooks";

const CONTROL_CHARS = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g;
const FEN_ALLOWED = /[^a-zA-Z0-9\s\/\-kqKQ]+/g;
const PGN_STRIP = /[^a-zA-Z0-9\s\.\-\+\=\#\!\?\/\(\)\:\*\"\']/g;

function sanitize(input: string): string {
  return input.replace(CONTROL_CHARS, "").normalize("NFKC");
}

function sanitizePgn(input: string): string {
  return sanitize(input).replace(PGN_STRIP, "").slice(0, 10000);
}

function sanitizeFen(input: string): string {
  return sanitize(input).replace(FEN_ALLOWED, "").slice(0, 200);
}
import { Chessboard } from "react-chessboard";
import { useChessGame } from "@/lib/hooks/useChessGame";
import { useGameReview } from "@/lib/hooks/useGameReview";
import { customPieces } from "@/components/chess/customPieces";
import { boardTheme } from "@/lib/chess/boardTheme";

import { LocalStockfishEvalEngine, type LocalEvalResult } from "@/lib/chess/MoveEngine";
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

  const [exportOpen, setExportOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const [liveEval, setLiveEval] = useState<number | null>(null);
  const [liveMate, setLiveMate] = useState<number | null>(null);
  const [engineResult, setEngineResult] = useState<LocalEvalResult | null>(null);
  const [multiPvCount, setMultiPvCount] = useState(3);
  const [showArrows, setShowArrows] = useState(true);
  const evalEngineRef = useRef<LocalStockfishEvalEngine | null>(null);
  const [positionLoaded, setPositionLoaded] = useState(false);
  const [mode, setMode] = useState<AnalysisMode>("pgn");
  const [pgnInput, setPgnInputRaw] = useState("");
  const [fenInput, setFenInputRaw] = useState("");
  const setPgnInput = useCallback((v: string) => setPgnInputRaw(sanitizePgn(v)), []);
  const setFenInput = useCallback((v: string) => setFenInputRaw(sanitizeFen(v)), []);
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

  const interaction = useBoardInteraction({
    chessGame: game.chessGame,
    onMove: useCallback(
      (from, to) => {
        if (navIndex < moves.length) {
          setMoves((prev) => prev.slice(0, navIndex));
        }
        const result = game.makeMove(from, to);
        if (result) {
          const allMoves = game.chessGame.history();
          const newSan = allMoves[allMoves.length - 1];
          setMoves((prev) => [...prev, newSan]);
          setNavIndex((prev) => prev + 1);
        }
        return result;
      },
      [game, moves, navIndex],
    ),
  });

  useEffect(() => {
    const engine = new LocalStockfishEvalEngine();
    engine.setMultiPV(multiPvCount);
    evalEngineRef.current = engine;
    return () => { engine.terminate(); };
  }, [multiPvCount]);

  useEffect(() => {
    if (!positionLoaded || report) return;
    const engine = evalEngineRef.current;
    if (!engine) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      const result = await engine.evaluatePosition(game.position, 10000, (update) => {
        if (!cancelled) {
          setEngineResult(update);
          setLiveEval(update.eval);
          setLiveMate(update.mate);
        }
      });
      if (!cancelled) {
        setEngineResult(result);
        setLiveEval(result.eval);
        setLiveMate(result.mate);
      }
    }, 200);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [game.position, positionLoaded, report]);

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
    if (report && navIndex >= 0 && navIndex < report.positions.length) {
      const pos = report.positions[navIndex];
      const line = pos?.topLines?.[0];
      if (line) {
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
      }
    }
    if (liveMate) {
      return liveMate > 0
        ? { display: `#${liveMate}`, whitePct: 95 }
        : { display: `#${Math.abs(liveMate)}`, whitePct: 5 };
    }
    if (liveEval !== null) {
      const cp = liveEval * 100;
      const clamped = Math.max(-1000, Math.min(1000, cp));
      const whitePct = 50 + (clamped / 1000) * 45;
      return {
        display: liveEval > 0 ? `+${liveEval.toFixed(2)}` : liveEval.toFixed(2),
        whitePct,
      };
    }
    return null;
  }, [report, navIndex, liveEval, liveMate]);

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

  const arrows = useMemo(() => {
    if (!showArrows || !engineResult || !engineResult.pv.length) return [];
    const result: { startSquare: string; endSquare: string; color: string }[] = [];
    const firstMove = engineResult.pv[0];
    if (firstMove && firstMove.length >= 4) {
      result.push({
        startSquare: firstMove.substring(0, 2),
        endSquare: firstMove.substring(2, 4),
        color: "#a3e635",
      });
    }
    if (multiPvCount > 1) {
      for (let i = 1; i < engineResult.multiPv.length; i++) {
        const line = engineResult.multiPv[i];
        if (!line.pv.length) continue;
        const m = line.pv[0];
        if (m && m.length >= 4) {
          result.push({
            startSquare: m.substring(0, 2),
            endSquare: m.substring(2, 4),
            color: "#facc15",
          });
        }
      }
    }
    return result;
  }, [engineResult, showArrows, multiPvCount]);

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
                    Deep Stockfish 18 NNUE Cloud
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
                            Stockfish 18 NNUE
                          </h3>
                          <div className="flex gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-bold text-green-500">
                              {engineResult?.depth ? `depth ${engineResult.depth}` : "LIVE"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                          <label className="flex items-center gap-2 text-xs text-on-surface-variant cursor-pointer">
                            <input
                              type="checkbox"
                              checked={showArrows}
                              onChange={(e) => setShowArrows(e.target.checked)}
                              className="w-3.5 h-3.5 rounded border-white/20 bg-white/5 accent-primary"
                            />
                            Show arrows
                          </label>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-on-surface-variant">MultiPV</span>
                            <button
                              type="button"
                              onClick={() => setMultiPvCount((p) => Math.max(1, p - 1))}
                              className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold transition-all"
                            >
                              -
                            </button>
                            <span className="text-sm font-bold text-white w-4 text-center">{multiPvCount}</span>
                            <button
                              type="button"
                              onClick={() => setMultiPvCount((p) => Math.min(10, p + 1))}
                              className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold transition-all"
                            >
                              +
                            </button>
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
                                <div
                                  key={i}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                                    i === 0 ? "bg-primary/10 border border-primary/20" : "bg-white/5"
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
                              <span className="material-symbols-outlined text-sm mr-1">psychiatry</span>
                              Evaluating...
                            </div>
                          )}
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
                          onClick={() => setExportOpen(true)}
                          className="py-4 bg-surface-container-high hover:bg-surface-container-highest text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 group cursor-pointer"
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

                </>
              )}
            </>
          )}
        </div>
      </main>

      {exportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { setExportOpen(false); setCopied(false); }} />
          <div ref={exportRef} className="relative z-10 w-full max-w-2xl mx-6 bg-surface-container rounded-2xl border border-white/10 shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black tracking-tight text-primary">Export PGN</h3>
              <button
                type="button"
                onClick={() => { setExportOpen(false); setCopied(false); }}
                className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="bg-surface-container-low rounded-xl p-6 mb-6 max-h-64 overflow-y-auto">
              <pre className="text-xs font-mono text-on-surface-variant whitespace-pre-wrap break-all leading-relaxed select-all">
                {(() => {
                  try {
                    const pgn = pgnInput || game.chessGame.pgn();
                    return pgn || "No moves played yet.";
                  } catch { return "No moves played yet."; }
                })()}
              </pre>
            </div>
            <button
              type="button"
              onClick={async () => {
                try {
                  const text = pgnInput || game.chessGame.pgn() || "";
                  await navigator.clipboard.writeText(text);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                } catch {}
              }}
              className="w-full py-4 rounded-xl bg-primary text-on-primary font-bold hover:opacity-90 transition-all active:scale-[0.98] cursor-pointer"
            >
              {copied ? "Copied!" : "Copy PGN"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
