"use client";

import { THEMES } from "../constants";

export function PuzzleSettingsModal({
  difficulty,
  selectedTheme,
  onDifficultyChange,
  onThemeChange,
  onNextPuzzle,
  onClose,
}: {
  difficulty: "normal" | "hard";
  selectedTheme: string;
  onDifficultyChange: (d: "normal" | "hard") => void;
  onThemeChange: (t: string) => void;
  onNextPuzzle: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/60"
      onClick={onClose}
    >
      <div
        className="relative w-[320px] bg-neutral-900 border border-white/10 rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 text-neutral-500 hover:text-white hover:bg-white/5 rounded-lg transition-all"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="p-4 border-t border-white/5 space-y-4">
          <div>
            <span className="text-[9px] uppercase tracking-[0.18em] text-neutral-600 font-semibold block mb-2">
              Difficulty
            </span>
            <div className="flex gap-1.5 bg-white/4 rounded-xl p-[3px]">
              {(["normal", "hard"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => onDifficultyChange(d)}
                  className={`flex-1 py-1.5 rounded-[7px] text-[11px] font-medium transition-all capitalize tracking-wide ${
                    difficulty === d
                      ? "bg-white text-black"
                      : "text-neutral-600 hover:bg-white/7 hover:text-white"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px bg-white/5" />

          <div>
            <span className="text-[9px] uppercase tracking-[0.18em] text-neutral-600 font-semibold block mb-2">
              Theme
            </span>
            <div className="relative">
              <select
                value={selectedTheme}
                onChange={(e) => onThemeChange(e.target.value)}
                className="w-full bg-white/4 border border-white/8 text-white text-[12px] rounded-lg px-3 py-2.5 appearance-none cursor-pointer focus:outline-none focus:border-white/20 hover:bg-white/[0.07] transition-all"
              >
                {THEMES.map((t) => (
                  <option
                    key={t}
                    value={t}
                    className="bg-neutral-900 text-white"
                  >
                    {t === "all" ? "All themes" : t.replace(/([A-Z])/g, " $1")}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-0 h-0 border-l-4 border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-neutral-600" />
            </div>
          </div>

          <div className="h-px bg-white/5" />

          <button
            type="button"
            onClick={onNextPuzzle}
            className="w-full py-2.5 bg-white text-black rounded-[9px] text-[12px] font-semibold hover:bg-neutral-200 transition-all active:scale-[0.99]"
          >
            Next puzzle
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-1.5 text-[11px] font-medium rounded-lg text-neutral-600 hover:text-white hover:bg-white/5 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
