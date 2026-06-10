"use client";

import { BsFillLightbulbFill } from "react-icons/bs";

export function PuzzleInfoBar({
  playerColor,
  status,
  currentPlayerMove,
  totalPlayerMoves,
}: {
  playerColor: "w" | "b";
  status: string;
  currentPlayerMove: number;
  totalPlayerMoves: number;
}) {
  return (
    <div className="w-[520px] bg-neutral-900/80 border border-white/6 rounded-xl px-10 py-4 flex items-center justify-between backdrop-blur-sm">
      <div className="text-left flex gap-4 items-center justify-center">
        <BsFillLightbulbFill />
        <span className="flex items-center text-[14px] justify-center font-medium">
          Find the best move for{" "}
          <span>&nbsp;{playerColor === "w" ? "White." : "Black."}</span>
        </span>
      </div>

      <div className="text-right flex items-center justify-center">
        <div className="h-4.5 w-0.25 bg-neutral-700 mr-7" />
        {status === "playing" && totalPlayerMoves > 0 && (
          <span className="text-neutral-500 text-[11px] font-mono whitespace-nowrap">
            Move{" "}
            <span className="text-white font-semibold">
              {currentPlayerMove + 1}
            </span>{" "}
            / {totalPlayerMoves}
          </span>
        )}
        {status === "solved" && (
          <span className="text-white text-xs font-semibold whitespace-nowrap flex items-center gap-1.5">
            <span className="w-1 h-1 bg-white rounded-full" /> Solved
          </span>
        )}
        {status === "wrong" && (
          <span className="text-neutral-400 text-xs whitespace-nowrap">
            ✗ Incorrect
          </span>
        )}
        {status === "correct" && (
          <span className="text-white text-xs whitespace-nowrap">
            ✓ Correct
          </span>
        )}
      </div>
    </div>
  );
}
