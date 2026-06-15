"use client";

import { useMemo } from "react";
import { Chess } from "chess.js";
import { IoSettingsOutline } from "react-icons/io5";
import type { PuzzleRow } from "@/lib/puzzles/PuzzleCache";

function toSanMoves(fen: string, uciMoves: string[]): string[] {
  const chess = new Chess(fen);
  return uciMoves.map((uci) => {
    try {
      const from = uci.substring(0, 2) as any;
      const to = uci.substring(2, 4) as any;
      const promotion = uci.length > 4 ? (uci[4] as any) : undefined;
      const move = chess.move({ from, to, promotion });
      return move.san;
    } catch {
      return uci;
    }
  });
}

export function PuzzleMoveHistory({
  puzzle,
  moveIndex,
  onToggleSettings,
}: {
  puzzle: PuzzleRow | null;
  moveIndex: number;
  onToggleSettings: () => void;
}) {
  const sanMoves = useMemo(
    () => (puzzle ? toSanMoves(puzzle.fen, puzzle.moves) : []),
    [puzzle?.fen, puzzle?.moves],
  );

  const movePairs: { num: number; white: string; black: string }[] = [];
  for (let i = 0; i < sanMoves.length; i += 2) {
    movePairs.push({
      num: Math.floor(i / 2) + 1,
      white: sanMoves[i] ?? "",
      black: sanMoves[i + 1] ?? "",
    });
  }

  return (
    <div className="flex flex-col rounded-3xl overflow-hidden border border-white/5 shadow-2xl h-[400px] xl:h-[450px] glass">
      <div className="bg-surface-container-highest/50 px-8 py-5 flex justify-between items-center border-b border-white/5">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-white">
          Notation
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Settings"
            onClick={onToggleSettings}
            className="p-2 text-white transition disabled:opacity-20 font-semibold text-xl hover:rotate-180 hover:cursor-pointer hover:scale-105 duration-300"
          >
            <IoSettingsOutline />
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto space-y-4 font-mono text-sm scrollbar-hide">
        {movePairs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-neutral-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-7 h-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <span className="text-[11px]">Waiting for puzzle</span>
          </div>
        ) : (
          movePairs.map((pair) => (
            <div
              key={pair.num}
              className="flex items-center gap-6 py-2 border-b border-white/5"
            >
              <span className="w-6 text-neutral-500 font-bold">
                {pair.num}.
              </span>
              <span
                className={`flex-1 ${(() => {
                  const idx = (pair.num - 1) * 2;
                  return idx === moveIndex - 1
                    ? "text-yellow-400 font-semibold"
                    : idx < moveIndex
                      ? "text-white"
                      : "text-neutral-600";
                })()}`}
              >
                {pair.white}
              </span>
              <span
                className={`flex-1 text-right ${(() => {
                  const idx = (pair.num - 1) * 2 + 1;
                  return idx === moveIndex - 1
                    ? "text-yellow-400 font-semibold"
                    : idx < moveIndex
                      ? "text-white"
                      : "text-neutral-500";
                })()}`}
              >
                {pair.black || (pair.white ? "..." : "")}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
