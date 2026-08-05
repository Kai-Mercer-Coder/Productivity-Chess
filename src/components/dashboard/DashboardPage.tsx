"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import type { SessionWithProfile } from "@/types/profile";
import { Chess } from "chess.js";
import { motion, AnimatePresence } from "motion/react";
import { useGameStats } from "@/lib/hooks/useGameStats";
import { useLocalElo } from "@/lib/hooks/useLocalElo";
import MiniBoard from "./MiniBoard";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Yesterday" : `${days}d ago`;
}

function fenFromMoves(moves: string[]): string {
  const game = new Chess();
  for (const m of moves) {
    try {
      game.move(m);
    } catch {
      break;
    }
  }
  return game.fen();
}

function buildChart(data: { rating: number }[]): { line: string; area: string } {
  if (data.length === 0) return { line: "", area: "" };
  const w = 1000;
  const h = 300;
  const pad = 24;
  const ratings = data.map((d) => d.rating);
  const min = Math.min(...ratings);
  const max = Math.max(...ratings);
  const range = max - min || 1;
  const pts = data.map((d, i) => {
    const x =
      data.length === 1
        ? w / 2
        : pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((d.rating - min) / range) * (h - pad * 2);
    return [x, y];
  });
  if (data.length === 1) {
    const [x, y] = pts[0];
    const half = 80;
    const line = `M${x - half},${y} L${x + half},${y}`;
    const area = `${line} L${x + half},${h} L${x - half},${h} Z`;
    return { line, area };
  }
  const line = pts
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`)
    .join(" ");
  const area = `${line} L${pts[pts.length - 1][0]},${h} L${pts[0][0]},${h} Z`;
  return { line, area };
}

const TIERS = [
  { min: 0, label: "New to Chess", next: "Beginner", nextMin: 800 },
  { min: 800, label: "Beginner", next: "Intermediate", nextMin: 1200 },
  { min: 1200, label: "Intermediate", next: "Higher Intermediate", nextMin: 1700 },
  { min: 1700, label: "Higher Intermediate", next: "Advanced", nextMin: 2000 },
  { min: 2000, label: "Advanced", next: "Grandmaster", nextMin: 2300 },
  { min: 2300, label: "Grandmaster", next: "Super GM", nextMin: 2900 },
];

export default function GrandmasterDashboard() {
  const { data: session } = useSession();
  const { userElo: elo } = useLocalElo((session?.user as SessionWithProfile["user"] | undefined)?.elo);
  const stats = useGameStats();
  const [graphExpanded, setGraphExpanded] = useState(false);

  const ratingHistory =
    stats.ratingHistory.length > 0
      ? stats.ratingHistory
      : [{ date: "Today", rating: elo }];
  const { line, area } = buildChart(ratingHistory);

  const avgRating =
    ratingHistory.length > 0
      ? Math.round(
          ratingHistory.reduce((s, d) => s + d.rating, 0) / ratingHistory.length,
        )
      : elo;
  const maxRating = ratingHistory.length > 0
    ? Math.max(...ratingHistory.map((d) => d.rating))
    : elo;

  const currentTier = TIERS.findLast((t) => elo >= t.min) ?? TIERS[0];
  const nextTier = TIERS.find((t) => t.min > elo) ?? TIERS[TIERS.length - 1];
  const milestone = nextTier.nextMin;
  const tierMin = currentTier.min;
  const progress = Math.min(
    100,
    Math.max(0, ((elo - tierMin) / (milestone - tierMin)) * 100),
  );
  const remaining = milestone - elo;

  const labelEvery = Math.max(1, Math.ceil(ratingHistory.length / 6));

  return (
    <div className="px-8 pb-12 max-w-7xl mx-auto pt-12 space-y-12">
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-sm font-black tracking-tighter uppercase text-on-surface-variant">
              Performance Dashboard
            </h2>
            <div className="flex items-baseline gap-3">
              <span className="text-[5rem] font-black tracking-tighter leading-none">
                {elo}
              </span>
              <span className="text-primary font-bold text-lg">
                {currentTier.label}
              </span>
              {stats.eloDelta !== 0 && (
                <span
                  className={`font-bold text-sm ${stats.eloDelta > 0 ? "text-green-400" : "text-red-400"}`}
                >
                  {stats.eloDelta > 0 ? "▲" : "▼"} {Math.abs(stats.eloDelta)} this session
                </span>
              )}
            </div>
          </div>
          <Link
            href="/stats"
            className="px-4 py-2 rounded-full bg-surface-container-high text-on-surface text-xs font-bold uppercase tracking-widest hover:bg-surface-container-highest transition-colors cursor-pointer"
          >
            Full Stats
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div
            className="lg:col-span-8 w-full h-72 bg-surface-container-low rounded-xl relative overflow-hidden border border-white/5 cursor-pointer hover:border-primary/30 transition-colors"
            onClick={() => setGraphExpanded(true)}
          >
            {line ? (
              <svg className="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="dashGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="white" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={area} fill="url(#dashGrad)" />
                <path
                  d={line}
                  fill="none"
                  stroke="white"
                  strokeLinecap="round"
                  strokeWidth="3"
                />
              </svg>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-on-surface-variant text-sm font-medium">
                  No rating history yet
                </span>
              </div>
            )}
            <div className="absolute bottom-4 inset-x-6 flex justify-between text-[9px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">
              {ratingHistory.map(
                (d, i) =>
                  i % labelEvery === 0 && <span key={`${d.date}-${i}`}>{d.date}</span>,
              )}
            </div>
            <div className="absolute top-4 right-6 flex gap-3">
              <div className="px-4 py-2 border border-outline-variant/30 rounded-lg backdrop-blur-md bg-black/20">
                <span className="block text-[8px] text-on-surface-variant font-black tracking-widest">
                  AVG RATING
                </span>
                <span className="text-lg font-bold leading-tight">{avgRating}</span>
              </div>
              <div className="px-4 py-2 border border-outline-variant/30 rounded-lg backdrop-blur-md bg-black/20">
                <span className="block text-[8px] text-on-surface-variant font-black tracking-widest">
                  PEAK RATING
                </span>
                <span className="text-lg font-bold leading-tight">{maxRating}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-surface-container rounded-xl border border-white/5 p-8 flex flex-col justify-between space-y-6">
            <div className="flex justify-between items-start">
              <h3 className="text-2xl font-black leading-tight">
                MASTERY
                <br />
                PROGRESS
              </h3>
              <span className="material-symbols-outlined text-4xl text-on-surface-variant">
                military_tech
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                <span>{currentTier.label}</span>
                <span>{nextTier.label}</span>
              </div>
              <div className="h-4 bg-surface-container-highest rounded-full p-1">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs font-medium text-on-surface-variant">
                {Math.round(progress)}% of the way to{" "}
                {remaining > 0
                  ? `${remaining} points until ${nextTier.label}`
                  : `${nextTier.label} — max milestone reached`}
                .
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 rounded-full bg-surface-container-high border border-white/5 text-[9px] font-black text-on-surface-variant uppercase tracking-wider">
                {stats.totalGames} games
              </span>
              <span className="px-3 py-1.5 rounded-full bg-surface-container-high border border-white/5 text-[9px] font-black text-on-surface-variant uppercase tracking-wider">
                {stats.currentStreak.count > 0
                  ? `${stats.currentStreak.count} ${stats.currentStreak.type} streak`
                  : "no active streak"}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container p-8 rounded-xl space-y-4 hover:bg-surface-container-high transition-all border border-white/5">
          <span className="material-symbols-outlined text-primary">analytics</span>
          <div>
            <p className="text-[10px] font-black tracking-widest text-on-surface-variant uppercase">
              Accuracy
            </p>
            <p className="text-4xl font-black tracking-tighter">
              {stats.averageAccuracy.toFixed(1)}%
            </p>
          </div>
          <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{ width: `${Math.min(100, stats.averageAccuracy)}%` }}
            />
          </div>
        </div>
        <div className="bg-surface-container p-8 rounded-xl space-y-4 hover:bg-surface-container-high transition-all border border-white/5">
          <span className="material-symbols-outlined text-primary">donut_small</span>
          <div>
            <p className="text-[10px] font-black tracking-widest text-on-surface-variant uppercase">
              Win Rate
            </p>
            <p className="text-4xl font-black tracking-tighter">
              {stats.winRate.toFixed(1)}%
            </p>
          </div>
          <div className="flex h-1 bg-surface-container-highest rounded-full overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{ width: `${stats.winRate}%` }}
            />
            <div
              className="h-full bg-outline-variant"
              style={{ width: `${Math.max(0, 100 - stats.winRate)}%` }}
            />
          </div>
        </div>
        <div className="bg-surface-container p-8 rounded-xl space-y-4 hover:bg-surface-container-high transition-all border border-white/5">
          <span className="material-symbols-outlined text-primary">extension</span>
          <div>
            <p className="text-[10px] font-black tracking-widest text-on-surface-variant uppercase">
              Puzzles Solved
            </p>
            <p className="text-4xl font-black tracking-tighter">
              {stats.localPuzzleCount.toLocaleString()}
            </p>
          </div>
          <p className="text-xs text-on-surface-variant font-bold">
            {stats.totalGames} games played
          </p>
        </div>
        <div className="bg-surface-container p-8 rounded-xl space-y-4 hover:bg-surface-container-high transition-all border border-white/5">
          <span className="material-symbols-outlined text-primary">warning</span>
          <div>
            <p className="text-[10px] font-black tracking-widest text-on-surface-variant uppercase">
              Blunders / Game
            </p>
            <p className="text-4xl font-black tracking-tighter">
              {stats.blundersPerGame.toFixed(1)}
            </p>
          </div>
          <p className="text-xs text-on-surface-variant font-bold">
            {stats.wins} W &middot; {stats.losses} L &middot; {stats.draws} D
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex justify-between items-end">
            <h2 className="text-sm font-black tracking-tighter uppercase text-on-surface-variant">
              Recent Encounters
            </h2>
            <Link
              href="/stats"
              className="text-[10px] font-bold text-on-surface-variant hover:text-white transition-colors uppercase tracking-[0.2em]"
            >
              View History
            </Link>
          </div>

          <div className="space-y-3">
            {stats.recentGames.map((g) => {
              const fen = g.moves.length > 0 ? fenFromMoves(g.moves) : null;
              const orientation: "white" | "black" = g.playerColor === "b" ? "black" : "white";
              const isWin = g.result === "win";
              const isDraw = g.result === "draw";
              return (
                <div
                  key={g.id}
                  className="group bg-surface-container hover:bg-surface-container-high border border-white/5 p-5 rounded-2xl flex items-center gap-5 transition-all cursor-pointer"
                >
                  <div className="w-16 md:w-20 shrink-0">
                    {fen ? (
                      <MiniBoard
                        id={`g${g.id}`}
                        fen={fen}
                        orientation={orientation}
                      />
                    ) : (
                      <div className="w-full aspect-square rounded-lg bg-surface-container-high border border-white/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white/20">
                          chess
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white truncate">
                        vs Engine {g.opponentElo}
                      </span>
                      <span className="text-[9px] px-2 py-0.5 bg-white/10 text-on-surface-variant rounded-full font-black shrink-0">
                        {g.openingName ?? "Standard"}
                      </span>
                    </div>
                    <span className="text-[10px] text-on-surface-variant uppercase font-medium block">
                      {g.playerColor === "w" ? "White" : "Black"} &bull; {timeAgo(g.date)}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    {g.accuracy !== null && (
                      <span className="text-sm font-black text-white block">
                        {g.accuracy.toFixed(1)}%
                      </span>
                    )}
                    <span
                      className={`text-[9px] font-black uppercase tracking-[0.2em] block ${
                        isWin
                          ? "text-primary"
                          : isDraw
                            ? "text-on-surface-variant"
                            : "text-red-400"
                      }`}
                    >
                      {isWin ? "Victory" : isDraw ? "Draw" : "Loss"}
                    </span>
                  </div>
                </div>
              );
            })}
            {stats.recentGames.length === 0 && (
              <div className="bg-surface-container border border-white/5 rounded-2xl p-12 text-center">
                <span className="material-symbols-outlined text-4xl text-white/20 block mb-3">
                  sports_esports
                </span>
                <p className="text-on-surface-variant text-sm font-medium">
                  No games played yet — start a match and your final positions will appear here.
                </p>
                <Link
                  href="/play"
                  className="inline-block mt-6 bg-primary text-on-primary px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity"
                >
                  Play vs Engine
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Link
            href="/learn"
            className="block bg-primary text-on-primary rounded-2xl p-8 relative overflow-hidden group active:scale-[0.98] transition-all cursor-pointer"
          >
            <div className="absolute -right-6 -bottom-6 opacity-[0.06] group-hover:rotate-12 transition-transform duration-700">
              <span className="material-symbols-outlined text-[10rem]">school</span>
            </div>
            <div className="relative z-10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.25em] mb-3 opacity-60">
                Continue Training
              </h4>
              <h2 className="text-3xl font-black tracking-tighter leading-tight mb-5">
                Openings.
                <br />
                Middlegames.
                <br />
                Endgames.
              </h2>
              <p className="text-sm font-medium leading-relaxed mb-10 opacity-70">
                Pick up where you left off and drill the next module.
              </p>
              <span className="block bg-black text-white w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest text-center">
                Resume Training
                <span className="material-symbols-outlined text-sm inline-block align-middle ml-1">
                  arrow_forward
                </span>
              </span>
            </div>
          </Link>
        </div>
      </section>

      <AnimatePresence>
        {graphExpanded && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setGraphExpanded(false)}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div
              className="relative w-full max-w-5xl bg-surface-container rounded-2xl border border-white/10 p-8 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-black tracking-tight">Rating History</h3>
                  <p className="text-sm text-on-surface-variant mt-1">
                    {ratingHistory.length} data point{ratingHistory.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() => setGraphExpanded(false)}
                  className="p-2 rounded-full hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="w-full h-96 bg-surface-container-low rounded-xl relative overflow-hidden border border-white/5">
                {line ? (
                  <svg className="w-full h-full" viewBox="0 0 1000 300" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="modalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="white" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d={area} fill="url(#modalGrad)" />
                    <path
                      d={line}
                      fill="none"
                      stroke="white"
                      strokeLinecap="round"
                      strokeWidth="3"
                    />
                    {ratingHistory.map((d, i) => {
                      const x =
                        ratingHistory.length === 1
                          ? 500
                          : 24 + (i / (ratingHistory.length - 1)) * 952;
                      const minR = Math.min(...ratingHistory.map((r) => r.rating));
                      const maxR = Math.max(...ratingHistory.map((r) => r.rating));
                      const rangeR = maxR - minR || 1;
                      const y = 300 - 24 - ((d.rating - minR) / rangeR) * 252;
                      return (
                        <g key={`${d.date}-${i}`}>
                          <circle cx={x} cy={y} r="4" fill="white" className="opacity-80" />
                          <text
                            x={x}
                            y={y - 10}
                            textAnchor="middle"
                            fill="white"
                            fontSize="9"
                            className="font-bold"
                            style={{ fontFamily: "monospace" }}
                          >
                            {d.rating}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-on-surface-variant text-sm font-medium">
                      No rating history yet
                    </span>
                  </div>
                )}
                <div className="absolute bottom-4 inset-x-6 flex justify-between text-[9px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">
                  {ratingHistory.map(
                    (d, i) =>
                      i % Math.max(1, Math.ceil(ratingHistory.length / 10)) === 0 && (
                        <span key={`${d.date}-${i}`}>{d.date}</span>
                      ),
                  )}
                </div>
                <div className="absolute top-4 right-6 flex gap-3">
                  <div className="px-4 py-2 border border-outline-variant/30 rounded-lg backdrop-blur-md bg-black/20">
                    <span className="block text-[8px] text-on-surface-variant font-black tracking-widest">
                      AVG RATING
                    </span>
                    <span className="text-lg font-bold leading-tight">{avgRating}</span>
                  </div>
                  <div className="px-4 py-2 border border-outline-variant/30 rounded-lg backdrop-blur-md bg-black/20">
                    <span className="block text-[8px] text-on-surface-variant font-black tracking-widest">
                      PEAK RATING
                    </span>
                    <span className="text-lg font-bold leading-tight">{maxRating}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
