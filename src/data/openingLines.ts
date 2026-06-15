export interface OpeningLine {
  id: string;
  name: string;
  eco: string;
  moves: { san: string; hint: string | null }[];
}

const openingLines: OpeningLine[] = [
  {
    id: "sicilian-najdorf-main",
    name: "Sicilian Defense: Najdorf",
    eco: "B90",
    moves: [
      { san: "e4", hint: null },
      { san: "c5", hint: "Play c5 — the Sicilian's signature move, fighting for center control from the flank" },
      { san: "Nf3", hint: null },
      { san: "d6", hint: "Support c5 with d6, preparing Nf6 and keeping the center flexible" },
      { san: "d4", hint: null },
      { san: "cxd4", hint: "Capture the d4 pawn — opening the c-file for your rook" },
      { san: "Nxd4", hint: null },
      { san: "Nf6", hint: "Develop the knight to f6, attacking the e4 pawn" },
      { san: "Nc3", hint: null },
      { san: "a6", hint: "Play a6 — the Najdorf hallmark! Prevents Nb5 and prepares b5" },
    ],
  },
];

export default openingLines;
