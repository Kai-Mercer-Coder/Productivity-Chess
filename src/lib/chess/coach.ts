import { ChessTactics } from "chess-tactics";
import type { EvaluatedPosition } from "../types/Position";
import { analyzeMove, isReady as isWasmReady } from "./wasm-analyzer";

const tacticMessages: Record<string, string> = {
  fork: "Watch out! That move creates a dangerous fork.",
  pin: "Be careful — that move pins a piece.",
  skewer: "That move sets up a nasty skewer.",
  sacrifice: "Material was just sacrificed — look out for a follow-up!",
  trap: "That move could be a trap. Stay alert!",
  hanging: "You've left a piece hanging!",
};

const wasmMotifMessages: Record<string, string> = {
  checkmate: "Checkmate! The game is over.",
  stalemate: "Stalemate — the game ends in a draw.",
  double_check: "Double check! Only the king can move.",
  discovered_check: "Reveals a discovered check.",
  fork: "Creates a fork — two pieces under attack!",
  pin: "Pins a piece against a more valuable target.",
  sacrifice: "A bold sacrifice with real compensation!",
  capture: "Wins material with this capture.",
  check: "Gives check — forcing a response.",
  en_passant: "Captures en passant!",
  hangs: "Leaves a piece hanging — look out!",
  defends: "Defends a previously hanging piece.",
  traps_piece: "Traps an enemy piece — it has no escape.",
  overloaded: "Overloads a defender — it can't cover everything.",
  exchange_sacrifice: "An exchange sacrifice — rook for a minor piece.",
  piece_trade: "Trades pieces of equal value.",
  queen_trade: "Trades queens.",
  simplifies: "Simplifies into a favourable endgame.",
  trades_into_endgame: "Trades into a favourable endgame.",
  trades_when_behind: "Trades when behind — relieving pressure.",
  offers_trade: "Offers a trade — testing the opponent.",
  castles_kingside: "Castles kingside for king safety.",
  castles_queenside: "Castles queenside for king safety.",
  connects_rooks: "Connects the rooks — they now defend each other.",
  loses_castling: "Loses castling rights — the king may be exposed.",
  prepares_castling_kingside: "Clears the path to castle kingside.",
  prepares_castling_queenside: "Clears the path to castle queenside.",
  greek_gift: "Greek gift sacrifice — Bxh7+!",
  smothered_hint: "Threatens smothered mate!",
  back_rank_mate_threat: "Threatens back-rank mate — give the king some air!",
  anastasia_mate_threat: "Anastasia's mate threat — knight cut-off with the rook.",
  bodens_mate_threat: "Boden's mate threat — two bishops crossing fire.",
  arabian_mate_threat: "Arabian-style mate threat — rook and knight on the cornered king.",
  passed_pawn: "Creates a dangerous passed pawn.",
  outpost: "Establishes a powerful outpost — it can't be chased away by pawns.",
  knight_invasion: "The knight invades — a powerful outpost in enemy territory.",
  knight_on_rim: "Knight on the rim — it's out of play.",
  rook_lift: "The rook lifts — joining the attack.",
  rook_seventh: "Rook on the seventh rank — dominating!",
  opens_file_for: "Opens a file for the rook.",
  opens_diagonal_for: "Opens a diagonal for the bishop.",
  fianchetto: "Fianchetto development — eyeing the long diagonal.",
  bad_bishop: "The bishop is hemmed in by its own pawns.",
  bishop_pair_lost: "Loses the bishop pair advantage.",
  iqp_self: "Creates an isolated queen pawn — a potential weakness.",
  iqp_them: "Inflicts an isolated queen pawn on the opponent.",
  isolated_pawn: "Creates an isolated pawn weakness.",
  doubled_pawns_them: "Inflicts doubled pawns on the opponent.",
  luft: "Creates luft — the king gets an escape square.",
  pawn_lever: "A pawn lever — challenging the opponent's pawn structure.",
  pawn_break: "A pawn break, shattering the opponent's formation.",
  pawn_breakthrough: "A pawn breakthrough — could decide the game!",
  pawn_storm: "A pawn storm on the king's wing!",
  centralizes: "Centralizes the piece — maximum influence.",
  develops: "Develops the piece — getting pieces into the game.",
  activates: "Activates the piece — from passive to active.",
  restricts: "Restricts the opponent's options.",
  threatens: "Creates a direct threat.",
  attacks_king: "Joins the attack on the king.",
  eyes_king_zone: "Eyes the king zone — pressure building.",
  prophylaxis: "A prophylactic move — preventing the opponent's plan.",
  multi_purpose: "A multi-purpose move — addressing several threats at once.",
  decisive_combination: "A decisive combination that shifts the balance.",
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

const COACH_EMOJIS: Record<string, string> = {
  checkmate: "🏆",
  stalemate: "🤝",
  brilliant: "👑",
  great: "⭐",
  best: "✅",
  excellent: "👍",
  good: "👌",
  book: "📖",
  inaccuracy: "⚠️",
  mistake: "❌",
  blunder: "💥",
  forced: "🔗",
  fork: "🍴",
  pin: "📍",
  sacrifice: "🔥",
  greek_gift: "🎁",
  smothered_hint: "💀",
  back_rank_mate_threat: "🪟",
  outpost: "🏰",
  knight_invasion: "🐴",
  passed_pawn: "⚡",
  pawn_storm: "🌪️",
  pawn_breakthrough: "💥",
  double_check: "⚡⚡",
  rook_lift: "🏗️",
  rook_seventh: "🏗️",
  fianchetto: "📐",
  luft: "🪟",
  traps_piece: "🪤",
  overloaded: "🫠",
  exchange_sacrifice: "🔄",
  castles_kingside: "🏰",
  castles_queenside: "🏰",
  connects_rooks: "🔗",
};

export async function getCoachMessage(
  currentPos: EvaluatedPosition | null,
  prevPos: EvaluatedPosition | null,
  classification: string | null,
): Promise<string | null> {
  if (!currentPos) return null;

  // Try WASM motif detection first (70+ motif detectors)
  const wasmMessage = await getWasmCoachMessage(currentPos, prevPos);
  if (wasmMessage) return wasmMessage;

  // Fall back to chess-tactics library
  try {
    const tactics = new ChessTactics();
    const bestLine = currentPos.topLines?.[0];
    const continuation: string[] = (bestLine as any)?.continuation ?? [];
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

async function getWasmCoachMessage(
  currentPos: EvaluatedPosition | null,
  prevPos: EvaluatedPosition | null,
): Promise<string | null> {
  if (!currentPos || !prevPos) return null;
  if (!isWasmReady()) return null;

  const { uci } = currentPos.move;
  if (!uci || uci.length < 4) return null;

  try {
    const result = await analyzeMove(prevPos.fen, uci);
    if (!result?.motifs?.length) return null;

    // Get the highest priority motifs (lowest priority number)
    const motifs = result.motifs.sort((a, b) => a.priority - b.priority);
    const topMotif = motifs[0];
    const msg = wasmMotifMessages[topMotif.id];
    if (msg) {
      const emoji = COACH_EMOJIS[topMotif.id] || COACH_EMOJIS[currentPos.classification?.toLowerCase() || ""] || "";
      return `Coach ${emoji}: ${msg}`;
    }

    // If no predefined message, use the Rust-generated phrase directly
    if (topMotif.phrase) {
      return `Coach: ${topMotif.phrase}`;
    }
  } catch {}

  return null;
}
