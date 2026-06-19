import { type OpeningLine } from '../openingLines';

export const defendNoobLines: OpeningLine[] = [
  {
    id: "defend-scholars-mate",
    name: "Defending the Scholar's Mate",
    eco: "C20",
    group: "Defend Noob Attacks",
    moves: [
      { san: "e4", hint: null },
      { san: "e5", hint: "Play e5 — claim central space naturally" },
      { san: "Qh5", hint: null },
      { san: "Nc6", hint: "Play Nc6 — White threatens e5. Defend your central pawn first before kicking the queen" },
      { san: "Bc4", hint: null },
      { san: "g6", hint: "Play g6 — White threatens checkmate on f7! Block the path and attack the queen simultaneously" },
      { san: "Qf3", hint: null },
      { san: "Nf6", hint: "Play Nf6 — White resets the checkmate threat on f7. Block it again with a natural knight development" }
    ]
  },
  {
    id: "defend-fried-liver-traxler",
    name: "Fried Liver: Traxler Counter-Attack",
    eco: "C57",
    group: "Defend Noob Attacks",
    moves: [
      { san: "e4", hint: null },
      { san: "e5", hint: "Play e5 — establish your central presence" },
      { san: "Nf3", hint: null },
      { san: "Nc6", hint: "Play Nc6 — defend your e5 pawn" },
      { san: "Bc4", hint: null },
      { san: "Nf6", hint: "Play Nf6 — the Two Knights Defense, daring White to jump forward" },
      { san: "Ng5", hint: null },
      { san: "Bc5", hint: "Play Bc5 — the Traxler Counter-Attack! Ignore White's f7 threat and launch an even deadlier counter-attack on White's f2 square" }
    ]
  },
  {
    id: "defend-icbm-gambit",
    name: "Defending the ICBM Gambit",
    eco: "A40",
    group: "Defend Noob Attacks",
    moves: [
      { san: "d4", hint: null },
      { san: "Nf6", hint: "Play Nf6 — develop normally against the Queen's Pawn opening" },
      { san: "e4", hint: null },
      { san: "Nxe4", hint: "Play Nxe4 — accept the free pawn! This is the Tennison Gambit" },
      { san: "Nc3", hint: null },
      { san: "Nf6", hint: "Play Nf6 — retreat your knight safely to safeguard your material advantage" },
      { san: "Bg5", hint: null },
      { san: "Nc6", hint: "Play Nc6 — the vital antidote! Develop naturally to prepare a safe escape route for your king" }
    ]
  },
  {
    id: "defend-wayward-queen-early-nf6",
    name: "Punishing 2.Qh5 (Wayward Queen)",
    eco: "C20",
    group: "Defend Noob Attacks",
    moves: [
      { san: "e4", hint: null },
      { san: "e5", hint: "Play e5 — match White's central footprint" },
      { san: "Qh5", hint: null },
      { san: "Nc6", hint: "Play Nc6 — protect your e5 pawn before you worry about White's misplaced queen" },
      { san: "Nf3", hint: null },
      { san: "g6", hint: "Play g6 — White tries to pressure e5 again; force the queen to move away with a tempo" }
    ]
  },
  {
    id: "defend-blackburne-shilling",
    name: "Refuting the Blackburne Shilling Trap",
    eco: "C50",
    group: "Defend Noob Attacks",
    moves: [
      { san: "e4", hint: null },
      { san: "e5", hint: "Play e5 — secure your share of the center" },
      { san: "Nf3", hint: null },
      { san: "Nc6", hint: "Play Nc6 — develop and defend your e5 pawn" },
      { san: "Bc4", hint: null },
      { san: "Nd4", hint: "Play Nxe5! — Black offers a bait pawn on e5. Ignore the trap, take the free knight, and enjoy a massive advantage" }
    ]
  },
  {
    id: "defend-englund-gambit",
    name: "Crushing the Englund Gambit Trap",
    eco: "A40",
    group: "Defend Noob Attacks",
    moves: [
      { san: "d4", hint: null },
      { san: "e5", hint: "Play dxe5 — accept the gambit pawn. Black is playing a highly unsound psychological line" },
      { san: "dxe5", hint: null },
      { san: "Nc6", hint: "Play Nf3 — develop your knight naturally to defend your extra e5 pawn" },
      { san: "Nf3", hint: null },
      { san: "Qe7", hint: "Play Bf4 — bring out your bishop to add a second defender to your e5 pawn" },
      { san: "Bf4", hint: null },
      { san: "Qb4+", hint: "Play Bd2 — Black forks your king, bishop, and b2 pawn. Step back with the bishop to block check and counter-attack their queen" }
    ]
  },
  {
    id: "defend-fried-liver-polerio",
    name: "Fried Liver: Solid Polerio Defense",
    eco: "C57",
    group: "Defend Noob Attacks",
    moves: [
      { san: "e4", hint: null },
      { san: "e5", hint: "Play e5 — stake your claim in the center" },
      { san: "Nf3", hint: null },
      { san: "Nc6", hint: "Play Nc6 — defend your central pawn" },
      { san: "Bc4", hint: null },
      { san: "Nf6", hint: "Play Nf6 — the Two Knights Defense" },
      { san: "Ng5", hint: null },
      { san: "d5", hint: "Play d5 — block the bishop's line of sight to your weak f7 square immediately" },
      { san: "exd5", hint: null },
      { san: "Na5", hint: "Play Na5 — the crucial main-line move! Attack White's dangerous bishop and force it away" }
    ]
  },
  {
    id: "crush-halloween-gambit",
    name: "Crushing the Halloween Gambit",
    eco: "C47",
    group: "Defend Noob Attacks",
    moves: [
      { san: "e4", hint: null },
      { san: "e5", hint: "Play e5 — claim the center" },
      { san: "Nf3", hint: null },
      { san: "Nc6", hint: "Play Nc6 — develop your knight" },
      { san: "Nc3", hint: null },
      { san: "Nf6", hint: "Play Nf6 — the Four Knights Game" },
      { san: "Nxe5", hint: null },
      { san: "Nxe5", hint: "Play Nxe5 — White sacks a knight! Accept the gift" },
      { san: "d4", hint: null },
      { san: "Nc6", hint: "Play Nc6 — White aims to push e5 next. Pulling back to c6 prepares a vicious center strike" },
      { san: "d5", hint: null },
      { san: "Ne5", hint: "Play Ne5 — move your knight deeper into enemy territory, forcing White to overextend" },
      { san: "f4", hint: null },
      { san: "Ned7", hint: "Play Ned7 — White's center is completely overextended. You are up a full piece and ready to strike back" }
    ]
  },
  {
    id: "crush-danish-gambit",
    name: "Danish Gambit: Schlechter Defense",
    eco: "C21",
    group: "Defend Noob Attacks",
    moves: [
      { san: "e4", hint: null },
      { san: "e5", hint: "Play e5 — control the center" },
      { san: "d4", hint: null },
      { san: "exd4", hint: "Play exd4 — take White's center pawn" },
      { san: "c3", hint: null },
      { san: "dxc3", hint: "Play dxc3 — take the second pawn confidently" },
      { san: "Bc4", hint: null },
      { san: "cxb2", hint: "Play cxb2 — accept the third pawn! White gets scary bishops, but you have the antidote" },
      { san: "Bxb2", hint: null },
      { san: "d5", hint: "Play d5! — the Schlechter Defense! Immediately give one pawn back to open lines and neutralize White's attacking bishops" }
    ]
  },
  {
    id: "crush-smith-morra-gambit",
    name: "Smith-Morra Gambit: Chicago Defense",
    eco: "B21",
    group: "Defend Noob Attacks",
    moves: [
      { san: "e4", hint: null },
      { san: "c4", hint: "Play c5 — the Sicilian Defense" },
      { san: "d4", hint: null },
      { san: "cxd4", hint: "Play cxd4 — take the central gambit pawn" },
      { san: "c3", hint: null },
      { san: "dxc3", hint: "Play dxc3 — accept the free c3 pawn" },
      { san: "Nxc3", hint: null },
      { san: "Nc6", hint: "Play Nc6 — develop your knight normally" },
      { san: "Nf3", hint: null },
      { san: "d6", hint: "Play d6 — fight for control over the e5 square" },
      { san: "Bc4", hint: null },
      { san: "e6", hint: "Play e6 — the Chicago Defense. Build a rock-solid wall to totally shut down White's dangerous c4 bishop" }
    ]
  },
  {
    id: "crush-schliemann-gambit",
    name: "Crushing the Schliemann Gambit",
    eco: "C63",
    group: "Defend Noob Attacks",
    moves: [
      { san: "e4", hint: null },
      { san: "e5", hint: "Play e5 — regular central opening" },
      { san: "Nf3", hint: null },
      { san: "Nc6", hint: "Play Nc6 — develop your knight" },
      { san: "Bb5", hint: null },
      { san: "f5", hint: "Play Nc3! — Black tries an aggressive early flank attack. Ignore the bait, defend e4, and prepare to blow open the center" }
    ]
  },
  {
    id: "crush-jerome-gambit",
    name: "Crushing the Jerome Gambit",
    eco: "C50",
    group: "Defend Noob Attacks",
    orientation: "black",
    moves: [
      { san: "e4", hint: null },
      { san: "e5", hint: "Play e5 — standard central layout" },
      { san: "Nf3", hint: null },
      { san: "Nc6", hint: "Play Nc6 — develop and defend" },
      { san: "Bc4", hint: null },
      { san: "Bc5", hint: "Play Bc5 — the standard Italian Game framework" },
      { san: "Bxf7+", hint: null },
      { san: "Kxf7", hint: "Play Kxf7 — White has lost his mind and sacrificed a full bishop. Take it confidently!" },
      { san: "Nxe5+", hint: null },
      { san: "Nxe5", hint: "Play Nxe5 — White sacrifices a second piece! Chop it off. You are now up massive material" },
      { san: "Qh5+", hint: null },
      { san: "Kf8", hint: "Play Kf8! — The clinical retreat. Do not push g6 or move forward. Step your king back to complete safety" },
      { san: "Qxe5", hint: null },
      { san: "d6", hint: "Play d6! — Kick White's lonely queen with a tempo. White has no more attacking pieces left and you are completely winning" },
    ],
  },

];
