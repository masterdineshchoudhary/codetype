# CodeType Engine Specification & Architecture Plan

CodeType is a minimal, high-performance, developer-centric typing platform that combines the aesthetics and fluid testing mechanics of **Monkeytype** with the procedural learning and weak-key algorithmic training of **Keybr**, enhanced by developer-focused syntax drills and low-latency synthesized audio feedback.

---

## 1. Tech Stack & Non-Negotiable Standards

- **Framework:** Next.js (App Router, React 19)
- **Language:** TypeScript (Strict mode, `noImplicitAny: true`, zero `any`)
- **Styling:** Tailwind CSS + CSS Variables (Monochrome dark palette by default, pure high-contrast minimal aesthetic)
- **Component Primitives:** Unstyled accessible primitives & pure custom React components
- **Audio Engine:** Web Audio API (Sub-10ms synthesized mechanical switches without external audio asset downloads)
- **Icons:** Lucide React
- **Storage:** `localStorage` for quick preferences & weak-key profiles, expandable to IndexedDB for historical sessions

---

## 2. Core Architecture & Performance Laws

### Law 1: Zero Re-Render Text Tree on Keystroke
- At 120+ WPM (10+ keystrokes/sec), triggering a full React re-render per keystroke drops animation frames and introduces input latency.
- State management for active keystrokes, buffer indices, and telemetry is maintained strictly in memory refs (`activeIndexRef`, `charStatesRef`, `keystrokesRef`).
- Updates to individual character states (`pending`, `correct`, `incorrect`, `active`) use fine-grained DOM mutation (`data-status`, `classList`) and direct subscriber callbacks.
- Caret coordinates are computed and smoothly translated via `requestAnimationFrame` with hardware-accelerated `translate3d(x, y, 0)`.

### Law 2: Standard Metric Accuracy & Keystroke Telemetry
- **Standard WPM:**
  $$\text{WPM} = \frac{(\text{Total Characters Typed} / 5) - \text{Uncorrected Errors}}{\text{Time in Minutes}}$$
- **Raw WPM:**
  $$\text{Raw WPM} = \frac{\text{Total Keystrokes} / 5}{\text{Time in Minutes}}$$
- **Accuracy (%):**
  $$\text{Accuracy} = \frac{\text{Correct Keystrokes}}{\text{Total Keystrokes}} \times 100$$
- **Consistency (%):**
  Coefficient of variation calculated across 1-second WPM snapshots:
  $$\text{Consistency} = 100 - \left(\frac{\sigma_{\text{WPM}}}{\mu_{\text{WPM}}} \times 100\right)$$
- **Telemetry:** Per-character telemetry tracks exact timestamp, flight time (milliseconds since previous keydown), dwell time, and uncorrected error tallies to continuously feed adaptive learning algorithms.

---

## 3. Subsystem Specifications

### Subsystem A: Dual-Engine Core
1. **Standard Mode (Monkeytype Style):**
   - Timed sprints (15s, 30s, 60s, 120s) with countdown ticker.
   - Word count sprints (10, 25, 50, 100, 250 words) with elapsed ticker.
   - Configurable punctuation (`@ punctuation`) and numbers (`# numbers`).
2. **Syntax Mode (Keybr + Developer Style):**
   - Supported languages: TypeScript, JavaScript, Python, Rust, Go, SQL, C++, HTML, CSS.
   - Syntax drill presets: Full realistic snippets, syntax symbol drills (`{}`, `=>`, `===`, `()`, `&&`, `||`, `<>`), and bracket-pairing drills.
   - Procedural pseudo-token generator targeting characters with high error rate or high latency.

### Subsystem B: Low-Latency Physical Switch Audio Engine
- Built directly on top of browser `AudioContext`.
- **Profiles:**
  1. **Thock (Lubed Linear Switch):** Low-frequency transient stem contact + exponential pitch drop (145Hz $\to$ 58Hz) through a resonant low-pass filter (460Hz, $Q=2.2$).
  2. **Clicky (Mechanical Click Leaf):** Sharp high-frequency leaf snap (3100Hz with high-pass filter) + bottom-out clack (420Hz).
  3. **Silent:** Muted operation.
- **Acoustic Nuances:**
  - **Spacebar:** Deep chassis resonance (105Hz $\to$ 42Hz) with longer decay.
  - **Backspace:** Subtle hollow tap with higher resonant cutoff.
  - **Error Chirp:** Tactile muted friction click using dual dissonant frequencies (220Hz + 262Hz minor third) for instant error perception without jarring noise.
  - **Anti-Machine-Gun Variation:** Random frequency jitter ($\pm 2.5\%$) and gain variation per keystroke for natural acoustic feel.

### Subsystem C: Advanced Keybr Progressive Mastery Engine
- **Sequential Key Unlocking:**
  - Keybr progression order: begins with 6 core home row letters (`e`, `n`, `i`, `t`, `r`, `l`).
  - Next key unlocks only when all currently active keys achieve a **Mastery Confidence $\ge 0.85$**.
- **Confidence Mathematical Formula:**
  $$\text{Score}_{\text{accuracy}} = \max\left(0, 1 - \frac{\text{ErrorRate}}{100}\right)$$
  $$\text{Score}_{\text{speed}} = \min\left(1, \max\left(0, 1 - \frac{\text{Latency}_{\text{avg}} - 120}{300}\right)\right)$$
  $$\text{Confidence} = 0.70 \times \text{Score}_{\text{accuracy}} + 0.30 \times \text{Score}_{\text{speed}}$$
- **Markov / N-Gram Pseudo-Word Generator:**
  - Generates pronounceable pseudo-words and code identifiers emphasizing active unlocked letters and user-specific weak keys.

### Subsystem D: Developer Syntax Tokenizer & Snippet Ingestion
- **Tokenized Monospace Spans:**
  - Lightweight syntax token classification without AST re-render overhead.
  - Identifiers, keywords, operators, strings, and punctuation rendered with subtle high-contrast syntax colors.
- **Custom Snippet Loader:**
  - User can paste code or load local source files (`.ts`, `.py`, `.rs`, `.go`, `.sql`).
  - Automatic indentation and newline normalization.

### Subsystem E: Command Palette (`Cmd + K`) & Multi-Theme Engine
- Keyboard-accessible modal triggered via `Cmd + K` or `Tab + Enter`.
- Fast fuzzy search across:
  - Test mode (Standard vs. Syntax, timed durations, word counts).
  - Language selection (TypeScript, Python, Rust, Go, SQL).
  - Switch audio profile (Thock, Clicky, Silent, Volume).
  - Caret styles (`line`, `block`, `underline`, `box`).
  - Theme switcher.
- **Theme Presets (CSS Custom Properties):**
  - **Monochrome Minimal (Default):** Deep black (`#0e0f12`), muted gray (`#646669`), crisp white (`#d1d0c5`), amber gold accent (`#e2b714`).
  - **Carbon:** Cool charcoal background, cyan accent, icy white text.
  - **Matrix:** Pitch black background, phosphor green text and caret.
  - **Nord:** Arctic blue-gray background, snow white text, frost blue accent.
  - **Cyberpunk:** Neon magenta/yellow contrast palette.

### Subsystem F: Post-Test Analytics & Heatmap Visualization
- **Comprehensive Summary Modal:**
  - Net WPM, Raw WPM, Accuracy %, Consistency %, Elapsed Time.
  - Character breakdown: Correct / Errors / Total Keystrokes.
- **Interactive SVG Consistency Curve:**
  - Second-by-second WPM and Raw WPM line graphs with error points.
- **Visual Keyboard Heatmap:**
  - On-screen keyboard layout highlighting keys by error rate and latency.

---

## 4. Complete Directory Structure

```
codetype/
├── app/
│   ├── layout.tsx                # Root layout, theme variables, meta tags
│   ├── page.tsx                  # Typing arena with Zen Mode and shortcut handlers
│   └── globals.css               # Monochrome styling, theme variables, character states
├── components/
│   ├── controls/
│   │   ├── ModeToggle.tsx        # Standard vs. Syntax dual-engine selector
│   │   ├── SoundSelector.tsx     # Thock / Clicky / Silent profile & volume slider
│   │   ├── LanguageSelector.tsx  # Programming language selector
│   │   └── CommandPalette.tsx    # Cmd+K fuzzy action palette
│   ├── engine/
│   │   ├── TypingArea.tsx        # 3-line viewport scrolling arena & hidden focus input
│   │   ├── Caret.tsx             # Hardware-accelerated translate3d caret
│   │   ├── CharacterSpan.tsx     # Zero re-render character span with ref registration
│   │   └── MetricsOverlay.tsx    # Live HUD for live WPM, Accuracy, and countdown
│   ├── results/
│   │   ├── ResultsModal.tsx      # Comprehensive post-test statistics modal
│   │   ├── HeatmapKeyboard.tsx   # Interactive on-screen keyboard heatmap
│   │   └── ConsistencyChart.tsx  # SVG rhythm and WPM timeline chart
│   └── ui/
│       ├── Modal.tsx             # Accessible dialog primitive
│       └── Tooltip.tsx           # Minimal tooltip helper
├── hooks/
│   ├── useTypingEngine.ts        # Core engine: memory refs, keystroke handling, telemetry
│   ├── useSoundEffects.ts        # Audio controller hook
│   ├── useAdaptiveLearning.ts    # Weak-key tracking & localStorage persistence
│   ├── useKeybrMastery.ts        # Progressive letter unlock & mastery progression
│   └── useCommandPalette.ts      # Keyboard shortcut listener for Cmd+K
├── lib/
│   ├── algorithms/
│   │   ├── metrics.ts            # Mathematical WPM, accuracy, consistency formulas
│   │   ├── keybrGenerator.ts     # Keybr-style adaptive pseudo-word and symbol drill generator
│   │   └── masteryAlgorithm.ts   # Progressive unlocking and confidence scoring
│   ├── audio/
│   │   └── soundSynth.ts         # Pure Web Audio API mechanical switch synthesizer
│   ├── snippets/
│   │   ├── typescript.ts         # TypeScript snippets and symbol drill lists
│   │   ├── python.ts             # Python snippets and symbol drill lists
│   │   ├── sql.ts                # SQL snippets and symbol drill lists
│   │   ├── rust.ts               # Rust snippets and symbol drill lists
│   │   └── go.ts                 # Go snippets and symbol drill lists
│   └── themes/
│       └── themeDefinitions.ts   # Monochrome, Carbon, Matrix, Nord, Cyberpunk configs
├── test/
│   └── phase1.test.mts           # Test suite for metric formulas and audio synth
└── types/
    └── typing.ts                 # Strict TypeScript types for entire platform
```

---

## 5. Phased Implementation Roadmap & Status

### Phase 1: Core Engine Hook & Low-Latency Audio Synthesizer ✅ COMPLETED
- [x] Defined all data models and telemetry structures in `types/typing.ts`.
- [x] Implemented `lib/audio/soundSynth.ts` with synthesized Thock, Clicky, Space, Backspace, and Error chirps.
- [x] Implemented `lib/algorithms/metrics.ts` conforming strictly to Law 2 metrics.
- [x] Built `hooks/useTypingEngine.ts` with memory ref architecture, zero text re-render lag, and RAF caret tracking.
- [x] Unit test suite in `test/phase1.test.mts` verified.

### Phase 2: Typing Interface, Caret Math, & Adaptive Generator ✅ COMPLETED
- [x] Built `components/engine/CharacterSpan.tsx` with direct ref registration for 0ms visual updates.
- [x] Built `components/engine/Caret.tsx` with `translate3d` positioning and line/block/underline/box styles.
- [x] Built `components/engine/TypingArea.tsx` with automatic 3-line window viewport scrolling.
- [x] Built `components/engine/MetricsOverlay.tsx` live HUD.
- [x] Created code snippet repositories for TypeScript, Python, and SQL.
- [x] Built `lib/algorithms/keybrGenerator.ts` and `hooks/useAdaptiveLearning.ts`.
- [x] Built `components/controls/ModeToggle.tsx`, `SoundSelector.tsx`, and `LanguageSelector.tsx`.
- [x] Built `components/results/ResultsModal.tsx` and `HeatmapKeyboard.tsx`.
- [x] Integrated `app/page.tsx`, `app/globals.css`, and Zen Mode; verified production build via `next build`.

---

### Phase 3: Command Palette (`Cmd + K`) & Multi-Theme System ✅ COMPLETED
- [x] **Command Palette Modal (`components/controls/CommandPalette.tsx`):**
  - Global hotkey listener for `Cmd + K` (Mac) / `Ctrl + K` (Windows) and `Tab + Enter`.
  - Fuzzy-searchable action items: Quick restart, mode change, switch audio profile, change language, change theme.
- [x] **Multi-Theme Engine (`lib/themes/themeDefinitions.ts`):**
  - Support 5 high-contrast themes: **Monochrome**, **Carbon**, **Matrix**, **Nord**, and **Cyberpunk**.
  - Dynamic CSS variable switching applied to document root with instant persistence.
- [x] **Custom Caret Selector:**
  - Live configuration of caret style (`line`, `block`, `underline`, `box`) and smooth transition speeds.

---

### Phase 4: Keybr Progressive Mastery & Sequential Unlock Engine ✅ COMPLETED
- [x] **Progressive Unlock Rules (`lib/algorithms/masteryAlgorithm.ts`):**
  - Implement sequential letter unlocking stage: starts with `e, n, i, t, r, l`.
  - Compute moving window confidence per unlocked key; trigger unlock of next letter when all active keys reach confidence $\ge 0.85$.
- [x] **Markov / N-Gram Generator:**
  - Procedurally constructs syllables and pseudo-words combining only unlocked letters, heavily biasing toward the lowest confidence characters.
- [x] **Mastery Progress Bar UI:**
  - Visual display showing current letter tier, unlocked alphabet status, and mastery percentages.

---

### Phase 5: Syntax Tokenizer & Real Code Ingestion ⏳ NEXT
- [ ] **Zero-Lag Syntax Colorizer:**
  - Classify tokens into syntax categories (keyword, string, operator, bracket, identifier) at initialization.
  - Style characters with minimal CSS variable syntax tokens without increasing keystroke overhead.
- [ ] **Expanded Language Libraries:**
  - Add idiomatic snippets for **Rust** (`Option`, `Result`, pattern matching) and **Go** (goroutines, channels, error handling).
- [ ] **Custom File / Snippet Loader:**
  - Modal allowing users to paste code or drag-and-drop source code files with automatic indentation handling.

### Phase 6: Post-Test Rhythm & Consistency Charting ⏳ UPCOMING
- [ ] **SVG Consistency Chart (`components/results/ConsistencyChart.tsx`):**
  - Zero-dependency SVG timeline rendering live WPM and Raw WPM curves over test duration.
  - Point indicators for error moments and burst periods.
- [ ] **Flight-Time Latency Histogram:**
  - Chart showing user key-to-key latency distribution (inter-keystroke interval in milliseconds).

### Phase 7: Production Hardening, Audio Buffering & PWA ⏳ FINAL
- [ ] Offline PWA support with service worker manifest.
- [ ] Web Audio background suspension handling across all mobile and desktop browsers.
- [ ] Comprehensive performance profiling ensuring 0 dropped frames at 160+ WPM.