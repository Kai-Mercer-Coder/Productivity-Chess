import Module from 'ffish-es6';
import type { FairyStockfish, Board as FfishBoard } from 'ffish-es6';

let ffish: FairyStockfish | null = null;
let loadPromise: Promise<FairyStockfish> | null = null;

async function getFfish(): Promise<FairyStockfish> {
  if (ffish) return ffish;
  if (!loadPromise) {
    loadPromise = Module({
      locateFile: (path: string) => '/' + path,
    }).then((instance: FairyStockfish) => {
      ffish = instance;
      return instance;
    });
  }
  return loadPromise;
}

export interface VariantConfig {
  id: string;
  title: string;
  uciVariant: string;
  icon: string;
}

export const VARIANT_CONFIGS: Record<string, VariantConfig> = {
  chess960: { id: 'chess960', title: 'Chess 960', uciVariant: 'chess960', icon: 'shuffle' },
  giveaway: { id: 'giveaway', title: 'Giveaway', uciVariant: 'giveaway', icon: 'heart_broken' },
  crazyhouse: { id: 'crazyhouse', title: 'Crazyhouse', uciVariant: 'crazyhouse', icon: 'cyclone' },
  atomic: { id: 'atomic', title: 'Atomic', uciVariant: 'atomic', icon: 'explosion' },
};

const PIECE_VALUES: Record<string, number> = {
  pawn: 1, knight: 3, bishop: 3, rook: 5, queen: 9, king: 0,
};

export async function createBoard(variantId: string): Promise<FfishBoard> {
  const cfg = VARIANT_CONFIGS[variantId];
  if (!cfg) throw new Error(`Unknown variant: ${variantId}`);
  const fs = await getFfish();
  const board = new fs.Board(cfg.uciVariant);
  return board;
}

export function boardToFen(board: FfishBoard): string {
  return board.fen();
}

export function applyMove(board: FfishBoard, uci: string): boolean {
  return board.push(uci);
}

export function getLegalMoves(board: FfishBoard): string[] {
  return board.legalMoves().split(' ').filter(Boolean);
}

export function isGameOver(board: FfishBoard): boolean {
  return board.isGameOver();
}

export function getResult(board: FfishBoard): string {
  return board.result();
}

export function isPlayerTurn(board: FfishBoard, playerColor: 'white' | 'black'): boolean {
  const isWhiteTurn = board.turn();
  return (playerColor === 'white' && isWhiteTurn) || (playerColor === 'black' && !isWhiteTurn);
}

export function getTurn(board: FfishBoard): 'white' | 'black' {
  return board.turn() ? 'white' : 'black';
}

function evaluateMove(move: string, board: FfishBoard): number {
  let score = 0;
  const isCapture = board.isCapture(move);
  if (isCapture) {
    const target = move.slice(2, 4);
    const fen = board.fen();
    const fenRows = fen.split(' ')[0].split('/');
    const file = target.charCodeAt(0) - 97;
    const rank = 8 - parseInt(target[1]);
    const row = fenRows[rank];
    let idx = 0;
    for (const ch of row) {
      if (ch >= '1' && ch <= '8') {
        idx += parseInt(ch);
        continue;
      }
      if (idx === file) {
        const pieceChar = ch.toLowerCase();
        const pieceName = pieceChar === 'p' ? 'pawn' : pieceChar === 'n' ? 'knight' : pieceChar === 'b' ? 'bishop' : pieceChar === 'r' ? 'rook' : pieceChar === 'q' ? 'queen' : pieceChar === 'k' ? 'king' : 'pawn';
        score += (PIECE_VALUES[pieceName] || 0) * 100;
        break;
      }
      idx++;
    }
  }
  return score;
}

export function pickAiMove(legalMoves: string[], board: FfishBoard, strength: number): string {
  if (legalMoves.length === 0) return '';
  if (legalMoves.length === 1) return legalMoves[0];
  if (strength <= 1) return legalMoves[Math.floor(Math.random() * legalMoves.length)];

  const scored = legalMoves.map(m => ({
    move: m,
    score: evaluateMove(m, board) + Math.random() * 50,
  }));

  scored.sort((a, b) => b.score - a.score);
  const topN = Math.max(1, Math.ceil((10 - strength) / 10 * scored.length));
  const idx = Math.floor(Math.random() * topN);
  return scored[idx].move;
}

export function cleanupBoard(board: FfishBoard): void {
  board.delete();
}
