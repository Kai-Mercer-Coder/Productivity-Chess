"use client";

import { Chess, type Square } from "chess.js";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PieceDropHandlerArgs } from "react-chessboard";
import { Chessboard } from "react-chessboard";
import { customPieces } from "@/components/chess/customPieces";
import { boardTheme } from "@/lib/chess/boardTheme";
import { useSession } from "next-auth/react";
import type { SessionWithProfile } from "@/types/profile";
import { toast } from "react-toastify";
import Dexie from 'dexie';
import { useChessGame } from "@/lib/hooks/useChessGame";
import { useBoardInteraction } from "@/lib/hooks";
import { preloadShardsForElo } from "@/lib/puzzles/PuzzleShards";
import { usePuzzle } from "@/lib/puzzles/usePuzzle";
import { usePuzzleStorage } from "@/lib/hooks/usePuzzleStorage";
import type { PuzzleSolveRecord } from "@/lib/db/gameDB";
import { useLocalElo } from "@/lib/hooks/useLocalElo";
import { pickTheme, RARITY_COLORS } from "@/lib/puzzles/puzzleThemes";
import {
  PuzzleSettingsModal,
  PuzzleSolvedFooter,
  StatusOverlay,
} from "./components";

function StreakDots({
  attempts,
  onShowAll,
}: {
  attempts: PuzzleSolveRecord[];
  onShowAll: () => void;
}) {
  const visible = attempts.slice(-9);
  const wins = attempts.filter((a) => a.correct).length;
  const losses = attempts.filter((a) => !a.correct).length;
  const hinted = attempts.filter((a) => a.hinted).length;

  return (
    <button
      type="button"
      onClick={onShowAll}
      className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-surface-container-low/80 border border-white/5 hover:bg-surface-container-low hover:border-white/10 transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-2.5">
        {visible.map((a, i) => {
          let color: string;
          if (a.hinted) {
            color = "bg-white/50";
          } else if (a.correct) {
            color = "bg-green-500";
          } else {
            color = "bg-red-500";
          }
          return (
            <div
              key={a.id ?? i}
              className={`w-2.5 h-2.5 rounded-full ${color} transition-all duration-300`}
            />
          );
        })}
        {Array.from({ length: 9 - visible.length }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="w-2.5 h-2.5 rounded-full bg-white/5"
          />
        ))}
      </div>
      <div className="h-4 w-px bg-white/10" />
      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider group-hover:text-neutral-400 transition-colors">
        {wins}W {losses}L{hinted > 0 ? ` ${hinted}H` : ""}
      </span>
    </button>
  );
}

function StreakModal({
  attempts,
  onClose,
}: {
  attempts: PuzzleSolveRecord[];
  onClose: () => void;
}) {
  const wins = attempts.filter((a) => a.correct).length;
  const losses = attempts.filter((a) => !a.correct).length;
  const hinted = attempts.filter((a) => a.hinted).length;
  const streak = attempts.reduce<number>((acc, a) => {
    if (a.correct) return acc + 1;
    return 0;
  }, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div
        className="glass border border-white/10 rounded-3xl shadow-2xl p-6 w-[360px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-xs font-black uppercase tracking-wider text-white">
            Streak History
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
            <div className="text-xl font-black text-green-400">{wins}</div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-green-400/60">
              Wins
            </div>
          </div>
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
            <div className="text-xl font-black text-red-400">{losses}</div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-red-400/60">
              Losses
            </div>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
            <div className="text-xl font-black text-white">{streak}</div>
            <div className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">
              Streak
            </div>
          </div>
        </div>

        <div className="grid grid-cols-9 gap-1.5">
          {attempts
            .slice()
            .reverse()
            .slice(0, 81)
            .map((a, i) => {
              let color: string;
              if (a.hinted) {
                color = "bg-white/40";
              } else if (a.correct) {
                color = "bg-green-500";
              } else {
                color = "bg-red-500";
              }
              return (
                <div
                  key={a.id ?? i}
                  className={`w-full aspect-square rounded-md ${color} transition-all duration-300`}
                  title={`${a.correct ? "Solved" : "Failed"}${a.hinted ? " (hint)" : ""}`}
                />
              );
            })}
        </div>

        {hinted > 0 && (
          <div className="mt-4 flex items-center gap-2 justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-white/40" />
            <span className="text-[10px] text-neutral-500 font-medium">
              {hinted} solved with hint
            </span>
          </div>
        )}
      </div>
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
  const sessionElo = (session?.user as SessionWithProfile["user"] | undefined)?.elo;
  const { userElo, lastDelta, updateEloAfterPuzzle, clearDelta } = useLocalElo(sessionElo);
  const [unrated, setUnrated] = useState(false);
  const [showStreak, setShowStreak] = useState(false);
  const [recentAttempts, setRecentAttempts] = useState<PuzzleSolveRecord[]>([]);
  const submittedRef = useRef(false);
  const wrongToastRef = useRef<number | null>(null);
  const puzzleIdRef = useRef<string | null>(null);
  const hadWrongMoveRef = useRef(false);
  const recordedRef = useRef(false);
  const latestAttemptsRef = useRef<PuzzleSolveRecord[]>([]);

  useEffect(() => {
    puzzle.fetchAndLoad({ userElo });
    puzzleStorage.getRecentAttempts(50, 4).then(setRecentAttempts);
  }, []);

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
      if (!wrongToastRef.current) {
        wrongToastRef.current = 1;
        toast.error("Incorrect", { autoClose: 1200 });
      }
    } else if (puzzle.status === "playing") {
      wrongToastRef.current = null;
    }
  }, [puzzle.status, puzzle.puzzle]);

  useEffect(() => {
    if (puzzle.status !== "solved" || !puzzle.puzzle) return;
    if (submittedRef.current) return;
    submittedRef.current = true;

    const perfect = !hadWrongMoveRef.current;
    const currentPuzzle = puzzle.puzzle;

    if (!recordedRef.current) {
      puzzleStorage.recordAttempt(
        puzzleIdRef.current ?? currentPuzzle.fen,
        currentPuzzle.fen,
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

    const result = updateEloAfterPuzzle(currentPuzzle.rating, perfect, puzzle.usedHint);
    update({ elo: result.newRating, delta_value: result.newRd, volatility: result.newVol }).catch(() => {});
  }, [puzzle.status, puzzle.puzzle, unrated, updateEloAfterPuzzle, update]);

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
    clearDelta();
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
                <div className="relative w-full max-w-[680px] aspect-square bg-surface-container shadow-[0_30px_100px_rgba(0,0,0,0.5)] rounded-[2rem] overflow-hidden group border border-white/5">
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

              </section>

              <aside className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 w-full max-w-[500px] mx-auto lg:mx-0">
                <StreakDots attempts={recentAttempts} onShowAll={() => setShowStreak(true)} />

                <div className="flex flex-col gap-4">
                  <div className="p-8 rounded-3xl border border-white/5 shadow-xl glass relative">
                    <button
                      type="button"
                      onClick={() => setShowSettings(true)}
                      className="absolute top-4 right-4 p-2 text-neutral-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                    >
                      <span className="material-symbols-outlined text-lg">settings</span>
                    </button>
                    <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-2">
                      Rating
                    </span>
                    <div className="flex items-center gap-5">
                      <span className="text-4xl font-black text-white tracking-tighter">
                        {userElo.toLocaleString()}
                      </span>
                      {lastDelta !== null && lastDelta !== 0 && (
                        <span
                          className={`text-lg font-black tabular-nums ${
                            lastDelta > 0 ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {lastDelta > 0 ? "+" : ""}
                          {lastDelta}
                        </span>
                      )}
                      <div className={`w-4 h-4 rounded-full ${puzzle.playerColor === "w" ? "bg-white" : "bg-neutral-800 border border-white/30"}`} />
                    </div>
                  </div>

                  {puzzle.puzzle.themes.length > 0 && (() => {
                    const primaryTheme = pickTheme(puzzle.puzzle.themes);
                    const rarityColor = RARITY_COLORS[primaryTheme.rarity ?? "common"];
                    return (
                      <div className="bg-surface-container-low p-8 rounded-3xl border border-white/5 flex items-center gap-8 relative overflow-hidden group shadow-xl">
                        <div className="flex-1 z-10">
                          <h3 className="text-sm font-black text-white mb-2 uppercase tracking-wide">
                            {primaryTheme.label}
                          </h3>
                          <p className="text-xs text-neutral-400 leading-relaxed capitalize">
                            {primaryTheme.description}
                          </p>
                        </div>
                        <div className="w-20 h-20 opacity-5 absolute -right-2 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                          <span className="material-symbols-outlined scale-600">
                            {primaryTheme.icon}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {puzzle.status === "solved" ? (
                  <PuzzleSolvedFooter
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

                <div className="p-6 rounded-3xl border border-white/5 glass">
                  <button
                    type="button"
                    onClick={() => setUnrated((u) => !u)}
                    className="w-full flex items-center justify-between"
                  >
                    <div>
                      <span className="text-sm font-semibold text-white">
                        {unrated ? "Unrated" : "Rated"}
                      </span>
                      <span className="text-xs text-neutral-500 block mt-0.5">
                        {unrated ? "No ELO change" : "Affects rating"}
                      </span>
                    </div>
                    <div className={`w-10 h-6 flex items-center rounded-full px-0.5 transition-colors duration-200 ${unrated ? "bg-white" : "bg-neutral-700"}`}>
                      <div className={`w-5 h-5 rounded-full bg-black transition-transform duration-200 shadow-sm ${unrated ? "translate-x-4" : "translate-x-0"}`} />
                    </div>
                  </button>
                </div>

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

      {showStreak && (
        <StreakModal attempts={recentAttempts} onClose={() => setShowStreak(false)} />
      )}
    </div>
  );
}
