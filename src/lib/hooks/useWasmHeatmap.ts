'use client';

import { useMemo, useEffect, useState, useRef } from 'react';
import { pieceContributions, explainPosition } from '@/lib/chess/wasm-analyzer';
import type { PieceContribution } from '@/lib/chess/wasm-analyzer';

export type WasmHeatmapKind =
  | 'threats'
  | 'king_safety'
  | 'mobility'
  | 'activity'
  | 'imbalance'
  | 'pins'
  | 'forks'
  | 'vulnerable';

export type WasmHeatmapConfig = {
  fen: string;
  enabled: WasmHeatmapKind[];
};

type TacticalItem = {
  origin?: string;
  squares: string[];
  targets: string[];
};

export function useWasmHeatmap({ fen, enabled }: WasmHeatmapConfig) {
  const [contributions, setContributions] = useState<PieceContribution[] | null>(null);
  const [explanation, setExplanation] = useState<Record<string, unknown> | null>(null);
  const prevFenRef = useRef(fen);

  useEffect(() => {
    if (fen === prevFenRef.current) return;
    prevFenRef.current = fen;

    let cancelled = false;

    async function load() {
      const [pc, exp] = await Promise.all([
        pieceContributions(fen),
        enabled.length > 0 ? explainPosition(fen) : null,
      ]);
      if (cancelled) return;
      if (pc) setContributions(pc);
      if (exp) setExplanation(exp);
    }
    load();

    return () => { cancelled = true; };
  }, [fen, enabled.length]);

  return useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    const arrows: { startSquare: string; endSquare: string; color: string }[] = [];

    if (!contributions || enabled.length === 0) return { styles, arrows };

    // ── Per-piece value heatmap ────────────────────────────────
    const hasValueKind = enabled.some(k =>
      ['threats', 'king_safety', 'mobility', 'activity', 'imbalance'].includes(k)
    );
    if (hasValueKind) {
      let maxVal = 0;
      const contributionsMap = new Map<string, PieceContribution>();
      for (const c of contributions) {
        contributionsMap.set(c.square, c);
        const total = Math.abs(c.value_cp);
        if (total > maxVal) maxVal = total;
      }
      if (maxVal > 0) {
        for (const c of contributions) {
          let val = 0;
          if (enabled.includes('threats')) val += c.threats;
          if (enabled.includes('king_safety')) val += c.king_safety;
          if (enabled.includes('mobility')) val += c.mobility;
          if (enabled.includes('imbalance')) val += c.imbalance;
          if (enabled.includes('activity')) val += c.value_cp - c.material;

          if (val !== 0) {
            const intensity = Math.min(Math.abs(val) / maxVal, 1);
            const r = val > 0 ? 0 : 255;
            const g = Math.round((1 - intensity) * 255);
            const b = val > 0 ? 0 : 255;
            styles[c.square] = {
              ...styles[c.square],
              backgroundColor: `rgba(${r},${g},${b},${intensity * 0.4})`,
            };
          }
        }
      }
    }

    // ── Tactical indicators from explanation ───────────────────
    if (explanation) {
      const extractItems = (key: string): TacticalItem[] => {
        const raw = explanation[key];
        if (!Array.isArray(raw)) return [];
        return raw.map((item: Record<string, unknown>) => ({
          origin: typeof item.origin === 'string' ? item.origin : undefined,
          squares: Array.isArray(item.squares) ? item.squares : typeof item.square === 'string' ? [item.square] : [],
          targets: Array.isArray(item.targets) ? item.targets : typeof item.target === 'string' ? [item.target] : [],
        }));
      };

      if (enabled.includes('pins')) {
        const pins = extractItems('pins');
        for (const pin of pins) {
          if (pin.origin) styles[pin.origin] = { ...styles[pin.origin], boxShadow: 'inset 0 0 30px orange' };
          for (const sq of pin.squares) styles[sq] = { ...styles[sq], border: '3px solid orange' };
          for (const sq of pin.targets) styles[sq] = { ...styles[sq], boxShadow: 'inset 0 0 15px orange' };
          for (const sq of pin.squares)
            for (const t of pin.targets)
              arrows.push({ startSquare: sq, endSquare: t, color: 'orange' });
        }
      }

      if (enabled.includes('forks')) {
        const forks = extractItems('forks');
        for (const fork of forks) {
          if (fork.origin) styles[fork.origin] = { ...styles[fork.origin], boxShadow: '0 0 10px cyan' };
          for (const sq of fork.squares) styles[sq] = { ...styles[sq], border: '3px solid cyan' };
          for (const sq of fork.targets) styles[sq] = { ...styles[sq], boxShadow: 'inset 0 0 20px cyan' };
          for (const sq of fork.squares)
            for (const t of fork.targets)
              arrows.push({ startSquare: sq, endSquare: t, color: 'cyan' });
        }
      }

      if (enabled.includes('vulnerable')) {
        const hanging = extractItems('hanging');
        const trapped = extractItems('trapped_pieces');
        const overloaded = extractItems('overloaded');
        const allVuln = [...hanging, ...trapped, ...overloaded];
        for (const v of allVuln) {
          for (const sq of v.squares)
            styles[sq] = { ...styles[sq], boxShadow: 'inset 0 0 30px rgba(255,0,0,0.7)' };
          for (const sq of v.targets)
            styles[sq] = { ...styles[sq], boxShadow: 'inset 0 0 30px black' };
        }
      }
    }

    return { styles, arrows };
  }, [contributions, explanation, enabled]);
}
