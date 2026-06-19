import type { MiddleGameLine } from "./index";

const lines: MiddleGameLine[] = [
  {
    id: "knight-fork-1",
    name: "The Knight Fork — Winning the Queen",
    fen: "2b1k3/1pq1nppp/p3p3/8/3N4/8/PPPPQ1PP/R1B1K3 w Q - 0 1",
    orientation: "white",
    description:
      "Your knight on d4 is poised for a devastating fork. Find the move that wins the queen.",
    moves: [
      {
        san: "Nxe6",
        hint: "Nxe6+! The knight forks the king on e8 and queen on c7",
      },
      { san: "fxe6", hint: null },
      { san: "Qxc7", hint: "Capture the queen. You win a queen for a knight!" },
    ],
  },
];

export default lines;
