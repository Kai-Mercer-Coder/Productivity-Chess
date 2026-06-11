'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Lenis from 'lenis';
import Navbar from '@/components/layouts/Navbar';
import Sidebar from '@/components/layouts/Sidebar';
import MobileNavbar from '@/components/layouts/MobileNavbar';
import { useSession, signIn, signOut } from "next-auth/react"
const GrandmasterMonolith = () => {
    const { data: session, status } = useSession();
    // Initialize Lenis for smooth scrolling
    useEffect(() => {
        const lenis = new Lenis();

        function raf(time: any) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
        };
    }, []);

    // Helper to generate chess board squares matching the HTML pattern
    const renderBoardSquares = () => {
        const squares = [];
        for (let i = 0; i < 64; i++) {
            const row = Math.floor(i / 8);
            const col = i % 8;
            const isDark = (row + col) % 2 === 0;

            squares.push(
                <div
                    key={i}
                    className={`rounded-sm m-[0.5px] ${isDark ? 'bg-secondary-fixed-dim' : 'bg-surface-container-highest'}`}
                />
            );
        }
        return squares;
    };

    return (
        <div className="bg-black text-on-background selection:bg-primary selection:text-surface min-h-screen">

            {/* TopNavBar */}
            <Navbar />
            {/* Main Content */}
            <main className=" pt-28 min-h-screen">

                {/* Hero Section */}
                <section className="px-6 md:px-10 py-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    <div className="space-y-6 md:space-y-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-high border border-outline-variant/15 text-[10px] md:text-xs font-medium tracking-wide mx-auto lg:mx-0">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                            NOW LIVE: WORLD CHAMPIONSHIP FINALS
                        </div>
                        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-white">
                            SILENCE.<br />STRATEGY.<br /><span className="text-neutral-500">PRECISION.</span>
                        </h1>
                        <p className="text-base md:text-lg text-neutral-400 max-w-md mx-auto lg:mx-0 font-light leading-relaxed">
                            Experience chess in its purest form. A sanctuary for intellectual mastery, designed for those who seek the depth of the monolith.
                        </p>
                        <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
                            <Link href="/learn" className="inline-block bg-primary text-on-primary px-8 md:px-10 py-3.5 md:py-4 rounded-full font-bold text-sm hover:scale-105 transition-transform duration-300">Begin Training</Link>
                            <button className="bg-surface-container-high text-white px-8 md:px-10 py-3.5 md:py-4 rounded-full font-bold text-sm border border-outline-variant/20 hover:bg-surface-container-highest transition-all">Watch Masters</button>
                        </div>
                    </div>

                    <div className="relative w-full aspect-square max-w-[500px] mx-auto lg:max-w-none">
                        <div className="absolute inset-0 bg-linear-to-tr from-surface via-transparent to-transparent z-10 rounded-xl"></div>
                        <img
                            alt="Chess King"
                            className="w-full h-full object-cover rounded-xl grayscale contrast-125"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBh-Jr4_HM3n-1IcSYSFb1EUolsTts5nCaDzlNWNa1y9WKxxjv9aS8XmGMgde9NCSB4WRVgeT1uvtRNOAbvH1rVBxx7yrtZXU6AakS7pfdNzFV0PcRDa3BfJSw3pyQLvaBCvOo7A79w4QoSiPEd_sZoFBbsvwLXuT_sWIL1-jXYwALhj2sIKYXkhb0yJgm-c1Gw1XZW_VzQB4OVDb7Ar4afBjwqu0KnSTV1KUwlb1tI8D1gvWX7yKyfVaexPB0U5KvbbX5M0sv9JwI"
                        />
                        <div className="absolute -bottom-4 md:-bottom-6 -left-4 md:-left-6 glass-panel p-4 md:p-6 rounded-xl border border-white/5 z-20 shadow-2xl">
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-3">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-surface bg-neutral-800"></div>
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-surface bg-neutral-700"></div>
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-surface bg-neutral-600"></div>
                                </div>
                                <div>
                                    <p className="text-[10px] md:text-xs font-bold text-white">2,481 Active Players</p>
                                    <p className="text-[8px] md:text-[10px] text-neutral-500 uppercase tracking-widest">In training right now</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Bento Grid Features */}
                <section className="px-6 md:px-10 py-16 md:py-24 max-w-7xl mx-auto">
                    <div className="mb-12 md:mb-16">
                        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">THE MONOLITH ECOSYSTEM</h2>
                        <div className="h-1 w-24 bg-primary mt-4"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Large Feature Card */}
                        <div className="md:col-span-2 bg-surface-container rounded-2xl p-6 md:p-8 relative overflow-hidden group min-h-[350px] md:min-h-[400px]">
                            <div className="relative z-10 h-full flex flex-col">
                                <span className="material-symbols-outlined text-4xl text-primary mb-6" style={{ fontVariationSettings: "'FILL' 1" }}>query_stats</span>
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Neural Analysis</h3>
                                <p className="text-neutral-400 max-w-sm mb-8 text-sm md:text-base">Deep-engine move evaluation with human-centric explanations. Understand the 'why' behind every blunder and brilliance.</p>
                                <div className="mt-auto">
                                    <Link href="/analysis" className="text-[10px] md:text-xs font-bold uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                                        Explore Analytics <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                    </Link>
                                </div>
                            </div>
                            <img
                                alt="Cyber Chess"
                                className="absolute top-0 right-0 w-1/2 h-full object-cover opacity-20 grayscale group-hover:scale-110 transition-transform duration-700 hidden sm:block"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzSmX3tScyZweA2GGcoWOIibELA7otSJdz6Nk_IRv4cehgcAa1d5Xhm-bka9Pb7lx1BvQnUwWQRge7Wg4Tch3Nn_LEfPoczw5Mh_Q8WSNZaa6wwAOfJRhtyy14mVU-tUbib58JulLMuaesovPmJM8sJ3dlpWoZgnOTXV6sUwtbKRJjj1JieDw3u7oFt31QfF072wkZRspQGrKVYKkJhuZ0w3xDttTXwePD7GtORcaomPtuREuZPXtCOElM1vDRMArsqgQFQiy0JcE"
                            />
                        </div>
                        {/* Vertical Card */}
                        <div className="bg-surface-container-high rounded-2xl p-6 md:p-8 flex flex-col justify-between border border-outline-variant/10">
                            <div>
                                <span className="material-symbols-outlined text-3xl text-primary mb-4">school</span>
                                <h3 className="text-xl font-bold text-white mb-2">Grandmaster Academy</h3>
                                <p className="text-sm text-neutral-500">Curated paths from top-tier grandmasters focusing on endgame theory and pawn structures.</p>
                            </div>
                            <div className="mt-8 pt-8 border-t border-outline-variant/10">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Progress</span>
                                    <span className="text-xs font-bold text-white">64%</span>
                                </div>
                                <div className="w-full h-1 bg-surface-container mt-2 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-[64%]"></div>
                                </div>
                            </div>
                        </div>
                        {/* Small Card 1 */}
                        <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 border border-outline-variant/10 hover:bg-surface-container transition-colors duration-300">
                            <span className="material-symbols-outlined text-2xl text-neutral-400 mb-4">extension</span>
                            <h3 className="text-lg font-bold text-white mb-2">Infinite Puzzles</h3>
                            <p className="text-xs text-neutral-500">Adaptive tactics that evolve with your playing style.</p>
                        </div>
                        {/* Small Card 2 */}
                        <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 border border-outline-variant/10 hover:bg-surface-container transition-colors duration-300">
                            <span className="material-symbols-outlined text-2xl text-neutral-400 mb-4">bolt</span>
                            <h3 className="text-lg font-bold text-white mb-2">Blitz Arena</h3>
                            <p className="text-xs text-neutral-500">Instant matchmaking with low-latency global servers.</p>
                        </div>
                        {/* Small Card 3 */}
                        <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 border border-outline-variant/10 hover:bg-surface-container transition-colors duration-300">
                            <span className="material-symbols-outlined text-2xl text-neutral-400 mb-4">military_tech</span>
                            <h3 className="text-lg font-bold text-white mb-2">Pro Circuit</h3>
                            <p className="text-xs text-neutral-500">Tiered tournaments with real stakes and verified ratings.</p>
                        </div>
                    </div>
                </section>

                {/* Board Showcase Section */}
                <section className="px-6 md:px-10 py-16 md:py-24 max-w-7xl mx-auto">
                    <div className="glass-panel rounded-2xl p-8 md:p-12 lg:p-16 flex flex-col lg:flex-row items-center gap-12 lg:gap-16 border border-white/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[120px] rounded-full"></div>
                        <div className="w-full max-w-[450px] aspect-square bg-surface-container-highest rounded-lg grid grid-cols-8 grid-rows-8 p-1 shadow-2xl relative shrink-0">
                            {renderBoardSquares()}
                            {/* Overlay Layers */}
                            <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 pointer-events-none p-1">
                                <div className="col-start-4 row-start-4 bg-primary/20 rounded-sm m-[0.5px] border border-primary/50"></div>
                                <div className="col-start-5 row-start-6 bg-white/20 rounded-sm m-[0.5px]"></div>
                            </div>
                        </div>
                        <div className="flex-1 space-y-6 text-center lg:text-left">
                            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">THE ZEN INTERFACE</h2>
                            <p className="text-neutral-400 leading-relaxed font-light text-sm md:text-base">
                                We removed the noise. No ads, no popups, no distracting chat bubbles. Just you, the board, and the engine. Our board is rendered with high-fidelity materials that react to light, providing a tactile feel even in a digital space.
                            </p>
                            <ul className="space-y-4 inline-block lg:block text-left">
                                <li className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                                    <span className="text-xs md:text-sm font-medium">Ultra-low latency move processing</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                                    <span className="text-xs md:text-sm font-medium">Customizable board textures (Marble, Obsidian, Oak)</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                                    <span className="text-xs md:text-sm font-medium">Integrated focus mode and dark environment</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="px-6 md:px-10 py-16 md:py-24 max-w-7xl mx-auto text-center">
                    <div className="max-w-2xl mx-auto space-y-8">
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter">THE BOARD IS SET.</h2>
                        <p className="text-neutral-500 text-sm md:text-lg uppercase tracking-[0.3em]">Join the 1% of tactical masters</p>
                        <div className="flex justify-center gap-6 pt-4">
                            <Link href={session ? `/dashboard` : `/login`} className="inline-block bg-white text-black px-8 md:px-12 py-4 md:py-5 rounded-full font-black text-sm tracking-widest hover:bg-neutral-200 transition-all active:scale-95">CREATE ACCOUNT</Link>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="px-6 md:px-10 py-12 md:py-16 max-w-7xl mx-auto border-t border-outline-variant/10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-1 sm:col-span-2">
                            <span className="text-2xl font-black text-white tracking-tighter block mb-6">Grandmaster Monolith</span>
                            <p className="text-sm text-neutral-500 max-w-xs">Building the future of competitive intellectual sports through minimalist design and deep technology.</p>
                        </div>
                        <div>
                            <h4 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white mb-6">Platform</h4>
                            <ul className="space-y-4 text-sm text-neutral-500">
                                <li><a className="hover:text-white transition-colors" href="#">Desktop App</a></li>
                                <li><a className="hover:text-white transition-colors" href="#">Mobile iOS</a></li>
                                <li><a className="hover:text-white transition-colors" href="#">Tournament API</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-[10px] md:text-xs font-black uppercase tracking-widest text-white mb-6">Legal</h4>
                            <ul className="space-y-4 text-sm text-neutral-500">
                                <li><a className="hover:text-white transition-colors" href="#">Fair Play Policy</a></li>
                                <li><Link className="hover:text-white transition-colors" href="/privacy">Privacy</Link></li>
                                <li><Link className="hover:text-white transition-colors" href="/terms">Terms</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-8 border-t border-outline-variant/5">
                        <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-neutral-600">© 2024 Monolith Chess Systems. All rights reserved.</p>
                        <div className="flex gap-6">
                            <a className="text-neutral-600 hover:text-white transition-colors" href="#"><span className="material-symbols-outlined text-xl">public</span></a>
                            <a className="text-neutral-600 hover:text-white transition-colors" href="#"><span className="material-symbols-outlined text-xl">mail</span></a>
                        </div>
                    </div>
                </footer>
            </main>

            {/* Mobile Bottom Nav */}
            <MobileNavbar />
            {/* Floating Action Button */}

            <button className="fixed bottom-24 right-6 xl:bottom-10 xl:right-10 w-14 h-14 md:w-16 md:h-16 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40">
                <span className="material-symbols-outlined text-2xl md:text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
            </button>

            {/* Global Styles for Glassmorphism to match HTML exactly */}
            <style jsx global>{`
                .glass-panel {
                    background: rgba(31, 31, 31, 0.7);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .glass-nav {
                    background: rgba(19, 19, 19, 0.7);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                    font-family: 'Material Symbols Outlined';
                    font-weight: normal;
                    font-style: normal;
                    line-height: 1;
                    letter-spacing: normal;
                    text-transform: none;
                    display: inline-block;
                    white-space: nowrap;
                    word-wrap: normal;
                    direction: ltr;
                }
            `}</style>
        </div>
    );
};

export default GrandmasterMonolith;