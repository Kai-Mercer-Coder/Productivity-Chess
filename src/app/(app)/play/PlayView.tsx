"use client";

import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { ChessBoard, PromotionDialog } from "@/components/chess/ChessBoard";
import { Undobutton } from "@/components/chess/EngineControls";
import EvalBar from "@/components/chess/EvalBar";
import GameHistory from "@/components/chess/GameHistory";
import Hints from "@/components/chess/Hints";
import MoveAnalysis from "@/components/chess/MoveAnalysis";
import {
  type AppSettings,
  SettingsPanel,
} from "@/components/chess/SettingsPanel";
import { useChessBoard } from "@/lib/hooks/useChessBoard";
import { useSaveGame } from "@/lib/hooks/useSaveGame";
import { setSoundsEnabled } from "@/lib/chess/sounds";
import type { SessionWithProfile } from "@/types/profile";
import type { DifficultyConfig } from "./DifficultySelect";

const SETTINGS_KEY = "play-settings";

const DEFAULT_COLORS = { light: "#e1e1e1", dark: "#8A909A" };

function defaultAppSettings(difficulty: DifficultyConfig): AppSettings {
  return {
    enableUndo: difficulty.enableUndo,
    enablePremove: true,
    autoPromoteToQueen: false,
    showNotation: true,
    soundEnabled: true,
    isOverdefended: false,
    isUnderdefended: false,
    showCheckHighlights: false,
  };
}

interface PersistedSettings {
  boardColors: { light: string; dark: string };
  animationDuration: number;
  appSettings: AppSettings;
}

function loadPersistedSettings(difficulty: DifficultyConfig): PersistedSettings | null {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedSettings>;
    return {
      boardColors: { ...DEFAULT_COLORS, ...(parsed.boardColors ?? {}) },
      animationDuration:
        typeof parsed.animationDuration === "number" ? parsed.animationDuration : 400,
      appSettings: {
        ...defaultAppSettings(difficulty),
        ...(parsed.appSettings ?? {}),
      },
    };
  } catch {
    return null;
  }
}

export function PlayView({
  elo,
  difficulty,
  onBack,
}: {
  elo: number;
  difficulty: DifficultyConfig;
  onBack: () => void;
}) {
  const [persisted] = useState(() => loadPersistedSettings(difficulty));
  const [boardColors, setBoardColors] = useState(
    persisted?.boardColors ?? DEFAULT_COLORS,
  );
  const [animationDuration, setAnimationDuration] = useState(
    persisted?.animationDuration ?? 400,
  );
  const [appSettings, setAppSettings] = useState<AppSettings>(
    persisted?.appSettings ?? defaultAppSettings(difficulty),
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { data: session } = useSession();
  const savedRef = useRef(false);
  const { saveGame } = useSaveGame();

  useEffect(() => {
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({ boardColors, animationDuration, appSettings }),
      );
    } catch {}
  }, [boardColors, animationDuration, appSettings]);

  useEffect(() => {
    setSoundsEnabled(appSettings.soundEnabled);
  }, [appSettings.soundEnabled]);

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

      <main>
        <div className="relative z-10 w-full px-4 lg:px-8 pt-8 pb-24 max-w-[1600px] mx-auto">
          {/* Header */}
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-white">
                Play <span className="text-primary/40">{difficulty.difficulty}</span>
              </h1>
              <p className="text-on-surface-variant/60 font-medium text-sm tracking-wide uppercase mt-1">
                vs Stockfish · ELO {board.elo}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-primary/60 uppercase tracking-widest">Mode</span>
                <span className="text-white font-bold">{difficulty.difficulty}</span>
              </div>
              <button
                type="button"
                onClick={onBack}
                className="w-12 h-12 rounded-full border-2 border-white/10 flex items-center justify-center hover:border-white/30 transition-all text-neutral-400 hover:text-white"
                aria-label="Exit game"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
            {/* LEFT: Board + EvalBar */}
            <section className="lg:col-span-7 xl:col-span-8 flex flex-col items-center w-full">
              <div className="flex items-stretch gap-3 w-full max-w-[680px]">
                {difficulty.enableEvalBar && (
                  <div className="hidden md:flex shrink-0">
                    <EvalBar evaluation={board.evaluation} mate={board.mateIn} />
                  </div>
                )}
                <motion.div
                  layoutId="game-board"
                  className="relative flex-1 aspect-square bg-surface-container rounded-[2rem] overflow-hidden border border-white/5 shadow-[0_30px_100px_rgba(0,0,0,0.5)]"
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
                      showNotation: appSettings.showNotation,
                      id: "play-board",
                    }}
                  />
                </motion.div>
              </div>
            </section>

            {/* RIGHT: Panel */}
            <aside className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 w-full max-w-[500px] mx-auto lg:mx-0">
              {/* Status card */}
              <div className="p-6 rounded-3xl border border-white/5 shadow-xl glass relative">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                    {difficulty.difficulty} Mode
                  </span>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
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
              <div className="bg-surface-container rounded-2xl flex flex-col flex-1 min-h-[320px] max-h-[440px] shadow-xl overflow-hidden border border-white/5">
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-surface-container-high/30">
                  <span className="text-xs font-black uppercase tracking-widest text-white">
                    Move History
                  </span>
                  <span className="text-[10px] font-bold text-on-surface-variant bg-white/5 px-2 py-1 rounded">
                    {board.chessGame.history().length} PLY
                  </span>
                </div>
                <div className="flex-1 min-h-0 flex flex-col">
                  <GameHistory game={board} />
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
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
                  <div className="flex-1" />
                  <button
                    type="button"
                    onClick={() => setSettingsOpen(true)}
                    className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all flex items-center justify-center active:scale-95"
                    aria-label="Settings"
                  >
                    <span className="material-symbols-outlined">settings</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onBack}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95 border border-white/5"
                >
                  <span className="material-symbols-outlined text-lg">refresh</span>
                  New Game
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>

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
  );
}
