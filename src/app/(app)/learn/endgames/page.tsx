"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { endgameLines } from "@/data/endgames";
import { useGameStats } from "@/lib/hooks/useGameStats";

const PRACTICE_CATEGORIES: {
  name: string;
  slug: string;
  desc: string;
  total: number;
  icon: string;
}[] = [
  {
    name: "Basic",
    slug: "basic",
    desc: "Basic checkmates with Queen, Rook, and Two Rooks",
    total: 37,
    icon: "emoji_events",
  },
  {
    name: "Pawn",
    slug: "pawn",
    desc: "Pawn endgames — races, opposition, and multi-pawn structures",
    total: 666,
    icon: "grid_view",
  },
  {
    name: "Bishop",
    slug: "bishop",
    desc: "Bishop endgames — good vs bad bishops, opposite colors",
    total: 294,
    icon: "hub",
  },
  {
    name: "Knight",
    slug: "knight",
    desc: "Knight endgames — piece activity and outposts",
    total: 340,
    icon: "psychology",
  },
  {
    name: "Knight-Bishop",
    slug: "knight-bishop",
    desc: "Knight vs Bishop — the classic imbalance",
    total: 277,
    icon: "balance",
  },
  {
    name: "Rook-Pawn",
    slug: "rook-pawn",
    desc: "Rook and pawn endgames — the most common type",
    total: 577,
    icon: "castle",
  },
  {
    name: "Rook-Pieces",
    slug: "rook-pieces",
    desc: "Rook vs minor pieces — material imbalances",
    total: 620,
    icon: "security",
  },
  {
    name: "Queen",
    slug: "queen",
    desc: "Queen endgames — queen activity and perpetual checks",
    total: 760,
    icon: "diamond",
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

  function LineCard({ line }: { line: (typeof endgameLines)[0] }) {
    const isChallenge = !!line.maxMoves;
    return (
      <div className="bg-surface-container border border-outline-variant/10 rounded-xl p-5 flex items-center gap-5 hover:bg-surface-container-high transition-all">
        <div className="flex-1 min-w-0">
          <h4 className="text-base font-bold text-primary truncate">
            {line.name}
          </h4>
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
          {isChallenge ? "Challenge" : "Learn"}
        </Link>
      </div>
    );
  }

  return (
    <main className="px-8 pb-20 max-w-7xl mx-auto pt-12">
      <header className="mb-16">
        <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-4 uppercase tracking-widest font-semibold opacity-60">
          <Link href="/learn" className="hover:text-primary transition-colors">
            Learn
          </Link>
          <span className="material-symbols-outlined text-[12px]">
            chevron_right
          </span>
          <span className="text-primary font-bold">Endgames</span>
        </nav>
        <h1 className="text-5xl lg:text-6xl font-black tracking-tight text-primary leading-none mb-4">
          Endgames Course Gallery
        </h1>
        <p className="text-on-surface-variant max-w-xl text-lg leading-relaxed">
          Master the final phase of the game where precision is absolute. These
          curated courses provide the theoretical foundation and tactical
          precision required to convert advantages into victories.
        </p>
      </header>

      {/* Hero grid */}
      <div className="grid grid-cols-12 gap-6 mb-20">
        {/* Featured lesson card */}
        <div className="col-span-12 md:col-span-8 bg-surface-container rounded-xl p-10 flex flex-col justify-between group hover:bg-surface-container-high transition-all duration-500 min-h-[400px] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <span className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
                Endgame Essentials
              </span>
              <span className="text-on-surface-variant text-sm">
                {Object.keys(grouped).length} Groups
              </span>
            </div>
            <h3 className="text-3xl font-bold text-primary mb-6 group-hover:translate-x-2 transition-transform">
              King &amp; Pawn Endings
            </h3>
            <p className="text-on-surface-variant max-w-md leading-relaxed opacity-80">
              The most common endgame in chess. Master opposition, key squares,
              and pawn races to convert small advantages into wins.
            </p>
          </div>
          <div className="relative z-10 flex items-end justify-between mt-12">
            <div className="flex -space-x-4">
              <div className="w-12 h-12 rounded-full bg-surface-container-highest border-2 border-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-lg">
                  grid_view
                </span>
              </div>
              <div className="w-12 h-12 rounded-full bg-surface-container-highest border-2 border-surface-container flex items-center justify-center text-[10px] font-bold">
                +{PRACTICE_CATEGORIES.length - 1}
              </div>
            </div>
            <Link
              href="/learn/endgames/practice/pawn"
              className="bg-primary text-on-primary w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl"
            >
              <span className="material-symbols-outlined">play_arrow</span>
            </Link>
          </div>
        </div>

        {/* Stats card */}
        <div className="col-span-12 md:col-span-4 bg-surface-container-low rounded-xl p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-bl from-primary/5 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h4 className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-6">
              Your Stats
            </h4>
            <div className="space-y-5">
              <div>
                <p className="text-sm text-on-surface-variant mb-1">Win Rate</p>
                <p className="text-2xl font-black text-primary">
                  {stats.winRate.toFixed(0)}%
                </p>
              </div>
              <div className="h-px bg-outline-variant/20" />
              <div>
                <p className="text-sm text-on-surface-variant mb-1">
                  Games Played
                </p>
                <p className="text-2xl font-black text-primary">
                  {stats.totalGames}
                </p>
              </div>
              <div className="h-px bg-outline-variant/20" />
              <div>
                <p className="text-sm text-on-surface-variant mb-1">
                  Avg. Accuracy
                </p>
                <p className="text-2xl font-black text-primary">
                  {stats.averageAccuracy.toFixed(0)}%
                </p>
              </div>
            </div>
          </div>
          <div className="relative z-10 mt-8">
            <span className="bg-primary text-on-primary w-14 h-14 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined">emoji_events</span>
            </span>
          </div>
        </div>
      </div>

      {/* Lesson groups */}
      <section className="space-y-4 mb-20">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-primary mb-2">
              Lesson Library
            </h2>
            <p className="text-on-surface-variant text-sm">
              Browse all endgame lessons by category.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="px-6 py-2 rounded-full border border-outline-variant text-on-surface-variant text-xs hover:bg-surface-container transition-all cursor-pointer"
            >
              Filter
            </button>
            <button
              type="button"
              className="px-6 py-2 rounded-full bg-primary text-on-primary text-xs cursor-pointer"
            >
              Sort: A-Z
            </button>
          </div>
        </div>
        {Object.entries(grouped).map(([groupName, lines]) => {
          const isOpen = expandedGroups.has(groupName);
          return (
            <div
              key={groupName}
              className="bg-surface-container border border-outline-variant/10 rounded-xl overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggleGroup(groupName)}
                className="w-full flex items-center justify-between p-6 cursor-pointer hover:bg-surface-container-high transition-colors"
              >
                <div className="text-left flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-primary text-2xl">
                      chess
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-primary">
                      {groupName}
                    </h2>
                    <p className="text-sm text-on-surface-variant mt-1">
                      {lines.length} lessons
                    </p>
                  </div>
                </div>
                <span
                  className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                >
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
                      {lines.map((line) => (
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

      {/* Practice Drills - styled like Middle Games Course Library */}
      <section className="mt-24">
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="text-2xl font-bold text-primary mb-2">
              Practice Drills
            </h2>
            <p className="text-on-surface-variant text-sm">
              Drill endgame positions against Stockfish. No moves target — just
              play until checkmate or draw.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="px-6 py-2 rounded-full border border-outline-variant text-on-surface-variant text-xs hover:bg-surface-container transition-all cursor-pointer"
            >
              Filter
            </button>
            <button
              type="button"
              className="px-6 py-2 rounded-full bg-primary text-on-primary text-xs cursor-pointer"
            >
              Sort: Popular
            </button>
          </div>
        </div>
        <div className="space-y-4">
          {PRACTICE_CATEGORIES.map((pc) => (
            <Link
              key={pc.name}
              href={`/learn/endgames/practice/${pc.slug}`}
              className="flex flex-col md:flex-row items-center gap-6 p-6 bg-surface-container-low hover:bg-surface-container rounded-xl transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/3 to-transparent pointer-events-none" />
              <div className="relative z-10 w-16 h-16 rounded-xl bg-surface-container-highest flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-3xl">
                  {pc.icon}
                </span>
              </div>
              <div className="relative z-10 flex-1">
                <h5 className="text-primary font-bold text-lg group-hover:text-primary-tint transition-colors">
                  {pc.name}
                </h5>
                <p className="text-on-surface-variant text-sm opacity-60">
                  {pc.desc}
                </p>
              </div>
              <div className="relative z-10 flex gap-8 items-center shrink-0">
                <div className="text-right">
                  <p className="text-[10px] text-on-surface-variant/40 uppercase tracking-widest font-bold">
                    Positions
                  </p>
                  <p className="text-primary font-bold">{pc.total}</p>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quote section */}
      <section className="mt-32 relative overflow-hidden rounded-xl p-16 bg-surface-container-lowest flex items-center justify-center text-center">
        <div className="max-w-2xl relative z-10">
          <span className="material-symbols-outlined text-4xl text-primary/20 mb-6">
            format_quote
          </span>
          <h2 className="text-2xl italic font-light leading-relaxed text-on-surface mb-8">
            &ldquo;The endgame is the moment of truth. Here, all of the
            game&rsquo;s complexities are stripped away, leaving only the pure
            geometric essence of the pieces.&rdquo;
          </h2>
          <p className="text-xs uppercase tracking-widest text-primary/40">
            &mdash; Jos&eacute; Ra&uacute;l Capablanca
          </p>
        </div>
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none"></div>
      </section>
    </main>
  );
}
