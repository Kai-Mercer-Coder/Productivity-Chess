export interface MiddleGameLine {
  id: string;
  name: string;
  fen: string;
  orientation: "white" | "black";
  description?: string;
  moves: { san: string; hint: string | null }[];
}

import knightForkLines from "./knight-fork";

export const middleGameLines: MiddleGameLine[] = [...knightForkLines];
