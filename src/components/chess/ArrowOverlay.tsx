"use client";

import { useMemo } from "react";
import { buildArrowShape } from "@/lib/chess/arrows";

export interface ArrowData {
  from: string;
  to: string;
  color?: string;
  opacity?: number;
  widthScale?: number;
}

interface ArrowOverlayProps {
  arrows: ArrowData[];
  squareSize: number;
  flipped?: boolean;
  className?: string;
}

export function ArrowOverlay({
  arrows,
  squareSize,
  flipped = false,
  className,
}: ArrowOverlayProps) {
  const rendered = useMemo(() => {
    return arrows
      .map((arrow) => {
        const shape = buildArrowShape(
          arrow.from,
          arrow.to,
          squareSize,
          squareSize,
          flipped,
        );
        if (!shape) return null;
        return {
          key: `${arrow.from}${arrow.to}`,
          ...shape,
          color: arrow.color ?? "#15781B",
          opacity: arrow.opacity ?? 0.6,
          widthScale: arrow.widthScale ?? 1 / 5,
        };
      })
      .filter(Boolean);
  }, [arrows, squareSize, flipped]);

  if (rendered.length === 0) return null;

  const boardSize = squareSize * 8;

  return (
    <svg
      viewBox={`0 0 ${boardSize} ${boardSize}`}
      className={className}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 5,
      }}
    >
      {rendered.map((r) => {
        if (!r) return null;
        const strokeW = squareSize * (r.widthScale ?? 1 / 5);
        return (
          <g key={r.key} opacity={r.opacity}>
            <path
              d={r.shaftD}
              stroke={r.color}
              strokeWidth={strokeW}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <polygon points={r.headPoints} fill={r.color} />
          </g>
        );
      })}
    </svg>
  );
}
