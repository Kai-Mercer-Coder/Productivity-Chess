"use client";

import Link from "next/link";


const categories = [
  {
    level: "Foundation",
    title: "Openings",
    icon: "grid_view",
    desc: "The architecture of the early game. Learn to control the center, develop with tempo, and secure your King against aggressive early-theory deviations.",
    features: [
      "Classical Theory Mastery",
      "Gambits & Counter-Attacks",
      "Tactical Patterns in the Ruy Lopez",
    ],
    cta: "Explore Openings",
    elevated: false,
    gradient: false,
  },
  {
    level: "Execution",
    title: "Middle Games",
    icon: "swords",
    desc: "Where the war is won or lost. Focus on strategic planning, positional sacrifices, and deep calculation under competitive pressure.",
    features: [
      "Positional Archetypes",
      "Complex Exchange Logic",
      "Prophylactic Thinking",
    ],
    cta: "Explore Middlegame",
    elevated: true,
    gradient: true,
  },
  {
    level: "Conclusion",
    title: "Endgames",
    icon: "hourglass_bottom",
    desc: "The clinical finish. Convert slight advantages into absolute victories using precise technique, opposition theory, and piece coordination.",
    features: [
      "Theoretical Draw Patterns",
      "Pawn Structure Finality",
      "Dynamic Piece Imbalances",
    ],
    cta: "Explore Endgames",
    elevated: false,
    gradient: false,
  },
];

export default function LearnPage() {
  return (
    <>
      <main className="px-8 pb-12 max-w-screen-2xl mx-auto pt-12">
        <header className="mb-16 text-center lg:text-left max-w-3xl">
          <h1 className="text-5xl lg:text-6xl font-black tracking-tighter text-primary mb-4">
            THE MONOLITH ACADEMY
          </h1>
          <p className="text-xl text-on-surface-variant font-light leading-relaxed">
            Precision curricula designed by Grandmasters. Master the art of
            intellectual warfare through a structured progression from first
            move to final blow.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-stretch">
          {categories.map((cat) => {
            const card = (
              <section
                className={`group relative flex flex-col bg-surface-container rounded-xl overflow-hidden transition-all duration-500 hover:bg-surface-container-high shadow-xl ${
                  cat.elevated ? "lg:-translate-y-4" : ""
                }`}
              >
              <div className="h-64 relative overflow-hidden bg-surface-container-lowest">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="material-symbols-outlined text-8xl text-primary/10 group-hover:text-primary/20 transition-all duration-500 scale-[3] group-hover:scale-[3.5]">
                    {cat.icon}
                  </span>
                </div>
              </div>

              <div className="p-10 flex flex-col flex-1">
                <div className="mb-2 text-xs tracking-[0.2em] text-primary/50 uppercase font-bold">
                  {cat.level}
                </div>
                <h2 className="text-3xl font-black tracking-tighter text-primary mb-6">
                  {cat.title}
                </h2>

                <div className="space-y-4 mb-10 flex-1">
                  <p className="text-on-surface-variant leading-relaxed">
                    {cat.desc}
                  </p>
                  <ul className="space-y-3">
                    {cat.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-3 text-sm text-on-surface/80"
                      >
                        <span
                          className="material-symbols-outlined text-primary text-xs"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          check_circle
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {cat.gradient ? (
                  <button className="w-full py-5 rounded-full bg-gradient-to-r from-white to-neutral-300 text-black shadow-lg shadow-white/5 hover:shadow-white/10 active:scale-95 transition-all flex items-center justify-center gap-2">
                    {cat.cta}
                    <span className="material-symbols-outlined">bolt</span>
                  </button>
                ) : (
                  <button className="w-full py-5 rounded-full border border-primary/20 text-primary hover:bg-primary hover:text-black transition-all duration-300 flex items-center justify-center gap-2 group-hover:border-primary/50">
                    {cat.cta}
                    <span className="material-symbols-outlined">
                      arrow_forward
                    </span>
                  </button>
                )}
              </div>
            </section>
            );

            const href = cat.title === "Middle Games" ? "/learn/middle-games" : cat.title === "Endgames" ? "/learn/endgames" : cat.title === "Openings" ? "/learn/openings" : null;
            return href ? (
              <Link key={cat.title} href={href}>
                {card}
              </Link>
            ) : (
              <div key={cat.title}>{card}</div>
            );
          })}
        </div>

        <div className="mt-24 border-t border-outline-variant/20 pt-8 text-center">
          <p className="text-on-surface-variant text-sm mb-4">
            This project is built to remain free. If you find value, consider supporting via crypto.
          </p>
          <a href="https://nowpayments.io/payment/?iid=5293579669&source=button" target="_blank" rel="noreferrer noopener">
            <img src="https://nowpayments.io/images/embeds/payments-button-black.svg" alt="Crypto payment button by NOWPayments" />
          </a>
        </div>
      </main>
    </>
  );
}
