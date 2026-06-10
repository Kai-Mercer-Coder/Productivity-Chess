# Chess Tactics Training

A full-stack chess training app with Glicko2-based rating, interactive puzzles, game analysis, and a recharts-powered dashboard. Built with Next.js 15+, Supabase, and Stockfish.

## Features

- **Puzzles** — 328K+ chess tactics puzzles cached in IndexedDB (Dexie.js), served from CSV shards by Elo range. Each solve updates your Glicko2 rating (elo, RD, volatility) via a server API.
- **Play & Analysis** — Full chess board with Stockfish engine integration (local + API fallback), move evaluation, engine lines, book moves from eco.json, and post-game analysis with centipawn loss classification.
- **Dashboard** — Recharts area chart for rating trend, puzzles-solved-per-week histogram, and stat cards (Elo, puzzles solved, level) pulled live from your NextAuth session.
- **Auth** — Supabase + NextAuth with JWT-embedded user stats (elo, RD, volatility, puzzles_solved). No Supabase reads on session fetch — the JWT callback hydrates the token once on sign-in, and the session callback reads from the JWT only.
- **Onboarding** — New users select a skill level (400–2000 Elo) which sets their starting rating via a POST API route.
- **User Profile** — Full-screen framer-motion overlay showing Elo, RD, puzzles solved, and level.

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | [Next.js 15+](https://nextjs.org) (App Router) |
| Auth | [NextAuth.js](https://next-auth.js.org) (v5) + [Supabase](https://supabase.com) |
| Database | [Supabase](https://supabase.com) (Postgres) |
| Chess | [chess.js](https://github.com/jhlywa/chess.js), [react-chessboard](https://github.com/Clariity/react-chessboard), [chess-tactics](https://github.com/evan-eschwege/chess-tactics), [@chess-openings/eco.json](https://github.com/chess-openings/eco.json) |
| Engine | Local [Stockfish](https://github.com/lichess-org/stockfish.js) via [wintrchess](https://github.com/devsh9/wintrchess) + Chess API fallback |
| Rating | [glicko2](https://github.com/mmai/glicko2) npm library |
| Cache | [Dexie.js](https://dexie.org) (IndexedDB) — 40 MB limit, 328K puzzles |
| Charts | [Recharts](https://recharts.org) |
| UI | [Tailwind CSS](https://tailwindcss.com), [MUI](https://mui.com), [lucide-react](https://lucide.dev) icons, [framer-motion](https://motion.dev) |
| Styling | [Tailwind CSS](https://tailwindcss.com) with [Tailwind Scrollbar](https://github.com/karasnik/tailwind-scrollbar) |
| Linting | [Biome](https://biomejs.dev) |

## Architecture

```
src/
├── app/
│   ├── (app)/          — Main app routes (play, puzzles, analysis)
│   │   ├── play/       — Free play with Stockfish + move analysis
│   │   ├── puzzles/    — Tactics puzzles with Glicko2 rating
│   │   └── analysis/   — Post-game review & evaluation
│   ├── (auth)/login/   — Sign-in page (Supabase credentials)
│   ├── (dashboard)/    — Dashboard with rating charts & stats
│   ├── (marketing)/    — Landing page
│   └── api/
│       ├── auth/       — NextAuth route handler + callbacks
│       ├── puzzles/    — Puzzle shard serving & selection
│       ├── updateStats/— Glicko2 rating update endpoint
│       └── user/onboarding/ — Initial Elo setter for new users
├── components/
│   ├── dashboard/      — DashboardPage, stat cards, charts
│   ├── layouts/        — Sidebar, Navbar, MobileNavbar
│   └── profile/        — UserProfileOverlay, OnboardingOverlay
├── lib/
│   ├── puzzles/        — Puzzle shard caching (Dexie), usePuzzle hook
│   ├── rating/         — Glicko2 wrapper (updatePuzzleRating, getExpectedScore)
│   ├── supabase/       — Admin & client Supabase helpers
│   ├── chess/          — Chess utilities, move handling
│   ├── hooks/          — Shared hooks (useBookMoves, useEvaluation, etc.)
│   └── types/          — TypeScript declarations
└── types/              — Global type declarations (glicko2)
```

### Data Flow (Puzzle → Rating)

1. User signs in → NextAuth `jwt` callback fetches profile from Supabase once, embeds `{elo, rd, volatility, puzzles_solved}` in the JWT.
2. Puzzle page loads → `usePuzzle` calls `/api/puzzles` with `userElo` (from session) ±30 jitter → shard is fetched/cached in Dexie.
3. User solves (or fails) → `POST /api/updateStats` reads stats from JWT, computes new Glicko2 rating, writes result to Supabase, returns updated stats.
4. Client calls `session.update()` → NextAuth `jwt` callback merges new stats into the token (no DB roundtrip).
5. Dashboard renders rating trend from session data — all client-side, no extra API calls.

### Puzzle Caching

- 328K puzzles split into CSV shards by Elo range (`public/puzzle_shards/`).
- Dexie schema v2 with migration from `string[]` → `string` for IndexedDB compatibility.
- 40 MB storage quota with LRU eviction of least-recently-used shards.
- Defensive `Array.isArray` check for cached data.

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project (Postgres database with a `profiles` table)
- A Chess API key (for engine evaluation fallback — optional if using local Stockfish)

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
CHESS_API_EMAIL=<email-for-chess-api>
CHESS_API_KEY=<chess-api-key>
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

[MIT](LICENSE)
