"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { ChessBoard, PromotionDialog } from "@/components/chess/ChessBoard";
import EvalBar from "@/components/chess/EvalBar";
import { Undobutton } from "@/components/chess/EngineControls";
import GameHistory from "@/components/chess/GameHistory";
import Hints from "@/components/chess/Hints";
import MoveAnalysis from "@/components/chess/MoveAnalysis";
import {
  type AppSettings,
  SettingsPanel,
} from "@/components/chess/SettingsPanel";
import { useChessBoard } from "@/lib/hooks/useChessBoard";
import { useSaveGame } from "@/lib/hooks/useSaveGame";
import type { SessionWithProfile } from "@/types/profile";
import type { DifficultyConfig } from "./DifficultySelect";

export function PlayView({
  elo,
  difficulty,
  onBack,
}: {
  elo: number;
  difficulty: DifficultyConfig;
  onBack: () => void;
}) {
  const [boardColors, setBoardColors] = useState({
    light: "#e1e1e1",
    dark: "#8A909A",
  });
  const [animationDuration, setAnimationDuration] = useState(400);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    enableUndo: difficulty.enableUndo,
    enablePremove: true,
    autoPromoteToQueen: false,
    enableAnalysis: true,
    showEngineReaction: false,
    showBookMoves: true,
    isOverdefended: false,
    isUnderdefended: false,
    showCheckHighlights: false,
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { data: session } = useSession();
  const savedRef = useRef(false);
  const { saveGame } = useSaveGame();

  const board = useChessBoard({
    enablePremove: appSettings.enablePremove,
    autoPromoteToQueen: appSettings.autoPromoteToQueen,
    isOverdefended: appSettings.isOverdefended,
    isUnderdefended: appSettings.isUnderdefended,
    showCheckHighlights: appSettings.showCheckHighlights,
    elo,
  });

  useEffect(() => {
    if (!board.getGameState().isGameOver || savedRef.current) return;
    savedRef.current = true;

    const userElo = (session?.user as SessionWithProfile["user"])?.elo ?? 1200;
    const pgn = board.chessGame.pgn();
    saveGame({
      pgn,
      playerColor: "w",
      opponentElo: board.elo,
      eloAtTime: userElo,
      getPositionEval: board.getPositionEval,
      openingName: board.openingName,
    });
  }, [
    board.position,
    board.elo,
    board.openingName,
    board.getPositionEval,
    saveGame,
    session,
  ]);

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased selection:bg-white selection:text-black relative">
      {/* Atmospheric background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-neutral-900 via-black to-black pointer-events-none" />
      <div
        className="fixed top-0 right-0 -z-10 w-1/2 h-screen opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle at 70% 30%, rgba(255,255,255,0.1) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 flex w-full min-h-screen items-center justify-center p-4 md:p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-6 md:gap-10 w-full max-w-[1600px] animate-in fade-in duration-300">

          {/* LEFT: Board + EvalBar */}
          <div className="flex items-center gap-3 w-full max-w-[560px] shrink-0">
            {difficulty.enableEvalBar && (
              <div className="hidden md:block">
                <EvalBar evaluation={board.evaluation} mate={board.mateIn} />
              </div>
            )}
            <motion.div
              layoutId="game-board"
              className="relative rounded-2xl overflow-hidden flex-1 aspect-square bg-surface-container shadow-[0_30px_100px_rgba(0,0,0,0.5)] border border-white/5"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <PromotionDialog
                promotionMove={board.promotionMove}
                turn={board.chessGame.turn()}
                onSelect={board.onPromotionSelect}
                onClose={() => board.setPromotionMove(null)}
              />
              <ChessBoard
                position={board.currentPosition}
                squareStyles={board.squareStyles}
                onPieceDrop={board.onPieceDrop}
                onSquareClick={board.onSquareClick}
                onSquareRightClick={board.onSquareRightClick}
                arrows={board.arrows}
                canDragPieces={board.canDragPiece}
                options={{
                  darkSquareStyle: { backgroundColor: boardColors.dark },
                  lightSquareStyle: { backgroundColor: boardColors.light },
                  animationDurationInMs: animationDuration,
                  showAnimations: true,
                  id: "play-board",
                }}
              />
            </motion.div>
          </div>

          {/* RIGHT: Panel */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="flex flex-col w-full md:w-[340px] shrink-0 rounded-3xl overflow-hidden glass shadow-2xl"
          >
            {/* Header: opening + elo */}
            <div className="px-5 pt-5 pb-4 border-b border-white/5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/20">
                  {difficulty.difficulty.toUpperCase()} MODE
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/20">
                  ELO {board.elo}
                </span>
              </div>
              <MoveAnalysis
                diff={board.diff}
                mate={board.mateIn}
                openingName={board.openingName}
                bookMoves={board.bookMoves}
                showEngineReaction={false}
                showBookMoves={true}
              />
            </div>

            {/* Game history */}
            <div className="px-5 py-4 flex-1 min-h-0" style={{ maxHeight: 320 }}>
              <GameHistory game={board} />
            </div>

            {/* Controls */}
            <div className="px-5 pb-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                {appSettings.enableUndo && (
                  <Undobutton
                    canUndo={board.chessGame.history().length > 0}
                    onUndo={board.handleUndo}
                    isThinking={board.isThinking}
                  />
                )}
                {difficulty.enableHints && (
                  <Hints game={board} hintData={board.hintData} />
                )}
                <button
                  type="button"
                  className="flex-1 flex gap-2 justify-center items-center h-10 rounded-full font-semibold text-[10px] uppercase tracking-[0.2em] text-white/40 bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:text-white/60 hover:border-white/[0.1] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => setSettingsOpen(true)}
                >
                  <span className="material-symbols-outlined text-sm">settings</span>
                  <span>Settings</span>
                </button>
              </div>

              <button
                type="button"
                onClick={onBack}
                className="w-full py-3 font-semibold text-[10px] uppercase tracking-[0.2em] rounded-full bg-white/[0.06] text-white/60 border border-white/[0.06] hover:bg-white/[0.1] hover:text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-sm align-middle mr-2 -mt-0.5">refresh</span>
                NEW GAME
              </button>
            </div>
          </motion.div>

          {settingsOpen && (
            <SettingsPanel
              boardColors={boardColors}
              animationDuration={animationDuration}
              onChangeColors={setBoardColors}
              onChangeAnimation={setAnimationDuration}
              appSettings={appSettings}
              onChangeSettings={setAppSettings}
              onClose={() => setSettingsOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
