import { Chess, Position, Board, SquareSet, Material, parseUci, makeUci, compat, variant, fen } from 'chessops';
import type { Role, Setup, Square } from 'chessops';

export interface VariantConfig {
  id: string;
  title: string;
  icon: string;
}

export const VARIANT_CONFIGS: Record<string, VariantConfig> = {
  chess960: { id: 'chess960', title: 'Chess 960', icon: 'shuffle' },
  giveaway: { id: 'giveaway', title: 'Giveaway', icon: 'heart_broken' },
  crazyhouse: { id: 'crazyhouse', title: 'Crazyhouse', icon: 'cyclone' },
  atomic: { id: 'atomic', title: 'Atomic', icon: 'explosion' },
};

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function sq(file: number, rank: number): Square {
  return (file + rank * 8) as Square;
}

function generateChess960Setup(): Setup {
  const board = Board.empty();
  const darkFiles = [1, 3, 5, 7];
  const lightFiles = [0, 2, 4, 6];
  const rank = new Array<Role | null>(8).fill(null);
  rank[darkFiles[Math.floor(Math.random() * 4)]] = 'bishop';
  rank[lightFiles[Math.floor(Math.random() * 4)]] = 'bishop';
  const remaining = [0, 1, 2, 3, 4, 5, 6, 7].filter(i => rank[i] === null);
  const shuffled = shuffleArray(remaining);
  rank[shuffled[0]] = 'queen';
  rank[shuffled[1]] = 'knight';
  rank[shuffled[2]] = 'knight';
  const lastThree = [shuffled[3], shuffled[4], shuffled[5]].sort((a, b) => a - b);
  rank[lastThree[0]] = 'rook';
  rank[lastThree[1]] = 'king';
  rank[lastThree[2]] = 'rook';
  let castlingRights = SquareSet.empty();
  for (let f = 0; f < 8; f++) {
    const sqW = sq(f, 0);
    const sqB = sq(f, 7);
    board.set(sqW, { role: rank[f]!, color: 'white' });
    board.set(sqB, { role: rank[f]!, color: 'black' });
    board.set(sq(f, 1), { role: 'pawn', color: 'white' });
    board.set(sq(f, 6), { role: 'pawn', color: 'black' });
    if (rank[f] === 'rook') {
      castlingRights = castlingRights.with(sqW).with(sqB);
    }
  }
  return { board, pockets: Material.empty(), turn: 'white', castlingRights, epSquare: undefined, remainingChecks: undefined, halfmoves: 0, fullmoves: 1 };
}

export function createPosition(variantId: string): Position {
  switch (variantId) {
    case 'chess960': {
      const setup = generateChess960Setup();
      return Chess.fromSetup(setup).unwrap();
    }
    case 'giveaway': return variant.Antichess.default();
    case 'crazyhouse': return variant.Crazyhouse.default();
    case 'atomic': return variant.Atomic.default();
    default: throw new Error(`Unknown variant: ${variantId}`);
  }
}

export function positionToFen(pos: Position): string {
  return fen.makeFen(pos.toSetup());
}

export function applyMove(pos: Position, uci: string): boolean {
  const move = parseUci(uci);
  if (!move) return false;
  if (!pos.isLegal(move)) return false;
  try { pos.play(move); return true; } catch { return false; }
}

export function getAllUciMoves(pos: Position): string[] {
  const moves: string[] = [];
  const ctx = pos.ctx();
  for (const [from, toSet] of pos.allDests(ctx)) {
    for (const to of toSet) {
      moves.push(makeUci({ from, to }));
    }
  }
  moves.push(...getAllDropUciMoves(pos));
  return moves;
}

export function isGameOver(pos: Position): boolean {
  return pos.isEnd();
}

export function getResult(pos: Position): string {
  const outcome = pos.outcome();
  if (!outcome) return '*';
  if (outcome.winner === 'white') return '1-0';
  if (outcome.winner === 'black') return '0-1';
  return '1/2-1/2';
}

export function isPlayerTurn(pos: Position): boolean {
  return pos.turn === 'white';
}

export function getTurn(pos: Position): 'white' | 'black' {
  return pos.turn;
}

export function getLegalDests(pos: Position): Map<string, string[]> {
  return compat.chessgroundDests(pos);
}

const ROLE_TO_CHAR: Record<string, string> = { pawn: 'P', knight: 'N', bishop: 'B', rook: 'R', queen: 'Q' };
const CHAR_TO_ROLE: Record<string, Role> = { P: 'pawn', N: 'knight', B: 'bishop', R: 'rook', Q: 'queen' };

export function getPlayerPocket(pos: Position): Record<string, number> {
  const pockets = pos.pockets;
  if (!pockets) return {};
  const side = pockets.white;
  return { pawn: side.pawn, knight: side.knight, bishop: side.bishop, rook: side.rook, queen: side.queen };
}

export function getAiPocket(pos: Position): Record<string, number> {
  const pockets = pos.pockets;
  if (!pockets) return {};
  const side = pockets.black;
  return { pawn: side.pawn, knight: side.knight, bishop: side.bishop, rook: side.rook, queen: side.queen };
}

export function sparePieceToDropUci(pieceType: string, targetSquare: string): string {
  const char = pieceType[1].toUpperCase();
  return `${char}@${targetSquare}`;
}

export function getAllDropUciMoves(pos: Position): string[] {
  const drops: string[] = [];
  const pockets = pos.pockets;
  if (!pockets) return drops;
  const side = pos.turn === 'white' ? pockets.white : pockets.black;
  const dests = pos.dropDests();
  for (const role of ['pawn', 'knight', 'bishop', 'rook', 'queen'] as Role[]) {
    if (side[role] > 0) {
      for (const to of dests) {
        drops.push(makeUci({ role, to }));
      }
    }
  }
  return drops;
}


