"use client";

import Link from "next/link";
import Sidebar from "@/components/layouts/Sidebar";
import { useSidebar } from "@/components/layouts/SidebarContext";
import MobileNavbar from "@/components/layouts/MobileNavbar";

export default function EndgamesPage() {
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
            <span className="text-primary font-bold">Endgames</span>
          </nav>
          <h1 className="text-5xl lg:text-6xl font-black tracking-tight text-primary leading-none mb-4">
            Endgames Course Gallery
          </h1>
          <p className="text-on-surface-variant max-w-xl text-lg leading-relaxed">
            Master the final phase of the game where precision is absolute. These curated courses provide the theoretical foundation and tactical precision required to convert advantages into victories.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="#" className="group relative bg-surface-container border border-outline-variant/10 rounded-xl overflow-hidden hover:bg-surface-container-high transition-all duration-500 p-8 flex flex-col justify-between min-h-[420px] active:scale-[0.98]">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'wght' 200" }}>chess_pawn</span>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">Theoretical</span>
                <span className="text-on-surface-variant text-xs font-medium">8 Lessons</span>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4 leading-tight group-hover:translate-x-2 transition-transform duration-500">Pawn Endings</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
                The bedrock of endgame theory. Understand opposition, key squares, and the rule of the square. Mastering pawn endings is essential for any aspiring Grandmaster.
              </p>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Difficulty</p>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <div className="w-2 h-2 rounded-full bg-primary/20"></div>
                  <div className="w-2 h-2 rounded-full bg-primary/20"></div>
                </div>
              </div>
              <span className="w-12 h-12 rounded-full bg-primary text-surface flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">arrow_forward</span>
              </span>
            </div>
          </Link>

          <Link href="#" className="group relative bg-primary rounded-xl overflow-hidden shadow-2xl p-8 flex flex-col justify-between min-h-[420px] active:scale-[0.98]">
            <div className="absolute top-0 right-0 p-8 text-surface/10">
              <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'wght' 200" }}>chess_rook</span>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 bg-surface text-primary text-[10px] font-black uppercase tracking-widest rounded-full">Essential</span>
                <span className="text-surface/70 text-xs font-medium">14 Lessons</span>
              </div>
              <h3 className="text-2xl font-bold text-surface mb-4 leading-tight">Rook &amp; Pawn Essentials</h3>
              <p className="text-surface/80 text-sm leading-relaxed mb-8">
                The most frequent endgame in tournament play. Learn the Lucena position, Philidor&rsquo;s defense, and the Vancura maneuver to save drawn games and win winning ones.
              </p>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] text-surface/60 uppercase tracking-widest mb-1">Difficulty</p>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-surface"></div>
                  <div className="w-2 h-2 rounded-full bg-surface"></div>
                  <div className="w-2 h-2 rounded-full bg-surface/30"></div>
                </div>
              </div>
              <span className="w-12 h-12 rounded-full bg-surface text-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                <span className="material-symbols-outlined">play_arrow</span>
              </span>
            </div>
          </Link>

          <Link href="#" className="group relative bg-surface-container border border-outline-variant/10 rounded-xl overflow-hidden hover:bg-surface-container-high transition-all duration-500 p-8 flex flex-col justify-between min-h-[420px] active:scale-[0.98]">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'wght' 200" }}>memory</span>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">Advanced</span>
                <span className="text-on-surface-variant text-xs font-medium">5 Lessons</span>
              </div>
              <h3 className="text-2xl font-bold text-primary mb-4 leading-tight group-hover:translate-x-2 transition-transform duration-500">Tablebase Theory</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
                Deep dive into computer-perfect endgame play. Explore 7-piece tablebases and the counter-intuitive defensive resources that defy classical intuition.
              </p>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Difficulty</p>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                </div>
              </div>
              <span className="w-12 h-12 rounded-full bg-primary text-surface flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">science</span>
              </span>
            </div>
          </Link>
        </section>

        <section className="mt-24 grid grid-cols-1 md:grid-cols-4 gap-8 py-12 border-y border-outline-variant/10">
          <div>
            <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-2">Completion</p>
            <p className="text-2xl font-black text-primary">64%</p>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-2">Active Courses</p>
            <p className="text-2xl font-black text-primary">03</p>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-2">Practice Time</p>
            <p className="text-2xl font-black text-primary">124h</p>
          </div>
          <div className="flex items-center justify-end">
            <Link href="#" className="px-8 py-4 bg-surface-container-highest rounded-full text-primary font-bold hover:bg-primary hover:text-surface transition-all duration-300">
              Full Curriculum
            </Link>
          </div>
        </section>

        <section className="mt-32 relative overflow-hidden rounded-xl p-16 bg-surface-container-lowest flex items-center justify-center text-center">
          <div className="max-w-2xl relative z-10">
            <span className="material-symbols-outlined text-4xl text-primary/20 mb-6">format_quote</span>
            <h2 className="text-2xl italic font-light leading-relaxed text-on-surface mb-8">
              &ldquo;The endgame is the moment of truth. Here, all of the game&rsquo;s complexities are stripped away, leaving only the pure geometric essence of the pieces.&rdquo;
            </h2>
            <p className="text-xs uppercase tracking-widest text-primary/40">&mdash; Jos&eacute; Ra&uacute;l Capablanca</p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none"></div>
        </section>
      </main>
    </div>
  );
}
