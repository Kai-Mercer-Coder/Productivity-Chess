'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useOpeningProgress } from '@/hooks/useOpeningProgress';

interface GroupMeta {
  desc: string;
}

const GROUP_META: Record<string, GroupMeta> = {
  "Sicilian Defense": {
    desc: "The most dynamic reply to 1.e4. Fight for control of the dark squares with asymmetrical counterplay.",
  },
  "Caro-Kann": {
    desc: "A rock-solid fortress against 1.e4. Build an impenetrable pawn chain and outmaneuver White in the endgame.",
  },
  "Queen's Gambit Declined": {
    desc: "The classical response to 1.d4. Construct a resilient wall and counter-strike at the perfect moment.",
  },
  "London System": {
    desc: "A weaponized development system. Deploy the London bishop and launch a relentless kingside assault.",
  },
  "Ruy Lopez": {
    desc: "The Spanish Inquisition. Pressure the knight that defends e5 and suffocate Black with slow positional torture.",
  },
  "Hyper-Accelerated Dragon": {
    desc: "Sicilian on fast-forward. Fianchetto before White can set up — strike the center with explosive timing.",
  },
  "Queen's Gambit": {
    desc: "Offer a flank pawn to dominate the center. Every serious 1.d4 player must master this cornerstone.",
  },
  "Italian Game": {
    desc: "The Renaissance attack. Aim the bishop directly at f7 and unleash the deadliest early-game tactics.",
  },
  "Scandinavian Defense": {
    desc: "Strike e4 on move one. Provoke White into overextending while you develop with rapid counterplay.",
  },
  "King's Indian Defense": {
    desc: "The hypermodern masterpiece. Let White build a center, then detonate it with surgical kingside fury.",
  },
  "Defend Noob Attacks": {
    desc: "Survive the Scholar's Mate, the Fried Liver, and every cheap trick. Turn their aggression into your advantage.",
  },
};

function OpeningGroupCard({
  groupName,
  lines,
}: {
  groupName: string;
  lines: { id: string; name: string; eco: string }[];
}) {
  const router = useRouter();
  const { getLine, getNextToLearn, getNextToRevise } = useOpeningProgress();

  const total = lines.length;
  const done = lines.filter(l => getLine(l.id).status === 'completed').length;
  const newCount = total - done;
  const meta = GROUP_META[groupName];

  return (
    <div className="bg-surface-container border border-outline-variant/10 rounded-xl p-6 hover:border-outline-variant/30 transition-all">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-black tracking-tight text-primary">{groupName}</h3>
          {meta?.desc && (
            <p className="text-sm text-on-surface-variant/80 mt-1.5 leading-relaxed max-w-lg">{meta.desc}</p>
          )}
          <div className="flex items-center gap-3 mt-4">
            <div className="flex-1 max-w-[200px] h-1.5 bg-outline-variant/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }}
              />
            </div>
            <span className="text-xs text-on-surface-variant font-medium whitespace-nowrap">
              {done}/{total} completed
              {newCount > 0 && <span className="text-blue-400 ml-1">({newCount} new)</span>}
            </span>
          </div>
        </div>
        <div className="flex gap-3 shrink-0 pt-1">
          {newCount > 0 && (
            <button
              onClick={() => {
                const next = getNextToLearn(lines as any);
                if (next) router.push(`/learn/openings/train/${next.id}?mode=${next.mode}`);
              }}
              className="px-5 py-2.5 bg-primary text-on-primary rounded-full font-bold text-xs hover:opacity-80 transition-all whitespace-nowrap"
            >
              Learn
            </button>
          )}
          {done > 0 && (
            <button
              onClick={() => {
                const next = getNextToRevise(lines as any);
                if (next) router.push(`/learn/openings/train/${next.id}?mode=${next.mode}`);
              }}
              className="px-5 py-2.5 border border-primary/20 text-primary rounded-full font-bold text-xs hover:bg-primary hover:text-on-primary transition-all whitespace-nowrap"
            >
              Revise
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function OpeningsPage() {
  const { groups, totalLines, newCount, completedCount } = useOpeningProgress();

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
          Master opening lines through spaced repetition. Each opening is a set of variations to learn in order of depth.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-4">
          {groups.sorted.map(({ groupName, lines }) => (
            <OpeningGroupCard key={groupName} groupName={groupName} lines={lines} />
          ))}
          {groups.ungrouped.map(line => (
            <div key={line.id} className="bg-surface-container border border-outline-variant/10 rounded-xl p-5 flex items-center gap-5">
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-black tracking-widest text-primary/50 uppercase">{line.eco}</span>
                <h4 className="text-base font-bold text-primary truncate">{line.name}</h4>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link href={`/learn/openings/train/${line.id}?mode=learn`}
                  className="px-4 py-2 bg-primary text-on-primary rounded-full font-bold text-xs hover:opacity-80 transition-all text-center whitespace-nowrap">
                  Learn
                </Link>
              </div>
            </div>
          ))}
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
                  <span className="text-2xl font-black text-primary">{completedCount}</span>
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
              Openings are taught in BFS order — you&apos;ll learn the core setup first, then variations by depth. Use <span className="text-primary font-bold">Learn</span> for new lines and <span className="text-primary font-bold">Revise</span> to review what you&apos;ve already completed.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
