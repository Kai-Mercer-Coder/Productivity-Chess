"use client";

function MoveHistory({
  moves,
  navIndex,
  onNavigate,
}: {
  moves: string[];
  navIndex: number;
  onNavigate: (index: number) => void;
}) {
  const pairs: { num: number; white: string; black: string; whiteIdx: number; blackIdx: number }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({
      num: Math.floor(i / 2) + 1,
      white: moves[i] ?? "",
      black: moves[i + 1] ?? "",
      whiteIdx: i,
      blackIdx: i + 1,
    });
  }

  return (
    <>
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-white/60">
          Notation
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onNavigate(0)}
            disabled={navIndex <= 0}
            className="p-1.5 text-neutral-500 hover:text-white transition-colors disabled:opacity-20"
          >
            <span className="material-symbols-outlined text-lg">first_page</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate(navIndex - 1)}
            disabled={navIndex <= 0}
            className="p-1.5 text-neutral-500 hover:text-white transition-colors disabled:opacity-20"
          >
            <span className="material-symbols-outlined text-lg">chevron_left</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate(navIndex + 1)}
            disabled={navIndex >= moves.length}
            className="p-1.5 text-neutral-500 hover:text-white transition-colors disabled:opacity-20"
          >
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate(moves.length)}
            disabled={navIndex >= moves.length}
            className="p-1.5 text-neutral-500 hover:text-white transition-colors disabled:opacity-20"
          >
            <span className="material-symbols-outlined text-lg">last_page</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-1 font-mono text-sm scrollbar-hide">
        {pairs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-neutral-700">
            <span className="material-symbols-outlined text-3xl">touch_app</span>
            <span className="text-[11px]">Make a move</span>
          </div>
        ) : (
          pairs.map((pair) => (
            <div key={pair.num} className="flex items-center gap-2">
              <span className="w-5 text-[11px] text-neutral-600 font-bold text-right shrink-0">
                {pair.num}.
              </span>
              <button
                type="button"
                onClick={() => onNavigate(pair.whiteIdx + 1)}
                className={`flex-1 text-left px-3 py-1.5 rounded-lg transition-all text-[13px] ${navIndex === pair.whiteIdx + 1
                  ? "bg-white/10 text-white font-semibold"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
              >
                {pair.white}
              </button>
              <button
                type="button"
                onClick={pair.black ? () => onNavigate(pair.blackIdx + 1) : undefined}
                className={`flex-1 text-left px-3 py-1.5 rounded-lg transition-all text-[13px] ${pair.black
                  ? navIndex === pair.blackIdx + 1
                    ? "bg-white/10 text-white font-semibold"
                    : "text-neutral-500 hover:bg-white/5 hover:text-white"
                  : "text-neutral-700"
                  }`}
              >
                {pair.black || "-"}
              </button>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default MoveHistory;
