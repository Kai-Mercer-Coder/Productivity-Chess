import { Glicko2 } from "glicko2";

const TAU = 0.5;
const DEFAULT_RATING = 1200;
const DEFAULT_RD = 200;
const DEFAULT_VOL = 0.06;
const PUZZLE_RD = 30;

let ranking: Glicko2 | null = null;

function getRanking(): Glicko2 {
  if (!ranking) {
    ranking = new Glicko2({
      tau: TAU,
      rating: DEFAULT_RATING,
      rd: DEFAULT_RD,
      vol: DEFAULT_VOL,
    });
  }
  return ranking;
}

export interface GlickoResult {
  newRating: number;
  newRd: number;
  newVol: number;
  delta: number;
}

export function updatePuzzleRating(
  currentRating: number,
  currentRd: number,
  currentVol: number,
  puzzleRating: number,
  solved: boolean,
  usedHint: boolean = false
): GlickoResult {
  const r = getRanking();
  const player = r.makePlayer(currentRating, currentRd, currentVol);
  const puzzle = r.makePlayer(puzzleRating, PUZZLE_RD, DEFAULT_VOL);
  const outcome = solved ? 1 : usedHint ? 0.5 : 0;
  r.updateRatings([[player, puzzle, outcome]]);
  const newRating = Math.round(player.getRating());
  const newRd = Math.round(player.getRd() * 10) / 10;
  const newVol = Math.round(player.getVol() * 10000) / 10000;
  const delta = newRating - currentRating;
  return { newRating, newRd, newVol, delta };
}

export function getExpectedScore(
  playerRating: number,
  playerRd: number,
  opponentRating: number,
  opponentRd: number
): number {
  const r = getRanking();
  const player = r.makePlayer(playerRating, playerRd, DEFAULT_VOL);
  const opponent = r.makePlayer(opponentRating, opponentRd, DEFAULT_VOL);
  return r.predict(player, opponent);
}
