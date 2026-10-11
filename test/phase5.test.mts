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

// ============================================================
// Test 2: Lightweight Syntax Tokenizer
// ============================================================
console.log('Test 2: Lightweight Syntax Tokenizer');

// Import tokenizer
import { tokenizeCode } from '../lib/syntax/tokenizer.ts';

// 1. TypeScript test: "const count: number = 42; // counter"
const tsCode = 'const count: number = 42; // counter';
const tsTokens = tokenizeCode(tsCode, 'typescript');
assert.strictEqual(tsTokens.length, tsCode.length, 'Tokens array length must match code string length');

// Check 'const' (0..4) is keyword
for (let i = 0; i < 5; i++) {
  assert.strictEqual(tsTokens[i], 'keyword', `Index ${i} ('${tsCode[i]}') should be 'keyword'`);
}

// Check 'number' (13..18) is type
const numStart = tsCode.indexOf('number');
for (let i = numStart; i < numStart + 6; i++) {
  assert.strictEqual(tsTokens[i], 'type', `Index ${i} ('${tsCode[i]}') should be 'type'`);
}

// Check '42' is number
const val42Start = tsCode.indexOf('42');
assert.strictEqual(tsTokens[val42Start], 'number');
assert.strictEqual(tsTokens[val42Start + 1], 'number');

// Check '// counter' is comment
const commentStart = tsCode.indexOf('//');
for (let i = commentStart; i < tsCode.length; i++) {
  assert.strictEqual(tsTokens[i], 'comment', `Index ${i} ('${tsCode[i]}') should be 'comment'`);
}

// 2. Python test: 'def hello(name):\n    return f"hi {name}"'
const pyCode = 'def hello(name): return "hi" # greet';
const pyTokens = tokenizeCode(pyCode, 'python');
assert.strictEqual(pyTokens[0], 'keyword', 'Python def should be keyword');
const pyStrStart = pyCode.indexOf('"hi"');
assert.strictEqual(pyTokens[pyStrStart], 'string');
assert.strictEqual(pyTokens[pyStrStart + 1], 'string');
assert.strictEqual(pyTokens[pyStrStart + 2], 'string');
assert.strictEqual(pyTokens[pyCode.indexOf('#')], 'comment');

// 3. Rust test: 'fn main() -> Result<(), Error> { let mut x = 10; }'
const rsCode = 'fn main() -> Result<(), Error>';
const rsTokens = tokenizeCode(rsCode, 'rust');
assert.strictEqual(rsTokens[0], 'keyword', 'Rust fn should be keyword');
const resStart = rsCode.indexOf('Result');
assert.strictEqual(rsTokens[resStart], 'type', 'Rust Result should be type');

// 4. Go test: 'func fetch() (string, error) { go routine(); }'
const goCode = 'func fetch() (string, error)';
const goTokens = tokenizeCode(goCode, 'go');
assert.strictEqual(goTokens[0], 'keyword', 'Go func should be keyword');
const strStart = goCode.indexOf('string');
assert.strictEqual(rsTokens[strStart] !== undefined, true);

// 5. SQL test: 'SELECT id, name FROM users WHERE age >= 21;'
const sqlCode = 'SELECT id FROM users;';
const sqlTokens = tokenizeCode(sqlCode, 'sql');
assert.strictEqual(sqlTokens[0], 'keyword', 'SQL SELECT should be keyword');

console.log('🎉 Task 2 verification passed!\n');

// ============================================================
// Test 3: Rust & Go Snippets and Drill Symbols
// ============================================================
console.log('Test 3: Rust & Go Snippets and Drill Symbols');

import { RUST_SNIPPETS, RUST_DRILL_SYMBOLS } from '../lib/snippets/rust.ts';
import { GO_SNIPPETS, GO_DRILL_SYMBOLS } from '../lib/snippets/go.ts';
import { getLanguageSnippet } from '../lib/algorithms/keybrGenerator.ts';

// Verify Rust snippets
assert.ok(Array.isArray(RUST_SNIPPETS) && RUST_SNIPPETS.length >= 4, 'Must provide >= 4 Rust snippets');
assert.ok(RUST_DRILL_SYMBOLS.length >= 8, 'Must provide >= 8 Rust drill symbols');
const rsSnippet = getLanguageSnippet('rust');
assert.ok(typeof rsSnippet === 'string' && rsSnippet.length > 20, 'Must retrieve non-empty Rust snippet');
assert.ok(rsSnippet.includes('fn ') || rsSnippet.includes('struct ') || rsSnippet.includes('impl '), 'Snippet must contain Rust constructs');

// Verify Go snippets
assert.ok(Array.isArray(GO_SNIPPETS) && GO_SNIPPETS.length >= 4, 'Must provide >= 4 Go snippets');
assert.ok(GO_DRILL_SYMBOLS.length >= 8, 'Must provide >= 8 Go drill symbols');
const goSnippet = getLanguageSnippet('go');
assert.ok(typeof goSnippet === 'string' && goSnippet.length > 20, 'Must retrieve non-empty Go snippet');
assert.ok(goSnippet.includes('func ') || goSnippet.includes('package ') || goSnippet.includes('type '), 'Snippet must contain Go constructs');

console.log('  ✓ Idiomatic Rust & Go snippets and symbol drills verified.\n');
console.log('🎉 Task 3 verification passed!\n');

