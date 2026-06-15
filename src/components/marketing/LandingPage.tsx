'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Lenis from 'lenis';
import Navbar from '@/components/layouts/Navbar';
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

    return (
        <div className="bg-background text-on-background selection:bg-white selection:text-black min-h-screen">

            {/* TopNavBar */}
            <Navbar />
            {/* Main Content */}
            <main className=" pt-28 min-h-screen">

                {/* Hero Section */}
                <section className="px-6 md:px-10 py-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    <div className="space-y-6 md:space-y-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full border border-white/10 bg-white/5 mx-auto lg:mx-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/60">Live Engine Analysis Active</span>
                        </div>
                        <h1 className="text-huge font-black tracking-monolith text-white">
                            GRANDMASTER<br/>MONOLITH
                        </h1>
                        <p className="text-xl text-neutral-500 font-light leading-relaxed tracking-tight max-w-md mx-auto lg:mx-0">
                            The terminal for elite chess mastery. Surgical precision. Unrestricted depth. Designed for the 1%.
                        </p>
                        <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
                            <Link href="/login" className="bg-white text-black px-10 py-5 rounded-full font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all">Begin Training</Link>
                            <Link href="/under-construction" className="bg-transparent text-white border border-white/10 px-10 py-5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-all">Watch Protocol</Link>
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
                <section className="px-8 py-32 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 border border-white/5">
                        <div className="bg-background p-12 space-y-6">
                            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-white/30">01 / Tactics</span>
                            <h3 className="text-2xl font-black text-white tracking-tighter">Unlimited Tactical Puzzles</h3>
                            <p className="text-neutral-500 text-sm leading-relaxed">Experience a database of 15 million adaptive positions. No daily limits. No paywalls. Pure calculation training refined by GMs.</p>
                        </div>
                        <div className="bg-background p-12 space-y-6">
                            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-white/30">02 / Analysis</span>
                            <h3 className="text-2xl font-black text-white tracking-tighter">Unrestricted Game Review</h3>
                            <p className="text-neutral-500 text-sm leading-relaxed">Cloud-based Stockfish 18 NNUE at depth 18 for every move. Deep neural evaluations with human-readable reasoning.</p>
                        </div>
                        <div className="bg-background p-12 space-y-6">
                            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-white/30">03 / Variants</span>
                            <h3 className="text-2xl font-black text-white tracking-tighter">Play Variants with Bots</h3>
                            <p className="text-neutral-500 text-sm leading-relaxed">Challenge sophisticated engines in chess variants. From Chess960 to King of the Hill, master every dimension of the board without limits.</p>
                        </div>
                    </div>
                </section>

                {/* Strategic Mastery Section */}
                <section className="py-48 px-8 max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
                        <div className="space-y-8">
                            <h2 className="text-5xl font-black tracking-tighter text-white uppercase leading-none">Strategic<br/>Mastery</h2>
                            <div className="h-0.5 w-12 bg-white"></div>
                            <p className="text-neutral-400 leading-relaxed font-light">
                                Improvement is not accidental. It is the result of focused, high-repetition exposure to complex patterns. Monolith provides the environment required for neural consolidation.
                            </p>
                            <div className="grid grid-cols-2 gap-8 pt-8">
                                <div>
                                    <div className="text-2xl font-black text-white">4.2M</div>
                                    <div className="text-[10px] uppercase tracking-widest text-neutral-600 mt-1">Positions Analyzed/Sec</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-white">128ms</div>
                                    <div className="text-[10px] uppercase tracking-widest text-neutral-600 mt-1">Global Latency Avg</div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-8 lg:pt-32">
                            <h2 className="text-5xl font-black tracking-tighter text-white uppercase leading-none">Engineered<br/>For Precision</h2>
                            <div className="h-0.5 w-12 bg-white"></div>
                            <p className="text-neutral-400 leading-relaxed font-light">
                                Every pixel of the Monolith interface is calculated to minimize cognitive load. In focus mode, everything but the board vanishes. No chat. No distractions. Just the monolith.
                            </p>
                            <ul className="space-y-4 pt-4">
                                <li className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-white/80">
                                    <span className="material-symbols-outlined text-sm">check</span>
                                    Zero-Distraction Mode
                                </li>
                                <li className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-white/80">
                                    <span className="material-symbols-outlined text-sm">check</span>
                                    Sub-second Matchmaking
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-64 px-8 text-center bg-white/5">
                    <div className="max-w-3xl mx-auto space-y-12">
                        <h2 className="text-6xl font-black tracking-monolith text-white uppercase">UNRESTRICTED ACCESS.</h2>
                        <p className="text-neutral-400 uppercase tracking-[0.4em] text-[11px] font-bold">Curricula and variants are free, open-source, and accessible to the global collective.</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-6 pt-6">
                            <Link href={session ? `/dashboard` : `/login`} className="bg-white text-black px-16 py-6 rounded-full font-black text-sm uppercase tracking-widest hover:bg-neutral-200 transition-all active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.1)]">VIEW SOURCE</Link>
                            <Link href="/under-construction" className="bg-transparent text-white border border-white/10 px-16 py-6 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white/5 transition-all">EXPLORE COURSES</Link>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="px-8 py-24 max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-16 mb-24">
                        <div className="col-span-2">
                            <span className="text-2xl font-black text-white tracking-tighter uppercase block mb-8">Monolith</span>
                            <p className="text-xs uppercase tracking-widest text-neutral-600 leading-loose max-w-xs">The standard for competitive chess training. Engineered in Berlin. Validated by Champions.</p>
                        </div>
                        <div className="space-y-8">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">System</h4>
                            <ul className="space-y-4 text-[11px] uppercase tracking-widest text-neutral-500 font-medium">
                                <li><Link className="hover:text-white transition-colors" href="/under-construction">Architecture</Link></li>
                                <li><Link className="hover:text-white transition-colors" href="/under-construction">API Docs</Link></li>
                                <li><Link className="hover:text-white transition-colors" href="/under-construction">Neural Net</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-8">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Legal</h4>
                            <ul className="space-y-4 text-[11px] uppercase tracking-widest text-neutral-500 font-medium">
                                <li><Link className="hover:text-white transition-colors" href="/under-construction">Fair Play</Link></li>
                                <li><Link className="hover:text-white transition-colors" href="/privacy">Privacy</Link></li>
                                <li><Link className="hover:text-white transition-colors" href="/terms">Terms</Link></li>
                                <li><Link className="hover:text-white transition-colors" href="/credits">Credits</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-12 border-t border-monolith">
                        <p className="text-[9px] uppercase tracking-[0.3em] text-neutral-700">© 2024 Monolith Chess Systems. No distractions.</p>
                        <div className="flex gap-8">
                            <Link className="text-neutral-700 hover:text-white transition-colors" href="/under-construction"><span className="material-symbols-outlined !text-lg">terminal</span></Link>
                            <Link className="text-neutral-700 hover:text-white transition-colors" href="/under-construction"><span className="material-symbols-outlined !text-lg">shield</span></Link>
                        </div>
                    </div>
                </footer>
            </main>

            {/* Mobile Bottom Nav */}
            <MobileNavbar />
            {/* Floating Action Button */}
            <Link href="/under-construction" className="fixed bottom-10 right-10 w-14 h-14 bg-white text-black rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-50">
                <span className="material-symbols-outlined font-bold">add</span>
            </Link>
        </div>
    );
};

export default GrandmasterMonolith;