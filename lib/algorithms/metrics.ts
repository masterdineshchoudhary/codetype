/**
 * CodeType Metric Calculation Algorithms
 * Strictly implements standard typing metrics (Law 2) and latency tracking.
 */

import type {
  CharacterAnalytics,
  HeatmapData,
  KeystrokeRecord,
  MetricSnapshot,
  TypingMetrics,
} from '../../types/typing';

/**
 * Standard WPM (Words Per Minute)
 * Formula: ((Total Characters Typed / 5) - Uncorrected Errors) / Time in Minutes
 * Clamped to 0 minimum.
 */
export function calculateStandardWpm(
  totalCharsTyped: number,
  uncorrectedErrors: number,
  timeInSeconds: number
): number {
  if (timeInSeconds <= 0) return 0;
  const timeInMinutes = timeInSeconds / 60;
  const netWords = totalCharsTyped / 5 - uncorrectedErrors;
  const wpm = netWords / timeInMinutes;
  return Math.max(0, Math.round(wpm * 10) / 10);
}

/**
 * Raw WPM
 * Formula: (Total Keystrokes / 5) / Time in Minutes
 */
export function calculateRawWpm(totalKeystrokes: number, timeInSeconds: number): number {
  if (timeInSeconds <= 0) return 0;
  const timeInMinutes = timeInSeconds / 60;
  const rawWords = totalKeystrokes / 5;
  const rawWpm = rawWords / timeInMinutes;
  return Math.max(0, Math.round(rawWpm * 10) / 10);
}

/**
 * Accuracy Percentage
 * Formula: (Correct Keystrokes / Total Keystrokes) * 100
 * Clamped between 0% and 100%.
 */
export function calculateAccuracy(
  correctKeystrokes: number,
  totalKeystrokes: number
): number {
  if (totalKeystrokes <= 0) return 100;
  const accuracy = (correctKeystrokes / totalKeystrokes) * 100;
  return Math.min(100, Math.max(0, Math.round(accuracy * 10) / 10));
}

/**
 * Calculates consistency percentage from time-series WPM snapshots.
 * Standard deviation of WPM normalized against average WPM.
 * 100% means perfectly uniform speed; lower values mean bursty/erratic typing.
 */
export function calculateConsistency(history: MetricSnapshot[]): number {
  if (history.length < 3) return 100;

  const wpms = history.map((s) => s.wpm).filter((w) => w > 0);
  if (wpms.length < 2) return 100;

  const mean = wpms.reduce((sum, val) => sum + val, 0) / wpms.length;
  if (mean <= 0) return 100;

  const variance =
    wpms.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / wpms.length;
  const standardDeviation = Math.sqrt(variance);

  // Coefficient of Variation: (stdDev / mean) * 100
  // Consistency = 100 - CV, clamped between 0 and 100
  const coefficientOfVariation = (standardDeviation / mean) * 100;
  const consistency = Math.max(0, Math.min(100, 100 - coefficientOfVariation));

  return Math.round(consistency);
}

/**
 * Aggregates all live metrics for a typing session
 */
export function computeTypingMetrics(params: {
  totalKeystrokes: number;
  correctKeystrokes: number;
  incorrectKeystrokes: number;
  correctCharacters: number;
  uncorrectedErrors: number;
  elapsedSeconds: number;
  history: MetricSnapshot[];
}): TypingMetrics {
  const {
    totalKeystrokes,
    correctKeystrokes,
    incorrectKeystrokes,
    correctCharacters,
    uncorrectedErrors,
    elapsedSeconds,
    history,
  } = params;

  return {
    wpm: calculateStandardWpm(correctCharacters, uncorrectedErrors, elapsedSeconds),
    rawWpm: calculateRawWpm(totalKeystrokes, elapsedSeconds),
    accuracy: calculateAccuracy(correctKeystrokes, totalKeystrokes),
    totalKeystrokes,
    correctCharacters,
    correctKeystrokes,
    incorrectKeystrokes,
    uncorrectedErrors,
    elapsedTime: Math.round(elapsedSeconds * 10) / 10,
    consistency: calculateConsistency(history),
  };
}

/**
 * Updates Keybr-style per-character analytics given a new keystroke
 */
export function updateCharacterAnalytics(
  existing: CharacterAnalytics | undefined,
  char: string,
  isCorrect: boolean,
  flightTimeMs: number
): CharacterAnalytics {
  const prevAttempts = existing?.totalAttempts ?? 0;
  const prevErrors = existing?.errors ?? 0;
  const prevAvgLatency = existing?.averageLatencyMs ?? flightTimeMs;

  const totalAttempts = prevAttempts + 1;
  const errors = prevErrors + (isCorrect ? 0 : 1);
  const errorRate = Math.round((errors / totalAttempts) * 1000) / 10;

  // Exponential moving average for latency (alpha = 0.25)
  const alpha = 0.25;
  const averageLatencyMs =
    prevAttempts === 0
      ? flightTimeMs
      : Math.round(alpha * flightTimeMs + (1 - alpha) * prevAvgLatency);

  // Keybr confidence score:
  // Combines accuracy (target: error rate < 3%) and latency (target: < 220ms)
  const accuracyScore = Math.max(0, 1 - errorRate / 100);
  const speedScore = Math.min(1, Math.max(0, 1 - (averageLatencyMs - 120) / 300));
  const rawConfidence = accuracyScore * 0.7 + speedScore * 0.3;
  const confidence = Math.max(0, Math.min(1, Math.round(rawConfidence * 100) / 100));

  return {
    char,
    totalAttempts,
    errors,
    errorRate,
    averageLatencyMs,
    confidence,
    lastUpdated: Date.now(),
  };
}

/**
 * Builds heatmap data dictionary from an array of KeystrokeRecords
 */
export function buildHeatmapFromKeystrokes(
  keystrokes: KeystrokeRecord[],
  initialData: HeatmapData = {}
): HeatmapData {
  const result: HeatmapData = { ...initialData };

  for (const ks of keystrokes) {
    const char = ks.expected;
    if (!char) continue;

    const isCorrect = ks.status === 'correct';
    result[char] = updateCharacterAnalytics(
      result[char],
      char,
      isCorrect,
      ks.flightTimeMs
    );
  }

  return result;
}
