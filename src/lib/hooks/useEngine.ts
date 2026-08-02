import { useState, useRef, useCallback } from "react";
import type { Square } from "chess.js";
import { StockfishEngine } from "@/lib/chess/MoveEngine";
import type { MoveEngine } from "@/lib/types/Engine";
import { playMoveSound } from "@/lib/chess/sounds";

export function useEngine(
  game: {
    chessGame: { fen(): string; turn(): string; move(move: string): any; isCheck(): boolean; isGameOver(): boolean; get(square: string): any; moves(opts: { verbose: true }): any[] };
    setPosition(fen: string): void;
  },
  initialElo = 1350,
) {
  const [elo, setElo] = useState(initialElo);
  const [isThinking, setIsThinking] = useState(false);
  const [engine] = useState<MoveEngine>(
    () => new StockfishEngine("/stockfish/stockfish-18-lite-single.js", initialElo),
  );

  const thinkingRef = useRef(false);

  const makeEngineMove = useCallback(
    async () => {
      if (thinkingRef.current) return;
      thinkingRef.current = true;
      setIsThinking(true);

      const startFen = game.chessGame.fen();
      const move = await engine.getNextMove(game.chessGame);

      if (game.chessGame.fen() !== startFen) {
        thinkingRef.current = false;
        setIsThinking(false);
        return;
      }

      if (!move) {
        thinkingRef.current = false;
        setIsThinking(false);
        return;
      }

      const legalMoves = game.chessGame.moves({ verbose: true });
      const matched = legalMoves.find((m) => m.san === move || m.from + m.to === move);
      if (!matched) {
        thinkingRef.current = false;
        setIsThinking(false);
        return;
      }

      const isCapture = !!game.chessGame.get(matched.to as Square);
      game.chessGame.move(move);
      const newFen = game.chessGame.fen();
      game.setPosition(newFen);

      playMoveSound({ isCapture, isCheck: game.chessGame.isCheck(), isGameOver: game.chessGame.isGameOver() });

      thinkingRef.current = false;
      setIsThinking(false);
    },
    [engine, game],
  );

  return {
    elo,
    isThinking,
    makeEngineMove,
    terminate: () => engine?.terminate?.(),
  };
}
