/**
 * CodeType ResultsModal Component
 * Comprehensive post-test analytics arena featuring:
 * - Net WPM, Raw WPM, Accuracy, and Rhythm Consistency metrics
 * - Interactive SVG Consistency Curve (second-by-second timeline)
 * - Visual Weak-Key Heatmap keyboard
 * - Key-to-key Flight-Time Latency Histogram with percentile telemetry
 */

'use client';

import React, { useState } from 'react';
import type { HeatmapData, TestResult } from '../../types/typing';
import { HeatmapKeyboard } from './HeatmapKeyboard';
import { ConsistencyChart } from './ConsistencyChart';
import { LatencyHistogram } from './LatencyHistogram';
import { Activity, Keyboard, RotateCcw, TrendingUp } from 'lucide-react';

export interface ResultsModalProps {
  result: TestResult;
  heatmap: HeatmapData;
  onRestart: () => void;
}

type ResultTab = 'timeline' | 'heatmap' | 'latency';

export function ResultsModal({ result, heatmap, onRestart }: ResultsModalProps) {
  const [activeTab, setActiveTab] = useState<ResultTab>('timeline');
  const { metrics } = result;

  return (
    <div className="flex flex-col items-center w-full max-w-4xl p-6 sm:p-8 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-2xl font-mono shadow-2xl animate-fade-in">
      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full mb-6 pb-6 border-b border-[var(--border-subtle)]">
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
      <div className="grid grid-cols-3 gap-3 w-full mb-6 text-xs text-[var(--text-dim)]">
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

      {/* Visual Analytics Tab Switcher */}
      <div className="flex items-center justify-between w-full mb-3 px-1 border-b border-[var(--border-subtle)] pb-2.5">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors ${
              activeTab === 'timeline'
                ? 'bg-[var(--surface-hover)] text-[var(--accent)] font-bold border border-[var(--border-subtle)]'
                : 'text-[var(--text-dim)] hover:text-[var(--text-bright)]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Consistency Curve</span>
          </button>

          <button
            onClick={() => setActiveTab('heatmap')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors ${
              activeTab === 'heatmap'
                ? 'bg-[var(--surface-hover)] text-[var(--accent)] font-bold border border-[var(--border-subtle)]'
                : 'text-[var(--text-dim)] hover:text-[var(--text-bright)]'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>Weak-Key Heatmap</span>
          </button>

          <button
            onClick={() => setActiveTab('latency')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-colors ${
              activeTab === 'latency'
                ? 'bg-[var(--surface-hover)] text-[var(--accent)] font-bold border border-[var(--border-subtle)]'
                : 'text-[var(--text-dim)] hover:text-[var(--text-bright)]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Flight Latency</span>
          </button>
        </div>

        <span className="text-[10px] text-[var(--text-dim)] hidden sm:inline">
          Rhythm Analytics
        </span>
      </div>

      {/* Tab Panels */}
      <div className="w-full mb-8 min-h-[220px]">
        {activeTab === 'timeline' && <ConsistencyChart history={result.history} />}
        {activeTab === 'heatmap' && <HeatmapKeyboard heatmap={heatmap} />}
        {activeTab === 'latency' && <LatencyHistogram keystrokes={result.keystrokes} />}
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
