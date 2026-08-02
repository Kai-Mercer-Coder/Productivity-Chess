# Graph Report - Productivity-Chess  (2026-07-22)

## Corpus Check
- 173 files · ~133,089 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 900 nodes · 1712 edges · 52 communities (41 shown, 11 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 25 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6d9de23a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Puzzle Training UI|Puzzle Training UI]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_Move Analysis Engine|Move Analysis Engine]]
- [[_COMMUNITY_Board Analysis Utils|Board Analysis Utils]]
- [[_COMMUNITY_Analysis Page & Coach|Analysis Page & Coach]]
- [[_COMMUNITY_App Layout & Routing|App Layout & Routing]]
- [[_COMMUNITY_Chess Board Components|Chess Board Components]]
- [[_COMMUNITY_WASM Engine Bindings|WASM Engine Bindings]]
- [[_COMMUNITY_Biome Lint Config|Biome Lint Config]]
- [[_COMMUNITY_Coach Messages & WASM|Coach Messages & WASM]]
- [[_COMMUNITY_Auth & Rating API|Auth & Rating API]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Project Documentation|Project Documentation]]
- [[_COMMUNITY_Stockfish Engine Layer|Stockfish Engine Layer]]
- [[_COMMUNITY_Login & Dashboard|Login & Dashboard]]
- [[_COMMUNITY_Game Stage Detection|Game Stage Detection]]
- [[_COMMUNITY_Move Handler Logic|Move Handler Logic]]
- [[_COMMUNITY_Skills Lock Config|Skills Lock Config]]
- [[_COMMUNITY_Stockfish WASM Bundle|Stockfish WASM Bundle]]
- [[_COMMUNITY_Glicko2 Types|Glicko2 Types]]
- [[_COMMUNITY_Next.js Config & Notes|Next.js Config & Notes]]
- [[_COMMUNITY_Learn Page|Learn Page]]
- [[_COMMUNITY_OpenCode Plugin Config|OpenCode Plugin Config]]
- [[_COMMUNITY_OpenCode Plugin Deps|OpenCode Plugin Deps]]
- [[_COMMUNITY_CN Utility|CN Utility]]
- [[_COMMUNITY_Endgames Page|Endgames Page]]
- [[_COMMUNITY_Middle Games Page|Middle Games Page]]
- [[_COMMUNITY_Graphify Plugin|Graphify Plugin]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_Feedback Template|Feedback Template]]
- [[_COMMUNITY_Skill Feedback Docs|Skill Feedback Docs]]
- [[_COMMUNITY_Supabase Skill Docs|Supabase Skill Docs]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 53|Community 53]]

## God Nodes (most connected - your core abstractions)
1. `LocalStockfishEvalEngine` - 23 edges
2. `UciEngine` - 21 edges
3. `OpeningLine` - 19 edges
4. `StockfishEngine` - 16 edges
5. `compilerOptions` - 16 edges
6. `Chess Tactics Training` - 15 edges
7. `v()` - 13 edges
8. `EngineResult` - 13 edges
9. `__wbg_get_imports()` - 13 edges
10. `Z()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Next.js Breaking Changes Warning` --rationale_for--> `nextConfig`  [INFERRED]
  C:/Users/Jatin Singh/C:/CSaasMG/Productivity-Chess/AGENTS.md → next.config.ts
- `TrainPage()` --calls--> `useOpeningProgress()`  [INFERRED]
  src/app/(app)/learn/openings/train/[id]/page.tsx → src/hooks/useOpeningProgress.ts
- `p()` --calls--> `n()`  [INFERRED]
  public/stockfish/stockfish-18-lite-single.js → public/stockfish-mv/stockfish.js
- `La()` --calls--> `i()`  [INFERRED]
  public/stockfish-mv/stockfish.js → public/stockfish/stockfish-18-lite-single.js
- `Pb()` --calls--> `f()`  [INFERRED]
  public/stockfish-mv/stockfish.js → public/stockfish/stockfish-18-lite-single.js

## Import Cycles
- None detected.

## Communities (52 total, 11 thin omitted)

### Community 0 - "Puzzle Training UI"
Cohesion: 0.12
Nodes (22): getNextPuzzle(), PuzzleRow, CachedPuzzleShard, clearOldShards(), getCachedOrFetchPuzzles(), getOrFetchShard(), getShardIdForElo(), getShardsInRange() (+14 more)

### Community 1 - "Package Dependencies"
Cohesion: 0.06
Nodes (31): dependencies, chess.js, @chess-openings/eco.json, chess-tactics, chessops, clsx, dexie, @emotion/react (+23 more)

### Community 2 - "Move Analysis Engine"
Cohesion: 0.06
Nodes (38): AnalysisMode, AnalysisPage(), sanitize(), sanitizeFen(), sanitizePgn(), ExportModal(), AnalysisMode, EngineState (+30 more)

### Community 3 - "Board Analysis Utils"
Cohesion: 0.14
Nodes (31): analyse(), getOpeningsDB(), Coordinate, findXrayAttackers(), getAttackers(), getBoardCoordinates(), getDefenders(), getDirection() (+23 more)

### Community 4 - "Analysis Page & Coach"
Cohesion: 0.19
Nodes (7): customPieces, accuracyColor(), classificationVisuals, reviewCategories, CoachToken, GameReviewView(), PIECE_UNICODE

### Community 5 - "App Layout & Routing"
Cohesion: 0.06
Nodes (17): geistMono, geistSans, metadata, navItems, Sidebar(), SidebarContext, SidebarContextType, SidebarProvider() (+9 more)

### Community 6 - "Chess Board Components"
Cohesion: 0.06
Nodes (40): BoardProps, ChessBoard(), PromotionDialog(), PromotionDialogProps, EngineControlsProps, UndoBT, Undobutton(), EvalBarProps (+32 more)

### Community 7 - "WASM Engine Bindings"
Cohesion: 0.08
Nodes (49): classificationMessages, COACH_EMOJIS, getCoachMessage(), getWasmCoachMessage(), tacticMessages, wasmMotifMessages, AnalysisResult, analyzeMove() (+41 more)

### Community 8 - "Biome Lint Config"
Cohesion: 0.24
Nodes (7): boardTheme, captureSquareStyle, Interaction, LiveAnalysisView(), MovePair, PuzzleSessionProps, Status

### Community 9 - "Coach Messages & WASM"
Cohesion: 0.13
Nodes (8): db, EloHistoryEntry, EloRecord, MonolithDB, PuzzleFailRecord, PuzzleSolveRecord, levels, Props

### Community 10 - "Auth & Rating API"
Cohesion: 0.14
Nodes (13): { handlers: { GET, POST }, auth }, supabase, POST(), POST(), getExpectedScore(), getRanking(), GlickoResult, updatePuzzleRating() (+5 more)

### Community 11 - "TypeScript Config"
Cohesion: 0.08
Nodes (26): OpeningLine, LineProgress, LineStatus, useOpeningProgress(), TrainPage(), caroKannLines, defendNoobLines, hyperDragonLines (+18 more)

### Community 12 - "Project Documentation"
Cohesion: 0.07
Nodes (32): Architecture, Puzzle Caching Strategy, Chess Tactics Training, Dashboard, Puzzle to Rating Data Flow, Data Flow (Puzzle → Rating), Database, Deployment (+24 more)

### Community 13 - "Stockfish Engine Layer"
Cohesion: 0.08
Nodes (35): PIECE_TYPES, ROLE_TO_LETTER, tryApplyMove(), VariantBoard(), VariantBoardProps, DEPTH_TABLE, destroyEngine(), ELO_TABLE (+27 more)

### Community 14 - "Login & Dashboard"
Cohesion: 0.16
Nodes (8): GrandmasterDashboard(), EndgamesPage(), PRACTICE_CATEGORIES, GameStats, useGameStats(), MiddleGamesPage(), StatsPage(), TIERS

### Community 15 - "Game Stage Detection"
Cohesion: 0.17
Nodes (9): legalMoveSquareStyle, Mode, Props, Status, EndgameLine, endgameLines, pawnKingLines, queenKingLines (+1 more)

### Community 16 - "Move Handler Logic"
Cohesion: 0.18
Nodes (7): MoveHandler, addSquare(), fileRank(), getRelaxedPremoveTargets(), simulatePremove(), stripCastlingRights(), toSquare()

### Community 17 - "Skills Lock Config"
Cohesion: 0.08
Nodes (25): source, assist, actions, next, react, files, ignoreUnknown, includes (+17 more)

### Community 18 - "Stockfish WASM Bundle"
Cohesion: 0.10
Nodes (50): a(), Aa(), Ab(), assert(), b(), Bb(), c(), Cb() (+42 more)

### Community 19 - "Glicko2 Types"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 20 - "Next.js Config & Notes"
Cohesion: 0.50
Nodes (3): Next.js Breaking Changes Warning, Claude AGENTS Reference, nextConfig

### Community 24 - "OpenCode Plugin Deps"
Cohesion: 0.17
Nodes (11): fetchPuzzleCategoriesWithSubs(), findCategoryWithSubsBySlug(), getCategorySlug(), pickSubcategoryFens(), PuzzleCategory, PuzzleCategoryWithSubs, PuzzleEntry, PuzzleGame (+3 more)

### Community 25 - "CN Utility"
Cohesion: 0.21
Nodes (6): PuzzleInfoBar(), PuzzleMoveHistory(), PuzzleSettingsModal(), PuzzleSolvedFooter(), StatusOverlay(), THEMES

### Community 26 - "Endgames Page"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, format, lint, start (+1 more)

### Community 27 - "Middle Games Page"
Cohesion: 0.18
Nodes (11): devDependencies, babel-plugin-react-compiler, @biomejs/biome, swiftchess, tailwindcss, @tailwindcss/postcss, @types/node, @types/react (+3 more)

### Community 28 - "Graphify Plugin"
Cohesion: 0.22
Nodes (10): ArrowData, ArrowOverlayProps, ArrowShape, buildArrowHead(), buildArrowShape(), getArrowPoints(), Point, ptStr() (+2 more)

### Community 35 - "Community 35"
Cohesion: 0.25
Nodes (7): Core Principles, Making and Committing Schema Changes, Reference Guides, Supabase, Supabase CLI, Supabase Documentation, Supabase MCP Server

### Community 36 - "Community 36"
Cohesion: 0.29
Nodes (6): skills, supabase, computedHash, source, sourceType, version

### Community 37 - "Community 37"
Cohesion: 0.24
Nodes (8): MiddleGameLine, middleGameLines, lines, isAutoPlay(), isUsersTurn(), MiddlegameTrainer(), Props, Status

### Community 38 - "Community 38"
Cohesion: 0.25
Nodes (7): ThemeCard(), ALL_THEMES, CHECKMATES, PHASES, TACTICS, ThemeCategory, ThemeMeta

### Community 39 - "Community 39"
Cohesion: 0.43
Nodes (6): useBoardInteraction(), useLocalElo(), usePuzzleStorage(), PuzzlePage(), pickTheme(), usePuzzle()

### Community 41 - "Community 41"
Cohesion: 0.50
Nodes (3): Fix suggestion, Source, What happened

### Community 49 - "Community 49"
Cohesion: 0.38
Nodes (5): isAutoPlay(), isUsersTurn(), Mode, OpeningTrainer(), Status

### Community 50 - "Community 50"
Cohesion: 0.24
Nodes (10): audioPool, getAudio(), MoveSoundInfo, play(), playCaptureSound(), playMoveSound(), SOUND_URLS, SoundKey (+2 more)

### Community 53 - "Community 53"
Cohesion: 0.40
Nodes (4): Glicko2, Glicko2Options, MatchTuple, Player

## Knowledge Gaps
- **239 isolated node(s):** `$schema`, `enabled`, `clientKind`, `useIgnoreFile`, `ignoreUnknown` (+234 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `customPieces` connect `Analysis Page & Coach` to `Community 37`, `Chess Board Components`, `Community 39`, `Biome Lint Config`, `Stockfish Engine Layer`, `Game Stage Detection`, `Community 49`, `Login Button`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `boardTheme` connect `Biome Lint Config` to `Analysis Page & Coach`, `Community 37`, `Chess Board Components`, `Community 39`, `Stockfish Engine Layer`, `Game Stage Detection`, `Community 49`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `OpeningLine` connect `TypeScript Config` to `Community 49`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **What connects `$schema`, `enabled`, `clientKind` to the rest of the system?**
  _239 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Puzzle Training UI` be split into smaller, more focused modules?**
  _Cohesion score 0.12258064516129032 - nodes in this community are weakly interconnected._
- **Should `Package Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._
- **Should `Move Analysis Engine` be split into smaller, more focused modules?**
  _Cohesion score 0.06329113924050633 - nodes in this community are weakly interconnected._