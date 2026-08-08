import { db } from "@/lib/db/gameDB";
import { clearOnboarding } from "@/lib/onboardingStore";

const LOCAL_STORAGE_KEYS = ["puzzleStreakStart", "opening-progress"];

export async function clearGuestData(email: string): Promise<void> {
  try {
    await db.transaction(
      "rw",
      [db.games, db.puzzleFails, db.puzzleSolves, db.graph, db.elo, db.eloHistory],
      async () => {
        await Promise.all([
          db.games.clear(),
          db.puzzleFails.clear(),
          db.puzzleSolves.clear(),
          db.graph.clear(),
          db.elo.clear(),
          db.eloHistory.clear(),
        ]);
      }
    );
  } catch {}

  await clearOnboarding(email);

  try {
    LOCAL_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  } catch {}
}
