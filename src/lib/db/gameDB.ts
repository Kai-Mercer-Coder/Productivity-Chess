import Dexie, { type Table } from "dexie";
import type { ClassificationCount } from "@/lib/types/Classification";

export interface GameRecord {
  id?: number;
  date: string;
  playerColor: 'w' | 'b';
  opponentElo: number;
  result: 'win' | 'loss' | 'draw';
  reason: string;
  moves: string[];
  pgn: string;
  openingName?: string;
  eloAtTime: number;
  accuracyWhite: number | null;
  accuracyBlack: number | null;
  classifications: { white: ClassificationCount; black: ClassificationCount } | null;
}

export interface Graph {
  id?:number;
  date: string;
  elo: number;
  difference: number;
}

export interface PuzzleFailRecord {
  id?: number;
  puzzleId: string;
  fen: string;
  attempts: number;
  lastSeen: number;
}

export interface PuzzleSolveRecord {
  id?: number;
  puzzleId: string;
  date: string;
  correct: boolean;
  hinted?: boolean;
}

class MonolithDB extends Dexie {
  games!: Table<GameRecord>;
  puzzleFails!: Table<PuzzleFailRecord>;
  puzzleSolves!: Table<PuzzleSolveRecord>;
  graph!: Table<Graph>;

  constructor() {
    super("MonolithDB");
    this.version(1).stores({
      games: "++id, date, result, opponentElo",
      puzzleFails: "++id, puzzleId",
      puzzleSolves: "++id, puzzleId, date, correct",
      graph: "++id, date, elo, difference"
    });
  }
}

export const db = new MonolithDB();
