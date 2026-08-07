"use client";
import Lenis from "lenis";
import { Fragment, useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { boardTheme } from "@/lib/chess/boardTheme";
import { customPieces } from "@/components/chess/customPieces";

const START_FEN = new Chess().fen();

const ENGINES = [
  {
    level: "Beginner",
    proto: "NOOB_CORE_01",
    name: "Dummy V2",
    elo: 250,
    desc: "LITERALLY_DOESNT_CARE",
  },
  {
    proto: "CHAOS_TACTIC_02",
    name: "L-Aura",
    elo: 400,
    desc: "MAX_AGGRESSION_TROLL",
  },
  {
    proto: "FUMBLE_NODE_03",
    name: "Skibidi",
    elo: 700,
    desc: "OVERCONFIDENT_NOOB",
  },
  {
    level: "Intermediate",
    proto: "HUSTLE_CORE_04",
    name: "Mid-Tier",
    elo: 1000,
    desc: "ACTIVE_HUSTLER",
  },
  {
    proto: "BAIT_NODE_05",
    name: "Trap_Lord",
    elo: 1100,
    desc: "TACTICAL_TRICKSTER",
  },
  {
    proto: "QUEEN_SPAM_06",
    name: "NapoleoN",
    elo: 1300,
    desc: "EARLY_QUEEN_ATTACK",
  },
  {
    level: "Club-Players",
    proto: "PRAGMA_UNIT_07",
    name: "Pragmatist",
    elo: 1500,
    desc: "BALANCED_POSITIONAL",
  },
  {
    proto: "OPENING_BOOK_08",
    name: "THEORY_CRAFTER",
    elo: 1600,
    desc: "BOOK_KNOWLEDGE",
  },
  {
    proto: "SHARP_CALC_09",
    name: "TACTICAL_BEAST",
    elo: 1800,
    desc: "DYNAMIC_SACRIFICES",
  },
  {
    level: "Advance",
    proto: "COLD_LOGIC_10",
    name: "AURA_SQUEEZER",
    elo: 2000,
    desc: "SAFE_POSITIONAL",
  },
  {
    proto: "MASTER_NODE_11",
    name: "BOSS_LEVEL",
    elo: 2200,
    desc: "UNFORGIVING_PUNISHER",
  },
  {
    proto: "MONOLITH_ULTRA",
    name: "ALPHA_MAX",
    elo: 2300,
    desc: "OPTIMAL_STOCKFISH",
  },
  {
    level: "Undetermined",
    proto: "MAX_AURA_BOSS",
    name: "WhiteRoom_GEN-4",
    elo: 3000,
    desc: "All I wanted was to feel something.",
  },
];

const DIFFICULTY_TIERS = [
  { max: 800, label: "NOVICE" },
  { max: 1200, label: "SCHOLAR" },
  { max: 1600, label: "EXPERT" },
  { max: 2000, label: "CANDIDATE" },
  { max: 2400, label: "MASTER" },
  { max: 2800, label: "GRANDMASTER" },
  { max: 3200, label: "MONOLITH" },
];

export function SelectEngineView({
  customElo,
  onCustomEloChange,
  onSelectEngine,
}: {
  customElo: number;
  onCustomEloChange: (elo: number) => void;
  onSelectEngine: (elo: number) => void;
}) {
  const customTier =
    DIFFICULTY_TIERS.find((t) => customElo <= t.max) ??
    DIFFICULTY_TIERS[DIFFICULTY_TIERS.length - 1];
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const lenis = new Lenis({
      wrapper: containerRef.current,
      content: containerRef.current.firstElementChild as HTMLElement,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
    });
    let animationFrameId: number;
    function raf(time: number) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }
    animationFrameId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased selection:bg-white selection:text-black relative">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-neutral-900 via-black to-black pointer-events-none" />
      <div
        className="fixed top-0 right-0 -z-10 w-1/2 h-screen opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle at 70% 30%, rgba(255,255,255,0.1) 0%, transparent 70%)" }}
      />

      <main className="relative z-10 pt-10 pb-20 animate-in fade-in duration-300">
        <header className="max-w-[1600px] mx-auto mb-10 px-6">
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-none mb-6 text-white">
            SELECT_ENTITY
          </h2>
          <p className="text-lg max-w-2xl font-light leading-relaxed text-neutral-400">
            Calibrate your training session by selecting a specific neural
            profile. Each engine operates on distinct heuristics to simulate
            authentic grandmaster intuition.
          </p>
        </header>

        <div className="max-w-[1600px] mx-auto px-6 flex flex-col lg:flex-row gap-8">
          {/* Left — Board */}
          <div className="flex-1 flex justify-center lg:sticky lg:top-10 lg:self-start">
            <div className="w-full max-w-[500px] aspect-square bg-surface-container shadow-[0_30px_100px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden border border-white/5">
              <Chessboard
                options={{
                  id: "setup-board",
                  position: START_FEN,
                  allowDragging: false,
                  pieces: customPieces,
                  darkSquareStyle: { backgroundColor: boardTheme.darkSquare },
                  lightSquareStyle: { backgroundColor: boardTheme.lightSquare },
                  animationDurationInMs: 400,
                  showAnimations: true,
                }}
              />
            </div>
          </div>

          {/* Right — Engines */}
          <div className="flex-1 max-w-[600px] mx-auto lg:mx-0">
            <div
              ref={containerRef}
              className="flex flex-col gap-4 h-[calc(80vh-160px)] overflow-y-auto overflow-x-hidden"
            >
              {ENGINES.map((engine) => (
                <Fragment key={engine.name}>
                  {engine.level && (
                    <div className="mt-5 mb-3 font-bold text-2xl text-white flex items-center gap-2">
                      {engine.level}
                      <span className="material-symbols-outlined text-neutral-500">arrow_forward</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => onSelectEngine(engine.elo)}
                    className="relative group h-64 rounded-xl p-8 flex flex-col text-left transition-all duration-300 cursor-pointer bg-neutral-900/60 border border-white/5 hover:bg-neutral-800/60 hover:border-white/10 backdrop-blur-sm hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <div>
                      <p className="text-[10px] font-black tracking-[0.3em] uppercase mb-1 text-neutral-400">
                        {engine.proto}
                      </p>
                      <h3 className="text-2xl font-black tracking-tighter uppercase text-white">
                        {engine.name}
                      </h3>
                    </div>
                    <div className="text-center flex-1 flex flex-col justify-center mt-5">
                      <p className="text-4xl font-black tracking-tighter text-white">
                        {engine.elo}
                      </p>
                      <p className="text-[8px] font-bold tracking-widest uppercase mt-1 text-neutral-600">
                        ELO_RATING
                      </p>
                    </div>
                    <div className="flex justify-between items-end pt-4 mt-8 border-t border-white/5">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400">
                        {engine.desc}
                      </span>
                      <span className="material-symbols-outlined text-neutral-600 text-lg">arrow_forward</span>
                    </div>
                  </button>
                </Fragment>
              ))}

              <div className="relative rounded-xl p-6 md:p-8 mt-8 bg-neutral-900/60 border border-white/5 backdrop-blur-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black tracking-[0.3em] uppercase mb-1 text-neutral-400">
                      CUSTOM_CALIBRATION
                    </p>
                    <h3 className="text-xl md:text-2xl font-black tracking-tighter uppercase text-white">
                      ENGINE_ADJUST
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectEngine(customElo)}
                    className="shrink-0 px-6 py-3 font-black text-[10px] uppercase tracking-[0.2em] rounded-full whitespace-nowrap transition-all duration-300 bg-neutral-700 text-white hover:bg-white hover:text-black border border-white/5 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    PLAY
                  </button>
                </div>
                <p className="text-xs leading-relaxed text-neutral-400 mt-2">
                  Manually override the rating parameters for precise opponent
                  simulation.
                </p>

                <div className="mt-5 space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black tracking-tighter transition-opacity text-white">
                        {customElo}
                      </span>
                      <span className="text-xs font-black tracking-widest uppercase text-neutral-600">
                        ELO
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold tracking-widest uppercase mb-1 text-neutral-400">
                        TIER_ID
                      </p>
                      <p className="text-xs font-black tracking-wider uppercase text-white">
                        {customTier.label}
                      </p>
                    </div>
                  </div>

                  <div className="relative w-full">
                    <input
                      type="range"
                      min={400}
                      max={3200}
                      step={50}
                      value={customElo}
                      onChange={(e) => onCustomEloChange(Number(e.target.value))}
                      className="w-full cursor-pointer"
                      style={{
                        WebkitAppearance: "none",
                        appearance: "none",
                        background: "transparent",
                        height: "12px",
                      }}
                      onInput={(e) => {
                        const val = (e.target as HTMLInputElement).value;
                        e.currentTarget.style.setProperty(
                          "--pct",
                          `${((Number(val) - 400) / (3200 - 400)) * 100}%`,
                        );
                      }}
                    />
                    <style>{`
                      input[type=range]::-webkit-slider-runnable-track {
                        width: 100%;
                        height: 2px;
                        cursor: pointer;
                        background: #404040;
                        border-radius: 2px;
                      }
                      input[type=range]::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        height: 12px;
                        width: 12px;
                        border-radius: 50%;
                        background: #ffffff;
                        cursor: pointer;
                        margin-top: -5px;
                        box-shadow: 0 0 10px rgba(255,255,255,0.2);
                      }
                      input[type=range]::-moz-range-track {
                        width: 100%;
                        height: 2px;
                        cursor: pointer;
                        background: #404040;
                        border-radius: 2px;
                      }
                      input[type=range]::-moz-range-thumb {
                        height: 12px;
                        width: 12px;
                        border-radius: 50%;
                        background: #ffffff;
                        cursor: pointer;
                        border: none;
                        box-shadow: 0 0 10px rgba(255,255,255,0.2);
                      }
                    `}</style>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
