import Link from "next/link";
import Navbar from "@/components/layouts/Navbar";
import MobileNavbar from "@/components/layouts/MobileNavbar";
import ReviewHero from "@/components/marketing/ReviewHero";

export const metadata = {
  title: "Free Chess Game Review — Monolith",
  description:
    "Paste any PGN and get an instant free Stockfish game review: every move classified, your accuracy scored. No account needed.",
};

export default function ReviewPage() {
  return (
    <div className="bg-black text-on-background selection:bg-white selection:text-black min-h-screen relative overflow-x-hidden">
      <Navbar />

      <main className="min-h-screen relative z-10">
        <section className="relative w-full flex flex-col items-center justify-center py-12 md:py-16 overflow-hidden">
          <div className="relative z-10 text-center w-full flex flex-col items-center px-6">
            <h1 className="font-display text-4xl md:text-6xl leading-[1] italic font-light text-white">
              Free Game
              <span className="not-italic font-normal">&nbsp;Review</span>
            </h1>
            <p className="text-neutral-400 font-light leading-relaxed max-w-xl mx-auto mt-6 mb-10">
              Paste any game for an instant Stockfish review, or watch Tal&apos;s
              brilliancy unfold. Every move classified, your accuracy scored.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-4">
              <Link
                href="/login"
                className="bg-transparent border border-white/20 hover:border-white text-white hover:bg-white hover:text-black transition-all duration-300 text-[11px] font-bold uppercase tracking-widest px-10 py-4 rounded-full flex items-center justify-center gap-3 group"
              >
                <span className="material-symbols-outlined text-[18px] transition-transform group-hover:rotate-12">lock</span>
                Sign In for Coach &amp; Deep Analysis
              </Link>
            </div>
          </div>

          <div className="relative z-10 mt-8 w-full max-w-[680px] px-4">
            <ReviewHero />
          </div>
        </section>
      </main>

      <MobileNavbar />
    </div>
  );
}
