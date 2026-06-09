import { NextResponse } from "next/server";
import { auth } from "../auth/[...nextauth]/route";
import { createAdminClient } from "../../utils/server";

const MIN_ELO = 400;
const MIN_DELTA = 10;
const MAX_DELTA = 200;

export async function POST(req: Request) {

    const session = await auth();
    const email = session?.user?.email;
    if (!email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { solved, puzzleRating, usedHint } = await req.json();

    const supabase = createAdminClient();

    const { data: user, error: fetchError } = await supabase
        .from("users")
        .select("elo, delta_value, puzzles_solved")
        .eq("email", email)
        .single();

    if (fetchError || !user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let { elo, delta_value, puzzles_solved } = user;
    const currentElo = elo ?? 1200;
    const currentDelta = delta_value ?? 200;

    let newElo: number;
    let newDelta: number;

    if (solved) {
        const diff = puzzleRating - currentElo;
        const sign = diff > 0 ? 1 : diff < 0 ? -1 : 0;
        const bonus = sign * Math.min(Math.abs(diff) / 10, 20);
        let reward = currentDelta + bonus;
        if (usedHint) reward = Math.round(reward * 0.5);
        newElo = Math.round(currentElo + reward);
        newDelta = Math.max(MIN_DELTA, Math.round(currentDelta * 0.95));
        puzzles_solved = (puzzles_solved ?? 0) + 1;
    } else {
        newElo = Math.max(MIN_ELO, Math.round(currentElo - currentDelta * 0.5));
        newDelta = Math.min(MAX_DELTA, currentDelta + 10);
    }

    const { error: updateError } = await supabase
        .from("users")
        .update({ elo: newElo, delta_value: newDelta, puzzles_solved })
        .eq("email", email);

    if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ newElo, newDelta, puzzlesSolved: puzzles_solved });
}