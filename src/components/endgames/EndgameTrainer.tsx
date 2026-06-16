'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import type { EndgameLine } from '@/data/endgames';
import { customPieces } from '@/components/chess/customPieces';
import { playCaptureSound, playMoveSound } from '@/lib/chess/sounds';
import { boardTheme, legalMoveSquareStyle, captureSquareStyle } from '@/lib/chess/boardTheme';
import { StockfishEngine } from '@/lib/chess/MoveEngine';

type Status = 'idle' | 'playing' | 'wrong' | 'completed' | 'challenge-fail';
type Mode = 'walkthrough' | 'challenge';

interface Props {
  line: EndgameLine;
  onComplete: (wrongCount: number) => void;
}

export default function EndgameTrainer({ line, onComplete }: Props) {
  const mode: Mode = line.maxMoves ? 'challenge' : 'walkthrough';
  const orientation = line.orientation ?? 'white';
  const userColor = orientation === 'white' ? 'w' : 'b';

  const chessRef = useRef(new Chess(line.fen));
  const engineRef = useRef<StockfishEngine | null>(null);
  const [position, setPosition] = useState(chessRef.current.fen());
  const [moveIdx, setMoveIdx] = useState(0);
  const [status, setStatus] = useState<Status>('idle');
  const [wrongCount, setWrongCount] = useState(0);
  const [moveCount, setMoveCount] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);

  const statusRef = useRef(status);
  statusRef.current = status;
  const moveIdxRef = useRef(moveIdx);
  moveIdxRef.current = moveIdx;
  const moveCountRef = useRef(moveCount);
  moveCountRef.current = moveCount;

  const clearSelection = useCallback(() => {
    setSelectedSquare(null);
    setLegalMoves([]);
  }, []);

  const squareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    const game = chessRef.current;
    for (const sq of legalMoves) {
      const target = game.get(sq as any);
      styles[sq] = target ? captureSquareStyle : legalMoveSquareStyle;
    }
    return styles;
  }, [legalMoves]);

  const doAutoMove = useCallback((idx: number) => {
    if (idx >= line.moves.length) return;
    const isUserMove = (line.orientation ?? 'white') === 'white' ? idx % 2 === 0 : idx % 2 === 1;
    if (isUserMove) { setStatus('playing'); return; }
    const san = line.moves[idx].san;
    const game = chessRef.current;
    let isCapture = false;
    try {
      const target = san.replace(/[^a-h1-8]/g, '').slice(-2);
      isCapture = !!game.get(target as any);
    } catch {}
    try {
      game.move(san);
      setPosition(game.fen());
      if (isCapture) playCaptureSound(); else playMoveSound();
    } catch {
      return;
    }
    const next = idx + 1;
    if (next >= line.moves.length) {
      setShowCompletion(true);
      setStatus('completed');
      return;
    }
    setMoveIdx(next);
    setMoveCount(c => c + 1);
    setStatus('playing');
  }, [line.moves, line.orientation]);

  const checkGameEnd = useCallback((game: Chess): boolean => {
    if (game.isCheckmate()) {
      setShowCompletion(true);
      setStatus('completed');
      return true;
    }
    if (game.isStalemate() || game.isDraw()) {
      setShowCompletion(true);
      setStatus('challenge-fail');
      return true;
    }
    return false;
  }, []);

  const scheduleNextEngineMove = useCallback(async () => {
    let game = chessRef.current;
    if (checkGameEnd(game)) return;
    const engineColor = (line.orientation ?? 'white') === 'white' ? 'b' : 'w';
    if (game.turn() !== engineColor) return;
    if (!engineRef.current) {
      engineRef.current = new StockfishEngine('/stockfish/stockfish-18-lite-single.js', 600);
    }
    try {
      const uci = await engineRef.current.getNextMove(game);
      if (!uci || uci.length < 4) return;
      let isCapture = false;
      try { isCapture = !!game.get(uci.slice(2, 4) as any); } catch {}
      game.move(uci, { strict: false });
      setPosition(game.fen());
      if (isCapture) playCaptureSound(); else playMoveSound();
      setMoveCount(c => c + 1);
      if (checkGameEnd(game)) return;
    } catch {}
  }, [checkGameEnd, line.orientation]);

  useEffect(() => {
    chessRef.current = new Chess(line.fen);
    setPosition(chessRef.current.fen());
    setMoveIdx(0);
    setMoveCount(0);
    setStatus('idle');
    setWrongCount(0);
    setShowCompletion(false);
    clearSelection();
    if (mode === 'challenge') {
      engineRef.current?.terminate();
      engineRef.current = null;
      const timer = setTimeout(() => {
        setStatus('playing');
        scheduleNextEngineMove();
      }, 600);
      return () => {
        clearTimeout(timer);
        engineRef.current?.terminate();
        engineRef.current = null;
      };
    } else {
      const timer = setTimeout(() => doAutoMove(0), 600);
      return () => clearTimeout(timer);
    }
  }, [line, mode, doAutoMove, clearSelection, scheduleNextEngineMove]);

  const executeUserMove = useCallback((sourceSquare: string, targetSquare: string): boolean => {
    const myStatus = statusRef.current;
    const idx = moveIdxRef.current;
    if (myStatus !== 'playing') return false;

    const game = chessRef.current;
    const piece = game.get(sourceSquare as any);
    if (!piece || piece.color !== userColor) return false;

    let isCapture = false;
    try { isCapture = !!game.get(targetSquare as any); } catch {}
    if (isCapture) playCaptureSound(); else playMoveSound();

    let result;
    try {
      result = game.move({ from: sourceSquare as any, to: targetSquare as any, promotion: 'q' });
    } catch {
      return false;
    }

    clearSelection();

    if (mode === 'challenge') {
      setPosition(game.fen());
      const newCount = moveCountRef.current + 1;
      setMoveCount(newCount);
      if (checkGameEnd(game)) return true;
      if (line.maxMoves && Math.ceil(newCount / 2) > line.maxMoves) {
        setShowCompletion(true);
        setStatus('challenge-fail');
        return true;
      }
      setStatus('idle');
      scheduleNextEngineMove().then(() => {
        if (statusRef.current !== 'completed' && statusRef.current !== 'challenge-fail') {
          setStatus('playing');
        }
      });
      return true;
    }

    const expectedSan = line.moves[idx].san;
    if (result.san === expectedSan) {
      setPosition(game.fen());
      const nextIdx = idx + 1;
      setMoveIdx(nextIdx);
      setMoveCount(c => c + 1);
      if (nextIdx >= line.moves.length) {
        setShowCompletion(true);
        setStatus('completed');
        return true;
      }
      setTimeout(() => doAutoMove(nextIdx), 500);
      return true;
    }

    setWrongCount(c => c + 1);
    setStatus('wrong');
    setTimeout(() => {
      game.undo();
      setPosition(game.fen());
      setStatus('playing');
    }, 1200);
    return true;
  }, [line.moves, mode, doAutoMove, clearSelection, checkGameEnd, scheduleNextEngineMove, userColor]);

  const handleSquareClick = useCallback(({ square }: { square: string }) => {
    const game = chessRef.current;
    const myStatus = statusRef.current;
    if (myStatus !== 'playing') return;

    const piece = game.get(square as any);

    if (selectedSquare === square) {
      clearSelection();
      return;
    }

    if (piece && piece.color === userColor) {
      const moves = game.moves({ square: square as any, verbose: true });
      setSelectedSquare(square);
      setLegalMoves(moves.map(m => m.to));
      return;
    }

    if (selectedSquare && legalMoves.includes(square)) {
      executeUserMove(selectedSquare, square);
    }
  }, [selectedSquare, legalMoves, executeUserMove, clearSelection, userColor]);

  const handlePieceDrop = useCallback((sourceSquare: string, targetSquare: string | null): boolean => {
    if (!targetSquare) return false;
    clearSelection();
    return executeUserMove(sourceSquare, targetSquare);
  }, [executeUserMove, clearSelection]);

  const handlePieceDrag = useCallback(({ square }: { square: string | null }) => {
    if (!square) return;
    const game = chessRef.current;
    const piece = game.get(square as any);
    if (piece && piece.color === userColor) {
      const moves = game.moves({ square: square as any, verbose: true });
      setSelectedSquare(square);
      setLegalMoves(moves.map(m => m.to));
    }
  }, [userColor]);

  const currentHint = mode === 'walkthrough' && moveIdx < line.moves.length
    ? line.moves[moveIdx].hint
    : null;

  const totalWalkthroughMoves = mode === 'walkthrough'
    ? line.moves.filter((_, i) => {
        const isEven = i % 2 === 0;
        return (line.orientation ?? 'white') === 'white' ? isEven : !isEven;
      }).length
    : 0;

  const completedUserMoves = mode === 'walkthrough'
    ? (line.orientation ?? 'white') === 'white'
      ? Math.ceil(moveIdx / 2)
      : Math.floor(moveIdx / 2)
    : 0;

  const movesRemaining = line.maxMoves ? Math.max(0, line.maxMoves - Math.ceil(moveCount / 2)) : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
        <div className="relative w-full max-w-[460px] shrink-0">
          {showCompletion && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 rounded-lg">
              <div className="text-center p-8">
                <div className={`text-5xl mb-4 ${status === 'completed' ? '' : ''}`}>
                  {status === 'completed' ? '\u2713' : '\u2717'}
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {status === 'completed'
                    ? mode === 'challenge'
                      ? 'Checkmate!'
                      : 'Line Complete!'
                    : mode === 'challenge'
                      ? 'Too Many Moves'
                      : 'Failed'}
                </h2>
                <p className="text-neutral-400 mb-2">
                  {mode === 'challenge'
                    ? status === 'completed'
                      ? `Checkmate in ${Math.ceil(moveCount / 2)} moves`
                      : `Used ${Math.ceil(moveCount / 2)} moves — limit was ${line.maxMoves}`
                    : wrongCount === 0
                      ? 'Perfect — no mistakes!'
                      : `${wrongCount} mistake${wrongCount > 1 ? 's' : ''}`}
                </p>
                {mode === 'challenge' && status === 'completed' && (
                  <p className="text-green-400 text-sm mb-6">You beat Stockfish!</p>
                )}
                {mode === 'challenge' && status === 'challenge-fail' && (
                  <p className="text-yellow-400 text-sm mb-6">Stockfish held its defense</p>
                )}
                {mode === 'walkthrough' && (
                  <p className="text-neutral-500 text-sm mb-6">{completedUserMoves}/{totalWalkthroughMoves} moves played</p>
                )}
                <button
                  onClick={() => onComplete(wrongCount)}
                  className="px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-neutral-200 transition-colors"
                >
                  Back to Endgames
                </button>
              </div>
            </div>
          )}

          <div className="relative border-2 border-neutral-800 rounded-lg overflow-hidden">
            <Chessboard
              options={{
                id: `endgame-${line.id}`,
                position,
                pieces: customPieces,
                squareStyles,
                boardOrientation: orientation,
                onPieceDrop: ({ sourceSquare, targetSquare }) => handlePieceDrop(sourceSquare, targetSquare),
                onSquareClick: handleSquareClick,
                onPieceDrag: handlePieceDrag,
                allowDragging: status === 'playing',
                boardStyle: { borderRadius: '0' },
                darkSquareStyle: { backgroundColor: boardTheme.darkSquare },
                lightSquareStyle: { backgroundColor: boardTheme.lightSquare },
              }}
            />
          </div>

          <div className="absolute top-3 left-3 z-10 flex gap-2">
            <span className="px-3 py-1 bg-black/70 text-white text-[10px] font-bold uppercase tracking-widest rounded-full backdrop-blur-sm">
              {mode === 'challenge' ? 'Challenge' : 'Walkthrough'}
            </span>
            {movesRemaining !== null && (
              <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full backdrop-blur-sm ${
                movesRemaining <= 10 ? 'bg-red-500/70 text-white' : 'bg-black/70 text-white'
              }`}>
                {movesRemaining} moves left
              </span>
            )}
          </div>

          {status === 'wrong' && (
            <div className="absolute top-3 right-3 z-10 px-4 py-2 bg-red-500/80 text-white text-sm font-bold rounded-lg backdrop-blur-sm">
              &#10007; Wrong move
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 w-full lg:w-72">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <h3 className="text-white font-bold text-lg mb-1">{line.name}</h3>
            <p className="text-neutral-500 text-xs">{line.group}</p>
          </div>

          {line.description && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
              <p className="text-neutral-400 text-sm leading-relaxed">{line.description}</p>
            </div>
          )}

          {mode === 'walkthrough' && currentHint && (
            <div className="bg-neutral-900 border border-blue-500/20 rounded-xl p-5">
              <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mb-2">Your Move</p>
              <p className="text-white text-sm leading-relaxed">{currentHint}</p>
            </div>
          )}

          {mode === 'challenge' && status === 'playing' && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
              <p className="text-neutral-400 text-sm">Find the checkmate. Stockfish is defending.</p>
            </div>
          )}

          {status === 'idle' && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
              <p className="text-neutral-400 text-sm">Starting position...</p>
            </div>
          )}

          {!showCompletion && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
              <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold mb-2">
                {mode === 'challenge' ? 'Moves Played' : 'Progress'}
              </p>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl font-bold text-white tabular-nums">
                  {Math.ceil(moveCount / 2)}
                </span>
                {line.maxMoves && (
                  <span className="text-sm text-neutral-500">/ {line.maxMoves}</span>
                )}
              </div>
              {mode === 'walkthrough' && (
                <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${(completedUserMoves / totalWalkthroughMoves) * 100}%` }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
