'use client'

import { useState, useCallback } from 'react';
import { useSession } from "next-auth/react";
import type { SessionWithProfile } from "@/types/profile";
import { PlayView } from './PlayView';
import { SelectEngineView } from './SelectEngineView';
import { DifficultySelect, type DifficultyConfig, DIFFICULTY_CONFIGS } from './DifficultySelect';

type View = 'select' | 'difficulty' | 'play';

export default function App() {
  const { data: session } = useSession();
  const playerElo = (session?.user as SessionWithProfile["user"])?.elo ?? 0;
  const [view, setView] = useState<View>('select');
  const [selectedElo, setSelectedElo] = useState(1350);
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyConfig>(DIFFICULTY_CONFIGS.medium);
  const [customElo, setCustomElo] = useState(2100);

  const onEngineSelect = useCallback((elo: number) => {
    setSelectedElo(elo);
    setView('difficulty');
  }, []);

  const onDifficultySelect = useCallback((config: DifficultyConfig) => {
    setSelectedDifficulty(config);
    setView('play');
  }, []);

  if (view === 'play') {
    return <PlayView elo={selectedElo} difficulty={selectedDifficulty} onBack={() => setView('select')} />;
  }

  if (view === 'difficulty') {
    const engineName = `ELO ${selectedElo}`;
    return (
      <DifficultySelect
        engineName={engineName}
        onSelect={onDifficultySelect}
        onBack={() => setView('select')}
      />
    );
  }

  return (
    <SelectEngineView
      customElo={customElo}
      onCustomEloChange={setCustomElo}
      onSelectEngine={onEngineSelect}
    />
  );
}
