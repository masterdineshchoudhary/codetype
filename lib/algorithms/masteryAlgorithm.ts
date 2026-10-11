/**
 * CodeType Keybr Progressive Mastery & Sequential Unlock Algorithm
 * Governs Keybr-style letter progression, confidence threshold scoring,
 * and sequential alphabet unlocking.
 */

import type { KeybrMasteryState } from '../../types/typing';

/**
 * Standard Keybr sequential alphabet progression order
 * Begins with 6 high-frequency home-row keys.
 */
export const KEYBR_ALPHABET_SEQUENCE: readonly string[] = [
  'e', 'n', 'i', 't', 'r', 'l', 's', 'a', 'o', 'd', 'h', 'c', 'u', 'm',
  'f', 'p', 'g', 'w', 'y', 'b', 'v', 'k', 'x', 'j', 'q', 'z'
];

export const INITIAL_UNLOCKED_COUNT = 6;
export const MASTERY_CONFIDENCE_THRESHOLD = 0.85;

/**
 * Calculates confidence score (0.0 to 1.0) based on accuracy and flight time latency
 * Weight: 70% accuracy, 30% speed
 */
export function calculateKeyConfidence(errorRate: number, avgLatencyMs: number): number {
  const accuracyScore = Math.max(0, 1 - errorRate / 100);
  const speedScore = Math.min(1, Math.max(0, 1 - (avgLatencyMs - 120) / 300));
  const rawConfidence = accuracyScore * 0.70 + speedScore * 0.30;
  return Math.max(0, Math.min(1, Math.round(rawConfidence * 100) / 100));
}

/**
 * Returns initial mastery state starting with the first 6 keys
 */
export function getInitialMasteryState(): KeybrMasteryState {
  const unlocked = KEYBR_ALPHABET_SEQUENCE.slice(0, INITIAL_UNLOCKED_COUNT);
  const confidences: Record<string, number> = {};

  for (const k of unlocked) {
    confidences[k] = 0.0;
  }

  return {
    unlockedKeys: [...unlocked],
    currentKey: unlocked[unlocked.length - 1],
    keyConfidences: confidences,
    overallMastery: 0,
  };
}

export interface UnlockCheckResult {
  canUnlock: boolean;
  nextKey: string | null;
  lowestConfidenceKey: { char: string; confidence: number };
  isAllMastered: boolean;
}

/**
 * Evaluates whether all currently active keys have reached confidence >= 0.85
 */
export function checkUnlockProgression(state: KeybrMasteryState): UnlockCheckResult {
  const { unlockedKeys, keyConfidences } = state;

  let canUnlock = true;
  let lowestKey = unlockedKeys[0] || 'e';
  let lowestConf = 1.0;

  for (const k of unlockedKeys) {
    const conf = keyConfidences[k] ?? 0;
    if (conf < lowestConf) {
      lowestConf = conf;
      lowestKey = k;
    }
    if (conf < MASTERY_CONFIDENCE_THRESHOLD) {
      canUnlock = false;
    }
  }

  const isAllMastered = unlockedKeys.length >= KEYBR_ALPHABET_SEQUENCE.length && canUnlock;

  let nextKey: string | null = null;
  if (canUnlock && unlockedKeys.length < KEYBR_ALPHABET_SEQUENCE.length) {
    nextKey = KEYBR_ALPHABET_SEQUENCE[unlockedKeys.length];
  }

  return {
    canUnlock: canUnlock && nextKey !== null,
    nextKey,
    lowestConfidenceKey: { char: lowestKey, confidence: lowestConf },
    isAllMastered,
  };
}

/**
 * Advances the state by unlocking the next key in the sequence
 */
export function advanceToNextKey(state: KeybrMasteryState): KeybrMasteryState {
  const check = checkUnlockProgression(state);
  if (!check.canUnlock || !check.nextKey) {
    return state;
  }

  const updatedUnlocked = [...state.unlockedKeys, check.nextKey];
  const updatedConfidences = {
    ...state.keyConfidences,
    [check.nextKey]: 0.0,
  };

  const overallMastery = Math.round(
    (updatedUnlocked.length / KEYBR_ALPHABET_SEQUENCE.length) * 100
  );

  return {
    unlockedKeys: updatedUnlocked,
    currentKey: check.nextKey,
    keyConfidences: updatedConfidences,
    overallMastery,
  };
}
