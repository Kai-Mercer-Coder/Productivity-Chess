/**
 * Premove validation utilities extracted and adapted from SwiftChess.
 * Pattern-based pseudo-legal move generation for premove highlights.
 * Does NOT check for pins, blockers, or check — intentionally lightweight.
 */

function fileRank(square: string): { file: number; rank: number } {
  return { file: square.charCodeAt(0) - 97, rank: Number(square[1]) };
}

function toSquare(file: number, rank: number): string | null {
  if (file < 0 || file > 7 || rank < 1 || rank > 8) return null;
  return `${String.fromCharCode(97 + file)}${rank}`;
}

function addSquare(targets: Set<string>, file: number, rank: number) {
  const sq = toSquare(file, rank);
  if (sq) targets.add(sq);
}

/**
 * Generate pseudo-legal target squares for a piece, ignoring blockers.
 * Respects castling rights for king moves.
 */
export function getRelaxedPremoveTargets(
  pieces: Record<string, string>,
  square: string,
  castlingRights: string = "-",
): string[] {
  const piece = pieces[square];
  if (!piece) return [];

  const color = piece[0];
  const type = piece[1].toUpperCase();
  const { file, rank } = fileRank(square);
  const targets = new Set<string>();

  if (type === "P") {
    const dir = color === "w" ? 1 : -1;
    const startRank = color === "w" ? 2 : 7;
    addSquare(targets, file, rank + dir);
    if (rank === startRank) addSquare(targets, file, rank + dir * 2);
    addSquare(targets, file - 1, rank + dir);
    addSquare(targets, file + 1, rank + dir);
  }

  if (type === "N") {
    for (const [df, dr] of [[1,2],[2,1],[2,-1],[1,-2],[-1,-2],[-2,-1],[-2,1],[-1,2]]) {
      addSquare(targets, file + df, rank + dr);
    }
  }

  if (type === "B" || type === "R" || type === "Q") {
    const dirs: [number, number][] = [];
    if (type === "B" || type === "Q") dirs.push([1,1],[1,-1],[-1,-1],[-1,1]);
    if (type === "R" || type === "Q") dirs.push([1,0],[-1,0],[0,1],[0,-1]);
    for (const [df, dr] of dirs) {
      let f = file + df, r = rank + dr;
      while (f >= 0 && f <= 7 && r >= 1 && r <= 8) {
        addSquare(targets, f, r);
        f += df;
        r += dr;
      }
    }
  }

  if (type === "K") {
    for (let df = -1; df <= 1; df++) {
      for (let dr = -1; dr <= 1; dr++) {
        if (df === 0 && dr === 0) continue;
        addSquare(targets, file + df, rank + dr);
      }
    }
    if (color === "w" && square === "e1") {
      if (castlingRights.includes("K")) targets.add("g1");
      if (castlingRights.includes("Q")) targets.add("c1");
    }
    if (color === "b" && square === "e8") {
      if (castlingRights.includes("k")) targets.add("g8");
      if (castlingRights.includes("q")) targets.add("c8");
    }
  }

  targets.delete(square);
  return Array.from(targets);
}

function stripCastlingRights(rights: string, keys: string[]): string {
  let result = rights === "-" ? "" : rights;
  for (const k of keys) result = result.replace(k, "");
  return result || "-";
}

/**
 * Simulate a premove on a piece map. Returns new pieces + castling rights,
 * or null if the move is illegal in the preview state.
 */
export function simulatePremove(
  pieces: Record<string, string>,
  castlingRights: string,
  from: string,
  to: string,
  color: string,
  promotion?: string,
): { pieces: Record<string, string>; castlingRights: string } | null {
  const piece = pieces[from];
  if (!piece || piece[0] !== color) return null;
  if (!getRelaxedPremoveTargets(pieces, from, castlingRights).includes(to)) return null;

  const newPieces = { ...pieces };
  let newRights = castlingRights;

  const type = piece[1].toUpperCase();
  const fromFile = from.charCodeAt(0);
  const toFile = to.charCodeAt(0);

  if (type === "K") {
    if (color === "w") newRights = stripCastlingRights(newRights, ["K", "Q"]);
    else newRights = stripCastlingRights(newRights, ["k", "q"]);
  }
  if (type === "R") {
    if (from === "h1") newRights = stripCastlingRights(newRights, ["K"]);
    if (from === "a1") newRights = stripCastlingRights(newRights, ["Q"]);
    if (from === "h8") newRights = stripCastlingRights(newRights, ["k"]);
    if (from === "a8") newRights = stripCastlingRights(newRights, ["q"]);
  }

  if (to === "h1") newRights = stripCastlingRights(newRights, ["K"]);
  if (to === "a1") newRights = stripCastlingRights(newRights, ["Q"]);
  if (to === "h8") newRights = stripCastlingRights(newRights, ["k"]);
  if (to === "a8") newRights = stripCastlingRights(newRights, ["q"]);

  let placed = type === "P" && promotion ? `${color}${promotion.toUpperCase()}` : piece;
  delete newPieces[from];
  newPieces[to] = placed;

  if (type === "K" && Math.abs(toFile - fromFile) === 2) {
    if (from === "e1" && to === "g1" && newPieces["h1"] === "wR") { delete newPieces["h1"]; newPieces["f1"] = "wR"; }
    if (from === "e1" && to === "c1" && newPieces["a1"] === "wR") { delete newPieces["a1"]; newPieces["d1"] = "wR"; }
    if (from === "e8" && to === "g8" && newPieces["h8"] === "bR") { delete newPieces["h8"]; newPieces["f8"] = "bR"; }
    if (from === "e8" && to === "c8" && newPieces["a8"] === "bR") { delete newPieces["a8"]; newPieces["d8"] = "bR"; }
  }

  return { pieces: newPieces, castlingRights: newRights };
}
