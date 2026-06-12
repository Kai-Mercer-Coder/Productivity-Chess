"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chessboard } from "react-chessboard";
import type { CoachExplanation } from "@/lib/chess/CoachService";
import { useCoachService } from "@/lib/hooks/useCoachService";
import { getCoachMessage } from "@/lib/chess/coach";
import type Report from "@/lib/types/Report";
import {
  accuracyColor,
  classificationVisuals,
  reviewCategories,
} from "./classificationVisuals";
import MoveHistory from "./MoveHistory";

const PIECE_UNICODE: Record<string, string> = {
  king: "\u265A",
  queen: "\u265B",
  rook: "\u265C",
  bishop: "\u265D",
  knight: "\u265E",
  pawn: "\u265F",
};

function CoachMessage({
  items,
  loading,
}: {
  items: CoachExplanation[];
  loading: boolean;
}) {
  return (
    <span className="inline leading-relaxed">
      {loading ? (
        <span className="inline-flex items-center gap-2 text-neutral-500">
          <span className="w-3 h-3 border-2 border-neutral-500/30 border-t-neutral-500 rounded-full animate-spin" />
          Analysing...
        </span>
      ) : items.length === 0 ? null : (
        items.map((item, i) => {
          const key = `${item.type}-${i}`;
          if (item.type === "text") {
            return <span key={key}>{item.text}</span>;
          }
          if (item.type === "square") {
            return (
              <span
                key={key}
                className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-amber-500/15 text-amber-300 font-mono text-xs font-bold"
              >
                {item.square}
              </span>
            );
          }
          if (item.type === "piece") {
            return (
              <span
                key={key}
                className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded bg-amber-500/15 text-amber-300 font-mono text-xs font-bold"
              >
                <span className="text-sm">
                  {PIECE_UNICODE[item.role] || ""}
                </span>
                {item.square}
              </span>
            );
          }
          return null;
        })
      )}
    </span>
  );
}

function GameReviewView({
  fen,
  report,
  onReset,
  onNavigate,
  navIndex,
  moves,
  loading,
  progress,
  total,
  stockfishUrl,
  apiKey,
}: {
  fen: string;
  report: Report | null;
  onReset: () => void;
  onNavigate: (index: number) => void;
  navIndex: number;
  moves: string[];
  loading: boolean;
  progress: number;
  total: number;
  stockfishUrl?: string;
  apiKey?: string;
}) {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const prevNavRef = useRef(navIndex);
  const wasActiveRef = useRef(false);
  const [localCoachMsg, setLocalCoachMsg] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(false);
  const localNavRef = useRef(-1);

  const coach = useCoachService({
    enabled: showAnalysis,
    stockfishUrl,
    apiKey: apiKey || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY,
  });

  const hasApiKey = !!(apiKey || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY);

  const currentClassification = useMemo(() => {
    if (!report) return null;
    const pos = report.positions[navIndex];
    return pos?.classification ?? null;
  }, [report, navIndex]);

  const correctMove = useMemo(() => {
    if (!report || navIndex < 0 || navIndex >= report.positions.length)
      return null;
    const lines = report.positions[navIndex]?.topLines;
    if (!lines || lines.length === 0) return null;
    const san = lines[0]?.moveSAN;
    return san || null;
  }, [report, navIndex]);

  useEffect(() => {
    if (!showAnalysis || !coach.ready || !report || navIndex < 1) return;
    if (wasActiveRef.current && prevNavRef.current === navIndex) return;
    wasActiveRef.current = true;
    prevNavRef.current = navIndex;

    const pos = report.positions[navIndex];
    if (pos?.fen && pos?.move?.uci) {
      coach.explain(pos.fen, pos.move.uci);
    }
  }, [showAnalysis, coach.ready, report, navIndex, coach.explain]);

  useEffect(() => {
    if (!showAnalysis) wasActiveRef.current = false;
  }, [showAnalysis]);

  useEffect(() => {
    if (!showAnalysis || !report || navIndex < 1) {
      setLocalCoachMsg(null);
      return;
    }
    if (hasApiKey) return;
    if (localNavRef.current === navIndex) return;
    localNavRef.current = navIndex;

    const pos = report.positions[navIndex];
    const prevPos = report.positions[navIndex - 1];
    const classification = pos?.classification ?? null;

    setLocalLoading(true);
    getCoachMessage(pos, prevPos, classification).then((msg) => {
      setLocalCoachMsg(msg);
      setLocalLoading(false);
    });
  }, [showAnalysis, report, navIndex, hasApiKey]);

  const coachTokens = useMemo(() => {
    if (!coach.result) return [];
    return coach.result.tokens;
  }, [coach.result]);

  const localCoachTokens: CoachExplanation[] = useMemo(() => {
    if (!localCoachMsg) return [];
    return [{ type: "text", text: localCoachMsg }];
  }, [localCoachMsg]);

  const annotationData = useMemo(() => {
    if (!report || navIndex < 1 || navIndex >= report.positions.length)
      return null;
    const pos = report.positions[navIndex];
    if (!pos?.move?.uci || !pos.classification) return null;
    const targetSquare = pos.move.uci.slice(2, 4);
    return { square: targetSquare, classification: pos.classification };
  }, [report, navIndex]);

  const squareRenderer = useCallback(
    ({ square, children }: { square: string; children?: React.ReactNode }) => {
      const isAnnotated = annotationData && annotationData.square === square;
      const config = isAnnotated
        ? classificationVisuals[annotationData.classification]
        : null;
      return (
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            backgroundColor: config ? config.bg : undefined,
          }}
        >
          {children}
          {config && (
            <div
              style={{
                position: "absolute",
                top: "6%",
                right: "6%",
                zIndex: 2,
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                backgroundColor: config.badgeBg,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "11px",
                fontWeight: 800,
                boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              {config.icon}
            </div>
          )}
        </div>
      );
    },
    [annotationData],
  );

  if (loading) {
    return (
      <section className="flex gap-8 pt-6 flex-col items-center justify-center w-full">
        <div className="flex flex-col items-center gap-4 py-20">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-sm text-neutral-400">
            Analysing game... {progress}/{total}
          </p>
        </div>
      </section>
    );
  }

  const player = report
    ? {
        name: "White",
        acc: report.accuracies.white,
        classifications: report.classifications.white,
      }
    : null;

  const opponent = report
    ? {
        name: "Black",
        acc: report.accuracies.black,
        classifications: report.classifications.black,
      }
    : null;

  return (
    <section className="flex gap-8 pt-6 flex-col items-center justify-center w-full xl:flex-row xl:items-start">
      <div className="flex flex-col gap-3 shrink-0 relative">
        {showAnalysis && (
          <div className="absolute inset-0 z-10 bg-black/40 rounded-lg pointer-events-none" />
        )}
        <div className="relative p-[3px] bg-neutral-800 rounded-lg ring-1 ring-white/4">
          <div className="relative w-[580px] h-[580px] bg-neutral-900 rounded-md overflow-hidden">
            <Chessboard
              options={{
                id: "review-board",
                position: fen,
                boardOrientation: "white",
                boardStyle: { borderRadius: "0.5rem" },
                darkSquareStyle: { backgroundColor: "#353535" },
                lightSquareStyle: { backgroundColor: "#ffffff" },
                allowDragging: false,
                showAnimations: true,
                animationDurationInMs: 300,
                squareRenderer,
              }}
            />
          </div>
        </div>

        {currentClassification && (
          <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-white/5 text-sm font-semibold">
            <span className="text-neutral-400">Move:</span>
            <span className="text-white capitalize">
              {currentClassification === "brilliant"
                ? "Mastermind"
                : currentClassification}
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={onReset}
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-red-500/20 text-neutral-500 hover:text-red-400 text-[11px] font-black uppercase tracking-widest transition-all active:scale-[0.99]"
        >
          <span className="material-symbols-outlined text-lg">close</span>
          New Analysis
        </button>
      </div>

      <div className="w-full xl:w-[380px] shrink-0 flex flex-col gap-4">
        {!showAnalysis ? (
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.015] shadow-xl flex flex-col">
            {player && opponent ? (
              <>
                <div className="px-8 pt-8 pb-5">
                  <h2 className="text-base font-black tracking-tight text-white/90">
                    Review
                  </h2>
                  <div className="flex gap-6 mt-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                        White
                      </span>
                      <span
                        className={`ml-2 text-sm font-bold ${accuracyColor(player.acc)}`}
                      >
                        {player.acc.toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                        Black
                      </span>
                      <span
                        className={`ml-2 text-sm font-bold ${accuracyColor(opponent.acc)}`}
                      >
                        {opponent.acc.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-8 pb-6 scrollbar-hide">
                  <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/[0.04]">
                    <div className="flex-1 text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-600" />
                    <div className="w-12 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-600">
                      W
                    </div>
                    <div className="w-12 text-center text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-600">
                      B
                    </div>
                  </div>

                  <div className="space-y-1">
                    {reviewCategories.map((cat) => {
                      const pCount =
                        (player.classifications[
                          cat.key as keyof typeof player.classifications
                        ] as number) || 0;
                      const oCount =
                        (opponent.classifications[
                          cat.key as keyof typeof opponent.classifications
                        ] as number) || 0;
                      return (
                        <div
                          key={cat.key}
                          className="flex items-center gap-3 py-2.5 px-3 -mx-3 rounded-xl hover:bg-white/[0.02] transition-colors"
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            {typeof cat.icon === "string" ? (
                              <span
                                className={`material-symbols-outlined text-[16px] ${cat.color} shrink-0`}
                              >
                                {cat.icon}
                              </span>
                            ) : (
                              <span
                                className={`${cat.color} shrink-0 flex items-center justify-center`}
                              >
                                {cat.icon}
                              </span>
                            )}
                            <span className="text-[12px] text-neutral-500 font-medium">
                              {cat.label}
                            </span>
                          </div>
                          <div
                            className={`w-12 text-center text-[14px] font-bold tabular-nums ${pCount > 0 ? cat.color : "text-neutral-700"}`}
                          >
                            {pCount}
                          </div>
                          <div
                            className={`w-12 text-center text-[14px] font-bold tabular-nums ${oCount > 0 ? cat.color : "text-neutral-700"}`}
                          >
                            {oCount}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAnalysis(true)}
                  className="border-t border-white/[0.04] py-3.5 text-[13px] font-bold text-white/60 hover:text-white hover:bg-white/[0.02] transition-all"
                >
                  Analyse
                </button>
              </>
            ) : (
              <div className="px-8 py-12 text-center text-neutral-500 text-sm">
                No review data available
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-3xl border border-white/[0.06] bg-white/[0.015] shadow-xl flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-white/[0.04]">
              <button
                type="button"
                onClick={() => setShowAnalysis(false)}
                className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-white transition-colors mb-3"
              >
                <span className="material-symbols-outlined text-base">
                  arrow_back
                </span>
                Back to Review
              </button>
              {correctMove && (
                <div className="bg-emerald-600/15 border border-emerald-600/25 rounded-xl px-4 py-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/70 mb-1">
                    Best Move
                  </div>
                  <div className="text-lg font-black text-emerald-300 font-mono">
                    {correctMove}
                  </div>
                </div>
              )}
              {hasApiKey && (coachTokens.length > 0 || coach.loading || coach.error) && (
                <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400/70">
                      Coach
                    </span>
                    {coach.result && (
                      <span className="text-[9px] text-neutral-600 font-mono">
                        {coach.result.model.split("/").pop()}
                      </span>
                    )}
                  </div>
                  {coach.error ? (
                    <div className="text-sm text-rose-400/80 leading-relaxed">
                      {coach.error}
                    </div>
                  ) : (
                    <div className="text-sm text-neutral-300 leading-relaxed">
                      <CoachMessage
                        items={coachTokens}
                        loading={coach.loading}
                      />
                    </div>
                  )}
                </div>
              )}
              {!hasApiKey && (localCoachMsg || localLoading) && (
                <div className="bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400/70">
                      Coach
                    </span>
                    <span className="text-[9px] text-neutral-600 font-mono">WASM</span>
                  </div>
                  <div className="text-sm text-neutral-300 leading-relaxed">
                    <CoachMessage
                      items={localCoachTokens}
                      loading={localLoading}
                    />
                  </div>
                </div>
              )}
            </div>
            <div
              className="flex-1 overflow-y-auto scrollbar-hide"
              style={{ maxHeight: "340px" }}
            >
              <MoveHistory
                moves={moves}
                navIndex={navIndex}
                onNavigate={onNavigate}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default GameReviewView;
