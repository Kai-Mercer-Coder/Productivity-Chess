"use client";

import { useEffect, useRef, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { customPieces } from "@/components/chess/customPieces";

const PGN = `[Event "World Championship 29th"]
[Site "Moscow URS"]
[Date "1960.03.26"]
[EventDate "1960.03.15"]
[Round "6"]
[Result "0-1"]
[White "Mikhail Botvinnik"]
[Black "Mikhail Tal"]
[ECO "E66"]

1. c4 Nf6 2. Nf3 g6 3. g3 Bg7 4. Bg2 O-O 5. d4 d6 6. Nc3 Nbd7 7. O-O e5 8. e4 c6 9. h3 Qb6 10. d5 cxd5 11. cxd5 Nc5 12. Ne1 Bd7 13. Nd3 Nxd3 14. Qxd3 Rfc8 15. Rb1 Nh5 16. Be3 Qb4 17. Qe2 Rc4 18. Rfc1 Rac8 19. Kh2 f5 20. exf5 Bxf5 21. Ra1 Nf4!! 22. gxf4 exf4 23. Bd2 Qxb2 24. Rab1 f3 25. Bxf3 Be5+ 26. Kg2 Bxb1 27. Rxb1 Qc2 28. Bg4 Rd8 29. Be6+ Kh8 30. Rc1 Qb2 31. Qe1 Rf8 32. Ne2 Re4 33. Qd1 Qb6 34. Qe1 Qa6 35. Be3 Qd3 36. Rd1 Qb5 37. Ng3 Ra4 38. Qd2 Qa6 39. Rc1 Ra3 40. Bh6 Re8 41. Rc7 Qb6 42. Rf7 Ra4 43. Qg5 Qd4 44. Nf5 Qe4+ 0-1`;

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const MOVE_INTERVAL_MS = 3200;
const ANIMATION_MS = 900;

export default function SelfPlayingBoard() {
  const ref = useRef<HTMLDivElement>(null);
  const fensRef = useRef<string[] | null>(null);
  const idxRef = useRef(0);
  const inViewRef = useRef(true);
  const [fen, setFen] = useState(START_FEN);

  useEffect(() => {
    const game = new Chess();
    game.loadPgn(PGN);
    const moves = game.history({ verbose: true });
    const fens: string[] = [START_FEN];
    const walk = new Chess();
    for (const m of moves) {
      walk.move({ from: m.from, to: m.to, promotion: m.promotion });
      fens.push(walk.fen());
    }
    fensRef.current = fens;
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
      },
      { rootMargin: "100px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const id = setInterval(() => {
      const fens = fensRef.current;
      if (!fens || !inViewRef.current) return;
      idxRef.current = (idxRef.current + 1) % fens.length;
      setFen(fens[idxRef.current]);
    }, MOVE_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      ref={ref}
      className="w-full aspect-square grayscale rounded-xl overflow-hidden border border-white/10 bg-black/40"
    >
      <Chessboard
        options={{
          id: "tal",
          position: fen,
          pieces: customPieces,
          allowDragging: false,
          showAnimations: true,
          animationDurationInMs: ANIMATION_MS,
          showNotation: false,
          boardStyle: { borderRadius: "0" },
          darkSquareStyle: { backgroundColor: "#1b1b1b" },
          lightSquareStyle: { backgroundColor: "#2a2a2a" },
        }}
      />
    </div>
  );
}
