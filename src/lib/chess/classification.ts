import { Classification } from "../types/Classification";

export { Classification };

export const classificationValues = {
  blunder: 0,
  mistake: 0.2,
  inaccuracy: 0.4,
  good: 0.65,
  excellent: 0.9,
  best: 1,
  great: 1,
  brilliant: 1,
  book: 1,
  forced: 1,
  miss: 0,
  critical: 0.4,
  theory: 1,
  risky: 0.4,
};

export const WPL_THRESHOLDS = {
  best: 0.01,
  excellent: 0.035,
  good: 0.07,
  inaccuracy: 0.1,
  mistake: 0.2,
  blunder: 1,
};

function sigmoidWinPercent(cpValue: number): number {
  return 1 / (1 + Math.exp(-0.00368208 * cpValue));
}

export function winPercent(evalValue: number, isMate: boolean): number {
  if (isMate) return evalValue > 0 ? 1 : 0;
  return sigmoidWinPercent(evalValue);
}

export function computeWPL(
  prevEvalValue: number, prevIsMate: boolean,
  currEvalValue: number, currIsMate: boolean,
  playerColor: "white" | "black",
): number {
  const side = playerColor === "white" ? 1 : -1;
  const prevWP = winPercent(prevEvalValue * side, prevIsMate);
  const currWP = winPercent(currEvalValue * side, currIsMate);
  return Math.max(0, prevWP - currWP);
}

export function wplClassify(wpl: number): Classification {
  if (wpl <= WPL_THRESHOLDS.best) return Classification.BEST;
  if (wpl <= WPL_THRESHOLDS.excellent) return Classification.EXCELLENT;
  if (wpl <= WPL_THRESHOLDS.good) return Classification.GOOD;
  if (wpl <= WPL_THRESHOLDS.inaccuracy) return Classification.INACCURACY;
  if (wpl <= WPL_THRESHOLDS.mistake) return Classification.MISTAKE;
  return Classification.BLUNDER;
}

export function isMiss(
  opponentWPL: number | undefined,
  currentWPL: number,
): boolean {
  if (opponentWPL == null) return false;
  const threshold = WPL_THRESHOLDS.inaccuracy;
  return (
    opponentWPL >= threshold &&
    currentWPL >= opponentWPL * 0.7 &&
    currentWPL < opponentWPL * 1.4
  );
}
