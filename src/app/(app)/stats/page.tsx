"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  Tooltip,
} from "recharts";

interface PatternDatum {
  subject: string;
  mastery: number;
  solved: number;
}

const PHASE_ACCURACY = [
  { subject: "Openings", current: 78, peak: 88, kind: "phase" },
  { subject: "Transition", current: 72, peak: 84, kind: "bridge" },
  { subject: "Middlegames", current: 66, peak: 80, kind: "phase" },
  { subject: "Conversion", current: 68, peak: 82, kind: "bridge" },
  { subject: "Endgames", current: 71, peak: 84, kind: "phase" },
  { subject: "Preparation", current: 74, peak: 86, kind: "bridge" },
];

const PHASE_KIND_MAP = Object.fromEntries(
  PHASE_ACCURACY.map((d) => [d.subject, d.kind]),
) as Record<string, "phase" | "bridge">;

const CORE_TACTICS: PatternDatum[] = [
  { subject: "Pin", mastery: 86, solved: 52 },
  { subject: "Fork", mastery: 92, solved: 61 },
  { subject: "Skewer", mastery: 78, solved: 40 },
  { subject: "Discovered Attack", mastery: 70, solved: 34 },
  { subject: "Deflection", mastery: 64, solved: 29 },
  { subject: "Double Attack", mastery: 83, solved: 48 },
];

const ADVANCED_PATTERNS: PatternDatum[] = [
  { subject: "Zwischenzug", mastery: 47, solved: 16 },
  { subject: "Outposts", mastery: 55, solved: 20 },
  { subject: "Zugzwang", mastery: 42, solved: 13 },
  { subject: "Clearance", mastery: 38, solved: 9 },
  { subject: "Underpromotion", mastery: 33, solved: 8 },
  { subject: "Trapped Piece", mastery: 59, solved: 23 },
];

function PhaseTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload: { subject: string; current: number; peak: number };
  }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0].payload;
  return (
    <div className="bg-surface-container-highest border border-outline rounded-lg px-4 py-3">
      <p className="font-bold text-primary text-sm mb-1">{row.subject}</p>
      <p className="text-on-surface-variant text-xs">
        Current accuracy:{" "}
        <span className="text-primary font-bold">{row.current}%</span>
      </p>
      <p className="text-on-surface-variant text-xs">
        Peak accuracy:{" "}
        <span className="text-primary font-bold">{row.peak}%</span>
      </p>
    </div>
  );
}

function RadarTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: PatternDatum }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0].payload;
  return (
    <div className="bg-surface-container-highest border border-outline rounded-lg px-4 py-3">
      <p className="font-bold text-primary text-sm mb-1">{row.subject}</p>
      <p className="text-on-surface-variant text-xs">
        Mastery: <span className="text-primary font-bold">{row.mastery}%</span>
      </p>
      <p className="text-on-surface-variant text-xs">
        Puzzles solved:{" "}
        <span className="text-primary font-bold">{row.solved}</span>
      </p>
    </div>
  );
}

interface PatternRadarProps {
  icon: string;
  title: string;
  subtitle: string;
  data: PatternDatum[];
  color?: string;
}

function PatternRadar({
  icon,
  title,
  subtitle,
  data,
  color = "#ffffff",
}: PatternRadarProps) {
  const totalSolved = data.reduce((acc, d) => acc + d.solved, 0);
  const avgMastery = Math.round(
    data.reduce((acc, d) => acc + d.mastery, 0) / data.length,
  );

  return (
    <div className="bg-surface-container rounded-xl p-8 hover:bg-surface-container-high transition-all">
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-2xl">
              {icon}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight text-primary">
              {title}
            </h3>
            <p className="text-xs text-on-surface-variant">{subtitle}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant">
            Puzzles
          </p>
          <p className="text-2xl font-black tracking-tighter text-primary leading-none">
            {totalSolved}
          </p>
        </div>
      </div>
      <div className="flex justify-center">
        <RadarChart
          style={{
            width: "100%",
            height: "100%",
            maxWidth: "400px",
            maxHeight: "70vh",
            aspectRatio: 1,
          }}
          responsive
          outerRadius="72%"
          data={data}
          margin={{ top: 24, right: 24, bottom: 16, left: 24 }}
        >
          <PolarGrid stroke="#262626" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{
              fill: "#A3A3A3",
              fontSize: 11,
              fontWeight: 700,
            }}
          />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name={title}
            dataKey="mastery"
            stroke={color}
            fill={color}
            fillOpacity={0.16}
            dot={{ r: 3, fill: color, strokeWidth: 0 }}
          />
          <Tooltip content={<RadarTooltip />} />
        </RadarChart>
      </div>
      <div className="flex items-center justify-between px-2">
        <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant">
          Avg. Mastery
        </p>
        <p className="text-2xl font-black tracking-tighter text-primary leading-none">
          {avgMastery}%
        </p>
      </div>
    </div>
  );
}

export default function StatsPage() {
  const phaseNodes = PHASE_ACCURACY.filter((d) => d.kind === "phase");
  const overallAccuracy = Math.round(
    phaseNodes.reduce((acc, d) => acc + d.current, 0) / phaseNodes.length,
  );

  return (
    <main className="px-8 pb-20 max-w-7xl mx-auto pt-12">
      <header className="mb-16">
        <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-4 uppercase tracking-widest font-semibold opacity-60">
          <span>Progress</span>
          <span className="material-symbols-outlined text-[12px]">
            chevron_right
          </span>
          <span className="text-primary font-bold">Pattern Analytics</span>
        </nav>
        <h1 className="text-5xl lg:text-6xl font-black tracking-tight text-primary leading-none mb-4">
          Pattern Analytics
        </h1>
        <p className="text-on-surface-variant max-w-xl text-lg leading-relaxed">
          How accurately you play each phase of the game, alongside the tactical
          themes you&apos;ve internalized through puzzles.
        </p>
      </header>

      {/* Central phase accuracy radar */}
      <section>
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-sm font-black tracking-tighter uppercase text-on-surface-variant">
              Phase Accuracy
            </h2>
            <p className="text-on-surface-variant text-sm mt-1">
              Average accuracy per phase across analyzed games.
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant">
              Overall
            </p>
            <p className="text-4xl font-black tracking-tighter text-primary leading-none">
              {overallAccuracy}%
            </p>
          </div>
        </div>

        <div className="bg-surface-container rounded-xl p-10 hover:bg-surface-container-high transition-all">
          <div className="flex justify-center">
            <RadarChart
              style={{
                width: "100%",
                height: "100%",
                maxWidth: "560px",
                maxHeight: "80vh",
                aspectRatio: 1,
              }}
              responsive
              outerRadius="78%"
              data={PHASE_ACCURACY}
              margin={{ top: 32, right: 40, bottom: 24, left: 40 }}
            >
              <PolarGrid stroke="#262626" />
              <PolarAngleAxis
                dataKey="subject"
                tick={({ x, y, payload, textAnchor }) => {
                  const isBridge =
                    PHASE_KIND_MAP[String(payload.value)] === "bridge";
                  return (
                    <text
                      x={x}
                      y={y}
                      dy={4}
                      textAnchor={textAnchor}
                      fill={isBridge ? "#737373" : "#F5F5F5"}
                      fontSize={isBridge ? 11 : 14}
                      fontWeight={isBridge ? 600 : 800}
                    >
                      {payload.value}
                    </text>
                  );
                }}
              />
              <PolarRadiusAxis
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Radar
                name="Peak accuracy"
                dataKey="peak"
                stroke="#A3A3A3"
                strokeDasharray="4 4"
                fill="#A3A3A3"
                fillOpacity={0.05}
                dot={{ r: 3, fill: "#A3A3A3", strokeWidth: 0 }}
              />
              <Radar
                name="Current accuracy"
                dataKey="current"
                stroke="#ffffff"
                fill="#ffffff"
                fillOpacity={0.18}
                dot={{ r: 4, fill: "#ffffff", strokeWidth: 0 }}
              />
              <Tooltip content={<PhaseTooltip />} />
            </RadarChart>
          </div>
          <div className="flex items-center justify-center gap-8 mt-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-white" />
              <span className="text-xs text-on-surface-variant font-bold">
                Current
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#A3A3A3]" />
              <span className="text-xs text-on-surface-variant font-bold">
                Peak
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-sm font-black tracking-tighter uppercase text-on-surface-variant">
              Tactical Patterns
            </h2>
            <p className="text-on-surface-variant text-sm mt-1">
              Core motifs solved most frequently, plus advanced themes.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PatternRadar
            icon="bolt"
            title="Core Tactics"
            subtitle="The fundamental six"
            data={CORE_TACTICS}
          />
          <PatternRadar
            icon="extension"
            title="Advanced Themes"
            subtitle="Rarer ideas & motifs"
            data={ADVANCED_PATTERNS}
            color="#A3A3A3"
          />
        </div>
      </section>

      <section className="mt-32 relative overflow-hidden rounded-xl p-16 bg-surface-container-lowest flex items-center justify-center text-center">
        <div className="max-w-2xl relative z-10">
          <span className="material-symbols-outlined text-4xl text-primary/20 mb-6">
            insights
          </span>
          <h2 className="text-2xl italic font-light leading-relaxed text-on-surface mb-8">
            &ldquo;Chess is the art which expresses the science of logic.&rdquo;
          </h2>
          <p className="text-xs uppercase tracking-widest text-primary/40">
            &mdash; Mikhail Botvinnik
          </p>
        </div>
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none"></div>
      </section>
    </main>
  );
}
