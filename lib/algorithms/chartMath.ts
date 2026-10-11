/**
 * CodeType Chart Math & Telemetry Geometry Utility
 * Pure math calculations for rendering responsive SVG timeline curves
 * and keystroke latency histograms with zero external charting dependencies.
 */

import type { KeystrokeRecord, MetricSnapshot } from '../../types/typing';

export interface Point {
  x: number;
  y: number;
}

export interface TimelineBounds {
  minWpm: number;
  maxWpm: number;
  duration: number;
}

export interface SvgTimelineCoordinates {
  wpmPoints: Point[];
  rawPoints: Point[];
  errorPoints: (Point & { second: number; errors: number; wpm: number; rawWpm: number })[];
}

/**
 * Computes min/max WPM bounds and duration for timeline charting
 */
export function computeTimelineBounds(history: MetricSnapshot[]): TimelineBounds {
  if (!history || history.length === 0) {
    return {
      minWpm: 0,
      maxWpm: 60,
      duration: 1,
    };
  }

  const duration = Math.max(history.length, 1);
  let peak = 40;

  for (const snap of history) {
    if (snap.wpm > peak) peak = snap.wpm;
    if (snap.rawWpm > peak) peak = snap.rawWpm;
  }

  // Round up to clean multiple of 10 with margin
  const maxWpm = Math.ceil((peak + 5) / 10) * 10;

  return {
    minWpm: 0,
    maxWpm,
    duration,
  };
}

/**
 * Projects history snapshots into 2D SVG pixel coordinates
 */
export function mapHistoryToSvgCoordinates(
  history: MetricSnapshot[],
  bounds: TimelineBounds,
  viewWidth: number = 600,
  viewHeight: number = 200,
  padding: number = 24
): SvgTimelineCoordinates {
  if (!history || history.length === 0) {
    return { wpmPoints: [], rawPoints: [], errorPoints: [] };
  }

  const plotWidth = viewWidth - padding * 2;
  const plotHeight = viewHeight - padding * 2;
  const { maxWpm, duration } = bounds;

  const wpmPoints: Point[] = [];
  const rawPoints: Point[] = [];
  const errorPoints: (Point & { second: number; errors: number; wpm: number; rawWpm: number })[] = [];

  const timeDivisor = duration > 1 ? duration - 1 : 1;

  history.forEach((snap, idx) => {
    const x = padding + (idx / timeDivisor) * plotWidth;

    const wpmRatio = Math.min(Math.max(snap.wpm / maxWpm, 0), 1);
    const yWpm = viewHeight - padding - wpmRatio * plotHeight;

    const rawRatio = Math.min(Math.max(snap.rawWpm / maxWpm, 0), 1);
    const yRaw = viewHeight - padding - rawRatio * plotHeight;

    wpmPoints.push({ x, y: yWpm });
    rawPoints.push({ x, y: yRaw });

    if (snap.errors > 0) {
      errorPoints.push({
        x,
        y: yWpm,
        second: snap.second,
        errors: snap.errors,
        wpm: snap.wpm,
        rawWpm: snap.rawWpm,
      });
    }
  });

  return { wpmPoints, rawPoints, errorPoints };
}

/**
 * Constructs an SVG path string from an array of 2D coordinates
 */
export function generateSvgPath(points: Point[]): string {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x.toFixed(1)} ${points[i].y.toFixed(1)}`;
  }
  return path;
}

/**
 * Constructs an SVG path with smooth cubic Bezier transitions
 */
export function generateSmoothSvgPath(points: Point[]): string {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i > 0 ? i - 1 : 0];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;

    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return path;
}
