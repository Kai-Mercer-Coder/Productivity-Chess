import Link from "next/link";

const libraries = [
  { name: "Stockfish", url: "https://stockfishchess.org/", desc: "Open-source chess engine used for local and cloud analysis" },
  { name: "WintrChess", url: "#", desc: "Chess analysis and evaluation tools" },
  { name: "react-chessboard", url: "#", desc: "Interactive chessboard component for React" },
  { name: "positional_chess", url: "https://github.com/dev-arcturus/positional_chess", desc: "Positional chess evaluation and analysis library" },
  { name: "Next.js", url: "https://nextjs.org/", desc: "React framework for production-grade applications" },
  { name: "Tailwind CSS", url: "https://tailwindcss.com/", desc: "Utility-first CSS framework" },
  { name: "next-auth", url: "https://next-auth.js.org/", desc: "Authentication for Next.js" },
  { name: "Recharts", url: "https://recharts.org/", desc: "Charting library for React" },
  { name: "Lenis", url: "https://lenis.studiofreight.com/", desc: "Smooth scroll engine" },
];

export default function CreditsPage() {
  return (
    <div className="bg-black text-on-background min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-24 md:py-32">
        <Link href="/" className="inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-colors text-sm mb-12">
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to home
        </Link>

        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">Credits</h1>
        <p className="text-neutral-500 text-sm mb-12">
          This project is built on the shoulders of open-source giants. Thank you.
        </p>

        <div className="space-y-4 mb-16">
          {libraries.map((lib) => (
            <div key={lib.name} className="flex items-center gap-4 p-4 bg-neutral-900/50 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-colors">
              <div className="flex-1">
                <a
                  href={lib.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white font-bold hover:underline"
                >
                  {lib.name}
                </a>
                <p className="text-neutral-500 text-sm">{lib.desc}</p>
              </div>
              <span className="material-symbols-outlined text-neutral-600 text-sm">open_in_new</span>
            </div>
          ))}
        </div>

        <div className="border-t border-neutral-800 pt-12">
          <h2 className="text-xl font-bold text-white mb-4">Source Code</h2>
          <p className="text-neutral-500 text-sm mb-6">
            This project is open source. Contributions, issues, and stars are welcome.
          </p>
          <a
            href="https://github.com/ClonicalClone/Productivity-Chess"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-neutral-200 transition-colors"
          >
            <span className="material-symbols-outlined">code</span>
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
