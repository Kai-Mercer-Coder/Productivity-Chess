"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useLocalElo } from "@/lib/hooks/useLocalElo";
import { db } from "@/lib/db/gameDB";
import { useSignOut } from "@/lib/hooks/useSignOut";
import SignOutConfirmDialog from "@/components/auth/SignOutConfirmDialog";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function UserProfileOverlay({ open, onClose }: Props) {
  const { data: session } = useSession();
  const user = session?.user;
  const isGuest = !!user?.email?.endsWith("@guest.local");
  const { userElo } = useLocalElo(isGuest ? undefined : (user as any)?.elo);
  const [puzzleCount, setPuzzleCount] = useState(0);

  useEffect(() => {
    if (!isGuest) return;
    db.puzzleSolves.count().then(setPuzzleCount);
  }, [isGuest]);

  // Guests have no Supabase row and their token reseeds to defaults on every
  // sign-in, so their real stats come from IndexedDB — otherwise a guest who
  // signs out and back in would appear to lose all progress.
  const displayElo = isGuest ? userElo : (user as any)?.elo ?? 1200;
  const displayPuzzles = isGuest ? puzzleCount : (user as any)?.puzzles_solved ?? 0;

  const signOut = useSignOut({ user, callbackUrl: "/login" });

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            onClick={onClose}
          />
          <motion.div
            className="relative z-10 w-full max-w-2xl mx-6"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="bg-neutral-900/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
              {/* header */}
              <div className="flex items-center justify-between p-8 pb-6">
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-full bg-neutral-800 overflow-hidden shrink-0 ring-2 ring-white/10">
                    {user?.image ? (
                      <img src={user.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-neutral-500 text-4xl">person</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{user?.name || "Guest"}</p>
                    <p className="text-sm text-neutral-400 mt-0.5">{user?.email || "Not signed in"}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2.5 rounded-full hover:bg-white/10 transition-colors text-neutral-400 hover:text-white"
                >
                  <span className="material-symbols-outlined text-2xl">close</span>
                </button>
              </div>

              {/* stats */}
              <div className="px-8 pb-8">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-neutral-800/60 rounded-2xl p-5">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold mb-2">Rating</p>
                    <p className="text-4xl font-black text-white tracking-tight">{displayElo}</p>
                  </div>
                  <div className="bg-neutral-800/60 rounded-2xl p-5">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold mb-2">Puzzles</p>
                    <p className="text-4xl font-black text-white tracking-tight">{displayPuzzles}</p>
                  </div>
                  <div className="bg-neutral-800/60 rounded-2xl p-5">
                    <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold mb-2">Level</p>
                    <p className="text-4xl font-black text-white tracking-tight">{Math.floor(displayElo / 200) + 1}</p>
                  </div>
                </div>
              </div>

              {/* footer */}
              <div className="flex gap-3 px-8 pb-8">
                <Link
                  href="/dashboard"
                  onClick={onClose}
                  className="flex-1 py-3.5 text-center rounded-xl bg-white text-black font-bold text-sm hover:bg-neutral-200 transition-all active:scale-[0.98]"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={signOut.requestSignOut}
                  className="flex-1 py-3.5 text-center rounded-xl bg-red-900/30 hover:bg-red-900/50 text-red-400 font-medium text-sm transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      <SignOutConfirmDialog
        open={signOut.confirmOpen}
        onCancel={signOut.cancelSignOut}
        onConfirm={signOut.confirmSignOut}
      />
    </AnimatePresence>
  );
}
