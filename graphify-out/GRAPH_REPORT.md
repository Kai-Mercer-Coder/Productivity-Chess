# Graph Report - my-app  (2026-06-08)

## Corpus Check
- 61 files · ~21,158 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 337 nodes · 444 edges · 28 communities (22 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b5d0e778`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 24|Community 24]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 22 edges
2. `compilerOptions` - 16 edges
3. `StockfishEngine` - 11 edges
4. `MoveHandler` - 11 edges
5. `useChessGame()` - 8 edges
6. `Supabase` - 7 edges
7. `scripts` - 6 edges
8. `App()` - 6 edges
9. `ChessApiEvalEngine` - 6 edges
10. `BaseStockfishEngine` - 5 edges

## Surprising Connections (you probably didn't know these)
- `AnalysisPage()` --calls--> `useChessGame()`  [EXTRACTED]
  src/app/(SubRoutes)/analysis/page.tsx → src/app/Base_Logic/Base_Functions/useChessGame.ts
- `App()` --calls--> `useChessGame()`  [EXTRACTED]
  src/app/(SubRoutes)/play/Stuff/App.tsx → src/app/Base_Logic/Base_Functions/useChessGame.ts
- `Card()` --calls--> `cn()`  [EXTRACTED]
  src/app/Components/ui/card.tsx → src/app/lib/utils.ts
- `CardHeader()` --calls--> `cn()`  [EXTRACTED]
  src/app/Components/ui/card.tsx → src/app/lib/utils.ts
- `CardTitle()` --calls--> `cn()`  [EXTRACTED]
  src/app/Components/ui/card.tsx → src/app/lib/utils.ts

## Import Cycles
- None detected.

## Communities (28 total, 6 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (21): useBoardStyles(), BoardComponent(), BoardProps, PromotionDialog(), PromotionDialogProps, EngineControlsProps, UndoBT, Undobutton() (+13 more)

### Community 1 - "Community 1"
Cohesion: 0.09
Nodes (28): cn(), Card(), CardAction(), CardContent(), CardDescription(), CardFooter(), CardHeader(), CardTitle() (+20 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (13): AnalysisMode, AnalysisPage(), dummyReview, reviewCategories, ViewMode, useChessGame(), encounters, performanceData (+5 more)

### Community 3 - "Community 3"
Cohesion: 0.08
Nodes (25): source, assist, actions, next, react, files, ignoreUnknown, includes (+17 more)

### Community 4 - "Community 4"
Cohesion: 0.13
Nodes (7): BaseStockfishEngine, ChessApiEvalEngine, ChessApiResponse, StockfishEngine, PendingAnalysis, AnalysisState, MoveEngine

### Community 5 - "Community 5"
Cohesion: 0.08
Nodes (25): dependencies, chess.js, @chess-openings/eco.json, chess-tactics, clsx, dexie, elo-rank, @emotion/react (+17 more)

### Community 6 - "Community 6"
Cohesion: 0.10
Nodes (19): devDependencies, babel-plugin-react-compiler, @biomejs/biome, tailwindcss, @tailwindcss/postcss, @types/elo-rank, @types/node, @types/react (+11 more)

### Community 7 - "Community 7"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 8 - "Community 8"
Cohesion: 0.16
Nodes (13): CachedPuzzleShard, getCachedOrFetchPuzzles(), getOrFetchShard(), getShardsInRange(), preloadShardsForElo(), PuzzleShardDB, SHARD_RANGES, ShardRange (+5 more)

### Community 9 - "Community 9"
Cohesion: 0.16
Nodes (13): CachedPuzzleShard, db, getNextPuzzle(), getOrFetchSingleShard(), getShardIdForElo(), PuzzleRow, PuzzleShardDB, RATING_STEPS (+5 more)

### Community 11 - "Community 11"
Cohesion: 0.25
Nodes (4): ALL_SQUARES, BoardStylesParams, DIRS, PIECE_VALUES

### Community 12 - "Community 12"
Cohesion: 0.32
Nodes (4): { handlers: { GET, POST }, auth }, supabase, POST(), createAdminClient()

### Community 13 - "Community 13"
Cohesion: 0.25
Nodes (7): Core Principles, Making and Committing Schema Changes, Reference Guides, Supabase, Supabase CLI, Supabase Documentation, Supabase MCP Server

### Community 14 - "Community 14"
Cohesion: 0.29
Nodes (6): skills, supabase, computedHash, source, sourceType, version

### Community 15 - "Community 15"
Cohesion: 0.40
Nodes (3): geistMono, geistSans, metadata

### Community 16 - "Community 16"
Cohesion: 0.50
Nodes (3): Fix suggestion, Source, What happened

### Community 17 - "Community 17"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

## Knowledge Gaps
- **140 isolated node(s):** `plugin`, `$schema`, `enabled`, `clientKind`, `useIgnoreFile` (+135 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useChessGame()` connect `Community 2` to `Community 0`, `Community 4`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `MoveHandler` connect `Community 10` to `Community 0`, `Community 4`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `plugin`, `$schema`, `enabled` to the rest of the system?**
  _140 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.08658536585365853 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.09388335704125178 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.07394957983193277 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._