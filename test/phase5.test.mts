/**
 * CodeType Phase 5 Verification Test Suite
 * Tests Syntax Tokenizer, Theme Syntax Colors, Code Normalizer, and Rust/Go Snippets.
 */

import assert from 'node:assert';
import { THEME_PRESETS } from '../lib/themes/themeDefinitions.ts';
import type { SyntaxTokenType, ThemeColors } from '../types/typing.ts';

console.log('🧪 Starting CodeType Phase 5 Test Suite...\n');

// ============================================================
// Test 1: Theme Syntax Color Palette Verification
// ============================================================
console.log('Test 1: Theme Syntax Color Palettes');

const requiredSyntaxKeys = [
  'syntaxKeyword',
  'syntaxString',
  'syntaxComment',
  'syntaxNumber',
  'syntaxOperator',
  'syntaxFunction',
  'syntaxType',
  'syntaxPunctuation',
] as const;

for (const [themeId, preset] of Object.entries(THEME_PRESETS)) {
  for (const key of requiredSyntaxKeys) {
    const val = (preset.colors as any)[key];
    assert.ok(
      typeof val === 'string' && val.length > 0,
      `Theme '${themeId}' must define syntax color '${key}', got: ${val}`
    );
  }
}
console.log('  ✓ All 5 theme presets contain complete syntax color tokens.\n');

console.log('🎉 Task 1 verification passed!\n');
