'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import openingLines from '@/data/openingLines';
import OpeningTrainer from '@/components/openings/OpeningTrainer';
import { useOpeningProgress } from '@/hooks/useOpeningProgress';

export default function TrainPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lines, newCount, completedCount, getLine, markCompleted } = useOpeningProgress();

  const id = params.id as string;
  const mode = searchParams.get('mode') === 'revise' ? 'revise' : 'learn';

  const line = lines.find(l => l.id === id);

  if (!line) {
    return (
      <div className="px-8 py-24 max-w-3xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Line not found</h1>
        <Link href="/learn/openings" className="text-neutral-400 hover:text-white transition-colors underline">
          Back to openings
        </Link>
      </div>
    );
  }

  const handleComplete = (wrongCount: number) => {
    markCompleted(id, wrongCount);
    router.push('/learn/openings');
  };

  return (
    <main className="px-4 md:px-8 py-8 max-w-6xl mx-auto min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/learn/openings"
          className="flex items-center gap-1 text-neutral-500 hover:text-white transition-colors text-sm"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to Openings
        </Link>
      </div>

      <OpeningTrainer line={line} mode={mode} onComplete={handleComplete} />
    </main>
  );
}
