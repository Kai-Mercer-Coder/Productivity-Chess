"use client";

export function PuzzleSolvedFooter({
  rating,
  themes,
  onNextPuzzle,
}: {
  rating: number;
  themes: string[];
  onNextPuzzle: () => void;
}) {
  return (
    <div className="p-5 border-t border-white/5">
      <div className="text-center mb-4">
        <div className="text-sm font-semibold text-white mb-0.5">
          Puzzle Solved
        </div>
        <div className="text-xs text-neutral-500">
          Rating:{" "}
          <span className="text-white font-semibold">
            {rating.toLocaleString()}
          </span>
        </div>
        {themes.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 mt-2">
            {themes.map((t) => (
              <span
                key={t}
                className="text-[10px] text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded capitalize"
              >
                {t.replace(/([A-Z])/g, " $1")}
              </span>
            ))}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onNextPuzzle}
        className="w-full py-3 bg-white text-black rounded-lg text-sm font-semibold hover:bg-neutral-200 transition-all active:scale-[0.99]"
      >
        Next Puzzle →
      </button>
    </div>
  );
}
