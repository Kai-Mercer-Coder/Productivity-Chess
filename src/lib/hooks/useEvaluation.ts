import { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import {
  LocalStockfishEvalEngine,
  fetchTablebase,
  type HintData,
  type LocalEvalResult,
} from '@/lib/chess/MoveEngine';

interface PendingAnalysis {
    evalBeforeMove: number;
    side: 'w' | 'b';
}

export interface PositionEval {
    evaluation: { type: 'cp' | 'mate'; value: number };
    bestmove: string;
    bestmoveSan: string;
}

function normalizeEval(cp: number) {
    const k = 3;
    return 2 / (1 + Math.exp(-cp / k)) - 1;
}

function fenTurn(fen: string): 'w' | 'b' {
    return fen.split(' ')[1] === 'b' ? 'b' : 'w';
}

function uciToSan(fen: string, uci: string): string {
    if (!uci) return '';
    try {
        const game = new Chess(fen);
        const move = game.move(uci);
        return move ? move.san : uci;
    } catch {
        return uci;
    }
}

function hintText(evalNum: number, mate: number | null): string {
    if (mate !== null) return mate > 0 ? 'Forces checkmate for White.' : 'Forces checkmate for Black.';
    if (evalNum >= 1) return 'White has a decisive advantage.';
    if (evalNum >= 0.4) return 'White is clearly better.';
    if (evalNum >= 0.2) return 'White has a slight edge.';
    if (evalNum > -0.2) return 'The position is roughly balanced.';
    if (evalNum > -0.4) return 'Black has a slight edge.';
    if (evalNum > -1) return 'Black is clearly better.';
    return 'Black has a decisive advantage.';
}

export function useEvaluation(chessGame: any, position: string) {
    const [currentEval, setCurrentEval] = useState<number>(0);
    const [rawScore, setRawScore] = useState<number>(0);
    const [mateIn, setMateIn] = useState<number | null>(null);
    const [smoothedEval, setSmoothedEval] = useState<number>(0);
    const [hintData, setHintData] = useState<HintData | null>(null);

    const [diff, setDiff] = useState<number | null>(null);

    const evalEngineRef = useRef<LocalStockfishEvalEngine | null>(null);
    const positionResultsRef = useRef<Map<string, PositionEval>>(new Map());
    const moveAnalysisRef = useRef<{
        pending: Record<string, PendingAnalysis>;
        id: number;
    }>({
        pending: {},
        id: 0,
    });
    const smoothedEvalRef = useRef(0);
    const positionRef = useRef(position);
    positionRef.current = position;

    useEffect(() => {
        const engineInstance = new LocalStockfishEvalEngine();
        evalEngineRef.current = engineInstance;
        return () => engineInstance.terminate();
    }, []);

    const applyResult = (fen: string, evalNum: number, mate: number | null, bestmove: string, pv: string[]) => {
        const san = uciToSan(fen, bestmove);

        if (fen === positionRef.current) {
            setRawScore(evalNum);
            const rawEval = normalizeEval(evalNum);

            const smoothed =
                smoothedEvalRef.current === 0
                    ? rawEval
                    : smoothedEvalRef.current + 0.3 * (rawEval - smoothedEvalRef.current);
            smoothedEvalRef.current = smoothed;
            setSmoothedEval(smoothed);
            setCurrentEval(smoothed);
            setMateIn(mate ?? null);

            if (fenTurn(fen) === 'w') {
                setHintData({
                    bestmove,
                    san,
                    text: hintText(evalNum, mate),
                    eval: evalNum,
                    mate,
                    continuationArr: pv.slice(1),
                    winChance: 50 + evalNum * 0.5,
                });
            } else {
                setHintData(null);
            }
        }

        positionResultsRef.current.set(fen, {
            evaluation: {
                type: mate !== null ? 'mate' : 'cp',
                value: mate !== null ? mate : Math.round(evalNum * 100),
            },
            bestmove,
            bestmoveSan: san,
        });

        const pending = moveAnalysisRef.current.pending[fen];
        if (pending) {
            const { evalBeforeMove: oldEval, side } = pending;
            const rawDiff = evalNum - oldEval;
            const normalizedDiff = side === 'w' ? rawDiff : -rawDiff;

            setDiff(normalizedDiff);
            delete moveAnalysisRef.current.pending[fen];
        }
    };

    useEffect(() => {
        if (!evalEngineRef.current) return;
        let cancelled = false;

        const timer = setTimeout(async () => {
            const fen = positionRef.current;

            const tb = await fetchTablebase(fen);
            if (cancelled) return;
            if (tb) {
                applyResult(fen, tb.eval, tb.mate, tb.bestmove, tb.continuationArr ?? []);
                return;
            }

            const engine = evalEngineRef.current;
            if (!engine) return;

            const result: LocalEvalResult = await engine.evaluatePosition(
                fen,
                3000,
                (r) => {
                    if (!cancelled) applyResult(r.fen, r.eval, r.mate, r.bestmove, r.pv);
                },
            );
            if (!cancelled) applyResult(result.fen, result.eval, result.mate, result.bestmove, result.pv);
        }, 100);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
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
