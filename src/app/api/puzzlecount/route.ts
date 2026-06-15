import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/createServerClient";

export async function POST(req: Request) {
    const session = await auth();
    const email = session?.user?.email;
    if (!email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { count } = await req.json();
    if (typeof count !== "number") {
        return NextResponse.json({ error: "Invalid count" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
        .from("users")
        .update({ puzzles_solved: count })
        .eq("email", email);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
}
