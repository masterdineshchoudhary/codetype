/**
 * CodeType ResultsModal Component
 * Post-test comprehensive analytics modal with WPM, Accuracy, Consistency, and Heatmap.
 */

'use client';

import React from 'react';
import type { HeatmapData, TestResult } from '../../types/typing';
import { HeatmapKeyboard } from './HeatmapKeyboard';
import { RotateCcw } from 'lucide-react';

export interface ResultsModalProps {
  result: TestResult;
  heatmap: HeatmapData;
  onRestart: () => void;
}

export function ResultsModal({ result, heatmap, onRestart }: ResultsModalProps) {
  const { metrics } = result;

  return (
    <div className="flex flex-col items-center w-full max-w-4xl p-8 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl font-mono shadow-2xl animate-fade-in">
      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full mb-8 pb-6 border-b border-[var(--border-subtle)]">
        <div className="flex flex-col">
          <span className="text-xs uppercase text-[var(--text-dim)]">WPM</span>
          <span className="text-5xl font-black text-[var(--accent)] tracking-tight">
            {Math.round(metrics.wpm)}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-xs uppercase text-[var(--text-dim)]">ACCURACY</span>
          <span className="text-5xl font-black text-[var(--text-bright)] tracking-tight">
            {metrics.accuracy}%
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-xs uppercase text-[var(--text-dim)]">RAW WPM</span>
          <span className="text-3xl font-bold text-[var(--text-dim)] mt-2">
            {Math.round(metrics.rawWpm)}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-xs uppercase text-[var(--text-dim)]">CONSISTENCY</span>
          <span className="text-3xl font-bold text-[var(--text-dim)] mt-2">
            {metrics.consistency}%
          </span>
        </div>
      </div>

      {/* Telemetry Breakdown */}
      <div className="grid grid-cols-3 gap-4 w-full mb-8 text-xs text-[var(--text-dim)]">
        <div className="p-3 bg-[var(--bg)] border border-[var(--border-subtle)] rounded-lg">
          <div className="text-[10px] uppercase">Characters</div>
          <div className="text-base font-semibold text-[var(--text-bright)] mt-1">
            <span className="text-emerald-400">{metrics.correctCharacters}</span> /{' '}
            <span className="text-red-400">{metrics.uncorrectedErrors}</span> /{' '}
            <span>{metrics.totalKeystrokes}</span>
          </div>
          <div className="text-[10px] text-[var(--text-dim)] mt-0.5">correct / errors / total</div>
        </div>

        <div className="p-3 bg-[var(--bg)] border border-[var(--border-subtle)] rounded-lg">
          <div className="text-[10px] uppercase">Time Elapsed</div>
          <div className="text-base font-semibold text-[var(--text-bright)] mt-1">
            {metrics.elapsedTime}s
          </div>
          <div className="text-[10px] text-[var(--text-dim)] mt-0.5">total test duration</div>
        </div>

        <div className="p-3 bg-[var(--bg)] border border-[var(--border-subtle)] rounded-lg">
          <div className="text-[10px] uppercase">Test Mode</div>
          <div className="text-base font-semibold text-[var(--text-bright)] mt-1 capitalize">
            {result.mode}
          </div>
          <div className="text-[10px] text-[var(--text-dim)] mt-0.5">
            {result.mode === 'standard' ? result.config.standardOptions.type : result.config.syntaxOptions.language}
          </div>
        </div>
      </div>

      {/* Weak-Key Heatmap */}
      <div className="w-full mb-8">
        <HeatmapKeyboard heatmap={heatmap} />
      </div>

      {/* Restart CTA */}
      <div className="flex items-center gap-4">
        <button
          onClick={onRestart}
          className="flex items-center gap-2 px-6 py-2.5 bg-[var(--accent)] hover:opacity-90 text-[var(--bg)] font-semibold rounded-lg shadow-md transition-all active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          Next Test
        </button>
        <span className="text-xs text-[var(--text-dim)]">
          or press <kbd className="px-1.5 py-0.5 bg-[var(--surface-hover)] border border-[var(--border-subtle)] rounded text-[var(--text-bright)]">Tab</kbd> to restart
        </span>
      </div>
    </div>
  );
}

