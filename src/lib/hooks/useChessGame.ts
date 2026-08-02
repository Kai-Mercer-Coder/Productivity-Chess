import { useRef, useState } from 'react';
import { Chess, type PieceSymbol, type Square } from 'chess.js';
import type { PromotionMove } from '@/lib/types/Engine';
import type { PieceDropHandlerArgs } from 'react-chessboard';

export function useChessGame() {
    const chessGameRef = useRef(new Chess());
    const chessGame = chessGameRef.current;

    const [position, setPosition] = useState(chessGame.fen());
    const [optionSquares, setOptionSquares] = useState<Record<string, React.CSSProperties>>({});
    const [promotionMove, setPromotionMove] = useState<PromotionMove | null>(null);
    const [moveFrom, setMoveFrom] = useState('');
    const [showAnimations, setShowAnimations] = useState(true);
    const [premoves, setPremoves] = useState<PieceDropHandlerArgs[]>([]);
    const premovesRef = useRef<PieceDropHandlerArgs[]>([]);

    const resetMoveState = (clearPremoves = false) => {
        setMoveFrom('');
        setOptionSquares({});
        setPromotionMove(null);
        if (clearPremoves) {
            premovesRef.current = [];
            setPremoves([]);
        }
    };

    const getGameState = () => ({
        fen: chessGame.fen(),
        isGameOver: chessGame.isGameOver(),
        turn: chessGame.turn(),
        moves: chessGame.moves({ verbose: true }),
    });

    const makeMove = (from: string, to: string, promotion?: PieceSymbol): boolean => {
        try {
            chessGame.move({ from: from as Square, to: to as Square, promotion });
            setPosition(chessGame.fen());
            resetMoveState();
            return true;
        } catch {
            return false;
        }
    };

    const undo = (count = 1) => {
        for (let i = 0; i < count; i++) chessGame.undo();
        resetMoveState();
        setPosition(chessGame.fen());
    };

    const loadFen = (fen: string): boolean => {
        try {
            chessGame.load(fen);
            setPosition(fen);
            resetMoveState();
            return true;
        } catch {
            return false;
        }
    };

    return {
        chessGame,
        position,
        moveFrom,
        optionSquares,
        promotionMove,
        showAnimations,
        premoves,
        premovesRef,
        setPosition,
        setMoveFrom,
        setOptionSquares,
        setPromotionMove,
        setPremoves,
        setShowAnimations,
        resetMoveState,
        getGameState,
        makeMove,
        undo,
        loadFen,
    };
}
