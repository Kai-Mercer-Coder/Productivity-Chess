"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import MiddlegameTrainer from "@/components/middlegames/MiddlegameTrainer";
import { middleGameLines } from "@/data/middlegames";

export default function MiddleGameTrainPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;
  const line = middleGameLines.find((l) => l.id === id);

  if (!line) {
    return (
      <div className="px-8 py-24 max-w-3xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Lesson not found</h1>
        <Link
          href="/learn/middle-games"
          className="text-neutral-400 hover:text-white transition-colors underline"
        >
          Back to middle games
        </Link>
      </div>
    );
  }

  const handleComplete = (_wrongCount: number) => {
    router.push("/learn/middle-games");
  };

  return (
    <main className="px-4 md:px-8 py-8 max-w-6xl mx-auto min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/learn/middle-games"
          className="flex items-center gap-1 text-neutral-500 hover:text-white transition-colors text-sm"
        >
          <span className="material-symbols-outlined text-base">
            arrow_back
          </span>
          Back to Middle Games
        </Link>
      </div>

      <MiddlegameTrainer line={line} onComplete={handleComplete} />
    </main>
  );
}
