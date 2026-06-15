import { useState, useEffect, useRef } from 'react';
import { ChessApiEvalEngine, type ChessApiResponse } from '@/lib/chess/MoveEngine';

interface PendingAnalysis {
    evalBeforeMove: number;
    side: 'w' | 'b';
}

export interface PositionEval {
    evaluation: { type: 'cp' | 'mate'; value: number };
    bestmove: string;
    bestmoveSan: string;
}

export function useEvaluation(chessGame: any, position: string) {
    const [currentEval, setCurrentEval] = useState<number>(0);
    const [rawScore, setRawScore] = useState<number>(0);
    const [mateIn, setMateIn] = useState<number | null>(null);
    const [smoothedEval, setSmoothedEval] = useState<number>(0);
    const [hintData, setHintData] = useState<ChessApiResponse | null>(null);

    const [diff, setDiff] = useState<number | null>(null);

    const evalEngineRef = useRef<ChessApiEvalEngine | null>(null);
    const positionResultsRef = useRef<Map<string, PositionEval>>(new Map());
    const moveAnalysisRef = useRef<{
        pending: Record<string, PendingAnalysis>;
        id: number;
    }>({
        pending: {},
        id: 0,
    });

    useEffect(() => {
        const engineInstance = new ChessApiEvalEngine((evalNum: number, fen: string, data: ChessApiResponse, mate?: number) => {
            function normalizeEval(cp: number) {
                const k = 3;
                return 2 / (1 + Math.exp(-cp / k)) - 1;
            }

            if (fen === chessGame.fen()) {
                setRawScore(evalNum);
                const rawEval = normalizeEval(evalNum);

                const alpha = 0.3;
                const smoothed = smoothedEval === 0 ? rawEval : smoothedEval + alpha * (rawEval - smoothedEval);
                setSmoothedEval(smoothed);
                setCurrentEval(smoothed);
                setMateIn(mate ?? null);

                if (data.turn === 'w') {
                    setHintData(data);
                } else {
                    setHintData(null);
                }
            }

            positionResultsRef.current.set(fen, {
                evaluation: {
                    type: mate !== null ? 'mate' : 'cp',
                    value: mate ?? Math.round(evalNum * 100),
                },
                bestmove: data.bestmove || '',
                bestmoveSan: data.san || '',
            });

            const pending = moveAnalysisRef.current.pending[fen];
            if (pending) {
                const { evalBeforeMove: oldEval, side } = pending;
                const rawDiff = evalNum - oldEval;
                const normalizedDiff = side === 'w' ? rawDiff : -rawDiff;

                setDiff(normalizedDiff);
                delete moveAnalysisRef.current.pending[fen];
            }
        });

        evalEngineRef.current = engineInstance;
        return () => engineInstance.terminate();
    }, []);

    useEffect(() => {
        if (!evalEngineRef.current) return;
        const timer = setTimeout(() => evalEngineRef.current?.evaluatePosition(position), 100);
        return () => clearTimeout(timer);
    }, [position]);

    const registerMoveForAnalysis = (fen: string, evalBeforeMove: number, side: 'w' | 'b') => {
        moveAnalysisRef.current.id++;
        moveAnalysisRef.current.pending[fen] = { evalBeforeMove, side };
    };

    const clearAnalysis = () => {
        moveAnalysisRef.current.pending = {};
        setDiff(null);
    };

    const getPositionEval = (fen: string): PositionEval | undefined => {
        return positionResultsRef.current.get(fen);
    };

    const clearPositionHistory = () => {
        positionResultsRef.current.clear();
    };

    return {
        currentEval,
        rawScore,
        mateIn,
        diff,
        hintData,
        registerMoveForAnalysis,
        clearAnalysis,
        getPositionEval,
        clearPositionHistory,
    };
}
