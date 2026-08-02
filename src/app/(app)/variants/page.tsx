"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

const variants = [
  {
    id: "chess960",
    title: "Chess 960",
    module: "Module 01",
    icon: "shuffle",
    description:
      "The Fischer Random variant. Pieces on the back rank are randomized in one of 960 possible starting positions. Eliminates opening theory, emphasizing pure tactical creativity from move one.",
  },
  {
    id: "giveaway",
    title: "Giveaway",
    module: "Module 02",
    icon: "heart_broken",
    description:
      "A total inversion of objective. The player who loses all their pieces first wins. Capturing is mandatory whenever possible. A brutal exercise in sacrificial calculation and forcing sequences.",
  },
  {
    id: "crazyhouse",
    title: "Crazyhouse",
    module: "Module 03",
    icon: "cyclone",
    description:
      "Captured pieces are added to your reservoir. On your turn, you may drop any piece from your reservoir onto any vacant square. High-velocity gameplay requiring hyper-active board awareness.",
  },
  {
    id: "atomic",
    title: "Atomic",
    module: "Module 04",
    icon: "explosion",
    description:
      "Every capture triggers a localized explosion. The capturing piece, the captured piece, and all non-pawn pieces in a 3x3 radius are vaporized. The ultimate objective: explode the opponent's king.",
  },
  {
    id: "kingOfTheHill",
    title: "King of the Hill",
    module: "Module 05",
    icon: "flag",
    description:
      "Standard chess with a twist: moving your king to one of the four central squares (d4, d5, e4, e5) wins the game instantly. Forces aggressive king play from the opening.",
  },
  {
    id: "threeCheck",
    title: "Three-Check",
    module: "Module 06",
    icon: "electric_bolt",
    description:
      "Check the opponent's king three times to win. Adds a secondary objective to every position, rewarding tactical threats and forcing both sides to balance attack with king safety.",
  },
  {
    id: "horde",
    title: "Horde",
    module: "Module 07",
    icon: "group",
    description:
      "White plays with a horde of 36 pawns against Black's standard army. The horde wins by checkmating the king; Black wins by capturing every pawn. Asymmetric warfare at its finest.",
  },
  {
    id: "racingKings",
    title: "Racing Kings",
    module: "Module 08",
    icon: "speed",
    description:
      "Both sides race their kings to the 8th rank. No checks allowed. Pieces move freely but the first king to reach the finish line wins. Pure positional calculation with no tactical shortcuts.",
  },
];

export default function VariantsPage() {
  const particleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = particleRef.current;
    if (!container) return;
    const particles: HTMLDivElement[] = [];
    for (let i = 0; i < 20; i++) {
      const p = document.createElement("div");
      p.className = "absolute bg-white rounded-full";
      const size = Math.random() * 2 + 1;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.left = `${Math.random() * 100}vw`;
      p.style.top = `${Math.random() * 100}vh`;
      p.style.opacity = `${Math.random() * 0.3}`;
      p.style.transition = `transform ${Math.random() * 20 + 20}s linear, opacity ${Math.random() * 20 + 20}s linear`;
      container.appendChild(p);
      particles.push(p);
      requestAnimationFrame(() => {
        p.style.transform = `translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px)`;
        p.style.opacity = "0";
      });
    }
    return () => particles.forEach(p => p.remove());
  }, []);

  return (
    <>
      <div ref={particleRef} className="fixed inset-0 pointer-events-none opacity-20 z-0" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 md:px-8 pb-24">
        <header className="mb-16 max-w-4xl pt-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter text-white mb-4 leading-none uppercase">
            Variants Explorer
          </h1>
          <p className="text-neutral-400 text-sm md:text-base max-w-2xl leading-relaxed">
            Explore the mathematical boundaries of the game. Select a non-classical ruleset to begin a fresh simulation. High-contrast analysis available for all variants.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {variants.map((v) => (
            <div
              key={v.id}
              className="group p-8 md:p-10 rounded-xl bg-[#1f1f1f]/40 backdrop-blur-xl border border-[#474747]/15 hover:bg-[#2a2a2a]/60 hover:border-white/10 transition-all duration-500 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-12">
                  <span className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase">
                    {v.module}
                  </span>
                  <span className="material-symbols-outlined text-neutral-600 group-hover:text-white transition-colors">
                    {v.icon}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-white mb-4 uppercase">
                  {v.title}
                </h2>
                <p className="text-neutral-400 text-sm leading-loose mb-8">
                  {v.description}
                </p>
              </div>
              <Link
                href={`/variants/${v.id}`}
                className="inline-flex items-center gap-2 text-white font-black text-xs tracking-widest uppercase group-hover:translate-x-2 transition-transform duration-300"
              >
                <span>Select Variant</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          ))}
        </div>

        <footer className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold tracking-[0.3em] text-neutral-600 uppercase">
          <div className="flex gap-8 mb-4 md:mb-0">
            <span>Engage: 4.8.1</span>
            <span>Latency: 14ms</span>
            <span>Server: GMT_NODE_09</span>
          </div>
          <div className="flex gap-8">
            <Link href="/under-construction" className="hover:text-white transition-colors">Terminal Log</Link>
            <Link href="/under-construction" className="hover:text-white transition-colors">System Privacy</Link>
            <span className="text-white">2024 Monolith Core</span>
          </div>
        </footer>
      </div>
    </>
  );
}
