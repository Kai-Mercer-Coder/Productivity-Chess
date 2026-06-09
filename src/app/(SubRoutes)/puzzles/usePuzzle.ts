import { useState, useCallback, useRef, useEffect } from 'react';
import { PieceSymbol, Square } from 'chess.js';
// 1. Import your local Dexie cache engine helper
import { getNextPuzzle, type PuzzleRow } from '@/lib/puzzleCache';

export type PuzzleStatus = 'idle' | 'loading' | 'playing' | 'correct' | 'wrong' | 'solved';

export interface Puzzle {
    fen: string;
    moves: string[];
    rating: number;
    themes: string[];
}

export interface FetchOptions {
    theme?: string;
    hard?: boolean;
}

interface UsePuzzleOptions {
    tryMove: (from: Square, to: Square, promotion?: PieceSymbol) => boolean;
    loadFen: (fen: string) => boolean;
}

export function usePuzzle({ tryMove, loadFen }: UsePuzzleOptions) {
    const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
    const [moveIndex, setMoveIndex] = useState(1);
    const [status, setStatus] = useState<PuzzleStatus>('idle');
    const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');
    const [hintSquares, setHintSquares] = useState<{ from: string; to: string } | null>(null);
    const [usedHint, setUsedHint] = useState(false);

    const puzzleRef = useRef<Puzzle | null>(null);
    const moveIndexRef = useRef(1);
    const statusRef = useRef<PuzzleStatus>('idle');
    const usedHintRef = useRef(false);

    useEffect(() => { puzzleRef.current = puzzle; }, [puzzle]);
    useEffect(() => { moveIndexRef.current = moveIndex; }, [moveIndex]);
    useEffect(() => { statusRef.current = status; }, [status]);
    useEffect(() => { usedHintRef.current = usedHint; }, [usedHint]);

    const fetchAndLoad = useCallback(async (options: FetchOptions = {}) => {
        setStatus('loading');
        setHintSquares(null);
        setUsedHint(false);
        usedHintRef.current = false;

        // Permanent mock placeholder value for local development speed
        const CURRENT_DEV_USER_ELO = 1200;

        // 2. Swapped the network fetch for your direct client-side DB calculation
        const data: PuzzleRow | null = await getNextPuzzle(
            CURRENT_DEV_USER_ELO,
            options.theme || 'all',
            options.hard || false
        );

        if (!data) {
            setStatus('idle');
            return;
        }

        loadFen(data.fen);

        const pColor: 'w' | 'b' = data.fen.split(' ')[1] === 'w' ? 'b' : 'w';
        setPlayerColor(pColor);

        const newPuzzle: Puzzle = {
            fen: data.fen,
            moves: data.moves,
            rating: data.rating,
            themes: data.themes || [],
        };

        setPuzzle(newPuzzle);
        puzzleRef.current = newPuzzle;
        setMoveIndex(1);
        moveIndexRef.current = 1;

        setTimeout(() => {
            if (newPuzzle.moves.length > 0) {
                const m = newPuzzle.moves[0];
                tryMove(m.substring(0, 2) as Square, m.substring(2, 4) as Square, m.length > 4 ? m[4] as PieceSymbol : undefined);
            }
            setStatus('playing');
        }, 500);
    }, [loadFen, tryMove,]);

    const handlePlayerMove = useCallback(
        (from: Square, to: Square, promotion?: PieceSymbol): boolean => {
            const p = puzzleRef.current;
            if (!p || statusRef.current !== 'playing') return false;

            const expectedMove = p.moves[moveIndexRef.current];
            if (from !== expectedMove.substring(0, 2) || to !== expectedMove.substring(2, 4)) {
                setStatus('wrong');
                // updateStats(false, p.rating); // PRESERVED: Left untouched for your login setup
                setTimeout(() => setStatus('playing'), 900);
                return false;
            }

            const promo = expectedMove.length > 4 ? expectedMove[4] as PieceSymbol : promotion;
            if (!tryMove(from, to, promo)) return false;

            setHintSquares(null);
            const nextIdx = moveIndexRef.current + 1;

            if (nextIdx >= p.moves.length) {
                setStatus('solved');
                // updateStats(true, p.rating, usedHintRef.current); // PRESERVED: Left untouched for your login setup
                return true;
            }

            setStatus('correct');

            setTimeout(() => {
                const opMove = p.moves[nextIdx];
                tryMove(
                    opMove.substring(0, 2) as Square,
                    opMove.substring(2, 4) as Square,
                    opMove.length > 4 ? opMove[4] as PieceSymbol : undefined
                );
                setMoveIndex(nextIdx + 1);
                setStatus(nextIdx + 1 >= p.moves.length ? 'solved' : 'playing');
            }, 600);

            return true;
        },
        [tryMove]
    );

    const getHint = useCallback(() => {
        const p = puzzleRef.current;
        const idx = moveIndexRef.current;
        if (!p || statusRef.current !== 'playing' || idx >= p.moves.length) return;

        setUsedHint(true);
        usedHintRef.current = true;

        const move = p.moves[idx];
        setHintSquares({ from: move.substring(0, 2), to: move.substring(2, 4) });
    }, []);

    return { puzzle, moveIndex, status, playerColor, hintSquares, handlePlayerMove, getHint, fetchAndLoad };
}

// async function updateStats(solved: boolean, puzzleRating: number, usedHint: boolean = false) {
//     const res = await fetch('/api/updateStats', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ solved, puzzleRating, usedHint }),
//     });
//     if (res.ok) {
//         const data = await res.json();
//         console.log(`[updateStats] ${solved ? 'solved' : 'wrong'}: newElo=${data.newElo}, usedHint=${usedHint}`);
//     }
// }