# Graph Report - .  (2026-06-09)

## Corpus Check
- Corpus is ~25,241 words - fits in a single context window. You may not need a graph.

## Summary
- 391 nodes · 637 edges · 28 communities (16 shown, 12 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 50 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Chess Engine Core|Chess Engine Core]]
- [[_COMMUNITY_Utility Functions & UI Cards|Utility Functions & UI Cards]]
- [[_COMMUNITY_Game Review & Evaluation|Game Review & Evaluation]]
- [[_COMMUNITY_Chess Board UI System|Chess Board UI System]]
- [[_COMMUNITY_Project Configuration|Project Configuration]]
- [[_COMMUNITY_Puzzle Caching System|Puzzle Caching System]]
- [[_COMMUNITY_App Layout & Styling|App Layout & Styling]]
- [[_COMMUNITY_Biome Config & Assistants|Biome Config & Assistants]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_TypeScript Configuration|TypeScript Configuration]]
- [[_COMMUNITY_Analysis Page UI|Analysis Page UI]]
- [[_COMMUNITY_Auth & API Routes|Auth & API Routes]]
- [[_COMMUNITY_Skills Lock Config|Skills Lock Config]]
- [[_COMMUNITY_OpenCode Plugin Schema|OpenCode Plugin Schema]]
- [[_COMMUNITY_Graphify Plugin Config|Graphify Plugin Config]]
- [[_COMMUNITY_OpenCode Dependencies|OpenCode Dependencies]]
- [[_COMMUNITY_Feedback Issue Template|Feedback Issue Template]]
- [[_COMMUNITY_Base Logic Re-exports|Base Logic Re-exports]]
- [[_COMMUNITY_Dashboard Page|Dashboard Page]]
- [[_COMMUNITY_Puzzle Shard Ranges|Puzzle Shard Ranges]]
- [[_COMMUNITY_Login Page Component|Login Page Component]]
- [[_COMMUNITY_OpenCode Package Config|OpenCode Package Config]]
- [[_COMMUNITY_Puzzle Route Handler|Puzzle Route Handler]]
- [[_COMMUNITY_Skill Feedback Reference|Skill Feedback Reference]]
- [[_COMMUNITY_Supabase Skill|Supabase Skill]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 22 edges
2. `compilerOptions` - 16 edges
3. `analyse()` - 15 edges
4. `StockfishEngine` - 13 edges
5. `MoveHandler` - 13 edges
6. `EvaluatedPosition` - 13 edges
7. `useChessGame()` - 11 edges
8. `ChessApiEvalEngine` - 10 edges
9. `Base Logic Barrel Export` - 10 edges
10. `getAttackers()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Next.js Breaking Changes Warning` --rationale_for--> `nextConfig`  [INFERRED]
  AGENTS.md → next.config.ts
- `EngineLine` --semantically_similar_to--> `MoveEngine`  [INFERRED] [semantically similar]
  src/lib/types/Engine.ts → src/app/(SubRoutes)/play/Stuff/types.ts
- `Move` --semantically_similar_to--> `PromotionMove`  [INFERRED] [semantically similar]
  src/lib/types/Position.ts → src/app/(SubRoutes)/play/Stuff/types.ts
- `evaluateFen()` --semantically_similar_to--> `ChessApiEvalEngine`  [INFERRED] [semantically similar]
  src/app/Base_Logic/hooks/useGameReview.ts → src/app/Base_Logic/Base_Functions/MoveEngine.ts
- `Claude AGENTS Reference` --references--> `Next.js Breaking Changes Warning`  [INFERRED]
  CLAUDE.md → AGENTS.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Chess UI Components** — components_boardcomponents_boardcomponent, components_boardcomponents_promotiondialog, components_enginecontrols_enginecontrols, components_enginecontrols_undobutton, components_evalbar_evalbar, components_gamehistory_gamehistory, components_hints_hints, components_moveanalysis_moveanalysis, components_settingspanel_settingspanel [INFERRED 0.85]
- **Navigation Components** — ui_navbar_navbar, ui_sidebar_sidebar, ui_minsidebar_minsidebar [INFERRED 0.85]
- **Shared UI Primitive Components** — ui_card_card, ui_charts_chartsystem, ui_drawer_drawersystem, ui_progress_progress [INFERRED 0.75]
- **Chess Move Analysis Pipeline** — lib_analyse_analyse, lib_classification_classification, lib_classification_classificationvalues, lib_classification_centipawnclassifications, lib_classification_getevaluationlossthreshold, lib_board_getattackers, lib_board_ispiecehanging, lib_board_piecevalues [INFERRED 0.85]
- **Puzzle Shard Caching with IndexedDB** — lib_puzzlecache_getnextpuzzle, lib_puzzlecache_puzzlesharddb, lib_puzzleshards_getcachedorfetchpuzzles, lib_puzzleshards_getorfetchshard, lib_puzzleshards_getshardsinrange, lib_puzzleshards_preloadshardsforelo, lib_puzzleshards_clearoldshards, lib_puzzleshards_puzzlesharddb [INFERRED 0.85]
- **Chess Board Interaction System** — base_functions_movehandler_movehandler, base_functions_usechessgame_usechessgame, base_functions_useboardstyles_useboardstyles, hooks_useengine_useengine [INFERRED 0.85]
- **Chess Analysis Data Pipeline** — types_report_report, types_position_evaluatedposition, types_engine_engine_line, types_engine_evaluation, types_position_position, types_position_move, types_classification_classificationcount [INFERRED 0.95]
- **Supabase Auth Architecture** — nextauth_route_authroute, utils_server_createclient, utils_server_createadminclient, utils_client_createclient, supabase_skill_supabseskill [INFERRED 0.85]
- **Chess Play System** — stuff_app_app, subroutes_play_playpage, base_logic_index_baselogicreexports, stuff_types_promotionmove, stuff_types_moveengine, stuff_types_analysisstate [INFERRED 0.85]

## Communities (28 total, 12 thin omitted)

### Community 0 - "Chess Engine Core"
Cohesion: 0.06
Nodes (22): Base_Functions barrel exports, BaseStockfishEngine, ChessApiEvalEngine, ChessApiResponse, StockfishEngine, MoveHandler, ALL_SQUARES, BoardStylesParams (+14 more)

### Community 1 - "Utility Functions & UI Cards"
Cohesion: 0.09
Nodes (31): cn(), Card(), CardAction(), CardContent(), CardDescription(), CardFooter(), CardHeader(), CardTitle() (+23 more)

### Community 2 - "Game Review & Evaluation"
Cohesion: 0.16
Nodes (28): EvalResponse, evaluateFen(), useGameReview(), UseGameReviewReturn, analyse(), getOpeningsDB(), Coordinate, getAttackers() (+20 more)

### Community 3 - "Chess Board UI System"
Cohesion: 0.10
Nodes (26): Chess UI Component System, BoardComponent(), BoardProps, PromotionDialog(), PromotionDialogProps, EngineControls(), EngineControlsProps, UndoBT (+18 more)

### Community 4 - "Project Configuration"
Cohesion: 0.06
Nodes (32): Next.js Breaking Changes Warning, Biome Linter/Formatter Config, Claude AGENTS Reference, nextConfig, dependencies, chess.js, @chess-openings/eco.json, chess-tactics (+24 more)

### Community 5 - "Puzzle Caching System"
Cohesion: 0.09
Nodes (27): CachedPuzzleShard, db, getNextPuzzle(), getOrFetchSingleShard(), getShardIdForElo(), PuzzleRow, PuzzleShardDB, RATING_STEPS (+19 more)

### Community 6 - "App Layout & Styling"
Cohesion: 0.10
Nodes (13): geistMono, geistSans, metadata, encounters, GrandmasterDashboard(), performanceData, GrandmasterMonolith(), LenisProvider() (+5 more)

### Community 7 - "Biome Config & Assistants"
Cohesion: 0.08
Nodes (25): source, assist, actions, next, react, files, ignoreUnknown, includes (+17 more)

### Community 8 - "Package Dependencies"
Cohesion: 0.10
Nodes (19): devDependencies, babel-plugin-react-compiler, @biomejs/biome, tailwindcss, @tailwindcss/postcss, @types/elo-rank, @types/node, @types/react (+11 more)

### Community 9 - "TypeScript Configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 10 - "Analysis Page UI"
Cohesion: 0.18
Nodes (13): accuracyColor(), AnalysisMode, AnalysisPage(), AnalysisView(), classificationVisuals, GameReviewView(), ModeSelector(), MoveHistory() (+5 more)

### Community 11 - "Auth & API Routes"
Cohesion: 0.24
Nodes (6): NextAuth Auth Route, { handlers: { GET, POST }, auth }, supabase, POST(), UpdateStats API POST Handler, createAdminClient()

### Community 12 - "Skills Lock Config"
Cohesion: 0.29
Nodes (6): skills, supabase, computedHash, source, sourceType, version

## Knowledge Gaps
- **143 isolated node(s):** `$schema`, `plugin`, `@opencode-ai/plugin`, `$schema`, `enabled` (+138 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useChessGame()` connect `Chess Engine Core` to `Analysis Page UI`, `Chess Board UI System`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **What connects `$schema`, `plugin`, `@opencode-ai/plugin` to the rest of the system?**
  _143 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Chess Engine Core` be split into smaller, more focused modules?**
  _Cohesion score 0.06448087431693988 - nodes in this community are weakly interconnected._
- **Should `Utility Functions & UI Cards` be split into smaller, more focused modules?**
  _Cohesion score 0.09230769230769231 - nodes in this community are weakly interconnected._
- **Should `Chess Board UI System` be split into smaller, more focused modules?**
  _Cohesion score 0.09682539682539683 - nodes in this community are weakly interconnected._
- **Should `Project Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.058823529411764705 - nodes in this community are weakly interconnected._
- **Should `Puzzle Caching System` be split into smaller, more focused modules?**
  _Cohesion score 0.08912655971479501 - nodes in this community are weakly interconnected._