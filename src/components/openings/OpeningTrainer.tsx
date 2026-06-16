'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import type { OpeningLine } from '@/data/openingLines';
import { customPieces } from '@/components/chess/customPieces';
import { playCaptureSound, playMoveSound } from '@/lib/chess/sounds';
import { boardTheme, legalMoveSquareStyle, captureSquareStyle } from '@/lib/chess/boardTheme';

type Mode = 'learn' | 'revise';
type Status = 'idle' | 'playing' | 'wrong' | 'completed';

interface Props {
  line: OpeningLine;
  mode: Mode;
  onComplete: (wrongCount: number) => void;
}

function isUsersTurn(idx: number, orientation: 'white' | 'black') {
  return orientation === 'white' ? idx % 2 === 0 : idx % 2 === 1;
}

function isAutoPlay(idx: number, orientation: 'white' | 'black') {
  return !isUsersTurn(idx, orientation);
}

function userPieceColor(orientation: 'white' | 'black') {
  return orientation === 'white' ? 'w' : 'b';
}

export default function OpeningTrainer({ line, mode, onComplete }: Props) {
  const orientation = line.orientation ?? 'black';
  const chessRef = useRef(new Chess());
  const [position, setPosition] = useState(chessRef.current.fen());
  const [moveIdx, setMoveIdx] = useState(0);
  const [status, setStatus] = useState<Status>('idle');
  const [wrongCount, setWrongCount] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);

  const statusRef = useRef(status);
  statusRef.current = status;
  const moveIdxRef = useRef(moveIdx);
  moveIdxRef.current = moveIdx;

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

  const autoPlayNext = useCallback((idx: number) => {
    if (idx >= line.moves.length) {
      setStatus('completed');
      setShowCompletion(true);
      return;
    }
    if (!isAutoPlay(idx, orientation)) { setStatus('playing'); return; }

    const move = line.moves[idx];
    const game = chessRef.current;
    let isCapture = false;
    try {
      const target = move.san.replace(/[^a-h1-8]/g, '').slice(-2);
      isCapture = !!game.get(target as any);
    } catch {}
    if (isCapture) playCaptureSound(); else playMoveSound();
    try {
      game.move(move.san);
      setPosition(game.fen());
    } catch (e) {
      return;
    }
    const next = idx + 1;
    if (next >= line.moves.length) {
      setShowCompletion(true);
      setStatus('completed');
      return;
    }
    setMoveIdx(next);
    setStatus('playing');
  }, [line.moves, orientation]);

  useEffect(() => {
    chessRef.current = new Chess();
    setPosition(chessRef.current.fen());
    setMoveIdx(0);
    setStatus('idle');
    setWrongCount(0);
    setShowCompletion(false);
    clearSelection();
    const timer = setTimeout(() => autoPlayNext(0), 600);
    return () => clearTimeout(timer);
  }, [line, autoPlayNext, clearSelection]);

  const executeUserMove = useCallback((sourceSquare: string, targetSquare: string): boolean => {
    const myStatus = statusRef.current;
    const idx = moveIdxRef.current;
    if (myStatus !== 'playing' || !isUsersTurn(idx, orientation)) return false;

    const game = chessRef.current;
    const piece = game.get(sourceSquare as any);
    if (!piece || piece.color !== userPieceColor(orientation)) return false;

    const expectedSan = line.moves[idx].san;

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

    if (result.san === expectedSan) {
      setPosition(game.fen());
      const nextIdx = idx + 1;
      setMoveIdx(nextIdx);
      if (nextIdx >= line.moves.length) {
        setShowCompletion(true);
        setStatus('completed');
        return true;
      }
      setTimeout(() => autoPlayNext(nextIdx), 500);
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
  }, [line.moves, autoPlayNext, clearSelection, orientation]);

  const handleSquareClick = useCallback(({ square }: { square: string }) => {
    const game = chessRef.current;
    const myStatus = statusRef.current;
    const idx = moveIdxRef.current;
    const uc = userPieceColor(orientation);

    if (myStatus !== 'playing' || !isUsersTurn(idx, orientation)) return;

    const piece = game.get(square as any);

    if (selectedSquare === square) {
      clearSelection();
      return;
    }

    if (piece && piece.color === uc) {
      const moves = game.moves({ square: square as any, verbose: true });
      setSelectedSquare(square);
      setLegalMoves(moves.map(m => m.to));
      return;
    }

    if (selectedSquare && legalMoves.includes(square)) {
      executeUserMove(selectedSquare, square);
    }
  }, [selectedSquare, legalMoves, executeUserMove, clearSelection, orientation]);

  const handlePieceDrop = useCallback((sourceSquare: string, targetSquare: string | null): boolean => {
    if (!targetSquare) return false;
    clearSelection();
    return executeUserMove(sourceSquare, targetSquare);
  }, [executeUserMove, clearSelection]);

  const handlePieceDrag = useCallback(({ square }: { square: string | null }) => {
    if (!square) return;
    const game = chessRef.current;
    const piece = game.get(square as any);
    const uc = userPieceColor(orientation);
    if (piece && piece.color === uc) {
      const moves = game.moves({ square: square as any, verbose: true });
      setSelectedSquare(square);
      setLegalMoves(moves.map(m => m.to));
    }
  }, [orientation]);

  const currentHint = moveIdx < line.moves.length && isUsersTurn(moveIdx, orientation)
    ? line.moves[moveIdx].hint
    : null;

  const showHint = mode === 'learn' || (mode === 'revise' && status === 'wrong');

  const userMovesCount = line.moves.filter((_, i) => isUsersTurn(i, orientation)).length;
  const completedUserMoves = Math.floor(moveIdx / 2);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
        <div className="relative w-full max-w-[460px] shrink-0">
          {showCompletion && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 rounded-lg">
              <div className="text-center p-8">
                <div className="text-5xl mb-4">&#10003;</div>
                <h2 className="text-2xl font-bold text-white mb-2">Line Complete!</h2>
                <p className="text-neutral-400 mb-6">
                  {wrongCount === 0
                    ? "Perfect — no mistakes!"
                    : `${wrongCount} mistake${wrongCount > 1 ? 's' : ''} — keep practicing.`}
                </p>
                <button
                  onClick={() => onComplete(wrongCount)}
                  className="px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-neutral-200 transition-colors"
                >
                  Back to Openings
                </button>
              </div>
            </div>
          )}

          <div className="relative border-2 border-neutral-800 rounded-lg overflow-hidden">
            <Chessboard
              options={{
                id: "opening-trainer",
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
              {line.eco}
            </span>
            <span className="px-3 py-1 bg-black/70 text-white text-[10px] font-bold uppercase tracking-widest rounded-full backdrop-blur-sm">
              {mode === 'learn' ? 'Learning' : 'Revise'}
            </span>
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
            <p className="text-neutral-500 text-xs uppercase tracking-widest">{line.eco}</p>
          </div>

          {showHint && currentHint && (
            <div className="bg-neutral-900 border border-blue-500/20 rounded-xl p-5">
              <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mb-2">
                {mode === 'revise' ? 'Hint Revealed' : 'Your Move'}
              </p>
              <p className="text-white text-sm leading-relaxed">{currentHint}</p>
            </div>
          )}

          {status === 'playing' && !currentHint && isUsersTurn(moveIdx, orientation) && mode === 'revise' && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
              <p className="text-neutral-400 text-sm">Play the correct response from memory.</p>
            </div>
          )}

          {status === 'idle' && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
              <p className="text-neutral-400 text-sm">Starting position...</p>
            </div>
          )}

          {showCompletion && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold">Completed</p>
                <p className="text-2xl font-bold text-white">{completedUserMoves}/{userMovesCount} moves</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold">Mistakes</p>
                <p className={`text-2xl font-bold ${wrongCount === 0 ? 'text-green-400' : 'text-yellow-400'}`}>
                  {wrongCount}
                </p>
              </div>
            </div>
          )}

          {!showCompletion && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
              <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold mb-2">Progress</p>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${(completedUserMoves / userMovesCount) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-white tabular-nums">
                  {completedUserMoves}/{userMovesCount}
                </span>
              </div>
              <div className="flex justify-between text-[10px] text-neutral-600 uppercase tracking-wider">
                <span>Moves played</span>
                <span>Line: {line.moves.slice(0, moveIdx).map(m => m.san).join(' ')}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
