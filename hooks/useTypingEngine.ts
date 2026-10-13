/**
 * CodeType Core Typing Engine Hook (useTypingEngine)
 * High-performance typing engine adhering strictly to Law 1 & Law 2:
 * 1. Zero re-render lag: Text tree is not re-rendered per keystroke;
 *    character states are updated via fine-grained refs/DOM dispatch.
 * 2. Accurate WPM, Raw WPM, Accuracy, and Flight-time Telemetry.
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  CaretCoordinates,
  CharacterAnalytics,
  CharacterStatus,
  EngineConfig,
  EngineStatus,
  HeatmapData,
  KeySoundType,
  KeystrokeRecord,
  MetricSnapshot,
  TestResult,
  TypingMetrics,
} from '../types/typing';
import { getSoundSynth, SoundSynth } from '../lib/audio/soundSynth';
import {
  buildHeatmapFromKeystrokes,
  calculateAccuracy,
  calculateRawWpm,
  calculateStandardWpm,
  computeTypingMetrics,
} from '../lib/algorithms/metrics';

export interface UseTypingEngineProps {
  targetText: string;
  config?: Partial<EngineConfig>;
  onComplete?: (result: TestResult) => void;
  onKeystroke?: (record: KeystrokeRecord) => void;
  onReset?: () => void;
}

export interface UseTypingEngineReturn {
  // Status & Metadata
  status: EngineStatus;
  targetText: string;
  isCompleted: boolean;
  isPaused: boolean;

  // Real-time Metrics (throttled updates to avoid re-render lag)
  metrics: TypingMetrics;
  elapsedTime: number;
  timeRemaining: number | null;

  // Caret
  caretCoords: CaretCoordinates;
  containerRef: React.RefObject<HTMLDivElement | null>;
  caretRef: React.RefObject<HTMLDivElement | null>;

  // Controls & Actions
  handleKeyDown: (e: React.KeyboardEvent | KeyboardEvent) => void;
  resetTest: (newText?: string) => void;
  exitTyping: () => void;
  pauseTest: () => void;
  resumeTest: () => void;

  // Fine-Grained DOM & Subscriber Registration (Law 1)
  registerCharElement: (index: number, el: HTMLElement | null) => void;
  subscribeChar: (
    index: number,
    listener: (status: CharacterStatus, inputChar?: string) => void
  ) => () => void;
  subscribeCaret: (listener: (coords: CaretCoordinates) => void) => () => void;
  subscribeActiveChar: (listener: (char: string) => void) => () => void;
  getCharStatus: (index: number) => CharacterStatus;
  getActiveIndex: () => number;

  // Result & Analytics
  result: TestResult | null;
  analytics: HeatmapData;
  soundSynth: SoundSynth;
}

const DEFAULT_CONFIG: EngineConfig = {
  mode: 'standard',
  standardOptions: {
    type: 'words',
    wordCount: 25,
    punctuation: false,
    numbers: false,
  },
  syntaxOptions: {
    language: 'typescript',
    drillCategory: 'full-snippet',
    adaptiveWeakKeys: false,
  },
  soundProfile: 'thock',
  soundVolume: 0.5,
  caretStyle: 'line',
  smoothCaret: true,
  theme: 'monochrome',
  zenMode: false,
  blindMode: false,
  strictBackspace: false,
};

const INITIAL_METRICS: TypingMetrics = {
  wpm: 0,
  rawWpm: 0,
  accuracy: 100,
  totalKeystrokes: 0,
  correctCharacters: 0,
  correctKeystrokes: 0,
  incorrectKeystrokes: 0,
  uncorrectedErrors: 0,
  elapsedTime: 0,
  consistency: 100,
};

const INITIAL_CARET: CaretCoordinates = {
  top: 0,
  left: 0,
  width: 2,
  height: 24,
  visible: true,
};

export function useTypingEngine({
  targetText: initialTargetText,
  config: userConfig,
  onComplete,
  onKeystroke,
  onReset,
}: UseTypingEngineProps): UseTypingEngineReturn {
  const mergedConfig = useRef<EngineConfig>({ ...DEFAULT_CONFIG, ...userConfig });
  mergedConfig.current = { ...DEFAULT_CONFIG, ...userConfig };

  const [text, setText] = useState<string>(initialTargetText || '');
  const [status, setStatus] = useState<EngineStatus>('idle');
  const [metrics, setMetrics] = useState<TypingMetrics>(INITIAL_METRICS);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    mergedConfig.current.standardOptions.type === 'time'
      ? (mergedConfig.current.standardOptions.duration ?? 30)
      : null
  );
  const [caretCoords, setCaretCoords] = useState<CaretCoordinates>(INITIAL_CARET);
  const [result, setResult] = useState<TestResult | null>(null);
  const [analytics, setAnalytics] = useState<HeatmapData>({});

  // Audio Synthesizer Reference
  const soundSynthRef = useRef<SoundSynth>(getSoundSynth());

  // Mutable In-Memory Refs for High-Frequency State (Law 1)
  const activeIndexRef = useRef<number>(0);
  const charStatesRef = useRef<CharacterStatus[]>([]);
  const inputCharsRef = useRef<string[]>([]);
  const keystrokesRef = useRef<KeystrokeRecord[]>([]);
  const statusRef = useRef<EngineStatus>('idle');
  const startTimeRef = useRef<number | null>(null);
  const lastKeyTimeRef = useRef<number>(0);
  const historyRef = useRef<MetricSnapshot[]>([]);

  // Keystroke counters
  const totalKeystrokesRef = useRef<number>(0);
  const correctKeystrokesRef = useRef<number>(0);
  const incorrectKeystrokesRef = useRef<number>(0);
  const uncorrectedErrorsRef = useRef<number>(0);
  const correctCharsRef = useRef<number>(0);

  // DOM and Subscriber Maps
  const containerRef = useRef<HTMLDivElement | null>(null);
  const caretRef = useRef<HTMLDivElement | null>(null);
  const charElementsMap = useRef<Map<number, HTMLElement>>(new Map());
  const charListenersMap = useRef<
    Map<number, Set<(status: CharacterStatus, inputChar?: string) => void>>
  >(new Map());
  const caretListenersRef = useRef<Set<(coords: CaretCoordinates) => void>>(new Set());
  const activeCharListenersRef = useRef<Set<(char: string) => void>>(new Set());

  const notifyActiveChar = useCallback((char: string) => {
    activeCharListenersRef.current.forEach((listener) => listener(char));
  }, []);
  const caretRafRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update sound synth config
  useEffect(() => {
    soundSynthRef.current.setProfile(mergedConfig.current.soundProfile);
    soundSynthRef.current.setVolume(mergedConfig.current.soundVolume);
  }, [userConfig?.soundProfile, userConfig?.soundVolume]);

  // Synchronize target text changes
  useEffect(() => {
    if (initialTargetText !== text) {
      resetTest(initialTargetText);
    }
  }, [initialTargetText]);

  // Initialize character state buffer
  const initializeBuffers = useCallback((targetStr: string) => {
    activeIndexRef.current = 0;
    charStatesRef.current = new Array(targetStr.length).fill('pending');
    inputCharsRef.current = new Array(targetStr.length).fill('');
    keystrokesRef.current = [];
    historyRef.current = [];
    totalKeystrokesRef.current = 0;
    correctKeystrokesRef.current = 0;
    incorrectKeystrokesRef.current = 0;
    uncorrectedErrorsRef.current = 0;
    correctCharsRef.current = 0;
    startTimeRef.current = null;
    lastKeyTimeRef.current = 0;

    // Reset DOM styling on registered elements
    charElementsMap.current.forEach((el, idx) => {
      el.setAttribute('data-status', 'pending');
      el.classList.remove('char-correct', 'char-incorrect', 'char-corrected', 'char-active');
      if (idx === 0) {
        el.classList.add('char-active');
      }
    });

    // Notify character subscribers
    charListenersMap.current.forEach((listeners) => {
      listeners.forEach((listener) => listener('pending', ''));
    });

    // Notify active char listeners with initial character
    notifyActiveChar(targetStr[0] || '');
  }, [notifyActiveChar]);

  /**
   * Fluid Caret Positioning Math (Law 1)
   * Computes caret bounding client rect using requestAnimationFrame.
   */
  const updateCaretPosition = useCallback(() => {
    if (caretRafRef.current !== null) {
      cancelAnimationFrame(caretRafRef.current);
    }

    caretRafRef.current = requestAnimationFrame(() => {
      const activeIdx = activeIndexRef.current;
      const container = containerRef.current;
      const targetEl = charElementsMap.current.get(activeIdx);

      if (!container || !targetEl) {
        // Fallback for end of line or empty buffer
        if (container && activeIdx > 0) {
          const prevEl = charElementsMap.current.get(activeIdx - 1);
          if (prevEl) {
            const containerRect = container.getBoundingClientRect();
            const prevRect = prevEl.getBoundingClientRect();
            const newCoords: CaretCoordinates = {
              top: prevRect.top - containerRect.top + container.scrollTop,
              left: prevRect.right - containerRect.left + container.scrollLeft,
              width: 2,
              height: prevRect.height || 24,
              visible: true,
            };
            setCaretCoords(newCoords);
            caretListenersRef.current.forEach((l) => l(newCoords));
            if (caretRef.current) {
              caretRef.current.style.transform = `translate3d(${newCoords.left}px, ${newCoords.top}px, 0)`;
              caretRef.current.style.height = `${newCoords.height}px`;
            }
          }
        }
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const charRect = targetEl.getBoundingClientRect();

      const newCoords: CaretCoordinates = {
        top: charRect.top - containerRect.top + container.scrollTop,
        left: charRect.left - containerRect.left + container.scrollLeft,
        width: mergedConfig.current.caretStyle === 'block' ? charRect.width : 2,
        height: charRect.height || 24,
        visible: true,
      };

      setCaretCoords(newCoords);
      caretListenersRef.current.forEach((listener) => listener(newCoords));

      if (caretRef.current) {
        caretRef.current.style.transform = `translate3d(${newCoords.left}px, ${newCoords.top}px, 0)`;
        caretRef.current.style.height = `${newCoords.height}px`;
        if (mergedConfig.current.caretStyle === 'block') {
          caretRef.current.style.width = `${newCoords.width}px`;
        }
      }
    });
  }, []);

  /**
   * Registers a character span's DOM element for direct, zero-re-render manipulation
   */
  const registerCharElement = useCallback(
    (index: number, el: HTMLElement | null) => {
      if (el) {
        charElementsMap.current.set(index, el);
        // Sync current status to element
        const status = charStatesRef.current[index] || 'pending';
        el.setAttribute('data-status', status);
        if (index === activeIndexRef.current) {
          el.classList.add('char-active');
        }
      } else {
        charElementsMap.current.delete(index);
      }
    },
    []
  );

  /**
   * Fine-grained subscriber for individual character components
   */
  const subscribeChar = useCallback(
    (index: number, listener: (status: CharacterStatus, inputChar?: string) => void) => {
      if (!charListenersMap.current.has(index)) {
        charListenersMap.current.set(index, new Set());
      }
      charListenersMap.current.get(index)!.add(listener);

      // Immediate trigger with current state
      listener(
        charStatesRef.current[index] || 'pending',
        inputCharsRef.current[index] || ''
      );

      return () => {
        const listeners = charListenersMap.current.get(index);
        if (listeners) {
          listeners.delete(listener);
          if (listeners.size === 0) {
            charListenersMap.current.delete(index);
          }
        }
      };
    },
    []
  );

  /**
   * Subscribe to caret coordinate updates
   */
  const subscribeCaret = useCallback(
    (listener: (coords: CaretCoordinates) => void) => {
      caretListenersRef.current.add(listener);
      listener(caretCoords);
      return () => {
        caretListenersRef.current.delete(listener);
      };
    },
    [caretCoords]
  );

  /**
   * Subscribe to the next active character to guide keyboard maps with zero text-tree re-render
   */
  const subscribeActiveChar = useCallback(
    (listener: (char: string) => void) => {
      activeCharListenersRef.current.add(listener);
      listener(text[activeIndexRef.current] || '');
      return () => {
        activeCharListenersRef.current.delete(listener);
      };
    },
    [text]
  );

  /**
   * Updates an individual character's status with zero text-tree re-render
   */
  const updateCharacterAt = useCallback(
    (index: number, status: CharacterStatus, inputChar: string = '') => {
      charStatesRef.current[index] = status;
      inputCharsRef.current[index] = inputChar;

      // 1. Direct DOM manipulation (instant 0ms response)
      const el = charElementsMap.current.get(index);
      if (el) {
        el.setAttribute('data-status', status);
        el.classList.remove('char-pending', 'char-correct', 'char-incorrect', 'char-corrected');
        el.classList.add(`char-${status}`);
      }

      // 2. Fine-grained React subscriber notification
      const listeners = charListenersMap.current.get(index);
      if (listeners) {
        listeners.forEach((listener) => listener(status, inputChar));
      }
    },
    []
  );

  /**
   * Concludes the test session and synthesizes complete telemetry & metrics
   */
  const finishTest = useCallback(() => {
    if (statusRef.current === 'completed') return;

    statusRef.current = 'completed';
    setStatus('completed');

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    const now = performance.now();
    const durationSeconds = startTimeRef.current
      ? Math.max(0.5, (now - startTimeRef.current) / 1000)
      : 1;

    // Recalculate uncorrected errors in final buffer
    let finalUncorrected = 0;
    let finalCorrect = 0;
    for (let i = 0; i < activeIndexRef.current; i++) {
      if (charStatesRef.current[i] === 'incorrect') {
        finalUncorrected++;
      } else if (charStatesRef.current[i] === 'correct') {
        finalCorrect++;
      }
    }

    const finalMetrics = computeTypingMetrics({
      totalKeystrokes: totalKeystrokesRef.current,
      correctKeystrokes: correctKeystrokesRef.current,
      incorrectKeystrokes: incorrectKeystrokesRef.current,
      correctCharacters: finalCorrect,
      uncorrectedErrors: finalUncorrected,
      elapsedSeconds: durationSeconds,
      history: historyRef.current,
    });

    const sessionAnalytics = buildHeatmapFromKeystrokes(keystrokesRef.current, analytics);
    setAnalytics(sessionAnalytics);
    setMetrics(finalMetrics);
    setElapsedTime(durationSeconds);

    const testResult: TestResult = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `test-${Date.now()}`,
      timestamp: Date.now(),
      mode: mergedConfig.current.mode,
      config: mergedConfig.current,
      targetText: text,
      metrics: finalMetrics,
      history: [...historyRef.current],
      keystrokes: [...keystrokesRef.current],
      weakKeys: Object.values(sessionAnalytics).filter((k) => k.errorRate > 0 || k.confidence < 0.8),
    };

    setResult(testResult);
    onComplete?.(testResult);
  }, [analytics, onComplete, text]);

  /**
   * Resets typing test state cleanly
   */
  const resetTest = useCallback(
    (newText?: string) => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      if (caretRafRef.current !== null) {
        cancelAnimationFrame(caretRafRef.current);
        caretRafRef.current = null;
      }

      const activeText = newText !== undefined ? newText : text;
      setText(activeText);
      statusRef.current = 'idle';
      setStatus('idle');
      setMetrics(INITIAL_METRICS);
      setElapsedTime(0);
      setResult(null);

      const initialDuration =
        mergedConfig.current.standardOptions.type === 'time'
          ? (mergedConfig.current.standardOptions.duration ?? 30)
          : null;
      setTimeRemaining(initialDuration);

      initializeBuffers(activeText);

      // Re-position caret to index 0
      requestAnimationFrame(() => {
        updateCaretPosition();
      });

      onReset?.();
    },
    [initializeBuffers, onReset, text, updateCaretPosition]
  );

  /**
   * Starts live metrics ticking interval (batches updates at 500ms intervals to eliminate frame drops)
   */
  const startTimerTicker = useCallback(() => {
    if (timerIntervalRef.current) return;

    timerIntervalRef.current = setInterval(() => {
      if (statusRef.current !== 'running' || !startTimeRef.current) return;

      const now = performance.now();
      const elapsedSec = (now - startTimeRef.current) / 1000;
      setElapsedTime(Math.round(elapsedSec * 10) / 10);

      const isTimeMode = mergedConfig.current.standardOptions.type === 'time';
      const duration = mergedConfig.current.standardOptions.duration ?? 30;

      if (isTimeMode) {
        const remaining = Math.max(0, Math.ceil(duration - elapsedSec));
        setTimeRemaining(remaining);
        if (remaining <= 0) {
          finishTest();
          return;
        }
      }

      const currentWpm = calculateStandardWpm(
        correctCharsRef.current,
        uncorrectedErrorsRef.current,
        elapsedSec
      );
      const currentRawWpm = calculateRawWpm(totalKeystrokesRef.current, elapsedSec);

      // Snapshot for consistency curve (one record per integer second)
      const secondInt = Math.floor(elapsedSec);
      if (secondInt > 0 && (historyRef.current.length === 0 || historyRef.current[historyRef.current.length - 1].second !== secondInt)) {
        historyRef.current.push({
          second: secondInt,
          wpm: currentWpm,
          rawWpm: currentRawWpm,
          errors: uncorrectedErrorsRef.current,
        });
      }

      // Live UI metrics update (smooth 250ms response)
      setMetrics((prev) => ({
        ...prev,
        wpm: currentWpm,
        rawWpm: currentRawWpm,
        accuracy: calculateAccuracy(
          correctKeystrokesRef.current,
          totalKeystrokesRef.current
        ),
        totalKeystrokes: totalKeystrokesRef.current,
        correctCharacters: correctCharsRef.current,
        correctKeystrokes: correctKeystrokesRef.current,
        incorrectKeystrokes: incorrectKeystrokesRef.current,
        uncorrectedErrors: uncorrectedErrorsRef.current,
        elapsedTime: Math.round(elapsedSec * 10) / 10,
      }));
    }, 250);
  }, [finishTest]);

  /**
   * Primary Keystroke Event Handler
   * Designed for sub-millisecond execution per keypress without text re-render.
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent | KeyboardEvent) => {
      // 1. Handle shortcuts: Tab = quick reset
      if (e.key === 'Tab') {
        e.preventDefault();
        resetTest();
        return;
      }

      // 2. Handle Escape: exit typing mode / reset cleanly
      if (e.key === 'Escape') {
        e.preventDefault();
        resetTest();
        return;
      }

      // Ignore modifier combinations (except Backspace deletions)
      if (e.ctrlKey || e.metaKey || e.altKey) {
        if (e.key === 'Backspace') {
          e.preventDefault();
          handleWordBackspace();
        }
        return;
      }

      // Ignore non-printable keys
      if (
        e.key === 'Shift' ||
        e.key === 'Control' ||
        e.key === 'Alt' ||
        e.key === 'Meta' ||
        e.key === 'CapsLock' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight' ||
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        e.key === 'Home' ||
        e.key === 'End' ||
        e.key === 'PageUp' ||
        e.key === 'PageDown' ||
        e.key === 'Insert' ||
        e.key === 'ContextMenu' ||
        e.key.startsWith('F')
      ) {
        return;
      }

      // Prevent scrolling on Spacebar
      if (e.key === ' ') {
        e.preventDefault();
      }

      // Don't accept inputs if completed
      if (statusRef.current === 'completed') return;

      const now = performance.now();

      // Start engine on first valid keystroke
      if (statusRef.current === 'idle') {
        statusRef.current = 'running';
        setStatus('running');
        startTimeRef.current = now;
        lastKeyTimeRef.current = now;
        startTimerTicker();
      }

      const flightTimeMs = lastKeyTimeRef.current > 0 ? Math.round(now - lastKeyTimeRef.current) : 0;
      lastKeyTimeRef.current = now;

      // ==========================================
      // Branch A: Backspace Handling
      // ==========================================
      if (e.key === 'Backspace') {
        e.preventDefault();
        handleSingleBackspace();
        return;
      }

      // ==========================================
      // Branch B: Printable Character Keystroke
      // ==========================================
      if (e.key.length !== 1) return;

      const currentIdx = activeIndexRef.current;
      if (currentIdx >= text.length) {
        finishTest();
        return;
      }

      const expectedChar = text[currentIdx];
      const typedChar = e.key;
      const isMatch = typedChar === expectedChar;
      const charStatus: CharacterStatus = isMatch ? 'correct' : 'incorrect';

      totalKeystrokesRef.current++;

      if (isMatch) {
        correctKeystrokesRef.current++;
        correctCharsRef.current++;
      } else {
        incorrectKeystrokesRef.current++;
        uncorrectedErrorsRef.current++;
      }

      // Audio feedback
      let soundType: KeySoundType = 'alphanumeric';
      if (!isMatch) {
        soundType = 'error';
      } else if (typedChar === ' ') {
        soundType = 'space';
      }
      soundSynthRef.current.playKeySound(soundType);

      // Keystroke Telemetry
      const keystrokeRecord: KeystrokeRecord = {
        timestamp: now,
        key: typedChar,
        expected: expectedChar,
        index: currentIdx,
        status: charStatus,
        flightTimeMs,
      };
      keystrokesRef.current.push(keystrokeRecord);
      onKeystroke?.(keystrokeRecord);

      // Fine-grained DOM and subscriber update (Law 1)
      updateCharacterAt(currentIdx, charStatus, typedChar);

      // Move active index
      const prevEl = charElementsMap.current.get(currentIdx);
      if (prevEl) prevEl.classList.remove('char-active');

      activeIndexRef.current = currentIdx + 1;
      notifyActiveChar(text[currentIdx + 1] || '');

      const nextEl = charElementsMap.current.get(currentIdx + 1);
      if (nextEl) nextEl.classList.add('char-active');

      // Update caret position smoothly
      updateCaretPosition();

      // Check test completion (all text typed)
      if (activeIndexRef.current >= text.length) {
        finishTest();
      }
    },
    [
      finishTest,
      notifyActiveChar,
      onKeystroke,
      resetTest,
      startTimerTicker,
      text,
      updateCaretPosition,
      updateCharacterAt,
    ]
  );

  /**
   * Handles single character backspace
   */
  const handleSingleBackspace = useCallback(() => {
    const currentIdx = activeIndexRef.current;
    if (currentIdx <= 0) return;

    const targetIdx = currentIdx - 1;
    const prevStatus = charStatesRef.current[targetIdx];

    // Revert counters
    if (prevStatus === 'incorrect') {
      uncorrectedErrorsRef.current = Math.max(0, uncorrectedErrorsRef.current - 1);
    } else if (prevStatus === 'correct') {
      correctCharsRef.current = Math.max(0, correctCharsRef.current - 1);
    }

    // Play backspace audio
    soundSynthRef.current.playKeySound('backspace');

    // Remove active class from current and set to target
    const currentEl = charElementsMap.current.get(currentIdx);
    if (currentEl) currentEl.classList.remove('char-active');

    // Reset character status
    updateCharacterAt(targetIdx, 'pending', '');

    activeIndexRef.current = targetIdx;
    notifyActiveChar(text[targetIdx] || '');

    const targetEl = charElementsMap.current.get(targetIdx);
    if (targetEl) targetEl.classList.add('char-active');

    updateCaretPosition();
  }, [updateCaretPosition, updateCharacterAt]);

  /**
   * Handles Ctrl+Backspace / Cmd+Backspace (delete whole word)
   */
  const handleWordBackspace = useCallback(() => {
    const currentIdx = activeIndexRef.current;
    if (currentIdx <= 0) return;

    let targetIdx = currentIdx - 1;

    // Skip trailing spaces if cursor is on space
    while (targetIdx > 0 && text[targetIdx] === ' ') {
      targetIdx--;
    }

    // Rewind to beginning of word or boundary
    while (targetIdx > 0 && text[targetIdx - 1] !== ' ') {
      targetIdx--;
    }

    // Revert all characters between currentIdx and targetIdx
    for (let i = currentIdx - 1; i >= targetIdx; i--) {
      const prevStatus = charStatesRef.current[i];
      if (prevStatus === 'incorrect') {
        uncorrectedErrorsRef.current = Math.max(0, uncorrectedErrorsRef.current - 1);
      } else if (prevStatus === 'correct') {
        correctCharsRef.current = Math.max(0, correctCharsRef.current - 1);
      }
      updateCharacterAt(i, 'pending', '');
      const el = charElementsMap.current.get(i);
      if (el) el.classList.remove('char-active');
    }

    soundSynthRef.current.playKeySound('backspace');

    activeIndexRef.current = targetIdx;
    notifyActiveChar(text[targetIdx] || '');

    const targetEl = charElementsMap.current.get(targetIdx);
    if (targetEl) targetEl.classList.add('char-active');

    updateCaretPosition();
  }, [notifyActiveChar, text, updateCaretPosition, updateCharacterAt]);

  const pauseTest = useCallback(() => {
    if (statusRef.current === 'running') {
      statusRef.current = 'paused';
      setStatus('paused');
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  }, []);

  const resumeTest = useCallback(() => {
    if (statusRef.current === 'paused') {
      statusRef.current = 'running';
      setStatus('running');
      startTimerTicker();
    }
  }, [startTimerTicker]);

  const getCharStatus = useCallback((index: number): CharacterStatus => {
    return charStatesRef.current[index] || 'pending';
  }, []);

  const getActiveIndex = useCallback((): number => {
    return activeIndexRef.current;
  }, []);

  // Cleanup timers and RAF on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (caretRafRef.current !== null) {
        cancelAnimationFrame(caretRafRef.current);
      }
    };
  }, []);

  return {
    status,
    targetText: text,
    isCompleted: status === 'completed',
    isPaused: status === 'paused',
    metrics,
    elapsedTime,
    timeRemaining,
    caretCoords,
    containerRef,
    caretRef,
    handleKeyDown,
    resetTest,
    exitTyping: resetTest,
    pauseTest,
    resumeTest,
    registerCharElement,
    subscribeChar,
    subscribeCaret,
    subscribeActiveChar,
    getCharStatus,
    getActiveIndex,
    result,
    analytics,
    soundSynth: soundSynthRef.current,
  };
}
