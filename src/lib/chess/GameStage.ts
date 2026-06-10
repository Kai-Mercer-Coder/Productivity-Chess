import { Chess, Square } from 'chess.js';

export type GameStage = 'opening' | 'middlegame' | 'endgame';

export const GAME_STAGES: GameStage[] = ['opening', 'middlegame', 'endgame'];

function countNonPawnMaterial(board: Chess): number {
    let count = 0;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const file = 'abcdefgh'[c];
            const rank = (r + 1).toString();
            const piece = board.get((file + rank) as Square);
            if (piece && piece.type !== 'p' && piece.type !== 'k') {
                count++;
            }
        }
    }
    return count;
}

function backrankPieces(board: Chess, color: 'w' | 'b'): number {
    const rank = color === 'w' ? 1 : 8;
    let count = 0;
    for (let c = 0; c < 8; c++) {
        const file = 'abcdefgh'[c];
        const piece = board.get((file + rank) as Square);
        if (piece && piece.color === color) {
            count++;
        }
    }
    return count;
}

export function getGameStage(fen: string): GameStage {
    const board = new Chess(fen);
    const nonPawnCount = countNonPawnMaterial(board);

    if (nonPawnCount <= 6) return 'endgame';
    if (nonPawnCount <= 10) return 'middlegame';

    for (const color of ['w', 'b'] as const) {
        if (backrankPieces(board, color) < 4) return 'middlegame';
    }

    return 'opening';
}

const DEVELOPING_SQUARES: Record<string, Square[]> = {
    w: [
        'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3',
        'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4',
    ],
    b: [
        'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6',
        'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5',
    ],
};

const STARTING_POSITIONS: Record<string, Square[]> = {
    w: ['a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'],
    b: ['a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8'],
};

export function isDevelopingMove(fen: string, from: Square, to: Square, pieceType: string, color: 'w' | 'b'): boolean {
    if (pieceType === 'k' || pieceType === 'p') return false;
    const board = new Chess(fen);
    const stage = getGameStage(fen);
    if (stage !== 'opening') return false;

    const isOnBackrank = STARTING_POSITIONS[color].includes(from);
    const isDeveloping = DEVELOPING_SQUARES[color].includes(to);
    return isOnBackrank && isDeveloping;
}

export function isUndevelopingMove(fen: string, from: Square, to: Square, pieceType: string, color: 'w' | 'b'): boolean {
    if (pieceType === 'k') return false;
    const board = new Chess(fen);
    const stage = getGameStage(fen);
    if (stage !== 'opening') return false;

    const isOnBackrank = STARTING_POSITIONS[color].includes(to);
    const wasDeveloped = !STARTING_POSITIONS[color].includes(from);
    return isOnBackrank && wasDeveloped;
}
