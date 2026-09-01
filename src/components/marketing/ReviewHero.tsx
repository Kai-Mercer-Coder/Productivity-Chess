"use client";

import { Chess } from "chess.js";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import GameReviewView from "@/app/(app)/analysis/components/GameReviewView";
import demoSrc from "@/data/demoReview.json";
import { useGameReview } from "@/lib/hooks/useGameReview";
import type Report from "@/lib/types/Report";

const demoReport = demoSrc as unknown as Report;

export default function ReviewHero() {
  const [mode, setMode] = useState<"demo" | "live">("demo");
  const [livePgn, setLivePgn] = useState("");
  const [moves, setMoves] = useState<string[]>([]);
  const [navIndex, setNavIndex] = useState(0);
  const [startFen, setStartFen] = useState("");
  const [loaded, setLoaded] = useState(false);
  const demoTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const inViewRef = useRef(true);
  const boxRef = useRef<HTMLDivElement>(null);

  const { report, loading, runReview, reset: resetReview } = useGameReview();

  const stopDemo = useCallback(() => {
    if (demoTimer.current) {
      clearInterval(demoTimer.current);
      demoTimer.current = null;
    }
  }, []);

  const startDemo = useCallback(() => {
    if (demoTimer.current) return;
    demoTimer.current = setInterval(() => {
      if (!inViewRef.current) return;
      setNavIndex((n) => {
        const max = demoReport.positions.length - 1;
        if (n >= max) return 0;
        return n + 1;
      });
    }, 1500);
  }, []);

  // Demo auto-play
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        if (entry.isIntersecting && mode === "demo") startDemo();
      },
      { rootMargin: "150px" },
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      stopDemo();
    };
  }, [mode, startDemo, stopDemo]);

  useEffect(() => {
    if (mode === "demo") {
      setMoves(demoReport.positions.slice(1).map((p) => p.move.san || ""));
      setNavIndex(0);
      if (inViewRef.current) startDemo();
    } else {
      stopDemo();
    }
  }, [mode, startDemo, stopDemo]);

  const liveFen = useCallback(() => {
    return loaded ? (report?.positions[navIndex]?.fen ?? startFen) : startFen;
  }, [loaded, report, navIndex, startFen]);

  const handleAnalyse = useCallback(async () => {
    if (!livePgn.trim()) return;
    try {
      const p = new Chess();
      p.loadPgn(livePgn.trim());
      const allMoves = p.history();
      const finalFen = p.fen();
      setStartFen(finalFen);
      setMoves(allMoves);
      setNavIndex(0);
      setLoaded(true);
      await runReview(livePgn.trim(), { maxPasses: 2 });
    } catch {
      // invalid PGN
    }
  }, [livePgn, runReview]);

  // In demo mode the "current fen" comes from the static report
  const demoFen = demoReport.positions[navIndex]?.fen ?? "";

  const goDemo = useCallback(() => {
    setMode("demo");
    resetReview();
    setLoaded(false);
  }, [resetReview]);

  const goLive = useCallback(() => {
    setMode("live");
    stopDemo();
    setLoaded(false);
    setNavIndex(0);
  }, [stopDemo]);

  const nav = useCallback(
    (target: number) => {
      const max = loaded ? moves.length : demoReport.positions.length - 1;
      const t = Math.max(0, Math.min(max, target));
      setNavIndex(t);
    },
    [loaded, moves],
  );

  return (
    <div ref={boxRef} className="w-full max-w-[640px] mx-auto px-4">
      <div className="mb-4 flex items-center justify-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={goDemo}
          className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all ${
            mode === "demo"
              ? "bg-white text-black"
              : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
          }`}
        >
          Watch Tal&apos;s Brilliancy
        </button>
        <button
          type="button"
          onClick={goLive}
          className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all ${
            mode === "live"
              ? "bg-white text-black"
              : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
          }`}
        >
          Review Your Game
        </button>
      </div>

      {mode === "demo" ? (
        <GameReviewView
          fen={demoFen}
          report={demoReport}
          onReset={() => setNavIndex(0)}
          onNavigate={nav}
          navIndex={navIndex}
          moves={demoReport.positions.slice(1).map((p) => p.move.san || "")}
          loading={false}
          progress={0}
          total={0}
          analysisPass={0}
          completedMoves={0}
          coachEnabled={false}
        />
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm">
          {!loaded ? (
            <div className="space-y-4">
              <label
                htmlFor="live-pgn"
                className="block text-[11px] font-bold uppercase tracking-widest text-white/50"
              >
                Paste your PGN
              </label>
              <textarea
                id="live-pgn"
                value={livePgn}
                onChange={(e) => setLivePgn(e.target.value)}
                placeholder={"1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 ..."}
                rows={8}
                className="w-full resize-none rounded-xl bg-black/50 border border-white/10 p-4 text-sm text-white/80 placeholder:text-white/20 font-mono focus:outline-none focus:border-white/30"
              />
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleAnalyse}
                  disabled={!livePgn.trim() || loading}
                  className="flex-1 py-3 rounded-full bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? "Analysing…" : "Analyse Free"}
                </button>
                <button
                  type="button"
                  onClick={goDemo}
                  className="flex-1 py-3 rounded-full border border-white/15 text-white/70 font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-all"
                >
                  Watch Demo
                </button>
              </div>
              <p className="text-[10px] text-white/30 uppercase tracking-widest text-center">
                Free review to depth 15. Sign in for coach notes &amp; deep
                analysis.
              </p>
            </div>
          ) : (
            <>
              <GameReviewView
                fen={liveFen()}
                report={report}
                onReset={goDemo}
                onNavigate={nav}
                navIndex={navIndex}
                moves={moves}
                loading={loading}
                progress={0}
                total={0}
                analysisPass={loading ? 2 : 0}
                completedMoves={0}
                coachEnabled={false}
              />
              {!loading && report && (
                <div className="mt-8 text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all active:scale-95"
                  >
                    Sign in for Coach Notes &amp; Deep Analysis
                  </Link>
                  <p className="mt-3 text-[10px] text-white/30 uppercase tracking-widest">
                    Puzzles, play vs engine, saved reviews — all behind login.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
