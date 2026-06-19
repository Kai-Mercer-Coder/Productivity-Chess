"use client";

// Simple PGN export modal. Receives a getPgn getter (not the string itself)
// so the caller can construct it lazily when the modal opens.
import { useState } from "react";

export function ExportModal({
  open,
  getPgn,
  onClose,
}: {
  open: boolean;
  getPgn: () => string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  if (!open) return null;

  const pgn = (() => {
    try {
      return getPgn() || "No moves played yet.";
    } catch { return "No moves played yet."; }
  })();

  const handleCopy = async () => {
    try {
      const text = getPgn() || "";
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard write failed */ }
  };

  const close = () => { onClose(); setCopied(false); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} />
      <div className="relative z-10 w-full max-w-2xl mx-6 bg-surface-container rounded-2xl border border-white/10 shadow-2xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black tracking-tight text-primary">Export PGN</h3>
          <button type="button" onClick={close} className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="bg-surface-container-low rounded-xl p-6 mb-6 max-h-64 overflow-y-auto">
          <pre className="text-xs font-mono text-on-surface-variant whitespace-pre-wrap break-all leading-relaxed select-all">
            {pgn}
          </pre>
        </div>
        <button type="button" onClick={handleCopy} className="w-full py-4 rounded-xl bg-primary text-on-primary font-bold hover:opacity-90 transition-all active:scale-[0.98] cursor-pointer">
          {copied ? "Copied!" : "Copy PGN"}
        </button>
      </div>
    </div>
  );
}
