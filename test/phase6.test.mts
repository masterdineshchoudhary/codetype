/**
 * CodeType Phase 6 Verification Test Suite
 * Tests Timeline Curve Math, SVG Path Generation, and Latency Distribution.
 */

import assert from 'node:assert';
import type { MetricSnapshot, KeystrokeRecord } from '../types/typing.ts';
import {
  computeTimelineBounds,
  generateSvgPath,
  mapHistoryToSvgCoordinates,
} from '../lib/algorithms/chartMath.ts';

console.log('🧪 Starting CodeType Phase 6 Test Suite...\n');

// ============================================================
// Test 1: Timeline Bounds & Path Math
// ============================================================
console.log('Test 1: Timeline Bounds & Path Math');

const mockHistory: MetricSnapshot[] = [
  { second: 1, wpm: 45, rawWpm: 50, errors: 0 },
  { second: 2, wpm: 60, rawWpm: 65, errors: 1 },
  { second: 3, wpm: 75, rawWpm: 80, errors: 0 },
  { second: 4, wpm: 70, rawWpm: 75, errors: 2 },
  { second: 5, wpm: 85, rawWpm: 90, errors: 0 },
];

const bounds = computeTimelineBounds(mockHistory);
assert.strictEqual(bounds.duration, 5, 'Duration should equal number of seconds');
assert.ok(bounds.maxWpm >= 90, `Max WPM must cover peak raw WPM (90), got ${bounds.maxWpm}`);
assert.strictEqual(bounds.minWpm, 0, 'Min WPM should be 0');

// Mapping to 600x200 SVG viewport
const svgPoints = mapHistoryToSvgCoordinates(mockHistory, bounds, 600, 200, 20);
assert.strictEqual(svgPoints.wpmPoints.length, 5);
assert.strictEqual(svgPoints.rawPoints.length, 5);
assert.strictEqual(svgPoints.errorPoints.length, 2, 'Should flag 2 seconds with errors');

// Generate SVG path string
const wpmPath = generateSvgPath(svgPoints.wpmPoints);
assert.ok(wpmPath.startsWith('M '), 'SVG path must start with M command');
assert.ok(wpmPath.includes('L '), 'SVG path must contain L commands');

// Edge case: Empty history
const emptyBounds = computeTimelineBounds([]);
assert.strictEqual(emptyBounds.duration, 1);
assert.strictEqual(generateSvgPath([]), '');

console.log('  ✓ Timeline bounds, point projection, and SVG path math verified.\n');
console.log('🎉 Task 1 verification passed!\n');
