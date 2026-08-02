import type { ThemeMeta } from "@/lib/puzzles/puzzleThemes";

export function ThemeCard({ theme }: { theme: ThemeMeta }) {
  return (
    <div className="p-8 rounded-3xl border border-white/5 shadow-xl glass overflow-hidden relative">
      <div className="absolute -right-6 -top-6 w-24 h-24 opacity-[0.04] pointer-events-none">
        <span className="material-symbols-outlined scale-[4]">{theme.icon}</span>
      </div>
      <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block mb-2">
        Theme
      </span>
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-2xl text-white/60">{theme.icon}</span>
        <div>
          <div className="text-lg font-bold text-white tracking-tight leading-tight capitalize">
            {theme.label}
          </div>
          <p className="text-[11px] text-neutral-500 leading-relaxed mt-0.5">
            {theme.description}
          </p>
        </div>
      </div>
    </div>
  );
}
