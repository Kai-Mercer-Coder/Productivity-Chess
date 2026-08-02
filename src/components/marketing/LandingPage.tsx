'use client';

import Link from 'next/link';
import Navbar from '@/components/layouts/Navbar';
import MobileNavbar from '@/components/layouts/MobileNavbar';
import { useSession } from "next-auth/react";
import MiniBoard from "@/components/dashboard/MiniBoard";
import CheckmateDrill from "@/components/dashboard/CheckmateDrill";

const HERO_FEN = "rn2k2r/ppq1bppp/2pp1n2/3Pp1N1/4P3/2N4P/PPPBbPP1/R2QK2R w KQkq - 0 11";

const FEATURES = [
  {
    label: "01 / Tactics",
    title: "Unlimited Tactical Puzzles",
    desc: "A growing database of curated positions with adaptive difficulty. No daily limits, no paywalls — pure calculation training.",
    icon: "bolt",
    href: "/puzzles",
  },
  {
    label: "02 / Analysis",
    title: "Unrestricted Game Review",
    desc: "Stockfish 18 NNUE evaluates every move with depth-18 lines, classifications, and human-readable coach notes.",
    icon: "query_stats",
    href: "/analysis",
  },
  {
    label: "03 / Endgames",
    title: "Master the Final Phase",
    desc: "Walkthroughs and challenges for rook, queen, and pawn endings — plus random drills to sharpen the kill.",
    icon: "sports_esports",
    href: "/learn/endgames",
  },
];

export default function GrandmasterMonolith() {
  const { data: session } = useSession();
  const startHref = session ? "/dashboard" : "/login";

  return (
    <div className="bg-background text-on-background selection:bg-white selection:text-black min-h-screen">
      <Navbar />

      <main className="pt-32 min-h-screen">
        {/* Hero Section */}
        <section className="px-6 md:px-10 pb-16 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-6 md:space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-3 px-3 py-1 rounded-full border border-white/10 bg-white/5 mx-auto lg:mx-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/60">Stockfish 18 NNUE · Live</span>
            </div>
            <h1 className="text-huge font-black tracking-monolith text-white">
              MONOLITH
            </h1>
            <p className="text-xl text-neutral-500 font-light leading-relaxed tracking-tight max-w-md mx-auto lg:mx-0">
              The terminal for chess mastery. Tactics, deep analysis, endgame drills — everything on the board, nothing off it.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
              <Link href={startHref} className="bg-white text-black px-10 py-5 rounded-full font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all">
                Begin Training
              </Link>
              <Link href="/learn" className="bg-transparent text-white border border-white/10 px-10 py-5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-all">
                Explore Courses
              </Link>
            </div>
          </div>

          <div className="relative w-full max-w-[520px] mx-auto lg:max-w-none">
            <div className="rounded-2xl overflow-hidden border border-white/5 shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
              <MiniBoard id="hero" fen={HERO_FEN} />
            </div>
            <div className="flex items-center justify-center gap-2 mt-5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/30">
                Live position &middot; Stockfish 18 NNUE
              </span>
            </div>
          </div>
        </section>

        {/* Feature Panels */}
        <section className="px-6 md:px-10 py-20 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <Link
                key={f.label}
                href={f.href}
                className="group bg-surface-container border border-white/5 rounded-2xl p-8 space-y-6 hover:bg-surface-container-high transition-all active:scale-[0.99]"
              >
                <div className="flex items-start justify-between">
                  <span className="w-12 h-12 rounded-xl bg-surface-container-high border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-white transition-colors">{f.icon}</span>
                  </span>
                  <span className="text-[9px] font-black tracking-[0.3em] uppercase text-white/20">{f.label}</span>
                </div>
                <h3 className="text-xl font-black text-white tracking-tighter">{f.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{f.desc}</p>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-white transition-colors">
                  Explore
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Playable Checkmate Drill */}
        <section className="px-6 md:px-10 py-20 max-w-7xl mx-auto">
          <div className="mb-10">
            <h2 className="text-sm font-black tracking-tighter uppercase text-on-surface-variant">Checkmate Drill</h2>
            <p className="text-neutral-500 font-light leading-relaxed mt-2 max-w-xl">
              A random endgame position against Stockfish. You play the side to move. Deliver mate — there is no fanfare, only the position.
            </p>
          </div>
          <CheckmateDrill />
        </section>

        {/* Strategic Mastery */}
        <section className="px-6 md:px-10 py-24 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-8">
              <h2 className="text-5xl font-black tracking-tighter text-white uppercase leading-none">Strategic<br />Mastery</h2>
              <div className="h-0.5 w-12 bg-white"></div>
              <p className="text-neutral-400 leading-relaxed font-light">
                Improvement is not accidental. It is the result of focused, high-repetition exposure to complex patterns. Monolith provides the environment for that consolidation.
              </p>
            </div>
            <div className="space-y-8 lg:pt-24">
              <h2 className="text-5xl font-black tracking-tighter text-white uppercase leading-none">Engineered<br />For Precision</h2>
              <div className="h-0.5 w-12 bg-white"></div>
              <p className="text-neutral-400 leading-relaxed font-light">
                Every pixel of the interface is calculated to minimize cognitive load. On the board, nothing but the position. No chat. No distractions.
              </p>
              <ul className="space-y-4 pt-4">
                <li className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-white/80">
                  <span className="material-symbols-outlined text-sm">check</span>
                  Zero-Distraction Mode
                </li>
                <li className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-white/80">
                  <span className="material-symbols-outlined text-sm">check</span>
                  Local Stockfish Workers
                </li>
                <li className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-white/80">
                  <span className="material-symbols-outlined text-sm">check</span>
                  Endgame Tablebases
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-8 text-center bg-white/5 border-y border-white/5">
          <div className="max-w-3xl mx-auto space-y-10">
            <h2 className="text-5xl md:text-6xl font-black tracking-monolith text-white uppercase">Unrestricted Access.</h2>
            <p className="text-neutral-400 uppercase tracking-[0.4em] text-[11px] font-bold">
              Training that never tells you to wait.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6 pt-4">
              <Link href={startHref} className="bg-white text-black px-16 py-6 rounded-full font-black text-sm uppercase tracking-widest hover:bg-neutral-200 transition-all active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                Start Training
              </Link>
              <Link href="/dashboard" className="bg-transparent text-white border border-white/10 px-16 py-6 rounded-full font-black text-sm uppercase tracking-widest hover:bg-white/5 transition-all">
                Open Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 md:px-10 py-16 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
            <div className="col-span-2">
              <span className="text-2xl font-black text-white tracking-tighter uppercase block mb-6">Monolith</span>
              <p className="text-xs uppercase tracking-widest text-neutral-600 leading-loose max-w-xs">
                The standard for competitive chess training. On the board. Nothing else.
              </p>
            </div>
            <div className="space-y-5">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Training</h4>
              <ul className="space-y-3 text-[11px] uppercase tracking-widest text-neutral-500 font-medium">
                <li><Link className="hover:text-white transition-colors" href="/play">Play vs Engine</Link></li>
                <li><Link className="hover:text-white transition-colors" href="/puzzles">Puzzles</Link></li>
                <li><Link className="hover:text-white transition-colors" href="/analysis">Analysis</Link></li>
                <li><Link className="hover:text-white transition-colors" href="/learn">Courses</Link></li>
              </ul>
            </div>
            <div className="space-y-5">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Product</h4>
              <ul className="space-y-3 text-[11px] uppercase tracking-widest text-neutral-500 font-medium">
                <li><Link className="hover:text-white transition-colors" href="/stats">Stats</Link></li>
                <li><Link className="hover:text-white transition-colors" href="/variants">Variants</Link></li>
                <li><Link className="hover:text-white transition-colors" href="/credits">Credits</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-monolith">
            <p className="text-[9px] uppercase tracking-[0.3em] text-neutral-700">© 2026 Monolith Chess Systems. On the board, nothing else.</p>
            <div className="flex gap-8">
              <Link href="/privacy" className="text-[9px] uppercase tracking-[0.3em] text-neutral-700 hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="text-[9px] uppercase tracking-[0.3em] text-neutral-700 hover:text-white transition-colors">Terms</Link>
              <Link href="/credits" className="text-[9px] uppercase tracking-[0.3em] text-neutral-700 hover:text-white transition-colors">Credits</Link>
            </div>
          </div>
        </footer>
      </main>

      <MobileNavbar />
    </div>
  );
};
