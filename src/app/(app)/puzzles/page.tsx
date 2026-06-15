"use client";

import { Chess, type Square } from "chess.js";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PieceDropHandlerArgs } from "react-chessboard";
import { Chessboard } from "react-chessboard";
import { customPieces } from "@/components/chess/customPieces";
import { boardTheme } from "@/lib/chess/boardTheme";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

import { useChessGame } from "@/lib/hooks/useChessGame";
import { useBoardInteraction } from "@/lib/hooks";
import { preloadShardsForElo } from "@/lib/puzzles/PuzzleShards";
import { usePuzzle } from "@/lib/puzzles/usePuzzle";
import { usePuzzleStorage } from "@/lib/hooks/usePuzzleStorage";
import type { PuzzleSolveRecord } from "@/lib/db/gameDB";
import {
  PuzzleInfoBar,
  PuzzleMoveHistory,
  PuzzleSettingsModal,
  PuzzleSolvedFooter,
  StatusOverlay,
} from "./components";

function StreakDots({ attempts }: { attempts: PuzzleSolveRecord[] }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap justify-center">
      {attempts.map((a, i) => {
        let color: string;
        if (a.hinted) {
          color = "bg-white";
        } else if (a.correct) {
          color = "bg-green-500";
        } else {
          color = "bg-red-500";
        }
        return (
          <div
            key={a.id ?? i}
            className={`w-2.5 h-2.5 rounded-full ${color} transition-all duration-300`}
            title={`${a.correct ? "Solved" : "Failed"}${a.hinted ? " (hint used)" : ""}`}
          />
        );
      })}
    </div>
  );
}

export default function PuzzlePage() {
  const game = useChessGame();
  const puzzle = usePuzzle({ tryMove: game.makeMove, loadFen: game.loadFen, undo: game.undo });
  const { data: session, update } = useSession();
  const puzzleStorage = usePuzzleStorage();

  const [difficulty, setDifficulty] = useState<"normal" | "hard">("normal");
  const [selectedTheme, setSelectedTheme] = useState("all");
  const [showSettings, setShowSettings] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [userElo, setUserElo] = useState(1200);
  const [unrated, setUnrated] = useState(false);
  const [recentAttempts, setRecentAttempts] = useState<PuzzleSolveRecord[]>([]);
  const submittedRef = useRef(false);
  const wrongToastRef = useRef<number | null>(null);
  const puzzleIdRef = useRef<string | null>(null);
  const hadWrongMoveRef = useRef(false);
  const recordedRef = useRef(false);
  const latestAttemptsRef = useRef<PuzzleSolveRecord[]>([]);

  const fetchAndLoadRef = useRef(puzzle.fetchAndLoad);
  useEffect(() => {
    fetchAndLoadRef.current = puzzle.fetchAndLoad;
  });

  useEffect(() => {
    fetchAndLoadRef.current({ userElo });
    puzzleStorage.getRecentAttempts(50, 4).then(setRecentAttempts);
  }, []);

  useEffect(() => {
    if (session?.user) {
      const elo = (session.user as any)?.elo;
      if (elo) setUserElo(elo);
    }
  }, [session]);

  useEffect(() => {
    if (!puzzle.puzzle) return;
    puzzleIdRef.current = puzzle.puzzle.fen;
    hadWrongMoveRef.current = false;
    recordedRef.current = false;
  }, [puzzle.puzzle]);

  useEffect(() => {
    if (puzzle.status === "wrong") {
      hadWrongMoveRef.current = true;
      if (!recordedRef.current && puzzleIdRef.current && puzzle.puzzle) {
        recordedRef.current = true;
        puzzleStorage.recordAttempt(puzzleIdRef.current, puzzle.puzzle.fen, false, puzzle.usedHint || undefined).then(() => {
          puzzleStorage.getRecentAttempts(50, 4).then(setRecentAttempts);
        });
      }
      if (wrongToastRef.current) return;
      wrongToastRef.current = 1;
      toast.error("Incorrect", { autoClose: 1200 });
    } else if (puzzle.status === "playing") {
      wrongToastRef.current = null;
    }
  }, [puzzle.status, puzzle.puzzle]);

  useEffect(() => {
    if (puzzle.status !== "solved" || !puzzle.puzzle) return;
    if (submittedRef.current) return;
    submittedRef.current = true;

    const perfect = !hadWrongMoveRef.current;

    if (!recordedRef.current) {
      puzzleStorage.recordAttempt(
        puzzleIdRef.current ?? puzzle.puzzle.fen,
        puzzle.puzzle.fen,
        perfect,
        puzzle.usedHint || undefined,
      ).then(() => {
        puzzleStorage.getRecentAttempts(50, 4).then((a) => {
          setRecentAttempts(a);
          latestAttemptsRef.current = a;
        });
      });
    } else {
      puzzleStorage.getRecentAttempts(50, 4).then(setRecentAttempts);
    }

    if (unrated) return;

    fetch("/api/updateStats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        solved: perfect,
        puzzleRating: puzzle.puzzle.rating,
        usedHint: puzzle.usedHint,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.newElo) setUserElo(data.newElo);
        update({ elo: data.newElo, delta_value: data.newDelta, volatility: data.newVol });
      })
      .catch(() => {});
  }, [puzzle.status, puzzle.puzzle, unrated]);

  const handlePieceDrop = useCallback(
    (args: PieceDropHandlerArgs): boolean => {
      const { sourceSquare, targetSquare } = args;
      if (!targetSquare || sourceSquare === targetSquare) return false;
      return puzzle.handlePlayerMove(
        sourceSquare as Square,
        targetSquare as Square,
      );
    },
    [puzzle.handlePlayerMove],
  );

  const totalPlayerMoves = puzzle.puzzle
    ? Math.ceil((puzzle.puzzle.moves.length - 1) / 2)
    : 0;
  const currentPlayerMove = puzzle.puzzle
    ? Math.floor((puzzle.moveIndex - 1) / 2)
    : 0;

  const loadNextPuzzle = () => {
    setShowSolution(false);
    setShowSettings(false);
    submittedRef.current = false;
    wrongToastRef.current = null;
    puzzleIdRef.current = null;
    hadWrongMoveRef.current = false;
    recordedRef.current = false;
    preloadShardsForElo(userElo, 3);
    puzzle.fetchAndLoad({ theme: selectedTheme, hard: difficulty === "hard", userElo });
  };

  const interaction = useBoardInteraction({
    chessGame: game.chessGame,
    onMove: (from, to) => puzzle.handlePlayerMove(from as Square, to as Square),
    enabled: puzzle.status === "playing",
  });

  const squareStyles: Record<string, React.CSSProperties> = {};
  if (puzzle.hintSquares) {
    squareStyles[puzzle.hintSquares.from] = {
      backgroundColor: "rgba(255,255,0,0.35)",
      borderRadius: "50%",
    };
    squareStyles[puzzle.hintSquares.to] = {
      backgroundColor: "rgba(255,255,0,0.35)",
    };
  }
  Object.assign(squareStyles, interaction.squareStyles);

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased selection:bg-white selection:text-black relative">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-neutral-900 via-black to-black pointer-events-none" />

      {puzzle.status === "loading" && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-neutral-700 border-t-white rounded-full animate-spin" />
            <span className="text-neutral-500 text-sm font-medium tracking-wide">
              Loading puzzle...
            </span>
          </div>
        </div>
      )}

      <main>
        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 lg:px-8 pt-8 pb-24">
          {puzzle.puzzle ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
              <section className="lg:col-span-7 xl:col-span-8 flex flex-col items-center w-full">
                <div className="relative w-full max-w-[700px] aspect-square bg-surface-container shadow-[0_30px_100px_rgba(0,0,0,0.5)] rounded-[2rem] overflow-hidden group border border-white/5">
                  <StatusOverlay status={puzzle.status} />
                  <Chessboard
                    options={{
                      id: "puzzle-board",
                      position: game.position,
                      pieces: customPieces,
                      onPieceDrop: interaction.handlePieceDrop,
                      onSquareClick: interaction.handleSquareClick,
                      onPieceDrag: interaction.handlePieceDrag,
                      boardOrientation:
                        puzzle.playerColor === "b" ? "black" : "white",
                      allowDragging: puzzle.status === "playing",
                      darkSquareStyle: { backgroundColor: boardTheme.darkSquare },
                      lightSquareStyle: { backgroundColor: boardTheme.lightSquare },
                      animationDurationInMs: 400,
                      showAnimations: true,
                      squareStyles,
                    }}
                  />
                </div>

                <div className="mt-8 w-full max-w-[700px]">
                  <PuzzleInfoBar
                    playerColor={puzzle.playerColor}
                    status={puzzle.status}
                    currentPlayerMove={currentPlayerMove}
                    totalPlayerMoves={totalPlayerMoves}
                  />
                </div>

                <div className="mt-6 w-full max-w-[700px] flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div
                      onClick={() => setUnrated((u) => !u)}
                      className={`w-9 h-5 flex items-center rounded-full px-0.5 transition-colors duration-200 ${
                        unrated ? "bg-neutral-600" : "bg-white"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-black transition-transform duration-200 ${
                          unrated ? "translate-x-0" : "translate-x-4"
                        }`}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-neutral-400">
                      Unrated
                    </span>
                  </label>

                  <StreakDots attempts={recentAttempts} />
                </div>
              </section>

              <aside className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 w-full max-w-[500px] mx-auto lg:mx-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-8 rounded-3xl border border-white/5 shadow-xl glass">
                    <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-2">
                      Rating
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-white tracking-tighter">
                        {puzzle.puzzle.rating.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="p-8 rounded-3xl border border-white/5 shadow-xl glass">
                    <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-2">
                      Themes
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {puzzle.puzzle.themes.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="text-[10px] font-medium text-white/70 bg-white/5 px-2 py-1 rounded capitalize"
                        >
                          {t.replace(/([A-Z])/g, " $1")}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <PuzzleMoveHistory
                  puzzle={puzzle.puzzle}
                  moveIndex={puzzle.moveIndex}
                  onToggleSettings={() => setShowSettings(true)}
                />

                {puzzle.status === "solved" ? (
                  <PuzzleSolvedFooter
                    rating={puzzle.puzzle.rating}
                    themes={puzzle.puzzle.themes}
                    onNextPuzzle={loadNextPuzzle}
                  />
                ) : (
                  <div className="p-6 bg-surface-container-lowest/50 grid grid-cols-2 gap-4 rounded-3xl border border-white/5 glass">
                    <button
                      type="button"
                      onClick={puzzle.getHint}
                      disabled={puzzle.status !== "playing"}
                      className="bg-white/5 hover:bg-white/10 transition-all py-4 rounded-2xl flex flex-col items-center gap-2 group active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed premium-hover"
                    >
                      <span className="material-symbols-outlined group-hover:text-yellow-400 transition-colors">
                        lightbulb
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Hint
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSolution(true)}
                      disabled={puzzle.status !== "playing"}
                      className="bg-white/5 hover:bg-white/10 transition-all py-4 rounded-2xl flex flex-col items-center gap-2 group active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed premium-hover"
                    >
                      <span className="material-symbols-outlined group-hover:text-error transition-colors">
                        visibility
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        Solution
                      </span>
                    </button>
                  </div>
                )}

                {puzzle.puzzle.themes.length > 0 && (
                  <div className="bg-surface-container-low p-8 rounded-3xl border border-white/5 flex items-center gap-8 relative overflow-hidden group shadow-xl">
                    <div className="flex-1 z-10">
                      <h3 className="text-sm font-black text-white mb-2 uppercase tracking-wide">
                        Tactical Motif{puzzle.puzzle.themes.length > 1 ? "s" : ""}
                      </h3>
                      <p className="text-xs text-neutral-400 leading-relaxed capitalize">
                        {puzzle.puzzle.themes
                          .join(", ")
                          .replace(/([A-Z])/g, " $1")}
                      </p>
                    </div>
                    <div className="w-20 h-20 opacity-5 absolute -right-2 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                      <span className="material-symbols-outlined scale-600">
                        psychology
                      </span>
                    </div>
                  </div>
                )}

                {showSolution && puzzle.puzzle && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={() => setShowSolution(false)}
                    onKeyDown={(e) => { if (e.key === "Escape") setShowSolution(false); }}
                  >
                    <div
                      className="bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl p-6 w-[340px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <h3 className="text-sm font-black uppercase tracking-wider text-white mb-4">
                        Solution
                      </h3>
                      <div className="space-y-2 text-sm font-mono">
                        {puzzle.puzzle.moves.map((m, i) => (
                          <div
                            key={m}
                            className={`flex items-center gap-3 ${i < puzzle.moveIndex ? "text-neutral-600" : "text-white"}`}
                          >
                            <span className="w-6 text-neutral-500">
                              {Math.floor(i / 2) + 1}
                              {i % 2 === 0 ? "." : "..."}
                            </span>
                            <span
                              className={
                                i < puzzle.moveIndex ? "" : "font-semibold"
                              }
                            >
                              {m.substring(0, 2)}–{m.substring(2, 4)}
                              {m.length > 4 ? m[4] : ""}
                            </span>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowSolution(false)}
                        className="mt-6 w-full py-2.5 bg-white text-black rounded-lg text-xs font-semibold hover:bg-neutral-200 transition-all"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}

                {showSettings && (
                  <PuzzleSettingsModal
                    difficulty={difficulty}
                    selectedTheme={selectedTheme}
                    onDifficultyChange={setDifficulty}
                    onThemeChange={setSelectedTheme}
                    onNextPuzzle={loadNextPuzzle}
                    onClose={() => setShowSettings(false)}
                  />
                )}
              </aside>
            </div>
          ) : (
            <div className="p-4 text-center text-neutral-500 mt-40">
              No puzzle loaded
            </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-10 right-10 flex flex-col gap-6 z-50">
        <button
          type="button"
          onClick={() => game.loadFen(new Chess().fen())}
          className="w-14 h-14 glass text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-90 transition-all"
        >
          <span className="material-symbols-outlined">restart_alt</span>
        </button>
        <button
          type="button"
          onClick={loadNextPuzzle}
          className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center shadow-[0_20px_40px_rgba(255,255,255,0.2)] hover:scale-110 active:scale-90 transition-all"
        >
          <span className="material-symbols-outlined font-black text-3xl">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
