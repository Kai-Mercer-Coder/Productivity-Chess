'use client'

import { useState, useCallback } from 'react';
import { useSession } from "next-auth/react";
import type { SessionWithProfile } from "@/types/profile";
import { PlayView } from './PlayView';
import { SelectEngineView } from './SelectEngineView';

// Thin view-switcher: 'select' shows engine picker, 'play' shows the game board.
// page.tsx re-exports this as the route handler.
type View = 'select' | 'play';

export default function App() {
  const { data: session } = useSession();
  const playerElo = (session?.user as SessionWithProfile["user"])?.elo ?? 0;
  const [view, setView] = useState<View>('select');
  const [selectedElo, setSelectedElo] = useState(1350);
  const [customElo, setCustomElo] = useState(2100);

  const startGame = useCallback((elo: number) => {
    setSelectedElo(elo);
    setView('play');
  }, []);

  if (view === 'play') {
    return <PlayView elo={selectedElo} onBack={() => setView('select')} />;
  }

  return (
    <SelectEngineView
      playerElo={playerElo}
      customElo={customElo}
      onCustomEloChange={setCustomElo}
      onSelectEngine={startGame}
    />
  );
}
