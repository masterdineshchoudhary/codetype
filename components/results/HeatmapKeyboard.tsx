/**
 * CodeType HeatmapKeyboard Component
 * Visual interactive keyboard heatmap illustrating character error rate and latency.
 */

'use client';

import React from 'react';
import type { HeatmapData } from '../../types/typing';

export interface HeatmapKeyboardProps {
  heatmap: HeatmapData;
}

const KEYBOARD_ROWS = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
];

export function HeatmapKeyboard({ heatmap }: HeatmapKeyboardProps) {
  const getKeyColor = (key: string): string => {
    const data = heatmap[key] || heatmap[key.toUpperCase()] || heatmap[key.toLowerCase()];
    if (!data || data.totalAttempts === 0) {
      return 'bg-[var(--surface)] text-[var(--text-dim)] border-[var(--border-subtle)]';
    }

    if (data.errorRate > 15) {
      return 'bg-red-950/50 text-red-400 border-red-700/60';
    } else if (data.errorRate > 5) {
      return 'bg-amber-950/40 text-amber-300 border-amber-600/50';
    } else if (data.confidence > 0.8) {
      return 'bg-emerald-950/40 text-emerald-300 border-emerald-600/50';
    }

    return 'bg-[var(--surface-hover)] text-[var(--text-bright)] border-[var(--border-subtle)]';
  };

  return (
    <div className="flex flex-col items-center gap-1.5 p-4 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-xl font-mono text-xs select-none">
      <div className="flex items-center justify-between w-full mb-2 px-1 text-[11px] text-[var(--text-dim)]">
        <span>WEAK-KEY HEATMAP</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-950/60 border border-emerald-600/50" />
            Accurate
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-950/60 border border-amber-600/50" />
            Moderate
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-950/60 border border-red-700/60" />
            Weak Key (&gt;15%)
          </span>
        </div>
      </div>

      {KEYBOARD_ROWS.map((row, rIdx) => (
        <div key={rIdx} className="flex gap-1.5">
          {row.map((key) => {
            const data = heatmap[key] || heatmap[key.toLowerCase()];
            const errRate = data ? `${data.errorRate}% err` : 'Untracked';
            const latency = data ? `${data.averageLatencyMs}ms` : '';

            return (
              <div
                key={key}
                title={`${key.toUpperCase()}: ${errRate} ${latency}`}
                className={`w-7 h-8 flex items-center justify-center rounded border transition-colors cursor-default ${getKeyColor(
                  key
                )}`}
              >
                <span className="font-semibold">{key}</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

