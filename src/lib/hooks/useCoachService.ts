'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { CoachService, type CoachResult } from '@/lib/chess/CoachService';

interface UseCoachServiceOptions {
    stockfishUrl?: string;
    apiKey?: string;
    baseURL?: string;
    model?: string;
    enabled?: boolean;
}

interface UseCoachServiceReturn {
    coach: CoachService | null;
    ready: boolean;
    loading: boolean;
    error: string | null;
    explain: (fen: string, moveUCI?: string) => Promise<CoachResult | null>;
    result: CoachResult | null;
    reset: () => void;
}

export function useCoachService(opts: UseCoachServiceOptions = {}): UseCoachServiceReturn {
    const [ready, setReady] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<CoachResult | null>(null);
    const coachRef = useRef<CoachService | null>(null);
    const initRef = useRef(false);

    useEffect(() => {
        if (initRef.current || !opts.enabled) return;
        initRef.current = true;

        const coach = new CoachService();
        const apiKey = opts.apiKey || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '';
        const stockfishUrl = opts.stockfishUrl || '/stockfish/stockfish-18-lite-single.js';

        if (!apiKey) {
            setError('No API key configured. Set NEXT_PUBLIC_OPENROUTER_API_KEY or pass apiKey.');
            return;
        }

        coach.init({
            stockfishUrl,
            apiKey,
            baseURL: opts.baseURL || 'https://openrouter.ai/api/v1',
        }).then(() => {
            coachRef.current = coach;
            setReady(true);
        }).catch((err) => {
            setError(err instanceof Error ? err.message : 'Failed to initialize coach');
        });

        return () => {
            coach.terminate().catch(() => {});
            coachRef.current = null;
            setReady(false);
        };
    }, [opts.enabled, opts.apiKey, opts.baseURL, opts.stockfishUrl]);

    const explain = useCallback(async (fen: string, moveUCI?: string): Promise<CoachResult | null> => {
        const coach = coachRef.current;
        if (!coach || !ready) {
            setError('Coach not ready');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await coach.explain(fen, moveUCI, {
                model: opts.model || 'google/gemini-2.0-flash-001',
            });
            setResult(res);
            return res;
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Coach explanation failed';
            setError(msg);
            return null;
        } finally {
            setLoading(false);
        }
    }, [ready, opts.model]);

    const reset = useCallback(() => {
        setResult(null);
        setError(null);
    }, []);

    return {
        coach: coachRef.current,
        ready,
        loading,
        error,
        explain,
        result,
        reset,
    };
}
