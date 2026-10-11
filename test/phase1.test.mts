/**
 * Phase 1 Verification Test Suite
 * Tests:
 * 1. Law 2 standard metric algorithms (WPM, Raw WPM, Accuracy, Consistency)
 * 2. Keybr adaptive character analytics and heatmap builder
 * 3. SoundSynth lifecycle and audio synthesis mock behavior
 */

import assert from 'node:assert';
import {
  calculateStandardWpm,
  calculateRawWpm,
  calculateAccuracy,
  calculateConsistency,
  updateCharacterAnalytics,
  computeTypingMetrics,
  buildHeatmapFromKeystrokes,
} from '../lib/algorithms/metrics.ts';
import { SoundSynth } from '../lib/audio/soundSynth.ts';

console.log('🧪 Starting CodeType Phase 1 Test Suite...\n');

// ============================================================================
// Test 1: Standard WPM (Law 2)
// Formula: ((Total Characters Typed / 5) - Uncorrected Errors) / Time in Minutes
// ============================================================================
{
  console.log('Test 1: Law 2 Standard WPM Calculation');

  // Case A: 250 characters typed in 60s (1 min) with 0 uncorrected errors = 50 WPM
  const wpm1 = calculateStandardWpm(250, 0, 60);
  assert.strictEqual(wpm1, 50, `Expected 50 WPM, got ${wpm1}`);

  // Case B: 250 characters typed in 30s (0.5 min) with 0 uncorrected errors = 100 WPM
  const wpm2 = calculateStandardWpm(250, 0, 30);
  assert.strictEqual(wpm2, 100, `Expected 100 WPM, got ${wpm2}`);

  // Case C: 250 characters typed in 60s with 5 uncorrected errors
  // Net words = (250/5) - 5 = 45 -> 45 WPM
  const wpm3 = calculateStandardWpm(250, 5, 60);
  assert.strictEqual(wpm3, 45, `Expected 45 WPM, got ${wpm3}`);

  // Case D: Clamping to 0 if errors exceed characters
  const wpm4 = calculateStandardWpm(10, 5, 60);
  assert.strictEqual(wpm4, 0, `Expected 0 WPM clamp, got ${wpm4}`);

  // Case E: Time <= 0 should yield 0
  assert.strictEqual(calculateStandardWpm(100, 0, 0), 0);

  console.log('  ✓ Standard WPM calculations passed.');
}

// ============================================================================
// Test 2: Raw WPM (Law 2)
// Formula: (Total Keystrokes / 5) / Time in Minutes
// ============================================================================
{
  console.log('\nTest 2: Law 2 Raw WPM Calculation');

  // 300 keystrokes in 60 seconds (1 minute) = 60 Raw WPM
  const raw1 = calculateRawWpm(300, 60);
  assert.strictEqual(raw1, 60, `Expected 60 Raw WPM, got ${raw1}`);

  // 150 keystrokes in 15 seconds (0.25 minute) = 120 Raw WPM
  const raw2 = calculateRawWpm(150, 15);
  assert.strictEqual(raw2, 120, `Expected 120 Raw WPM, got ${raw2}`);

  console.log('  ✓ Raw WPM calculations passed.');
}

// ============================================================================
// Test 3: Accuracy Percentage (Law 2)
// Formula: (Correct Keystrokes / Total Keystrokes) * 100
// ============================================================================
{
  console.log('\nTest 3: Law 2 Accuracy Calculation');

  // 100 correct out of 100 = 100%
  assert.strictEqual(calculateAccuracy(100, 100), 100);

  // 95 correct out of 100 = 95%
  assert.strictEqual(calculateAccuracy(95, 100), 95);

  // 0 keystrokes = 100% default
  assert.strictEqual(calculateAccuracy(0, 0), 100);

  // Clamped bounds
  assert.strictEqual(calculateAccuracy(110, 100), 100);

  console.log('  ✓ Accuracy calculations passed.');
}

// ============================================================================
// Test 4: Consistency Algorithm
// ============================================================================
{
  console.log('\nTest 4: Typing Rhythm Consistency');

  // Perfectly flat WPM timeline = 100%
  const flatHistory = [
    { second: 1, wpm: 80, rawWpm: 80, errors: 0 },
    { second: 2, wpm: 80, rawWpm: 80, errors: 0 },
    { second: 3, wpm: 80, rawWpm: 80, errors: 0 },
  ];
  assert.strictEqual(calculateConsistency(flatHistory), 100);

  // Variable WPM timeline should produce score < 100
  const jitterHistory = [
    { second: 1, wpm: 40, rawWpm: 50, errors: 1 },
    { second: 2, wpm: 120, rawWpm: 120, errors: 0 },
    { second: 3, wpm: 30, rawWpm: 40, errors: 2 },
  ];
  const jitterScore = calculateConsistency(jitterHistory);
  assert.ok(jitterScore < 90 && jitterScore >= 0, `Expected lower consistency score, got ${jitterScore}`);

  console.log('  ✓ Consistency calculations passed.');
}

// ============================================================================
// Test 5: Keybr-Style Adaptive Character Analytics
// ============================================================================
{
  console.log('\nTest 5: Keybr Character Analytics & Heatmap');

  // Character trained with correct keystroke
  let stat = updateCharacterAnalytics(undefined, 'a', true, 180);
  assert.strictEqual(stat.char, 'a');
  assert.strictEqual(stat.totalAttempts, 1);
  assert.strictEqual(stat.errors, 0);
  assert.strictEqual(stat.errorRate, 0);
  assert.strictEqual(stat.averageLatencyMs, 180);
  assert.ok(stat.confidence > 0.8, 'Expected high confidence for perfect key');

  // Character trained with error keystroke
  stat = updateCharacterAnalytics(stat, 'a', false, 320);
  assert.strictEqual(stat.totalAttempts, 2);
  assert.strictEqual(stat.errors, 1);
  assert.strictEqual(stat.errorRate, 50);
  assert.ok(stat.confidence < 0.8, 'Expected lower confidence after 50% error rate');

  // Test building heatmap from keystrokes
  const keystrokes = [
    { timestamp: 1000, key: '{', expected: '{', index: 0, status: 'correct' as const, flightTimeMs: 150 },
    { timestamp: 1200, key: 'x', expected: ';', index: 1, status: 'incorrect' as const, flightTimeMs: 200 },
  ];
  const heatmap = buildHeatmapFromKeystrokes(keystrokes);
  assert.ok(heatmap['{']);
  assert.strictEqual(heatmap['{'].errors, 0);
  assert.ok(heatmap[';']);
  assert.strictEqual(heatmap[';'].errors, 1);

  console.log('  ✓ Keybr analytics and heatmap generation passed.');
}

// ============================================================================
// Test 6: SoundSynth API & Lifecycle
// ============================================================================
{
  console.log('\nTest 6: SoundSynth API & Configuration');

  const synth = new SoundSynth('thock', 0.6);
  assert.strictEqual(synth.getProfile(), 'thock');
  assert.strictEqual(synth.getVolume(), 0.6);
  assert.strictEqual(synth.isSoundMuted(), false);

  synth.setProfile('clicky');
  assert.strictEqual(synth.getProfile(), 'clicky');

  synth.setVolume(0.8);
  assert.strictEqual(synth.getVolume(), 0.8);

  synth.toggleMute();
  assert.strictEqual(synth.isSoundMuted(), true);

  // In non-browser / node environment, playKeySound should execute safely without crashing
  synth.playKeySound('alphanumeric');
  synth.playKeySound('space');
  synth.playKeySound('backspace');
  synth.playKeySound('error');

  synth.dispose();
  console.log('  ✓ SoundSynth API passed without errors in SSR/node environment.');
}

console.log('\n🎉 ALL PHASE 1 TESTS PASSED SUCCESSFULLY!\n');

