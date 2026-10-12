/**
 * CodeType KeyboardMap Component
 * Visual, interactive on-screen keyboard map.
 * Features:
 * - Real-time next expected key illumination (using zero text-tree re-render subscription)
 * - Real-time physical keypress highlight feedback
 * - Keybr sequential unlocking support (dimmed locked keys vs bright unlocked keys)
 * - Adaptive weak-key heatmap integration
 */

'use client';

import React, { useEffect, useState } from 'react';
import type { HeatmapData } from '../../types/typing';

export interface KeyboardMapProps {
  subscribeActiveChar?: (listener: (char: string) => void) => () => void;
  unlockedKeys?: string[];
  isKeybrMode?: boolean;
  heatmap?: HeatmapData;
  className?: string;
}

interface KeyDef {
  key: string;
  display?: string;
  shiftKey?: string;
  width?: string; // flex grow or fixed width class
  isSpecial?: boolean;
}

const KEYBOARD_LAYOUT: KeyDef[][] = [
  // Row 1: Numbers & Symbols
  [
    { key: '`', shiftKey: '~' },
    { key: '1', shiftKey: '!' },
    { key: '2', shiftKey: '@' },
    { key: '3', shiftKey: '#' },
    { key: '4', shiftKey: '$' },
    { key: '5', shiftKey: '%' },
    { key: '6', shiftKey: '^' },
    { key: '7', shiftKey: '&' },
    { key: '8', shiftKey: '*' },
    { key: '9', shiftKey: '(' },
    { key: '0', shiftKey: ')' },
    { key: '-', shiftKey: '_' },
    { key: '=', shiftKey: '+' },
    { key: 'Backspace', display: '⌫', width: 'w-14 sm:w-16', isSpecial: true },
  ],
  // Row 2: Top Alpha
  [
    { key: 'Tab', display: 'tab', width: 'w-11 sm:w-14', isSpecial: true },
    { key: 'q' },
    { key: 'w' },
    { key: 'e' },
    { key: 'r' },
    { key: 't' },
    { key: 'y' },
    { key: 'u' },
    { key: 'i' },
    { key: 'o' },
    { key: 'p' },
    { key: '[', shiftKey: '{' },
    { key: ']', shiftKey: '}' },
    { key: '\\', shiftKey: '|', width: 'w-11 sm:w-14' },
  ],
  // Row 3: Home Row
  [
    { key: 'CapsLock', display: 'caps', width: 'w-14 sm:w-16', isSpecial: true },
    { key: 'a' },
    { key: 's' },
    { key: 'd' },
    { key: 'f' },
    { key: 'g' },
    { key: 'h' },
    { key: 'j' },
    { key: 'k' },
    { key: 'l' },
    { key: ';', shiftKey: ':' },
    { key: "'", shiftKey: '"' },
    { key: 'Enter', display: 'return', width: 'w-14 sm:w-18', isSpecial: true },
  ],
  // Row 4: Bottom Alpha
  [
    { key: 'ShiftLeft', display: 'shift', width: 'w-16 sm:w-20', isSpecial: true },
    { key: 'z' },
    { key: 'x' },
    { key: 'c' },
    { key: 'v' },
    { key: 'b' },
    { key: 'n' },
    { key: 'm' },
    { key: ',', shiftKey: '<' },
    { key: '.', shiftKey: '>' },
    { key: '/', shiftKey: '?' },
    { key: 'ShiftRight', display: 'shift', width: 'w-16 sm:w-20', isSpecial: true },
  ],
  // Row 5: Spacebar & Modifiers
  [
    { key: 'Control', display: 'ctrl', width: 'w-12 sm:w-14', isSpecial: true },
    { key: 'Alt', display: 'alt', width: 'w-12 sm:w-14', isSpecial: true },
    { key: ' ', display: 'space', width: 'flex-1 max-w-sm sm:max-w-md' },
    { key: 'Alt', display: 'alt', width: 'w-12 sm:w-14', isSpecial: true },
    { key: 'Control', display: 'ctrl', width: 'w-12 sm:w-14', isSpecial: true },
  ],
];

export function KeyboardMap({
  subscribeActiveChar,
  unlockedKeys,
  isKeybrMode = false,
  heatmap,
  className = '',
}: KeyboardMapProps) {
  const [activeExpectedChar, setActiveExpectedChar] = useState<string>('');
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  // Subscribe to live next character updates
  useEffect(() => {
    if (!subscribeActiveChar) return;
    const unsubscribe = subscribeActiveChar((char) => {
      setActiveExpectedChar(char);
    });
    return unsubscribe;
  }, [subscribeActiveChar]);

  // Track physical keypresses for tactile visual illumination
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setPressedKey(' ');
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        setPressedKey(e.code);
      } else {
        setPressedKey(e.key.toLowerCase());
      }
    };

    const handleKeyUp = () => {
      setPressedKey(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const unlockedSet = React.useMemo(() => {
    if (!unlockedKeys) return null;
    return new Set(unlockedKeys.map((k) => k.toLowerCase()));
  }, [unlockedKeys]);

  // Helper to determine whether a keycap matches the expected target char
  const isKeyActiveNext = (keyDef: KeyDef): boolean => {
    if (!activeExpectedChar) return false;

    if (activeExpectedChar === ' ' && keyDef.key === ' ') {
      return true;
    }

    if (keyDef.key.toLowerCase() === activeExpectedChar.toLowerCase()) {
      return true;
    }

    if (keyDef.shiftKey && keyDef.shiftKey === activeExpectedChar) {
      return true;
    }

    // If expected character is an uppercase letter or shifted symbol, highlight shift as well
    if (
      (keyDef.key === 'ShiftLeft' || keyDef.key === 'ShiftRight') &&
      activeExpectedChar.length === 1 &&
      ((activeExpectedChar >= 'A' && activeExpectedChar <= 'Z') ||
        '~!@#$%^&*()_+{}|:"<>?'.includes(activeExpectedChar))
    ) {
      return true;
    }

    return false;
  };

  // Helper to determine if key is currently physically pressed
  const isKeyPressed = (keyDef: KeyDef): boolean => {
    if (!pressedKey) return false;
    if (keyDef.key === ' ' && pressedKey === ' ') return true;
    if (keyDef.key === pressedKey) return true;
    if (keyDef.key.toLowerCase() === pressedKey) return true;
    if (keyDef.shiftKey && keyDef.shiftKey.toLowerCase() === pressedKey) return true;
    return false;
  };

  // Helper to get heat color
  const getHeatmapBorder = (keyDef: KeyDef): string => {
    if (!heatmap || keyDef.isSpecial) return '';
    const char = keyDef.key.toLowerCase();
    const data = heatmap[char];
    if (!data || data.totalAttempts === 0) return '';

    if (data.errorRate > 15) {
      return 'border-red-500/80 text-red-300';
    } else if (data.errorRate > 5) {
      return 'border-amber-500/70 text-amber-300';
    } else if (data.confidence > 0.8) {
      return 'border-emerald-500/60 text-emerald-300';
    }
    return '';
  };

  return (
    <div
      className={`flex flex-col items-center gap-2 p-4 glass-card rounded-2xl font-mono select-none shadow-2xl transition-all duration-300 ${className}`}
    >
      {/* Header bar / Legend */}
      <div className="flex items-center justify-between w-full max-w-2xl px-1 text-[10px] text-[var(--text-dim)] tracking-wider">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[var(--text-bright)] opacity-90 uppercase">
            Keyboard Map
          </span>
          {isKeybrMode && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-950/40 border border-amber-600/30 text-amber-300 text-[9px]">
              Keybr Mode
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
            Next
          </span>
          {isKeybrMode && (
            <span className="flex items-center gap-1 text-[var(--text-dim)] opacity-50">
              <span className="w-1.5 h-1.5 rounded-sm bg-zinc-700/50" />
              Locked
            </span>
          )}
          {heatmap && (
            <span className="flex items-center gap-1 text-red-400">
              <span className="w-1.5 h-1.5 rounded-sm bg-red-800" />
              Weak
            </span>
          )}
        </div>
      </div>

      {/* Keyboard Matrix */}
      <div className="flex flex-col gap-1 w-full max-w-2xl pt-1">
        {KEYBOARD_LAYOUT.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1 w-full">
            {row.map((kDef, kIdx) => {
              const active = isKeyActiveNext(kDef);
              const pressed = isKeyPressed(kDef);
              const heatClass = getHeatmapBorder(kDef);

              // Keybr lock checking: alpha keys only
              const isAlpha = kDef.key.length === 1 && /^[a-z]$/i.test(kDef.key);
              const isLocked =
                isKeybrMode && isAlpha && unlockedSet && !unlockedSet.has(kDef.key.toLowerCase());

              const widthClass = kDef.width || 'w-7 sm:w-9';

              return (
                <div
                  key={`${rIdx}-${kIdx}`}
                  className={`relative h-8 sm:h-9 flex flex-col items-center justify-center rounded-lg border text-xs transition-all duration-100 ease-out ${widthClass} ${
                    pressed
                      ? 'bg-[var(--accent)] text-black font-extrabold scale-[0.92] shadow-inner border-[var(--accent)]'
                      : active
                      ? 'bg-[var(--surface-hover)] text-[var(--text-bright)] border-[var(--accent)] ring-1 ring-[var(--accent)]/40 shadow-[0_0_12px_rgba(226,183,20,0.25)] font-bold'
                      : isLocked
                      ? 'bg-[var(--bg)]/40 text-[var(--text-dim)] opacity-25 border-transparent'
                      : heatClass
                      ? `bg-[var(--surface)] ${heatClass}`
                      : 'bg-[var(--surface)]/70 text-[var(--text-dim)] hover:text-[var(--text-bright)] border-[var(--border-subtle)]/40 hover:border-[var(--border-subtle)]'
                  }`}
                >
                  {/* Shifted symbol on top */}
                  {kDef.shiftKey && (
                    <span className="text-[8px] opacity-50 leading-none -mt-0.5">
                      {kDef.shiftKey}
                    </span>
                  )}
                  {/* Main label */}
                  <span
                    className={`leading-none ${
                      kDef.isSpecial ? 'text-[9px] uppercase tracking-tighter' : 'text-xs'
                    }`}
                  >
                    {kDef.display || kDef.key}
                  </span>

                  {/* Active highlight indicator dot */}
                  {active && !pressed && (
                    <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[var(--accent)]" />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
