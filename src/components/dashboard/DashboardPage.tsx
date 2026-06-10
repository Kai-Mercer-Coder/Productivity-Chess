'use client';
import React, { useEffect } from 'react';
import { useSession } from "next-auth/react";
import '../../app/style.css';
import Lenis from 'lenis';
import Sidebar from '@/components/layouts/Sidebar';
import MobileNavbar from '@/components/layouts/MobileNavbar';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const performanceData = [
  { date: 'Oct 01', rating: 1200 },
  { date: 'Oct 05', rating: 1220 },
  { date: 'Oct 10', rating: 1180 },
  { date: 'Oct 15', rating: 1250 },
  { date: 'Oct 20', rating: 1240 },
  { date: 'Today', rating: 1260 },
];

const puzzlesByDay = [
  { day: 'Mon', solved: 12 },
  { day: 'Tue', solved: 8 },
  { day: 'Wed', solved: 15 },
  { day: 'Thu', solved: 10 },
  { day: 'Fri', solved: 5 },
  { day: 'Sat', solved: 20 },
  { day: 'Sun', solved: 14 },
];

export default function GrandmasterDashboard() {
  const { data: session } = useSession();
  const user = session?.user;
  const elo = (user as any)?.elo ?? 1200;
  const rd = (user as any)?.delta_value ?? 200;
  const puzzlesSolved = (user as any)?.puzzles_solved ?? 0;

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
    elo >= 2000 ? 'Advanced' :
    elo >= 1700 ? 'Higher Intermediate' :
    elo >= 1200 ? 'Intermediate' :
    elo >= 800 ? 'Beginner' :
    'New to Chess';

  return (
    <div className="bg-background text-on-surface min-h-screen selection:bg-white selection:text-black">
      <Sidebar />

      <main className="xl:ml-32 pt-32 pb-24 px-6 md:px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-6 mb-12">
          {/* ELO Card */}
          <div className="col-span-12 lg:col-span-4 bg-surface rounded-3xl p-8 md:p-10 flex flex-col justify-between border border-white/5 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 group-hover:opacity-10 transition-opacity duration-700">
              <span className="material-symbols-outlined text-[15rem]">military_tech</span>
            </div>
            <div>
              <h3 className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Current Rating</h3>
              <div className="flex items-baseline gap-3">
                <span className="text-7xl md:text-8xl font-black tracking-tighter text-white">{elo}</span>
                <span className="text-white/60 font-bold text-xl">±{rd}</span>
              </div>
              <p className="text-on-surface-variant text-sm mt-3 font-medium capitalize">{title} • {puzzlesSolved} puzzles solved</p>
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <div className="bg-white/5 border border-white/5 px-4 py-2 rounded-full flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Online</span>
              </div>
            </div>
          </div>

          {/* Performance Graph */}
          <div className="col-span-12 lg:col-span-8 bg-surface rounded-3xl p-8 md:p-10 border border-white/5 relative flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em]">Rating Trend</h3>
            </div>
            <div className="flex-1" style={{ minHeight: 180 }}>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={performanceData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="ratingGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#737373', fontSize: 10, fontWeight: 700 }} dy={8} />
                  <YAxis domain={['dataMin - 50', 'dataMax + 50']} axisLine={false} tickLine={false} tick={{ fill: '#737373', fontSize: 10, fontWeight: 700 }} dx={-4} />
                  <Tooltip
                    contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 13 }}
                    labelStyle={{ color: '#a3a3a3' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="rating" stroke="#ffffff" strokeWidth={2} fill="url(#ratingGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Secondary Grid */}
        <div className="grid grid-cols-12 gap-8">
          {/* Puzzles This Week */}
          <div className="col-span-12 lg:col-span-7 xl:col-span-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black tracking-tight text-white uppercase italic">Puzzles This Week</h2>
            </div>
            <div className="bg-surface rounded-3xl p-6 md:p-8 border border-white/5" style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={puzzlesByDay} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="puzzleGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#a3e635" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#a3e635" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#737373', fontSize: 10, fontWeight: 700 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#737373', fontSize: 10, fontWeight: 700 }} dx={-4} />
                  <Tooltip
                    contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 13 }}
                    labelStyle={{ color: '#a3a3a3' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="solved" stroke="#a3e635" strokeWidth={2} fill="url(#puzzleGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mini Stats */}
          <div className="col-span-12 lg:col-span-5 xl:col-span-4 space-y-6">
            <div className="bg-surface rounded-3xl p-6 md:p-8 border border-white/5">
              <h3 className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em] mb-5">Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Rating</span>
                  <span className="text-2xl font-black text-white">{elo}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">RD</span>
                  <span className="text-2xl font-black text-white">±{rd}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Level</span>
                  <span className="text-2xl font-black text-white">{Math.floor(elo / 200) + 1}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Puzzles</span>
                  <span className="text-2xl font-black text-white">{puzzlesSolved ?? 0}</span>
                </div>
              </div>
            </div>

            {/* CTA Card */}
            <div className="bg-white text-black rounded-3xl p-8 relative overflow-hidden group shadow-[0_20px_50px_rgba(255,255,255,0.05)] cursor-pointer active:scale-[0.98] transition-all">
              <div className="absolute -right-6 -bottom-6 opacity-[0.05] group-hover:rotate-12 transition-transform duration-700">
                <span className="material-symbols-outlined text-[12rem]">school</span>
              </div>
              <div className="relative z-10">
                <h4 className="text-[10px] font-black uppercase tracking-[0.25em] mb-3 opacity-50">Next Challenge</h4>
                <h2 className="text-3xl font-black tracking-tighter leading-tight mb-5">Puzzle Rush</h2>
                <p className="text-sm font-medium leading-relaxed mb-10 opacity-70">Solve as many puzzles as you can. Beat your high score.</p>
                <button className="bg-black text-white w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-3 group-hover:gap-5 transition-all">
                  Start <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Aesthetic Block */}
            <div className="h-36 rounded-2xl overflow-hidden relative border border-white/10 flex items-center justify-center p-6 text-center bg-neutral-900/40">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em] leading-relaxed">The path to mastery is silent.</span>
            </div>
          </div>
        </div>
      </main>

      <MobileNavbar />
      <button className="fixed bottom-24 right-6 xl:bottom-10 xl:right-10 w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-40">
        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
      </button>
    </div>
  );
}
