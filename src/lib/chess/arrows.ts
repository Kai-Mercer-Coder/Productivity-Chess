/**
 * Arrow geometry utilities extracted and adapted from SwiftChess.
 * Pure math functions for computing SVG arrow paths on a chessboard.
 */

interface Point {
  x: number;
  y: number;
}

interface SquareCoords {
  col: number;
  row: number;
}

interface ArrowShape {
  shaftD: string;
  headPoints: string;
}

/**
 * Convert algebraic square notation to pixel coordinates.
 * @param square - e.g. "e4"
 * @param squareSize - size of each square in pixels
 * @param flipped - whether the board is flipped (black at bottom)
 */
export function squareToPixel(
  square: string,
  squareSize: number,
  flipped = false,
): SquareCoords {
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]);
  if (flipped) {
    return { col: 7 - file, row: rank - 1 };
  }
  return { col: file, row: 8 - rank };
}

/**
 * Get pixel coordinates for arrow endpoints from two squares.
 */
export function getArrowPoints(
  from: string,
  to: string,
  squareSize: number,
  flipped = false,
): { x1: number; y1: number; x2: number; y2: number } {
  const a = squareToPixel(from, squareSize, flipped);
  const b = squareToPixel(to, squareSize, flipped);
  return {
    x1: a.col * squareSize + squareSize / 2,
    y1: a.row * squareSize + squareSize / 2,
    x2: b.col * squareSize + squareSize / 2,
    y2: b.row * squareSize + squareSize / 2,
  };
}

function ptStr(p: Point): string {
  return `${p.x},${p.y}`;
}

/**
 * Compute arrowhead polygon points given tip and base center.
 */
function buildArrowHead(
  tip: Point,
  baseCenter: Point,
  size: number,
): { baseCenter: Point; points: string } | null {
  const dx = tip.x - baseCenter.x;
  const dy = tip.y - baseCenter.y;
  const dist = Math.hypot(dx, dy);
  if (dist === 0) return null;

  const ux = dx / dist;
  const uy = dy / dist;
  const px = -uy;
  const py = ux;

  const baseLen = Math.min(size * 0.5, dist * 0.68);
  const width = Math.min(size * 0.68, baseLen * 1.4);

  const base = {
    x: tip.x - ux * baseLen,
    y: tip.y - uy * baseLen,
  };
  const left = {
    x: base.x + (px * width) / 2,
    y: base.y + (py * width) / 2,
  };
  const right = {
    x: base.x - (px * width) / 2,
    y: base.y - (py * width) / 2,
  };

  return {
    baseCenter: base,
    points: `${ptStr(left)} ${ptStr(tip)} ${ptStr(right)}`,
  };
}

/**
 * Build a complete arrow shape (shaft path + head polygon) between two squares.
 * @param from - source square (e.g. "e2")
 * @param to - target square (e.g. "e4")
 * @param squareSize - pixel size of each square
 * @param headSize - pixel size of the arrowhead
 * @param flipped - whether the board is flipped
 */
export function buildArrowShape(
  from: string,
  to: string,
  squareSize: number,
  headSize: number,
  flipped = false,
): ArrowShape | null {
  const { x1, y1, x2, y2 } = getArrowPoints(from, to, squareSize, flipped);
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  if (dist === 0) return null;

  const shaftLen = Math.hypot(1, 2) * squareSize;
  const tip: Point = { x: x1, y: y1 };
  const head: Point = { x: x2, y: y2 };

  const shorten = (p: Point, ref: Point, amount: number): Point => {
    const ddx = p.x - ref.x;
    const ddy = p.y - ref.y;
    const d = Math.hypot(ddx, ddy);
    if (d === 0) return p;
    const clamp = Math.min(Math.max(amount, 0), d * 0.8);
    return { x: p.x - (ddx / d) * clamp, y: p.y - (ddy / d) * clamp };
  };

  if (Math.round(dist) === Math.round(shaftLen)) {
    const corner: Point =
      Math.abs(dx) < Math.abs(dy)
        ? { x: x1, y: y2 }
        : { x: x2, y: y1 };
    const shortTip = shorten(head, corner, headSize * 0.3);
    const hd = buildArrowHead(shortTip, corner, squareSize);
    return hd
      ? {
          shaftD: `M${tip.x},${tip.y} L${corner.x},${corner.y} L${hd.baseCenter.x},${hd.baseCenter.y}`,
          headPoints: hd.points,
        }
      : null;
  }

  const shortTip = shorten(head, tip, headSize * 0.3);
  const hd = buildArrowHead(shortTip, tip, squareSize);
  return hd
    ? {
        shaftD: `M${tip.x},${tip.y} L${hd.baseCenter.x},${hd.baseCenter.y}`,
        headPoints: hd.points,
      }
    : null;
}
