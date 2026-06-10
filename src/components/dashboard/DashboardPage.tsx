'use client';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useSession } from "next-auth/react";
import '../../app/style.css';
import Lenis from 'lenis';
import Sidebar from '@/components/layouts/Sidebar';
import { useSidebar } from '@/components/layouts/SidebarContext';
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

const encounters = [
  { name: 'Magnus_C', rating: 2850, time: '10 mins ago', mode: 'Blitz', result: '1 - 0', label: 'Victory', labelClass: 'text-white/40' },
  { name: 'Hikaru_N', rating: 2892, time: '2 hours ago', mode: 'Bullet', result: '½ - ½', label: 'Draw', labelClass: 'text-white/20' },
  { name: 'Alireza_F', rating: 2810, time: 'Yesterday', mode: 'Rapid', result: '1 - 0', label: 'Victory', labelClass: 'text-white/40' },
];

export default function GrandmasterDashboard() {
  const { data: session } = useSession();
  const { isCollapsed } = useSidebar();
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
    <div className="bg-background text-on-surface min-h-screen selection:bg-white selection:text-black">
      <Sidebar />

      <main className={`transition-all duration-300 pt-32 pb-24 px-6 md:px-10 max-w-7xl mx-auto ${isCollapsed ? "md:ml-[68px]" : "md:ml-[220px] lg:ml-[240px] xl:ml-[260px]"}`}>
        <div className="grid grid-cols-12 gap-6 mb-12">
          <div className="col-span-12 lg:col-span-4 bg-surface rounded-3xl p-8 md:p-10 flex flex-col justify-between border border-white/5 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-700">
              <span className="material-symbols-outlined text-[15rem]">military_tech</span>
            </div>
            <div>
              <h3 className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Current Rating</h3>
              <div className="flex items-baseline gap-3">
                <span className="text-7xl md:text-8xl font-black tracking-tighter text-white">{elo}</span>
                <span className="text-white/60 font-bold text-xl">+{Math.max(0, Math.round(1400 - elo / 2))}</span>
              </div>
              <p className="text-on-surface-variant text-sm mt-3 font-medium">{title} Title &bull; {tierLabel}</p>
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <div className="bg-white/5 border border-white/5 px-4 py-2 rounded-full flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Online</span>
              </div>
              <div className="bg-white/5 border border-white/5 px-4 py-2 rounded-full flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-on-surface-variant">timer</span>
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Blitz 3+2</span>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8 bg-surface rounded-3xl p-8 md:p-10 border border-white/5 relative flex flex-col">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em]">Performance Trends</h3>
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
                    contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 13 }}
                    labelStyle={{ color: '#a3a3a3' }}
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
              <h2 className="text-xl font-black tracking-tight text-white uppercase italic">Recent Encounters</h2>
              <Link href="#" className="text-[10px] font-bold text-on-surface-variant hover:text-white transition-colors uppercase tracking-[0.2em]">View History</Link>
            </div>
            <div className="space-y-3">
              {encounters.map((enc) => (
                <div
                  key={enc.name}
                  className="group bg-surface hover:bg-surface-container-high border border-white/5 p-5 md:p-6 rounded-2xl flex items-center justify-between transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white border border-white/10 group-hover:scale-110 transition-transform">
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
            <Link href="/learn/middle-games" className="block bg-white text-black rounded-3xl p-8 relative overflow-hidden group shadow-[0_20px_50px_rgba(255,255,255,0.05)] cursor-pointer active:scale-[0.98] transition-all">
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
              <div className="bg-surface p-6 rounded-2xl border border-white/5">
                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Win Rate</span>
                <span className="text-2xl font-black text-white">68.4%</span>
              </div>
              <div className="bg-surface p-6 rounded-2xl border border-white/5">
                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Accuracy</span>
                <span className="text-2xl font-black text-white">94.2%</span>
              </div>
              <div className="bg-surface p-6 rounded-2xl border border-white/5">
                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Streak</span>
                <span className="text-2xl font-black text-white">{Math.min(99, Math.max(1, Math.floor(elo / 150)))} Lvl</span>
              </div>
              <div className="bg-surface p-6 rounded-2xl border border-white/5">
                <span className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest block mb-2">Puzzles</span>
                <span className="text-2xl font-black text-white">{puzzlesSolved.toLocaleString() || 1242}</span>
              </div>
            </div>

            <div className="h-44 rounded-2xl overflow-hidden relative border border-white/10 flex items-center justify-center p-6 text-center bg-neutral-900/40">
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/20 to-black/60" />
              <span className="relative text-[10px] font-black text-white/30 uppercase tracking-[0.5em] leading-relaxed">The path to mastery is silent.</span>
            </div>
          </div>
        </div>
      </main>

      <MobileNavbar />
      <Link href="/puzzles" className="fixed bottom-24 right-6 xl:bottom-10 xl:right-10 w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-40">
        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>add</span>
      </Link>
    </div>
  );
}
