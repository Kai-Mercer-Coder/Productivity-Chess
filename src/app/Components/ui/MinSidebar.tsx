import React from 'react'
import Link from 'next/link'

const MinSidebar = () => {
    return (
        <nav className="xl:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-md z-50 glass-nav rounded-full px-8 py-3 flex justify-between items-center bg-black/90">
            <Link href="/" className="flex flex-col items-center gap-1 text-white">
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>chess</span>
                <span className="text-[8px] font-bold uppercase tracking-tighter">Play</span>
            </Link>
            <Link href="/puzzles" className="flex flex-col items-center gap-1 text-neutral-500">
                <span className="material-symbols-outlined text-xl">extension</span>
                <span className="text-[8px] font-bold uppercase tracking-tighter">Puzzles</span>
            </Link>
            <Link href="/analysis" className="flex flex-col items-center gap-1 text-neutral-500">
                <span className="material-symbols-outlined text-xl">analytics</span>
                <span className="text-[8px] font-bold uppercase tracking-tighter">Analysis</span>
            </Link>
            <Link href="/learn" className="flex flex-col items-center gap-1 text-neutral-500">
                <span className="material-symbols-outlined text-xl">school</span>
                <span className="text-[8px] font-bold uppercase tracking-tighter">Learn</span>
            </Link>
            <Link href="/stats" className="flex flex-col items-center gap-1 text-neutral-500">
                <span className="material-symbols-outlined text-xl">query_stats</span>
                <span className="text-[8px] font-bold uppercase tracking-tighter">Stats</span>
            </Link>
        </nav>

    )
}

export default MinSidebar