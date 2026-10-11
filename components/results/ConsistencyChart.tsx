/**
 * CodeType ConsistencyChart Component
 * Zero-dependency SVG timeline curve visualizing live Net WPM and Raw WPM
 * throughout the test duration, with error dot flags and interactive hover inspector.
 */

'use client';

import React, { useMemo, useState } from 'react';
import type { MetricSnapshot } from '../../types/typing';
import {
  computeTimelineBounds,
  generateSmoothSvgPath,
  mapHistoryToSvgCoordinates,
} from '../../lib/algorithms/chartMath';

export interface ConsistencyChartProps {
  history: MetricSnapshot[];
}

export function ConsistencyChart({ history }: ConsistencyChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const viewWidth = 650;
  const viewHeight = 200;
  const padding = 30;

  const bounds = useMemo(() => computeTimelineBounds(history), [history]);

  const { wpmPoints, rawPoints, errorPoints } = useMemo(
    () => mapHistoryToSvgCoordinates(history, bounds, viewWidth, viewHeight, padding),
    [history, bounds, viewWidth, viewHeight, padding]
  );

  const wpmPath = useMemo(() => generateSmoothSvgPath(wpmPoints), [wpmPoints]);
  const rawPath = useMemo(() => generateSmoothSvgPath(rawPoints), [rawPoints]);

  if (!history || history.length === 0) {
    return (
      <div className="flex items-center justify-center h-44 text-xs font-mono text-[var(--text-dim)] border border-[var(--border-subtle)] rounded-xl bg-[var(--bg)]">
        No timeline telemetry available for this test sprint.
      </div>
    );
  }

  const hoveredSnap = hoverIndex !== null ? history[hoverIndex] : null;
  const hoveredWpmPt = hoverIndex !== null ? wpmPoints[hoverIndex] : null;

  return (
    <div className="flex flex-col w-full font-mono select-none">
      {/* Legend & Active Hover Tooltip */}
      <div className="flex items-center justify-between mb-2 px-1 text-xs text-[var(--text-dim)]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[var(--accent)] rounded" />
            <span className="text-[11px] text-[var(--text-bright)]">Net WPM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[var(--text-dim)] rounded opacity-60" />
            <span className="text-[11px]">Raw WPM</span>
          </div>
          {errorPoints.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--error-color)]" />
              <span className="text-[11px] text-red-400">Errors ({errorPoints.length})</span>
            </div>
          )}
        </div>

        {/* Hover Inspector Pill */}
        {hoveredSnap ? (
          <div className="flex items-center gap-2.5 text-[11px] bg-[var(--bg)] px-2.5 py-0.5 rounded border border-[var(--border-subtle)]">
            <span className="text-[var(--text-dim)]">{hoveredSnap.second}s</span>
            <span className="text-[var(--accent)] font-bold">{Math.round(hoveredSnap.wpm)} WPM</span>
            <span className="text-[var(--text-dim)]">raw: {Math.round(hoveredSnap.rawWpm)}</span>
            {hoveredSnap.errors > 0 && (
              <span className="text-red-400 font-semibold">{hoveredSnap.errors} err</span>
            )}
          </div>
        ) : (
          <span className="text-[10px] text-[var(--text-dim)] opacity-70">
            Hover along curve to inspect rhythm
          </span>
        )}
      </div>

      {/* SVG Canvas Arena */}
      <div className="relative w-full overflow-hidden bg-[var(--bg)] border border-[var(--border-subtle)] rounded-xl p-2">
        <svg
          viewBox={`0 0 ${viewWidth} ${viewHeight}`}
          className="w-full h-44 overflow-visible"
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Y-Axis Horizontal Grid Lines */}
          <line
            x1={padding}
            y1={padding}
            x2={viewWidth - padding}
            y2={padding}
            stroke="var(--border-subtle)"
            strokeDasharray="3 3"
            strokeWidth="1"
          />
          <text
            x={padding - 6}
            y={padding + 4}
            textAnchor="end"
            fontSize="10"
            fill="var(--text-dim)"
            className="select-none"
          >
            {bounds.maxWpm}
          </text>

          <line
            x1={padding}
            y1={viewHeight / 2}
            x2={viewWidth - padding}
            y2={viewHeight / 2}
            stroke="var(--border-subtle)"
            strokeDasharray="3 3"
            strokeWidth="1"
          />
          <text
            x={padding - 6}
            y={viewHeight / 2 + 4}
            textAnchor="end"
            fontSize="10"
            fill="var(--text-dim)"
            className="select-none"
          >
            {Math.round(bounds.maxWpm / 2)}
          </text>

          <line
            x1={padding}
            y1={viewHeight - padding}
            x2={viewWidth - padding}
            y2={viewHeight - padding}
            stroke="var(--border-subtle)"
            strokeWidth="1"
          />
          <text
            x={padding - 6}
            y={viewHeight - padding + 4}
            textAnchor="end"
            fontSize="10"
            fill="var(--text-dim)"
            className="select-none"
          >
            0
          </text>

          {/* X-Axis Time Labels */}
          <text
            x={padding}
            y={viewHeight - padding + 16}
            textAnchor="start"
            fontSize="10"
            fill="var(--text-dim)"
          >
            1s
          </text>
          {bounds.duration > 2 && (
            <text
              x={viewWidth / 2}
              y={viewHeight - padding + 16}
              textAnchor="middle"
              fontSize="10"
              fill="var(--text-dim)"
            >
              {Math.round(bounds.duration / 2)}s
            </text>
          )}
          <text
            x={viewWidth - padding}
            y={viewHeight - padding + 16}
            textAnchor="end"
            fontSize="10"
            fill="var(--text-dim)"
          >
            {bounds.duration}s
          </text>

          {/* Raw WPM Curve (Muted dashed line) */}
          {rawPath && (
            <path
              d={rawPath}
              fill="none"
              stroke="var(--text-dim)"
              strokeWidth="1.8"
              strokeDasharray="4 3"
              strokeOpacity="0.5"
            />
          )}

          {/* Net WPM Curve (Bright Accent Solid Line) */}
          {wpmPath && (
            <path
              d={wpmPath}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Error Flags (Red Dots with pulse) */}
          {errorPoints.map((pt, i) => (
            <g key={i}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4.5"
                fill="var(--error-color)"
                stroke="var(--bg)"
                strokeWidth="1.5"
              />
              <text
                x={pt.x}
                y={pt.y - 7}
                textAnchor="middle"
                fontSize="9"
                fontWeight="bold"
                fill="var(--error-color)"
              >
                ×
              </text>
            </g>
          ))}

          {/* Active Hover Crosshair Line */}
          {hoveredWpmPt && (
            <g>
              <line
                x1={hoveredWpmPt.x}
                y1={padding}
                x2={hoveredWpmPt.x}
                y2={viewHeight - padding}
                stroke="var(--text-bright)"
                strokeDasharray="2 2"
                strokeWidth="1"
                opacity="0.6"
              />
              <circle
                cx={hoveredWpmPt.x}
                cy={hoveredWpmPt.y}
                r="5"
                fill="var(--accent)"
                stroke="var(--bg)"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Invisible Hover Hitboxes across each second slice */}
          {wpmPoints.map((pt, idx) => {
            const sliceWidth = viewWidth / wpmPoints.length;
            return (
              <rect
                key={idx}
                x={pt.x - sliceWidth / 2}
                y={0}
                width={sliceWidth}
                height={viewHeight}
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => setHoverIndex(idx)}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
