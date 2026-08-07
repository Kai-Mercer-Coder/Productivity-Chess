import type { FC } from 'react';

interface EvalBarProps {
  evaluation: number;
  mate: number | null;
}

const EvalBar: FC<EvalBarProps> = ({ evaluation, mate }) => {
  const evalNum = evaluation;

  // Cap extreme values for sigmoid mapping
  const cappedEval = mate !== null ? (mate > 0 ? 5 : -5) : Math.max(-5, Math.min(5, evalNum));

  // Logistic curve: ±5 pawns → 0-100% white advantage
  let whitePercent = 50 + 50 * (2 / (1 + Math.exp(-cappedEval)) - 1);
  whitePercent = Math.max(0, Math.min(100, whitePercent));

  const isWhiteWinning = whitePercent >= 50;

  const displayEval = mate !== null
    ? `#${mate > 0 ? '+' : '-'}${Math.abs(mate)}`
    : evalNum.toFixed(2);

  return (
    <div className="w-8 md:w-10 h-full min-h-[320px] rounded-xl border border-white/5 bg-surface-container-low overflow-hidden flex flex-col-reverse relative shrink-0">
      {/* White advantage bar */}
      <div
        className="w-full transition-all duration-700 ease-out bg-white"
        style={{ height: `${whitePercent}%` }}
      />

      {/* Center line */}
      <div className="absolute top-1/2 w-full h-px bg-white/10 -translate-y-px" />

      {/* Evaluation text */}
      <div
        className={`absolute left-0 right-0 flex justify-center font-mono text-[10px] font-bold transition-all duration-500 ${isWhiteWinning ? 'bottom-1 text-black' : 'top-1 text-white/70'
          }`}
      >
        {displayEval}
      </div>
    </div>
  );
};

export default EvalBar;
