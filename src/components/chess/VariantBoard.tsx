"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Chessboard } from "react-chessboard";
import type { PieceDropHandlerArgs } from "react-chessboard";
import { customPieces } from "@/components/chess/customPieces";
import { boardTheme } from "@/lib/chess/boardTheme";
import {
  createPosition,
  positionToFen,
  applyMove,
  getAllUciMoves,
  isGameOver,
  getResult,
  isPlayerTurn,
  getTurn,
  getLegalDests,
  pickAiMove,
} from "@/lib/chess/variantGame";
import type { Position } from "chessops";

interface VariantBoardProps {
  variantId: string;
  variantTitle: string;
}

export default function VariantBoard({ variantId, variantTitle }: VariantBoardProps) {
  const [fen, setFen] = useState("start");
  const [loading, setLoading] = useState(true);
  const [legalMovesList, setLegalMovesList] = useState<string[]>([]);
  const [legalDests, setLegalDests] = useState<Map<string, string[]>>(new Map());
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState("*");
  const [turn, setTurn] = useState<"white" | "black">("white");
  const [strength, setStrength] = useState(5);
  const [moving, setMoving] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);

  const posRef = useRef<Position | null>(null);
  const mountedRef = useRef(true);
  const strengthRef = useRef(strength);
  const movingRef = useRef(false);
  const selectedRef = useRef<string | null>(null);
  const legalMovesRef = useRef<string[]>([]);

  useEffect(() => { strengthRef.current = strength; }, [strength]);
  useEffect(() => { movingRef.current = moving; }, [moving]);
  useEffect(() => { selectedRef.current = selectedSquare; }, [selectedSquare]);
  useEffect(() => { legalMovesRef.current = legalMovesList; }, [legalMovesList]);

  useEffect(() => {
    mountedRef.current = true;
    initGame();
    return () => { mountedRef.current = false; };
  }, [variantId]);

  function initGame() {
    setLoading(true);
    try {
      const pos = createPosition(variantId);
      if (!mountedRef.current) return;
      posRef.current = pos;
      syncState();
      setMoving(false);
      setSelectedSquare(null);
    } catch (e) {
      console.error("Failed to init variant game:", e);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }

  function syncState() {
    const pos = posRef.current;
    if (!pos) return;
    setFen(positionToFen(pos));
    setLegalMovesList(getAllUciMoves(pos));
    setLegalDests(getLegalDests(pos));
    setTurn(getTurn(pos));
    if (isGameOver(pos)) {
      setGameOver(true);
      setResult(getResult(pos));
    } else {
      setGameOver(false);
      setResult("*");
    }
  }

  function doAiMove() {
    const pos = posRef.current;
    if (!pos || !mountedRef.current) return;
    if (isGameOver(pos)) { syncState(); return; }
    const bestMove = pickAiMove(pos, strengthRef.current);
    if (bestMove && applyMove(pos, bestMove)) {
      syncState();
    }
    setSelectedSquare(null);
  }

  function triggerAiMove() {
    setMoving(true);
    setTimeout(() => {
      if (mountedRef.current) {
        doAiMove();
        setMoving(false);
      }
    }, 300);
  }

  const handleDrop = useCallback((args: PieceDropHandlerArgs): boolean => {
    const pos = posRef.current;
    if (!pos || gameOver || movingRef.current) return false;
    if (!isPlayerTurn(pos)) return false;

    const uci = `${args.sourceSquare}${args.targetSquare}q`;
    if (!applyMove(pos, uci)) return false;

    syncState();
    setSelectedSquare(null);
    triggerAiMove();
    return true;
  }, [gameOver]);

  const handleSquareClick = useCallback((args: any) => {
    const pos = posRef.current;
    if (!pos || gameOver || movingRef.current) return;
    if (!isPlayerTurn(pos)) return;

    const square = args.square as string;
    const sel = selectedRef.current;

    if (sel) {
      const uci = `${sel}${square}q`;
      if (applyMove(pos, uci)) {
        syncState();
        setSelectedSquare(null);
        triggerAiMove();
        return;
      }
    }

    const moves = legalMovesRef.current.filter(m => m.startsWith(square));
    if (moves.length > 0) {
      setSelectedSquare(square);
    } else {
      setSelectedSquare(null);
    }
  }, [gameOver]);

  const squareStyles = selectedSquare && !gameOver
    ? (legalDests.get(selectedSquare) || []).reduce((acc, dest) => {
        acc[dest] = { background: boardTheme.legalMove, boxShadow: `inset 0 0 0 3px ${boardTheme.legalMove}` };
        return acc;
      }, {} as Record<string, React.CSSProperties>)
    : {};

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh] text-neutral-400 text-sm tracking-widest uppercase">
        Loading variant engine...
      </div>
    );
  }

  const resultText = result === "1-0" ? "White wins"
    : result === "0-1" ? "Black wins"
    : result === "1/2-1/2" ? "Draw" : "";

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full min-h-[70vh]">
      <div className="flex-1 max-w-[560px] mx-auto lg:mx-0">
        <div className="relative">
          <Chessboard options={{
            pieces: customPieces,
            position: fen,
            darkSquareStyle: { backgroundColor: boardTheme.darkSquare },
            lightSquareStyle: { backgroundColor: boardTheme.lightSquare },
            onPieceDrop: handleDrop,
            onSquareClick: handleSquareClick,
            squareStyles,
            boardOrientation: "white",
          }} />
          {gameOver && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 rounded">
              <div className="text-center">
                <p className="text-white text-lg font-bold mb-2">{resultText || "Game Over"}</p>
                <button
                  onClick={initGame}
                  className="px-6 py-2 bg-white text-black text-xs font-bold tracking-widest uppercase rounded hover:bg-neutral-200 transition-colors"
                >
                  New Game
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="w-full lg:w-64 flex flex-col gap-8">
        <div>
          <h2 className="text-xl font-black tracking-tight text-white mb-1 uppercase">{variantTitle}</h2>
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className={`w-2 h-2 rounded-full ${turn === 'white' ? 'bg-white' : 'bg-neutral-700'}`} />
            <span className="tracking-wider">{turn === 'white' ? 'Your turn' : 'Engine thinking...'}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold tracking-widest text-neutral-500 uppercase mb-3">
            Engine Strength
          </label>
          <input
            type="range"
            min={1}
            max={10}
            value={strength}
            onChange={(e) => setStrength(Number(e.target.value))}
            className="w-full accent-white"
          />
          <div className="flex justify-between text-[10px] text-neutral-600 mt-1">
            <span>WEAK</span>
            <span className="text-white font-bold">{strength}</span>
            <span>STRONG</span>
          </div>
        </div>

        <button
          onClick={initGame}
          className="px-6 py-3 border border-white/10 text-white text-xs font-bold tracking-widest uppercase rounded hover:bg-white/5 transition-colors"
        >
          New Game
        </button>

        <div className="text-[10px] text-neutral-600 font-mono leading-loose flex flex-col gap-1">
          <div>
            <span className="text-neutral-500">Turn: </span>
            <span className="text-white capitalize">{turn}</span>
          </div>
          <div>
            <span className="text-neutral-500">Legal moves: </span>
            <span className="text-white">{legalMovesList.length}</span>
          </div>
          {gameOver && (
            <div>
              <span className="text-neutral-500">Result: </span>
              <span className="text-yellow-400">{result}</span>
            </div>
          )}
        </div>

        {moving && (
          <div className="text-xs text-neutral-500 animate-pulse tracking-widest uppercase">
            Calculating...
          </div>
        )}
      </div>
    </div>
  );
}
