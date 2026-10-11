/**
 * CodeType Metrics Overlay Component
 * High-contrast minimal HUD displaying live WPM, Accuracy, and Timer.
 */

'use client';

import React from 'react';
import type { EngineStatus, TypingMetrics } from '../../types/typing';

export interface MetricsOverlayProps {
  metrics: TypingMetrics;
  status: EngineStatus;
  timeRemaining: number | null;
  elapsedTime: number;
  zenMode?: boolean;
}

export function MetricsOverlay({
  metrics,
  status,
  timeRemaining,
  elapsedTime,
  zenMode = false,
}: MetricsOverlayProps) {
  const isRunning = status === 'running';

  if (zenMode && isRunning) {
    return null;
  }

  return (
    <div className="flex items-center justify-between w-full max-w-4xl px-2 py-3 mb-6 select-none font-mono text-sm border-b border-[var(--border-subtle)]">
      <div className="flex items-center gap-8">
        {/* WPM Counter */}
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">WPM</span>
          <span className="text-2xl font-bold text-[var(--text-bright)] tabular-nums">
            {isRunning || status === 'completed' ? Math.round(metrics.wpm) : 0}
          </span>
        </div>

        {/* Raw WPM */}
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">RAW</span>
          <span className="text-xl font-medium text-[var(--text-dim)] tabular-nums">
            {isRunning || status === 'completed' ? Math.round(metrics.rawWpm) : 0}
          </span>
        </div>

        {/* Accuracy */}
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">ACC</span>
          <span className="text-2xl font-bold text-[var(--text-bright)] tabular-nums">
            {metrics.accuracy}%
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Timer / Progress */}
        <div className="flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">
            {timeRemaining !== null ? 'REMAINING' : 'TIME'}
          </span>
          <span className="text-2xl font-bold text-[var(--accent)] tabular-nums">
            {timeRemaining !== null ? `${timeRemaining}s` : `${Math.floor(elapsedTime)}s`}
          </span>
        </div>
      </div>
    </div>
  );
}

