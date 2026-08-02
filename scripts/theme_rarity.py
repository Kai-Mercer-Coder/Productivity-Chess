"""
Theme Rarity Calculator for Productivity-Chess
Analyzes puzzle database to calculate theme frequencies and rarity tiers.
"""

import json
import csv
import os
from collections import Counter
from pathlib import Path

# Theme categories with priority weights
CATEGORY_WEIGHTS = {
    "checkmate": 1.0,    # Highest priority - specific mating patterns
    "tactic": 0.7,       # Medium priority - tactical themes
    "phase": 0.3,        # Lowest priority - game phases
}

# Rarity tiers based on frequency percentiles
RARITY_TIERS = {
    "legendary": {"max_pct": 1, "color": "#FFD700", "label": "Legendary"},
    "epic": {"max_pct": 5, "color": "#A855F7", "label": "Epic"},
    "rare": {"max_pct": 15, "color": "#3B82F6", "label": "Rare"},
    "uncommon": {"max_pct": 35, "color": "#22C55E", "label": "Uncommon"},
    "common": {"max_pct": 100, "color": "#71717A", "label": "Common"},
}

def calculate_rarity(themes_file: str, output_file: str):
    """Calculate theme rarity from puzzle themes data."""
    
    # Load themes
    with open(themes_file, 'r') as f:
        themes_data = json.load(f)
    
    # Count theme occurrences
    theme_counts = Counter()
    total_puzzles = len(themes_data)
    
    for puzzle in themes_data:
        for theme in puzzle.get('themes', []):
            theme_counts[theme] += 1
    
    # Calculate frequencies and assign rarity
    theme_rarity = {}
    for theme, count in theme_counts.items():
        frequency = (count / total_puzzles) * 100
        
        # Determine rarity tier
        rarity = "common"
        for tier, config in RARITY_TIERS.items():
            if frequency <= config["max_pct"]:
                rarity = tier
                break
        
        # Get category
        category = "phase"
        if theme in CHECKMATES:
            category = "checkmate"
        elif theme in TACTICS:
            category = "tactic"
        
        theme_rarity[theme] = {
            "count": count,
            "frequency": round(frequency, 2),
            "rarity": rarity,
            "category": category,
            "weight": CATEGORY_WEIGHTS[category],
            "priority_score": round(frequency * CATEGORY_WEIGHTS[category], 4)
        }
    
    # Sort by priority score (lower = more important)
    sorted_themes = sorted(
        theme_rarity.items(),
        key=lambda x: (x[1]["priority_score"], -x[1]["weight"])
    )
    
    # Save output
    output = {
        "total_puzzles": total_puzzles,
        "theme_stats": dict(sorted_themes),
        "rarity_tiers": RARITY_TIERS
    }
    
    with open(output_file, 'w') as f:
        json.dump(output, f, indent=2)
    
    print(f"Calculated rarity for {len(theme_rarity)} themes")
    print(f"Total puzzles analyzed: {total_puzzles}")
    print("\nTop 10 rarest themes:")
    for theme, stats in sorted_themes[:10]:
        print(f"  {theme}: {stats['rarity']} ({stats['frequency']}%)")
    
    return output

# Theme lists for categorization
CHECKMATES = [
    "smotheredMate", "backRankMate", "anastasiaMate", "arabianMate",
    "balestraMate", "blindSwineMate", "bodenMate", "cornerMate",
    "doubleBishopMate", "dovetailMate", "hookMate", "killBoxMate",
    "morphysMate", "operaMate", "pillsburysMate", "triangleMate", "vukovicMate"
]

TACTICS = [
    "crushing", "sacrifice", "fork", "pin", "skewer", "deflection",
    "discoveredAttack", "discoveredCheck", "doubleCheck", "attraction",
    "trappedPiece", "exposedKing", "hangingPiece", "clearance",
    "interference", "intermezzo", "quietMove", "attackingF2F7",
    "castling", "enPassant", "promotion", "underPromotion", "zugzwang",
    "xRayAttack", "capturingDefender", "kingsideAttack", "queensideAttack",
    "advancedPawn", "defensiveMove", "advantage", "equality", "long", "veryLong"
]

if __name__ == "__main__":
    # Example usage
    themes_file = "data/puzzle_themes.json"
    output_file = "data/theme_rarity.json"
    
    if os.path.exists(themes_file):
        calculate_rarity(themes_file, output_file)
    else:
        print(f"Theme file not found: {themes_file}")
        print("Please provide puzzle theme data to calculate rarity.")
