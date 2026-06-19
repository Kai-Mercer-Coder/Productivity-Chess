'use client';

import { useState } from 'react';
import { useSession, signOut } from "next-auth/react";
import type { SessionWithProfile } from "@/types/profile";
import Link from 'next/link';

const Navbar = () => {
    const { data: session } = useSession();
    const [profileOpen, setProfileOpen] = useState(false);
    const user = session?.user;

    return (
        <>
            <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-6xl z-50 glass-nav rounded-full px-9 py-3 flex justify-between items-center border border-white/5 shadow-2xl transition-all duration-300">
                <div className="flex items-center gap-10">
                    <span className="text-xl font-black tracking-tighter text-white whitespace-nowrap uppercase">Monolith</span>
                    <div className="hidden lg:flex items-center gap-8">
                        <Link className="text-[11px] uppercase tracking-widest text-white font-bold" href="/login">Play</Link>
                        <Link className="text-[11px] uppercase tracking-widest text-white/50 hover:text-white transition-colors" href="/login">Puzzles</Link>
                        <Link className="text-[11px] uppercase tracking-widest text-white/50 hover:text-white transition-colors" href="/login">Analysis</Link>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex items-center gap-4">
                        <button className="text-white/40 hover:text-white transition-colors p-1" type="button">
                            <span className="material-symbols-outlined">search</span>
                        </button>
                        <button className="text-white/40 hover:text-white transition-colors p-1" type="button">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                    </div>
                    <Link href="/login" className="bg-white text-black px-6 py-2 rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-neutral-200 transition-all active:scale-95">Play Now</Link>
                    <button type="button" onClick={() => setProfileOpen(true)}>
                        <img
                            className="h-9 w-9 object-cover rounded-full cursor-pointer"
                            src={user?.image || 'https://via.placeholder.com/150'}
                            alt="Profile"
                        />
                    </button>
                </div>
            </nav>

            {profileOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end" onClick={() => setProfileOpen(false)}>
                    <div className="w-full max-w-sm bg-neutral-950 border-l border-white/10 h-full shadow-2xl animate-in slide-in-from-right" onClick={e => e.stopPropagation()}>
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-semibold text-white">Profile</h2>
                                <button type="button" onClick={() => setProfileOpen(false)} className="p-1 text-neutral-500 hover:text-white transition-colors">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <img
                                    className="w-16 h-16 rounded-full object-cover"
                                    src={user?.image || 'https://via.placeholder.com/150'}
                                    alt="Profile"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-lg font-semibold text-white truncate">
                                        {user?.name || 'Guest'}
                                    </p>
                                    <p className="text-sm text-neutral-400 truncate">
                                        {user?.email || 'Not signed in'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-neutral-900/60 rounded-xl p-4">
                                    <p className="text-xs text-neutral-500 uppercase tracking-wider">Rating</p>
                                    <p className="text-2xl font-bold text-white">{(user as SessionWithProfile["user"])?.elo ?? 1200}</p>
                                </div>
                                <div className="bg-neutral-900/60 rounded-xl p-4">
                                    <p className="text-xs text-neutral-500 uppercase tracking-wider">Puzzles</p>
                                    <p className="text-2xl font-bold text-white">{(user as SessionWithProfile["user"])?.puzzles_solved ?? 0}</p>
                                </div>
                                <div className="bg-neutral-900/60 rounded-xl p-4">
                                    <p className="text-xs text-neutral-500 uppercase tracking-wider">Delta</p>
                                    <p className="text-2xl font-bold text-white">±{(user as SessionWithProfile["user"])?.delta_value ?? 200}</p>
                                </div>
                                <div className="bg-neutral-900/60 rounded-xl p-4">
                                    <p className="text-xs text-neutral-500 uppercase tracking-wider">Level</p>
                                    <p className="text-2xl font-bold text-white">{Math.floor(((user as SessionWithProfile["user"])?.elo ?? 1200) / 200) + 1}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Link
                                    href="/login"
                                    className="block w-full py-3 text-center rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white transition-colors"
                                >
                                    Dashboard
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => signOut({ callbackUrl: '/login' })}
                                    className="w-full py-3 text-center rounded-xl bg-red-900/30 hover:bg-red-900/50 text-red-400 transition-colors"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
