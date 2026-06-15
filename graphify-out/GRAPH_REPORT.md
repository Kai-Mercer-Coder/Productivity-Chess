# Graph Report - .  (2026-06-12)

## Corpus Check
- Corpus is ~36,313 words - fits in a single context window. You may not need a graph.

## Summary
- 523 nodes · 850 edges · 35 communities (25 shown, 10 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Puzzle Shard System|Puzzle Shard System]]
- [[_COMMUNITY_Dependencies & Packages|Dependencies & Packages]]
- [[_COMMUNITY_Chess Board & Move Engine|Chess Board & Move Engine]]
- [[_COMMUNITY_Analysis & Game Review|Analysis & Game Review]]
- [[_COMMUNITY_Coach Classification|Coach Classification]]
- [[_COMMUNITY_Layout & Navigation|Layout & Navigation]]
- [[_COMMUNITY_Play Mode & Chess Board UI|Play Mode & Chess Board UI]]
- [[_COMMUNITY_WASM Engine Bridge|WASM Engine Bridge]]
- [[_COMMUNITY_Biome Linting Config|Biome Linting Config]]
- [[_COMMUNITY_WASM Coach Analyzer|WASM Coach Analyzer]]
- [[_COMMUNITY_Auth & Rating API|Auth & Rating API]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Project Overview (README)|Project Overview (README)]]
- [[_COMMUNITY_Stockfish Engine|Stockfish Engine]]
- [[_COMMUNITY_Dashboard & Login|Dashboard & Login]]
- [[_COMMUNITY_Game Stage Detection|Game Stage Detection]]
- [[_COMMUNITY_Move Handler|Move Handler]]
- [[_COMMUNITY_Supabase Config|Supabase Config]]
- [[_COMMUNITY_Stockfish WASM Binary|Stockfish WASM Binary]]
- [[_COMMUNITY_Glicko2 Types|Glicko2 Types]]
- [[_COMMUNITY_Next.js Config|Next.js Config]]
- [[_COMMUNITY_Learn Pages|Learn Pages]]
- [[_COMMUNITY_OpenCode Plugin Config|OpenCode Plugin Config]]
- [[_COMMUNITY_OpenCode Dependencies|OpenCode Dependencies]]
- [[_COMMUNITY_CN Utility|CN Utility]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_Feedback Templates|Feedback Templates]]
- [[_COMMUNITY_Skill Feedback|Skill Feedback]]
- [[_COMMUNITY_Supabase Skill|Supabase Skill]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `__wbg_get_imports()` - 13 edges
3. `StockfishEngine` - 11 edges
4. `MoveHandler` - 11 edges
5. `EvaluatedPosition` - 11 edges
6. `analyse()` - 10 edges
7. `getAttackers()` - 10 edges
8. `takeObject()` - 10 edges
9. `passStringToWasm0()` - 9 edges
10. `useChessBoard()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Next.js Breaking Changes Warning` --rationale_for--> `nextConfig`  [INFERRED]
  C:/Users/Jatin Singh/OneDrive/Documents/Random/my-app/AGENTS.md → next.config.ts
- `App()` --calls--> `useChessBoard()`  [EXTRACTED]
  src/app/(app)/play/App.tsx → src/lib/hooks/useChessBoard.ts
- `AnalysisPage()` --calls--> `useChessGame()`  [EXTRACTED]
  src/app/(app)/analysis/page.tsx → src/lib/hooks/useChessGame.ts
- `PuzzlePage()` --calls--> `useChessGame()`  [EXTRACTED]
  src/app/(app)/puzzles/page.tsx → src/lib/hooks/useChessGame.ts
- `POST()` --calls--> `createAdminClient()`  [EXTRACTED]
  src/app/api/user/onboarding/route.ts → src/lib/supabase/createServerClient.ts

## Import Cycles
- None detected.

## Communities (35 total, 10 thin omitted)

### Community 0 - "Puzzle Shard System"
Cohesion: 0.08
Nodes (30): PuzzleInfoBar(), PuzzleMoveHistory(), PuzzleSettingsModal(), PuzzleSolvedFooter(), StatusOverlay(), THEMES, PuzzlePage(), getNextPuzzle() (+22 more)

### Community 1 - "Dependencies & Packages"
Cohesion: 0.04
Nodes (47): dependencies, chess.js, @chess-openings/eco.json, chess-tactics, clsx, dexie, elo-rank, @emotion/react (+39 more)

### Community 2 - "Chess Board & Move Engine"
Cohesion: 0.08
Nodes (24): MoveAnalysisProps, ChessApiEvalEngine, ChessApiResponse, HF_HEADERS, HFApiResponse, hfEvaluateFen(), HuggingFaceEvalEngine, LocalEvalResult (+16 more)

### Community 3 - "Analysis & Game Review"
Cohesion: 0.15
Nodes (32): analyse(), getOpeningsDB(), Coordinate, findXrayAttackers(), getAttackers(), getBoardCoordinates(), getDefenders(), getDirection() (+24 more)

### Community 4 - "Coach Classification"
Cohesion: 0.09
Nodes (15): AnalysisMode, AnalysisPage(), CoachExplanation, CoachResult, CoachService, accuracyColor(), classificationVisuals, reviewCategories (+7 more)

### Community 5 - "Layout & Navigation"
Cohesion: 0.07
Nodes (12): geistMono, geistSans, metadata, navItems, Sidebar(), SidebarContext, SidebarContextType, SidebarProvider() (+4 more)

### Community 6 - "Play Mode & Chess Board UI"
Cohesion: 0.10
Nodes (15): BoardProps, ChessBoard(), PromotionDialog(), PromotionDialogProps, EngineControlsProps, UndoBT, Undobutton(), EvalBarProps (+7 more)

### Community 7 - "WASM Engine Bridge"
Cohesion: 0.16
Nodes (29): addHeapObject(), analyze(), analyze_pv(), cachedTextDecoder, cachedTextEncoder, debugString(), decodeText(), dropObject() (+21 more)

### Community 8 - "Biome Linting Config"
Cohesion: 0.08
Nodes (25): source, assist, actions, next, react, files, ignoreUnknown, includes (+17 more)

### Community 9 - "WASM Coach Analyzer"
Cohesion: 0.14
Nodes (20): classificationMessages, COACH_EMOJIS, getCoachMessage(), getWasmCoachMessage(), tacticMessages, wasmMotifMessages, AnalysisResult, analyzeMove() (+12 more)

### Community 10 - "Auth & Rating API"
Cohesion: 0.14
Nodes (13): { handlers: { GET, POST }, auth }, supabase, POST(), getExpectedScore(), getRanking(), GlickoResult, updatePuzzleRating(), config (+5 more)

### Community 11 - "TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 12 - "Project Overview (README)"
Cohesion: 0.13
Nodes (19): Puzzle Caching Strategy, Chess Tactics Training, Dashboard, Puzzle to Rating Data Flow, Dexie.js IndexedDB Cache, Game Analysis, Glicko2 Rating System, JWT Hydration Pattern (+11 more)

### Community 13 - "Stockfish Engine"
Cohesion: 0.15
Nodes (3): BaseStockfishEngine, LocalStockfishEvalEngine, StockfishEngine

### Community 15 - "Game Stage Detection"
Cohesion: 0.29
Nodes (9): backrankPieces(), countNonPawnMaterial(), DEVELOPING_SQUARES, GAME_STAGES, GameStage, getGameStage(), isDevelopingMove(), isUndevelopingMove() (+1 more)

### Community 17 - "Supabase Config"
Cohesion: 0.29
Nodes (6): skills, supabase, computedHash, source, sourceType, version

### Community 18 - "Stockfish WASM Binary"
Cohesion: 0.48
Nodes (4): c(), f(), i(), l()

### Community 19 - "Glicko2 Types"
Cohesion: 0.40
Nodes (4): Glicko2, Glicko2Options, MatchTuple, Player

### Community 20 - "Next.js Config"
Cohesion: 0.50
Nodes (3): Next.js Breaking Changes Warning, Claude AGENTS Reference, nextConfig

## Knowledge Gaps
- **161 isolated node(s):** `$schema`, `plugin`, `@opencode-ai/plugin`, `$schema`, `enabled` (+156 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useChessGame()` connect `Chess Board & Move Engine` to `Puzzle Shard System`, `Coach Classification`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Why does `MoveHandler` connect `Move Handler` to `Chess Board & Move Engine`, `Analysis & Game Review`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `analyzeMove()` connect `WASM Coach Analyzer` to `Analysis & Game Review`, `WASM Engine Bridge`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `$schema`, `plugin`, `@opencode-ai/plugin` to the rest of the system?**
  _161 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Puzzle Shard System` be split into smaller, more focused modules?**
  _Cohesion score 0.08067375886524823 - nodes in this community are weakly interconnected._
- **Should `Dependencies & Packages` be split into smaller, more focused modules?**
  _Cohesion score 0.041666666666666664 - nodes in this community are weakly interconnected._
- **Should `Chess Board & Move Engine` be split into smaller, more focused modules?**
  _Cohesion score 0.08456659619450317 - nodes in this community are weakly interconnected._