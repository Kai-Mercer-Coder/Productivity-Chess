'use client';

import { useState } from "react";
import Link from "next/link";
import { useOpeningProgress } from "@/hooks/useOpeningProgress";

export default function OpeningsPage() {
  const { lines, totalLines, newCount, completedCount, getLine } = useOpeningProgress();
  const reviseCount = completedCount;
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const grouped: Record<string, typeof lines> = {};
  const ungrouped: typeof lines = [];
  for (const line of lines) {
    if (line.group) {
      if (!grouped[line.group]) grouped[line.group] = [];
      grouped[line.group].push(line);
    } else {
      ungrouped.push(line);
    }
  }

  function LineCard({ line }: { line: typeof lines[0] }) {
    const progress = getLine(line.id);
    const userMovesCount = line.moves.filter((_, i) => i % 2 === 1).length;
    return (
      <div className="bg-surface-container border border-outline-variant/10 rounded-xl p-5 flex items-center gap-5 hover:bg-surface-container-high transition-all">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black tracking-widest text-primary/50 uppercase shrink-0">{line.eco}</span>
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full shrink-0 ${
              progress.status === 'new'
                ? 'bg-blue-900/30 text-blue-400 border border-blue-500/20'
                : 'bg-green-900/30 text-green-400 border border-green-500/20'
            }`}>
              {progress.status === 'new' ? 'New' : 'Completed'}
            </span>
          </div>
          <h4 className="text-base font-bold text-primary truncate">{line.name}</h4>
          <p className="text-xs text-on-surface-variant mt-1">{userMovesCount} moves</p>
        </div>
        <div className="flex gap-2 shrink-0">
          {progress.status === 'new' ? (
            <Link href={`/learn/openings/train/${line.id}?mode=learn`}
              className="px-4 py-2 bg-primary text-on-primary rounded-full font-bold text-xs hover:opacity-80 transition-all text-center whitespace-nowrap">
              Learn
            </Link>
          ) : (
            <>
              <Link href={`/learn/openings/train/${line.id}?mode=learn`}
                className="px-4 py-2 border border-primary/20 text-primary rounded-full font-bold text-xs hover:bg-primary hover:text-on-primary transition-all text-center whitespace-nowrap">
                Re-learn
              </Link>
              <Link href={`/learn/openings/train/${line.id}?mode=revise`}
                className="px-4 py-2 bg-primary text-on-primary rounded-full font-bold text-xs hover:opacity-80 transition-all text-center whitespace-nowrap">
                Revise
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  function GroupSection({ groupName, items }: { groupName: string; items: typeof lines }) {
    const isOpen = expanded[groupName] ?? false;
    const groupNew = items.filter(l => getLine(l.id).status === 'new').length;
    const groupDone = items.filter(l => getLine(l.id).status === 'completed').length;
    return (
      <div className="bg-surface-container border border-outline-variant/10 rounded-xl overflow-hidden">
        <button
          onClick={() => setExpanded(p => ({ ...p, [groupName]: !isOpen }))}
          className="w-full flex items-center gap-4 p-5 hover:bg-surface-container-high transition-colors text-left"
        >
          <span className={`material-symbols-outlined text-lg text-primary/50 transition-transform ${isOpen ? 'rotate-90' : ''}`}>
            chevron_right
          </span>
          <div className="flex-1">
            <h3 className="text-lg font-black tracking-tight text-primary">{groupName}</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {groupDone}/{items.length} completed
              {groupNew > 0 && <span className="text-blue-400 ml-2">{groupNew} new</span>}
            </p>
          </div>
        </button>
        {isOpen && (
          <div className="px-5 pb-5 space-y-3 border-t border-outline-variant/10 pt-4">
            {items.map(line => <LineCard key={line.id} line={line} />)}
          </div>
        )}
      </div>
    );
  }

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
        <div className="lg:col-span-3 space-y-6">
          {Object.entries(grouped).map(([name, items]) => (
            <GroupSection key={name} groupName={name} items={items} />
          ))}
          {ungrouped.map(line => <LineCard key={line.id} line={line} />)}
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
