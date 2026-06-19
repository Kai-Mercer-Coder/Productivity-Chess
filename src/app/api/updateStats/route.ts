import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { SessionWithProfile } from "@/types/profile";
import { createAdminClient } from "@/lib/supabase/createServerClient";
import { updatePuzzleRating } from "@/lib/rating/GlickoRating";

export async function POST(req: Request) {
    const session = await auth();
    const email = session?.user?.email;
    if (!email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { solved, puzzleRating, usedHint } = await req.json();

    const user = session?.user as SessionWithProfile["user"];
    const currentElo = user?.elo ?? 1200;
    const currentRd = user?.delta_value ?? 200;
    const currentVol = user?.volatility ?? 0.06;
    const result = updatePuzzleRating(
        currentElo,
        currentRd,
        currentVol,
        puzzleRating,
        solved,
        usedHint ?? false
    );

    const supabase = createAdminClient();

    const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("email, elo, delta_value, volatility")
        .eq("email", email)
        .maybeSingle();

    if (fetchError) {
        console.error("Supabase fetch before update error:", fetchError);
        return NextResponse.json({ error: fetchError.message, details: fetchError.details, code: fetchError.code }, { status: 400 });
    }

    if (!existingUser) {
        console.error("User not found in DB:", email);
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { data: updateData, error: updateError } = await supabase
        .from("users")
        .update({
            elo: result.newRating,
            delta_value: result.newRd,
            volatility: result.newVol,
        })
        .eq("email", email);

    if (updateError) {
        console.error("Supabase update error:", updateError);
        return NextResponse.json({ error: updateError.message, details: updateError.details, code: updateError.code }, { status: 400 });
    }

    return NextResponse.json({
        newElo: result.newRating,
        newDelta: result.newRd,
        newVol: result.newVol,
        puzzlesSolved: 0,
        delta: result.delta,
    });
}