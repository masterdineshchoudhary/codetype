/**
 * CodeType Keybr MasteryBar Component
 * Renders the progressive alphabet unlock status, target key, and confidence levels.
 */

'use client';

import React from 'react';
import type { KeybrMasteryState } from '../../types/typing';
import { KEYBR_ALPHABET_SEQUENCE } from '../../lib/algorithms/masteryAlgorithm.ts';
import { Award, Lock, Sparkles } from 'lucide-react';

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
    <div className="flex flex-col w-full max-w-4xl p-3.5 mb-5 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-xl font-mono text-xs select-none shadow-sm transition-all">
      {/* Top Header: Target key & percentage */}
      <div className="flex items-center justify-between w-full mb-2.5 px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span className="text-[11px] font-semibold text-[var(--text-bright)]">
            KEYBR PROGRESSION:
          </span>
          <span className="text-[11px] text-[var(--text-dim)]">
            Target Key{' '}
            <span className="px-1.5 py-0.5 rounded bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-[var(--accent)] font-bold uppercase">
              {currentKey}
            </span>{' '}
            ({targetConf}% confidence)
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-[var(--text-dim)]">
          <Award className="w-3.5 h-3.5 text-emerald-400" />
          <span>
            {unlockedKeys.length} / {KEYBR_ALPHABET_SEQUENCE.length} keys ({overallMastery}%)
          </span>
        </div>
      </div>

      {/* Sequential Letter Grid */}
      <div className="flex flex-wrap items-center gap-1.5 justify-start">
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
              className={`w-6 h-7 flex items-center justify-center rounded border text-xs uppercase transition-all cursor-default relative ${getKeyBadgeStyle(
                char
              )}`}
            >
              <span>{char}</span>
              {!isUnlocked && (
                <Lock className="w-2 h-2 text-[var(--text-dim)] absolute bottom-0.5 right-0.5" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
