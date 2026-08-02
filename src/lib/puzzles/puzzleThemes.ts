export type ThemeCategory = "checkmate" | "tactic" | "phase";
export type RarityTier = "legendary" | "epic" | "rare" | "uncommon" | "common";

export interface ThemeMeta {
  name: string;
  category: ThemeCategory;
  label: string;
  description: string;
  icon: string;
  rarity?: RarityTier;
}

// Rarity colors for UI display
export const RARITY_COLORS: Record<RarityTier, string> = {
  legendary: "#FFD700",
  epic: "#A855F7",
  rare: "#3B82F6",
  uncommon: "#22C55E",
  common: "#71717A",
};

// Category priority weights (lower = more important)
const CATEGORY_WEIGHTS: Record<ThemeCategory, number> = {
  checkmate: 1.0,
  tactic: 0.7,
  phase: 0.3,
};

const CHECKMATES: ThemeMeta[] = [
  { name: "smotheredMate", category: "checkmate", label: "Smothered Mate", description: "A knight checkmates the king surrounded by its own pieces.", icon: "lock", rarity: "legendary" },
  { name: "backRankMate", category: "checkmate", label: "Back Rank Mate", description: "The king is trapped by its own pawns on the back rank.", icon: "vertical_align_bottom", rarity: "common" },
  { name: "anastasiaMate", category: "checkmate", label: "Anastasia's Mate", description: "Knight and rook/queen combine to mate the king against the edge.", icon: "sports_martial_arts", rarity: "rare" },
  { name: "arabianMate", category: "checkmate", label: "Arabian Mate", description: "A knight and rook corner the enemy king.", icon: "sports_martial_arts", rarity: "rare" },
  { name: "balestraMate", category: "checkmate", label: "Balestra Mate", description: "A bishop and queen deliver mate with the king on the edge.", icon: "church", rarity: "epic" },
  { name: "blindSwineMate", category: "checkmate", label: "Blind Swine Mate", description: "Two rooks on the seventh rank deliver checkmate.", icon: "shield", rarity: "epic" },
  { name: "bodenMate", category: "checkmate", label: "Boden's Mate", description: "Two bishops deliver mate against a king blocked by its own pieces.", icon: "church", rarity: "rare" },
  { name: "cornerMate", category: "checkmate", label: "Corner Mate", description: "The king is mated in the corner of the board.", icon: "crop_square", rarity: "uncommon" },
  { name: "doubleBishopMate", category: "checkmate", label: "Double Bishop Mate", description: "Two bishops coordinate to deliver checkmate.", icon: "church", rarity: "uncommon" },
  { name: "dovetailMate", category: "checkmate", label: "Dovetail Mate", description: "A queen delivers mate supported by a pawn or bishop.", icon: "diamond", rarity: "epic" },
  { name: "hookMate", category: "checkmate", label: "Hook Mate", description: "A rook, knight, and pawn combine to trap the king.", icon: "hook", rarity: "rare" },
  { name: "killBoxMate", category: "checkmate", label: "Kill Box Mate", description: "Rook and queen create a mating net on the edge.", icon: "gps_fixed", rarity: "epic" },
  { name: "morphysMate", category: "checkmate", label: "Morphy's Mate", description: "A classic mating pattern named after Paul Morphy.", icon: "history", rarity: "rare" },
  { name: "operaMate", category: "checkmate", label: "Opera Mate", description: "Bishop and rook mate from the Opera Game.", icon: "theater_comedy", rarity: "rare" },
  { name: "pillsburysMate", category: "checkmate", label: "Pillsbury's Mate", description: "Two bishops and a rook coordinate the mate.", icon: "church", rarity: "epic" },
  { name: "triangleMate", category: "checkmate", label: "Triangle Mate", description: "A queen and bishop deliver mate in a triangular formation.", icon: "change_history", rarity: "epic" },
  { name: "vukovicMate", category: "checkmate", label: "Vukovic Mate", description: "A rook delivers mate with the king position cut off.", icon: "shield", rarity: "legendary" },
];

const TACTICS: ThemeMeta[] = [
  { name: "crushing", category: "tactic", label: "Crushing", description: "A decisive tactical strike that leaves the opponent helpless.", icon: "flash_on", rarity: "uncommon" },
  { name: "sacrifice", category: "tactic", label: "Sacrifice", description: "Material is given up for a greater positional or attacking gain.", icon: "volunteer_activism", rarity: "uncommon" },
  { name: "fork", category: "tactic", label: "Fork", description: "A single piece attacks two or more enemy pieces simultaneously.", icon: "call_split", rarity: "common" },
  { name: "pin", category: "tactic", label: "Pin", description: "A piece cannot move without exposing a more valuable piece.", icon: "push_pin", rarity: "common" },
  { name: "skewer", category: "tactic", label: "Skewer", description: "A valuable piece is attacked and must move, exposing a piece behind it.", icon: "straighten", rarity: "uncommon" },
  { name: "deflection", category: "tactic", label: "Deflection", description: "A piece is forced away from a critical defensive square.", icon: "north_east", rarity: "uncommon" },
  { name: "discoveredAttack", category: "tactic", label: "Discovered Attack", description: "Moving a piece reveals an attack from a piece behind it.", icon: "visibility", rarity: "uncommon" },
  { name: "discoveredCheck", category: "tactic", label: "Discovered Check", description: "Moving a piece reveals a check from another piece.", icon: "visibility", rarity: "rare" },
  { name: "doubleCheck", category: "tactic", label: "Double Check", description: "Two pieces give check simultaneously.", icon: "done_all", rarity: "rare" },
  { name: "attraction", category: "tactic", label: "Attraction", description: "A piece is lured to a square where it can be attacked.", icon: "magnet", rarity: "uncommon" },
  { name: "trappedPiece", category: "tactic", label: "Trapped Piece", description: "An enemy piece is caught with no safe escape squares.", icon: "lock", rarity: "uncommon" },
  { name: "exposedKing", category: "tactic", label: "Exposed King", description: "The enemy king lacks pawn cover and is vulnerable to attack.", icon: "person_off", rarity: "uncommon" },
  { name: "hangingPiece", category: "tactic", label: "Hanging Piece", description: "An undefended piece is ripe for capture.", icon: "error_outline", rarity: "common" },
  { name: "clearance", category: "tactic", label: "Clearance", description: "A piece moves away to open a line for another piece.", icon: "open_with", rarity: "rare" },
  { name: "interference", category: "tactic", label: "Interference", description: "A piece is placed between two defenders to disrupt coordination.", icon: "block", rarity: "rare" },
  { name: "intermezzo", category: "tactic", label: "Intermezzo", description: "An intermediate move before capturing a threatened piece.", icon: "more_horiz", rarity: "rare" },
  { name: "quietMove", category: "tactic", label: "Quiet Move", description: "A non-check, non-capture move that improves the position.", icon: "volume_down", rarity: "rare" },
  { name: "attackingF2F7", category: "tactic", label: "Attacking F2/F7", description: "A direct attack on the weakest squares in the starting position.", icon: "gps_fixed", rarity: "uncommon" },
  { name: "castling", category: "tactic", label: "Castling", description: "King safety is secured by moving the king to safety.", icon: "castle", rarity: "common" },
  { name: "enPassant", category: "tactic", label: "En Passant", description: "A special pawn capture exploiting an opponent's double pawn push.", icon: "swap_horiz", rarity: "uncommon" },
  { name: "promotion", category: "tactic", label: "Promotion", description: "A pawn reaches the eighth rank and transforms into a stronger piece.", icon: "arrow_upward", rarity: "uncommon" },
  { name: "underPromotion", category: "tactic", label: "Underpromotion", description: "A pawn promotes to a knight, bishop, or rook instead of a queen.", icon: "swap_vert", rarity: "epic" },
  { name: "zugzwang", category: "tactic", label: "Zugzwang", description: "Any move worsens the position — the player is forced to lose.", icon: "block", rarity: "epic" },
  { name: "xRayAttack", category: "tactic", label: "X-Ray Attack", description: "A piece attacks through an enemy piece that appears to block it.", icon: "radar", rarity: "rare" },
  { name: "capturingDefender", category: "tactic", label: "Capturing Defender", description: "Removing the piece that defends another target.", icon: "person_remove", rarity: "uncommon" },
  { name: "kingsideAttack", category: "tactic", label: "Kingside Attack", description: "Offensive play directed at the opponent's kingside.", icon: "security", rarity: "common" },
  { name: "queensideAttack", category: "tactic", label: "Queenside Attack", description: "Offensive play directed at the opponent's queenside.", icon: "diamond", rarity: "common" },
  { name: "advancedPawn", category: "tactic", label: "Advanced Pawn", description: "A pawn that has pushed far into the opponent's territory.", icon: "arrow_upward", rarity: "uncommon" },
  { name: "defensiveMove", category: "tactic", label: "Defensive Move", description: "A precise defensive resource to hold the position.", icon: "shield", rarity: "uncommon" },
  { name: "advantage", category: "tactic", label: "Advantage", description: "A superior position with better piece activity or material.", icon: "trending_up", rarity: "common" },
  { name: "equality", category: "tactic", label: "Equality", description: "The position is balanced with chances for both sides.", icon: "balance", rarity: "common" },
  { name: "long", category: "tactic", label: "Long", description: "A calculation extending over many moves.", icon: "timeline", rarity: "uncommon" },
  { name: "veryLong", category: "tactic", label: "Very Long", description: "A deep calculation extending over many moves.", icon: "timeline", rarity: "rare" },
];

const PHASES: ThemeMeta[] = [
  { name: "opening", category: "phase", label: "Opening", description: "The puzzle features a tactical theme from the opening phase.", icon: "play_arrow", rarity: "common" },
  { name: "middlegame", category: "phase", label: "Middlegame", description: "A tactical battle from the middlegame.", icon: "sports_martial_arts", rarity: "common" },
  { name: "endgame", category: "phase", label: "Endgame", description: "A precise calculation from the endgame.", icon: "flag", rarity: "common" },
  { name: "bishopEndgame", category: "phase", label: "Bishop Endgame", description: "An endgame with bishops on the board.", icon: "church", rarity: "uncommon" },
  { name: "knightEndgame", category: "phase", label: "Knight Endgame", description: "An endgame with knights on the board.", icon: "sports_martial_arts", rarity: "uncommon" },
  { name: "rookEndgame", category: "phase", label: "Rook Endgame", description: "An endgame with rooks on the board.", icon: "shield", rarity: "uncommon" },
  { name: "pawnEndgame", category: "phase", label: "Pawn Endgame", description: "An endgame with only pawns remaining.", icon: "circle", rarity: "uncommon" },
  { name: "queenEndgame", category: "phase", label: "Queen Endgame", description: "An endgame with queens on the board.", icon: "diamond", rarity: "rare" },
  { name: "queenRookEndgame", category: "phase", label: "Queen & Rook Endgame", description: "An endgame with queens and rooks.", icon: "diamond", rarity: "rare" },
  { name: "short", category: "phase", label: "Short", description: "A short tactical sequence.", icon: "short_text", rarity: "common" },
  { name: "mate", category: "phase", label: "Mate", description: "Forcing checkmate in a few moves.", icon: "flag", rarity: "common" },
  { name: "mateIn1", category: "phase", label: "Mate in 1", description: "Deliver checkmate in one move.", icon: "flag", rarity: "common" },
  { name: "mateIn2", category: "phase", label: "Mate in 2", description: "Find the forced checkmate in two moves.", icon: "flag", rarity: "common" },
  { name: "mateIn3", category: "phase", label: "Mate in 3", description: "A forced checkmate sequence of three moves.", icon: "flag", rarity: "uncommon" },
  { name: "mateIn4", category: "phase", label: "Mate in 4", description: "A forced checkmate sequence of four moves.", icon: "flag", rarity: "rare" },
  { name: "mateIn5", category: "phase", label: "Mate in 5", description: "A forced checkmate sequence of five moves.", icon: "flag", rarity: "epic" },
  { name: "oneMove", category: "phase", label: "One Move", description: "A single decisive move.", icon: "touch_app", rarity: "common" },
  { name: "master", category: "phase", label: "Master", description: "A puzzle from master-level play.", icon: "workspace_premium", rarity: "uncommon" },
  { name: "masterVsMaster", category: "phase", label: "Master vs Master", description: "A puzzle from a game between two masters.", icon: "workspace_premium", rarity: "rare" },
  { name: "superGM", category: "phase", label: "Super GM", description: "A puzzle from top-tier grandmaster play.", icon: "workspace_premium", rarity: "epic" },
];

const ALL_THEMES = new Map<string, ThemeMeta>();
for (const meta of [...CHECKMATES, ...TACTICS, ...PHASES]) {
  ALL_THEMES.set(meta.name, meta);
}

/**
 * Pick the most significant theme from a puzzle's theme list.
 * Priority: Checkmates > Tactics > Phases
 * Within category: Rare themes get priority over common ones.
 */
export function pickTheme(themes: string[]): ThemeMeta {
  // Find all matching themes with their metadata
  const matches: ThemeMeta[] = [];
  
  for (const meta of [...CHECKMATES, ...TACTICS, ...PHASES]) {
    if (themes.includes(meta.name)) {
      matches.push(meta);
    }
  }
  
  if (matches.length === 0 && themes.length > 0) {
    // Fallback for unknown themes
    const fallback = themes[0];
    return {
      name: fallback,
      category: "phase",
      label: fallback.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
      description: `A puzzle featuring the ${fallback} theme.`,
      icon: "psychology",
      rarity: "common",
    };
  }
  
  if (matches.length === 0) {
    return {
      name: "unknown",
      category: "phase",
      label: "Puzzle",
      description: "A tactical chess puzzle.",
      icon: "psychology",
      rarity: "common",
    };
  }
  
  // Sort by category priority, then by rarity (rarer = better)
  matches.sort((a, b) => {
    const weightA = CATEGORY_WEIGHTS[a.category];
    const weightB = CATEGORY_WEIGHTS[b.category];
    
    if (weightA !== weightB) {
      return weightA - weightB; // Lower weight = higher priority
    }
    
    // Within same category, prefer rarer themes
    const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
    return (rarityOrder[a.rarity ?? "common"] ?? 4) - (rarityOrder[b.rarity ?? "common"] ?? 4);
  });
  
  return matches[0];
}

/**
 * Get all themes for a puzzle, sorted by priority
 */
export function getThemesByPriority(themes: string[]): ThemeMeta[] {
  const matches: ThemeMeta[] = [];
  
  for (const meta of [...CHECKMATES, ...TACTICS, ...PHASES]) {
    if (themes.includes(meta.name)) {
      matches.push(meta);
    }
  }
  
  // Add unknown themes
  for (const theme of themes) {
    if (!matches.find(m => m.name === theme)) {
      matches.push({
        name: theme,
        category: "phase",
        label: theme.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()),
        description: `A puzzle featuring the ${theme} theme.`,
        icon: "psychology",
        rarity: "common",
      });
    }
  }
  
  // Sort by priority
  matches.sort((a, b) => {
    const weightA = CATEGORY_WEIGHTS[a.category];
    const weightB = CATEGORY_WEIGHTS[b.category];
    
    if (weightA !== weightB) {
      return weightA - weightB;
    }
    
    const rarityOrder = { legendary: 0, epic: 1, rare: 2, uncommon: 3, common: 4 };
    return (rarityOrder[a.rarity ?? "common"] ?? 4) - (rarityOrder[b.rarity ?? "common"] ?? 4);
  });
  
  return matches;
}
