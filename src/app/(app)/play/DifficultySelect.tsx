"use client";

export type Difficulty = "easy" | "medium" | "hard";

export interface DifficultyConfig {
  difficulty: Difficulty;
  enableHints: boolean;
  enableEvalBar: boolean;
  enableUndo: boolean;
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    difficulty: "easy",
    enableHints: true,
    enableEvalBar: true,
    enableUndo: true,
  },
  medium: {
    difficulty: "medium",
    enableHints: false,
    enableEvalBar: true,
    enableUndo: false,
  },
  hard: {
    difficulty: "hard",
    enableHints: false,
    enableEvalBar: false,
    enableUndo: false,
  },
};

const DIFFICULTIES: {
  id: Difficulty;
  label: string;
  proto: string;
  desc: string;
  features: string[];
}[] = [
  {
    id: "easy",
    label: "Easy",
    proto: "ASSIST_MODE_01",
    desc: "HINTS + EVAL_BAR + UNDO",
    features: ["hints", "eval", "undo"],
  },
  {
    id: "medium",
    label: "Medium",
    proto: "FAIR_MODE_02",
    desc: "EVAL_BAR_ONLY",
    features: ["eval"],
  },
  {
    id: "hard",
    label: "Hard",
    proto: "NO_SUPPORT_03",
    desc: "NO_ASSISTANCE",
    features: [],
  },
];

export function DifficultySelect({
  engineName,
  onSelect,
  onBack,
}: {
  engineName: string;
  onSelect: (config: DifficultyConfig) => void;
  onBack: () => void;
}) {
  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased selection:bg-white selection:text-black relative">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-neutral-900 via-black to-black pointer-events-none" />
      <div
        className="fixed top-0 right-0 -z-10 w-1/2 h-screen opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle at 70% 30%, rgba(255,255,255,0.1) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center pt-10 pb-20 animate-in fade-in duration-300">
        <div className="text-center mb-10 space-y-4 px-6">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter leading-none mb-4 text-white">
            SELECT_DIFFICULTY
          </h1>
          <p className="text-lg max-w-2xl font-light leading-relaxed text-neutral-400">
            Configure your match against{" "}
            <span className="font-bold text-white">{engineName}</span>. Choose
            how much assistance you want.
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full px-6">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => onSelect(DIFFICULTY_CONFIGS[d.id])}
              className="relative group h-40 rounded-xl p-8 flex flex-col text-left transition-all duration-300 cursor-pointer bg-neutral-900/60 border border-white/5 hover:bg-neutral-800/60 hover:border-white/10 backdrop-blur-sm"
            >
              <div>
                <p className="text-[10px] font-black tracking-[0.3em] uppercase mb-1 text-neutral-400">
                  {d.proto}
                </p>
                <h3 className="text-2xl font-black tracking-tighter uppercase text-white">
                  {d.label}
                </h3>
              </div>

              <div className="flex-1 flex items-end pt-4 mt-4 border-t border-white/5">
                <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400">
                  {d.desc}
                </span>
                <span className="material-symbols-outlined text-neutral-600 text-lg ml-auto">
                  arrow_forward
                </span>
              </div>
            </button>
          ))}

          <button
            type="button"
            onClick={onBack}
            className="w-full py-3 font-black text-[10px] uppercase tracking-[0.2em] rounded-full transition-all duration-300 mt-4 bg-neutral-800 text-white border border-white/5 hover:bg-neutral-700 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-sm align-middle mr-2 -mt-0.5">
              arrow_back
            </span>
            BACK_TO_ENGINES
          </button>
        </div>
      </div>
    </div>
  );
}
