'use client'

// Engine selection screen. Displays 6 preset engines (800–2800 ELO) with
// lock/unlock based on player ELO, plus a custom ELO slider (400–3200).
// onSelectEngine callback starts a game at the chosen strength.
const ENGINES = [
  { proto: 'PROTOTYPE_01', name: 'MONOLITH_01', elo: 800, desc: 'BASICS / SCHOLAR', unlockAt: 0 },
  { proto: 'STRATEGY_NODE', name: 'CORE_STRATEGY', elo: 1200, desc: 'POSITIONAL / STEADY', unlockAt: 1000 },
  { proto: 'AGGRESSIVE_CORE', name: 'STRATEGIST_S', elo: 1600, desc: 'TACTICAL / SHARP', unlockAt: 1400 },
  { proto: 'ELITE_LOGIC', name: 'NEURAL_ELITE', elo: 2000, desc: 'MASTER / CALIBRATED', unlockAt: 1800 },
  { proto: 'CALC_UNIT_09', name: 'DEEP_CALCULATION', elo: 2400, desc: 'THEORETICAL / PEAK', unlockAt: 2200 },
  { proto: 'MONOLITH_ULTRA', name: 'GRANDMASTER_ENGINE', elo: 2800, desc: 'OPTIMAL / UNBEATABLE', unlockAt: 2600 },
];

const DIFFICULTY_TIERS = [
  { max: 800, label: 'NOVICE_PROFILE' },
  { max: 1200, label: 'SCHOLAR_PROFILE' },
  { max: 1600, label: 'EXPERT_PROFILE' },
  { max: 2000, label: 'CANDIDATE_PROFILE' },
  { max: 2400, label: 'MASTER_PROFILE' },
  { max: 2800, label: 'GRANDMASTER_PROFILE' },
  { max: 3200, label: 'MONOLITH_ENTITY' },
];

export function SelectEngineView({
  playerElo,
  customElo,
  onCustomEloChange,
  onSelectEngine,
}: {
  playerElo: number;
  customElo: number;
  onCustomEloChange: (elo: number) => void;
  onSelectEngine: (elo: number) => void;
}) {
  const customTier = DIFFICULTY_TIERS.find(t => customElo <= t.max) ?? DIFFICULTY_TIERS[DIFFICULTY_TIERS.length - 1];

  return (
    <div className="flex min-h-screen font-sans antialiased" style={{ backgroundColor: '#131313', color: '#e2e2e2' }}>
      <main className="flex-1 pt-12 pb-24">
        <header className="max-w-6xl mx-auto mb-16 px-6">
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter leading-none mb-6" style={{ color: '#ffffff' }}>
            SELECT_ENTITY
          </h2>
          <p className="text-lg max-w-2xl font-light leading-relaxed" style={{ color: '#c6c6c6' }}>
            Calibrate your training session by selecting a specific neural profile. Each engine operates on distinct heuristics to simulate authentic grandmaster intuition.
          </p>
        </header>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-6">
          {ENGINES.map((engine) => {
            const locked = playerElo < engine.unlockAt;
            return (
              <button
                key={engine.name}
                onClick={() => !locked && onSelectEngine(engine.elo)}
                className={`relative group h-64 rounded-xl p-8 flex flex-col text-left transition-all duration-300 ${
                  locked
                    ? 'cursor-not-allowed opacity-45 bg-[#0e0e0e] border border-dashed border-white/8'
                    : 'cursor-pointer bg-[#1f1f1f] border border-white/5 hover:bg-[#2a2a2a] hover:border-white/10'
                }`}
              >
                {locked && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className="flex flex-col items-center gap-2">
                      <svg className="w-8 h-8 opacity-30" style={{ color: '#c6c6c6' }} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                      </svg>
                      <span className="text-[8px] font-black tracking-[0.2em] uppercase opacity-40" style={{ color: '#c6c6c6' }}>
                        UNLOCK_AT_{engine.unlockAt}_ELO
                      </span>
                    </div>
                  </div>
                )}
                <div className={locked ? 'blur-sm' : ''}>
                  <div>
                    <p className="text-[10px] font-black tracking-[0.3em] uppercase mb-1" style={{ color: '#c6c6c6' }}>
                      {engine.proto}
                    </p>
                    <h3 className="text-2xl font-black tracking-tighter uppercase" style={{ color: '#ffffff' }}>
                      {engine.name}
                    </h3>
                  </div>
                  <div className="text-center flex-1 flex flex-col justify-center">
                    <p className="text-4xl font-black tracking-tighter" style={{ color: '#ffffff' }}>
                      {engine.elo}
                    </p>
                    <p className="text-[8px] font-bold tracking-widest uppercase mt-1" style={{ color: '#474747' }}>
                      ELO_RATING
                    </p>
                  </div>
                  <div className="flex justify-between items-end pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#c6c6c6' }}>
                      {engine.desc}
                    </span>
                    {!locked && (
                      <svg className="w-5 h-5 transition-colors" style={{ color: '#474747' }} fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            );
          })}

          <div
            className="lg:col-span-3 relative rounded-xl p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-8"
            style={{
              backgroundColor: '#1f1f1f',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div className="max-w-xs">
              <p className="text-[10px] font-black tracking-[0.3em] uppercase mb-2" style={{ color: '#c6c6c6' }}>
                CUSTOM_CALIBRATION
              </p>
              <h3 className="text-3xl font-black tracking-tighter uppercase mb-4" style={{ color: '#ffffff' }}>
                ENGINE_ADJUST
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: '#c6c6c6' }}>
                Manually override the rating parameters for precise opponent simulation.
              </p>
            </div>

            <div className="flex-1 w-full space-y-6">
              <div className="flex justify-between items-end">
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-5xl md:text-7xl font-black tracking-tighter transition-opacity"
                    style={{ color: '#ffffff' }}
                  >
                    {customElo}
                  </span>
                  <span className="text-xs font-black tracking-widest uppercase" style={{ color: '#474747' }}>
                    ELO
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: '#c6c6c6' }}>
                    TIER_ID
                  </p>
                  <p className="text-xs font-black tracking-wider uppercase" style={{ color: '#ffffff' }}>
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
                    WebkitAppearance: 'none',
                    appearance: 'none',
                    background: 'transparent',
                    height: '12px',
                  }}
                  onInput={(e) => {
                    const val = (e.target as HTMLInputElement).value;
                    const thumb = e.currentTarget;
                    thumb.style.setProperty('--pct', `${((Number(val) - 400) / (3200 - 400)) * 100}%`);
                  }}
                />
                <style>{`
                  input[type=range]::-webkit-slider-runnable-track {
                    width: 100%;
                    height: 2px;
                    cursor: pointer;
                    background: #353535;
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
                    background: #353535;
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

            <div className="flex flex-col justify-center shrink-0">
              <button
                onClick={() => onSelectEngine(customElo)}
                className="px-8 py-4 font-black text-[10px] uppercase tracking-[0.2em] rounded-full whitespace-nowrap transition-all duration-300 bg-[#353535] text-white hover:bg-white hover:text-[#1a1c1c] border border-white/5"
              >
                INITIALIZE_CUSTOM
              </button>
            </div>
          </div>


        </div>

        <footer className="max-w-6xl mx-auto mt-24 pt-12 flex flex-col md:flex-row justify-between items-center gap-8 px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-12 flex-wrap">
            <div>
              <p className="text-[8px] font-black tracking-[0.3em] uppercase mb-1" style={{ color: '#474747' }}>
                ACTIVE_PROCESSES
              </p>
              <p className="font-black tracking-tighter text-sm" style={{ color: '#ffffff' }}>
                1,248_INSTANCES
              </p>
            </div>
            <div>
              <p className="text-[8px] font-black tracking-[0.3em] uppercase mb-1" style={{ color: '#474747' }}>
                ENGINE_LATENCY
              </p>
              <p className="font-black tracking-tighter text-sm" style={{ color: '#ffffff' }}>
                0.04ms
              </p>
            </div>
            <div>
              <p className="text-[8px] font-black tracking-[0.3em] uppercase mb-1" style={{ color: '#474747' }}>
                SYSTEM_STATUS
              </p>
              <p className="font-black tracking-tighter text-sm" style={{ color: '#ffffff' }}>
                STABLE_00
              </p>
            </div>
          </div>
          <div className="text-[9px] font-bold tracking-[0.2em] uppercase" style={{ color: '#474747' }}>
            © 2024 MONOLITH_TERMINAL_V.01 // ALL_RIGHTS_RESERVED
          </div>
        </footer>
      </main>
    </div>
  );
}
