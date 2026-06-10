"use client";

type AnalysisMode = "pgn" | "fen" | "blank";

function ModeSelector({
  mode,
  setMode,
  pgnInput,
  setPgnInput,
  fenInput,
  setFenInput,
  onLoadPgn,
  onLoadFen,
  onStartBlank,
  onLoadPgnReview,
}: {
  mode: AnalysisMode;
  setMode: (m: AnalysisMode) => void;
  pgnInput: string;
  setPgnInput: (v: string) => void;
  fenInput: string;
  setFenInput: (v: string) => void;
  onLoadPgn: () => void;
  onLoadFen: () => void;
  onStartBlank: () => void;
  onLoadPgnReview: () => void;
}) {
  return (
    <div className="w-full h-full min-h-[80vh] flex flex-col items-center justify-center relative">

      <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
        <div className="absolute inset-0  opacity-90" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">

        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 shadow-xl mb-2">
            <span className="material-symbols-outlined text-3xl text-white/90">analytics</span>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white mb-1">New Analysis</h1>
            <p className="text-sm font-medium text-neutral-500 uppercase tracking-[0.2em]">Select format to begin</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full mb-8">
          <button
            type="button"
            onClick={() => setMode("pgn")}
            className={`group flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border transition-all duration-300 h-32 ${mode === "pgn"
              ? "bg-white text-black border-white shadow-[0_0_25px_-5px_rgba(255,255,255,0.3)] scale-[1.02]"
              : "bg-[#1a1a1a] border-white/5 text-neutral-400 hover:bg-[#252525] hover:border-white/10 hover:text-white"
              }`}
          >
            <span className="material-symbols-outlined text-2xl">description</span>
            <span className="text-[11px] font-bold tracking-widest">PGN</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("fen")}
            className={`group flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border transition-all duration-300 h-32 ${mode === "fen"
              ? "bg-white text-black border-white shadow-[0_0_25px_-5px_rgba(255,255,255,0.3)] scale-[1.02]"
              : "bg-[#1a1a1a] border-white/5 text-neutral-400 hover:bg-[#252525] hover:border-white/10 hover:text-white"
              }`}
          >
            <span className="material-symbols-outlined text-2xl">edit_note</span>
            <span className="text-[11px] font-bold tracking-widest">FEN</span>
          </button>

          <button
            type="button"
            onClick={() => { setMode("blank"); onStartBlank(); }}
            className="group flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border border-white/5 bg-[#1a1a1a] text-neutral-400 hover:bg-[#252525] hover:border-white/10 hover:text-white transition-all duration-300 h-32"
          >
            <span className="material-symbols-outlined text-2xl">auto_mode</span>
            <span className="text-[11px] font-bold tracking-widest">BLANK</span>
          </button>
        </div>

        <div className="w-full transition-all duration-300">

          {mode === "pgn" && (
            <div className="rounded-2xl bg-[#1a1a1a]/80 backdrop-blur-md border border-white/10 p-1 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
              <div className="bg-[#252525]/50 p-3 border-b border-white/5 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-white/20"></div>
                </div>
                <span className="text-[10px] text-neutral-500 font-mono uppercase ml-2">notation.pgn</span>
              </div>
              <div className="p-4">
                <textarea
                  value={pgnInput}
                  onChange={(e) => setPgnInput(e.target.value)}
                  placeholder="1. e4 e5 2. Nf3 Nc6 ..."
                  rows={5}
                  className="w-full bg-transparent text-white/90 text-sm placeholder-neutral-600 resize-none focus:outline-none font-mono leading-relaxed"
                />
              </div>
              <div className="p-4 pt-0 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={onLoadPgn}
                  className="py-3 bg-white text-black text-xs font-bold rounded-xl hover:bg-neutral-200 transition-colors"
                >
                  Analysis Board
                </button>
                <button
                  type="button"
                  onClick={onLoadPgnReview}
                  className="py-3 bg-[#252525] text-white/80 border border-white/5 text-xs font-bold rounded-xl hover:bg-[#303030] hover:text-white transition-colors"
                >
                  Game Review
                </button>
              </div>
            </div>
          )}

          {mode === "fen" && (
            <div className="rounded-2xl bg-[#1a1a1a]/80 backdrop-blur-md border border-white/10 p-6 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
              <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-3 tracking-widest">FEN String</label>
              <input
                value={fenInput}
                onChange={(e) => setFenInput(e.target.value)}
                placeholder="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                className="w-full bg-[#252525] border border-white/5 text-white text-sm placeholder-neutral-600 focus:outline-none focus:border-white/20 font-mono rounded-xl py-3 px-4 transition-colors"
              />
              <button
                type="button"
                onClick={onLoadFen}
                className="w-full mt-4 py-3 bg-white text-black text-xs font-bold rounded-xl hover:bg-neutral-200 transition-colors"
              >
                Load Position
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default ModeSelector;
