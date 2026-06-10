"use client";

import { useState, useCallback } from "react";
import { Chess } from "chess.js";
import type { PieceDropHandlerArgs } from "react-chessboard";
import { useChessGame } from "@/lib/hooks/useChessGame";
import { useGameReview } from "@/lib/hooks/useGameReview";
import Sidebar from "@/components/layouts/Sidebar";
import MobileNavbar from "@/components/layouts/MobileNavbar";
import ModeSelector from "./components/ModeSelector";
import AnalysisView from "./components/AnalysisView";
import GameReviewView from "./components/GameReviewView";

type AnalysisMode = "pgn" | "fen" | "blank";
type ViewMode = "analysis" | "review";

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
      <MobileNavbar />

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
