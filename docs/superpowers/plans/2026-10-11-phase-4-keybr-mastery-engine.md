# Phase 4: Keybr Progressive Mastery & Sequential Unlock Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Keybr's progressive sequential letter unlocking algorithm, Markov/n-gram pseudo-word generator restricted to unlocked letters, and a live Mastery Progress Bar HUD.

**Architecture:** A mastery progression module `lib/algorithms/masteryAlgorithm.ts` manages the sequential unlocking of the alphabet (`e, n, i, t, r, l, s, a, o, d, c, u, m, f, p, g, w, y, b, v, k, x, j, q, z`), computing per-letter confidence scores against target speed and accuracy thresholds. A Markov/n-gram generator synthesizes pronounceable syllables and pseudo-words combining only currently unlocked letters, biasing frequency toward the user's lowest confidence keys. A custom hook `hooks/useKeybrMastery.ts` persists mastery state in `localStorage`. A visual `MasteryBar.tsx` renders unlocked keys and mastery confidence progress.

**Tech Stack:** TypeScript (strict mode, zero `any`), Next.js 15, React 19, Tailwind CSS, Lucide React, Web Storage API.

**Spec:** [GEMINI.md](file:///Users/dineshchoudhary/Developer/personal/codetype/GEMINI.md) (Subsystem C: Keybr Progressive Mastery Engine)

---

### Task 1: Keybr Mastery Algorithm & Confidence Thresholds

**Files:**
- Create: `lib/algorithms/masteryAlgorithm.ts`
- Modify: `types/typing.ts`
- Test: `test/phase4.test.mts`

**Interfaces:**
- Consumes: `types/typing.ts`
- Produces:
  ```typescript
  export const KEYBR_ALPHABET_SEQUENCE: readonly string[];
  export interface KeybrMasteryState {
    unlockedKeys: string[];
    currentKey: string;
    keyConfidences: Record<string, number>; // char -> 0.0 to 1.0
    overallMastery: number; // 0 to 100%
  }
  export function calculateKeyConfidence(errorRate: number, avgLatencyMs: number): number;
  export function checkUnlockProgression(state: KeybrMasteryState): {
    canUnlock: boolean;
    nextKey: string | null;
    lowestConfidenceKey: { char: string; confidence: number };
  };
  export function getInitialMasteryState(): KeybrMasteryState;
  ```

---

### Task 2: Markov / N-Gram Pseudo-Word Generator

**Files:**
- Modify: `lib/algorithms/keybrGenerator.ts`
- Test: `test/phase4.test.mts`

**Interfaces:**
- Consumes: `lib/algorithms/masteryAlgorithm.ts`
- Produces:
  ```typescript
  export function generateKeybrMasteryDrill(
    masteryState: KeybrMasteryState,
    wordCount?: number
  ): string;
  ```

---

### Task 3: Keybr Mastery Hook (`useKeybrMastery`)

**Files:**
- Create: `hooks/useKeybrMastery.ts`
- Test: `test/phase4.test.mts`

**Interfaces:**
- Consumes: `lib/algorithms/masteryAlgorithm.ts`
- Produces:
  ```typescript
  export interface UseKeybrMasteryReturn {
    masteryState: KeybrMasteryState;
    recordKeybrSession: (keystrokes: KeystrokeRecord[]) => { unlockedNewKey: string | null };
    resetMastery: () => void;
  }
  export function useKeybrMastery(): UseKeybrMasteryReturn;
  ```

---

### Task 4: Mastery Progress Bar Component (`MasteryBar.tsx`)

**Files:**
- Create: `components/engine/MasteryBar.tsx`
- Test: Visual & component unit tests

---

### Task 5: App Integration & Command Palette Registration

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/controls/ModeToggle.tsx`
- Test: `npm test` & `npx next build`
