import type React from 'react';

export const boardTheme = {
  lightSquare: '#e1e1e1',
  darkSquare: '#8A909A',
  legalMove: 'rgba(0, 0, 0, 0.32)',
  legalMoveDot: 'rgba(0, 0, 0, 0.35)',
} as const;

export const legalMoveSquareStyle: React.CSSProperties = {
  background: `radial-gradient(circle at center, ${boardTheme.legalMoveDot} 26%, transparent 26%)`,
};

export const captureSquareStyle: React.CSSProperties = {
  background: 'transparent',
  boxShadow: `inset 0 0 0 3px rgba(0,0,0,0.4)`,
};
