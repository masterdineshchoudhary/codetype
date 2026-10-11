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

console.log('🎉 Task 1 verification passed!\n');

// ============================================================
// Test 2: Flight-Time Latency Distribution
// ============================================================
console.log('Test 2: Flight-Time Latency Distribution');

import { computeLatencyDistribution } from '../lib/algorithms/chartMath.ts';

const mockKeystrokes: KeystrokeRecord[] = [
  { timestamp: 100, key: 'c', expected: 'c', index: 0, status: 'correct', flightTimeMs: 0 },
  { timestamp: 180, key: 'o', expected: 'o', index: 1, status: 'correct', flightTimeMs: 80 },
  { timestamp: 270, key: 'n', expected: 'n', index: 2, status: 'correct', flightTimeMs: 90 },
  { timestamp: 390, key: 's', expected: 's', index: 3, status: 'correct', flightTimeMs: 120 },
  { timestamp: 540, key: 't', expected: 't', index: 4, status: 'correct', flightTimeMs: 150 },
  { timestamp: 800, key: 'x', expected: ' ', index: 5, status: 'incorrect', flightTimeMs: 260 },
  { timestamp: 1300, key: ' ', expected: ' ', index: 6, status: 'correct', flightTimeMs: 500 },
];

const distribution = computeLatencyDistribution(mockKeystrokes);
assert.ok(distribution.buckets.length >= 6, 'Must produce at least 6 latency bins');
assert.strictEqual(distribution.totalKeystrokes, 6, 'Should analyze the 6 non-initial keystrokes');
assert.ok(distribution.medianMs >= 100 && distribution.medianMs <= 160, `Median flight time should be ~135ms, got ${distribution.medianMs}`);
assert.ok(distribution.p95Ms >= 260, `P95 latency should reflect the high latency strokes, got ${distribution.p95Ms}`);

// Edge case: Empty keystrokes
const emptyDist = computeLatencyDistribution([]);
assert.strictEqual(emptyDist.totalKeystrokes, 0);
assert.strictEqual(emptyDist.medianMs, 0);

console.log('🎉 Task 2 verification passed!\n');

// ============================================================
// Test 3: End-to-End Analytics Integration
// ============================================================
console.log('Test 3: End-to-End Analytics Integration');

import type { TestResult } from '../types/typing.ts';

const fullMockResult: TestResult = {
  id: 'test_123',
  timestamp: Date.now(),
  mode: 'syntax',
  config: {
    mode: 'syntax',
    standardOptions: { type: 'words', wordCount: 25, duration: 30, punctuation: false, numbers: false },
    syntaxOptions: { language: 'rust', drillCategory: 'full-snippet', adaptiveWeakKeys: false },
    soundProfile: 'thock',
    soundVolume: 0.5,
    caretStyle: 'line',
    smoothCaret: true,
    theme: 'monochrome',
    zenMode: false,
    blindMode: false,
    strictBackspace: false,
  },
  targetText: 'fn main() {}',
  metrics: {
    wpm: 80,
    rawWpm: 85,
    accuracy: 98,
    totalKeystrokes: 12,
    correctCharacters: 12,
    correctKeystrokes: 12,
    incorrectKeystrokes: 0,
    uncorrectedErrors: 0,
    elapsedTime: 2,
    consistency: 94,
  },
  history: mockHistory,
  keystrokes: mockKeystrokes,
  weakKeys: [],
};

// Check that analytics generators consume fullMockResult seamlessly
const boundsCheck = computeTimelineBounds(fullMockResult.history);
assert.strictEqual(boundsCheck.duration, 5);

const latencyCheck = computeLatencyDistribution(fullMockResult.keystrokes);
assert.strictEqual(latencyCheck.totalKeystrokes, 6);

console.log('  ✓ Complete TestResult telemetry pipeline verified for Phase 6.\n');
console.log('🎉 Task 3 verification passed!\n');


