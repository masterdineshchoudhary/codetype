# Phase 5: Syntax Tokenizer & Real Code Ingestion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a zero-lag developer syntax tokenizer with high-contrast colorization, idiomatic Rust & Go snippet repositories with symbol drills, and an accessible custom code paste/file ingestion loader with indentation normalization.

**Architecture:**
- **Zero-Lag Syntax Tokenizer:** Lightweight rule-based lexical scanner classifying snippets into `SyntaxTokenType` (`keyword`, `string`, `comment`, `number`, `operator`, `punctuation`, `function`, `type`, `default`). Maps character indices to token types on snippet load with zero AST/DOM overhead during keystrokes.
- **CSS Variable Color Tokens:** Syntax categories hooked into CSS custom properties (`--syntax-keyword`, `--syntax-string`, etc.) across all 5 themes. Pending characters reflect syntax hues; active/correct/error characters cleanly override without re-renders.
- **Expanded Language Libraries:** Idiomatic production snippets and symbol drills for **Rust** (ownership, matching, Result/Option) and **Go** (goroutines, channels, error idioms).
- **Custom Code Ingestion:** Modal supporting direct paste or drag-and-drop file ingestion (`.rs`, `.go`, `.ts`, `.py`, `.sql`, etc.) with automated tab-to-spaces and common indentation stripping.

**Tech Stack:** Next.js 15, TypeScript (Strict mode), Tailwind CSS v4, Lucide React icons.

**Spec:** [GEMINI.md](file:///Users/dineshchoudhary/Developer/personal/codetype/GEMINI.md) Subsystem D.

## Global Constraints
- Zero keystroke re-renders (Performance Law 1): character elements receive `data-syntax` at mount time; keystrokes only mutate `data-status`.
- Zero external runtime parser dependencies: syntax tokenizer must be a lightweight pure-TypeScript scanner without heavy WASM or AST overhead.
- Strict TypeScript: `noImplicitAny: true`, zero `any`.
- Unit test coverage with Node native test runner (`node --experimental-strip-types`).

## Review Focus
1. **Pasted code with tabs or CRLF:** Normalization must convert `\r\n` to `\n` and tabs to consistent 2-space indentation without corrupting alignment.
2. **Empty or whitespace-only custom code:** Validation must prevent loading blank drills and give helpful UI feedback.
3. **Multi-line comments and strings spanning newlines:** Tokenizer must properly colorize whole string literals (`"..."`, `'...'`, `` `...` ``) and comments (`//`, `#`, `/* ... */`).
4. **Theme compatibility:** All 5 themes (Monochrome, Carbon, Matrix, Nord, Cyberpunk) must define legible syntax colors.
5. **Language extension auto-detection:** Drag-and-drop or file upload must accurately infer language from extensions (`.rs` -> Rust, `.go` -> Go, `.ts` -> TypeScript, etc.).

---

### Task 1: Syntax Tokenizer Types and Color Token CSS

**Files:**
- Modify: `types/typing.ts`
- Modify: `lib/themes/themeDefinitions.ts`
- Modify: `app/globals.css`
- Test: `test/phase5.test.mts`

**Interfaces:**
- Produces: `SyntaxTokenType = 'keyword' | 'string' | 'comment' | 'number' | 'operator' | 'punctuation' | 'function' | 'type' | 'default'`
- Produces: Extended `ThemeColors` including `--syntax-*` CSS custom properties.

- [ ] **Step 1: Write test for syntax token types and theme palettes in `test/phase5.test.mts`**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Update `types/typing.ts` with `SyntaxTokenType` and `TokenizedCharacter`**
- [ ] **Step 4: Update `lib/themes/themeDefinitions.ts` with syntax color definitions for all 5 themes**
- [ ] **Step 5: Update `app/globals.css` with `.char-span[data-status="pending"][data-syntax="..."]` CSS rules**
- [ ] **Step 6: Run test to verify it passes**
- [ ] **Step 7: Commit Task 1**

---

### Task 2: Pure-TypeScript Lightweight Syntax Tokenizer

**Files:**
- Create: `lib/syntax/tokenizer.ts`
- Test: `test/phase5.test.mts`

**Interfaces:**
- Produces: `tokenizeCode(code: string, language: SupportedLanguage): SyntaxTokenType[]`
- Produces: `classifyToken(word: string, language: SupportedLanguage): SyntaxTokenType`

- [ ] **Step 1: Add tokenizer tests for TypeScript, Python, Rust, Go, and SQL in `test/phase5.test.mts`**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `lib/syntax/tokenizer.ts` supporting keywords, strings, comments, operators, numbers, and brackets**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit Task 2**

---

### Task 3: Idiomatic Snippets & Symbol Drills for Rust & Go

**Files:**
- Create: `lib/snippets/rust.ts`
- Create: `lib/snippets/go.ts`
- Modify: `lib/algorithms/keybrGenerator.ts`
- Test: `test/phase5.test.mts`

**Interfaces:**
- Produces: `RUST_SNIPPETS`, `RUST_DRILL_SYMBOLS` in `lib/snippets/rust.ts`
- Produces: `GO_SNIPPETS`, `GO_DRILL_SYMBOLS` in `lib/snippets/go.ts`
- Updates: `getLanguageSnippet` and `PROGRAMMING_KEYWORDS` to include Rust and Go snippets.

- [ ] **Step 1: Add snippet retrieval and symbol tests in `test/phase5.test.mts`**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `lib/snippets/rust.ts` with idiomatic Rust patterns (Result, Option, structs, match)**
- [ ] **Step 4: Implement `lib/snippets/go.ts` with idiomatic Go patterns (goroutines, channels, error handling)**
- [ ] **Step 5: Connect Rust and Go into `lib/algorithms/keybrGenerator.ts`**
- [ ] **Step 6: Run test to verify it passes**
- [ ] **Step 7: Commit Task 3**

---

### Task 4: Code Normalizer and Ingestion Utility

**Files:**
- Create: `lib/syntax/codeNormalizer.ts`
- Test: `test/phase5.test.mts`

**Interfaces:**
- Produces: `normalizeCodeSnippet(raw: string, options?: { tabSize?: number; maxLines?: number }): { normalized: string; error?: string }`
- Produces: `detectLanguageFromFilename(filename: string): SupportedLanguage | null`

- [ ] **Step 1: Add code normalization and language detection tests in `test/phase5.test.mts`**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `lib/syntax/codeNormalizer.ts` handling tab expansion, CRLF normalization, whitespace trimming, and common indentation removal**
- [ ] **Step 4: Run test to verify it passes**
- [ ] **Step 5: Commit Task 4**

---

### Task 5: CharacterSpan & TypingArea Zero-Lag Syntax Highlighting

**Files:**
- Modify: `components/engine/CharacterSpan.tsx`
- Modify: `components/engine/TypingArea.tsx`
- Modify: `app/page.tsx`

**Interfaces:**
- `CharacterSpan` accepts `syntaxType?: SyntaxTokenType` and renders `data-syntax={syntaxType}`
- `TypingArea` computes syntax tokens once when `targetText` or `language` changes and passes to `CharacterSpan`

- [ ] **Step 1: Update `CharacterSpan.tsx` to accept and render `data-syntax`**
- [ ] **Step 2: Update `TypingArea.tsx` to tokenize `targetText` when `mode === 'syntax'`**
- [ ] **Step 3: Verify with type check and visual test**
- [ ] **Step 4: Commit Task 5**

---

### Task 6: Custom Snippet Ingestion Modal & Command Palette Integration

**Files:**
- Create: `components/controls/CustomSnippetModal.tsx`
- Modify: `components/controls/CommandPalette.tsx`
- Modify: `lib/commands/commandRegistry.ts`
- Modify: `app/page.tsx`

**Interfaces:**
- Produces: `<CustomSnippetModal isOpen={...} onClose={...} onApplySnippet={(code, language) => ...} />`
- Registers command in `lib/commands/commandRegistry.ts`: "Custom Code: Paste / Upload Snippet"

- [ ] **Step 1: Implement `components/controls/CustomSnippetModal.tsx` with paste textarea, drag-and-drop file upload, preview, and language selector**
- [ ] **Step 2: Add custom snippet action to `lib/commands/commandRegistry.ts` and Command Palette**
- [ ] **Step 3: Wire `CustomSnippetModal` state into `app/page.tsx`**
- [ ] **Step 4: Verify Next.js build and test suite**
- [ ] **Step 5: Commit Task 6**

