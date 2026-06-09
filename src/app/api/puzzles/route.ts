import { NextResponse } from "next/server";
// import { auth } from "../auth/[...nextauth]/route";
// import { createAdminClient } from "../../utils/server";
import { getShardsInRange } from "@/lib/puzzleShards";
import fs from "fs";
import path from "path";

interface PuzzleRow {
    fen: string;
    moves: string;
    rating: number;
    themes: string;
}

const PUZZLE_DIR = path.join(process.cwd(), "public", "puzzle_shards");

function parsePuzzleLine(line: string): PuzzleRow | null {
    const parts = line.split(",");
    if (parts.length < 4) return null;
    const rating = parseInt(parts[2], 10);
    if (isNaN(rating)) return null;
    return { fen: parts[0], moves: parts[1], rating, themes: parts[3] };
}

function loadPuzzles(shards: { id: string }[]): PuzzleRow[] {
    return shards.flatMap(s => {
        const file = path.join(PUZZLE_DIR, `${s.id}.csv`);
        if (!fs.existsSync(file)) return [];
        return fs.readFileSync(file, "utf-8")
            .split("\n")
            .slice(1)
            .filter(Boolean)
            .map(parsePuzzleLine)
            .filter((p): p is PuzzleRow => p !== null);
    });
}

function pickPuzzle(puzzles: PuzzleRow[], targetElo: number, theme?: string): PuzzleRow | null {
    const filtered = puzzles.filter(p => {
        if (theme && theme !== "all") return p.themes.split(" ").includes(theme);
        return true;
    });
    if (!filtered.length) return null;

    filtered.sort((a, b) => {
        const diff = (x: number) => Math.abs(x - targetElo);
        return diff(a.rating) - diff(b.rating);
    });

    const window = Math.min(5, filtered.length);
    return filtered[Math.floor(Math.random() * window)];
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const theme = searchParams.get("theme") || undefined;
    const hardMode = searchParams.has("hard");

    // const session = await auth();
    // if (!session?.user?.email) {
    //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    // const supabase = createAdminClient();

    // const { data: user } = await supabase
    //     .from("users")
    //     .select("elo, delta_value, puzzles_solved")
    //     .eq("email", session.user.email)
    //     .single();

    const userElo = 1200;
    const targetElo = hardMode ? userElo + 300 : userElo;

    const shards = getShardsInRange(targetElo, 2);
    const puzzles = loadPuzzles(shards);
    const puzzle = pickPuzzle(puzzles, targetElo, theme);

    if (!puzzle) {
        return NextResponse.json({ error: "No puzzle found" }, { status: 404 });
    }

    return NextResponse.json({
        fen: puzzle.fen,
        moves: puzzle.moves.split(" ").filter(Boolean),
        rating: puzzle.rating,
        themes: puzzle.themes.split(" ").filter(Boolean),
    });
}