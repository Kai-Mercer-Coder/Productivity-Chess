"use client";

import { motion, AnimatePresence } from "framer-motion";

interface Props {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function SignOutConfirmDialog({ open, onCancel, onConfirm }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onCancel}
          />
          <motion.div
            className="relative z-10 w-full max-w-sm"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-neutral-900/95 border border-white/10 rounded-3xl shadow-2xl p-8 text-center">
              <div className="w-14 h-14 rounded-full bg-red-900/30 flex items-center justify-center mx-auto mb-5">
                <span className="material-symbols-outlined text-red-400 text-3xl">delete_forever</span>
              </div>
              <h3 className="text-xl font-bold text-white">Sign out as guest?</h3>
              <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
                Your local progress — games, rating, and puzzle history — will be permanently deleted from this browser.
              </p>
              <div className="mt-7 flex gap-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onConfirm}
                  className="flex-1 py-3.5 rounded-xl bg-red-900/40 hover:bg-red-900/60 text-red-400 text-sm font-medium transition-colors"
                >
                  Sign out &amp; delete
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
