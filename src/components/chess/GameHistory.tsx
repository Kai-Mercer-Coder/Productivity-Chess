import { useEffect, useRef } from 'react';

interface GameHistoryProps {
  game: {
    chessGame: {
      history: () => string[];
      reset: () => void;
      fen: () => string;
      isCheckmate: () => boolean;
      isDraw: () => boolean;
      isStalemate: () => boolean;
      isThreefoldRepetition: () => boolean;
      isInsufficientMaterial: () => boolean;
      turn: () => 'w' | 'b';
    };
    getGameState: () => {
      fen: string;
      isGameOver: boolean;
      turn: 'w' | 'b';
      moves: any[];
    };
    setPosition: (fen: string) => void;
    resetMoveState: (clearPremoves?: boolean) => void;
  };
}

export default function GameHistory({ game }: GameHistoryProps) {
  const gameState = game.getGameState();
  const history = game.chessGame.history();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history.length]);

  const pairs: string[][] = [];
  for (let i = 0; i < history.length; i += 2) {
    pairs.push([history[i], history[i + 1]]);
  }

  let resultStr = "Game Over";
  let reasonStr = "";
  if (gameState.isGameOver) {
    if (game.chessGame.isCheckmate()) {
      resultStr = game.chessGame.turn() === 'w' ? "Black Wins" : "White Wins";
      reasonStr = "by Checkmate";
    } else if (game.chessGame.isDraw()) {
      resultStr = "Draw";
      if (game.chessGame.isStalemate()) reasonStr = "by Stalemate";
      else if (game.chessGame.isThreefoldRepetition()) reasonStr = "by Repetition";
      else if (game.chessGame.isInsufficientMaterial()) reasonStr = "by Insufficient Material";
      else reasonStr = "by 50-move rule";
    }
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-3 py-2 space-y-0.5"
      >
        {pairs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-neutral-700 p-8">
            <span className="material-symbols-outlined text-3xl">touch_app</span>
            <span className="text-[11px]">Make a move</span>
          </div>
        ) : (
          pairs.map((pair, i) => (
            <div
              key={i}
              className="grid grid-cols-[3rem_1fr_1fr] items-center px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors group"
            >
              <span className="text-[10px] font-bold text-on-surface-variant">
                {i + 1}.
              </span>
              <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">
                {pair[0]}
              </span>
              <span className="text-sm font-bold text-white/40 group-hover:text-white/70 transition-colors">
                {pair[1] || ""}
              </span>
            </div>
          ))
        )}
      </div>

      {gameState.isGameOver && (
        <div className="px-4 py-3 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                game.chessGame.isCheckmate() ? "bg-green-500" : "bg-white/40"
              } animate-pulse`}
            />
            <span className="text-xs font-black text-white uppercase tracking-wide">
              {resultStr}
            </span>
          </div>
          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
            {reasonStr}
          </span>
        </div>
      )}
    </div>
  );
}
