"use client";

import Link from "next/link";
import Sidebar from "@/components/layouts/Sidebar";
import { useSidebar } from "@/components/layouts/SidebarContext";
import MobileNavbar from "@/components/layouts/MobileNavbar";

export default function MiddleGamesPage() {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-surface text-on-surface selection:bg-primary selection:text-on-primary">
      <Sidebar />
      <MobileNavbar />

      <main className={`transition-all duration-300 px-8 pb-20 max-w-7xl mx-auto pt-12 ${isCollapsed ? "md:ml-[68px]" : "md:ml-[220px] lg:ml-[240px] xl:ml-[260px]"}`}>
        <header className="mb-16">
          <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-4 uppercase tracking-widest font-semibold opacity-60">
            <Link href="/learn" className="hover:text-primary transition-colors">Learn</Link>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
            <span className="text-primary/40">Middle Games</span>
          </nav>
          <h1 className="text-5xl lg:text-6xl font-black tracking-tighter text-primary mb-4 leading-none">
            Middle Games<br />Mastery.
          </h1>
          <p className="text-xl text-on-surface-variant max-w-2xl font-light leading-relaxed">
            Move beyond tactical basics. These courses focus on the deep structural logic and positional sacrifices that define grandmaster-level play.
          </p>
        </header>

        <div className="grid grid-cols-12 gap-6">
          <Link href="#" className="col-span-12 md:col-span-8 bg-surface-container rounded-xl p-10 flex flex-col justify-between group hover:bg-surface-container-high transition-all duration-500 min-h-[450px]">
            <div>
              <div className="flex items-center justify-between mb-8">
                <span className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">Advanced Strategy</span>
                <span className="text-on-surface-variant text-sm">12 Modules &bull; 8.5 Hours</span>
              </div>
              <h3 className="text-3xl font-bold text-primary mb-6 group-hover:translate-x-2 transition-transform">Positional Sacrifices</h3>
              <p className="text-on-surface-variant max-w-md leading-relaxed opacity-80">
                Master the art of giving up material for long-term strategic dominance. Learn when a pawn is worth more as a memory than as a piece, and how to cripple opponent coordination through intuitive exchanges.
              </p>
            </div>
            <div className="flex items-end justify-between mt-12">
              <div className="flex -space-x-4">
                <div className="w-12 h-12 rounded-full bg-surface-container-highest border-2 border-surface-container flex items-center justify-center text-[10px] font-bold">+4</div>
              </div>
              <span className="bg-primary text-on-primary w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                <span className="material-symbols-outlined">play_arrow</span>
              </span>
            </div>
          </Link>

          <Link href="#" className="col-span-12 md:col-span-4 bg-surface-container-low rounded-xl p-8 flex flex-col group hover:bg-surface-container transition-all">
            <div className="mb-auto">
              <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary text-3xl">grid_view</span>
              </div>
              <h3 className="text-xl font-bold text-primary mb-4">Pawn Structures</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                The skeleton of the game. Study the Carlsbad, the Hedgehog, and the Isolated Queen Pawn structures.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-[10px] text-on-surface-variant font-bold uppercase tracking-tighter border-b border-outline-variant/10 pb-2">
                <span>Completion</span>
                <span className="text-primary">45%</span>
              </div>
              <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[45%]"></div>
              </div>
            </div>
          </Link>

          <Link href="#" className="col-span-12 md:col-span-4 bg-surface-container-highest rounded-xl p-8 flex flex-col justify-between group border border-primary/5 hover:border-primary/20 transition-all min-h-[350px]">
            <div>
              <h3 className="text-xl font-bold text-primary mb-2">Calculation Mastery</h3>
              <p className="text-on-surface-variant text-sm opacity-60 mb-8 italic">The Engine Within</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-on-surface-variant text-[13px]">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                  Candidate Move Selection
                </li>
                <li className="flex items-start gap-3 text-on-surface-variant text-[13px]">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                  Visualizing Complex Exchanges
                </li>
                <li className="flex items-start gap-3 text-on-surface-variant text-[13px]">
                  <span className="material-symbols-outlined text-primary text-sm mt-0.5">check_circle</span>
                  The Method of Elimination
                </li>
              </ul>
            </div>
            <span className="block w-full py-4 rounded-xl border border-outline-variant text-primary font-bold hover:bg-primary hover:text-on-primary transition-all text-center">Resume Session</span>
          </Link>

          <div className="col-span-12 md:col-span-8 bg-surface-container-low rounded-xl p-8 flex flex-col md:flex-row gap-8 items-center overflow-hidden relative">
            <div className="flex-1 z-10">
              <h4 className="text-primary font-bold text-2xl mb-2">Grandmaster Insights</h4>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-6">
                &ldquo;The middle game is the moment where chess becomes art. It is the bridge between the logic of the opening and the finality of the endgame.&rdquo;
              </p>
              <div className="flex gap-4">
                <div className="px-4 py-2 bg-surface-container rounded-lg border border-outline-variant/10">
                  <p className="text-[10px] text-on-surface-variant/50 uppercase tracking-widest">Active Learners</p>
                  <p className="text-primary font-black text-lg">12.4K</p>
                </div>
                <div className="px-4 py-2 bg-surface-container rounded-lg border border-outline-variant/10">
                  <p className="text-[10px] text-on-surface-variant/50 uppercase tracking-widest">Puzzles Solved</p>
                  <p className="text-primary font-black text-lg">890K</p>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/3 aspect-square relative z-10 flex items-center justify-center">
              <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl"></div>
              <span className="material-symbols-outlined text-[120px] text-primary/10 select-none" style={{ fontVariationSettings: "'FILL' 1" }}>castle</span>
            </div>
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent"></div>
          </div>
        </div>

        <section className="mt-24">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-2xl font-bold text-primary mb-2">Course Library</h2>
              <p className="text-on-surface-variant text-sm">Browse all middle game topics by popularity or difficulty.</p>
            </div>
            <div className="flex gap-2">
              <button className="px-6 py-2 rounded-full border border-outline-variant text-on-surface-variant text-sm font-bold hover:bg-surface-container transition-all">Filter</button>
              <button className="px-6 py-2 rounded-full bg-primary text-on-primary text-sm font-bold">Sort: Newest</button>
            </div>
          </div>
          <div className="space-y-4">
            <Link href="#" className="flex flex-col md:flex-row items-center gap-6 p-6 bg-surface-container-low hover:bg-surface-container rounded-xl transition-all group">
              <div className="w-16 h-16 rounded-xl bg-surface-container-highest flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-3xl">psychology</span>
              </div>
              <div className="flex-1">
                <h5 className="text-primary font-bold text-lg group-hover:text-primary-tint transition-colors">The Art of the Counter-Attack</h5>
                <p className="text-on-surface-variant text-sm opacity-60">Master the precise timing required to turn a defensive position into a winning offensive.</p>
              </div>
              <div className="flex gap-8 items-center shrink-0">
                <div className="text-right">
                  <p className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest font-bold">Difficulty</p>
                  <p className="text-primary font-bold">Expert</p>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </Link>
            <Link href="#" className="flex flex-col md:flex-row items-center gap-6 p-6 bg-surface-container-low hover:bg-surface-container rounded-xl transition-all group">
              <div className="w-16 h-16 rounded-xl bg-surface-container-highest flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-3xl">hub</span>
              </div>
              <div className="flex-1">
                <h5 className="text-primary font-bold text-lg group-hover:text-primary-tint transition-colors">Knight vs. Bishop Endgames</h5>
                <p className="text-on-surface-variant text-sm opacity-60">Transitioning from middle game to endgame with the correct minor piece imbalance.</p>
              </div>
              <div className="flex gap-8 items-center shrink-0">
                <div className="text-right">
                  <p className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest font-bold">Difficulty</p>
                  <p className="text-primary font-bold">Intermediate</p>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </div>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
