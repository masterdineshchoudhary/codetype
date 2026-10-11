/**
 * CodeType Keybr Mastery Controller Hook (useKeybrMastery)
 * Manages Keybr sequential letter unlocks, per-key moving-window confidence scores,
 * and persistence in localStorage.
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import type { KeybrMasteryState, KeystrokeRecord } from '../types/typing';
import {
  advanceToNextKey,
  calculateKeyConfidence,
  checkUnlockProgression,
  getInitialMasteryState,
  UnlockCheckResult,
} from '../lib/algorithms/masteryAlgorithm.ts';
import { generateKeybrMasteryDrill } from '../lib/algorithms/keybrGenerator.ts';

const KEYBR_STORAGE_KEY = 'codetype_keybr_mastery_v1';

export interface UseKeybrMasteryReturn {
  masteryState: KeybrMasteryState;
  isLoaded: boolean;
  recordKeybrSession: (keystrokes: KeystrokeRecord[]) => { unlockedNewKey: string | null };
  checkProgression: () => UnlockCheckResult;
  generateDrill: (wordCount?: number) => string;
  resetMastery: () => void;
}

export function useKeybrMastery(): UseKeybrMasteryReturn {
  const [masteryState, setMasteryState] = useState<KeybrMasteryState>(getInitialMasteryState);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEYBR_STORAGE_KEY);
      if (saved) {
        const parsed: KeybrMasteryState = JSON.parse(saved);
        if (parsed.unlockedKeys && Array.isArray(parsed.unlockedKeys)) {
          setMasteryState(parsed);
        }
      }
    } catch {
      // Storage access guard
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const saveState = useCallback((state: KeybrMasteryState) => {
    setMasteryState(state);
    try {
      localStorage.setItem(KEYBR_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage quota guard
    }
  }, []);

  /**
   * Evaluates session keystrokes, updates confidences, and triggers unlocks
   */
  const recordKeybrSession = useCallback(
    (keystrokes: KeystrokeRecord[]): { unlockedNewKey: string | null } => {
      let state = { ...masteryState };
      const keyStats: Record<string, { attempts: number; errors: number; totalLatency: number }> = {};

      for (const ks of keystrokes) {
        const char = ks.expected.toLowerCase();
        if (!state.unlockedKeys.includes(char)) continue;

        if (!keyStats[char]) {
          keyStats[char] = { attempts: 0, errors: 0, totalLatency: 0 };
        }

        keyStats[char].attempts++;
        if (ks.status === 'incorrect') {
          keyStats[char].errors++;
        }
        keyStats[char].totalLatency += ks.flightTimeMs;
      }

      // Update confidences for active keys
      const updatedConfidences = { ...state.keyConfidences };

      for (const [char, stats] of Object.entries(keyStats)) {
        const errorRate = (stats.errors / stats.attempts) * 100;
        const avgLatency = Math.round(stats.totalLatency / stats.attempts);

        const sessionConf = calculateKeyConfidence(errorRate, avgLatency);
        const prevConf = updatedConfidences[char] ?? 0;

        // Exponential moving average update (alpha = 0.35)
        const newConf =
          prevConf === 0 ? sessionConf : Math.round((0.35 * sessionConf + 0.65 * prevConf) * 100) / 100;

        updatedConfidences[char] = newConf;
      }

      state.keyConfidences = updatedConfidences;

      // Check if unlocked state can advance
      const check = checkUnlockProgression(state);
      let unlockedNewKey: string | null = null;

      if (check.canUnlock && check.nextKey) {
        unlockedNewKey = check.nextKey;
        state = advanceToNextKey(state);
      }

      saveState(state);
      return { unlockedNewKey };
    },
    [masteryState, saveState]
  );

  const checkProgression = useCallback((): UnlockCheckResult => {
    return checkUnlockProgression(masteryState);
  }, [masteryState]);

  const generateDrill = useCallback(
    (wordCount: number = 25): string => {
      return generateKeybrMasteryDrill(masteryState, wordCount);
    },
    [masteryState]
  );

  const resetMastery = useCallback(() => {
    const fresh = getInitialMasteryState();
    saveState(fresh);
  }, [saveState]);

  return {
    masteryState,
    isLoaded,
    recordKeybrSession,
    checkProgression,
    generateDrill,
    resetMastery,
  };
}

