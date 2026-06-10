import { NextResponse } from "next/server";
import { auth } from "../../auth/[...nextauth]/route";
import { createAdminClient } from "@/lib/supabase/createServerClient";

export async function POST(req: Request) {
    const session = await auth();
    const email = session?.user?.email;
    if (!email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { elo } = await req.json();
    if (typeof elo !== "number" || elo < 400 || elo > 2000) {
        return NextResponse.json({ error: "Invalid elo" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
        .from("users")
        .update({ elo, delta_value: 200, puzzles_solved: 0 })
        .eq("email", email);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ elo, delta_value: 200, puzzles_solved: 0 });
}
