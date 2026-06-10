import { ChessTactics } from "chess-tactics";
import type { EvaluatedPosition } from "../types/Position";

const tacticMessages: Record<string, string> = {
  fork: "Watch out! That move creates a dangerous fork.",
  pin: "Be careful — that move pins a piece.",
  skewer: "That move sets up a nasty skewer.",
  sacrifice: "Material was just sacrificed — look out for a follow-up!",
  trap: "That move could be a trap. Stay alert!",
  hanging: "You've left a piece hanging!",
};

const classificationMessages: Record<string, string> = {
  brilliant: "Mastermind move! You've orchestrated a deeply punishing line that shifts the balance.",
  great: "Great move! A strong continuation that maintains pressure.",
  best: "The engine approves — this was the best move in the position.",
  excellent: "Excellent! A very strong move that keeps the advantage.",
  good: "A solid, text-book developmental move. Keep maintaining control of the center.",
  book: "That's a book move — you're following established theory.",
  inaccuracy: "This is an inaccuracy. You're letting your opponent dictate the pace.",
  mistake: "That's a mistake. Look for safer alternatives.",
  blunder: "Ouch! That move completely gives away the advantage.",
  forced: "This move was forced — you had no good alternatives.",
};

export function getCoachMessage(
  currentPos: EvaluatedPosition | null,
  prevPos: EvaluatedPosition | null,
  classification: string | null,
): string | null {
  if (!currentPos) return null;

  try {
    const tactics = new ChessTactics();
    const bestLine = currentPos.topLines?.[0];
    const continuation: string[] = (bestLine as any)?.continuation ?? [];
    // Limit to 5 plies max — chess-tactics library rejects longer sequences
    const MAX_PLIES = 5;
    const sequence = bestLine?.moveUCI
      ? [bestLine.moveUCI, ...continuation].filter(Boolean).slice(0, MAX_PLIES).join(" ")
      : "";

    if (sequence && prevPos) {
      const prevBest = prevPos.topLines?.[0];
      const prevContinuation: string[] = (prevBest as any)?.continuation ?? [];
      const prevSequence = prevBest?.moveUCI
        ? [prevBest.moveUCI, ...prevContinuation].filter(Boolean).slice(0, MAX_PLIES).join(" ")
        : "";

      const result = tactics.classify({
        position: currentPos.fen,
        evaluation: { sequence },
        prevPosition: prevPos.fen,
        prevEvaluation: { sequence: prevSequence || sequence },
        prevMove: currentPos.move.uci,
      } as any);

      if (result?.length) {
        const t = result[0];
        const msg = tacticMessages[t.type];
        if (msg) return `Coach: ${msg}`;
      }
    }
  } catch {}

  if (classification) {
    const msg = classificationMessages[classification];
    if (msg) return `Coach: ${msg}`;
  }

  return null;
}
