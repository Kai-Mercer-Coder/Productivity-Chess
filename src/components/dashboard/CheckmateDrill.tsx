"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { customPieces } from "@/components/chess/customPieces";
import { playCaptureSound, playMoveSound } from "@/lib/chess/sounds";

const DRILL_FEN = "3k4/3P4/3K4/8/8/8/8/8 w - - 0 1";

type DrillStatus = "loading" | "playing" | "thinking" | "done";

export default function CheckmateDrill() {
  const chessRef = useRef<Chess | null>(null);
  const [position, setPosition] = useState("");
  const [userColor, setUserColor] = useState<"w" | "b">("w");
  const [status, setStatus] = useState<DrillStatus>("loading");
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);

  const statusRef = useRef<DrillStatus>("loading");
  statusRef.current = status;

  const clearSelection = useCallback(() => {
    setSelectedSquare(null);
    setLegalMoves([]);
  }, []);

  const newPosition = useCallback(() => {
    chessRef.current = new Chess(DRILL_FEN);
    setUserColor("w");
    setPosition(DRILL_FEN);
    setStatus("playing");
    clearSelection();
  }, [clearSelection]);

  useEffect(() => {
    newPosition();
  }, [newPosition]);  const freezeSilently = useCallback(() => {
    setStatus("done");
  }, []);

  const scheduleEngineMove = useCallback(() => {
    const game = chessRef.current;
    if (!game) return;
    const engineColor = userColor === "w" ? "b" : "w";
    if (game.turn() !== engineColor) return;
    if (statusRef.current !== "playing") return;

    const moves = game.moves({ verbose: true });
    if (moves.length === 0) {
      freezeSilently();
      return;
    }

    setStatus("thinking");
    const reply = moves[Math.floor(Math.random() * moves.length)];
    setTimeout(() => {
      if (statusRef.current !== "thinking") return;
      try {
        const isCapture = !!game.get(reply.to as any);
        game.move({
          from: reply.from as any,
          to: reply.to as any,
          promotion: "q",
        });
        setPosition(game.fen());
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
    }, 200);
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
      styles[sq] = target
        ? {
            background: "transparent",
            boxShadow: "inset 0 0 0 3px rgba(255,255,255,0.4)",
          }
        : {
            background:
              "radial-gradient(circle at center, rgba(255,255,255,0.35) 26%, transparent 26%)",
          };
    }
    return styles;
  }, [legalMoves]);

  const orientation: "white" | "black" = userColor === "w" ? "white" : "black";
  const canPlay = status === "playing";

  return (
    <div className="w-full flex justify-center">
      <div className="relative w-full max-w-[520px]">
        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.5)] grayscale">
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
                showAnimations: true,
                animationDurationInMs: 300,
                boardStyle: { borderRadius: "0" },
                darkSquareStyle: { backgroundColor: "#1b1b1b" },
                lightSquareStyle: { backgroundColor: "#2a2a2a" },
                darkSquareNotationStyle: { color: "#9a9a9a" },
                lightSquareNotationStyle: { color: "#9a9a9a" },
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
      </div>
    </div>
  );
}
