import { useState, useRef, useCallback } from "react";
import { Chess } from "chess.js";
import { StockfishEngine } from "@/lib/chess/MoveEngine";
import type { MoveEngine } from "@/lib/types/Engine";
import { playSoundForMove } from "@/lib/chess/sounds";

export function useEngine(
  game: {
    chessGame: Chess;
    setPosition(fen: string): void;
    premovesRef: { current: any[] };
    setPremoves(premoves: any[]): void;
    setShowAnimations(show: boolean): void;
  },
  initialElo = 1350,
) {
  const [elo, setElo] = useState(initialElo);
  const [isThinking, setIsThinking] = useState(false);
  const [engine] = useState<MoveEngine>(
    () => new StockfishEngine("/stockfish/stockfish-18-lite-single.js", initialElo),
  );

  const handleEloChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setElo(value);
    if (typeof (engine as StockfishEngine).setElo === "function") {
      (engine as StockfishEngine).setElo(value);
    }
  }, [engine]);

  const thinkingRef = useRef(false);

  const makeEngineMove = useCallback(
    async (onPieceDrop?: (args: any) => boolean) => {
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

      game.chessGame.move(move);
      const newFen = game.chessGame.fen();
      game.setPosition(newFen);

      playSoundForMove(game.chessGame);

      if (onPieceDrop && game.premovesRef.current.length > 0) {
        const nextPlayerPremove = game.premovesRef.current[0];
        game.premovesRef.current.splice(0, 1);

        setTimeout(() => {
          const premoveSuccessful = onPieceDrop(nextPlayerPremove);
          if (!premoveSuccessful) {
            game.premovesRef.current = [];
          }
          game.setPremoves([...game.premovesRef.current]);
          game.setShowAnimations(false);
          setTimeout(() => {
            game.setShowAnimations(true);
          }, 50);
        }, 300);
      }

      thinkingRef.current = false;
      setIsThinking(false);
    },
    [engine, game],
  );

  return {
    elo,
    isThinking,
    handleEloChange,
    makeEngineMove,
    terminate: () => engine?.terminate?.(),
  };
}