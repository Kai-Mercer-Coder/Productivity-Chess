"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useState } from "react";
import PuzzleSession from "@/components/endgames/PuzzleSession";
import {
  fetchPuzzleCategoriesWithSubs,
  findCategoryWithSubsBySlug,
  pickSubcategoryFens,
  type PuzzleCategoryWithSubs,
} from "@/data/endgamePuzzles";

export default function PracticePage({
  params,
}: {
  params: Promise<{ catSlug: string }>;
}) {
  const { catSlug } = use(params);
  const router = useRouter();
  const [cat, setCat] = useState<PuzzleCategoryWithSubs | null | undefined>(
    undefined,
  );
  const [activeSub, setActiveSub] = useState<string>("");
  const [sessionKey, setSessionKey] = useState(0);

  useEffect(() => {
    fetchPuzzleCategoriesWithSubs().then((cats) => {
      const found = findCategoryWithSubsBySlug(catSlug, cats);
      setCat(found ?? null);
      if (found && found.subcategories.length > 0) {
        setActiveSub(found.subcategories[0].name);
      }
    });
  }, [catSlug]);

  const activeSubInfo = useMemo(() => {
    if (!cat) return undefined;
    return cat.subcategories.find((s) => s.name === activeSub);
  }, [cat, activeSub]);

  const fens = useMemo(() => {
    if (!activeSubInfo) return [];
    return pickSubcategoryFens(activeSubInfo, 20);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSubInfo, sessionKey]);

  const handleSubClick = (name: string) => {
    setActiveSub(name);
    setSessionKey((k) => k + 1);
  };

  if (cat === undefined) {
    return (
      <div className="px-4 py-24 max-w-3xl mx-auto text-center">
        <p className="text-neutral-400 text-sm">Loading positions...</p>
      </div>
    );
  }

  if (!cat) {
    return (
      <div className="px-8 py-24 max-w-3xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-white mb-4">
          Category not found
        </h1>
        <Link
          href="/learn/endgames"
          className="text-neutral-400 hover:text-white transition-colors underline"
        >
          Back to endgames
        </Link>
      </div>
    );
  }

  return (
    <main className="px-4 md:px-8 py-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/learn/endgames"
          className="flex items-center gap-1 text-neutral-500 hover:text-white transition-colors text-sm"
        >
          <span className="material-symbols-outlined text-base">
            arrow_back
          </span>
          Back to Endgames
        </Link>
      </div>

      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0">
          <PuzzleSession
            key={sessionKey}
            fens={fens}
            categoryName={`${cat.name} — ${activeSub}`}
            onBack={() => router.push("/learn/endgames")}
          />
        </div>

        <aside className="w-72 shrink-0 hidden lg:block">
          <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">
            Subcategories
          </h3>
          <nav className="space-y-1">
            {cat.subcategories.map((sub) => {
              const isActive = sub.name === activeSub;
              return (
                <button
                  key={sub.name}
                  type="button"
                  onClick={() => handleSubClick(sub.name)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{sub.name}</span>
                    <span
                      className={`text-[10px] whitespace-nowrap ml-2 ${
                        isActive
                          ? "text-on-primary/60"
                          : "text-on-surface-variant/50"
                      }`}
                    >
                      {sub.games.length}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>
      </div>
    </main>
  );
}
