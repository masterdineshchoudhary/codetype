/**
 * CodeType Keybr MasteryBar Component
 * Renders the progressive alphabet unlock status, target key, and confidence levels.
 */

'use client';

import React from 'react';
import type { KeybrMasteryState } from '../../types/typing';
import { KEYBR_ALPHABET_SEQUENCE } from '../../lib/algorithms/masteryAlgorithm.ts';
import { Award, Lock, Unlock } from 'lucide-react';

export interface MasteryBarProps {
  masteryState: KeybrMasteryState;
}

export function MasteryBar({ masteryState }: MasteryBarProps) {
  const { unlockedKeys, currentKey, keyConfidences, overallMastery } = masteryState;
  const unlockedSet = new Set(unlockedKeys);

  const getKeyBadgeStyle = (char: string) => {
    if (!unlockedSet.has(char)) {
      return 'bg-[var(--bg)] text-[var(--text-dim)] border-[var(--border-subtle)] opacity-35';
    }

    const conf = keyConfidences[char] ?? 0;
    const isTarget = char === currentKey;

    if (isTarget) {
      return 'bg-amber-950/60 text-amber-300 border-amber-500 font-bold shadow-[0_0_8px_rgba(226,183,20,0.4)] animate-pulse';
    }

    if (conf >= 0.85) {
      return 'bg-emerald-950/40 text-emerald-300 border-emerald-600/60 font-medium';
    } else if (conf >= 0.70) {
      return 'bg-amber-950/30 text-amber-300 border-amber-600/40';
    } else {
      return 'bg-[var(--surface-hover)] text-[var(--text-dim)] border-[var(--border-subtle)]';
    }
  };

  const targetConf = Math.round((keyConfidences[currentKey] ?? 0) * 100);

  return (
    <div className="flex flex-col w-full max-w-4xl p-3 mb-4 glass-card rounded-2xl font-mono text-xs select-none shadow-lg transition-all">
      {/* Top Header: Target key & percentage */}
      <div className="flex items-center justify-between w-full mb-2 px-1">
        <div className="flex items-center gap-2">
          <Unlock className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] font-semibold">
            Letter Unlock:
          </span>
          <span className="text-[11px] text-[var(--text-dim)]">
            Target{' '}
            <span className="px-1.5 py-0.2 rounded-md bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-[var(--accent)] font-bold uppercase">
              {currentKey}
            </span>{' '}
            ({targetConf}%)
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-dim)]">
          <Award className="w-3 h-3 text-emerald-400" />
          <span>
            {unlockedKeys.length} / {KEYBR_ALPHABET_SEQUENCE.length} ({overallMastery}%)
          </span>
        </div>
      </div>

      {/* Sequential Letter Track */}
      <div className="flex flex-wrap items-center gap-1 justify-center sm:justify-start">
        {KEYBR_ALPHABET_SEQUENCE.map((char, idx) => {
          const isUnlocked = unlockedSet.has(char);
          const conf = Math.round((keyConfidences[char] ?? 0) * 100);
          return (
            <div
              key={char}
              title={
                isUnlocked
                  ? `${char.toUpperCase()}: ${conf}% confidence`
                  : `Locked (Key #${idx + 1})`
              }
              className={`w-6 h-6 flex items-center justify-center rounded-md border text-[11px] font-semibold uppercase transition-all cursor-default relative ${getKeyBadgeStyle(
                char
              )}`}
            >
              <span>{char}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

