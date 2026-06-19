"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { endgameLines } from "@/data/endgames";
import { useGameStats } from "@/lib/hooks/useGameStats";

const PRACTICE_CATEGORIES: {
  name: string;
  slug: string;
  desc: string;
  total: number;
}[] = [
  {
    name: "Basic",
    slug: "basic",
    desc: "Basic checkmates with Queen, Rook, and Two Rooks",
    total: 37,
  },
  {
    name: "Pawn",
    slug: "pawn",
    desc: "Pawn endgames — races, opposition, and multi-pawn structures",
    total: 666,
  },
  {
    name: "Bishop",
    slug: "bishop",
    desc: "Bishop endgames — good vs bad bishops, opposite colors",
    total: 294,
  },
  {
    name: "Knight",
    slug: "knight",
    desc: "Knight endgames — piece activity and outposts",
    total: 340,
  },
  {
    name: "Knight-Bishop",
    slug: "knight-bishop",
    desc: "Knight vs Bishop — the classic imbalance",
    total: 277,
  },
  {
    name: "Rook-Pawn",
    slug: "rook-pawn",
    desc: "Rook and pawn endgames — the most common type",
    total: 577,
  },
  {
    name: "Rook-Pieces",
    slug: "rook-pieces",
    desc: "Rook vs minor pieces — material imbalances",
    total: 620,
  },
  {
    name: "Queen",
    slug: "queen",
    desc: "Queen endgames — queen activity and perpetual checks",
    total: 760,
  },
];

export default function EndgamesPage() {
  const stats = useGameStats();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const grouped: Record<string, typeof endgameLines> = {};
  for (const line of endgameLines) {
    if (!grouped[line.group]) grouped[line.group] = [];
    grouped[line.group].push(line);
  }

  const toggleGroup = (name: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  function LineCard({ line }: { line: typeof endgameLines[0] }) {
    const isChallenge = !!line.maxMoves;
    return (
      <div className="bg-surface-container border border-outline-variant/10 rounded-xl p-5 flex items-center gap-5 hover:bg-surface-container-high transition-all">
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-bold text-primary truncate">{line.name}</h4>
          <p className="text-xs text-on-surface-variant mt-1">
            {isChallenge
              ? `Beat Stockfish in ${line.maxMoves} moves`
              : `${line.moves.length} moves`}
          </p>
        </div>
        <Link
          href={`/learn/endgames/train/${line.id}`}
          className="px-4 py-2 rounded-full font-bold text-xs bg-primary text-on-primary hover:opacity-80 transition-all text-center whitespace-nowrap"
        >
          {isChallenge ? 'Challenge' : 'Learn'}
        </Link>
      </div>
    );
  }

  return (
    <>
      <main className="px-8 pb-20 max-w-7xl mx-auto pt-12">
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

        <section className="space-y-4">
          {Object.entries(grouped).map(([groupName, lines]) => {
            const isOpen = expandedGroups.has(groupName);
            return (
              <div key={groupName} className="bg-surface-container border border-outline-variant/10 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleGroup(groupName)}
                  className="w-full flex items-center justify-between p-6 cursor-pointer hover:bg-surface-container-high transition-colors"
                >
                  <div className="text-left">
                    <h2 className="text-xl font-black tracking-tight text-primary">{groupName}</h2>
                    <p className="text-sm text-on-surface-variant mt-1">{lines.length} lessons</p>
                  </div>
                  <span className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
                    expand_more
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 space-y-2">
                        {lines.map(line => (
                          <LineCard key={line.id} line={line} />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </section>

        {/* ── Practice Drills ── */}
        <section className="mt-24">
          <div className="mb-10">
            <h2 className="text-2xl font-black tracking-tight text-primary">
              Practice Drills
            </h2>
            <p className="text-sm text-on-surface-variant mt-2 max-w-xl">
              Drill endgame positions against Stockfish. No moves target — just
              play until checkmate or draw, then move to the next position.
            </p>
          </div>
          <div className="space-y-4">
            {PRACTICE_CATEGORIES.map((pc) => (
              <div
                key={pc.name}
                className="bg-surface-container border border-outline-variant/10 rounded-xl p-6 hover:border-outline-variant/30 transition-all"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-black tracking-tight text-primary">
                      {pc.name}
                    </h3>
                    <p className="text-sm text-on-surface-variant/80 mt-1.5 leading-relaxed max-w-lg">
                      {pc.desc}
                    </p>
                    <div className="flex items-center gap-3 mt-4">
                      <div className="flex-1 max-w-[200px] h-1.5 bg-outline-variant/20 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: "0%" }}
                        />
                      </div>
                      <span className="text-xs text-on-surface-variant font-medium whitespace-nowrap">
                        0/{pc.total} completed
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 pt-1">
                    <Link
                      href={`/learn/endgames/practice/${pc.slug}`}
                      className="inline-block px-5 py-2.5 bg-primary text-on-primary rounded-full font-bold text-xs hover:opacity-80 transition-all whitespace-nowrap"
                    >
                      Practice
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-24 grid grid-cols-1 md:grid-cols-4 gap-8 py-12 border-y border-outline-variant/10">
          <div>
            <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-2">Win Rate</p>
            <p className="text-2xl font-black text-primary">{stats.winRate.toFixed(0)}%</p>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-2">Games Played</p>
            <p className="text-2xl font-black text-primary">{stats.totalGames}</p>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-2">Avg. Accuracy</p>
            <p className="text-2xl font-black text-primary">{stats.averageAccuracy.toFixed(0)}%</p>
          </div>
          <div className="flex items-center justify-end">
            <Link href="/under-construction" className="px-8 py-4 bg-surface-container-highest rounded-full text-primary font-bold hover:bg-primary hover:text-surface transition-all duration-300">
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
    </>
  );
}
