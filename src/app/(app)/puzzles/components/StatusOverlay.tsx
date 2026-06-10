"use client";

function StatusOverlay({ status }: { status: string }) {
  if (status === "playing" || status === "idle" || status === "loading")
    return null;

  const configs: Record<string, { bg: string; icon: string; text: string }> = {
    correct: {
      bg: "bg-green-500/20 border-green-500/40",
      icon: "\u2713",
      text: "Correct!",
    },
    wrong: {
      bg: "bg-red-500/20 border-red-500/40",
      icon: "\u2717",
      text: "Wrong move",
    },
    solved: {
      bg: "bg-emerald-500/20 border-emerald-500/40",
      icon: "\uD83C\uDF89",
      text: "Puzzle Solved!",
    },
  };

  const cfg = configs[status];
  if (!cfg) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
      <div
        className={`px-6 py-3 rounded-xl border backdrop-blur-sm ${cfg.bg} flex items-center gap-3`}
      >
        <span className="text-2xl">{cfg.icon}</span>
        <span className="font-bold text-white text-lg">{cfg.text}</span>
      </div>
    </div>
  );
}

export { StatusOverlay };
