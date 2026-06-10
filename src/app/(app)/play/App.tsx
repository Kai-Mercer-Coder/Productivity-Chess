'use client'

import { useState } from 'react';

import { useChessBoard } from '@/lib/hooks/useChessBoard';
import EvalBar from '@/components/chess/EvalBar';
import EngineControls, { Undobutton } from '@/components/chess/EngineControls';
import { PromotionDialog, ChessBoard } from '@/components/chess/ChessBoard';
import MoveAnalysis from '@/components/chess/MoveAnalysis';
import { SettingsPanel, type AppSettings } from '@/components/chess/SettingsPanel';
import Hints from '@/components/chess/Hints';
import GameHistory from '@/components/chess/GameHistory';
import { IoSettings } from "react-icons/io5";

export default function App() {
  const board = useChessBoard({
    enablePremove: true,
    autoPromoteToQueen: false,
    isPinned: false,
    isOverdefended: false,
    isUnderdefended: false,
    isVulnerable: false,
    showCheckHighlights: false,
    showForks: false,
  });

  const [boardColors, setBoardColors] = useState({ light: 'white', dark: 'rgb(64,64,64)' });
  const [animationDuration, setAnimationDuration] = useState(400);
  const [appSettings, setAppSettings] = useState<AppSettings>({
    enableUndo: true,
    enablePremove: true,
    autoPromoteToQueen: false,
    enableAnalysis: true,
    showEngineReaction: true,
    showBookMoves: true,
    isPinned: false,
    isOverdefended: false,
    isUnderdefended: false,
    isVulnerable: false,
    showCheckHighlights: false,
    showForks: false,
  });
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="flex w-screen min-h-screen items-center justify-center bg-black p-4 md:p-8 font-sans antialiased text-white">
      <div className="flex flex-col md:flex-row items-start justify-center gap-6 md:gap-10 w-full max-w-[1200px]">
        <EvalBar evaluation={board.evaluation} mate={board.mateIn} />

        <div className="relative w-full max-w-[460px] shrink-0 border-2 border-neutral-900 rounded shadow-2xl">
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

          <EngineControls
            elo={board.elo}
            isThinking={board.isThinking}
            onEloChange={board.handleEloChange}
          />
        </div>

        <div className="flex flex-col gap-2 w-100! md:w-64">
          <GameHistory game={board} />

          <div className='flex items-center justify-between gap-12'>
            {appSettings.enableUndo && (
              <Undobutton canUndo={board.chessGame.history().length > 0} onUndo={board.handleUndo} isThinking={board.isThinking} />
            )}
            <button
              className="w-63! flex gap-4 justify-center items-center h-12 bg-zinc-900! text-white rounded-full z-50"
              onClick={() => setSettingsOpen(true)}
            >
              <IoSettings className='text-xl' />Settings
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