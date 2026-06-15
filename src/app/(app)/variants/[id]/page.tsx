"use client";

import { use } from "react";
import Link from "next/link";
import VariantBoard from "@/components/chess/VariantBoard";
import { VARIANT_CONFIGS } from "@/lib/chess/variantGame";

export default function VariantPlayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const config = VARIANT_CONFIGS[id];

  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
        <p className="text-neutral-400 text-sm tracking-widest uppercase">Unknown variant</p>
        <Link
          href="/variants"
          className="px-6 py-2 bg-white text-black text-xs font-bold tracking-widest uppercase rounded hover:bg-neutral-200 transition-colors"
        >
          Back to Variants
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8">
      <VariantBoard variantId={id} variantTitle={config.title} />
    </div>
  );
}
