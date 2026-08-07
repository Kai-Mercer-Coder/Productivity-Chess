'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BookMove } from '@/lib/hooks/useBookMoves';

interface MoveAnalysisProps {
    diff: number | null;
    mate: number | null;
    openingName?: string | null;
    bookMoves?: BookMove[];
    showEngineReaction: boolean;
    showBookMoves: boolean;
}

// Enhanced AnimatedText component
// Added 'key' in usage to restart animation when text changes
const AnimatedText = ({ text, className }: { text: string; className?: string }) => {
    if (!text) return null;

    return (
        <span className="inline-flex flex-wrap justify-center">
            {text.split('').map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.03, ease: "easeOut" }}
                    className={className}
                >
                    {char === ' ' ? '\u00A0' : char}
                </motion.span>
            ))}
        </span>
    );
};

const MoveAnalysis = ({ diff, mate, openingName, bookMoves, showEngineReaction, showBookMoves }: MoveAnalysisProps) => {
    const isBookMove = !!openingName && showBookMoves;

    const engineRemark = useMemo(() => {
        if (mate !== null) return mate > 0 ? 'Winning!' : 'Tough Spot';
        if (diff === null) return 'Analyzing...';
        if (diff >= 0.05) return 'Best Move';
        if (diff >= -0.15) return 'Excellent';
        if (diff >= -0.45) return 'Good';
        if (diff >= -0.90) return 'Inaccuracy';
        if (diff >= -2.00) return 'Mistake';
        return 'Blunder';
    }, [diff, mate]);

    const remarkColor = useMemo(() => {
        if (mate !== null) return mate > 0 ? 'text-emerald-400' : 'text-rose-400';
        if (diff === null) return 'text-neutral-400';
        if (diff >= 0.05) return 'text-emerald-500'; // Best Move
        if (diff >= -0.15) return 'text-emerald-400'; // Excellent
        if (diff >= -0.45) return 'text-blue-400';    // Good
        if (diff >= -0.90) return 'text-yellow-400'; // Inaccuracy
        if (diff >= -2.00) return 'text-orange-400'; // Mistake
        return 'text-rose-500';                      // Blunder
    }, [diff, mate]);

    const diffDisplay = useMemo(() => {
        if (mate !== null) return `M${Math.abs(mate)}`;
        return diff === null ? '—' : (diff > 0 ? '+' : '') + diff.toFixed(2);
    }, [diff, mate]);

    if (!showEngineReaction && !showBookMoves) return null;

    // If we're not supposed to show engine, and there are no book moves we shouldn't render the main box either
    const showMainSection = isBookMove || showEngineReaction;

    return (
        <div className="w-full text-white">
            {/* Main Analysis Section */}
            {showMainSection && (
                <AnimatePresence mode="wait">
                    {isBookMove ? (
                        <motion.div
                            key="book-view"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-3 flex-wrap"
                        >
                            <div className="inline-flex px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-[10px] font-black uppercase tracking-widest">
                                {/* Key prop ensures animation replays if text changes */}
                                <AnimatedText key="book-label" text="Book Move" className="text-blue-400" />
                            </div>
                            <div className="text-base font-black text-white leading-tight tracking-tight">
                                <AnimatedText key={openingName} text={openingName || ''} />
                            </div>
                        </motion.div>
                    ) : showEngineReaction ? (
                        <motion.div
                            key="engine-view"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-1"
                        >
                            <p className="text-[10px] uppercase tracking-widest text-neutral-500">
                                <AnimatedText key="quality-label" text="Move Quality" />
                            </p>
                            <h3 className={`text-2xl font-black tracking-tighter ${remarkColor}`}>
                                <AnimatedText key={engineRemark} text={engineRemark} className={remarkColor} />
                            </h3>
                            <p className="text-xs text-neutral-500 font-mono">
                                <AnimatedText key={diffDisplay} text={diffDisplay} />
                            </p>
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            )}

            {/* Theory Section */}
            {showBookMoves && bookMoves && bookMoves.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-4"
                >
                    <p className="text-[10px] uppercase text-neutral-600 font-bold tracking-widest mb-2">
                        <AnimatedText key="theory-label" text="Theory" />
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {bookMoves.map((m, i) => (
                            <motion.span
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 + (i * 0.05), duration: 0.2 }}
                                className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white/80 font-mono hover:bg-white/10 transition-colors"
                            >
                                {m.san}
                            </motion.span>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default MoveAnalysis;
