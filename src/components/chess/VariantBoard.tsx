"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Chessboard, ChessboardProvider, SparePiece } from "react-chessboard";
import type { PieceDropHandlerArgs } from "react-chessboard";
import { customPieces } from "@/components/chess/customPieces";
import { boardTheme, legalMoveSquareStyle } from "@/lib/chess/boardTheme";
import { playMoveSound } from "@/lib/chess/sounds";
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
import {
  initEngine,
  getEngineBestMove,
  getStrengthElo,
  destroyEngine,
} from "@/lib/chess/variantEngine";
import type { Position } from "chessops";

interface VariantBoardProps {
  variantId: string;
  variantTitle: string;
}

const PIECE_TYPES = ["pawn", "knight", "bishop", "rook", "queen"] as const;
const ROLE_TO_LETTER: Record<string, string> = {
  pawn: "P",
  knight: "N",
  bishop: "B",
  rook: "R",
  queen: "Q",
};
function spareKey(role: string, color: "w" | "b"): string {
  return color + ROLE_TO_LETTER[role];
}

function tryApplyMove(pos: Position, source: string, target: string): boolean {
  if (applyMove(pos, source + target)) return true;
  return applyMove(pos, source + target + "q");
}

function EvalBar({ evaluation, mate }: { evaluation: number; mate: number | null }) {
  const cappedEval =
    mate !== null ? (mate > 0 ? 5 : -5) : Math.max(-5, Math.min(5, evaluation));
  let whitePercent = 50 + 50 * (2 / (1 + Math.exp(-cappedEval)) - 1);
  whitePercent = Math.max(0, Math.min(100, whitePercent));
  const isWhiteWinning = whitePercent >= 50;
  const displayEval =
    mate !== null
      ? `#${mate > 0 ? "+" : "-"}${Math.abs(mate)}`
      : evaluation.toFixed(2);

  return (
    <div
      className="w-8 md:w-[42px] h-[460px] rounded-xl overflow-hidden hidden md:flex flex-col-reverse relative shrink-0"
      style={{
        backgroundColor: "#0a0a0a",
        border: "2px solid rgba(255,255,255,0.08)",
      }}
    >
      <div
        className="w-full bg-white transition-all duration-700 ease-out"
        style={{ height: `${whitePercent}%` }}
      />
      <div className="w-full bg-surface-container-highest flex-1" />
      <div
        className="absolute top-1/2 w-full h-px -translate-y-px"
        style={{ backgroundColor: "#353535" }}
      />
      <div
        className={`absolute left-0 right-0 flex justify-center font-mono text-[11px] font-bold transition-all duration-500 ${
          isWhiteWinning ? "bottom-1 text-black" : "top-1 text-white"
        }`}
      >
        {displayEval}
      </div>
    </div>
  );
}

function MoveHistoryPanel({
  history,
  currentMoveIndex,
  onNavigate,
}: {
  history: string[];
  currentMoveIndex: number;
  onNavigate: (index: number) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history.length]);

  const pairs: { num: number; white: string; black: string; whiteIdx: number; blackIdx: number }[] = [];
  for (let i = 0; i < history.length; i += 2) {
    pairs.push({
      num: Math.floor(i / 2) + 1,
      white: history[i] ?? "",
      black: history[i + 1] ?? "",
      whiteIdx: i,
      blackIdx: i + 1,
    });
  }

  return (
    <div className="bg-surface-container rounded-xl overflow-hidden shadow-xl flex flex-col">
      <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between bg-surface-container-high/30">
        <span className="text-[10px] font-black uppercase tracking-widest text-primary/40">
          Move History
        </span>
        <span className="text-[10px] font-bold text-on-surface-variant bg-white/5 px-2 py-1 rounded">
          {history.length} moves
        </span>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto max-h-[240px] p-2 space-y-0.5">
        {pairs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-on-surface-variant">
            <span className="material-symbols-outlined text-2xl mb-2 text-neutral-700">
              touch_app
            </span>
            <span className="text-[11px]">Make a move</span>
          </div>
        ) : (
          pairs.map((pair) => (
            <div
              key={pair.num}
              className="grid grid-cols-12 items-center p-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="col-span-2 text-[10px] font-bold text-on-surface-variant pl-1">
                {pair.num}.
              </div>
              <button
                type="button"
                onClick={() => onNavigate(pair.whiteIdx + 1)}
                className={`col-span-4 text-sm font-bold text-left px-2 py-0.5 rounded transition-colors ${
                  currentMoveIndex === pair.whiteIdx + 1
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "text-white hover:bg-white/5"
                }`}
              >
                {pair.white}
              </button>
              <button
                type="button"
                onClick={() => pair.black && onNavigate(pair.blackIdx + 1)}
                className={`col-span-4 text-sm font-bold text-left px-2 py-0.5 rounded transition-colors ${
                  currentMoveIndex === pair.blackIdx + 1
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "text-white/60 hover:bg-white/5"
                }`}
              >
                {pair.black || "-"}
              </button>
              <div className="col-span-2" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function VariantBoard({
  variantId,
  variantTitle,
}: VariantBoardProps) {
  const [fen, setFen] = useState("start");
  const [loading, setLoading] = useState(true);
  const [legalMovesList, setLegalMovesList] = useState<string[]>([]);
  const [legalDests, setLegalDests] = useState<Map<string, string[]>>(
    new Map(),
  );
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState("*");
  const [turn, setTurn] = useState<"white" | "black">("white");
  const [strength, setStrength] = useState(5);
  const [moving, setMoving] = useState(false);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [playerPocket, setPlayerPocket] = useState<Record<string, number>>({});
  const [aiPocket, setAiPocket] = useState<Record<string, number>>({});
  const [engineError, setEngineError] = useState<string | null>(null);
  const [currentEval, setCurrentEval] = useState<number>(0);
  const [evalMate, setEvalMate] = useState<number | null>(null);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);

  const posRef = useRef<Position | null>(null);
  const mountedRef = useRef(true);
  const strengthRef = useRef(strength);
  const moveHistoryRef = useRef<string[]>([]);

  useEffect(() => {
    strengthRef.current = strength;
  }, [strength]);

  useEffect(() => {
    mountedRef.current = true;
    setEngineError(null);
    initEngine(variantId)
      .then(() => {
        console.log("[VariantBoard] engine ready, starting game");
        if (mountedRef.current) initGame();
      })
      .catch((e) => {
        console.error("[VariantBoard] engine init failed:", e);
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
      setMoveHistory([]);
      setCurrentMoveIndex(0);
      syncState();
      setMoving(false);
      setSelectedSquare(null);
      setCurrentEval(0);
      setEvalMate(null);
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
    setMoveHistory([...moveHistoryRef.current]);
    setCurrentMoveIndex(moveHistoryRef.current.length);
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
    if (isGameOver(pos)) {
      syncState();
      return;
    }
    try {
      const fen = positionToFen(pos);
      const bestMove = await getEngineBestMove(
        fen,
        variantId,
        strengthRef.current,
      );
      if (bestMove && mountedRef.current && posRef.current) {
        const isCapture =
          bestMove.length >= 4 &&
          posRef.current.board.get(bestMove.slice(2, 4) as any) !== undefined;
        if (applyMove(posRef.current, bestMove)) {
          moveHistoryRef.current.push(bestMove);
          playMoveSound({ isCapture });
          syncState();
        }
      }
    } catch (e) {
      console.error("Engine search failed:", e);
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

  function navigateMove(index: number) {
    const history = moveHistoryRef.current;
    const clampedIndex = Math.max(0, Math.min(history.length, index));
    const pos = createPosition(variantId);
    for (let i = 0; i < clampedIndex; i++) {
      if (!applyMove(pos, history[i])) break;
    }
    posRef.current = pos;
    syncState();
    setSelectedSquare(null);
  }

  const handleDrop = useCallback(
    (args: PieceDropHandlerArgs): boolean => {
      const pos = posRef.current;
      if (!pos || gameOver) return false;
      if (!args.targetSquare) return false;
      if (!isPlayerTurn(pos)) return false;

      const isCapture =
        !args.piece.isSparePiece &&
        pos.board.get(args.targetSquare as any) !== undefined;

      let moveUci = args.sourceSquare + args.targetSquare;
      if (args.piece.isSparePiece) {
        moveUci = sparePieceToDropUci(args.sourceSquare, args.targetSquare);
        if (!applyMove(pos, moveUci)) return false;
      } else {
        if (!tryApplyMove(pos, args.sourceSquare, args.targetSquare))
          return false;
      }

      moveHistoryRef.current.push(moveUci);
      playMoveSound({ isCapture });
      syncState();
      setSelectedSquare(null);
      triggerAiMove();
      return true;
    },
    [gameOver],
  );

  const handleSquareClick = useCallback(
    (args: any) => {
      const pos = posRef.current;
      if (!pos || gameOver) return;
      if (!isPlayerTurn(pos)) return;

      const square = args.square as string;
      const sel = selectedSquare;

      if (sel) {
        const isCapture = pos.board.get(square as any) !== undefined;
        if (tryApplyMove(pos, sel, square)) {
          moveHistoryRef.current.push(sel + square);
          playMoveSound({ isCapture });
          syncState();
          setSelectedSquare(null);
          triggerAiMove();
          return;
        }
      }

      const moves = getAllUciMoves(pos).filter((m) => m.startsWith(square));
      if (moves.length > 0) {
        setSelectedSquare(square);
      } else {
        setSelectedSquare(null);
      }
    },
    [gameOver, selectedSquare],
  );

  const squareStyles =
    selectedSquare && !gameOver
      ? (legalDests.get(selectedSquare) || []).reduce(
          (acc, dest) => {
            acc[dest] = legalMoveSquareStyle;
            return acc;
          },
          {} as Record<string, React.CSSProperties>,
        )
      : {};

  function PocketRow({
    pocket,
    side,
    color,
  }: {
    pocket: Record<string, number>;
    side: "top" | "bottom";
    color: "w" | "b";
  }) {
    const items = PIECE_TYPES.filter((r) => (pocket[r] || 0) > 0);
    if (items.length === 0) return null;
    return (
      <div
        className={`flex justify-center gap-1 ${side === "bottom" ? "mt-2" : "mb-2"}`}
      >
        {items.map((role) =>
          Array.from({ length: pocket[role] }).map((_, i) => (
            <div key={`${role}-${i}`} className="relative w-8 h-8">
              <SparePiece pieceType={spareKey(role, color)} />
              {pocket[role] > 1 && (
                <span className="absolute -bottom-1 -right-1 text-[10px] font-bold text-white bg-black/60 rounded-full w-4 h-4 flex items-center justify-center">
                  {pocket[role]}
                </span>
              )}
            </div>
          )),
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-neutral-700 border-t-white rounded-full animate-spin" />
          <span className="text-neutral-500 text-sm font-medium tracking-wide">
            Loading variant engine...
          </span>
          {engineError && (
            <div className="text-red-400 text-[10px] max-w-md text-center font-mono normal-case leading-relaxed mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="font-bold mb-1">Engine error:</div>
              <div>{engineError}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const resultText =
    result === "1-0"
      ? "White wins"
      : result === "0-1"
        ? "Black wins"
        : result === "1/2-1/2"
          ? "Draw"
          : "";

  return (
    <div className="min-h-[80vh]">
      <div className="grid grid-cols-12 gap-8 items-start max-w-[1400px] mx-auto">
        {/* Eval Bar */}
        <div className="col-span-1 hidden md:block">
          <EvalBar evaluation={currentEval} mate={evalMate} />
        </div>

        {/* Board + Nav */}
        <div className="col-span-12 md:col-span-7 flex flex-col items-center">
          <div className="relative w-full max-w-[560px]">
            {/* Board container */}
            <div className="relative w-full aspect-square rounded-[2rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.5)] bg-surface-container border border-white/5">
              <ChessboardProvider
                options={{
                  pieces: customPieces,
                  position: fen,
                  darkSquareStyle: { backgroundColor: boardTheme.darkSquare },
                  lightSquareStyle: { backgroundColor: boardTheme.lightSquare },
                  onPieceDrop: handleDrop,
                  onSquareClick: handleSquareClick,
                  squareStyles,
                  boardOrientation: "white",
                  canDragPiece: ({ piece, isSparePiece }) => {
                    const p = posRef.current;
                    if (!p || !isPlayerTurn(p)) return false;
                    if (isSparePiece) return true;
                    if (piece.pieceType.startsWith("b")) return false;
                    return true;
                  },
                }}
              >
                <div className="relative">
                  {variantId === "crazyhouse" && (
                    <div className="bg-neutral-900/60 backdrop-blur-sm rounded-t px-2 py-1 border-b border-white/5">
                      <div className="text-[10px] text-neutral-500 tracking-wider mb-1 text-center">
                        AI pocket
                      </div>
                      <PocketRow pocket={aiPocket} side="top" color="b" />
                    </div>
                  )}
                  <Chessboard />
                  {variantId === "crazyhouse" && (
                    <div className="bg-neutral-900/60 backdrop-blur-sm rounded-b px-2 py-1 border-t border-white/5">
                      <div className="text-[10px] text-neutral-500 tracking-wider mb-1 text-center">
                        Your pocket
                      </div>
                      <PocketRow pocket={playerPocket} side="bottom" color="w" />
                    </div>
                  )}
                  {/* Game over overlay */}
                  {gameOver && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
                      <div className="text-center">
                        <p className="text-white text-lg font-bold mb-3">
                          {resultText || "Game Over"}
                        </p>
                        <button
                          type="button"
                          onClick={initGame}
                          className="px-6 py-2.5 bg-white text-black text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-neutral-200 transition-all active:scale-95"
                        >
                          New Game
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </ChessboardProvider>
            </div>

            {/* Floating nav bar */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-surface-container/60 glass-panel rounded-full shadow-2xl border border-white/5 z-10">
              <button
                type="button"
                onClick={() => navigateMove(0)}
                disabled={currentMoveIndex <= 0 || moving}
                className="p-3 hover:bg-white/10 rounded-full transition-all duration-300 group disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-white/60 group-hover:text-white text-lg">
                  first_page
                </span>
              </button>
              <button
                type="button"
                onClick={() => navigateMove(currentMoveIndex - 1)}
                disabled={currentMoveIndex <= 0 || moving}
                className="p-3 hover:bg-white/10 rounded-full transition-all duration-300 group disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-white/60 group-hover:text-white text-lg">
                  chevron_left
                </span>
              </button>
              <button
                type="button"
                onClick={undoMove}
                disabled={moveHistoryRef.current.length === 0 || moving}
                className="p-4 bg-white/10 text-white rounded-full hover:bg-white/20 active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-lg">
                  undo
                </span>
              </button>
              <button
                type="button"
                onClick={() => navigateMove(currentMoveIndex + 1)}
                disabled={currentMoveIndex >= moveHistory.length || moving}
                className="p-3 hover:bg-white/10 rounded-full transition-all duration-300 group disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-white/60 group-hover:text-white text-lg">
                  chevron_right
                </span>
              </button>
              <button
                type="button"
                onClick={() => navigateMove(moveHistory.length)}
                disabled={currentMoveIndex >= moveHistory.length || moving}
                className="p-3 hover:bg-white/10 rounded-full transition-all duration-300 group disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-white/60 group-hover:text-white text-lg">
                  last_page
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="col-span-12 md:col-span-4 flex flex-col gap-6">
          {/* Variant info card */}
          <div className="p-8 rounded-3xl border border-white/5 shadow-xl glass">
            <div className="flex justify-between items-start mb-1">
              <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                Active Variant
              </span>
              <div
                className={`w-3 h-3 rounded-full ${
                  turn === "white"
                    ? "bg-white border border-neutral-400"
                    : "bg-neutral-900 border border-neutral-600"
                }`}
              />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white uppercase mb-1">
              {variantTitle}
            </h2>
            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <span className="tracking-wider">
                {turn === "white" ? "Your turn" : "Engine thinking..."}
              </span>
            </div>
          </div>

          {/* Engine strength card */}
          <div className="p-6 rounded-3xl border border-white/5 shadow-xl glass">
            <label className="block text-[10px] font-black tracking-widest text-neutral-500 uppercase mb-4">
              Engine Strength
            </label>
            <div className="relative">
              <input
                type="range"
                min={1}
                max={10}
                value={strength}
                onChange={(e) => setStrength(Number(e.target.value))}
                className="w-full cursor-pointer"
                style={{
                  WebkitAppearance: "none",
                  appearance: "none",
                  background: "transparent",
                  height: "12px",
                }}
              />
              <style>{`
                .variant-slider::-webkit-slider-runnable-track {
                  width: 100%;
                  height: 2px;
                  cursor: pointer;
                  background: #353535;
                  border-radius: 2px;
                }
                .variant-slider::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  height: 12px;
                  width: 12px;
                  border-radius: 50%;
                  background: #ffffff;
                  cursor: pointer;
                  margin-top: -5px;
                  box-shadow: 0 0 10px rgba(255,255,255,0.2);
                }
                .variant-slider::-moz-range-track {
                  width: 100%;
                  height: 2px;
                  cursor: pointer;
                  background: #353535;
                  border-radius: 2px;
                }
                .variant-slider::-moz-range-thumb {
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
            <div className="flex justify-between items-center mt-2">
              <span className="text-[10px] text-neutral-600 font-bold tracking-widest uppercase">
                WEAK
              </span>
              <span className="text-xs text-white font-bold">
                {getStrengthElo(strength)} ELO
              </span>
              <span className="text-[10px] text-neutral-600 font-bold tracking-widest uppercase">
                STRONG
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={initGame}
              className="bg-white/5 hover:bg-white/10 transition-all py-4 rounded-2xl flex flex-col items-center gap-2 group active:scale-95"
            >
              <span className="material-symbols-outlined text-white/60 group-hover:text-white transition-colors">
                restart_alt
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                New Game
              </span>
            </button>
            <button
              type="button"
              onClick={undoMove}
              disabled={moveHistoryRef.current.length === 0 || moving}
              className="bg-white/5 hover:bg-white/10 transition-all py-4 rounded-2xl flex flex-col items-center gap-2 group active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-white/60 group-hover:text-white transition-colors">
                undo
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                Undo
              </span>
            </button>
          </div>

          {/* Move history */}
          <MoveHistoryPanel
            history={moveHistory}
            currentMoveIndex={currentMoveIndex}
            onNavigate={navigateMove}
          />

          {/* Stats */}
          <div className="p-5 rounded-3xl border border-white/5 glass">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <span className="text-[8px] text-neutral-600 font-bold uppercase tracking-widest block mb-1">
                  Turn
                </span>
                <span className="text-sm font-bold text-white capitalize">
                  {turn}
                </span>
              </div>
              <div>
                <span className="text-[8px] text-neutral-600 font-bold uppercase tracking-widest block mb-1">
                  Moves
                </span>
                <span className="text-sm font-bold text-white">
                  {Math.floor(moveHistory.length / 2)}
                </span>
              </div>
              <div>
                <span className="text-[8px] text-neutral-600 font-bold uppercase tracking-widest block mb-1">
                  Legal
                </span>
                <span className="text-sm font-bold text-white">
                  {legalMovesList.length}
                </span>
              </div>
            </div>
            {gameOver && (
              <div className="mt-3 pt-3 border-t border-white/5 text-center">
                <span className="text-[8px] text-neutral-600 font-bold uppercase tracking-widest block mb-1">
                  Result
                </span>
                <span className="text-sm font-bold text-yellow-400">
                  {result}
                </span>
              </div>
            )}
          </div>

          {/* Thinking indicator */}
          {moving && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
              <div className="w-3 h-3 border-2 border-neutral-700 border-t-white rounded-full animate-spin" />
              <span className="text-xs text-neutral-500 font-medium tracking-wide">
                Engine calculating...
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
