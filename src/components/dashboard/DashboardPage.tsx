'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useSession } from "next-auth/react";
import '../../app/style.css';
import Lenis from 'lenis';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
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

export default function GrandmasterDashboard() {
  const { data: session } = useSession();
  const user = session?.user;
  const elo = (user as any)?.elo ?? 1200;
  const stats = useGameStats();

  const performanceData = stats.ratingHistory.length > 0
    ? stats.ratingHistory
    : [{ date: 'Today', rating: elo }];

  const encounters = stats.recentGames.map(g => {
    const isWin = g.result === 'win';
    const isDraw = g.result === 'draw';
    return {
      name: `Engine ${g.opponentElo}`,
      rating: g.opponentElo,
      time: timeAgo(g.date),
      mode: 'Standard',
      result: isWin ? '1 - 0' : isDraw ? '½ - ½' : '0 - 1',
      label: isWin ? 'Victory' : isDraw ? 'Draw' : 'Loss',
      labelClass: isWin ? 'text-white/40' : isDraw ? 'text-white/20' : 'text-white/40',
    };
  });

  useEffect(() => {
    const lenis = new Lenis();
    function raf(time: any) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    return () => lenis.destroy();
  }, []);

  const title =
    elo >= 2000 ? 'Grandmaster' :
    elo >= 1700 ? 'Higher Intermediate' :
    elo >= 1200 ? 'Intermediate' :
    elo >= 800 ? 'Beginner' :
    'New to Chess';

  const tierLabel =
    elo >= 2000 ? 'Top 0.1% Globally' :
    elo >= 1700 ? 'Top 5% Globally' :
    elo >= 1200 ? 'Top 25% Globally' :
    'Rising Star';

  const resultClass = (result: string) => {
    if (result === '1 - 0') return 'text-white';
    if (result === '0 - 1') return 'text-white';
    return 'text-white/50';
  };

  return (
    <>
      <main className="pt-32 pb-24 px-6 md:px-10 max-w-7xl mx-auto">
        {/* Status Badge */}
        <div className="flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 mb-12 w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/60">Live Engine Analysis Active</span>
        </div>

        {/* Hero Typography */}
        <div className="mb-16">
          <h1 className="text-huge font-black tracking-monolith text-white leading-none">
            GRANDMASTER<br/>DASHBOARD
          </h1>
          <p className="text-xl text-neutral-500 font-light leading-relaxed tracking-tight mt-6 max-w-xl">
            The terminal for elite chess mastery. Surgical precision. Unrestricted depth.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6 mb-12">
          <div className="col-span-12 lg:col-span-4 bg-surface-container rounded-2xl p-8 md:p-10 flex flex-col justify-between border border-white/5 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-700">
              <span className="material-symbols-outlined text-[15rem]">military_tech</span>
            </div>
            <div>
              <h3 className="text-on-surface-variant text-[10px] font-black uppercase tracking-[0.2em] mb-4">01 / Rating</h3>
              <div className="flex items-baseline gap-3">
                <span className="text-7xl md:text-8xl font-black tracking-tighter text-white">{elo}</span>
                <span className="text-white/40 font-bold text-xl">+{Math.max(0, Math.round(1400 - elo / 2))}</span>
              </div>
              <p className="text-on-surface-variant text-sm mt-3 font-medium">{title} Title &bull; {tierLabel}</p>
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <div className="bg-white/5 border border-white/5 px-4 py-2 rounded-full flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Online</span>
              </div>
              <div className="bg-white/5 border border-white/5 px-4 py-2 rounded-full flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-on-surface-variant">timer</span>
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Blitz 3+2</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8 bg-surface-container rounded-2xl p-8 md:p-10 border border-white/5 relative flex flex-col">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-on-surface-variant text-[10px] font-black uppercase tracking-[0.2em]">02 / Performance Trends</h3>
              <select className="bg-white/5 text-white border-none rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider outline-none cursor-pointer">
                <option>Last 30 Days</option>
                <option>Last 6 Months</option>
              </select>
            </div>
            <div className="flex-1" style={{ minHeight: 160 }}>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={performanceData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ratingGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#737373', fontSize: 10, fontWeight: 700 }} dy={8} />
                  <YAxis hide domain={['dataMin - 30', 'dataMax + 30']} />
                  <Tooltip
                    contentStyle={{ background: '#0F0F0F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 13 }}
                    labelStyle={{ color: '#A3A3A3' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="rating" stroke="#ffffff" strokeWidth={3} fill="url(#ratingGrad)" dot={false} activeDot={{ r: 4, fill: '#fff' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between mt-6 text-[9px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">
              {performanceData.map((d) => (
                <span key={d.date}>{d.date}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-7 xl:col-span-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black tracking-tight text-white uppercase">Recent Encounters</h2>
              <Link href="/under-construction" className="text-[10px] font-bold text-on-surface-variant hover:text-white transition-colors uppercase tracking-[0.2em]">View History</Link>
            </div>
            <div className="space-y-3">
              {encounters.map((enc) => (
                <div
                  key={enc.name}
                  className="group bg-surface-container hover:bg-surface-container-high border border-white/5 p-5 md:p-6 rounded-2xl flex items-center justify-between transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-white border border-white/10 group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined">person</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-white">{enc.name}</span>
                        <span className="text-[9px] px-2 py-0.5 bg-white/10 text-on-surface-variant rounded-full font-black">{enc.rating}</span>
                      </div>
                      <span className="text-[10px] text-on-surface-variant uppercase font-medium">{enc.time} &bull; {enc.mode}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xl font-black leading-none mb-1 ${resultClass(enc.result)}`}>{enc.result}</span>
                    <span className={`text-[9px] font-black ${enc.labelClass} uppercase tracking-[0.2em] block mt-1`}>{enc.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-5 xl:col-span-4 space-y-6">
            <Link href="/learn/middle-games" className="block bg-white text-black rounded-2xl p-8 relative overflow-hidden group shadow-[0_20px_50px_rgba(255,255,255,0.05)] cursor-pointer active:scale-[0.98] transition-all">
              <div className="absolute -right-6 -bottom-6 opacity-[0.05] group-hover:rotate-12 transition-transform duration-700">
                <span className="material-symbols-outlined text-[12rem]">school</span>
              </div>
              <div className="relative z-10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.25em] mb-3 opacity-50">Next Module</h4>
                <h2 className="text-3xl font-black tracking-tighter leading-tight mb-5">Sicilian Defense: <br/>Najdorf Mastery</h2>
                <p className="text-sm font-medium leading-relaxed mb-10 opacity-70">Analyze your recent losses with Black and master the counter-attack patterns of elite GMs.</p>
                <span className="block bg-black text-white w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest text-center">
                  Resume Training <span className="material-symbols-outlined text-sm inline-block align-middle ml-1">arrow_forward</span>
                </span>
              </div>
            </Link>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-surface-container p-6 rounded-2xl border border-white/5">
                <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest block mb-2">Win Rate</span>
                <span className="text-2xl font-black text-white">{stats.winRate.toFixed(1)}%</span>
              </div>
              <div className="bg-surface-container p-6 rounded-2xl border border-white/5">
                <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest block mb-2">Accuracy</span>
                <span className="text-2xl font-black text-white">{stats.averageAccuracy.toFixed(1)}%</span>
              </div>
              <div className="bg-surface-container p-6 rounded-2xl border border-white/5">
                <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest block mb-2">Streak</span>
                <span className="text-2xl font-black text-white">{stats.currentStreak.count > 0 ? `${stats.currentStreak.count} ${stats.currentStreak.type}` : '-'}</span>
              </div>
              <div className="bg-surface-container p-6 rounded-2xl border border-white/5">
                <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest block mb-2">Games</span>
                <span className="text-2xl font-black text-white">{stats.totalGames}</span>
              </div>
            </div>

            <div className="h-44 rounded-2xl overflow-hidden relative border border-white/10 flex items-center justify-center p-6 text-center bg-surface-container-low">
              <div className="absolute inset-0 bg-gradient-to-br from-surface-container-low to-black/60" />
              <span className="relative text-[10px] font-black text-white/30 uppercase tracking-[0.5em] leading-relaxed">The path to mastery is silent.</span>
            </div>
          </div>
        </div>
      </main>

      <Link href="/puzzles" className="fixed bottom-24 right-6 xl:bottom-10 xl:right-10 w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-40">
        <span className="material-symbols-outlined text-2xl">add</span>
      </Link>
    </>
  );
}
