"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { customPieces } from "@/components/chess/customPieces";
import {
  boardTheme,
  captureSquareStyle,
  legalMoveSquareStyle,
} from "@/lib/chess/boardTheme";
import { StockfishEngine } from "@/lib/chess/MoveEngine";
import { playCaptureSound, playMoveSound } from "@/lib/chess/sounds";
import { fetchPuzzleCategories } from "@/data/endgamePuzzles";

type DrillStatus = "loading" | "playing" | "thinking" | "done";

export default function CheckmateDrill() {
  const chessRef = useRef<Chess | null>(null);
  const engineRef = useRef<StockfishEngine | null>(null);
  const allFensRef = useRef<string[] | null>(null);
  const [position, setPosition] = useState("");
  const [userColor, setUserColor] = useState<"w" | "b">("w");
  const [status, setStatus] = useState<DrillStatus>("loading");
  const [moveCount, setMoveCount] = useState(0);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);

  const statusRef = useRef<DrillStatus>("loading");
  statusRef.current = status;

  const clearSelection = useCallback(() => {
    setSelectedSquare(null);
    setLegalMoves([]);
  }, []);

  const terminateEngine = useCallback(() => {
    engineRef.current?.terminate();
    engineRef.current = null;
  }, []);

  const pickRandomFen = useCallback(async (): Promise<string> => {
    if (!allFensRef.current) {
      const cats = await fetchPuzzleCategories();
      allFensRef.current = cats.flatMap((c) =>
        c.positions.map((p) => p.fen),
      );
    }
    const pool = allFensRef.current;
    if (pool.length === 0) return new Chess().fen();
    for (let attempt = 0; attempt < 20; attempt++) {
      const fen = pool[Math.floor(Math.random() * pool.length)];
      try {
        const g = new Chess(fen);
        if (!g.isGameOver()) return fen;
      } catch {}
    }
    return pool[0];
  }, []);

  const newPosition = useCallback(async () => {
    terminateEngine();
    const fen = await pickRandomFen();
    chessRef.current = new Chess(fen);
    setUserColor(fen.includes(" w ") ? "w" : "b");
    setPosition(fen);
    setMoveCount(0);
    setStatus("playing");
    clearSelection();
  }, [terminateEngine, pickRandomFen, clearSelection]);

  useEffect(() => {
    newPosition();
    return () => terminateEngine();
  }, [newPosition, terminateEngine]);

  const freezeSilently = useCallback(() => {
    setStatus("done");
  }, []);

  const scheduleEngineMove = useCallback(() => {
    const game = chessRef.current;
    if (!game) return;
    const engineColor = userColor === "w" ? "b" : "w";
    if (game.turn() !== engineColor) return;
    if (statusRef.current !== "playing") return;

    setStatus("thinking");
    if (!engineRef.current) {
      engineRef.current = new StockfishEngine(
        "/stockfish/stockfish-18-lite-single.js",
        900,
      );
    }

    engineRef.current.getNextMove(game, 600).then((uci) => {
      if (statusRef.current !== "thinking") return;
      if (!uci) {
        setStatus("playing");
        return;
      }
      try {
        const isCapture = !!game.get(uci.slice(2, 4) as any);
        game.move(uci, { strict: false });
        setPosition(game.fen());
        setMoveCount((c) => c + 1);
        if (isCapture) playCaptureSound();
        else playMoveSound();
        if (game.isGameOver()) {
          freezeSilently();
          return;
        }
        setStatus("playing");
      } catch {
        setStatus("playing");
      }
    });
  }, [userColor, freezeSilently]);

  const executeUserMove = useCallback(
    (source: string, target: string): boolean => {
      if (statusRef.current !== "playing") return false;
      const game = chessRef.current;
      if (!game) return false;
      const piece = game.get(source as any);
      if (!piece || piece.color !== userColor) return false;

      try {
        const isCapture = !!game.get(target as any);
        game.move({ from: source as any, to: target as any, promotion: "q" });
        setPosition(game.fen());
        setMoveCount((c) => c + 1);
        if (isCapture) playCaptureSound();
        else playMoveSound();
        clearSelection();
        if (game.isGameOver()) {
          freezeSilently();
          return true;
        }
        scheduleEngineMove();
        return true;
      } catch {
        return false;
      }
    },
    [userColor, clearSelection, scheduleEngineMove, freezeSilently],
  );

  const handleSquareClick = useCallback(
    ({ square }: { square: string }) => {
      if (statusRef.current !== "playing") return;
      const game = chessRef.current;
      if (!game) return;
      const piece = game.get(square as any);
      if (selectedSquare === square) {
        clearSelection();
        return;
      }
      if (piece && piece.color === userColor) {
        const moves = game.moves({ square: square as any, verbose: true });
        setSelectedSquare(square);
        setLegalMoves(moves.map((m) => m.to));
        return;
      }
      if (selectedSquare && legalMoves.includes(square)) {
        executeUserMove(selectedSquare, square);
      }
    },
    [selectedSquare, legalMoves, executeUserMove, clearSelection, userColor],
  );

  const handlePieceDrop = useCallback(
    (sourceSquare: string, targetSquare: string | null): boolean => {
      if (!targetSquare) return false;
      clearSelection();
      return executeUserMove(sourceSquare, targetSquare);
    },
    [executeUserMove, clearSelection],
  );

  const handlePieceDrag = useCallback(
    ({ square }: { square: string | null }) => {
      if (!square) return;
      const game = chessRef.current;
      if (!game) return;
      const piece = game.get(square as any);
      if (piece && piece.color === userColor) {
        const moves = game.moves({ square: square as any, verbose: true });
        setSelectedSquare(square);
        setLegalMoves(moves.map((m) => m.to));
      }
    },
    [userColor],
  );

  const squareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    const game = chessRef.current;
    if (!game) return styles;
    for (const sq of legalMoves) {
      const target = game.get(sq as any);
      styles[sq] = target ? captureSquareStyle : legalMoveSquareStyle;
    }
    return styles;
  }, [legalMoves]);

  const orientation: "white" | "black" = userColor === "w" ? "white" : "black";
  const canPlay = status === "playing";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 flex justify-center">
        <div className="relative w-full max-w-[440px]">
          <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            {position ? (
              <Chessboard
                options={{
                  id: "checkmate-drill",
                  position,
                  pieces: customPieces,
                  squareStyles,
                  boardOrientation: orientation,
                  onPieceDrop: ({ sourceSquare, targetSquare }) =>
                    handlePieceDrop(sourceSquare, targetSquare),
                  onSquareClick: handleSquareClick,
                  onPieceDrag: handlePieceDrag,
                  allowDragging: canPlay,
                  showAnimations: false,
                  boardStyle: { borderRadius: "0" },
                  darkSquareStyle: { backgroundColor: boardTheme.darkSquare },
                  lightSquareStyle: { backgroundColor: boardTheme.lightSquare },
                }}
              />
            ) : (
              <div className="w-full aspect-square flex items-center justify-center bg-surface-container-low">
                <span className="material-symbols-outlined text-white/20 animate-spin text-3xl">
                  autoplay
                </span>
              </div>
            )}
          </div>

          <div className="absolute top-3 left-3 z-10">
            <span className="px-3 py-1 bg-black/70 text-white text-[10px] font-bold uppercase tracking-widest rounded-full backdrop-blur-sm">
              {status === "loading"
                ? "Loading..."
                : `${userColor === "w" ? "White" : "Black"} to mate`}
            </span>
          </div>

          {status === "thinking" && (
            <div className="absolute top-3 right-3 z-10 px-3 py-1 bg-black/70 text-white text-[10px] font-bold uppercase tracking-widest rounded-full backdrop-blur-sm animate-pulse">
              Engine thinking...
            </div>
          )}

        </div>
      </div>

      <div className="lg:col-span-5 space-y-4">
        <div className="bg-surface-container border border-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-on-surface-variant">
              bolt
            </span>
            <h3 className="font-bold text-white uppercase tracking-wider text-sm">
              Checkmate Stockfish
            </h3>
          </div>
          <p className="text-sm text-on-surface-variant font-medium leading-relaxed">
            A random endgame position loaded from the training database. You
            play{" "}
            <span className="text-white font-bold">
              {userColor === "w" ? "White" : "Black"}
            </span>{" "}
            against Stockfish. Deliver checkmate.
          </p>
          <p className="text-xs text-on-surface-variant/60 leading-relaxed">
            No hints, no undo, no fanfare — when the king falls, the drill just
            stops.
          </p>
        </div>

        <div className="bg-surface-container border border-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
              Moves played
            </span>
            <span className="text-2xl font-black text-white tabular-nums">
              {moveCount}
            </span>
          </div>
          <button
            type="button"
            onClick={newPosition}
            className="w-full py-3 rounded-xl bg-primary text-on-primary text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity cursor-pointer"
          >
            New Position
          </button>
        </div>
      </div>
    </div>
  );
}
