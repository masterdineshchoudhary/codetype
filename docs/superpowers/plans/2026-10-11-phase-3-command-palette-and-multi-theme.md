# Phase 3: Command Palette (`Cmd + K`) & Multi-Theme System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a keyboard-first Command Palette (`Cmd + K` / `Ctrl + K` / `Tab + Enter`) with fast fuzzy filtering, paired with an instant CSS variable Multi-Theme Engine supporting Monochrome, Carbon, Matrix, Nord, and Cyberpunk presets.

**Architecture:** A theme definition registry in `lib/themes/themeDefinitions.ts` supplies CSS custom properties dynamically applied to `:root` and persisted in `localStorage`. A custom hook `useCommandPalette.ts` captures global hotkeys and manages filtered action state. An accessible modal `components/controls/CommandPalette.tsx` renders search and actions with keyboard navigation (arrows, Enter, Esc), integrated seamlessly into `app/page.tsx`.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript (strict mode, zero `any`), Tailwind CSS, Lucide React, Web Storage API.

**Spec:** [GEMINI.md](file:///Users/dineshchoudhary/Developer/personal/codetype/GEMINI.md) (Subsystem E: Command Palette & Multi-Theme Engine)

## Global Constraints

- Zero input lag: Palette modal must not interfere with typing arena performance or frame rates.
- Strict typing: `noImplicitAny: true`, zero `any`, exhaustive type unions for themes and actions.
- Full keyboard accessibility: Navigable with `ArrowDown`, `ArrowUp`, `Enter`, `Escape`, `Tab`.
- Immediate persistence: Selected theme and caret preferences saved in `localStorage` and applied on mount without flash of unstyled theme (FOUC).

## Review Focus

1. Hotkey collision during active typing sprint: `Cmd+K` / `Ctrl+K` must be allowed to interrupt or pause the test cleanly, but normal letter typing must not trigger the palette.
2. Search filtering with symbols or leading spaces: Searching `theme: matrix` or `@ punctuation` must match accurately without throwing regex syntax errors.
3. Palette focus trapping and blur return: When the palette closes, typing focus must automatically return to the hidden input so the user can immediately resume typing.
4. SSR theme hydration mismatch: Reading `localStorage` theme must be handled cleanly in `useEffect` or safe mount hook to avoid server/client attribute discrepancies.
5. Theme CSS property coverage: All 5 theme presets must supply all required color tokens (`--bg`, `--surface`, `--surface-hover`, `--border-subtle`, `--text-dim`, `--text-bright`, `--caret-color`, `--accent`, `--error-color`).

---

### Task 1: Theme Definitions & Registry

**Files:**
- Create: `lib/themes/themeDefinitions.ts`
- Modify: `types/typing.ts`
- Test: `test/phase3.test.mts`

**Interfaces:**
- Consumes: `types/typing.ts`
- Produces:
  ```typescript
  export type ThemeId = 'monochrome' | 'carbon' | 'matrix' | 'nord' | 'cyberpunk';
  export interface ThemeColors {
    bg: string;
    surface: string;
    surfaceHover: string;
    borderSubtle: string;
    textDim: string;
    textBright: string;
    caretColor: string;
    accent: string;
    errorColor: string;
    errorExtra: string;
  }
  export interface ThemePreset {
    id: ThemeId;
    name: string;
    colors: ThemeColors;
  }
  export const THEME_PRESETS: Record<ThemeId, ThemePreset>;
  export function applyTheme(themeId: ThemeId): void;
  export function getStoredTheme(): ThemeId;
  ```

- [ ] **Step 1: Write the failing test for theme registry and CSS variable application**

```typescript
// test/phase3.test.mts
import assert from 'node:assert';
import { THEME_PRESETS, ThemeId } from '../lib/themes/themeDefinitions.ts';

const expectedThemes: ThemeId[] = ['monochrome', 'carbon', 'matrix', 'nord', 'cyberpunk'];
for (const id of expectedThemes) {
  assert.ok(THEME_PRESETS[id], `Missing theme preset: ${id}`);
  assert.ok(THEME_PRESETS[id].colors.bg, `Theme ${id} missing bg`);
  assert.ok(THEME_PRESETS[id].colors.accent, `Theme ${id} missing accent`);
}
console.log('✓ Theme definitions verified.');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types test/phase3.test.mts`
Expected: FAIL (Cannot find module `themeDefinitions.ts`)

- [ ] **Step 3: Implement `types/typing.ts` extensions and `lib/themes/themeDefinitions.ts`**

Define `ThemeId`, `ThemePreset`, `ThemeColors`, `THEME_PRESETS` with exact palettes for Monochrome, Carbon, Matrix, Nord, and Cyberpunk, and `applyTheme(themeId)` applying CSS variables to `document.documentElement.style`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types test/phase3.test.mts`
Expected: PASS

- [ ] **Step 5: Verify strict typecheck**

Run: `npm run typecheck`
Expected: 0 errors

---

### Task 2: Command Palette Actions & Fuzzy Matcher

**Files:**
- Create: `lib/commands/commandRegistry.ts`
- Test: `test/phase3.test.mts`

**Interfaces:**
- Consumes: `types/typing.ts`, `lib/themes/themeDefinitions.ts`
- Produces:
  ```typescript
  export type CommandCategory = 'test' | 'mode' | 'language' | 'theme' | 'sound' | 'caret';
  export interface CommandItem {
    id: string;
    title: string;
    subtitle?: string;
    category: CommandCategory;
    keywords?: string[];
    action: () => void;
  }
  export function filterCommands(query: string, commands: CommandItem[]): CommandItem[];
  ```

- [ ] **Step 1: Write the failing test for command filtering**

```typescript
// in test/phase3.test.mts
import { filterCommands, CommandItem } from '../lib/commands/commandRegistry.ts';

const mockCommands: CommandItem[] = [
  { id: 'theme-nord', title: 'Theme: Nord', category: 'theme', keywords: ['blue', 'arctic'], action: () => {} },
  { id: 'mode-syntax', title: 'Mode: Syntax Drills', category: 'mode', keywords: ['code'], action: () => {} },
  { id: 'sound-clicky', title: 'Switch: Clicky', category: 'sound', keywords: ['audio'], action: () => {} },
];

assert.strictEqual(filterCommands('nord', mockCommands).length, 1);
assert.strictEqual(filterCommands('blue', mockCommands).length, 1);
assert.strictEqual(filterCommands('', mockCommands).length, 3);
assert.strictEqual(filterCommands('xyznonexistent', mockCommands).length, 0);
console.log('✓ Command filtering verified.');
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --experimental-strip-types test/phase3.test.mts`
Expected: FAIL (Cannot find module `commandRegistry.ts`)

- [ ] **Step 3: Implement `lib/commands/commandRegistry.ts`**

Implement fuzzy search filtering supporting case-insensitive token and keyword matching, ranking title matches above keyword matches.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --experimental-strip-types test/phase3.test.mts`
Expected: PASS

- [ ] **Step 5: Verify strict typecheck**

Run: `npm run typecheck`
Expected: 0 errors

---

### Task 3: Command Palette Controller Hook (`useCommandPalette`)

**Files:**
- Create: `hooks/useCommandPalette.ts`
- Test: `test/phase3.test.mts`

**Interfaces:**
- Consumes: `lib/commands/commandRegistry.ts`
- Produces:
  ```typescript
  export interface UseCommandPaletteReturn {
    isOpen: boolean;
    query: string;
    selectedIndex: number;
    filteredCommands: CommandItem[];
    openPalette: () => void;
    closePalette: () => void;
    togglePalette: () => void;
    setQuery: (query: string) => void;
    setSelectedIndex: (index: number) => void;
    executeSelected: () => void;
    handlePaletteKeyDown: (e: React.KeyboardEvent) => void;
  }
  export function useCommandPalette(commands: CommandItem[]): UseCommandPaletteReturn;
  ```

- [ ] **Step 1: Write test verifying index navigation math and bounds**

```typescript
// in test/phase3.test.mts
// Verify circular keyboard navigation indexing logic
const count = 3;
let idx = 0;
// Down arrow: (idx + 1) % count
idx = (idx + 1) % count; assert.strictEqual(idx, 1);
idx = (idx + 1) % count; assert.strictEqual(idx, 2);
idx = (idx + 1) % count; assert.strictEqual(idx, 0);
// Up arrow: (idx - 1 + count) % count
idx = (idx - 1 + count) % count; assert.strictEqual(idx, 2);
```

- [ ] **Step 2: Implement `hooks/useCommandPalette.ts`**

Listen for `(e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'`, as well as `Tab + Enter` fallback.
Manage `isOpen`, `query`, clamped `selectedIndex`, and arrow navigation keydown handler.

- [ ] **Step 3: Verify strict typecheck**

Run: `npm run typecheck`
Expected: 0 errors

---

### Task 4: Command Palette UI Component (`CommandPalette.tsx`)

**Files:**
- Create: `components/controls/CommandPalette.tsx`
- Modify: `app/globals.css` (modal backdrop & animations)

**Interfaces:**
- Consumes: `hooks/useCommandPalette.ts`, `lib/commands/commandRegistry.ts`, Lucide icons
- Produces:
  ```typescript
  export interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    commands: CommandItem[];
  }
  export function CommandPalette(props: CommandPaletteProps): React.JSX.Element | null;
  ```

- [ ] **Step 1: Implement `components/controls/CommandPalette.tsx`**

- Render fixed overlay with subtle backdrop blur and border.
- Search input with auto-focus and Lucide `Search` icon.
- Group commands by category (`Test`, `Mode`, `Theme`, `Sound`, `Caret`).
- Highlight active item with `var(--accent)` and scroll into view when navigating via arrow keys.
- Pressing `Enter` executes the command and closes the palette.
- Pressing `Escape` or clicking backdrop closes the palette.

- [ ] **Step 2: Verify strict typecheck**

Run: `npm run typecheck`
Expected: 0 errors

---

### Task 5: Integration with App Arena & Page

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/engine/TypingArea.tsx` (re-focus input when palette closes)
- Test: Full production build via `npm run build`

**Interfaces:**
- Wire all actions:
  - Restart Test (`Tab`)
  - Switch Mode: Standard (15s, 30s, 60s, 25w, 50w, 100w) vs Syntax
  - Switch Language: TypeScript, Python, SQL, Rust, Go
  - Switch Theme: Monochrome, Carbon, Matrix, Nord, Cyberpunk
  - Switch Switch Profile: Thock, Clicky, Silent
  - Switch Caret Style: Line, Block, Underline, Box

- [ ] **Step 1: Wire theme state and commands in `app/page.tsx`**

Initialize theme from `getStoredTheme()`, register command items for all settings, and render `<CommandPalette />`.

- [ ] **Step 2: Run all test suites**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 3: Run production build**

Run: `npx next build`
Expected: Next.js static build compiles in < 2 seconds with 0 errors.

---

### Task 6: End-to-End Verification & Review

- [ ] Verify hotkey `Cmd + K` opens palette.
- [ ] Verify typing query filters items instantly without lag.
- [ ] Verify selecting a theme dynamically shifts all CSS custom variables.
- [ ] Verify selecting caret style updates caret indicator immediately.
- [ ] Verify closing palette returns focus to typing container.

