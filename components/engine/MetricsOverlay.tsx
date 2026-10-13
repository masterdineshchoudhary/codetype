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
}: MetricsOverlayProps) {
  const isRunning = status === 'running';

  return (
    <div className="flex items-center justify-between w-full max-w-4xl px-2 py-2 mb-3 select-none font-mono text-xs transition-opacity duration-300">
      <div className="flex items-center gap-6 sm:gap-8">
        {/* WPM Counter */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-bold text-[var(--text-bright)] tabular-nums tracking-tight">
            {isRunning || status === 'completed' ? Math.round(metrics.wpm) : 0}
          </span>
          <span className="text-[10px] tracking-wider text-[var(--text-dim)] uppercase font-semibold">
            wpm
          </span>
        </div>

        {/* Raw WPM */}
        <div className="flex items-baseline gap-1.5 hidden sm:flex">
          <span className="text-xl font-medium text-[var(--text-dim)] tabular-nums">
            {isRunning || status === 'completed' ? Math.round(metrics.rawWpm) : 0}
          </span>
          <span className="text-[10px] tracking-wider text-[var(--text-dim)]/70 uppercase">
            raw
          </span>
        </div>

        {/* Accuracy */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-bold text-[var(--text-bright)] tabular-nums tracking-tight">
            {metrics.accuracy}%
          </span>
          <span className="text-[10px] tracking-wider text-[var(--text-dim)] uppercase font-semibold">
            acc
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Timer / Progress */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-bold text-[var(--accent)] tabular-nums tracking-tight">
            {timeRemaining !== null ? `${timeRemaining}s` : `${Math.floor(elapsedTime)}s`}
          </span>
          <span className="text-[10px] tracking-wider text-[var(--text-dim)] uppercase font-semibold">
            {timeRemaining !== null ? 'rem' : 'time'}
          </span>
        </div>
      </div>
    </div>
  );
}

