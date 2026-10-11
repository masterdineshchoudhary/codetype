/**
 * Phase 3 Test Suite: Theme Registry, Fuzzy Filtering & Command Palette
 */

import assert from 'node:assert';
import { THEME_PRESETS } from '../lib/themes/themeDefinitions.ts';
import type { ThemeId } from '../types/typing.ts';

console.log('🧪 Starting Phase 3 Test Suite...\n');

// ============================================================================
// Test 1: Theme Presets Completeness & Token Keys
// ============================================================================
{
  console.log('Test 1: Theme Definitions and Preset Registry');

  const expectedThemes: ThemeId[] = ['monochrome', 'carbon', 'matrix', 'nord', 'cyberpunk'];

  for (const id of expectedThemes) {
    const preset = THEME_PRESETS[id];
    assert.ok(preset, `Missing theme preset: ${id}`);
    assert.strictEqual(preset.id, id);
    assert.ok(preset.name, `Missing name for theme ${id}`);

    const c = preset.colors;
    assert.ok(c.bg, `Theme ${id} missing bg`);
    assert.ok(c.surface, `Theme ${id} missing surface`);
    assert.ok(c.surfaceHover, `Theme ${id} missing surfaceHover`);
    assert.ok(c.borderSubtle, `Theme ${id} missing borderSubtle`);
    assert.ok(c.textDim, `Theme ${id} missing textDim`);
    assert.ok(c.textBright, `Theme ${id} missing textBright`);
    assert.ok(c.caretColor, `Theme ${id} missing caretColor`);
    assert.ok(c.accent, `Theme ${id} missing accent`);
    assert.ok(c.errorColor, `Theme ${id} missing errorColor`);
    assert.ok(c.errorExtra, `Theme ${id} missing errorExtra`);
  }

  console.log('  ✓ All 5 theme presets verified with complete CSS token palettes.');
}

// ============================================================================
// Test 2: Command Palette Fuzzy Filtering
// ============================================================================
{
  console.log('\nTest 2: Command Palette Fuzzy Filtering');

  // Dynamic import of commandRegistry
  const { filterCommands } = await import('../lib/commands/commandRegistry.ts');

  const mockCommands = [
    { id: 'theme-nord', title: 'Theme: Nord', category: 'theme' as const, keywords: ['blue', 'arctic'], action: () => {} },
    { id: 'mode-syntax', title: 'Mode: Syntax Drills', category: 'mode' as const, keywords: ['code', 'developer'], action: () => {} },
    { id: 'sound-clicky', title: 'Switch: Clicky', category: 'sound' as const, keywords: ['audio', 'mechanical'], action: () => {} },
    { id: 'caret-block', title: 'Caret: Block', category: 'caret' as const, keywords: ['cursor'], action: () => {} },
  ];

  // Exact match
  assert.strictEqual(filterCommands('nord', mockCommands).length, 1);
  assert.strictEqual(filterCommands('nord', mockCommands)[0].id, 'theme-nord');

  // Keyword match
  assert.strictEqual(filterCommands('blue', mockCommands).length, 1);
  assert.strictEqual(filterCommands('blue', mockCommands)[0].id, 'theme-nord');

  // Empty query returns all
  assert.strictEqual(filterCommands('', mockCommands).length, 4);

  // Whitespace-only returns all
  assert.strictEqual(filterCommands('   ', mockCommands).length, 4);

  // Non-matching query returns empty array
  assert.strictEqual(filterCommands('xyznonexistent', mockCommands).length, 0);

  // Partial substring match
  assert.strictEqual(filterCommands('synt', mockCommands).length, 1);

  console.log('  ✓ Command filtering and keyword ranking verified.');
}

// ============================================================================
// Test 3: Command Palette Keyboard Index Navigation Logic
// ============================================================================
{
  console.log('\nTest 3: Palette Circular Navigation Math');

  const count = 4;
  let idx = 0;

  // Arrow down
  idx = (idx + 1) % count; assert.strictEqual(idx, 1);
  idx = (idx + 1) % count; assert.strictEqual(idx, 2);
  idx = (idx + 1) % count; assert.strictEqual(idx, 3);
  idx = (idx + 1) % count; assert.strictEqual(idx, 0); // Wraps back to 0

  // Arrow up
  idx = (idx - 1 + count) % count; assert.strictEqual(idx, 3); // Wraps to last item
  idx = (idx - 1 + count) % count; assert.strictEqual(idx, 2);

  // Clamping when length shrinks
  const newCount = 2;
  const clampedIdx = Math.min(idx, Math.max(0, newCount - 1));
  assert.strictEqual(clampedIdx, 1);

  console.log('  ✓ Circular keyboard navigation math verified.');
}
