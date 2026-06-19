'use client'

import { useState, useEffect, useRef } from 'react';
import { useSession } from "next-auth/react";
import type { SessionWithProfile } from "@/types/profile";

import { useChessBoard } from '@/lib/hooks/useChessBoard';
import { useSaveGame } from '@/lib/hooks/useSaveGame';
import EvalBar from '@/components/chess/EvalBar';
import { Undobutton } from '@/components/chess/EngineControls';
import { PromotionDialog, ChessBoard } from '@/components/chess/ChessBoard';
import MoveAnalysis from '@/components/chess/MoveAnalysis';
import { SettingsPanel, type AppSettings } from '@/components/chess/SettingsPanel';
import Hints from '@/components/chess/Hints';
import GameHistory from '@/components/chess/GameHistory';
import { IoSettings } from "react-icons/io5";
import { VscDebugRestart } from "react-icons/vsc";

// Live game UI: board, eval bar, move history, settings, auto-save on game-over.
// Owns boardColors, animationDuration, appSettings (local preferences).
// useChessBoard hook wires up chess engine, interaction, and book moves.
// Side-effect: saves game to DB when isGameOver transitions (savedRef prevents re-saves).
export function PlayView({
  elo,
  onBack,
}: {
  elo: number;
  onBack: () => void;
}) {
  const [boardColors, setBoardColors] = useState({ light: '#e1e1e1', dark: '#8A909A' });
  const [animationDuration, setAnimationDuration] = useState(400);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    enableUndo: true,
    enablePremove: true,
    autoPromoteToQueen: false,
    enableAnalysis: true,
    showEngineReaction: true,
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
    enablePremove: true,
    autoPromoteToQueen: false,
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
      playerColor: 'w',
      opponentElo: board.elo,
      eloAtTime: userElo,
      getPositionEval: board.getPositionEval,
      openingName: board.openingName,
    });
  }, [board.getGameState().isGameOver, board.chessGame, board.elo, board.openingName, board.getPositionEval, saveGame, session]);

  return (
    <div className="flex w-full min-h-screen items-center justify-center p-4 md:p-8 font-sans antialiased bg-[#131313] text-[#e2e2e2]">
      <div className="flex flex-col md:flex-row items-start justify-center gap-6 md:gap-10 w-full max-w-[1200px]">
        <EvalBar evaluation={board.evaluation} mate={board.mateIn} />

        <div
          className="relative w-full max-w-[460px] shrink-0 rounded-xl bg-[#1f1f1f] border border-white/5"
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
              id: 'chess-board'
            }}
          />

          <div
            className="mx-4 mb-3 px-4 py-3 rounded-xl flex items-center justify-between bg-[#2a2a2a] border border-white/5"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#c6c6c6]">
              ELO / Strength
            </span>
            <span className="text-lg font-extralight tabular-nums tracking-tight text-white">
              {board.elo}
            </span>
          </div>

          <div className="mx-4 mb-4">
            <button
              onClick={onBack}
              className="w-full py-3 font-black text-[10px] uppercase tracking-[0.2em] rounded-full transition-all duration-300 bg-[#353535] text-white hover:bg-white hover:text-[#1a1c1c] border border-white/5"
            >
              <VscDebugRestart className="inline-block mr-2 -mt-0.5 text-sm" />
              NEW_GAME / CHANGE_ENGINE
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 w-100! md:w-64">
          <GameHistory game={board} />

          <div className='flex items-center justify-between gap-8'>
            {appSettings.enableUndo && (
              <Undobutton canUndo={board.chessGame.history().length > 0} onUndo={board.handleUndo} isThinking={board.isThinking} />
            )}
            <button
              className="flex-1 flex gap-3 justify-center items-center h-12 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 bg-[#353535] text-white hover:bg-[#2a2a2a] border border-white/5"
              onClick={() => setSettingsOpen(true)}
            >
              <IoSettings className='text-base' />
              <span>Settings</span>
            </button>
            <Hints game={board} hintData={board.hintData} />
          </div>

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

          {appSettings.enableAnalysis && (
            <MoveAnalysis
              diff={board.diff}
              mate={board.mateIn}
              openingName={board.openingName}
              bookMoves={board.bookMoves}
              showEngineReaction={appSettings.showEngineReaction}
              showBookMoves={appSettings.showBookMoves}
            />
          )}
        </div>
      </div>
    </div>
  );
}
