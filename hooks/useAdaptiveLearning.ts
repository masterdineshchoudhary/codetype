/**
 * CodeType Adaptive Learning Hook (useAdaptiveLearning)
 * Persists character error and latency analytics in localStorage and computes adaptive training drills.
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import type { CharacterAnalytics, HeatmapData, SupportedLanguage, TestResult } from '../types/typing';
import { generateAdaptiveDrill, getLanguageSnippet } from '../lib/algorithms/keybrGenerator';

const STORAGE_KEY = 'codetype_weak_keys_v1';

export function useAdaptiveLearning() {
  const [heatmap, setHeatmap] = useState<HeatmapData>({});
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: HeatmapData = JSON.parse(saved);
        setHeatmap(parsed);
      }
    } catch {
      // Ignore storage errors
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage when heatmap changes
  const saveHeatmap = useCallback((updated: HeatmapData) => {
    setHeatmap(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Storage quota or SSR guard
    }
  }, []);

  // Merge session results into stored heatmap
  const recordSession = useCallback(
    (result: TestResult) => {
      setHeatmap((prev) => {
        const next: HeatmapData = { ...prev };
        for (const ks of result.keystrokes) {
          const char = ks.expected;
          if (!char) continue;

          const existing: CharacterAnalytics = next[char] || {
            char,
            totalAttempts: 0,
            errors: 0,
            errorRate: 0,
            averageLatencyMs: ks.flightTimeMs,
            confidence: 1.0,
            lastUpdated: Date.now(),
          };

          const totalAttempts = existing.totalAttempts + 1;
          const errors = existing.errors + (ks.status === 'correct' ? 0 : 1);
          const errorRate = Math.round((errors / totalAttempts) * 1000) / 10;
          const alpha = 0.25;
          const averageLatencyMs = Math.round(
            alpha * ks.flightTimeMs + (1 - alpha) * existing.averageLatencyMs
          );

          const accuracyScore = Math.max(0, 1 - errorRate / 100);
          const speedScore = Math.min(1, Math.max(0, 1 - (averageLatencyMs - 120) / 300));
          const confidence = Math.max(0, Math.min(1, Math.round((accuracyScore * 0.7 + speedScore * 0.3) * 100) / 100));

          next[char] = {
            char,
            totalAttempts,
            errors,
            errorRate,
            averageLatencyMs,
            confidence,
            lastUpdated: Date.now(),
          };
        }

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // Ignore
        }

        return next;
      });
    },
    []
  );

  // Get list of weakest keys
  const getWeakKeys = useCallback(
    (limit: number = 6): CharacterAnalytics[] => {
      return Object.values(heatmap)
        .filter((c) => c.totalAttempts >= 3)
        .sort((a, b) => b.errorRate - a.errorRate || a.confidence - b.confidence)
        .slice(0, limit);
    },
    [heatmap]
  );

  // Generate next drill
  const getNextDrill = useCallback(
    (language: SupportedLanguage = 'typescript', isAdaptive: boolean = false): string => {
      if (isAdaptive) {
        return generateAdaptiveDrill(heatmap, language, 35);
      }
      return getLanguageSnippet(language);
    },
    [heatmap]
  );

  // Clear analytics
  const resetAnalytics = useCallback(() => {
    setHeatmap({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  return {
    heatmap,
    isLoaded,
    recordSession,
    getWeakKeys,
    getNextDrill,
    resetAnalytics,
  };
}

