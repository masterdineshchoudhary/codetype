/**
 * CodeType Main Page
 * High-performance developer typing application.
 * Integrates zero-rerender engine, adaptive learning, audio synth, and Cmd+K Command Palette.
 */

'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTypingEngine } from '../hooks/useTypingEngine';
import { useAdaptiveLearning } from '../hooks/useAdaptiveLearning';
import { useKeybrMastery } from '../hooks/useKeybrMastery';
import { useSoundEffects } from '../hooks/useSoundEffects';
import { useCommandPalette } from '../hooks/useCommandPalette';
import { CommandPalette } from '../components/controls/CommandPalette';
import { CustomSnippetModal } from '../components/controls/CustomSnippetModal';
import { UnifiedDock } from '../components/controls/UnifiedDock';
import { MetricsOverlay } from '../components/engine/MetricsOverlay';
import { MasteryBar } from '../components/engine/MasteryBar';
import { TypingArea } from '../components/engine/TypingArea';
import { ResultsModal } from '../components/results/ResultsModal';
import { generateStandardWords } from '../lib/algorithms/keybrGenerator';
import {
  applyTheme,
  getStoredTheme,
  storeTheme,
  THEME_PRESETS,
} from '../lib/themes/themeDefinitions';
import { KeyboardMap } from '../components/engine/KeyboardMap';
import type { CommandItem } from '../lib/commands/commandRegistry';
import type {
  CaretStyle,
  EngineConfig,
  StandardDurationSeconds,
  StandardWordCount,
  SupportedLanguage,
  TestResult,
  ThemeId,
} from '../types/typing';


const INITIAL_CONFIG: EngineConfig = {
  mode: 'standard',
  standardOptions: {
    type: 'words',
    wordCount: 25,
    duration: 30,
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

export default function Home() {
  const [config, setConfig] = useState<EngineConfig>(INITIAL_CONFIG);
  const [isCapsLockOn, setIsCapsLockOn] = useState<boolean>(false);

  // Initialize and apply saved theme
  useEffect(() => {
    const saved = getStoredTheme();
    setConfig((prev) => ({ ...prev, theme: saved }));
    applyTheme(saved);
  }, []);

  const handleSetTheme = useCallback((themeId: ThemeId) => {
    setConfig((prev) => ({ ...prev, theme: themeId }));
    applyTheme(themeId);
    storeTheme(themeId);
  }, []);

  const handleSetCaretStyle = useCallback((caretStyle: CaretStyle) => {
    setConfig((prev) => ({ ...prev, caretStyle }));
  }, []);

  const { heatmap, recordSession, getNextDrill } = useAdaptiveLearning();
  const {
    masteryState,
    recordKeybrSession,
    generateDrill: generateKeybrDrill,
    resetMastery,
  } = useKeybrMastery();

  const [unlockedKeyBanner, setUnlockedKeyBanner] = useState<string | null>(null);
  const [isCustomSnippetOpen, setIsCustomSnippetOpen] = useState<boolean>(false);

  const {
    profile: soundProfile,
    volume: soundVolume,
    isMuted,
    setProfile: setSoundProfile,
    setVolume: setSoundVolume,
    toggleMute,
  } = useSoundEffects();

  // Helper to generate text according to current config
  const getInitialText = useCallback(
    (cfg: EngineConfig): string => {
      if (cfg.mode === 'keybr') {
        return generateKeybrDrill(25);
      } else if (cfg.mode === 'standard') {
        const count =
          cfg.standardOptions.type === 'words' ? (cfg.standardOptions.wordCount ?? 25) : 50;
        return generateStandardWords(count, {
          punctuation: cfg.standardOptions.punctuation,
          numbers: cfg.standardOptions.numbers,
        });
      } else {
        return getNextDrill(cfg.syntaxOptions.language, cfg.syntaxOptions.adaptiveWeakKeys);
      }
    },
    [generateKeybrDrill, getNextDrill]
  );

const DETERMINISTIC_INITIAL_TEXT =
  'the be of and a to in he have it that for they with as not on she at by this we you do but his';

  const [currentText, setCurrentText] = useState<string>(DETERMINISTIC_INITIAL_TEXT);

  // Initialize randomized drill on client mount to prevent SSR hydration mismatch
  useEffect(() => {
    setCurrentText(getInitialText(INITIAL_CONFIG));
  }, [getInitialText]);

  const handleTestComplete = useCallback(
    (testResult: TestResult) => {
      recordSession(testResult);
      if (config.mode === 'keybr') {
        const { unlockedNewKey } = recordKeybrSession(testResult.keystrokes);
        if (unlockedNewKey) {
          setUnlockedKeyBanner(unlockedNewKey);
        }
      }
    },
    [config.mode, recordKeybrSession, recordSession]
  );

  const {
    status,
    metrics,
    elapsedTime,
    timeRemaining,
    caretCoords,
    containerRef,
    caretRef,
    registerCharElement,
    handleKeyDown,
    resetTest,
    exitTyping,
    subscribeActiveChar,
    result,
  } = useTypingEngine({
    targetText: currentText,
    config: {
      ...config,
      soundProfile,
      soundVolume,
    },
    onComplete: handleTestComplete,
  });

  const [showKeyboardMap, setShowKeyboardMap] = useState<boolean>(true);

  // Load keyboard map visibility preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem('codetype_show_keymap');
      if (saved !== null) {
        setShowKeyboardMap(saved === 'true');
      }
    } catch {
      // Storage access fallback
    }
  }, []);

  const handleToggleKeyboardMap = useCallback(() => {
    setShowKeyboardMap((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('codetype_show_keymap', String(next));
      } catch {
        // Storage access fallback
      }
      return next;
    });
  }, []);

  // Handle configuration changes
  const handleConfigChange = useCallback(
    (updated: Partial<EngineConfig>) => {
      const nextConfig = {
        ...config,
        ...updated,
        standardOptions: {
          ...config.standardOptions,
          ...(updated.standardOptions || {}),
        },
        syntaxOptions: {
          ...config.syntaxOptions,
          ...(updated.syntaxOptions || {}),
        },
      };
      setConfig(nextConfig);

      // Refresh text for new configuration
      const newText = getInitialText(nextConfig);
      setCurrentText(newText);
      resetTest(newText);
    },
    [config, getInitialText, resetTest]
  );

  const handleLanguageChange = useCallback(
    (language: SupportedLanguage) => {
      handleConfigChange({
        syntaxOptions: {
          ...config.syntaxOptions,
          language,
        },
      });
    },
    [config.syntaxOptions, handleConfigChange]
  );

  const handleNextTest = useCallback(() => {
    const nextText = getInitialText(config);
    setCurrentText(nextText);
    resetTest(nextText);
  }, [config, getInitialText, resetTest]);

  const handleApplyCustomSnippet = useCallback(
    (normalizedCode: string, lang: SupportedLanguage) => {
      handleConfigChange({
        mode: 'syntax',
        syntaxOptions: {
          ...config.syntaxOptions,
          language: lang,
        },
      });
      setCurrentText(normalizedCode);
      resetTest(normalizedCode);
    },
    [config.syntaxOptions, handleConfigChange, resetTest]
  );

  // Command palette action list
  const paletteCommands = useMemo<CommandItem[]>(() => {
    return [
      // Test Actions
      {
        id: 'action-custom-snippet',
        title: 'Custom Code: Paste / Upload Snippet',
        subtitle: 'Load and type custom code with auto-normalization',
        category: 'snippet',
        keywords: ['custom', 'paste', 'upload', 'code', 'snippet', 'file'],
        action: () => setIsCustomSnippetOpen(true),
      },
      {
        id: 'action-restart',
        title: 'Restart Test',
        subtitle: 'Reset current text buffer',
        category: 'test',
        keywords: ['reset', 'next', 'again', 'tab'],
        action: handleNextTest,
      },

      {
        id: 'action-exit-typing',
        title: 'Exit Typing Mode',
        subtitle: 'Reset active test back to idle (Esc)',
        category: 'test',
        keywords: ['exit', 'cancel', 'stop', 'quit', 'escape'],
        action: exitTyping,
      },
      {
        id: 'action-toggle-keymap',
        title: `Keyboard Map: ${showKeyboardMap ? 'Turn OFF' : 'Turn ON'}`,
        subtitle: 'Toggle on-screen interactive keyboard guide',
        category: 'test',
        keywords: ['keyboard', 'map', 'keymap', 'layout', 'visual'],
        action: handleToggleKeyboardMap,
      },
      {
        id: 'action-toggle-zen',
        title: `Zen Mode: ${config.zenMode ? 'Turn OFF' : 'Turn ON'}`,
        subtitle: 'Auto-hide UI while typing',
        category: 'test',
        keywords: ['zen', 'distraction', 'clean'],
        action: () => setConfig((prev) => ({ ...prev, zenMode: !prev.zenMode })),
      },

      // Themes (4 Minimal Presets)
      {
        id: 'theme-soft-black',
        title: 'Theme: Soft Black',
        subtitle: 'Minimalist deep charcoal & clean silver',
        category: 'theme',
        keywords: ['soft', 'black', 'dark', 'charcoal', 'minimal'],
        action: () => handleSetTheme('soft-black'),
      },
      {
        id: 'theme-soft-white',
        title: 'Theme: Soft White',
        subtitle: 'Paper minimalist light & deep ink',
        category: 'theme',
        keywords: ['soft', 'white', 'light', 'clean', 'paper'],
        action: () => handleSetTheme('soft-white'),
      },
      {
        id: 'theme-monochrome',
        title: 'Theme: Monochrome',
        subtitle: 'Pure dark background & amber gold accent',
        category: 'theme',
        keywords: ['monochrome', 'dark', 'black', 'gold', 'yellow'],
        action: () => handleSetTheme('monochrome'),
      },
      {
        id: 'theme-terminal',
        title: 'Theme: Terminal',
        subtitle: 'Phosphor green matrix terminal',
        category: 'theme',
        keywords: ['terminal', 'matrix', 'green', 'hacker'],
        action: () => handleSetTheme('terminal'),
      },

      // Caret Styles
      {
        id: 'caret-line',
        title: 'Caret: Vertical Line',
        category: 'caret',
        keywords: ['cursor', 'line', 'bar'],
        action: () => handleSetCaretStyle('line'),
      },
      {
        id: 'caret-block',
        title: 'Caret: Block Cursor',
        category: 'caret',
        keywords: ['cursor', 'block', 'rectangle'],
        action: () => handleSetCaretStyle('block'),
      },
      {
        id: 'caret-underline',
        title: 'Caret: Underline',
        category: 'caret',
        keywords: ['cursor', 'underline'],
        action: () => handleSetCaretStyle('underline'),
      },
      {
        id: 'caret-box',
        title: 'Caret: Outline Box',
        category: 'caret',
        keywords: ['cursor', 'box', 'hollow'],
        action: () => handleSetCaretStyle('box'),
      },

      // Sound Profiles
      {
        id: 'sound-thock',
        title: 'Switch Audio: Thock',
        subtitle: 'Lubed linear switch acoustic profile',
        category: 'sound',
        keywords: ['thock', 'linear', 'deep'],
        action: () => setSoundProfile('thock'),
      },
      {
        id: 'sound-clicky',
        title: 'Switch Audio: Clicky',
        subtitle: 'Mechanical click leaf pop',
        category: 'sound',
        keywords: ['clicky', 'blue', 'snap'],
        action: () => setSoundProfile('clicky'),
      },
      {
        id: 'sound-silent',
        title: 'Switch Audio: Silent',
        subtitle: 'Mute synthesized switch audio',
        category: 'sound',
        keywords: ['mute', 'silent', 'quiet'],
        action: () => setSoundProfile('silent'),
      },

      // Test Modes
      {
        id: 'mode-words-25',
        title: 'Mode: Standard Words (25)',
        category: 'mode',
        keywords: ['words', '25', 'short'],
        action: () =>
          handleConfigChange({
            mode: 'standard',
            standardOptions: { ...config.standardOptions, type: 'words', wordCount: 25 },
          }),
      },
      {
        id: 'mode-words-50',
        title: 'Mode: Standard Words (50)',
        category: 'mode',
        keywords: ['words', '50'],
        action: () =>
          handleConfigChange({
            mode: 'standard',
            standardOptions: { ...config.standardOptions, type: 'words', wordCount: 50 },
          }),
      },
      {
        id: 'mode-words-100',
        title: 'Mode: Standard Words (100)',
        category: 'mode',
        keywords: ['words', '100', 'long'],
        action: () =>
          handleConfigChange({
            mode: 'standard',
            standardOptions: { ...config.standardOptions, type: 'words', wordCount: 100 },
          }),
      },
      {
        id: 'mode-keybr',
        title: 'Mode: Unlock Letters',
        subtitle: 'Sequential letter unlocking & progressive mastery',
        category: 'mode',
        keywords: ['unlock', 'letters', 'progression', 'mastery', 'alphabet', 'keybr'],
        action: () =>
          handleConfigChange({
            mode: 'keybr',
          }),
      },
      {
        id: 'action-reset-keybr',
        title: 'Reset Letter Unlock Progress',
        subtitle: 'Re-lock letters back to initial 6 home keys',
        category: 'test',
        keywords: ['reset', 'unlock', 'letters', 'clear', 'keybr'],
        action: () => {
          resetMastery();
          handleNextTest();
        },
      },
      {
        id: 'mode-time-15',
        title: 'Mode: Timed Sprint (15s)',
        category: 'mode',
        keywords: ['time', '15', 'fast', 'sprint'],
        action: () =>
          handleConfigChange({
            mode: 'standard',
            standardOptions: { ...config.standardOptions, type: 'time', duration: 15 },
          }),
      },
      {
        id: 'mode-time-30',
        title: 'Mode: Timed Sprint (30s)',
        category: 'mode',
        keywords: ['time', '30'],
        action: () =>
          handleConfigChange({
            mode: 'standard',
            standardOptions: { ...config.standardOptions, type: 'time', duration: 30 },
          }),
      },
      {
        id: 'mode-time-60',
        title: 'Mode: Timed Sprint (60s)',
        category: 'mode',
        keywords: ['time', '60', 'endurance'],
        action: () =>
          handleConfigChange({
            mode: 'standard',
            standardOptions: { ...config.standardOptions, type: 'time', duration: 60 },
          }),
      },

      // Languages
      {
        id: 'lang-ts',
        title: 'Syntax: TypeScript',
        subtitle: 'Interfaces, generics, async/await',
        category: 'language',
        keywords: ['typescript', 'ts', 'javascript', 'js'],
        action: () => {
          handleConfigChange({
            mode: 'syntax',
            syntaxOptions: { ...config.syntaxOptions, language: 'typescript' },
          });
        },
      },
      {
        id: 'lang-py',
        title: 'Syntax: Python',
        subtitle: 'Dataclasses, async TaskGroup, binary search',
        category: 'language',
        keywords: ['python', 'py'],
        action: () => {
          handleConfigChange({
            mode: 'syntax',
            syntaxOptions: { ...config.syntaxOptions, language: 'python' },
          });
        },
      },
      {
        id: 'lang-sql',
        title: 'Syntax: SQL',
        subtitle: 'Window functions, CTEs, group by',
        category: 'language',
        keywords: ['sql', 'database', 'postgres'],
        action: () => {
          handleConfigChange({
            mode: 'syntax',
            syntaxOptions: { ...config.syntaxOptions, language: 'sql' },
          });
        },
      },
      {
        id: 'lang-rust',
        title: 'Syntax: Rust',
        subtitle: 'Match arms, traits, Result/Option',
        category: 'language',
        keywords: ['rust', 'rs'],
        action: () => {
          handleConfigChange({
            mode: 'syntax',
            syntaxOptions: { ...config.syntaxOptions, language: 'rust' },
          });
        },
      },
      {
        id: 'lang-go',
        title: 'Syntax: Go',
        subtitle: 'Goroutines, channels, error checks',
        category: 'language',
        keywords: ['go', 'golang'],
        action: () => {
          handleConfigChange({
            mode: 'syntax',
            syntaxOptions: { ...config.syntaxOptions, language: 'go' },
          });
        },
      },
    ];
  }, [
    config.zenMode,
    config.standardOptions,
    config.syntaxOptions,
    handleNextTest,
    handleSetTheme,
    handleSetCaretStyle,
    setSoundProfile,
    handleConfigChange,
    resetMastery,
    exitTyping,
    showKeyboardMap,
    handleToggleKeyboardMap,
  ]);

  const {
    isOpen: isPaletteOpen,
    query: paletteQuery,
    selectedIndex: paletteIndex,
    filteredCommands: paletteFiltered,
    openPalette,
    closePalette,
    setQuery: setPaletteQuery,
    setSelectedIndex: setPaletteIndex,
    executeSelected: executePaletteSelected,
    handlePaletteKeyDown,
  } = useCommandPalette({
    commands: paletteCommands,
  });

  // Global Tab = quick restart; Global Escape = exit typing mode; Caps Lock detection
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (typeof e.getModifierState === 'function') {
        setIsCapsLockOn(e.getModifierState('CapsLock'));
      }

      if (e.key === 'Tab' && !isPaletteOpen) {
        e.preventDefault();
        handleNextTest();
      } else if (
        e.key === 'Escape' &&
        status === 'running' &&
        !isPaletteOpen &&
        !isCustomSnippetOpen
      ) {
        e.preventDefault();
        exitTyping();
      }
    };

    const handleGlobalKeyUp = (e: KeyboardEvent) => {
      if (typeof e.getModifierState === 'function') {
        setIsCapsLockOn(e.getModifierState('CapsLock'));
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    window.addEventListener('keyup', handleGlobalKeyUp);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      window.removeEventListener('keyup', handleGlobalKeyUp);
    };
  }, [exitTyping, handleNextTest, isCustomSnippetOpen, isPaletteOpen, status]);

  const isZenActive =
    config.zenMode && status === 'running' && !isPaletteOpen && !isCustomSnippetOpen;

  return (
    <main className="flex flex-col items-center justify-between min-h-screen px-4 py-8 max-w-6xl mx-auto font-mono">
      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isPaletteOpen}
        query={paletteQuery}
        selectedIndex={paletteIndex}
        filteredCommands={paletteFiltered}
        onQueryChange={setPaletteQuery}
        onSelectIndex={setPaletteIndex}
        onExecute={executePaletteSelected}
        onKeyDown={handlePaletteKeyDown}
        onClose={closePalette}
      />

      {/* Custom Snippet Ingestion Modal */}
      <CustomSnippetModal
        isOpen={isCustomSnippetOpen}
        initialLanguage={config.syntaxOptions.language}
        onClose={() => setIsCustomSnippetOpen(false)}
        onApplySnippet={handleApplyCustomSnippet}
      />

      {/* Top Floating Unified Dock (2027 Minimalist Island) */}
      <header
        className={`w-full flex justify-center transition-all duration-500 ${
          isZenActive ? 'opacity-0 -translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'
        }`}
      >
        <UnifiedDock
          config={config}
          status={status}
          onConfigChange={handleConfigChange}
          onThemeChange={handleSetTheme}
          soundProfile={soundProfile}
          soundVolume={soundVolume}
          isMuted={isMuted}
          onSoundProfileChange={setSoundProfile}
          onSoundVolumeChange={setSoundVolume}
          onToggleMute={toggleMute}
          showKeyboardMap={showKeyboardMap}
          onToggleKeyboardMap={handleToggleKeyboardMap}
          onOpenCustomSnippet={() => setIsCustomSnippetOpen(true)}
          onOpenCommandPalette={openPalette}
        />
      </header>

      {/* Main Arena */}
      <section className="flex flex-col items-center justify-center w-full my-auto">
        {result ? (
          /* Results Screen */
          <ResultsModal result={result} heatmap={heatmap} onRestart={handleNextTest} />
        ) : (
          /* Live Typing Arena */
          <div className="flex flex-col items-center w-full max-w-4xl">
            {/* Tier Unlocked Toast Chip */}
            {unlockedKeyBanner && (
              <div className="flex items-center justify-between w-full max-w-sm px-4 py-2 mb-4 glass-card rounded-full text-xs font-mono shadow-xl animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                  <span className="text-[var(--text-bright)]">
                    Unlocked tier letter{' '}
                    <strong className="uppercase text-[var(--accent)] font-bold">
                      &apos;{unlockedKeyBanner}&apos;
                    </strong>
                  </span>
                </div>
                <button
                  onClick={() => setUnlockedKeyBanner(null)}
                  className="text-[10px] text-[var(--text-dim)] hover:text-[var(--text-bright)] transition-colors ml-3"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Keybr Mastery Progress Bar */}
            {config.mode === 'keybr' && (
              <MasteryBar masteryState={masteryState} />
            )}

            {/* Status & Warning Bar: Caps Lock Capsule & Exit Sprint Capsule */}
            <div className="flex items-center justify-between w-full max-w-4xl min-h-[30px] mb-2 px-1">
              <div>
                {isCapsLockOn && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full glass-card border border-amber-500/40 text-amber-400 text-xs font-mono shadow-md animate-fade-in">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-[13px] leading-none font-bold">⇪</span>
                    <span className="font-semibold tracking-wider text-[11px] uppercase">Caps Lock</span>
                  </div>
                )}
              </div>

              <div>
                {status === 'running' && (
                  <button
                    type="button"
                    onClick={exitTyping}
                    className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono rounded-full glass-card hover:bg-red-950/20 text-[var(--text-dim)] hover:text-red-400 transition-colors shadow-sm"
                    title="Exit typing mode (Esc)"
                  >
                    <kbd className="px-1 py-0.2 rounded bg-[var(--bg)] border border-[var(--border-subtle)]/40 text-[9px]">Esc</kbd>
                    <span>exit</span>
                  </button>
                )}
              </div>
            </div>

            <MetricsOverlay
              metrics={metrics}
              status={status}
              timeRemaining={timeRemaining}
              elapsedTime={elapsedTime}
              zenMode={config.zenMode}
            />

            <TypingArea
              targetText={currentText}
              status={status}
              caretCoords={caretCoords}
              caretStyle={config.caretStyle}
              language={config.syntaxOptions.language}
              isSyntaxMode={config.mode === 'syntax'}
              containerRef={containerRef}
              caretRef={caretRef}
              registerCharElement={registerCharElement}
              handleKeyDown={handleKeyDown}
              isPaletteOpen={isPaletteOpen || isCustomSnippetOpen}
            />

            {/* Interactive On-Screen Keyboard Map */}
            {showKeyboardMap && (
              <div className="w-full mt-6 animate-fade-in">
                <KeyboardMap
                  subscribeActiveChar={subscribeActiveChar}
                  unlockedKeys={config.mode === 'keybr' ? masteryState.unlockedKeys : undefined}
                  isKeybrMode={config.mode === 'keybr'}
                  heatmap={heatmap}
                />
              </div>
            )}
          </div>
        )}
      </section>

      {/* Modern Minimal Footer */}
      <footer
        className={`flex items-center justify-between w-full max-w-4xl pt-8 pb-2 text-xs text-[var(--text-dim)]/70 transition-opacity duration-300 ${
          isZenActive ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded-md bg-[var(--surface-hover)]/40 border border-[var(--border-subtle)]/40 text-[10px]">
              Tab
            </kbd>{' '}
            restart
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded-md bg-[var(--surface-hover)]/40 border border-[var(--border-subtle)]/40 text-[10px]">
              ⌘K
            </kbd>{' '}
            commands
          </span>
          <span className="flex items-center gap-1.5 text-red-400/70">
            <kbd className="px-1.5 py-0.5 rounded-md bg-[var(--surface-hover)]/40 border border-red-500/20 text-[10px]">
              Esc
            </kbd>{' '}
            exit
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <button
            type="button"
            onClick={() => {
              const themeList: ThemeId[] = [
                'soft-black',
                'soft-white',
                'monochrome',
                'terminal',
              ];
              const nextIdx = (themeList.indexOf(config.theme) + 1) % themeList.length;
              handleSetTheme(themeList[nextIdx]);
            }}
            className="flex items-center gap-1.5 text-[var(--text-dim)] hover:text-[var(--text-bright)] transition-colors cursor-pointer"
            title="Click to cycle theme (4 minimal presets)"
          >
            <span
              className="w-3.5 h-3.5 rounded-[3px] border border-[var(--border-subtle)] shadow-xs shrink-0"
              style={{ backgroundColor: THEME_PRESETS[config.theme]?.colors.accent }}
            />
            <span className="capitalize">{THEME_PRESETS[config.theme]?.name || config.theme}</span>
          </button>
          <span className="text-[var(--border-subtle)]/50">·</span>
          <span className="text-[var(--text-dim)]/60">
            zero-lag engine
          </span>
        </div>
      </footer>
    </main>
  );
}
