'use client'

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSession } from "next-auth/react";

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

type View = 'select' | 'play';

const ENGINES = [
  { proto: 'PROTOTYPE_01', name: 'MONOLITH_01', elo: 800, desc: 'BASICS / SCHOLAR', unlockAt: 0 },
  { proto: 'STRATEGY_NODE', name: 'CORE_STRATEGY', elo: 1200, desc: 'POSITIONAL / STEADY', unlockAt: 1000 },
  { proto: 'AGGRESSIVE_CORE', name: 'STRATEGIST_S', elo: 1600, desc: 'TACTICAL / SHARP', unlockAt: 1400 },
  { proto: 'ELITE_LOGIC', name: 'NEURAL_ELITE', elo: 2000, desc: 'MASTER / CALIBRATED', unlockAt: 1800 },
  { proto: 'CALC_UNIT_09', name: 'DEEP_CALCULATION', elo: 2400, desc: 'THEORETICAL / PEAK', unlockAt: 2200 },
  { proto: 'MONOLITH_ULTRA', name: 'GRANDMASTER_ENGINE', elo: 2800, desc: 'OPTIMAL / UNBEATABLE', unlockAt: 2600 },
];

const DIFFICULTY_TIERS = [
  { max: 800, label: 'NOVICE_PROFILE' },
  { max: 1200, label: 'SCHOLAR_PROFILE' },
  { max: 1600, label: 'EXPERT_PROFILE' },
  { max: 2000, label: 'CANDIDATE_PROFILE' },
  { max: 2400, label: 'MASTER_PROFILE' },
  { max: 2800, label: 'GRANDMASTER_PROFILE' },
  { max: 3200, label: 'MONOLITH_ENTITY' },
];

function PlayView({
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

    const userElo = (session?.user as any)?.elo ?? 1200;
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
    <div className="flex w-full min-h-screen items-center justify-center p-4 md:p-8 font-sans antialiased" style={{ backgroundColor: '#131313', color: '#e2e2e2' }}>
      <div className="flex flex-col md:flex-row items-start justify-center gap-6 md:gap-10 w-full max-w-[1200px]">
        <EvalBar evaluation={board.evaluation} mate={board.mateIn} />

        <div
          className="relative w-full max-w-[460px] shrink-0 rounded-xl"
          style={{ backgroundColor: '#1f1f1f', border: '1px solid rgba(255,255,255,0.05)' }}
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
            className="mx-4 mb-3 px-4 py-3 rounded-xl flex items-center justify-between"
            style={{ backgroundColor: '#2a2a2a', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#c6c6c6' }}>
              ELO / Strength
            </span>
            <span className="text-lg font-extralight tabular-nums tracking-tight" style={{ color: '#ffffff' }}>
              {board.elo}
            </span>
          </div>

          <div className="mx-4 mb-4">
            <button
              onClick={onBack}
              className="w-full py-3 font-black text-[10px] uppercase tracking-[0.2em] rounded-full transition-all duration-300"
              style={{
                backgroundColor: '#353535',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = '#1a1c1c';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#353535';
                e.currentTarget.style.color = '#ffffff';
              }}
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
              className="flex-1 flex gap-3 justify-center items-center h-12 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300"
              style={{
                backgroundColor: '#353535',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.05)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2a2a2a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#353535';
              }}
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

export default function App() {
  const { data: session } = useSession();
  const playerElo = (session?.user as any)?.elo ?? 0;
  const [view, setView] = useState<View>('select');
  const [selectedElo, setSelectedElo] = useState(1350);
  const [customElo, setCustomElo] = useState(2100);

  const startGame = useCallback((elo: number) => {
    setSelectedElo(elo);
    setView('play');
  }, []);

  const customTier = DIFFICULTY_TIERS.find(t => customElo <= t.max) ?? DIFFICULTY_TIERS[DIFFICULTY_TIERS.length - 1];

  if (view === 'play') {
    return <PlayView elo={selectedElo} onBack={() => setView('select')} />;
  }

  return (
    <div className="flex min-h-screen font-sans antialiased" style={{ backgroundColor: '#131313', color: '#e2e2e2' }}>
      <main className="flex-1 pt-12 pb-24">
        <header className="max-w-6xl mx-auto mb-16 px-6">
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-none mb-6" style={{ color: '#ffffff' }}>
            SELECT_ENTITY
          </h2>
          <p className="text-lg max-w-2xl font-light leading-relaxed" style={{ color: '#c6c6c6' }}>
            Calibrate your training session by selecting a specific neural profile. Each engine operates on distinct heuristics to simulate authentic grandmaster intuition.
          </p>
        </header>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-6">
          {ENGINES.map((engine) => {
            const locked = playerElo < engine.unlockAt;
            return (
              <button
                key={engine.name}
                onClick={() => !locked && startGame(engine.elo)}
                className={`relative group h-64 rounded-xl p-8 flex flex-col text-left transition-all duration-300 ${locked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                style={{
                  backgroundColor: locked ? '#0e0e0e' : '#1f1f1f',
                  border: locked ? '1px dashed rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.05)',
                  opacity: locked ? 0.45 : 1,
                }}
                onMouseEnter={(e) => {
                  if (locked) return;
                  e.currentTarget.style.backgroundColor = '#2a2a2a';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                }}
                onMouseLeave={(e) => {
                  if (locked) return;
                  e.currentTarget.style.backgroundColor = '#1f1f1f';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                }}
              >
                {locked && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-8 h-8 opacity-30" style={{ color: '#c6c6c6' }} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                      </svg>
                      <span className="text-[8px] font-black tracking-[0.2em] uppercase opacity-40" style={{ color: '#c6c6c6' }}>
                        UNLOCK_AT_{engine.unlockAt}_ELO
                      </span>
                    </div>
                  </div>
                )}
                <div className={locked ? 'blur-sm' : ''}>
                  <div>
                    <p className="text-[10px] font-black tracking-[0.3em] uppercase mb-1" style={{ color: '#c6c6c6' }}>
                      {engine.proto}
                    </p>
                    <h3 className="text-2xl font-black tracking-tighter uppercase" style={{ color: '#ffffff' }}>
                      {engine.name}
                    </h3>
                  </div>
                  <div className="text-center flex-1 flex flex-col justify-center">
                    <p className="text-4xl font-black tracking-tighter" style={{ color: '#ffffff' }}>
                      {engine.elo}
                    </p>
                    <p className="text-[8px] font-bold tracking-widest uppercase mt-1" style={{ color: '#474747' }}>
                      ELO_RATING
                    </p>
                  </div>
                  <div className="flex justify-between items-end pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#c6c6c6' }}>
                      {engine.desc}
                    </span>
                    {!locked && (
                      <svg className="w-5 h-5 transition-colors" style={{ color: '#474747' }} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            );
          })}

          <div
            className="lg:col-span-3 relative rounded-xl p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-8"
            style={{
              backgroundColor: '#1f1f1f',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div className="max-w-xs">
              <p className="text-[10px] font-black tracking-[0.3em] uppercase mb-2" style={{ color: '#c6c6c6' }}>
                CUSTOM_CALIBRATION
              </p>
              <h3 className="text-3xl font-black tracking-tighter uppercase mb-4" style={{ color: '#ffffff' }}>
                ENGINE_ADJUST
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: '#c6c6c6' }}>
                Manually override the rating parameters for precise opponent simulation.
              </p>
            </div>

            <div className="flex-1 w-full space-y-6">
              <div className="flex justify-between items-end">
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-5xl md:text-7xl font-black tracking-tighter transition-opacity"
                    style={{ color: '#ffffff' }}
                  >
                    {customElo}
                  </span>
                  <span className="text-xs font-black tracking-widest uppercase" style={{ color: '#474747' }}>
                    ELO
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: '#c6c6c6' }}>
                    TIER_ID
                  </p>
                  <p className="text-xs font-black tracking-wider uppercase" style={{ color: '#ffffff' }}>
                    {customTier.label}
                  </p>
                </div>
              </div>

              <div className="relative w-full">
                <input
                  type="range"
                  min={400}
                  max={3200}
                  step={50}
                  value={customElo}
                  onChange={(e) => setCustomElo(Number(e.target.value))}
                  className="w-full cursor-pointer"
                  style={{
                    WebkitAppearance: 'none',
                    appearance: 'none',
                    background: 'transparent',
                    height: '12px',
                  }}
                  onInput={(e) => {
                    const val = (e.target as HTMLInputElement).value;
                    const thumb = e.currentTarget;
                    thumb.style.setProperty('--pct', `${((Number(val) - 400) / (3200 - 400)) * 100}%`);
                  }}
                />
                <style>{`
                  input[type=range]::-webkit-slider-runnable-track {
                    width: 100%;
                    height: 2px;
                    cursor: pointer;
                    background: #353535;
                    border-radius: 2px;
                  }
                  input[type=range]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    height: 12px;
                    width: 12px;
                    border-radius: 50%;
                    background: #ffffff;
                    cursor: pointer;
                    margin-top: -5px;
                    box-shadow: 0 0 10px rgba(255,255,255,0.2);
                  }
                  input[type=range]::-moz-range-track {
                    width: 100%;
                    height: 2px;
                    cursor: pointer;
                    background: #353535;
                    border-radius: 2px;
                  }
                  input[type=range]::-moz-range-thumb {
                    height: 12px;
                    width: 12px;
                    border-radius: 50%;
                    background: #ffffff;
                    cursor: pointer;
                    border: none;
                    box-shadow: 0 0 10px rgba(255,255,255,0.2);
                  }
                `}</style>
              </div>
            </div>

            <div className="flex flex-col justify-center shrink-0">
              <button
                onClick={() => startGame(customElo)}
                className="px-8 py-4 font-black text-[10px] uppercase tracking-[0.2em] rounded-full whitespace-nowrap transition-all duration-300"
                style={{
                  backgroundColor: '#353535',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.color = '#1a1c1c';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#353535';
                  e.currentTarget.style.color = '#ffffff';
                }}
              >
                INITIALIZE_CUSTOM
              </button>
            </div>
          </div>


        </div>

        <footer className="max-w-6xl mx-auto mt-24 pt-12 flex flex-col md:flex-row justify-between items-center gap-8 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-12 flex-wrap">
            <div>
              <p className="text-[8px] font-black tracking-[0.3em] uppercase mb-1" style={{ color: '#474747' }}>
                ACTIVE_PROCESSES
              </p>
              <p className="font-black tracking-tighter text-sm" style={{ color: '#ffffff' }}>
                1,248_INSTANCES
              </p>
            </div>
            <div>
              <p className="text-[8px] font-black tracking-[0.3em] uppercase mb-1" style={{ color: '#474747' }}>
                ENGINE_LATENCY
              </p>
              <p className="font-black tracking-tighter text-sm" style={{ color: '#ffffff' }}>
                0.04ms
              </p>
            </div>
            <div>
              <p className="text-[8px] font-black tracking-[0.3em] uppercase mb-1" style={{ color: '#474747' }}>
                SYSTEM_STATUS
              </p>
              <p className="font-black tracking-tighter text-sm" style={{ color: '#ffffff' }}>
                STABLE_00
              </p>
            </div>
          </div>
          <div className="text-[9px] font-bold tracking-[0.2em] uppercase" style={{ color: '#474747' }}>
            © 2024 MONOLITH_TERMINAL_V.01 // ALL_RIGHTS_RESERVED
          </div>
        </footer>
      </main>
    </div>
  );
}
