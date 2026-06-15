import type React from 'react';

export const boardTheme = {
  lightSquare: '#e1e1e1',
  darkSquare: '#8A909A',
  legalMove: 'rgba(0, 0, 0, 0.2)',
} as const;

export const legalMoveSquareStyle: React.CSSProperties = {
  background: `radial-gradient(circle, ${boardTheme.legalMove} 25%, transparent 25%)`,
};

export const captureSquareStyle: React.CSSProperties = {
  background: 'transparent',
  boxShadow: `inset 0 0 0 3px ${boardTheme.legalMove}`,
};
