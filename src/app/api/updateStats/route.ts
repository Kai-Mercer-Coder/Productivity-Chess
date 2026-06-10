import { NextResponse } from "next/server";
import { auth } from "../auth/[...nextauth]/route";
import { createAdminClient } from "@/lib/supabase/createServerClient";
import { updatePuzzleRating } from "@/lib/rating/GlickoRating";

export async function POST(req: Request) {
    const session = await auth();
    const email = session?.user?.email;
    if (!email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { solved, puzzleRating, usedHint } = await req.json();

    const currentElo = (session.user as any)?.elo ?? 1200;
    const currentRd = (session.user as any)?.delta_value ?? 200;
    const currentVol = (session.user as any)?.volatility ?? 0.06;
    const puzzlesSolved = (session.user as any)?.puzzles_solved ?? 0;

    const result = updatePuzzleRating(
        currentElo,
        currentRd,
        currentVol,
        puzzleRating,
        solved,
        usedHint ?? false
    );

    const newPuzzlesSolved = solved ? puzzlesSolved + 1 : puzzlesSolved;

    const supabase = createAdminClient();
    const { error: updateError } = await supabase
        .from("users")
        .update({
            elo: result.newRating,
            delta_value: result.newRd,
            volatility: result.newVol,
            puzzles_solved: newPuzzlesSolved,
        })
        .eq("email", email);

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({
        newElo: result.newRating,
        newDelta: result.newRd,
        newVol: result.newVol,
        puzzlesSolved: newPuzzlesSolved,
        delta: result.delta,
    });
}