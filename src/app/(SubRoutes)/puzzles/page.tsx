"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { fenStringToPositionObject, PieceDropHandlerArgs } from "react-chessboard";
import { PieceSymbol, Square } from "chess.js";

import { useChessGame } from "../../Base_Logic/Base_Functions/useChessGame";
import { usePuzzle } from "./usePuzzle";
import { PromotionDialog } from "../../Base_Logic/components/BoardComponents";
import Navbar from "../../Components/ui/Navbar";
import Sidebar from "@/app/Components/ui/Sidebar";
import MinSidebar from "@/app/Components/ui/MinSidebar";
import { BsFillLightbulbFill } from "react-icons/bs";
import { SettingsPanel } from "@/app/Base_Logic/components/SettingsPanel";
import { IoSettingsOutline } from "react-icons/io5";

import { ChessPuzzle } from "@react-chess-tools/react-chess-puzzle";
import { ChessGame, mergeThemeWith, themes } from '@react-chess-tools/react-chess-game';
// ─── Small pure components ────────────────────────────────────────────────────

const myTheme = mergeThemeWith(themes.default, {
  "board": {
    "lightSquare": {
      "backgroundColor": "#ffffff"
    },
    "darkSquare": {
      "backgroundColor": "#353535"
    }
  },
  "state": {
    "lastMove": "rgba(255, 255, 0, 0.5)",
    "check": "rgba(255, 0, 0, 0.5)"
  },
  "indicators": {
    "move": "rgba(0, 0, 0, 0.1)",
    "capture": "rgba(1, 0, 0, 0.1)"
  }
});
function StatusOverlay({ status }: { status: string }) {
  if (status === "playing" || status === "idle" || status === "loading") return null;

  const configs: Record<string, { bg: string; icon: string; text: string }> = {
    correct: { bg: "bg-green-500/20 border-green-500/40", icon: "✓", text: "Correct!" },
    wrong: { bg: "bg-red-500/20 border-red-500/40", icon: "✗", text: "Wrong move" },
    solved: { bg: "bg-emerald-500/20 border-emerald-500/40", icon: "🎉", text: "Puzzle Solved!" },
  };

  const cfg = configs[status];
  if (!cfg) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
      <div className={`px-6 py-3 rounded-xl border backdrop-blur-sm ${cfg.bg} flex items-center gap-3`}>
        <span className="text-2xl">{cfg.icon}</span>
        <span className="font-bold text-white text-lg">{cfg.text}</span>
      </div>
    </div>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const THEMES = [
  "all", "mate", "fork", "opening", "middlegame", "endgame", "pin",
  "crushing", "advantage", "hangingPiece", "discoveredAttack", "sacrifice", "promotion",
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PuzzlePage() {

  const game = useChessGame();
  const puzzle = usePuzzle({ tryMove: game.makeMove, loadFen: game.loadFen });
  console.log("Full Hook State:", puzzle);

  // LOCALIZED FIX: Keep the array structure as an array, do not convert to a string template literal!
  const puzzle_ui = {
    fen: puzzle.puzzle?.fen || "undefined",
    moves: puzzle.puzzle?.moves || [], // Safe fallback to an empty array instead of "undefined" string
    makeFirstMove: true,
  };

  console.log("Cleaned UI Object:", puzzle_ui);


  const fetchAndLoadRef = useRef(puzzle.fetchAndLoad);
  useEffect(() => { fetchAndLoadRef.current = puzzle.fetchAndLoad; });

  const [isLoading, setIsLoading] = useState(false);
  const [boardOrientation, setBoardOrientation] = useState<"white" | "black">("white");
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<"normal" | "hard">("normal");
  const [selectedTheme, setSelectedTheme] = useState("all");
  const [showSettings, setShowSettings] = useState(false);

  // ── Auth check ──────────────────────────────────────────────────────────────
  // useEffect(() => {
  //   async function checkAuth() {
  //     try {
  //       const res = await fetch("/api/auth/session");
  //       const data = await res.json();
  //       if (!data?.user?.email) { router.push("/login"); return; }
  //       setIsLoading(false);
  //     } catch {
  //       router.push("/login");
  //     }
  //   }
  //   checkAuth();
  // }, [router]);

  // ── Sync board orientation to player colour ─────────────────────────────────
  useEffect(() => {
    setBoardOrientation(puzzle.playerColor === "w" ? "white" : "black");
  }, [puzzle.playerColor]);

  // ── Initial puzzle load ─────────────────────────────────────────────────────
  useEffect(() => {
    fetchAndLoadRef.current({});
  }, []);

  // ── Derived values ──────────────────────────────────────────────────────────
  const position = fenStringToPositionObject(game.position, 8, 8);
  const history = game.chessGame.history()

  const totalPlayerMoves = puzzle.puzzle ? Math.ceil((puzzle.puzzle.moves.length - 1) / 2) : 0;
  const currentPlayerMove = puzzle.puzzle ? Math.floor((puzzle.moveIndex - 1) / 2) : 0;

  // ── Square styles ───────────────────────────────────────────────────────────
  const squareStyles: Record<string, React.CSSProperties> = { ...game.optionSquares };

  if (selectedSquare)
    squareStyles[selectedSquare] = { backgroundColor: "rgba(200,200,200,0.6)" };

  if (puzzle.hintSquares) {
    squareStyles[puzzle.hintSquares.from] = { backgroundColor: "rgba(59,130,246,0.5)" };
    squareStyles[puzzle.hintSquares.to] = { backgroundColor: "rgba(59,130,246,0.45)" };
  }

  if (puzzle.status === "wrong") {
    (game.chessGame.board().flat().filter(Boolean) as any[]).forEach((sq: any) => {
      if (!squareStyles[sq.square])
        squareStyles[sq.square] = { backgroundColor: "rgba(239,68,68,0.08)" };
    });
  }

  // ── Handlers ────────────────────────────────────────────────────────────────
  // const onPieceDrop = ({ sourceSquare, targetSquare, piece }: PieceDropHandlerArgs) => {
  //   if (!targetSquare || sourceSquare === targetSquare) return false;
  //   if (puzzle.status !== "playing") return false;

  //   const from = sourceSquare as Square;
  //   const to = targetSquare as Square;

  //   const isLegal = game.chessGame.moves({ square: from, verbose: true }).some(m => m.to === to);
  //   if (!isLegal) return false;

  //   const pieceStr = typeof piece === "string" ? piece : (piece as any)?.pieceType ?? "";
  //   const isPawn = pieceStr[1]?.toLowerCase() === "p";
  //   const promoRank = puzzle.playerColor === "w" ? "8" : "1";

  //   setSelectedSquare(null);
  //   game.setOptionSquares({});

  //   if (isPawn && to[1] === promoRank) {
  //     const expected = puzzle.puzzle?.moves[puzzle.moveIndex];
  //     const promo = (expected?.length ?? 0) > 4 ? (expected![4] as PieceSymbol) : "q";
  //     return puzzle.handlePlayerMove(from, to, promo as PieceSymbol);
  //   }

  //   return puzzle.handlePlayerMove(from, to);
  // };

  // const handleSquareClick = useCallback((args: any) => {
  //   const { square } = args;

  //   if (puzzle.status !== "playing") {
  //     setSelectedSquare(null);
  //     game.setOptionSquares({});
  //     return;
  //   }

  //   // Nothing selected yet — select this piece if it belongs to the player
  //   if (!selectedSquare) {
  //     const p = game.chessGame.get(square as Square);
  //     if (p && p.color === puzzle.playerColor) {
  //       setSelectedSquare(square);
  //       const styles: Record<string, React.CSSProperties> = {};
  //       game.chessGame.moves({ square: square as Square, verbose: true }).forEach(m => {
  //         styles[m.to] = {
  //           background: game.chessGame.get(m.to as Square)
  //             ? "radial-gradient(circle, rgba(0,0,0,.15) 85%, transparent 85%)"
  //             : "radial-gradient(circle, rgba(200,200,200,.25) 30%, transparent 30%)",
  //           borderRadius: "50%",
  //         };
  //       });
  //       styles[square] = { backgroundColor: "rgba(255,255,0,0.4)" };
  //       game.setOptionSquares(styles);
  //     }
  //     return;
  //   }

  //   // Clicked same square — deselect
  //   if (selectedSquare === square) {
  //     setSelectedSquare(null);
  //     game.setOptionSquares({});
  //     return;
  //   }

  //   const from = selectedSquare as Square;
  //   const to = square as Square;
  //   const targetPiece = game.chessGame.get(to);

  //   // Clicked another own piece — reselect
  //   if (targetPiece && targetPiece.color === puzzle.playerColor) {
  //     setSelectedSquare(to);
  //     const styles: Record<string, React.CSSProperties> = {};
  //     game.chessGame.moves({ square: to as Square, verbose: true }).forEach(m => {
  //       styles[m.to] = {
  //         background: game.chessGame.get(m.to as Square)
  //           ? "radial-gradient(circle, rgba(0,0,0,.15) 85%, transparent 85%)"
  //           : "radial-gradient(circle, rgba(255,255,255,.25) 30%, transparent 30%)",
  //         borderRadius: "50%",
  //       };
  //     });
  //     styles[to] = { backgroundColor: "rgba(255,255,0,0.4)" };
  //     game.setOptionSquares(styles);
  //     return;
  //   }

  //   // Illegal move — deselect
  //   const isLegal = game.chessGame.moves({ square: from, verbose: true }).some(m => m.to === to);
  //   if (!isLegal) {
  //     setSelectedSquare(null);
  //     game.setOptionSquares({});
  //     return;
  //   }

  //   // Promotion
  //   const movingPiece = game.chessGame.get(from);
  //   const promoRank = puzzle.playerColor === "w" ? "8" : "1";
  //   if (movingPiece?.type === "p" && to[1] === promoRank) {
  //     const expected = puzzle.puzzle?.moves[puzzle.moveIndex];
  //     const promo = (expected?.length ?? 0) > 4 ? (expected![4] as PieceSymbol) : "q";
  //     puzzle.handlePlayerMove(from, to, promo as PieceSymbol);
  //     setSelectedSquare(null);
  //     game.setOptionSquares({});
  //     return;
  //   }

  //   puzzle.handlePlayerMove(from, to);
  //   setSelectedSquare(null);
  //   game.setOptionSquares({});
  // }, [selectedSquare, puzzle.status, puzzle.playerColor, puzzle.moveIndex, puzzle.puzzle, game]);

  // const onPromotionSelect = (piece: PieceSymbol) => {
  //   if (!game.promotionMove) return;
  //   game.tryMove(game.promotionMove.sourceSquare, game.promotionMove.targetSquare, piece);
  //   game.setPromotionMove(null);
  // };

  const loadNextPuzzle = () =>
    puzzle.fetchAndLoad({ theme: selectedTheme, hard: difficulty === "hard" });

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased selection:bg-white selection:text-black flex flex-col items-center justify-center p-4 lg:p-8 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-neutral-900 via-black to-black pointer-events-none" />

      {/* Loading overlay */}
      {(isLoading || puzzle.status === "loading") && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-neutral-700 border-t-white rounded-full animate-spin" />
            <span className="text-neutral-500 text-sm font-medium tracking-wide">
              {isLoading ? "Checking session…" : "Loading puzzle…"}
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col xl:flex-row items-start justify-center gap-5 w-full max-w-[1600px] relative z-10">
        <Navbar />
        <Sidebar />
        <MinSidebar />
        {puzzle_ui?.fen && puzzle_ui?.moves?.length > 0 ? (
          <ChessPuzzle.Root puzzle={puzzle_ui} theme={myTheme}>


            {/* ── Board column ── */}
            <section className="flex gap-30 mt-[70px]  flex-col items-center-safe justify-center w-full h-full xl:flex-row">
              <div className="flex flex-col  gap-3 shrink-0">

                {/* Puzzle info bar — rating, turn, move counter only */}


                {/* Board */}
                <div className="relative p-[3px] bg-neutral-800 rounded-lg ring-1  ring-white/4">
                  <div className=" relative w-[600px] h-[600px] bg-neutral-900 rounded-md overflow-hidden">
                    <StatusOverlay status={puzzle.status} />

                    {/* {game.promotionMove && (
                  <PromotionDialog
                    promotionMove={game.promotionMove}
                    turn={game.chessGame.turn()}
                    onSelect={onPromotionSelect}
                    onClose={() => game.setPromotionMove(null)}
                  />
                )} */}

                    {/* {<BoardComponent
                position={position}
                squareStyles={squareStyles}
                onPieceDrop={onPieceDrop}
                onSquareClick={handleSquareClick}
                onSquareRightClick={() => { setSelectedSquare(null); game.setOptionSquares({}); }}
                arrows={[]}
                canDragPieces={() => true}
                options={{
                  darkSquareStyle: { backgroundColor: "rgb(64,64,64)" },
                  lightSquareStyle: { backgroundColor: "white" },
                  animationDurationInMs: 400,
                  showAnimations: true,
                  id: "chess-board",
                  boardOrientation,
                }}
              />} */}



                    <ChessPuzzle.Board options={{
                      animationDurationInMs: 1000, // try 400–600 for a natural feel
                    }} />
                    <ChessPuzzle.Reset>Retry</ChessPuzzle.Reset>




                  </div>
                </div>


                {/* Below-board status */}
                <div className="w-[520px] flex items-center justify-between h-15 ">
                  <div className="flex items-center gap-2.5 h-full">


                    <div className="w-[520px] bg-neutral-900/80 border border-white/6 rounded-xl px-10 py-4 flex items-center justify-between backdrop-blur-sm">
                      <div className="text-left flex gap-4 items-center justify-center ">
                        <BsFillLightbulbFill /> <span className="flex items-center text-[14px] justify-center font-medium">Find the best move for <span> &nbsp;{puzzle.playerColor === "w" ? "White." : "Black."}</span></span>
                      </div>

                      <div className="text-right flex items-center justify-center ">
                        <div className="h-4.5 w-0.25 bg-neutral-700 mr-7"></div>
                        {puzzle.puzzle && puzzle.status === "playing" && (
                          <span className="text-neutral-500 text-[11px] font-mono whitespace-nowrap">
                            Move <span className="text-white font-semibold">{currentPlayerMove + 1}</span> / {totalPlayerMoves}
                          </span>
                        )}
                        {puzzle.status === "solved" && (
                          <span className="text-white text-xs font-semibold whitespace-nowrap flex items-center gap-1.5">
                            <span className="w-1 h-1 bg-white rounded-full" /> Solved
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                  <div className="min-w-[80px] text-right text-xs font-medium">
                    {puzzle.status === "wrong" && <span className="text-neutral-400">✗ Incorrect</span>}
                    {puzzle.status === "correct" && <span className="text-white">✓ Correct</span>}
                  </div>
                </div>

              </div>

              {/* ── Sidebar ── */}
              <div className="w-full xl:max-w-[400px] flex flex-col max-h-[880px] overflow-hidden backdrop-blur-xl shrink-0">

                {/* Header — ELO prominent */}
                <section className="flex gap-4 mb-20">

                  <div className="p-8 rounded-3xl border border-white/15 shadow-xl glass">
                    <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-2">Current Rating</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-white tracking-tighter">{"2,482"}</span>
                      <span className="text-sm font-bold text-green-400">+12</span>
                    </div>

                  </div>

                  <div className="p-8 rounded-3xl border border-white/15 shadow-xl glass">
                    <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-2">Accuracy</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-white tracking-tighter">94%</span>
                      <span className="material-symbols-outlined text-[18px] text-primary">trending_up</span>
                    </div></div>

                </section>

                {/* Board controls */}
                <div className="flex flex-col rounded-3xl overflow-hidden border border-white/5 shadow-2xl h-[400px] xl:h-[450px] glass">

                  {/* Header */}
                  <div className="bg-surface-container-highest/50 px-8 py-5 flex justify-between items-center border-b border-white/5">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Notation</span>
                    <div className="flex items-center gap-1">
                      {/* Flip Board */}
                      <button
                        type="button"
                        title="Flip Board"
                        onClick={() => setBoardOrientation(o => o === "white" ? "black" : "white")}
                        className="p-2 text-neutral-400 hover:text-white transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </button>
                      {/* Reset */}
                      <button
                        type="button"
                        title="Settings"
                        onClick={() => { setShowSettings(true); }}
                        disabled={history.length === 0}
                        className="p-2 text-white transition disabled:opacity-20 font-semibold text-xl hover:rotate-180 hover:cursor-pointer hover:scale-105 duration-300"
                      >
                        <IoSettingsOutline />
                      </button>

                    </div>
                  </div>

                  {/* Move history */}
                  <div className="flex-1 p-8 overflow-y-auto space-y-4 font-mono text-sm scrollbar-hide">
                    {history.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full gap-2 text-neutral-700">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span className="text-[11px]">Waiting for puzzle</span>
                      </div>
                    ) : (
                      history.reduce((pairs: string[][], move, i) => {
                        if (i % 2 === 0) pairs.push([move]);
                        else pairs[pairs.length - 1].push(move);
                        return pairs;
                      }, []).map((pair, i) => (
                        <div key={i} className="flex items-center gap-6 py-2 border-b border-white/5">
                          <span className="w-6 text-neutral-500 font-bold">{i + 1}.</span>
                          <span className="flex-1">{pair[0]}</span>
                          <span className="flex-1 text-right text-neutral-500">{pair[1] ?? "..."}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Footer */}
                  {/* Solved footer */}
                  {puzzle.status === "solved" ? (
                    <div className="p-5 border-t border-white/5 text-center">
                      <div className="text-sm font-semibold text-white mb-0.5">Puzzle Solved</div>
                      <div className="text-xs text-neutral-500 mb-4">
                        Puzzle rating: <span className="text-white font-semibold">{puzzle.puzzle?.rating}</span>
                      </div>
                      <button type="button" onClick={loadNextPuzzle}
                        className="w-full py-3 bg-white text-black rounded-lg text-sm font-semibold hover:bg-neutral-200 transition-all active:scale-[0.99]">
                        Next Puzzle →
                      </button>
                    </div>
                  ) : (<div className="p-6 bg-surface-container-lowest/50 grid grid-cols-2 gap-4 border-t border-white/5">
                    <ChessPuzzle.Hint asChild>
                      <button disabled={puzzle.status !== "playing"} className="...">
                        <span className="material-symbols-outlined">lightbulb</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Hint</span>
                      </button>
                    </ChessPuzzle.Hint>

                    <button className="bg-white/5 hover:bg-white/10 transition-all py-4 rounded-2xl flex flex-col items-center gap-2 group active:scale-95 premium-hover">
                      <span className="material-symbols-outlined group-hover:text-error transition-colors">visibility</span>
                      <span className="text-[10px] font-black uppercase tracking-widest">Solution</span>
                    </button>
                  </div>)}


                </div>

                <div className="bg-surface-container-low p-8 rounded-3xl border border-white/5 flex items-center gap-8 relative overflow-hidden group shadow-xl">
                  <div className="flex-1 z-10">
                    <h3 className="text-sm font-black text-white mb-2 uppercase tracking-wide">Tactical Motif</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">Discovering a check while attacking the Queen. Advanced Difficulty level.</p>
                  </div>
                  <div className="w-20 h-20 opacity-5 absolute -right-2  pointer-events-none group-hover:scale-110 transition-transform duration-700">
                    <span className="material-symbols-outlined scale-600">psychology</span>
                  </div>
                </div>
                {/* Controls footer */}
                {showSettings && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/60"
                    onClick={() => setShowSettings(false)}
                  >
                    <div
                      className="relative w-[320px] bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl"
                      onClick={e => e.stopPropagation()}
                    >
                      {/* Close button */}
                      <button
                        onClick={() => setShowSettings(false)}
                        className="absolute top-3 right-3 p-1.5 text-neutral-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>

                      {/* Your existing controls */}

                      <div className="p-4 border-t border-white/5 space-y-4">

                        {/* Difficulty */}
                        <div>
                          <span className="text-[9px] uppercase tracking-[0.18em] text-neutral-600 font-semibold block mb-2">Difficulty</span>
                          <div className="flex gap-1.5 bg-white/4 rounded-xl p-[3px]">
                            {(["normal", "hard"] as const).map(d => (
                              <button key={d} type="button"
                                onClick={() => setDifficulty(d)}
                                className={`flex-1 py-1.5 rounded-[7px] text-[11px] font-medium transition-all capitalize tracking-wide ${difficulty === d
                                  ? "bg-white text-black"
                                  : "text-neutral-600 hover:bg-white/7 hover:text-white"
                                  }`}>
                                {d}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="h-px bg-white/5" />

                        {/* Theme */}
                        <div>
                          <span className="text-[9px] uppercase tracking-[0.18em] text-neutral-600 font-semibold block mb-2">Theme</span>
                          <div className="relative">
                            <select
                              value={selectedTheme}
                              onChange={e => setSelectedTheme(e.target.value)}
                              className="w-full bg-white/4 border border-white/8 text-white text-[12px] rounded-lg px-3 py-2.5 appearance-none cursor-pointer focus:outline-none focus:border-white/20 hover:bg-white/[0.07] transition-all"
                            >
                              {THEMES.map(t => (
                                <option key={t} value={t} className="bg-neutral-900 text-white">
                                  {t === "all" ? "All themes" : t.replace(/([A-Z])/g, " $1")}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-0 h-0 border-l-4 border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-neutral-600" />
                          </div>
                        </div>

                        <div className="h-px bg-white/5" />

                        {/* Next */}
                        <ChessPuzzle.Reset
                          onReset={loadNextPuzzle}
                          asChild
                        >
                          <button type="button" onClick={loadNextPuzzle}
                            className="w-full py-2.5 bg-white text-black rounded-[9px] text-[12px] font-semibold hover:bg-neutral-200 transition-all active:scale-[0.99]">
                            Next puzzle
                          </button>
                        </ChessPuzzle.Reset>

                        {/* Copy FEN */}
                        <button type="button"
                          onClick={async () => { try { await navigator.clipboard.writeText(game.position); } catch { } }}
                          className="w-full py-1.5 text-[11px] font-medium rounded-lg text-neutral-600 hover:text-white hover:bg-white/5 transition-all">
                          Copy FEN
                        </button>

                      </div>

                    </div>
                  </div>

                )}
              </div>
            </section>
          </ChessPuzzle.Root>
        ) : (
          <div className="p-4 text-center">Loading puzzle...</div>
        )}
      </div>
    </div>
  );

}