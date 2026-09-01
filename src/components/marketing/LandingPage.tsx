"use client";

import Link from "next/link";
import MobileNavbar from "@/components/layouts/MobileNavbar";
import Navbar from "@/components/layouts/Navbar";
import CheckmateDrill from "@/components/dashboard/CheckmateDrill";

export default function LandingPage() {
  return (
    <div className="bg-black text-on-background selection:bg-white selection:text-black min-h-screen relative overflow-x-hidden">
      <Navbar />

      <main className="min-h-screen relative z-10">
        {/* Hero */}
        <section className="relative w-full flex flex-col items-center justify-center py-24 md:py-32 overflow-hidden">
          <div className="relative z-10 text-center w-full flex flex-col items-center">
            <div className="relative w-fit mx-auto">
              <h1 className="font-display text-[clamp(3rem,8vw,7rem)] leading-[0.95] italic font-light text-white px-4">
                Why did you
                <br className="hidden sm:block" />
                <span className="not-italic font-normal">&nbsp;lose?</span>
              </h1>
              <div className="hero-grain absolute -inset-10" aria-hidden="true"></div>
            </div>
            <p className="text-neutral-400 font-light leading-relaxed max-w-xl mx-auto px-6 mt-8 mb-12">
              Paste any game and get an instant Stockfish review — every move
              classified, your accuracy scored. Free, no account needed.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href="/review"
                className="bg-white text-black px-14 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>query_stats</span>
                Analyse Your Game
              </Link>
              <Link
                href="/login"
                className="bg-transparent border border-white/20 hover:border-white text-white hover:bg-white hover:text-black transition-all duration-300 text-[11px] font-bold uppercase tracking-widest px-14 py-4 rounded-full flex items-center justify-center gap-3 group"
              >
                <span className="material-symbols-outlined text-[18px] transition-transform group-hover:rotate-12">lock</span>
                Sign In for More
              </Link>
            </div>
          </div>
        </section>

        {/* Zen Interface */}
        <section className="px-6 md:px-10 py-20 max-w-7xl mx-auto text-center">
          <div className="mb-12">
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tighter text-white">
              The Zen Interface.
            </h2>
            <p className="text-neutral-400 font-light leading-relaxed mt-4 max-w-xl mx-auto">
              We removed the noise. No ads, no popups, no distracting chat
              bubbles. Just you, the board, and the engine. Deliver checkmate —
              the drill plays itself out in silence.
            </p>
          </div>
          <CheckmateDrill />
        </section>

        {/* Footer */}
        <footer className="px-6 md:px-10 py-16 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-white/10">
            <p className="text-[9px] uppercase tracking-[0.3em] text-neutral-700">
              © 2026 Monolith Chess Systems. On the board, nothing else.
            </p>
            <div className="flex gap-8">
              <Link href="/review" className="text-[9px] uppercase tracking-[0.3em] text-neutral-700 hover:text-white transition-colors">
                Review
              </Link>
              <Link href="/privacy" className="text-[9px] uppercase tracking-[0.3em] text-neutral-700 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-[9px] uppercase tracking-[0.3em] text-neutral-700 hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/credits" className="text-[9px] uppercase tracking-[0.3em] text-neutral-700 hover:text-white transition-colors">
                Credits
              </Link>
            </div>
          </div>
        </footer>
      </main>

      <MobileNavbar />
    </div>
  );
}
