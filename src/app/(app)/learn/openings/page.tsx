'use client';

import Link from "next/link";
import { useOpeningProgress } from "@/hooks/useOpeningProgress";

export default function OpeningsPage() {
  const { lines, totalLines, newCount, completedCount, getLine } = useOpeningProgress();
  const reviseCount = completedCount;

  return (
    <main className="px-8 pb-20 max-w-7xl mx-auto pt-12">
      <header className="mb-12">
        <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-4 uppercase tracking-widest font-semibold opacity-60">
          <Link href="/learn" className="hover:text-primary transition-colors">Learn</Link>
          <span className="material-symbols-outlined text-[12px]">chevron_right</span>
          <span className="text-primary/40">Openings</span>
        </nav>
        <h1 className="text-5xl lg:text-6xl font-black tracking-tighter text-primary mb-4 leading-none">
          Opening Trainer
        </h1>
        <p className="text-xl text-on-surface-variant max-w-2xl font-light leading-relaxed">
          Master opening lines through spaced repetition. Play each line move by move until it becomes second nature.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-4">
          {lines.map((line) => {
            const progress = getLine(line.id);
            const userMovesCount = line.moves.filter((_, i) => i % 2 === 1).length;

            return (
              <div key={line.id} className="bg-surface-container border border-outline-variant/10 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6 hover:bg-surface-container-high transition-all">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-black tracking-widest text-primary/50 uppercase">{line.eco}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      progress.status === 'new'
                        ? 'bg-blue-900/30 text-blue-400 border border-blue-500/20'
                        : 'bg-green-900/30 text-green-400 border border-green-500/20'
                    }`}>
                      {progress.status === 'new' ? 'New' : 'Completed'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-primary">{line.name}</h3>
                  <p className="text-sm text-on-surface-variant mt-1">
                    {userMovesCount} moves to learn
                  </p>
                </div>

                <div className="flex gap-3 shrink-0">
                  {progress.status === 'new' ? (
                    <Link
                      href={`/learn/openings/train/${line.id}?mode=learn`}
                      className="px-6 py-3 bg-primary text-on-primary rounded-full font-bold text-sm hover:opacity-80 transition-all text-center"
                    >
                      Start Learning
                    </Link>
                  ) : (
                    <>
                      <Link
                        href={`/learn/openings/train/${line.id}?mode=learn`}
                        className="px-6 py-3 border border-primary/20 text-primary rounded-full font-bold text-sm hover:bg-primary hover:text-on-primary transition-all text-center"
                      >
                        Re-learn
                      </Link>
                      <Link
                        href={`/learn/openings/train/${line.id}?mode=revise`}
                        className="px-6 py-3 bg-primary text-on-primary rounded-full font-bold text-sm hover:opacity-80 transition-all text-center"
                      >
                        Revise
                      </Link>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          <div className="bg-surface-container border border-outline-variant/10 rounded-xl p-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-5">Your Progress</h4>
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-on-surface-variant">New Lines</span>
                  <span className="text-2xl font-black text-primary">{newCount}</span>
                </div>
                <p className="text-[10px] text-on-surface-variant/50 uppercase tracking-wider">Remaining to learn</p>
              </div>
              <div className="h-px bg-outline-variant/20" />
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-on-surface-variant">Revise</span>
                  <span className="text-2xl font-black text-primary">{reviseCount}</span>
                </div>
                <p className="text-[10px] text-on-surface-variant/50 uppercase tracking-wider">Lines ready for review</p>
              </div>
              <div className="h-px bg-outline-variant/20" />
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-on-surface-variant">Completed</span>
                  <span className="text-2xl font-black text-primary">{completedCount}</span>
                </div>
                <p className="text-[10px] text-on-surface-variant/50 uppercase tracking-wider">Of {totalLines} total</p>
              </div>
            </div>
          </div>

          <div className="bg-surface-container border border-outline-variant/10 rounded-xl p-6">
            <h4 className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-3">Tip</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Start with <span className="text-primary font-bold">Learn</span> mode to see hints. When you&apos;re confident, switch to <span className="text-primary font-bold">Revise</span> to test your recall.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
