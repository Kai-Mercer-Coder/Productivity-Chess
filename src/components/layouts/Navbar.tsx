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
            <nav className="relative z-40 w-full max-w-7xl mx-auto px-6 md:px-10 py-8 flex justify-between items-center mix-blend-difference">
                <Link href="/" className="font-display text-2xl font-bold tracking-tighter text-white whitespace-nowrap">
                    Monolith<span className="text-white/40">.</span>
                </Link>
                <div className="hidden lg:flex items-center gap-12">
                    <Link className="text-on-surface-variant hover:text-white transition-colors duration-200 text-[11px] font-bold uppercase tracking-widest" href="/play">Play</Link>
                    <Link className="text-on-surface-variant hover:text-white transition-colors duration-200 text-[11px] font-bold uppercase tracking-widest" href="/puzzles">Puzzles</Link>
                    <Link className="text-on-surface-variant hover:text-white transition-colors duration-200 text-[11px] font-bold uppercase tracking-widest" href="/analysis">Analysis</Link>
                    <Link className="text-on-surface-variant hover:text-white transition-colors duration-200 text-[11px] font-bold uppercase tracking-widest" href="/learn">Learn</Link>
                </div>
                <div className="flex items-center gap-6">
                    {!session && (
                        <Link href="/login" className="hidden sm:block text-on-surface-variant hover:text-white transition-colors text-[11px] font-bold uppercase tracking-widest">
                            Login
                        </Link>
                    )}
                    <Link href={session ? "/dashboard" : "/play"} className="bg-transparent border border-white/40 hover:border-white text-white text-[11px] font-bold uppercase tracking-widest px-8 py-3 rounded-full transition-all duration-300 hover:bg-white hover:text-black active:scale-95">
                        {session ? "Dashboard" : "Play Now"}
                    </Link>
                    {session && (
                        <button type="button" onClick={() => setProfileOpen(true)}>
                            {user?.image ? (
                                <img
                                    className="h-9 w-9 object-cover rounded-full cursor-pointer border border-white/20"
                                    src={user.image}
                                    alt="Profile"
                                />
                            ) : (
                                <span className="h-9 w-9 rounded-full bg-surface-container-high border border-white/15 flex items-center justify-center cursor-pointer">
                                    <span className="material-symbols-outlined text-sm text-on-surface-variant">person</span>
                                </span>
                            )}
                        </button>
                    )}
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
                                {user?.image ? (
                                    <img
                                        className="w-16 h-16 rounded-full object-cover"
                                        src={user.image}
                                        alt="Profile"
                                    />
                                ) : (
                                    <span className="w-16 h-16 rounded-full bg-surface-container-high border border-white/10 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-2xl text-on-surface-variant">person</span>
                                    </span>
                                )}
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
                                    href="/dashboard"
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
