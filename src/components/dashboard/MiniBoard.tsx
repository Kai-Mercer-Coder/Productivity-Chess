"use client";

import { Chessboard } from "react-chessboard";
import { customPieces } from "@/components/chess/customPieces";
import { boardTheme } from "@/lib/chess/boardTheme";

export default function MiniBoard({
  id,
  fen,
  orientation = "white",
}: {
  id: string;
  fen: string;
  orientation?: "white" | "black";
}) {
  return (
    <div className="w-full aspect-square rounded-lg overflow-hidden border border-white/10 bg-black/40 shrink-0">
      <Chessboard
        options={{
          id: `mini-${id}`,
          position: fen,
          pieces: customPieces,
          boardOrientation: orientation,
          allowDragging: false,
          showAnimations: false,
          showNotation: false,
          boardStyle: { borderRadius: "0" },
          darkSquareStyle: { backgroundColor: boardTheme.darkSquare },
          lightSquareStyle: { backgroundColor: boardTheme.lightSquare },
        }}
      />
    </div>
  );
}
