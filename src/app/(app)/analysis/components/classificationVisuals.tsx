"use client";

const reviewCategories: { key: string; label: string; color: string; icon: string | React.ReactNode }[] = [
  { key: "brilliant", label: "Mastermind", color: "text-emerald-400", icon: <MastermindIcon size={24} /> },
  { key: "great", label: "Great", color: "text-teal-400", icon: "star" },
  { key: "best", label: "Best", color: "text-green-400", icon: <BestMoveIcon size={24} /> },
  { key: "excellent", label: "Excellent", color: "text-lime-400", icon: "thumb_up" },
  { key: "good", label: "Good", color: "text-blue-400", icon: "task_alt" },
  { key: "book", label: "Book", color: "text-purple-400", icon: "menu_book" },
  { key: "theory", label: "Theory", color: "text-purple-400", icon: "menu_book" },
  { key: "inaccuracy", label: "Inaccuracy", color: "text-amber-400", icon: "warning" },
  { key: "mistake", label: "Mistake", color: "text-orange-400", icon: "error" },
  { key: "critical", label: "Critical", color: "text-orange-400", icon: "error" },
  { key: "blunder", label: "Blunder", color: "text-red-400", icon: "report" },
  { key: "miss", label: "Miss", color: "text-red-400", icon: "report" },
  { key: "risky", label: "Risky", color: "text-amber-400", icon: "warning" },
  { key: "forced", label: "Forced", color: "text-neutral-400", icon: "link" },
];

function BestMoveIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 680 680" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="340,44 586,168 586,512 340,636 94,512 94,168" fill="#1e5c2e" stroke="#1e5c2e" strokeWidth="32" strokeLinejoin="round"/>
      <polygon points="340,64 566,178 566,502 340,616 114,502 114,178" fill="#5fbb72"/>
      <polygon
        points="340,178 374,274 476,274 395,332 423,432 340,374 257,432 285,332 204,274 306,274"
        fill="#ffffff" stroke="#ffffff" strokeWidth="8" strokeLinejoin="round" strokeLinecap="round"
      />
    </svg>
  );
}

function MastermindIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="300,40 490,170 490,430 300,560 110,430 110,170" fill="none" stroke="currentColor" strokeWidth="20" opacity="0.7"/>
      <polygon points="300,235 352.5,267.5 352.5,332.5 300,365 247.5,332.5 247.5,267.5" fill="none" stroke="currentColor" strokeWidth="15" opacity="0.8"/>
      <circle cx="300" cy="300" r="18" fill="currentColor"/>
      <line x1="300" y1="40" x2="300" y2="135" stroke="currentColor" strokeWidth="6" opacity="0.4"/>
      <line x1="300" y1="465" x2="300" y2="560" stroke="currentColor" strokeWidth="6" opacity="0.4"/>
      <line x1="490" y1="170" x2="415" y2="217" stroke="currentColor" strokeWidth="6" opacity="0.4"/>
      <line x1="110" y1="170" x2="185" y2="217" stroke="currentColor" strokeWidth="6" opacity="0.4"/>
      <line x1="490" y1="430" x2="415" y2="383" stroke="currentColor" strokeWidth="6" opacity="0.4"/>
      <line x1="110" y1="430" x2="185" y2="383" stroke="currentColor" strokeWidth="6" opacity="0.4"/>
      <line x1="255" y1="300" x2="270" y2="300" stroke="currentColor" strokeWidth="8"/>
      <line x1="330" y1="300" x2="345" y2="300" stroke="currentColor" strokeWidth="8"/>
      <line x1="300" y1="255" x2="300" y2="270" stroke="currentColor" strokeWidth="8"/>
      <line x1="300" y1="330" x2="300" y2="345" stroke="currentColor" strokeWidth="8"/>
    </svg>
  );
}

function accuracyColor(acc: number) {
  if (acc >= 90) return "text-emerald-400";
  if (acc >= 75) return "text-green-400";
  if (acc >= 60) return "text-yellow-400";
  if (acc >= 40) return "text-orange-400";
  return "text-red-400";
}

const classificationVisuals: Record<string, { bg: string; badgeBg: string; icon: string | React.ReactNode }> = {
  brilliant: { bg: "rgba(52,211,153,0.18)", badgeBg: "#34d399", icon: <MastermindIcon size={18} /> },
  great: { bg: "rgba(20,184,166,0.18)", badgeBg: "#14b8a6", icon: "!" },
  best: { bg: "rgba(34,197,94,0.18)", badgeBg: "#22c55e", icon: <BestMoveIcon size={18} /> },
  excellent: { bg: "rgba(132,204,22,0.18)", badgeBg: "#84cc16", icon: "\u25C9" },
  good: { bg: "rgba(59,130,246,0.18)", badgeBg: "#3b82f6", icon: "\u2022" },
  book: { bg: "rgba(168,85,247,0.18)", badgeBg: "#a855f7", icon: "\uD83D\uDCD6" },
  theory: { bg: "rgba(168,85,247,0.18)", badgeBg: "#a855f7", icon: "\uD83D\uDCD6" },
  inaccuracy: { bg: "rgba(245,158,11,0.18)", badgeBg: "#f59e0b", icon: "!?" },
  mistake: { bg: "rgba(249,115,22,0.18)", badgeBg: "#f97316", icon: "?" },
  critical: { bg: "rgba(249,115,22,0.18)", badgeBg: "#f97316", icon: "?" },
  blunder: { bg: "rgba(239,68,68,0.18)", badgeBg: "#ef4444", icon: "\u2753" },
  miss: { bg: "rgba(239,68,68,0.18)", badgeBg: "#ef4444", icon: "\u2753" },
  risky: { bg: "rgba(245,158,11,0.18)", badgeBg: "#f59e0b", icon: "!?" },
  forced: { bg: "rgba(163,163,163,0.18)", badgeBg: "#a3a3a3", icon: "\u2192" },
};

export { BestMoveIcon, MastermindIcon, accuracyColor, reviewCategories, classificationVisuals };
