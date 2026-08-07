# Chess Tactics Training

A full-stack chess training app with **328,000+ free puzzles**, unlimited game analysis, opening training, and Glicko2-based rating. Built with Next.js 16, Supabase, and Stockfish.

## Features

- **Puzzles (328K+)** — The full [lichess-org/chess-tactics-browser](https://github.com/lichess-org/chess-tactics-browser) database cached client-side in IndexedDB (Dexie.js). Puzzles are served from CSV shards by Elo range (400–2800+). Each solve updates your Glicko2 rating (elo, RD, volatility) via a server API. Preloading, shard caching, and LRU eviction ensure smooth browsing. **100% free — no paywall, no daily limits.**

- **Play vs Engine** — Free play against Stockfish with adjustable Elo (800–3200). Live move evaluation, centipawn loss diff, engine lines, book moves, hints, and move analysis coach. Supports undo, premoves, auto-promotion, and a configurable settings panel (board colors, animation speed).

- **Unlimited Game Review** — After each play session, review every move with coach commentary, centipawn-loss classification (Book/Excellent/Good/Inaccuracy/Mistake/Blunder/Dubious/Missed Win), and per-move engine evaluation. Powered by local Stockfish WASM with a shared singleton engine.

- **Opening Trainer** — Learn and revise opening lines with an interactive board. The Sicilian Najdorf main line is included with hints. Two modes: **Learn** (hints always shown) and **Revise** (hints hidden until you get it wrong). Wrong moves use the puzzle-style revert animation (1.2s). Progress is saved to localStorage.

- **Engine Evaluation** — Tablebase (≤7 pieces) lookup with local Stockfish WASM fallback. Local engine reports live at depth 8+, caps at depth 18, with iterative deepening.

- **Analysis Board** — Full chess analysis with click-to-move, drag-to-move, legal move highlights, engine evaluation, PGN/FEN import/export, and position navigation. Board flips between white and black orientation. Inputs are sanitized against payload injection.

- **Custom Chess Pieces** — 12 inline SVG piece components (WintrChess art style) rendered across all boards — no external image dependencies, no base64 bloat.

- **Sound Effects** — Move and capture sounds play on every legal move across play, puzzles, analysis, and opening training boards.

- **Dashboard** — Recharts area chart for rating trend, puzzles-solved-per-week histogram, and stat cards (Elo, puzzles solved, level) pulled live from your NextAuth session.

- **Auth** — Supabase + NextAuth with JWT-embedded user stats (elo, RD, volatility, puzzles_solved). No Supabase reads on session fetch — the JWT callback hydrates the token once on sign-in, and the session callback reads from the JWT only.

- **Onboarding** — New users select a skill level (400–2000 Elo) which sets their starting rating via a POST API route.

- **User Profile** — Full-screen overlay showing Elo, RD, puzzles solved, and level.

- **Themes** — Unified grey-white board theme (`#e1e1e1` light, `#8A909A` dark) with `rgba(0,0,0,0.2)` legal move indicators, applied consistently across all chessboards in the app.

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| Auth | [NextAuth.js](https://next-auth.js.org) (v5) + [Supabase](https://supabase.com) |
| Database | [Supabase](https://supabase.com) (Postgres) |
| Chess | [chess.js](https://github.com/jhlywa/chess.js), [react-chessboard](https://github.com/Clariity/react-chessboard), [chess-tactics](https://github.com/evan-eschwege/chess-tactics), [@chess-openings/eco.json](https://github.com/chess-openings/eco.json) |
| Engine | Local [Stockfish 18 WASM](https://github.com/lichess-org/stockfish.wasm) via [wintrchess](https://github.com/devsh9/wintrchess) + Lichess Tablebase lookup |
| Rating | [glicko2](https://github.com/mmai/glicko2) npm library |
| Cache | [Dexie.js](https://dexie.org) (IndexedDB) — 40 MB limit, 328K puzzles |
| Charts | [Recharts](https://recharts.org) |
| UI | [Tailwind CSS](https://tailwindcss.com), [MUI](https://mui.com), [lucide-react](https://lucide.dev) icons, [motion](https://motion.dev) (framer-motion) |
| Styling | [Tailwind CSS](https://tailwindcss.com) with [Tailwind Scrollbar](https://github.com/karasnik/tailwind-scrollbar), [Lenis](https://github.com/studio-freight/lenis) smooth scroll |
| Linting | [Biome](https://biomejs.dev) |

## Architecture

```
src/
├── app/
│   ├── (app)/
│   │   ├── play/            — Free play vs Stockfish with live eval
│   │   ├── puzzles/         — 328K tactics puzzles with Glicko2 rating
│   │   ├── analysis/        — Post-game review, engine eval, PGN analysis
│   │   ├── learn/           — Opening trainer, middle-games, endgames
│   │   │   ├── openings/    — Opening line dashboard + training page
│   │   │   ├── middle-games/
│   │   │   └── endgames/
│   │   ├── stats/           — Detailed stats page
│   │   └── dashboard/       — Dashboard with rating charts
│   ├── (auth)/login/        — Sign-in page (Supabase credentials)
│   ├── (marketing)/         — Landing page, privacy, terms, credits
│   ├── under-construction/  — Placeholder for future features
│   └── api/
│       ├── auth/            — NextAuth route handler + callbacks
│       ├── puzzles/         — Puzzle shard serving & selection
│       ├── puzzlecount/     — Puzzle count endpoint
│       ├── updateStats/     — Glicko2 rating update endpoint
│       └── user/onboarding/ — Initial Elo setter for new users
├── components/
│   ├── chess/               — ChessBoard wrapper, customPieces, EvalBar, etc.
│   ├── dashboard/           — DashboardPage, stat cards, charts
│   ├── layouts/             — Sidebar, Navbar, MobileNavbar
│   ├── openings/            — OpeningTrainer component
│   └── marketing/           — LandingPage, feature sections
├── lib/
│   ├── chess/               — MoveEngine (eval sources), sounds, boardTheme, coach
│   ├── db/                  — IndexedDB game storage
│   ├── puzzles/             — Puzzle shard caching (Dexie), usePuzzle hook
│   ├── rating/              — Glicko2 wrapper (updatePuzzleRating, getExpectedScore)
│   ├── supabase/            — Admin & client Supabase helpers
│   ├── hooks/               — Shared hooks (useBoardInteraction, useChessBoard, etc.)
│   └── types/               — TypeScript declarations
├── data/                    — Opening lines data
└── hooks/                   — useOpeningProgress (localStorage)
```

### Data Flow (Puzzle → Rating)

1. User signs in → NextAuth `jwt` callback fetches profile from Supabase once, embeds `{elo, rd, volatility, puzzles_solved}` in the JWT.
2. Puzzle page loads → `usePuzzle` calls `/api/puzzles` with `userElo` (from session) ±30 jitter → shard is fetched/cached in Dexie.
3. User solves (or fails) → `POST /api/updateStats` reads stats from JWT, computes new Glicko2 rating, writes result to Supabase, returns updated stats.
4. Client calls `session.update()` → NextAuth `jwt` callback merges new stats into the token (no DB roundtrip).
5. Dashboard renders rating trend from session data — all client-side, no extra API calls.

### Evaluation Fallback Chain

```
Tablebase (≤7 pieces) → Local Stockfish WASM
```

Each source is tried in order with appropriate timeouts. Local Stockfish uses a shared WASM worker singleton with exponential backoff auto-restart.

### Puzzle Caching

- 328K puzzles split into CSV shards by Elo range (`public/puzzle_shards/`).
- Dexie schema v2 with migration from `string[]` → `string` for IndexedDB compatibility.
- 40 MB storage quota with LRU eviction of least-recently-used shards.
- Defensive `Array.isArray` check for cached data.

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project (Postgres database with a `profiles` table)

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
```

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database

The Supabase `profiles` table needs these columns:

| Column | Type | Default |
|--------|------|---------|
| `email` | `text` (PK) | — |
| `elo` | `int4` | 1200 |
| `rd` | `float8` | 350 |
| `volatility` | `float8` | 0.06 |
| `puzzles_solved` | `int4` | 0 |
| `rating_history` | `jsonb` | `[]` |

## Deployment

Deploy on Vercel. Set the same env vars in the Vercel dashboard, overriding `NEXTAUTH_URL` to your production domain.

## License

[AGPL-3.0](LICENSE)
