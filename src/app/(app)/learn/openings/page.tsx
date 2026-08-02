'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { OpeningLine } from "@/data/openingLines";
import { useOpeningProgress } from "@/hooks/useOpeningProgress";
import { useGameStats } from "@/lib/hooks/useGameStats";

interface GroupMeta {
  desc: string;
  icon: string;
}

const GROUP_META: Record<string, GroupMeta> = {
  "Sicilian Defense": {
    desc: "The most dynamic reply to 1.e4. Fight for control of the dark squares with asymmetrical counterplay.",
    icon: "bolt",
  },
  "Caro-Kann": {
    desc: "A rock-solid fortress against 1.e4. Build an impenetrable pawn chain and outmaneuver White in the endgame.",
    icon: "shield",
  },
  "Queen's Gambit Declined": {
    desc: "The classical response to 1.d4. Construct a resilient wall and counter-strike at the perfect moment.",
    icon: "castle",
  },
  "London System": {
    desc: "A weaponized development system. Deploy the London bishop and launch a relentless kingside assault.",
    icon: "target",
  },
  "Ruy Lopez": {
    desc: "The Spanish Inquisition. Pressure the knight that defends e5 and suffocate Black with slow positional torture.",
    icon: "route",
  },
  "Hyper-Accelerated Dragon": {
    desc: "Sicilian on fast-forward. Fianchetto before White can set up — strike the center with explosive timing.",
    icon: "local_fire_department",
  },
  "Queen's Gambit": {
    desc: "Offer a flank pawn to dominate the center. Every serious 1.d4 player must master this cornerstone.",
    icon: "diamond",
  },
  "Italian Game": {
    desc: "The Renaissance attack. Aim the bishop directly at f7 and unleash the deadliest early-game tactics.",
    icon: "psychology",
  },
  "Scandinavian Defense": {
    desc: "Strike e4 on move one. Provoke White into overextending while you develop with rapid counterplay.",
    icon: "flash_on",
  },
  "King's Indian Defense": {
    desc: "The hypermodern masterpiece. Let White build a center, then detonate it with surgical kingside fury.",
    icon: "security",
  },
  "Defend Noob Attacks": {
    desc: "Survive the Scholar's Mate, the Fried Liver, and every cheap trick. Turn their aggression into your advantage.",
    icon: "gpp_good",
  },
};

const FEATURED_OPENING = "Sicilian Defense";

function OpeningGroupCard({
  groupName,
  lines,
  featured = false,
}: {
  groupName: string;
  lines: { id: string; name: string; eco: string }[];
  featured?: boolean;
}) {
  const router = useRouter();
  const { getLine, getNextToLearn, getNextToRevise } = useOpeningProgress();

  const total = lines.length;
  const done = lines.filter((l) => getLine(l.id).status === "completed").length;
  const newCount = total - done;
  const meta = GROUP_META[groupName];

  if (featured) {
    const next = getNextToLearn(lines as OpeningLine[]);
    return (
      <Link
        href={
          next
            ? `/learn/openings/train/${next.id}?mode=${next.mode}`
            : "#"
        }
        className="col-span-12 md:col-span-8 bg-surface-container rounded-xl p-10 flex flex-col justify-between group hover:bg-surface-container-high transition-all duration-500 min-h-[400px] relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <span className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
              Core Repertoire
            </span>
            <span className="text-on-surface-variant text-sm">
              {total} Variations
            </span>
          </div>
          <h3 className="text-3xl font-bold text-primary mb-6 group-hover:translate-x-2 transition-transform">
            {groupName}
          </h3>
          <p className="text-on-surface-variant max-w-md leading-relaxed opacity-80">
            {meta?.desc}
          </p>
        </div>
        <div className="relative z-10 flex items-end justify-between mt-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 max-w-[200px] h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{
                    width: `${total > 0 ? (done / total) * 100 : 0}%`,
                  }}
                />
              </div>
              <span className="text-xs text-on-surface-variant font-medium">
                {done}/{total} completed
              </span>
            </div>
          </div>
          <span className="bg-primary text-on-primary w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
            <span className="material-symbols-outlined">play_arrow</span>
          </span>
        </div>
      </Link>
    );
  }

  return (
    <div className="bg-surface-container border border-outline-variant/10 rounded-xl p-6 hover:border-outline-variant/30 transition-all group relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/3 to-transparent pointer-events-none" />
      <div className="relative z-10 flex items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-xl">
                {meta?.icon ?? "chess"}
              </span>
            </div>
            <h3 className="text-xl font-black tracking-tight text-primary">
              {groupName}
            </h3>
          </div>
          {meta?.desc && (
            <p className="text-sm text-on-surface-variant/80 mt-2 ml-[52px] leading-relaxed max-w-lg">
              {meta.desc}
            </p>
          )}
          <div className="flex items-center gap-3 mt-4 ml-[52px]">
            <div className="flex-1 max-w-[300px] w-full h-2.5 bg-outline-variant/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{
                  width: `${total > 0 ? (done / total) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="text-xs text-on-surface-variant font-medium ml-5 whitespace-nowrap">
              {done}/{total} completed
            </span>
          </div>
        </div>
        <div className="flex gap-3 shrink-0 pt-1">
          {newCount > 0 && (
            <button
              type="button"
              onClick={() => {
                const next = getNextToLearn(lines as OpeningLine[]);
                if (next)
                  router.push(
                    `/learn/openings/train/${next.id}?mode=${next.mode}`,
                  );
              }}
              className="px-5 py-2.5 bg-primary text-on-primary rounded-full font-bold text-xs hover:opacity-80 transition-all whitespace-nowrap"
            >
              Learn
            </button>
          )}
          {done > 0 && (
            <button
              type="button"
              onClick={() => {
                const next = getNextToRevise(lines as OpeningLine[]);
                if (next)
                  router.push(
                    `/learn/openings/train/${next.id}?mode=${next.mode}`,
                  );
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
  const { groups, totalLines, newCount, completedCount } =
    useOpeningProgress();
  const stats = useGameStats();

  const featuredGroup = groups.sorted.find(
    (g) => g.groupName === FEATURED_OPENING,
  );
  const otherGroups = groups.sorted.filter(
    (g) => g.groupName !== FEATURED_OPENING,
  );

  return (
    <main className="px-8 pb-20 max-w-7xl mx-auto pt-12">
      <header className="mb-16">
        <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-4 uppercase tracking-widest font-semibold opacity-60">
          <Link
            href="/learn"
            className="hover:text-primary transition-colors"
          >
            Learn
          </Link>
          <span className="material-symbols-outlined text-[12px]">
            chevron_right
          </span>
          <span className="text-primary/40">Openings</span>
        </nav>
        <h1 className="text-5xl lg:text-6xl font-black tracking-tighter text-primary mb-4 leading-none">
          Opening Trainer
        </h1>
        <p className="text-xl text-on-surface-variant max-w-2xl font-light leading-relaxed">
          Master opening lines through spaced repetition. Each opening is a
          set of variations to learn in order of depth.
        </p>
      </header>

      <div className="grid grid-cols-12 gap-6">
        {featuredGroup && (
          <OpeningGroupCard
            groupName={featuredGroup.groupName}
            lines={featuredGroup.lines}
            featured
          />
        )}

        <div className="col-span-12 md:col-span-4 bg-surface-container-low rounded-xl p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-bl from-primary/5 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <h4 className="text-xs font-black uppercase tracking-widest text-on-surface-variant mb-6">
              Your Progress
            </h4>
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-on-surface-variant">
                    New Lines
                  </span>
                  <span className="text-2xl font-black text-primary">
                    {newCount}
                  </span>
                </div>
                <p className="text-[10px] text-on-surface-variant/50 uppercase tracking-wider">
                  Remaining to learn
                </p>
              </div>
              <div className="h-px bg-outline-variant/20" />
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-on-surface-variant">
                    Revise
                  </span>
                  <span className="text-2xl font-black text-primary">
                    {completedCount}
                  </span>
                </div>
                <p className="text-[10px] text-on-surface-variant/50 uppercase tracking-wider">
                  Lines ready for review
                </p>
              </div>
              <div className="h-px bg-outline-variant/20" />
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-on-surface-variant">
                    Completed
                  </span>
                  <span className="text-2xl font-black text-primary">
                    {completedCount}
                  </span>
                </div>
                <p className="text-[10px] text-on-surface-variant/50 uppercase tracking-wider">
                  Of {totalLines} total
                </p>
              </div>
            </div>
          </div>
          <div className="relative z-10 mt-8">
            <div className="px-4 py-2 bg-surface-container rounded-lg border border-outline-variant/10">
              <p className="text-[10px] text-on-surface-variant/50 uppercase tracking-widest">
                Games Played
              </p>
              <p className="text-primary font-black text-lg">
                {stats.totalGames}
              </p>
            </div>
          </div>
        </div>

        {otherGroups.map(({ groupName, lines }) => (
          <div key={groupName} className="col-span-12">
            <OpeningGroupCard groupName={groupName} lines={lines} />
          </div>
        ))}

        {groups.ungrouped.map((line) => (
          <div
            key={line.id}
            className="col-span-12 bg-surface-container border border-outline-variant/10 rounded-xl p-5 flex items-center gap-5 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary/3 to-transparent pointer-events-none" />
            <div className="relative z-10 flex-1 min-w-0">
              <span className="text-[10px] font-black tracking-widest text-primary/50 uppercase">
                {line.eco}
              </span>
              <h4 className="text-base font-bold text-primary truncate">
                {line.name}
              </h4>
            </div>
            <div className="relative z-10 flex gap-2 shrink-0">
              <Link
                href={`/learn/openings/train/${line.id}?mode=learn`}
                className="px-4 py-2 bg-primary text-on-primary rounded-full font-bold text-xs hover:opacity-80 transition-all text-center whitespace-nowrap"
              >
                Learn
              </Link>
            </div>
          </div>
        ))}
      </div>

      <section className="mt-16">
        <div className="bg-surface-container-lowest rounded-xl p-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="material-symbols-outlined text-primary text-2xl">
                lightbulb
              </span>
              <h4 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">
                Tip
              </h4>
            </div>
            <p className="text-on-surface-variant leading-relaxed">
              Openings are taught in BFS order — you&apos;ll learn the core
              setup first, then variations by depth. Use{" "}
              <span className="text-primary font-bold">Learn</span> for new
              lines and{" "}
              <span className="text-primary font-bold">Revise</span> to review
              what you&apos;ve already completed.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
