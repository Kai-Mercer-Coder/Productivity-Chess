"use client";

export function PuzzleSolvedFooter({
  onNextPuzzle,
}: {
  onNextPuzzle: () => void;
}) {
  return (
    <div className="p-5 border-t border-white/5">
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
