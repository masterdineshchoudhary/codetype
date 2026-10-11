/**
 * CodeType LatencyHistogram Component
 * Visualizes user's key-to-key latency distribution (flight time in milliseconds)
 * using a responsive SVG bar chart with median, average, and p95 percentile indicators.
 */

'use client';

import React, { useMemo, useState } from 'react';
import type { KeystrokeRecord } from '../../types/typing';
import {
  computeLatencyDistribution,
  type LatencyBucket,
} from '../../lib/algorithms/chartMath';
import { Activity, Clock, Zap } from 'lucide-react';

export interface LatencyHistogramProps {
  keystrokes: KeystrokeRecord[];
}

export function LatencyHistogram({ keystrokes }: LatencyHistogramProps) {
  const [hoveredBucket, setHoveredBucket] = useState<LatencyBucket | null>(null);

  const stats = useMemo(() => computeLatencyDistribution(keystrokes), [keystrokes]);

  if (stats.totalKeystrokes === 0) {
    return (
      <div className="flex items-center justify-center h-44 text-xs font-mono text-[var(--text-dim)] border border-[var(--border-subtle)] rounded-xl bg-[var(--bg)]">
        No flight-time keystroke telemetry recorded.
      </div>
    );
  }

  const getBarColor = (label: string) => {
    if (label.includes('< 60') || label.includes('60-100')) {
      return 'fill-emerald-500 hover:fill-emerald-400';
    }
    if (label.includes('100-140') || label.includes('140-180')) {
      return 'fill-[var(--accent)] hover:opacity-90';
    }
    if (label.includes('180-240')) {
      return 'fill-sky-500 hover:fill-sky-400';
    }
    return 'fill-amber-500 hover:fill-amber-400';
  };

  const chartHeight = 130;
  const chartWidth = 580;
  const barWidth = 54;
  const gap = (chartWidth - barWidth * stats.buckets.length) / (stats.buckets.length + 1);

  return (
    <div className="flex flex-col w-full font-mono select-none">
      {/* Top Telemetry Stats */}
      <div className="grid grid-cols-4 gap-3 mb-3 text-xs">
        <div className="p-2.5 bg-[var(--bg)] border border-[var(--border-subtle)] rounded-lg flex items-center gap-2">
          <Zap className="w-4 h-4 text-[var(--accent)] shrink-0" />
          <div>
            <div className="text-[10px] uppercase text-[var(--text-dim)]">Median Latency</div>
            <div className="text-sm font-bold text-[var(--text-bright)]">
              {stats.medianMs}ms
            </div>
          </div>
        </div>

        <div className="p-2.5 bg-[var(--bg)] border border-[var(--border-subtle)] rounded-lg flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-400 shrink-0" />
          <div>
            <div className="text-[10px] uppercase text-[var(--text-dim)]">Avg Flight Time</div>
            <div className="text-sm font-bold text-[var(--text-bright)]">
              {stats.avgMs}ms
            </div>
          </div>
        </div>

        <div className="p-2.5 bg-[var(--bg)] border border-[var(--border-subtle)] rounded-lg flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <div className="text-[10px] uppercase text-[var(--text-dim)]">95th Percentile</div>
            <div className="text-sm font-bold text-[var(--text-bright)]">
              {stats.p95Ms}ms
            </div>
          </div>
        </div>

        <div className="p-2.5 bg-[var(--bg)] border border-[var(--border-subtle)] rounded-lg flex flex-col justify-center">
          <div className="text-[10px] uppercase text-[var(--text-dim)]">Total Strokes</div>
          <div className="text-sm font-bold text-[var(--text-bright)]">
            {stats.totalKeystrokes} keys
          </div>
        </div>
      </div>

      {/* SVG Histogram Chart */}
      <div className="relative w-full bg-[var(--bg)] border border-[var(--border-subtle)] rounded-xl p-3 flex flex-col items-center">
        {/* Active Hover Pill */}
        <div className="h-5 mb-1 flex items-center justify-between w-full px-2 text-[11px] text-[var(--text-dim)]">
          {hoveredBucket ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[var(--text-bright)] font-bold">{hoveredBucket.label}:</span>
              <span className="text-[var(--accent)] font-semibold">{hoveredBucket.count} keys</span>
              <span>({hoveredBucket.percentage}% of strokes)</span>
            </div>
          ) : (
            <span className="text-[10px] opacity-70">
              Hover over latency bars to view stroke frequency
            </span>
          )}
          <span className="text-[10px] text-[var(--text-dim)]">
            Target flow: &lt; 140ms
          </span>
        </div>

        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight + 35}`}
          className="w-full h-44 overflow-visible"
        >
          {/* Horizontal Reference Line */}
          <line
            x1={0}
            y1={chartHeight}
            x2={chartWidth}
            y2={chartHeight}
            stroke="var(--border-subtle)"
            strokeWidth="1"
          />

          {/* Histogram Bars */}
          {stats.buckets.map((bucket, idx) => {
            const x = gap + idx * (barWidth + gap);
            const heightRatio = bucket.count / stats.maxCount;
            const barH = Math.max(heightRatio * (chartHeight - 20), bucket.count > 0 ? 4 : 0);
            const y = chartHeight - barH;

            const isHovered = hoveredBucket?.label === bucket.label;

            return (
              <g
                key={bucket.label}
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredBucket(bucket)}
                onMouseLeave={() => setHoveredBucket(null)}
              >
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx="4"
                  className={`${getBarColor(bucket.label)} transition-all ${
                    isHovered ? 'opacity-100 filter brightness-125' : 'opacity-85'
                  }`}
                />

                {/* Percentage label above bar */}
                {bucket.count > 0 && (
                  <text
                    x={x + barWidth / 2}
                    y={y - 5}
                    textAnchor="middle"
                    fontSize="10"
                    fill={isHovered ? 'var(--text-bright)' : 'var(--text-dim)'}
                    fontWeight={isHovered ? 'bold' : 'normal'}
                  >
                    {bucket.percentage}%
                  </text>
                )}

                {/* X-axis Label below bar */}
                <text
                  x={x + barWidth / 2}
                  y={chartHeight + 16}
                  textAnchor="middle"
                  fontSize="9.5"
                  fill="var(--text-dim)"
                  className="select-none"
                >
                  {bucket.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
