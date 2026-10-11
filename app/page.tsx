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
import { ModeToggle } from '../components/controls/ModeToggle';
import { SoundSelector } from '../components/controls/SoundSelector';
import { LanguageSelector } from '../components/controls/LanguageSelector';
import { CommandPalette } from '../components/controls/CommandPalette';
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
import { Command, Palette, Sparkles, Terminal, Zap } from 'lucide-react';

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
  zenMode: true,
  blindMode: false,
  strictBackspace: false,
};

export default function Home() {
  const [config, setConfig] = useState<EngineConfig>(INITIAL_CONFIG);

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

  // Command palette action list
  const paletteCommands = useMemo<CommandItem[]>(() => {
    return [
      // Test Actions
      {
        id: 'action-restart',
        title: 'Restart Test',
        subtitle: 'Reset current text buffer',
        category: 'test',
        keywords: ['reset', 'next', 'again', 'tab'],
        action: handleNextTest,
      },
      {
        id: 'action-toggle-zen',
        title: `Zen Mode: ${config.zenMode ? 'Turn OFF' : 'Turn ON'}`,
        subtitle: 'Auto-hide UI while typing',
        category: 'test',
        keywords: ['zen', 'distraction', 'clean'],
        action: () => setConfig((prev) => ({ ...prev, zenMode: !prev.zenMode })),
      },

      // Themes
      {
        id: 'theme-monochrome',
        title: 'Theme: Monochrome Minimal',
        subtitle: 'High-contrast charcoal & amber gold',
        category: 'theme',
        keywords: ['dark', 'black', 'gold', 'yellow'],
        action: () => handleSetTheme('monochrome'),
      },
      {
        id: 'theme-carbon',
        title: 'Theme: Carbon Gray',
        subtitle: 'Cool charcoal & IBM cyan',
        category: 'theme',
        keywords: ['carbon', 'blue', 'cyan'],
        action: () => handleSetTheme('carbon'),
      },
      {
        id: 'theme-matrix',
        title: 'Theme: Matrix Terminal',
        subtitle: 'Pitch black & phosphor green',
        category: 'theme',
        keywords: ['matrix', 'green', 'hacker', 'terminal'],
        action: () => handleSetTheme('matrix'),
      },
      {
        id: 'theme-nord',
        title: 'Theme: Nordic Frost',
        subtitle: 'Arctic night & frost blue',
        category: 'theme',
        keywords: ['nord', 'arctic', 'snow', 'frost'],
        action: () => handleSetTheme('nord'),
      },
      {
        id: 'theme-cyberpunk',
        title: 'Theme: Cyberpunk Neon',
        subtitle: 'Electric purple, yellow & neon cyan',
        category: 'theme',
        keywords: ['cyberpunk', 'neon', 'purple', 'yellow'],
        action: () => handleSetTheme('cyberpunk'),
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
        title: 'Mode: Keybr Progressive Mastery',
        subtitle: 'Sequential letter unlocking & n-gram drills',
        category: 'mode',
        keywords: ['keybr', 'unlock', 'progression', 'mastery', 'alphabet'],
        action: () =>
          handleConfigChange({
            mode: 'keybr',
          }),
      },
      {
        id: 'action-reset-keybr',
        title: 'Reset Keybr Mastery Progress',
        subtitle: 'Re-lock letters back to initial 6 home keys',
        category: 'test',
        keywords: ['reset', 'keybr', 'clear'],
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

  // Global Tab = quick restart (when palette is closed)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && !isPaletteOpen) {
        e.preventDefault();
        handleNextTest();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleNextTest, isPaletteOpen]);

  const isZenActive = config.zenMode && status === 'running' && !isPaletteOpen;

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

      {/* Header & Controls (Fades in Zen mode when typing) */}
      <header
        className={`flex flex-col items-center w-full gap-5 transition-opacity duration-300 ${
          isZenActive ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="flex items-center justify-between w-full max-w-4xl px-2">
          {/* Logo & Version */}
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-[var(--accent)]" />
            <span className="font-bold tracking-wider text-[var(--text-bright)] text-lg">
              codetype
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--surface)] text-[var(--text-dim)] border border-[var(--border-subtle)]">
              v0.3.0
            </span>
          </div>

          {/* Right Header: Theme pill, Command Palette button & Audio selector */}
          <div className="flex items-center gap-2.5">
            {/* Command Palette Pill */}
            <button
              onClick={openPalette}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono select-none bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] rounded-full text-[var(--text-dim)] hover:text-[var(--text-bright)] transition-colors"
              title="Command Palette (Cmd+K)"
            >
              <Command className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="hidden sm:inline">Commands</span>
              <kbd className="text-[10px] bg-[var(--bg)] px-1 py-0.2 rounded border border-[var(--border-subtle)]">
                ⌘K
              </kbd>
            </button>

            {/* Sound Profile Controls */}
            <SoundSelector
              profile={soundProfile}
              volume={soundVolume}
              isMuted={isMuted}
              onProfileChange={setSoundProfile}
              onVolumeChange={setSoundVolume}
              onToggleMute={toggleMute}
            />
          </div>
        </div>

        {/* Mode Selector & Syntax Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <ModeToggle
            config={config}
            onChange={handleConfigChange}
            disabled={status === 'running'}
          />

          {config.mode === 'syntax' && (
            <LanguageSelector
              language={config.syntaxOptions.language}
              onLanguageChange={handleLanguageChange}
              disabled={status === 'running'}
            />
          )}
        </div>
      </header>

      {/* Main Arena */}
      <section className="flex flex-col items-center justify-center w-full my-auto">
        {result ? (
          /* Results Screen */
          <ResultsModal result={result} heatmap={heatmap} onRestart={handleNextTest} />
        ) : (
          /* Live Typing Arena */
          <div className="flex flex-col items-center w-full max-w-4xl">
            {/* New Key Unlocked Notification Banner */}
            {unlockedKeyBanner && (
              <div className="flex items-center justify-between w-full px-4 py-2.5 mb-4 bg-amber-950/60 border border-amber-500/80 rounded-xl text-amber-200 text-xs font-mono shadow-md animate-bounce">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>
                    🎉 Mastered current tier! Unlocked new letter:{' '}
                    <strong className="uppercase text-amber-300 text-sm">
                      &apos;{unlockedKeyBanner}&apos;
                    </strong>
                    !
                  </span>
                </div>
                <button
                  onClick={() => setUnlockedKeyBanner(null)}
                  className="px-2 py-0.5 rounded bg-amber-900/50 hover:bg-amber-900 text-[10px] text-amber-300 border border-amber-700/60 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Keybr Mastery Progress Bar */}
            {config.mode === 'keybr' && (
              <MasteryBar masteryState={masteryState} />
            )}

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
              containerRef={containerRef}
              caretRef={caretRef}
              registerCharElement={registerCharElement}
              handleKeyDown={handleKeyDown}
              isPaletteOpen={isPaletteOpen}
            />
          </div>
        )}
      </section>

      {/* Footer Hints (Fades in Zen mode when typing) */}
      <footer
        className={`flex items-center justify-between w-full max-w-4xl pt-6 text-xs text-[var(--text-dim)] border-t border-[var(--border-subtle)] transition-opacity duration-300 ${
          isZenActive ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border-subtle)] text-[10px]">
              Tab
            </kbd>{' '}
            restart test
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border-subtle)] text-[10px]">
              Cmd+K
            </kbd>{' '}
            command palette
          </span>
          <span className="flex items-center gap-1.5 hidden sm:flex">
            <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border-subtle)] text-[10px]">
              Ctrl+Backspace
            </kbd>{' '}
            delete word
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-[var(--text-dim)]">
            <Palette className="w-3.5 h-3.5" />
            <span className="capitalize">{THEME_PRESETS[config.theme]?.name || config.theme}</span>
          </span>
          <span className="text-[var(--border-subtle)]">|</span>
          <span className="flex items-center gap-1 text-[var(--accent)]">
            <Zap className="w-3.5 h-3.5" />
            <span>zero-lag synth</span>
          </span>
        </div>
      </footer>
    </main>
  );
}
