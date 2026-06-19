"use client";

// Analysis page: load PGN/FEN/blank position, then show either a live board
// (LiveAnalysisView) or a game review (GameReviewView) with Stockfish evaluation.
// Input sanitizers (sanitizePgn / sanitizeFen) strip control chars and restrict length.
// Effect at ~L87 creates/destroys a LocalStockfishEvalEngine on multiPvCount change.
// Effect at ~L94 debounces position evaluation (2s) and feeds updates to engineResult.
import { useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { Chess } from "chess.js";

const CONTROL_CHARS = /[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g;
const FEN_ALLOWED = /[^a-zA-Z0-9\s\/\-kqKQ]+/g;
const PGN_STRIP = /[^a-zA-Z0-9\s\.\-\+\=\#\!\?\/\(\)\:\*\"\']/g;

function sanitize(input: string): string {
  return input.replace(CONTROL_CHARS, "").normalize("NFKC");
}
function sanitizePgn(input: string): string {
  return sanitize(input).replace(PGN_STRIP, "").slice(0, 10000);
}
function sanitizeFen(input: string): string {
  return sanitize(input).replace(FEN_ALLOWED, "").slice(0, 200);
}

import { useChessGame } from "@/lib/hooks/useChessGame";
import { useGameReview } from "@/lib/hooks/useGameReview";
import { useBoardInteraction } from "@/lib/hooks";
import { LocalStockfishEvalEngine, type LocalEvalResult } from "@/lib/chess/MoveEngine";
import GameReviewView from "./components/GameReviewView";
import ModeSelector from "./components/ModeSelector";
import { LiveAnalysisView } from "./components/LiveAnalysisView";
import { ExportModal } from "./components/ExportModal";

type AnalysisMode = "pgn" | "fen" | "blank";

export default function AnalysisPage() {
  const game = useChessGame();
  const { report, loading, progress, total, deepLoading, runReview, runDeepAnalysis, reset: resetReview } = useGameReview();

  const [exportOpen, setExportOpen] = useState(false);
  const [engineResult, setEngineResult] = useState<LocalEvalResult | null>(null);
  const [multiPvCount, setMultiPvCount] = useState(3);
  const [showArrows, setShowArrows] = useState(true);
  const evalEngineRef = useRef<LocalStockfishEvalEngine | null>(null);
  const [positionLoaded, setPositionLoaded] = useState(false);
  const [mode, setMode] = useState<AnalysisMode>("pgn");
  const [pgnInput, setPgnInputRaw] = useState("");
  const [fenInput, setFenInputRaw] = useState("");
  const setPgnInput = useCallback((v: string) => setPgnInputRaw(sanitizePgn(v)), []);
  const setFenInput = useCallback((v: string) => setFenInputRaw(sanitizeFen(v)), []);
  const [moves, setMoves] = useState<string[]>([]);
  const [navIndex, setNavIndex] = useState(0);
  const [startFen, setStartFen] = useState("");

  const navigateTo = useCallback(
    (targetIndex: number) => {
      if (targetIndex < 0 || targetIndex > moves.length) return;
      if (!startFen) return;
      const replayGame = new Chess();
      try {
        replayGame.load(startFen);
        for (const san of moves.slice(0, targetIndex)) {
          replayGame.move(san);
        }
        game.loadFen(replayGame.fen());
      } catch { /* invalid move navigation */ }
      setNavIndex(targetIndex);
    },
    [moves, game, startFen],
  );

  const interaction = useBoardInteraction({
    chessGame: game.chessGame,
    onMove: useCallback(
      (from, to) => {
        if (navIndex < moves.length) {
          setMoves((prev) => prev.slice(0, navIndex));
        }
        const result = game.makeMove(from, to);
        if (result) {
          const allMoves = game.chessGame.history();
          const newSan = allMoves[allMoves.length - 1];
          setMoves((prev) => [...prev, newSan]);
          setNavIndex((prev) => prev + 1);
        }
        return result;
      },
      [game, moves, navIndex],
    ),
  });

  // Creates a fresh Stockfish worker when multiPvCount changes.
  // Terminates the old worker on cleanup to avoid leaks.
  useEffect(() => {
    const engine = new LocalStockfishEvalEngine();
    engine.setMultiPV(multiPvCount);
    evalEngineRef.current = engine;
    return () => { engine.terminate(); };
  }, [multiPvCount]);

  // Debounced position evaluation: waits 200ms then evaluates for up to 10s.
  // Cancels on position change, unmount, or when a review report is shown.
  useEffect(() => {
    if (!positionLoaded || report) return;
    const engine = evalEngineRef.current;
    if (!engine) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      const result = await engine.evaluatePosition(game.position, 10000, (update) => {
        if (!cancelled) setEngineResult(update);
      });
      if (!cancelled) setEngineResult(result);
    }, 200);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [game.position, positionLoaded, report]);

  const parseAndLoadPgn = useCallback((): boolean => {
    if (!pgnInput.trim()) return false;
    try {
      const p = new Chess();
      p.loadPgn(pgnInput.trim());
      const allMoves = p.history();
      const finalFen = p.fen();
      while (p.undo()) { }
      const initialFen = p.fen();
      game.loadFen(finalFen);
      setStartFen(initialFen);
      setMoves(allMoves);
      setNavIndex(allMoves.length);
      setPositionLoaded(true);
      return true;
    } catch { return false; }
  }, [pgnInput, game]);

  const loadFromPgn = useCallback(() => { parseAndLoadPgn(); }, [parseAndLoadPgn]);
  const loadFromPgnReview = useCallback(() => { if (parseAndLoadPgn()) runReview(pgnInput.trim()); }, [parseAndLoadPgn, pgnInput, runReview]);

  const loadFromFen = useCallback(() => {
    if (!fenInput.trim()) return;
    try {
      const fen = fenInput.trim();
      game.loadFen(fen);
      setStartFen(fen);
      setMoves([]);
      setNavIndex(0);
      setPositionLoaded(true);
    } catch { /* invalid fen */ }
  }, [fenInput, game]);

  const loadBlank = useCallback(() => {
    const fen = new Chess().fen();
    game.loadFen(fen);
    setStartFen(fen);
    setMoves([]);
    setNavIndex(0);
    setPositionLoaded(true);
  }, [game]);

  const reset = useCallback(() => {
    setPositionLoaded(false);
    setMode("pgn");
    setPgnInput("");
    setFenInput("");
    setMoves([]);
    setNavIndex(0);
    setStartFen("");
    resetReview();
  }, [resetReview]);

  let mainContent: ReactNode;
  if (!positionLoaded) {
    mainContent = (
      <ModeSelector
        mode={mode}
        setMode={setMode}
        pgnInput={pgnInput}
        setPgnInput={setPgnInput}
        fenInput={fenInput}
        setFenInput={setFenInput}
        onLoadPgn={loadFromPgn}
        onLoadFen={loadFromFen}
        onStartBlank={loadBlank}
        onLoadPgnReview={loadFromPgnReview}
      />
    );
  } else if (loading) {
    mainContent = (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-sm text-neutral-400">Analysing game... {progress}/{total}</p>
        </div>
      </div>
    );
  } else {
    mainContent = (
      <>
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white">
              Analysis <span className="text-primary/40">Studio</span>
            </h1>
            <p className="text-on-surface-variant/60 font-medium text-sm tracking-wide uppercase mt-1">
              Deep Stockfish 18 NNUE Cloud
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-primary/60 uppercase tracking-widest">Report</span>
              <span className="text-white font-bold">{report ? `${moves.length} moves` : "Live board"}</span>
            </div>
            {report && (
              <button type="button" onClick={() => { const p = pgnInput; if (p) runDeepAnalysis(p); }} disabled={deepLoading}
                className="text-xs bg-primary/20 border border-primary/30 text-primary px-3 py-1.5 rounded-full hover:bg-primary/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap">
                {deepLoading ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    Deep analysing...
                  </span>
                ) : "Run Deep Local Analysis"}
              </button>
            )}
            <button type="button" onClick={reset}
              className="w-12 h-12 rounded-full border-2 border-white/10 flex items-center justify-center hover:border-white/30 transition-all text-neutral-400 hover:text-white">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </header>

        {report ? (
          <GameReviewView
            fen={game.position}
            report={report}
            onReset={reset}
            onNavigate={navigateTo}
            navIndex={navIndex}
            moves={moves}
            loading={false}
            progress={progress}
            total={total}
          />
        ) : (
          <LiveAnalysisView
            fen={game.position}
            engineResult={engineResult}
            multiPvCount={multiPvCount}
            showArrows={showArrows}
            moves={moves}
            navIndex={navIndex}
            deepLoading={deepLoading}
            onShowArrowsChange={setShowArrows}
            onMultiPvCountChange={setMultiPvCount}
            onNavigate={navigateTo}
            onLoadPgnReview={loadFromPgnReview}
            onExport={() => setExportOpen(true)}
            onReset={reset}
            onDeepAnalysis={() => { if (pgnInput.trim()) runDeepAnalysis(pgnInput.trim()); }}
            interaction={interaction}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans antialiased selection:bg-white selection:text-black relative">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-neutral-900 via-black to-black pointer-events-none" />
      <div className="fixed top-0 right-0 -z-10 w-1/2 h-screen opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle at 70% 30%, rgba(255,255,255,0.1) 0%, transparent 70%)" }}
      />

      <main>
        <div className="relative z-10 w-full px-4 lg:px-8 pt-6 pb-24 max-w-[1600px] mx-auto">
          {mainContent}
        </div>
      </main>

      <ExportModal
        open={exportOpen}
        getPgn={() => pgnInput || game.chessGame.pgn()}
        onClose={() => setExportOpen(false)}
      />
    </div>
  );
}
