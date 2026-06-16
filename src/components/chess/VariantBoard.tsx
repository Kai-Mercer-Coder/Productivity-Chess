"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Chessboard, ChessboardProvider, SparePiece } from "react-chessboard";
import type { PieceDropHandlerArgs } from "react-chessboard";
import { customPieces } from "@/components/chess/customPieces";
import { boardTheme, legalMoveSquareStyle } from "@/lib/chess/boardTheme";
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
  getPlayerPocket,
  getAiPocket,
  sparePieceToDropUci,
} from "@/lib/chess/variantGame";
import { initEngine, getEngineBestMove, destroyEngine } from "@/lib/chess/variantEngine";
import type { Position } from "chessops";

interface VariantBoardProps {
  variantId: string;
  variantTitle: string;
}

const PIECE_TYPES = ["pawn", "knight", "bishop", "rook", "queen"] as const;
const ROLE_TO_SPARE_KEY: Record<string, string> = {
  pawn: "bP", knight: "bN", bishop: "bB", rook: "bR", queen: "bQ",
};

function tryApplyMove(pos: Position, source: string, target: string): boolean {
  if (applyMove(pos, source + target)) return true;
  return applyMove(pos, source + target + "q");
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
  const [playerPocket, setPlayerPocket] = useState<Record<string, number>>({});
  const [aiPocket, setAiPocket] = useState<Record<string, number>>({});
  const [engineError, setEngineError] = useState<string | null>(null);

  const posRef = useRef<Position | null>(null);
  const mountedRef = useRef(true);
  const strengthRef = useRef(strength);
  const moveSoundRef = useRef<HTMLAudioElement | null>(null);
  const captureSoundRef = useRef<HTMLAudioElement | null>(null);
  const moveHistoryRef = useRef<string[]>([]);

  useEffect(() => {
    moveSoundRef.current = new Audio('/Move.mp3');
    captureSoundRef.current = new Audio('/Capture.mp3');
  }, []);

  useEffect(() => { strengthRef.current = strength; }, [strength]);

  useEffect(() => {
    mountedRef.current = true;
    setEngineError(null);
    initEngine(variantId).then(() => {
      console.log('[VariantBoard] engine ready, starting game');
      if (mountedRef.current) initGame();
    }).catch((e) => {
      console.error('[VariantBoard] engine init failed:', e);
      setEngineError(e instanceof Error ? e.message : String(e));
      if (mountedRef.current) initGame();
    });
    return () => {
      mountedRef.current = false;
      destroyEngine();
    };
  }, [variantId]);

  function initGame() {
    setLoading(true);
    try {
      const pos = createPosition(variantId);
      if (!mountedRef.current) return;
      posRef.current = pos;
      moveHistoryRef.current = [];
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
    setLegalDests(new Map(getLegalDests(pos)));
    setTurn(getTurn(pos));
    setPlayerPocket(getPlayerPocket(pos));
    setAiPocket(getAiPocket(pos));
    if (isGameOver(pos)) {
      setGameOver(true);
      setResult(getResult(pos));
    } else {
      setGameOver(false);
      setResult("*");
    }
  }

  async function doAiMove() {
    const pos = posRef.current;
    if (!pos || !mountedRef.current) return;
    if (isGameOver(pos)) { syncState(); return; }
    try {
      const fen = positionToFen(pos);
      const bestMove = await getEngineBestMove(fen, variantId, strengthRef.current);
      if (bestMove && mountedRef.current && posRef.current) {
        const isCapture = bestMove.length >= 4 && posRef.current.board.get(bestMove.slice(2, 4) as any) !== undefined;
        if (applyMove(posRef.current, bestMove)) {
          moveHistoryRef.current.push(bestMove);
          const sound = isCapture ? captureSoundRef.current : moveSoundRef.current;
          if (sound) { (sound.cloneNode(true) as HTMLAudioElement).play().catch(() => {}); }
          syncState();
        }
      }
    } catch (e) {
      console.error('Engine search failed:', e);
    }
    setSelectedSquare(null);
  }

  function triggerAiMove() {
    setMoving(true);
    setTimeout(() => {
      if (mountedRef.current) {
        doAiMove().finally(() => {
          if (mountedRef.current) setMoving(false);
        });
      }
    }, 300);
  }

  function undoMove() {
    const history = moveHistoryRef.current;
    if (history.length === 0 || moving) return;
    const removeCount = Math.min(2, history.length);
    const newHistory = history.slice(0, -removeCount);
    const pos = createPosition(variantId);
    for (const uci of newHistory) {
      if (!applyMove(pos, uci)) break;
    }
    posRef.current = pos;
    moveHistoryRef.current = newHistory;
    syncState();
    setSelectedSquare(null);
  }

  const handleDrop = useCallback((args: PieceDropHandlerArgs): boolean => {
    const pos = posRef.current;
    if (!pos || gameOver) return false;
    if (!args.targetSquare) return false;
    if (!isPlayerTurn(pos)) return false;

    const isCapture = !args.piece.isSparePiece && pos.board.get(args.targetSquare as any) !== undefined;

    let moveUci = args.sourceSquare + args.targetSquare;
    if (args.piece.isSparePiece) {
      moveUci = sparePieceToDropUci(args.sourceSquare, args.targetSquare);
      if (!applyMove(pos, moveUci)) return false;
    } else {
      if (!tryApplyMove(pos, args.sourceSquare, args.targetSquare)) return false;
    }

    moveHistoryRef.current.push(moveUci);
    const sound = isCapture ? captureSoundRef.current : moveSoundRef.current;
    if (sound) { (sound.cloneNode(true) as HTMLAudioElement).play().catch(() => {}); }
    syncState();
    setSelectedSquare(null);
    triggerAiMove();
    return true;
  }, [gameOver]);

  const handleSquareClick = useCallback((args: any) => {
    const pos = posRef.current;
    if (!pos || gameOver) return;
    if (!isPlayerTurn(pos)) return;

    const square = args.square as string;
    const sel = selectedSquare;

    if (sel) {
      const isCapture = pos.board.get(square as any) !== undefined;
      if (tryApplyMove(pos, sel, square)) {
        moveHistoryRef.current.push(sel + square);
        const sound = isCapture ? captureSoundRef.current : moveSoundRef.current;
        if (sound) { (sound.cloneNode(true) as HTMLAudioElement).play().catch(() => {}); }
        syncState();
        setSelectedSquare(null);
        triggerAiMove();
        return;
      }
    }

    const moves = getAllUciMoves(pos).filter(m => m.startsWith(square));
    if (moves.length > 0) {
      setSelectedSquare(square);
    } else {
      setSelectedSquare(null);
    }
  }, [gameOver, selectedSquare]);

  const squareStyles = selectedSquare && !gameOver
    ? (legalDests.get(selectedSquare) || []).reduce((acc, dest) => {
        acc[dest] = legalMoveSquareStyle;
        return acc;
      }, {} as Record<string, React.CSSProperties>)
    : {};

  function PocketRow({ pocket, side }: { pocket: Record<string, number>; side: 'top' | 'bottom' }) {
    const items = PIECE_TYPES.filter(r => (pocket[r] || 0) > 0);
    if (items.length === 0) return null;
    return (
      <div className={`flex justify-center gap-1 ${side === 'bottom' ? 'mt-3' : 'mb-3'}`}>
        {items.map(role =>
          Array.from({ length: pocket[role] }).map((_, i) => (
            <div key={`${role}-${i}`} className="relative w-8 h-8">
              <SparePiece pieceType={ROLE_TO_SPARE_KEY[role]} />
              {pocket[role] > 1 && (
                <span className="absolute -bottom-1 -right-1 text-[10px] font-bold text-white bg-black/60 rounded-full w-4 h-4 flex items-center justify-center">
                  {pocket[role]}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-neutral-400 text-sm tracking-widest uppercase gap-4">
        <span>Loading variant engine...</span>
        {engineError && (
          <div className="text-red-400 text-[10px] max-w-md text-center font-mono normal-case leading-relaxed">
            <div className="font-bold mb-1">Engine error:</div>
            <div>{engineError}</div>
          </div>
        )}
      </div>
    );
  }

  const resultText = result === "1-0" ? "White wins"
    : result === "0-1" ? "Black wins"
    : result === "1/2-1/2" ? "Draw" : "";

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full min-h-[70vh]">
      <div className="flex-1 max-w-[560px] mx-auto lg:mx-0">
        <ChessboardProvider options={{
          pieces: customPieces,
          position: fen,
          darkSquareStyle: { backgroundColor: boardTheme.darkSquare },
          lightSquareStyle: { backgroundColor: boardTheme.lightSquare },
          onPieceDrop: handleDrop,
          onSquareClick: handleSquareClick,
          squareStyles,
          boardOrientation: "white",
          canDragPiece: ({ piece }) => {
            const p = posRef.current;
            if (!p || !isPlayerTurn(p)) return false;
            if (piece.pieceType.startsWith('w')) return false;
            return true;
          },
        }}>
          <div className="relative">
            {variantId === 'crazyhouse' && (
              <div className="bg-neutral-900/60 rounded-t px-2 py-1 border-b border-white/5">
                <div className="text-[10px] text-neutral-500 tracking-wider mb-1 text-center">AI pocket</div>
                <PocketRow pocket={aiPocket} side="top" />
              </div>
            )}
            <Chessboard />
            {variantId === 'crazyhouse' && (
              <div className="bg-neutral-900/60 rounded-b px-2 py-1 border-t border-white/5">
                <div className="text-[10px] text-neutral-500 tracking-wider mb-1 text-center">Your pocket</div>
                <PocketRow pocket={playerPocket} side="bottom" />
              </div>
            )}
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
        </ChessboardProvider>
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

        <div className="flex gap-2">
          <button
            onClick={initGame}
            className="flex-1 px-4 py-3 border border-white/10 text-white text-xs font-bold tracking-widest uppercase rounded hover:bg-white/5 transition-colors"
          >
            New Game
          </button>
          <button
            onClick={undoMove}
            disabled={moveHistoryRef.current.length === 0 || moving}
            className="px-4 py-3 border border-white/10 text-white text-xs font-bold tracking-widest uppercase rounded hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Undo
          </button>
        </div>

        <div className="text-[10px] text-neutral-600 font-mono leading-loose flex flex-col gap-1">
          <div>
            <span className="text-neutral-500">Turn: </span>
            <span className="text-white capitalize">{turn}</span>
          </div>
          <div>
            <span className="text-neutral-500">Moves: </span>
            <span className="text-white">{Math.floor(moveHistoryRef.current.length / 2)}</span>
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
