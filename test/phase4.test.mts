/**
 * Phase 4 Test Suite: Keybr Progressive Mastery Engine & N-Gram Generator
 */

import assert from 'node:assert';
import {
  calculateKeyConfidence,
  checkUnlockProgression,
  getInitialMasteryState,
  KEYBR_ALPHABET_SEQUENCE,
} from '../lib/algorithms/masteryAlgorithm.ts';

console.log('🧪 Starting Phase 4 Test Suite...\n');

// ============================================================================
// Test 1: Keybr Alphabet Sequence & Initial State
// ============================================================================
{
  console.log('Test 1: Keybr Initial Unlocked Keys');

  const initialState = getInitialMasteryState();
  assert.strictEqual(initialState.unlockedKeys.length, 6);
  assert.deepStrictEqual(initialState.unlockedKeys, ['e', 'n', 'i', 't', 'r', 'l']);
  assert.strictEqual(initialState.currentKey, 'l');
  assert.strictEqual(initialState.overallMastery, 0);

  // Full sequence has 26 letters
  assert.strictEqual(KEYBR_ALPHABET_SEQUENCE.length, 26);
  assert.strictEqual(KEYBR_ALPHABET_SEQUENCE[0], 'e');
  assert.strictEqual(KEYBR_ALPHABET_SEQUENCE[25], 'z');

  console.log('  ✓ Initial 6 home-row keys verified.');
}

// ============================================================================
// Test 2: Confidence Mathematical Scoring
// ============================================================================
{
  console.log('\nTest 2: Key Confidence Mathematical Scoring');

  // Perfect accuracy (0% error) and fast latency (150ms)
  const conf1 = calculateKeyConfidence(0, 150);
  assert.ok(conf1 >= 0.85, `Expected >= 0.85, got ${conf1}`);

  // High error rate (15%) and slow latency (400ms)
  const conf2 = calculateKeyConfidence(15, 400);
  assert.ok(conf2 < 0.65, `Expected < 0.65, got ${conf2}`);

  console.log('  ✓ Confidence mathematical scoring verified.');
}

// ============================================================================
// Test 3: Progressive Unlock Gating (>= 0.85 Threshold)
// ============================================================================
{
  console.log('\nTest 3: Progressive Sequential Key Unlocking');

  const state = getInitialMasteryState();

  // All 6 keys high confidence
  for (const k of state.unlockedKeys) {
    state.keyConfidences[k] = 0.90;
  }

  const result1 = checkUnlockProgression(state);
  assert.strictEqual(result1.canUnlock, true);
  assert.strictEqual(result1.nextKey, 's');

  // If one key drops below 0.85 threshold, cannot unlock
  state.keyConfidences['r'] = 0.70;
  const result2 = checkUnlockProgression(state);
  assert.strictEqual(result2.canUnlock, false);
  assert.strictEqual(result2.lowestConfidenceKey.char, 'r');

  console.log('  ✓ Sequential unlock gating at >= 0.85 verified.');
}

// ============================================================================
// Test 4: Markov / N-Gram Generator Strictly Uses Unlocked Keys
// ============================================================================
{
  console.log('\nTest 4: Keybr N-Gram Pseudo-Word Generator');

  const { generateKeybrMasteryDrill } = await import('../lib/algorithms/keybrGenerator.ts');

  const state = getInitialMasteryState(); // 'e', 'n', 'i', 't', 'r', 'l'
  const drillText = generateKeybrMasteryDrill(state, 20);

  const words = drillText.split(' ');
  assert.strictEqual(words.length, 20);

  const unlockedSet = new Set(state.unlockedKeys);

  // Every letter must be in unlockedSet!
  for (const char of drillText) {
    if (char === ' ') continue;
    assert.ok(
      unlockedSet.has(char.toLowerCase()),
      `Disallowed letter '${char}' generated when only [${state.unlockedKeys.join(',')}] are unlocked!`
    );
  }

  // Target key ('l') should appear in the drill
  assert.ok(
    drillText.includes(state.currentKey),
    `Expected drill text to emphasize target key '${state.currentKey}'`
  );

  console.log('  ✓ N-Gram generator strictly adheres to unlocked keys without leakage.');
}
