/**
 * CodeType Core Typing Engine Types
 * Strict type definitions for test modes, keystroke telemetry, metrics, and adaptive learning.
 */

// ==========================================
// Test Modes & Configuration
// ==========================================

export type TestEngineMode = 'standard' | 'syntax' | 'keybr';

export type StandardTestType = 'words' | 'time' | 'quote' | 'zen';

export type StandardWordCount = 10 | 25 | 50 | 100 | 250;
export type StandardDurationSeconds = 15 | 30 | 60 | 120;

export interface StandardModeOptions {
  type: StandardTestType;
  wordCount?: StandardWordCount | number;
  duration?: StandardDurationSeconds | number;
  punctuation: boolean;
  numbers: boolean;
}

export type SupportedLanguage =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'rust'
  | 'go'
  | 'sql'
  | 'cpp'
  | 'html'
  | 'css';

export type SyntaxDrillCategory =
  | 'full-snippet'
  | 'weak-keys'
  | 'symbols-only'
  | 'keywords'
  | 'brackets-and-scopes';

export interface SyntaxModeOptions {
  language: SupportedLanguage;
  drillCategory: SyntaxDrillCategory;
  adaptiveWeakKeys: boolean;
  targetSymbols?: string[];
}

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

export interface EngineConfig {
  mode: TestEngineMode;
  standardOptions: StandardModeOptions;
  syntaxOptions: SyntaxModeOptions;
  soundProfile: SoundProfile;
  soundVolume: number; // 0.0 to 1.0
  caretStyle: CaretStyle;
  smoothCaret: boolean;
  theme: ThemeId;
  zenMode: boolean;
  blindMode: boolean;
  strictBackspace: boolean; // cannot backspace beyond word or error
}

// ==========================================
// Audio Profiles & Sounds
// ==========================================

export type SoundProfile = 'thock' | 'clicky' | 'silent';

export type KeySoundType = 'alphanumeric' | 'space' | 'backspace' | 'error';

// ==========================================
// Visual Presentation & Caret
// ==========================================

export type CaretStyle = 'line' | 'block' | 'underline' | 'box' | 'off';

export interface CaretCoordinates {
  top: number;
  left: number;
  width: number;
  height: number;
  visible: boolean;
}

// ==========================================
// Character & Token State
// ==========================================

export type CharacterStatus = 'pending' | 'correct' | 'incorrect' | 'corrected';

export interface CharacterItem {
  id: number;
  char: string;
  expected: string;
  status: CharacterStatus;
  inputChar?: string;
}

// ==========================================
// Keystroke Telemetry & Latency
// ==========================================

export interface KeystrokeRecord {
  /** Timestamp of keydown event in milliseconds relative to performance.now() or epoch */
  timestamp: number;
  /** Actual key value produced by event.key */
  key: string;
  /** Expected character at the active index */
  expected: string;
  /** Index in the target text buffer */
  index: number;
  /** Resulting validity status of this key */
  status: CharacterStatus;
  /** Flight time: milliseconds elapsed since the previous keypress */
  flightTimeMs: number;
  /** Dwell time: milliseconds elapsed between keydown and keyup for this key */
  dwellTimeMs?: number;
}

// ==========================================
// Metrics & Analysis (Law 2 Specification)
// ==========================================

export interface TypingMetrics {
  /**
   * Standard WPM:
   * ((Total Characters Typed / 5) - Uncorrected Errors) / Time in Minutes
   */
  wpm: number;

  /**
   * Raw WPM:
   * (Total Keystrokes / 5) / Time in Minutes
   */
  rawWpm: number;

  /**
   * Accuracy (%):
   * (Correct Keystrokes / Total Keystrokes) * 100
   */
  accuracy: number;

  /** Total keydown events processed */
  totalKeystrokes: number;

  /** Number of correctly typed characters currently in the buffer */
  correctCharacters: number;

  /** Total count of correct key strikes throughout test */
  correctKeystrokes: number;

  /** Total count of incorrect key strikes throughout test */
  incorrectKeystrokes: number;

  /** Uncorrected errors remaining in current buffer */
  uncorrectedErrors: number;

  /** Elapsed time in seconds */
  elapsedTime: number;

  /** Consistency percentage based on WPM standard deviation (0 - 100) */
  consistency: number;
}

export interface MetricSnapshot {
  second: number;
  wpm: number;
  rawWpm: number;
  errors: number;
}

export interface TestResult {
  id: string;
  timestamp: number;
  mode: TestEngineMode;
  config: EngineConfig;
  targetText: string;
  metrics: TypingMetrics;
  history: MetricSnapshot[];
  keystrokes: KeystrokeRecord[];
  weakKeys: CharacterAnalytics[];
}

// ==========================================
// Keybr-Style Weak-Key & Adaptive Learning
// ==========================================

export interface CharacterAnalytics {
  char: string;
  totalAttempts: number;
  errors: number;
  errorRate: number; // Percentage 0 - 100
  averageLatencyMs: number; // Flight time / response latency
  confidence: number; // 0.0 (untrained/weak) to 1.0 (mastered)
  lastUpdated: number;
}

export type HeatmapData = Record<string, CharacterAnalytics>;

export interface KeybrMasteryState {
  unlockedKeys: string[];
  currentKey: string;
  keyConfidences: Record<string, number>;
  overallMastery: number; // Percentage 0 - 100
}

// ==========================================
// Engine Status & Lifecycle
// ==========================================

export type EngineStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface EngineResetOptions {
  newText?: string;
  keepMode?: boolean;
}

