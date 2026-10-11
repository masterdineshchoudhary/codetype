# Phase 6: Post-Test Rhythm & Consistency Charting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build zero-dependency, high-performance SVG visual analytics for post-test review: an interactive WPM/Raw WPM timeline curve with error flags and an inter-keystroke flight-time latency histogram.

**Architecture:**
- **SVG Consistency Curve (`ConsistencyChart.tsx`):** Pure SVG timeline drawing smooth second-by-second curves for Net WPM and Raw WPM, error dot indicators, hover inspection crosshairs, and background rhythm grid.
- **Flight-Time Latency Histogram (`LatencyHistogram.tsx`):** Computes inter-keystroke intervals (flight time in milliseconds) from raw `KeystrokeRecord[]` telemetry, groups into latency bins, and renders an interactive SVG bar histogram with median and 95th percentile markers.
- **Enhanced Results Modal (`ResultsModal.tsx`):** Integrates the timeline curve and latency histogram alongside the weak-key keyboard heatmap, switchable via minimal tab buttons.

**Tech Stack:** Next.js 15, React 19, TypeScript (Strict), Tailwind CSS v4, Lucide React, SVG math.

**Spec:** [GEMINI.md](file:///Users/dineshchoudhary/Developer/personal/codetype/GEMINI.md) Subsystem F.

## Global Constraints
- Zero external charting libraries (e.g. no Chart.js, no Recharts, no D3 dependency) — pure declarative SVG for maximum speed and zero bundle bloat.
- Zero re-render overhead during typing; calculations happen only when opening `ResultsModal`.
- Strict TypeScript: `noImplicitAny: true`, zero `any`.
- Unit test suite in `test/phase6.test.mts`.

## Review Focus
1. **Short sprints (< 3 seconds):** Chart must handle edge cases where `history.length <= 2` without NaN or degenerate SVG paths (`M 0 0`).
2. **Zero keystrokes / empty telemetry:** Histogram must gracefully display empty state if test was aborted or contains no key records.
3. **Extreme latency outliers (> 1000ms):** Bins must cap gracefully into a trailing `> 400ms` or overflow bucket so outliers don't skew the axis.
4. **SVG scaling and responsiveness:** Curves and bars must scale smoothly inside `viewBox` across desktop and mobile screens.
5. **Theme variables:** Chart colors must bind to CSS variables (`--accent`, `--text-dim`, `--border-subtle`, `--error-color`).

---

### Task 1: Timeline Curve Math & SVG ConsistencyChart Component

**Files:**
- Create: `lib/algorithms/chartMath.ts`
- Create: `components/results/ConsistencyChart.tsx`
- Test: `test/phase6.test.mts`

**Interfaces:**
- Produces: `generateSvgPath(points: { x: number; y: number }[]): string`
- Produces: `computeTimelineBounds(history: MetricSnapshot[]): { minWpm: number; maxWpm: number; duration: number }`
- Produces: `<ConsistencyChart history={result.history} />`

- [ ] **Step 1: Write tests for timeline path generator and bounds calculation in `test/phase6.test.mts`**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `lib/algorithms/chartMath.ts` with coordinate mapping and SVG path math**
- [ ] **Step 4: Implement `components/results/ConsistencyChart.tsx` with dual Net/Raw lines, error dots, and interactive hover tooltip**
- [ ] **Step 5: Run test to verify it passes**
- [ ] **Step 6: Commit Task 1**

---

### Task 2: Flight-Time Latency Analysis & LatencyHistogram Component

**Files:**
- Modify: `lib/algorithms/chartMath.ts`
- Create: `components/results/LatencyHistogram.tsx`
- Test: `test/phase6.test.mts`

**Interfaces:**
- Produces: `computeLatencyBuckets(keystrokes: KeystrokeRecord[]): { buckets: LatencyBucket[]; medianMs: number; p95Ms: number; avgMs: number }`
- Produces: `<LatencyHistogram keystrokes={result.keystrokes} />`

- [ ] **Step 1: Add tests for latency distribution and percentile math in `test/phase6.test.mts`**
- [ ] **Step 2: Run test to verify it fails**
- [ ] **Step 3: Implement `computeLatencyBuckets` in `lib/algorithms/chartMath.ts`**
- [ ] **Step 4: Implement `components/results/LatencyHistogram.tsx` rendering SVG frequency bars, median line, and speed tiers**
- [ ] **Step 5: Run test to verify it passes**
- [ ] **Step 6: Commit Task 2**

---

### Task 3: ResultsModal Tabbed Analytics Integration & Verification

**Files:**
- Modify: `components/results/ResultsModal.tsx`
- Modify: `package.json`
- Test: `test/phase6.test.mts`

**Interfaces:**
- `ResultsModal` renders view tabs: `Timeline`, `Heatmap`, and `Latency`
- Fully passes full test suite and Next.js production build

- [ ] **Step 1: Add end-to-end telemetry integration assertions to `test/phase6.test.mts`**
- [ ] **Step 2: Update `ResultsModal.tsx` with view switcher tabs for Consistency Timeline, Heatmap, and Latency Distribution**
- [ ] **Step 3: Update `package.json` test script to include `phase6.test.mts`**
- [ ] **Step 4: Run full test suite and Next.js build**
- [ ] **Step 5: Commit Task 3**
