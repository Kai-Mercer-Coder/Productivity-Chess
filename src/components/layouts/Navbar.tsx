'use client';

import { useState } from 'react';
import { useSession, signOut } from "next-auth/react";
import Link from 'next/link';

const Navbar = () => {
    const { data: session } = useSession();
    const [profileOpen, setProfileOpen] = useState(false);
    const user = session?.user;

    return (
        <>
            <nav className="fixed top-6 left-1/2 bg-black border border-black border-t-zinc-700 -translate-x-1/2 w-[calc(100%-3rem)] max-w-7xl z-50 glass-nav rounded-full px-9 py-3 flex justify-between items-center transition-all duration-300">
                <div className="flex items-center gap-10">
                    <span className="text-xl font-black tracking-tighter text-white whitespace-nowrap">Productivity Chess</span>
                    <div className="hidden lg:flex items-center gap-8 text-sm font-medium">
                        <Link className="text-white" href="/">Overview</Link>
                        <Link className="text-on-surface-variant hover:text-white transition-colors" href="#">Tournaments</Link>
                        <Link className="text-on-surface-variant hover:text-white transition-colors" href="#">Academy</Link>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2">
                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors" type="button">
                            <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors" type="button">
                            <span className="material-symbols-outlined text-on-surface-variant">settings</span>
                        </button>
                    </div>
                    <Link href="/puzzles" className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold active:scale-95 transition-all">Play Now</Link>
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
                                    <p className="text-2xl font-bold text-white">{(user as any)?.elo ?? 1200}</p>
                                </div>
                                <div className="bg-neutral-900/60 rounded-xl p-4">
                                    <p className="text-xs text-neutral-500 uppercase tracking-wider">Puzzles</p>
                                    <p className="text-2xl font-bold text-white">{(user as any)?.puzzles_solved ?? 0}</p>
                                </div>
                                <div className="bg-neutral-900/60 rounded-xl p-4">
                                    <p className="text-xs text-neutral-500 uppercase tracking-wider">Delta</p>
                                    <p className="text-2xl font-bold text-white">±{(user as any)?.delta_value ?? 200}</p>
                                </div>
                                <div className="bg-neutral-900/60 rounded-xl p-4">
                                    <p className="text-xs text-neutral-500 uppercase tracking-wider">Level</p>
                                    <p className="text-2xl font-bold text-white">{Math.floor(((user as any)?.elo ?? 1200) / 200) + 1}</p>
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
