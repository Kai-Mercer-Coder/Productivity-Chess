const { Chess } = require("chess.js");
const fs = require("fs");
const path = require("path");

const PGN = `1. c4 Nf6 2. Nf3 g6 3. g3 Bg7 4. Bg2 O-O 5. d4 d6 6. Nc3 Nbd7 7. O-O e5 8. e4 c6 9. h3 Qb6 10. d5 cxd5 11. cxd5 Nc5 12. Ne1 Bd7 13. Nd3 Nxd3 14. Qxd3 Rfc8 15. Rb1 Nh5 16. Be3 Qb4 17. Qe2 Rc4 18. Rfc1 Rac8 19. Kh2 f5 20. exf5 Bxf5 21. Ra1 Nf4!! 22. gxf4 exf4 23. Bd2 Qxb2 24. Rab1 f3 25. Bxf3 Be5+ 26. Kg2 Bxb1 27. Rxb1 Qc2 28. Bg4 Rd8 29. Be6+ Kh8 30. Rc1 Qb2 31. Qe1 Rf8 32. Ne2 Re4 33. Qd1 Qb6 34. Qe1 Qa6 35. Be3 Qd3 36. Rd1 Qb5 37. Ng3 Ra4 38. Qd2 Qa6 39. Rc1 Ra3 40. Bh6 Re8 41. Rc7 Qb6 42. Rf7 Ra4 43. Qg5 Qd4 44. Nf5 Qe4+ 0-1`;

const start = new Chess();

// Collect all positions (start + after each move)
const walk = new Chess();
walk.loadPgn(PGN);
const history = walk.history({ verbose: true });
const positions = [];
const collector = new Chess();
positions.push({ fen: collector.fen(), move: { san: "", uci: "" } });
for (const mv of history) {
  collector.move(mv);
  positions.push({ fen: collector.fen(), move: { san: mv.san, uci: mv.from + mv.to } });
}

console.log("Total positions:", positions.length, "moves:", history.length);

// Hand-authored eval curve in centipawns from White's perspective, per position index.
// Based on the actual game: White starts ~+0.2, Black's opening is fine, then Tal's
// Nf4!! sacrifice swings it, Black converts. Values are plausible engine evals.
// Tail (last 3) are mate-in-1/deciding conversions -> keep large negative.
const EVAL = [
  25, 20, 15, 10, 12, 5, 5, 0, -5, 0, -10, -15, -20, -30, -25, -35, -40, -45, -55,
  -50, -65, -80, -150, // Nf4!! lands -> Black clearly better
  -180, -200, -230, -260, -300, -340, -380, -420, -460, -500, -540, -580, -620,
  -680, -720, -760, -810, -860, -920, -960, -1000, -1050, -1100, -1150, -1200
];
// Extend to cover all 89 positions with monotonically worsening White eval after Nf4.
while (EVAL.length < 89) {
  const last = EVAL[EVAL.length - 1];
  EVAL.push(Math.max(-1350, last - 15));
}

// For positions near mate (end of game), use mate scores.
const MATE_IDX = [86, 87, 88]; // final stretch: Black is delivering mate

// Hand-authored classifications per position index (index 0 = start pos, so move i => positions[i+1])
// i odd => White's move; i even (>=2) => Black's move.
// - Opening (i <= 21): book / theory
// - 22: Nf4!! Brilliant (Black)
// - 23..43: Tal's combination -> Black excellent/great/best; White inaccuracies/mistakes/blunder
// - 44..: Black converts -> mostly best (some great), White scrambling (mistakes/blunders)
function classify(i) {
  if (i === 0) return "book";
  const isWhite = i % 2 === 1;
  if (i <= 21) return "book";
  if (i <= 43) {
    if (isWhite) {
      // White (after the sac) misses the thread: blunder/inaccuracy/mistake mix
      if (i === 23) return "blunder"; // 23...? actually 22.Bd2 well, keep for flavour
      if ([25, 29, 33, 35].includes(i)) return "inaccuracy";
      if ([27, 31, 37].includes(i)) return "mistake";
      return "inaccuracy";
    }
    // Black, combining
    if ([25, 27, 29, 31, 35].includes(i)) return "excellent";
    if (i === 23) return "great";
    return "best";
  }
  // i >= 44 conversion phase
  if (isWhite) {
    return [45, 49, 53].includes(i) ? "blunder" : "inaccuracy";
  }
  return "best";
}

const buildPositions = positions.map((p, i) => {
  const evalCp = EVAL[i] ?? 0;
  let evaluation;
  if (MATE_IDX.includes(i)) {
    evaluation = { type: "mate", value: i % 2 === 0 ? 1 : -1 };
  } else {
    evaluation = { type: "cp", value: evalCp };
  }
  return {
    fen: p.fen,
    move: p.move,
    topLines: [
      {
        id: 1,
        depth: 18,
        evaluation,
        moveUCI: p.move.uci,
        moveSAN: p.move.san,
        continuation: [],
      },
    ],
    classification: classify(i),
    worker: "demo",
  };
});

// Mark Tal's Nf4!! (Black's 21st move) as Brilliant by SAN lookup, to be robust.
const brilliantIdx = buildPositions.findIndex((b, i) => i >= 2 && b.move.san === "Nf4");
if (brilliantIdx > 0) buildPositions[brilliantIdx].classification = "brilliant";

// Recompute classification counts from buildPositions to keep counts consistent
const wc = {};
const bc = {};
buildPositions.forEach((b, i) => {
  const target = i === 0 ? wc : i % 2 === 1 ? wc : bc;
  target[b.classification] = (target[b.classification] || 0) + 1;
});
console.log("brilliant at index", brilliantIdx, "san", buildPositions[brilliantIdx]?.move.san);

// Accuracy (rough, plausible): White ~78%, Black ~91% (Tal won cleanly)
const report = {
  accuracies: { white: 78.4, black: 91.2 },
  classifications: { white: wc, black: bc },
  positions: buildPositions,
};

const outPath = path.join(__dirname, "..", "src", "data", "demoReview.json");
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log("Wrote", outPath, "-", fs.statSync(outPath).size, "bytes");
console.log("Classifications white:", JSON.stringify(wc));
console.log("Classifications black:", JSON.stringify(bc));
