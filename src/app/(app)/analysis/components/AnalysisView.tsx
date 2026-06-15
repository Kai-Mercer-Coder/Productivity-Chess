"use client";

import { Chessboard } from "react-chessboard";
import type { PieceDropHandlerArgs } from "react-chessboard";
import { customPieces } from "@/components/chess/customPieces";
import { boardTheme } from "@/lib/chess/boardTheme";
import MoveHistory from "./MoveHistory";

function AnalysisView({
  moves,
  navIndex,
  onNavigate,
  onPieceDrop,
  onReset,
  orientation,
  onFlipBoard,
  onCopyFen,
  fen,
}: {
  moves: string[];
  navIndex: number;
  onNavigate: (index: number) => void;
  onPieceDrop: (args: PieceDropHandlerArgs) => boolean;
  onReset: () => void;
  orientation: "white" | "black";
  onFlipBoard: () => void;
  onCopyFen: () => void;
  fen: string;
}) {
  return (
    <section className="flex gap-8 pt-6 flex-col items-center justify-center w-full xl:flex-row xl:items-start">
      <div className="flex flex-col gap-3 shrink-0">
        <div className="relative p-[3px] bg-neutral-800 rounded-lg ring-1 ring-white/4">
          <div className="relative w-[580px] h-[580px] bg-neutral-900 rounded-md overflow-hidden">
            <Chessboard
              options={{
                id: "analysis-board",
                position: fen,
                pieces: customPieces,
                onPieceDrop,
                boardOrientation: orientation,
                boardStyle: { borderRadius: "0.5rem" },
                darkSquareStyle: { backgroundColor: boardTheme.darkSquare },
                lightSquareStyle: { backgroundColor: boardTheme.lightSquare },
                animationDurationInMs: 400,
                allowDragging: true,
                showAnimations: true,
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onFlipBoard}
            className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] font-black uppercase tracking-widest text-neutral-400 hover:text-white transition-all active:scale-[0.99]"
          >
            <span className="material-symbols-outlined text-lg">flip</span>
            Flip Board
          </button>
          <button
            type="button"
            onClick={onCopyFen}
            className="flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] font-black uppercase tracking-widest text-neutral-400 hover:text-white transition-all active:scale-[0.99]"
          >
            <span className="material-symbols-outlined text-lg">content_copy</span>
            Copy FEN
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={onReset}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-red-500/20 text-neutral-500 hover:text-red-400 text-[11px] font-black uppercase tracking-widest transition-all active:scale-[0.99]"
          >
            <span className="material-symbols-outlined text-lg">close</span>
            New Analysis
          </button>
        </div>
      </div>

      <div className="w-full xl:w-[380px] shrink-0">
        <div className="rounded-3xl border border-white/5 shadow-xl glass overflow-hidden flex flex-col h-[640px]">
          <MoveHistory
            moves={moves}
            navIndex={navIndex}
            onNavigate={onNavigate}
          />
        </div>
      </div>
    </section>
  );
}

export default AnalysisView;
