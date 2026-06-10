export enum Classification {
  BRILLIANT = "brilliant",
  GREAT = "great",
  BEST = "best",
  EXCELLENT = "excellent",
  GOOD = "good",
  INACCURACY = "inaccuracy",
  MISTAKE = "mistake",
  BLUNDER = "blunder",
  BOOK = "book",
  FORCED = "forced",
  MISS = "miss",
  CRITICAL = "critical",
  THEORY = "theory",
  RISKY = "risky",
}

export interface ClassificationCount extends Record<Classification, number> {}
