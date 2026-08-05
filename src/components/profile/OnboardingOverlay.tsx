"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";

const levels = [
  { elo: 400, label: "New to Chess", desc: "Just learned the rules" },
  { elo: 800, label: "Beginner", desc: "Know basic tactics" },
  { elo: 1200, label: "Intermediate", desc: "Can spot forks & pins" },
  { elo: 1700, label: "Higher Intermediate", desc: "Solid positional play" },
  { elo: 2000, label: "Advanced", desc: "Deep calculation" },
];

export default function OnboardingOverlay() {
  const { data: session, update } = useSession();
  const [selected, setSelected] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const user = session?.user;
  if (!user) return null;

  const isNew =
    !done &&
    ((user as any)?.elo ?? 1200) === 1200 &&
    ((user as any)?.puzzles_solved ?? 0) === 0;

  const handleConfirm = async () => {
    if (selected === null) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ elo: selected }),
      });
      if (!res.ok) {
        console.error("onboarding save failed — keeping local value:", res.status);
        await update({ elo: selected }).catch(() => {});
        setDone(true);
        return;
      }
      const data = await res.json();
      await update({ elo: data.elo });
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isNew && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          />
          <motion.div
            className="relative z-10 w-full max-w-2xl mx-6"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="bg-neutral-900/95 border border-white/10 rounded-3xl shadow-2xl p-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-white tracking-tight">
                  What's your level?
                </h2>
                <p className="text-sm text-neutral-400 mt-2">
                  Pick the closest match — you can always adjust later.
                </p>
              </div>

              <div className="space-y-2.5 mb-8">
                {levels.map((lvl) => (
                  <button
                    key={lvl.elo}
                    type="button"
                    onClick={() => setSelected(lvl.elo)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                      selected === lvl.elo
                        ? "border-white bg-white/10 text-white"
                        : "border-white/5 bg-neutral-800/40 text-neutral-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <div>
                      <p className="font-bold text-base">{lvl.label}</p>
                      <p className="text-xs mt-0.5 opacity-60">{lvl.desc}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black">{lvl.elo}</p>
                    </div>
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={selected === null || submitting}
                onClick={handleConfirm}
                className="w-full py-3.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-neutral-200 transition-all active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {submitting ? "Saving..." : "Continue"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
