"use client";

import { useSession } from "next-auth/react";
import type { SessionWithProfile } from "@/types/profile";
import { useGameStats } from '@/lib/hooks/useGameStats';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} mins ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return days === 1 ? 'Yesterday' : `${days}d ago`;
}

const TIERS = [
  { min: 0, label: "New to Chess", next: "Beginner", nextMin: 800 },
  { min: 800, label: "Beginner", next: "Intermediate", nextMin: 1200 },
  { min: 1200, label: "Intermediate", next: "Higher Intermediate", nextMin: 1700 },
  { min: 1700, label: "Higher Intermediate", next: "Advanced", nextMin: 2000 },
  { min: 2000, label: "Advanced", next: "Grandmaster", nextMin: 2300 },
  { min: 2300, label: "Grandmaster", next: "Super GM", nextMin: 2900 },
];

export default function StatsPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const elo = (user as SessionWithProfile["user"])?.elo ?? 1200;
  const stats = useGameStats();

  const currentTier = TIERS.findLast((t) => elo >= t.min) ?? TIERS[0];
  const nextTier = TIERS.find((t) => t.min > elo) ?? TIERS[TIERS.length - 1];
  const milestone = nextTier.nextMin;
  const tierMin = currentTier.min;
  const progress = Math.min(100, Math.max(0, ((elo - tierMin) / (milestone - tierMin)) * 100));
  const remaining = milestone - elo;

  return (
    <div className="px-8 pb-12 max-w-7xl mx-auto pt-12 space-y-12">
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-sm font-black tracking-tighter uppercase text-on-surface-variant">ELO PERFORMANCE</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-[5rem] font-black tracking-tighter leading-none">{elo}</span>
              <span className="text-primary font-bold text-lg">{currentTier.label}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-full bg-surface-container-high text-on-surface text-xs font-bold uppercase tracking-widest cursor-pointer">7D</button>
            <button className="px-4 py-2 rounded-full bg-primary text-on-primary text-xs font-bold uppercase tracking-widest cursor-pointer">30D</button>
            <button className="px-4 py-2 rounded-full bg-surface-container-high text-on-surface text-xs font-bold uppercase tracking-widest cursor-pointer">ALL</button>
          </div>
        </div>
        <div className="w-full h-80 bg-surface-container-low rounded-lg relative overflow-hidden group">
          <svg className="w-full h-full" viewBox="0 0 1000 300">
            <defs>
              <linearGradient id="gradient" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="white" stopOpacity="0.2" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,250 Q100,240 200,200 T400,180 T600,120 T800,80 L1000,60 L1000,300 L0,300 Z" fill="url(#gradient)" />
            <path d="M0,250 Q100,240 200,200 T400,180 T600,120 T800,80 L1000,60" fill="none" stroke="white" strokeLinecap="round" strokeWidth="3" />
          </svg>
          <div className="absolute bottom-6 right-8 text-right">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-1">Current Form</p>
            <div className="flex gap-4">
              <div className="px-4 py-2 border border-outline-variant/30 rounded-lg backdrop-blur-md">
                <span className="block text-[8px] text-on-surface-variant">AVG RATING</span>
                <span className="text-lg font-bold">{Math.max(elo - 30, 0)}</span>
              </div>
              <div className="px-4 py-2 border border-outline-variant/30 rounded-lg backdrop-blur-md">
                <span className="block text-[8px] text-on-surface-variant">MAX RATING</span>
                <span className="text-lg font-bold">{elo}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-container p-8 rounded-xl space-y-4 hover:bg-surface-container-high transition-all">
          <span className="material-symbols-outlined text-primary">analytics</span>
          <div>
            <p className="text-[10px] font-black tracking-widest text-on-surface-variant uppercase">Accuracy</p>
            <p className="text-4xl font-black tracking-tighter">{stats.averageAccuracy.toFixed(1)}%</p>
          </div>
          <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${Math.min(100, stats.averageAccuracy)}%` }} />
          </div>
        </div>
        <div className="bg-surface-container p-8 rounded-xl space-y-4 hover:bg-surface-container-high transition-all">
          <span className="material-symbols-outlined text-primary">stars</span>
          <div>
            <p className="text-[10px] font-black tracking-widest text-on-surface-variant uppercase">Win Rate</p>
            <p className="text-4xl font-black tracking-tighter">{stats.winRate.toFixed(1)}%</p>
          </div>
          <div className="flex h-1 bg-surface-container-highest rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${stats.winRate}%` }} />
            <div className="h-full bg-outline-variant" style={{ width: `${Math.max(0, 100 - stats.winRate)}%` }} />
          </div>
        </div>
        <div className="bg-surface-container p-8 rounded-xl space-y-4 hover:bg-surface-container-high transition-all">
          <span className="material-symbols-outlined text-primary">extension</span>
          <div>
            <p className="text-[10px] font-black tracking-widest text-on-surface-variant uppercase">Puzzles</p>
            <p className="text-4xl font-black tracking-tighter">{stats.localPuzzleCount.toLocaleString()}</p>
          </div>
          <p className="text-xs text-on-surface-variant font-bold">{stats.totalGames} games played</p>
        </div>
        <div className="bg-surface-container p-8 rounded-xl space-y-4 hover:bg-surface-container-high transition-all">
          <span className="material-symbols-outlined text-primary">warning</span>
          <div>
            <p className="text-[10px] font-black tracking-widest text-on-surface-variant uppercase">Blunders</p>
            <p className="text-4xl font-black tracking-tighter">{stats.blundersPerGame.toFixed(1)}</p>
          </div>
          <p className="text-xs text-on-surface-variant font-bold">Avg. per match</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <section className="lg:col-span-2 space-y-6">
          <h2 className="text-sm font-black tracking-tighter uppercase text-on-surface-variant">OPENING MASTERY</h2>
          <div className="bg-surface-container-low rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/15">
                  <th className="px-8 py-4 text-[10px] font-black tracking-widest text-on-surface-variant uppercase">Opening Name</th>
                  <th className="px-8 py-4 text-[10px] font-black tracking-widest text-on-surface-variant uppercase">Games</th>
                  <th className="px-8 py-4 text-[10px] font-black tracking-widest text-on-surface-variant uppercase">Win %</th>
                  <th className="px-8 py-4 text-[10px] font-black tracking-widest text-on-surface-variant uppercase">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {stats.openingStats.slice(0, 10).map((op) => (
                  <tr key={op.name} className="hover:bg-surface-container transition-colors group">
                    <td className="px-8 py-5 font-bold">{op.name}</td>
                    <td className="px-8 py-5 text-on-surface-variant">{op.games}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <span className="font-black">{op.winRate.toFixed(0)}%</span>
                        <div className="w-20 h-1 bg-surface-container-highest rounded-full"><div className="h-full bg-primary" style={{ width: `${op.winRate}%` }} /></div>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-bold opacity-60 group-hover:opacity-100 transition-opacity">{op.accuracy.toFixed(1)}%</td>
                  </tr>
                ))}
                {stats.openingStats.length === 0 && (
                  <tr>
                    <td className="px-8 py-5 text-on-surface-variant" colSpan={4}>No games analyzed yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-12">
          <div className="bg-primary p-8 rounded-xl text-on-primary space-y-6">
            <div className="flex justify-between items-start">
              <h3 className="text-2xl font-black leading-tight">MASTERY<br />PROGRESS</h3>
              <span className="material-symbols-outlined text-4xl">trophy</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                <span>{currentTier.label}</span>
                <span>{nextTier.label}</span>
              </div>
              <div className="h-4 bg-black/10 rounded-full p-1">
                <div className="h-full bg-black rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs font-medium opacity-70">{Math.round(progress)}% of the way to {remaining > 0 ? `${remaining} points until ${nextTier.label}` : `${nextTier.label} — max milestone reached`}.</p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-sm font-black tracking-tighter uppercase text-on-surface-variant">LATEST NODES</h2>
            <div className="space-y-4">
              {stats.recentGames.slice(0, 5).map((g, i) => {
                const isWin = g.result === 'win';
                const isLoss = g.result === 'loss';
                const label = isWin ? 'W' : isLoss ? 'L' : 'D';
                const bgClass = isWin ? 'bg-primary text-on-primary' : isLoss ? 'bg-surface-container-highest text-on-surface-variant' : 'border border-outline-variant/30';
                return (
                  <div key={g.id} className={`flex items-center justify-between p-4 ${i === 0 ? 'bg-surface-container-high' : 'border border-outline-variant/15'} rounded-xl`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 flex items-center justify-center rounded-lg font-black ${bgClass}`}>{label}</div>
                      <div>
                        <p className="font-bold text-sm">vs Engine {g.opponentElo}</p>
                        <p className="text-[10px] text-on-surface-variant">{g.accuracy !== null ? `${g.accuracy.toFixed(1)}% Accuracy` : g.openingName ?? 'Analyzing...'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${isWin ? 'text-primary' : isLoss ? 'text-red-400' : ''}`}>{isWin ? '+1' : isLoss ? '-1' : '0'}</p>
                      <p className="text-[10px] text-on-surface-variant">{timeAgo(g.date)}</p>
                    </div>
                  </div>
                );
              })}
              {stats.recentGames.length === 0 && (
                <div className="p-4 text-center text-on-surface-variant text-sm">No games played yet</div>
              )}
            </div>
          </div>
        </section>
      </div>

      <footer className="pt-12 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-8 pb-12">
        <div className="space-y-1">
          <p className="text-[10px] font-black tracking-widest text-on-surface-variant uppercase">SERVER STATUS</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-bold">MONOLITH_ENGINE_V4.2 [ONLINE]</span>
          </div>
        </div>
        <div className="flex gap-8">
          <div className="text-center">
            <p className="text-2xl font-black leading-none">12M+</p>
            <p className="text-[8px] font-black tracking-widest text-on-surface-variant uppercase">POSITIONS ANALYZED</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black leading-none">0.0ms</p>
            <p className="text-[8px] font-black tracking-widest text-on-surface-variant uppercase">LATENCY</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
