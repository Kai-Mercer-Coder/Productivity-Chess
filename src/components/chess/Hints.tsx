'use client';

import { useState } from 'react';
import { GoLightBulb } from "react-icons/go";
import { type ChessApiResponse } from '@/lib/chess/MoveEngine';

const Hints = ({ game, hintData }: { game: any; hintData: ChessApiResponse | null }) => {
    const [open, setOpen] = useState(false);
    const isPlayerTurn = game.chessGame.turn() === 'w';

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                disabled={!isPlayerTurn || !hintData}
                className='w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-yellow-400/70 hover:text-yellow-400 transition-all flex justify-center items-center disabled:opacity-30 disabled:cursor-not-allowed active:scale-95'
                aria-label="Get hint"
            >
                <GoLightBulb className="text-xl" />
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)}>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-[450px] p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-2 text-lg font-semibold text-white mb-2">
                            <GoLightBulb className="text-yellow-400" />
                            Hint
                        </div>

                        <div className="text-zinc-400 text-sm">
                            {!isPlayerTurn ? (
                                "Hints are only available during your turn (White)."
                            ) : !hintData ? (
                                "No hint available at the moment."
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-white">Best Move:</span>
                                        <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{hintData.san}</span>
                                    </div>
                                    <p className="italic text-zinc-300 leading-relaxed">
                                        "{hintData.text}"
                                    </p>
                                    <div className="flex gap-2 flex-wrap mt-2">
                                        <span className="bg-blue-900/50 text-blue-300 text-xs px-2 py-0.5 rounded-full">
                                            Evaluation: {hintData.eval > 0 ? '+' : ''}{hintData.eval}
                                        </span>
                                        <span className="bg-indigo-900/50 text-indigo-300 text-xs px-2 py-0.5 rounded-full">
                                            Win Chance: {hintData.winChance.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => setOpen(false)}
                                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-sm rounded-lg cursor-pointer transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Hints
