# Phase 7: Production Hardening, Audio Buffering & PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement resilient Web Audio suspension recovery and dynamics compressor limiting, complete offline PWA capabilities (manifest, icons, service worker), and 160+ WPM high-velocity keystroke stress testing.

**Architecture:**
- **Web Audio Resilience & Dynamics Limiter (`soundSynth.ts`):** Auto-resume on browser gesture/visibility change, pre-warmed noise buffers, and a `DynamicsCompressorNode` on master output to eliminate acoustic distortion during 160+ WPM burst typing.
- **Progressive Web App (PWA):** `manifest.json`, SVG/PNG icons, cache-first offline service worker (`sw.js`), meta tags in `app/layout.tsx`, and an offline status listener.
- **160+ WPM Stress Testing Suite (`test/phase7.test.mts`):** High-frequency keystroke simulation benchmark verifying sub-1ms execution time and zero memory leakage.

**Tech Stack:** Next.js 15, Web Audio API, Service Worker API, TypeScript (Strict).

**Spec:** [GEMINI.md](file:///Users/dineshchoudhary/Developer/personal/codetype/GEMINI.md) Subsystem B & Phase 7.

## Global Constraints
- Sub-10ms synthesized switch response; zero dropped frames at 160+ WPM.
- Offline-ready without external CDN dependencies.
- Strict TypeScript: `noImplicitAny: true`, zero `any`.
- Unit test suite in `test/phase7.test.mts`.

## Review Focus
1. **AudioContext Autoplay Policy:** Safari/Chrome requires user interaction before audio starts. Hook must silently resume on first touch/key without console warnings.
2. **Audio distortion during rapid bursts:** Firing 15+ mechanical switch sounds per second could cause clipping without master dynamic compression.
3. **PWA scope & caching:** Service worker must not intercept or break Next.js dev server hot reload while providing full offline caching in production.
4. **Offline indicator:** App must visibly confirm offline readiness.

---

### Task 1: Web Audio Dynamics Compressor & Suspension Recovery

**Files:**
- Modify: `lib/audio/soundSynth.ts`
- Modify: `hooks/useSoundEffects.ts`
- Test: `test/phase7.test.mts`

**Interfaces:**
- Produces: `ensureContextRunning(): Promise<boolean>`
- Produces: `masterCompressor: DynamicsCompressorNode` preventing clipping at 160+ WPM
- Produces: Visibility & focus resume handlers

- [ ] **Step 1: Write tests for SoundSynth compressor, pre-warmed buffers, and recovery in `test/phase7.test.mts`**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement dynamics compressor and suspension lifecycle handling in `lib/audio/soundSynth.ts`**
- [ ] **Step 4: Update `hooks/useSoundEffects.ts` with visibility and interaction listeners**
- [ ] **Step 5: Run test to verify it passes**
- [ ] **Step 6: Commit Task 1**

---

### Task 2: PWA Manifest, App Icons & Offline Service Worker

**Files:**
- Create: `public/manifest.json`
- Create: `public/sw.js`
- Create: `public/icon.svg`
- Modify: `app/layout.tsx`
- Create: `components/pwa/PwaProvider.tsx`
- Modify: `app/page.tsx`
- Test: `test/phase7.test.mts`

**Interfaces:**
- Produces: `/manifest.json` with theme color `#0e0f12` and standalone display
- Produces: Offline service worker caching core assets
- Produces: `<PwaProvider>` registering SW and exposing offline status badge

- [ ] **Step 1: Write PWA manifest validation and service worker tests in `test/phase7.test.mts`**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Create `public/manifest.json`, `public/icon.svg`, and `public/sw.js`**
- [ ] **Step 4: Create `components/pwa/PwaProvider.tsx` and integrate into `app/layout.tsx` / `app/page.tsx`**
- [ ] **Step 5: Run test to verify it passes**
- [ ] **Step 6: Commit Task 2**

---

### Task 3: 160+ WPM Performance Benchmark & Final Production Build

**Files:**
- Modify: `test/phase7.test.mts`
- Modify: `package.json`
- Modify: `GEMINI.md`

**Interfaces:**
- Stress tests 500 rapid keystrokes at simulated 160+ WPM (13.3+ keys/sec)
- Verifies full platform test suite (Phase 1 through Phase 7)
- Confirms clean production build via `next build`

- [ ] **Step 1: Add 160+ WPM throughput stress test to `test/phase7.test.mts`**
- [ ] **Step 2: Run test to verify 0 dropped frames and sub-1ms execution**
- [ ] **Step 3: Update `package.json` test script with `phase7.test.mts`**
- [ ] **Step 4: Run full test suite and `next build`**
- [ ] **Step 5: Update `GEMINI.md` to reflect complete platform architecture**
- [ ] **Step 6: Commit Task 3**
