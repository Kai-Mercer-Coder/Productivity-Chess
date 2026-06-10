"use client";

import type { Square } from "chess.js";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PieceDropHandlerArgs } from "react-chessboard";
import { Chessboard } from "react-chessboard";
import { useSession } from "next-auth/react";
import MobileNavbar from "@/components/layouts/MobileNavbar";
import Navbar from "@/components/layouts/Navbar";
import Sidebar from "@/components/layouts/Sidebar";
import { useChessGame } from "@/lib/hooks/useChessGame";
import { preloadShardsForElo } from "@/lib/puzzles/PuzzleShards";
import { usePuzzle } from "@/lib/puzzles/usePuzzle";
import {
  PuzzleInfoBar,
  PuzzleMoveHistory,
  PuzzleSettingsModal,
  PuzzleSolvedFooter,
  StatusOverlay,
} from "./components";

export default function PuzzlePage() {
  const game = useChessGame();
  const puzzle = usePuzzle({ tryMove: game.makeMove, loadFen: game.loadFen });
  const { data: session, update } = useSession();

  const [difficulty, setDifficulty] = useState<"normal" | "hard">("normal");
  const [selectedTheme, setSelectedTheme] = useState("all");
  const [showSettings, setShowSettings] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [userElo, setUserElo] = useState(1200);
  const submittedRef = useRef(false);

  const fetchAndLoadRef = useRef(puzzle.fetchAndLoad);
  useEffect(() => {
    fetchAndLoadRef.current = puzzle.fetchAndLoad;
  });

  useEffect(() => {
    fetchAndLoadRef.current({ userElo });
  }, []);

  useEffect(() => {
    if (session?.user) {
      const elo = (session.user as any)?.elo;
      if (elo) setUserElo(elo);
    }
  }, [session]);

  useEffect(() => {
    if (puzzle.status !== "solved" || !puzzle.puzzle) return;
    if (submittedRef.current) return;
    submittedRef.current = true;
    fetch("/api/updateStats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        solved: true,
        puzzleRating: puzzle.puzzle.rating,
        usedHint: puzzle.usedHint,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.newElo) setUserElo(data.newElo);
        update({
          elo: data.newElo,
          delta_value: data.newDelta,
          volatility: data.newVol,
          puzzles_solved: data.puzzlesSolved,
        });
      })
      .catch(() => {});
  }, [puzzle.status, puzzle.puzzle]);

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

  const history = game.chessGame.history();

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
    preloadShardsForElo(userElo, 3);
    puzzle.fetchAndLoad({ theme: selectedTheme, hard: difficulty === "hard", userElo });
  };

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

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased selection:bg-white selection:text-black flex flex-col items-center justify-center p-4 lg:p-8 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-neutral-900 via-black to-black pointer-events-none" />

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

      <div className="flex flex-col xl:flex-row items-start justify-center gap-5 w-full max-w-[1600px] relative z-10">
        <Navbar />
        <Sidebar />
        <MobileNavbar />

        {puzzle.puzzle ? (
          <section className="flex gap-30 mt-[70px] flex-col items-center-safe justify-center w-full h-full xl:flex-row">
            <div className="flex flex-col gap-3 shrink-0">
              <div className="relative p-[3px] bg-neutral-800 rounded-lg ring-1 ring-white/4">
                <div className="relative w-[600px] h-[600px] bg-neutral-900 rounded-md overflow-hidden">
                  <StatusOverlay status={puzzle.status} />
                  <Chessboard
                    options={{
                      id: "puzzle-board",
                      position: game.position,
                      onPieceDrop: handlePieceDrop,
                      boardOrientation:
                        puzzle.playerColor === "b" ? "black" : "white",
                      allowDragging: puzzle.status === "playing",
                      darkSquareStyle: { backgroundColor: "#353535" },
                      lightSquareStyle: { backgroundColor: "#ffffff" },
                      animationDurationInMs: 400,
                      showAnimations: true,
                      squareStyles,
                    }}
                  />
                </div>
              </div>

              <PuzzleInfoBar
                playerColor={puzzle.playerColor}
                status={puzzle.status}
                currentPlayerMove={currentPlayerMove}
                totalPlayerMoves={totalPlayerMoves}
              />
            </div>

            <div className="w-full xl:max-w-[400px] flex flex-col max-h-[880px] overflow-hidden backdrop-blur-xl shrink-0">
              <section className="flex gap-4 mb-20">
                <div className="p-8 rounded-3xl border border-white/15 shadow-xl glass">
                  <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-2">
                    Rating
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white tracking-tighter">
                      {puzzle.puzzle.rating.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="p-8 rounded-3xl border border-white/15 shadow-xl glass">
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
              </section>

              <PuzzleMoveHistory
                history={history}
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
                <div className="p-6 bg-surface-container-lowest/50 grid grid-cols-2 gap-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={puzzle.getHint}
                    disabled={puzzle.status !== "playing"}
                    className="bg-white/5 hover:bg-white/10 transition-all py-4 rounded-2xl flex flex-col items-center gap-2 group active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
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
                    className="bg-white/5 hover:bg-white/10 transition-all py-4 rounded-2xl flex flex-col items-center gap-2 group active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
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
            </div>
          </section>
        ) : (
          <div className="p-4 text-center text-neutral-500 mt-40">
            No puzzle loaded
          </div>
        )}
      </div>
    </div>
  );
}
