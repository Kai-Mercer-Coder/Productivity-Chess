"use client";

import { Chess } from "chess.js";
import { useCallback, useEffect, useRef, useState } from "react";
import { Chessboard } from "react-chessboard";
import { customPieces } from "@/components/chess/customPieces";
import {
  boardTheme,
  captureSquareStyle,
  legalMoveSquareStyle,
} from "@/lib/chess/boardTheme";
import {
  StockfishEngine,
  LocalStockfishEvalEngine,
} from "@/lib/chess/MoveEngine";
import type { LocalEvalResult } from "@/lib/chess/MoveEngine";
import { playCaptureSound, playMoveSound } from "@/lib/chess/sounds";

type Status = "playing" | "thinking" | "won" | "failed" | "draw" | "done";

interface PuzzleSessionProps {
  fens: string[];
  categoryName: string;
  onBack: () => void;
}

export default function PuzzleSession({
  fens,
  categoryName,
  onBack,
}: PuzzleSessionProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentFen, setCurrentFen] = useState("");
  const [status, setStatus] = useState<Status>("playing");
  const [moveCount, setMoveCount] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [puzzleColor, setPuzzleColor] = useState<"w" | "b">("w");
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [hintSquares, setHintSquares] = useState<{
    source: string;
    target: string;
  } | null>(null);
  const [evalScore, setEvalScore] = useState(0);
  const [evalMate, setEvalMate] = useState<number | null>(null);

  const chessRef = useRef(new Chess());
  const engineRef = useRef<StockfishEngine | null>(null);
  const statusRef = useRef<Status>("playing");
  const fenRef = useRef("");
  const currentIdxRef = useRef(0);
  const evalEngineRef = useRef<LocalStockfishEvalEngine | null>(null);
  const fenHistoryRef = useRef<string[]>([]);
  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSelection = useCallback(() => {
    setSelectedSquare(null);
    setLegalMoves([]);
  }, []);

  const userColor = puzzleColor;
  const orientation = userColor === "w" ? "white" : "black";
  const total = fens.length;
  const canUndo = fenHistoryRef.current.length > 0;

  const scheduleEngineMove = useCallback(() => {
    const game = chessRef.current;
    const ec = orientation === "white" ? "b" : "w";
    if (game.turn() !== ec) return;

    setStatus("thinking");
    statusRef.current = "thinking";

    if (!engineRef.current) {
      engineRef.current = new StockfishEngine(
        "/stockfish/stockfish-18-lite-single.js",
        800,
      );
    }

    engineRef.current.getNextMove(game, 500).then((uci) => {
      if (statusRef.current !== "thinking") return;
      if (!uci) {
        setStatus("playing");
        return;
      }
      let isCapture = false;
      try {
        isCapture = !!game.get(uci.slice(2, 4) as any);
      } catch {}
      try {
        game.move(uci, { strict: false });
        setCurrentFen(game.fen());
        if (isCapture) playCaptureSound();
        else playMoveSound();
        setMoveCount((c) => c + 1);
        if (game.isCheckmate()) {
          setStatus("won");
          statusRef.current = "won";
          setSolvedCount((c) => c + 1);
          return;
        }
        if (game.isStalemate() || game.isDraw()) {
          setStatus("draw");
          statusRef.current = "draw";
          setSolvedCount((c) => c + 1);
          return;
        }
        setStatus("playing");
        statusRef.current = "playing";
      } catch {
        setStatus("playing");
        statusRef.current = "playing";
      }
    });
  }, [orientation]);

  const loadPosition = useCallback(
    (fen: string) => {
      chessRef.current = new Chess(fen);
      fenRef.current = fen;
      setCurrentFen(fen);
      setMoveCount(0);
      setStatus("playing");
      statusRef.current = "playing";
      setPuzzleColor(fen.includes(" w ") ? "w" : "b");
      clearSelection();
      fenHistoryRef.current = [];
      setHintSquares(null);
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current);
        hintTimeoutRef.current = null;
      }
      if (engineRef.current) {
        engineRef.current.terminate();
        engineRef.current = null;
      }
    },
    [clearSelection],
  );

  const initFirst = useCallback(() => {
    if (fens.length > 0) loadPosition(fens[0]);
  }, [fens, loadPosition]);

  useEffect(() => {
    initFirst();
    return () => {
      engineRef.current?.terminate();
      engineRef.current = null;
    };
  }, [initFirst]);

  useEffect(() => {
    evalEngineRef.current = new LocalStockfishEvalEngine();
    return () => {
      evalEngineRef.current?.terminate();
      evalEngineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!currentFen || !evalEngineRef.current) return;
    let cancelled = false;
    evalEngineRef.current
      .evaluatePosition(currentFen, 1500)
      .then((result: LocalEvalResult) => {
        if (cancelled) return;
        setEvalScore(result.eval);
        setEvalMate(result.mate);
      });

    return () => {
      cancelled = true;
    };
  }, [currentFen]);

  const executeUserMove = useCallback(
    (source: string, target: string): boolean => {
      if (statusRef.current !== "playing") return false;
      const game = chessRef.current;
      const piece = game.get(source as any);
      if (!piece || piece.color !== userColor) return false;

      fenHistoryRef.current.push(game.fen());

      let isCapture = false;
      try {
        isCapture = !!game.get(target as any);
      } catch {}
      if (isCapture) playCaptureSound();
      else playMoveSound();

      try {
        game.move({ from: source as any, to: target as any, promotion: "q" });
      } catch {
        fenHistoryRef.current.pop();
        return false;
      }

      clearSelection();
      setCurrentFen(game.fen());
      setMoveCount((c) => c + 1);

      if (game.isCheckmate()) {
        setStatus("won");
        statusRef.current = "won";
        setSolvedCount((c) => c + 1);
        return true;
      }
      if (game.isStalemate() || game.isDraw()) {
        setStatus("draw");
        statusRef.current = "draw";
        setSolvedCount((c) => c + 1);
        return true;
      }

      scheduleEngineMove();
      return true;
    },
    [userColor, clearSelection, scheduleEngineMove],
  );

  const handleUndo = useCallback(() => {
    const history = fenHistoryRef.current;
    if (history.length === 0) return;

    if (engineRef.current) {
      engineRef.current.terminate();
      engineRef.current = null;
    }
    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current);
      hintTimeoutRef.current = null;
    }
    setHintSquares(null);

    const isThinking = statusRef.current === "thinking";
    const fen = history.pop()!;
    chessRef.current = new Chess(fen);
    setCurrentFen(fen);
    setStatus("playing");
    statusRef.current = "playing";
    setMoveCount((c) => Math.max(0, c - (isThinking ? 1 : 2)));
    clearSelection();
  }, [clearSelection]);

  const handleHint = useCallback(() => {
    if (!currentFen || !evalEngineRef.current) return;
    setHintSquares(null);
    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current);
    }
    evalEngineRef.current
      .evaluatePosition(currentFen, 300)
      .then((result: LocalEvalResult) => {
        if (!result.bestmove || result.bestmove.length < 4) return;
        const source = result.bestmove.slice(0, 2);
        const target = result.bestmove.slice(2, 4);
        setHintSquares({ source, target });
        hintTimeoutRef.current = setTimeout(() => {
          setHintSquares(null);
          hintTimeoutRef.current = null;
        }, 4000);
      });
  }, [currentFen]);

  const handleNext = useCallback(() => {
    const next = currentIdx + 1;
    if (next >= fens.length) {
      setStatus("done");
      statusRef.current = "done";
      return;
    }
    currentIdxRef.current = next;
    setCurrentIdx(next);
    loadPosition(fens[next]);
  }, [currentIdx, fens, loadPosition]);

  const handleSkip = useCallback(() => {
    setSkippedCount((c) => c + 1);
    handleNext();
  }, [handleNext]);

  const handleRetry = useCallback(() => {
    loadPosition(fenRef.current);
  }, [loadPosition]);

  const squareStyles = () => {
    const styles: Record<string, React.CSSProperties> = {};
    const game = chessRef.current;
    for (const sq of legalMoves) {
      const target = game.get(sq as any);
      styles[sq] = target ? captureSquareStyle : legalMoveSquareStyle;
    }
    if (hintSquares) {
      styles[hintSquares.source] = {
        backgroundColor: "rgba(255, 215, 0, 0.5)",
        borderRadius: "50%",
      };
      styles[hintSquares.target] = {
        backgroundColor: "rgba(255, 215, 0, 0.5)",
      };
    }
    return styles;
  };

  const handleSquareClick = useCallback(
    ({ square }: { square: string }) => {
      if (statusRef.current !== "playing") return;
      const game = chessRef.current;
      const piece = game.get(square as any);
      if (selectedSquare === square) {
        clearSelection();
        return;
      }
      if (piece && piece.color === userColor) {
        const moves = game.moves({ square: square as any, verbose: true });
        setSelectedSquare(square);
        setLegalMoves(moves.map((m) => m.to));
        return;
      }
      if (selectedSquare && legalMoves.includes(square)) {
        executeUserMove(selectedSquare, square);
      }
    },
    [selectedSquare, legalMoves, executeUserMove, clearSelection, userColor],
  );

  const handlePieceDrop = useCallback(
    (sourceSquare: string, targetSquare: string | null): boolean => {
      if (!targetSquare) return false;
      clearSelection();
      return executeUserMove(sourceSquare, targetSquare);
    },
    [executeUserMove, clearSelection],
  );

  const handlePieceDrag = useCallback(
    ({ square }: { square: string | null }) => {
      if (!square) return;
      const game = chessRef.current;
      const piece = game.get(square as any);
      if (piece && piece.color === userColor) {
        const moves = game.moves({ square: square as any, verbose: true });
        setSelectedSquare(square);
        setLegalMoves(moves.map((m) => m.to));
      }
    },
    [userColor],
  );

  const evalBarWhitePct = evalMate
    ? evalMate > 0
      ? 92
      : 8
    : 50 + Math.min(Math.max(evalScore / 8, -50), 50);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
        <div className="flex items-start gap-2">
          <div className="w-4 h-[462px] bg-neutral-900 rounded overflow-hidden shrink-0 hidden sm:block">
            <div
              className="w-full bg-white transition-all duration-500"
              style={{ height: `${evalBarWhitePct}%` }}
            />
            <div className="flex items-center justify-center h-full text-[10px] font-mono text-neutral-500 writing-mode-vertical">
              {evalMate
                ? `M${evalMate}`
                : `${evalScore > 0 ? "+" : ""}${(evalScore / 100).toFixed(2)}`}
            </div>
          </div>

          <div className="relative w-full max-w-[460px] shrink-0">
            {status === "won" && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 rounded-lg">
                <div className="text-center p-8">
                  <div className="text-5xl mb-4">&#10003;</div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Checkmate!
                  </h2>
                  <p className="text-neutral-400 mb-6">
                    Solved in {Math.ceil(moveCount / 2)} move
                    {Math.ceil(moveCount / 2) > 1 ? "s" : ""}
                  </p>
                  <button
                    type="button" onClick={handleNext}
                    className="px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-neutral-200 transition-colors"
                  >
                    {currentIdx + 1 >= fens.length ? "Finish" : "Next"}
                  </button>
                </div>
              </div>
            )}

            {status === "draw" && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 rounded-lg">
                <div className="text-center p-8">
                  <div className="text-5xl mb-4 text-neutral-400">&#61;</div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Draw
                  </h2>
                  <p className="text-neutral-400 mb-6">
                    {chessRef.current.isStalemate() ? "Stalemate" : "Insufficient material"}
                  </p>
                  <button
                    type="button" onClick={handleNext}
                    className="px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-neutral-200 transition-colors"
                  >
                    {currentIdx + 1 >= fens.length ? "Finish" : "Next"}
                  </button>
                </div>
              </div>
            )}

            {status === "failed" && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 rounded-lg">
                <div className="text-center p-8">
                  <div className="text-5xl mb-4">&#10007;</div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Lost
                  </h2>
                  <p className="text-neutral-400 mb-6">
                    Try a different approach.
                  </p>
                  <button
                    type="button" onClick={handleRetry}
                    className="px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-neutral-200 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {status === "done" && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 rounded-lg">
                <div className="text-center p-8">
                  <div className="text-5xl mb-4">&#10003;</div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    All Complete!
                  </h2>
                  <p className="text-neutral-400 mb-2">
                    {solvedCount} solved
                    {skippedCount > 0 ? `, ${skippedCount} skipped` : ""}
                  </p>
                  <p className="text-on-surface-variant text-xs mb-6">
                    out of {total} positions
                  </p>
                  <button
                    type="button" onClick={onBack}
                    className="px-8 py-3 bg-white text-black rounded-full font-bold hover:bg-neutral-200 transition-colors"
                  >
                    Back to Endgames
                  </button>
                </div>
              </div>
            )}

            <div className="relative border-2 border-neutral-800 rounded-lg overflow-hidden">
              <Chessboard
                options={{
                  id: "puzzle-session",
                  position: currentFen,
                  pieces: customPieces,
                  squareStyles: squareStyles(),
                  boardOrientation: orientation,
                  onPieceDrop: ({ sourceSquare, targetSquare }) =>
                    handlePieceDrop(sourceSquare, targetSquare),
                  onSquareClick: handleSquareClick,
                  onPieceDrag: handlePieceDrag,
                  allowDragging: status === "playing",
                  boardStyle: { borderRadius: "0" },
                  darkSquareStyle: { backgroundColor: boardTheme.darkSquare },
                  lightSquareStyle: { backgroundColor: boardTheme.lightSquare },
                }}
              />
            </div>

            <div className="absolute top-3 left-3 z-10">
              <span className="px-3 py-1 bg-black/70 text-white text-[10px] font-bold uppercase tracking-widest rounded-full backdrop-blur-sm">
                {userColor === "w" ? "White to move" : "Black to move"}
              </span>
            </div>

            {status === "thinking" && (
              <div className="absolute top-3 right-3 z-10 px-3 py-1 bg-black/70 text-white text-[10px] font-bold uppercase tracking-widest rounded-full backdrop-blur-sm animate-pulse">
                Engine thinking...
              </div>
            )}

            {hintSquares && (
              <div className="absolute bottom-3 left-3 z-10 px-3 py-1 bg-yellow-600/80 text-white text-[10px] font-bold uppercase tracking-widest rounded-full backdrop-blur-sm">
                Best: {hintSquares.source}&rarr;{hintSquares.target}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full lg:w-72">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <h3 className="text-white font-bold text-lg mb-1">
              {categoryName} Endgames
            </h3>
            <p className="text-neutral-500 text-xs">
              Position {currentIdx + 1} of {total}
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold">
                Progress
              </p>
              <span className="text-sm font-bold text-white tabular-nums">
                {solvedCount + skippedCount}/{total}
              </span>
            </div>
            <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{
                  width: `${((solvedCount + skippedCount) / total) * 100}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-neutral-600 mt-1">
              <span>{solvedCount} solved</span>
              <span>{skippedCount > 0 ? `${skippedCount} skipped` : ""}</span>
            </div>
          </div>

          <div className="flex gap-2">
            {status === "playing" && (
              <button
                type="button" onClick={handleHint}
                className="flex-1 px-4 py-3 bg-neutral-800 text-neutral-300 text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                Hint
              </button>
            )}
            {(status === "playing" || status === "thinking") && canUndo && (
              <button
                type="button" onClick={handleUndo}
                className="flex-1 px-4 py-3 bg-neutral-800 text-neutral-300 text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                Undo
              </button>
            )}
            {status === "playing" && (
              <button
                type="button" onClick={handleSkip}
                className="flex-1 px-4 py-3 border border-neutral-700 text-neutral-400 text-xs font-bold tracking-widest uppercase rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Skip
              </button>
            )}
          </div>

          <div className="text-[10px] text-neutral-600 font-mono leading-loose flex flex-col gap-1">
            <div>
              <span className="text-neutral-500">Moves: </span>
              <span className="text-white">{Math.ceil(moveCount / 2)}</span>
            </div>
            <div>
              <span className="text-neutral-500">Eval: </span>
              <span className="text-white">
                {evalMate
                  ? `#${evalMate}`
                  : `${evalScore > 0 ? "+" : ""}${(evalScore / 100).toFixed(2)}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
