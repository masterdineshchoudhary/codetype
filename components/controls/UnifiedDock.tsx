/**
 * CodeType UnifiedDock Component
 * 2027 Modern Design Language: Single, unified floating glassmorphic dock.
 * Consolidates brand, mode selection, sub-options, themes, sound, and tools into one seamless toolbar.
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import type {
  EngineConfig,
  StandardDurationSeconds,
  StandardWordCount,
  SupportedLanguage,
  ThemeId,
  SoundProfile,
} from '../../types/typing';
import { THEME_PRESETS } from '../../lib/themes/themeDefinitions';
import {
  Code2,
  Command,
  FileCode,
  Hash,
  Keyboard,
  Palette,
  Sparkles,
  Terminal,
  Volume2,
  VolumeX,
  Check,
  ChevronDown,
} from 'lucide-react';

export interface UnifiedDockProps {
  config: EngineConfig;
  status: string;
  onConfigChange: (updated: Partial<EngineConfig>) => void;
  onThemeChange: (theme: ThemeId) => void;
  soundProfile: SoundProfile;
  soundVolume: number;
  isMuted: boolean;
  onSoundProfileChange: (p: SoundProfile) => void;
  onSoundVolumeChange: (v: number) => void;
  onToggleMute: () => void;
  showKeyboardMap: boolean;
  onToggleKeyboardMap: () => void;
  onOpenCustomSnippet: () => void;
  onOpenCommandPalette: () => void;
  className?: string;
}

const SUPPORTED_LANGS: { id: SupportedLanguage; label: string; ext: string }[] = [
  { id: 'typescript', label: 'TypeScript', ext: 'TS' },
  { id: 'python', label: 'Python', ext: 'PY' },
  { id: 'rust', label: 'Rust', ext: 'RS' },
  { id: 'go', label: 'Go', ext: 'GO' },
  { id: 'sql', label: 'SQL', ext: 'SQL' },
];

export function UnifiedDock({
  config,
  status,
  onConfigChange,
  onThemeChange,
  soundProfile,
  soundVolume,
  isMuted,
  onSoundProfileChange,
  onSoundVolumeChange,
  onToggleMute,
  showKeyboardMap,
  onToggleKeyboardMap,
  onOpenCustomSnippet,
  onOpenCommandPalette,
  className = '',
}: UnifiedDockProps) {
  const isRunning = status === 'running';
  const [themeOpen, setThemeOpen] = useState(false);
  const [soundOpen, setSoundOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const themeRef = useRef<HTMLDivElement | null>(null);
  const soundRef = useRef<HTMLDivElement | null>(null);
  const langRef = useRef<HTMLDivElement | null>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeOpen(false);
      }
      if (soundRef.current && !soundRef.current.contains(e.target as Node)) {
        setSoundOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const activeTheme = THEME_PRESETS[config.theme] || THEME_PRESETS.monochrome;
  const currentLang = SUPPORTED_LANGS.find((l) => l.id === config.syntaxOptions.language) || SUPPORTED_LANGS[0];

  return (
    <nav
      className={`relative z-40 flex items-center justify-between w-full max-w-4xl px-3 py-1.5 glass-dock rounded-2xl shadow-xl transition-all duration-300 select-none ${className}`}
    >
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-2 pr-3 border-r border-[var(--border-subtle)]/40">
        <div className="flex items-center gap-1.5 font-bold tracking-tight text-sm text-[var(--text-bright)]">
          <Terminal className="w-4 h-4 text-[var(--accent)]" />
          <span>codetype</span>
        </div>
      </div>

      {/* Center: Fluid Segmented Mode & Option Selector */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {/* Core Mode Switcher */}
        <div className="flex items-center p-0.5 rounded-xl bg-[var(--surface-hover)]/40 border border-[var(--border-subtle)]/40 text-xs font-mono">
          <button
            type="button"
            disabled={isRunning}
            onClick={() =>
              onConfigChange({
                mode: 'standard',
                standardOptions: { ...config.standardOptions, type: 'words' },
              })
            }
            className={`px-2.5 py-1 rounded-lg transition-all ${
              config.mode === 'standard' && config.standardOptions.type === 'words'
                ? 'bg-[var(--surface)] text-[var(--text-bright)] shadow-sm font-semibold'
                : 'text-[var(--text-dim)] hover:text-[var(--text-bright)]'
            }`}
          >
            Words
          </button>
          <button
            type="button"
            disabled={isRunning}
            onClick={() =>
              onConfigChange({
                mode: 'standard',
                standardOptions: { ...config.standardOptions, type: 'time' },
              })
            }
            className={`px-2.5 py-1 rounded-lg transition-all ${
              config.mode === 'standard' && config.standardOptions.type === 'time'
                ? 'bg-[var(--surface)] text-[var(--text-bright)] shadow-sm font-semibold'
                : 'text-[var(--text-dim)] hover:text-[var(--text-bright)]'
            }`}
          >
            Time
          </button>
          <button
            type="button"
            disabled={isRunning}
            onClick={() => onConfigChange({ mode: 'syntax' })}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              config.mode === 'syntax'
                ? 'bg-[var(--surface)] text-[var(--text-bright)] shadow-sm font-semibold'
                : 'text-[var(--text-dim)] hover:text-[var(--text-bright)]'
            }`}
          >
            <Code2 className="w-3 h-3 text-[var(--accent)]" />
            <span>Syntax</span>
          </button>
          <button
            type="button"
            disabled={isRunning}
            onClick={() => onConfigChange({ mode: 'keybr' })}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
              config.mode === 'keybr'
                ? 'bg-[var(--surface)] text-[var(--accent)] shadow-sm font-semibold'
                : 'text-[var(--text-dim)] hover:text-[var(--text-bright)]'
            }`}
          >
            <Sparkles className="w-3 h-3 text-[var(--accent)]" />
            <span>Keybr</span>
          </button>
        </div>

        {/* Dynamic Contextual Options */}
        {config.mode === 'standard' && config.standardOptions.type === 'words' && (
          <div className="flex items-center gap-1 text-xs font-mono">
            {([10, 25, 50, 100] as StandardWordCount[]).map((count) => (
              <button
                key={count}
                type="button"
                disabled={isRunning}
                onClick={() =>
                  onConfigChange({
                    standardOptions: { ...config.standardOptions, wordCount: count },
                  })
                }
                className={`px-2 py-0.5 rounded-md transition-all ${
                  config.standardOptions.wordCount === count
                    ? 'text-[var(--accent)] font-bold'
                    : 'text-[var(--text-dim)] hover:text-[var(--text-bright)]'
                }`}
              >
                {count}
              </button>
            ))}
          </div>
        )}

        {config.mode === 'standard' && config.standardOptions.type === 'time' && (
          <div className="flex items-center gap-1 text-xs font-mono">
            {([15, 30, 60] as StandardDurationSeconds[]).map((dur) => (
              <button
                key={dur}
                type="button"
                disabled={isRunning}
                onClick={() =>
                  onConfigChange({
                    standardOptions: { ...config.standardOptions, duration: dur },
                  })
                }
                className={`px-2 py-0.5 rounded-md transition-all ${
                  config.standardOptions.duration === dur
                    ? 'text-[var(--accent)] font-bold'
                    : 'text-[var(--text-dim)] hover:text-[var(--text-bright)]'
                }`}
              >
                {dur}s
              </button>
            ))}
          </div>
        )}

        {/* Syntax Language Picker */}
        {config.mode === 'syntax' && (
          <div ref={langRef} className="relative inline-block text-xs font-mono">
            <button
              type="button"
              disabled={isRunning}
              onClick={() => setLangOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--surface-hover)]/40 hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)]/40 text-[var(--text-bright)] transition-colors"
            >
              <span>{currentLang.label}</span>
              <ChevronDown className="w-3 h-3 text-[var(--text-dim)]" />
            </button>

            {langOpen && (
              <div className="absolute left-0 mt-1.5 w-36 p-1 glass-card rounded-xl shadow-2xl z-50 animate-fade-in">
                {SUPPORTED_LANGS.map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => {
                      onConfigChange({
                        syntaxOptions: { ...config.syntaxOptions, language: lang.id },
                      });
                      setLangOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      config.syntaxOptions.language === lang.id
                        ? 'bg-[var(--surface-hover)] text-[var(--text-bright)] font-semibold'
                        : 'text-[var(--text-dim)] hover:text-[var(--text-bright)]'
                    }`}
                  >
                    <span>{lang.label}</span>
                    <span className="text-[10px] opacity-50">{lang.ext}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Standard Modifiers: Punctuation & Numbers */}
        {config.mode === 'standard' && (
          <div className="flex items-center gap-1 pl-1 border-l border-[var(--border-subtle)]/40 text-xs">
            <button
              type="button"
              disabled={isRunning}
              onClick={() =>
                onConfigChange({
                  standardOptions: {
                    ...config.standardOptions,
                    punctuation: !config.standardOptions.punctuation,
                  },
                })
              }
              className={`px-1.5 py-0.5 rounded transition-colors ${
                config.standardOptions.punctuation
                  ? 'text-[var(--accent)] font-bold'
                  : 'text-[var(--text-dim)] hover:text-[var(--text-bright)] opacity-60 hover:opacity-100'
              }`}
              title="Toggle punctuation"
            >
              @
            </button>
            <button
              type="button"
              disabled={isRunning}
              onClick={() =>
                onConfigChange({
                  standardOptions: {
                    ...config.standardOptions,
                    numbers: !config.standardOptions.numbers,
                  },
                })
              }
              className={`p-1 rounded transition-colors ${
                config.standardOptions.numbers
                  ? 'text-[var(--accent)] font-bold'
                  : 'text-[var(--text-dim)] hover:text-[var(--text-bright)] opacity-60 hover:opacity-100'
              }`}
              title="Toggle numbers"
            >
              <Hash className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Right: Micro-Tool Cluster */}
      <div className="flex items-center gap-1.5 pl-3 border-l border-[var(--border-subtle)]/40">
        {/* Theme Picker Dropdown */}
        <div ref={themeRef} className="relative inline-block">
          <button
            type="button"
            disabled={isRunning}
            onClick={() => setThemeOpen((prev) => !prev)}
            className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--text-dim)] hover:text-[var(--text-bright)] transition-colors"
            title={`Theme: ${activeTheme.name}`}
          >
            <Palette className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span
              className="w-2 h-2 rounded-full border border-black/30 shadow-sm"
              style={{ backgroundColor: activeTheme.colors.accent }}
            />
          </button>

          {themeOpen && (
            <div className="absolute right-0 mt-2 w-48 p-1.5 glass-card rounded-xl shadow-2xl z-50 animate-fade-in font-mono text-xs">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-dim)] border-b border-[var(--border-subtle)]/40 mb-1">
                4 Minimal Themes
              </div>
              {Object.values(THEME_PRESETS).map((t) => {
                const isSelected = t.id === config.theme;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      onThemeChange(t.id);
                      setThemeOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-[var(--surface-hover)] text-[var(--text-bright)] font-semibold'
                        : 'text-[var(--text-dim)] hover:text-[var(--text-bright)]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex items-center -space-x-1">
                        <span
                          className="w-3 h-3 rounded-full border border-white/20"
                          style={{ backgroundColor: t.colors.bg }}
                        />
                        <span
                          className="w-3 h-3 rounded-full border border-black/30"
                          style={{ backgroundColor: t.colors.accent }}
                        />
                      </div>
                      <span>{t.name}</span>
                    </div>
                    {isSelected && <Check className="w-3 h-3 text-[var(--accent)]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Sound Switcher Popover */}
        <div ref={soundRef} className="relative inline-block">
          <button
            type="button"
            onClick={() => setSoundOpen((prev) => !prev)}
            className={`p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-colors ${
              isMuted
                ? 'text-[var(--text-dim)] opacity-50'
                : 'text-[var(--text-dim)] hover:text-[var(--text-bright)]'
            }`}
            title={`Sound: ${isMuted ? 'Muted' : soundProfile}`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {soundOpen && (
            <div className="absolute right-0 mt-2 w-48 p-2.5 glass-card rounded-xl shadow-2xl z-50 animate-fade-in font-mono text-xs">
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[var(--border-subtle)]/40 text-[10px] uppercase text-[var(--text-dim)]">
                <span>Switch Audio</span>
                <button
                  type="button"
                  onClick={onToggleMute}
                  className="text-[10px] text-[var(--accent)] hover:underline"
                >
                  {isMuted ? 'Unmute' : 'Mute'}
                </button>
              </div>
              <div className="space-y-1">
                {(['thock', 'clicky', 'silent'] as SoundProfile[]).map((prof) => (
                  <button
                    key={prof}
                    type="button"
                    onClick={() => {
                      onSoundProfileChange(prof);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg capitalize transition-colors ${
                      soundProfile === prof && !isMuted
                        ? 'bg-[var(--surface-hover)] text-[var(--text-bright)] font-semibold'
                        : 'text-[var(--text-dim)] hover:text-[var(--text-bright)]'
                    }`}
                  >
                    <span>{prof}</span>
                    {soundProfile === prof && !isMuted && (
                      <Check className="w-3 h-3 text-[var(--accent)]" />
                    )}
                  </button>
                ))}
              </div>
              {/* Volume Slider */}
              <div className="pt-2 mt-2 border-t border-[var(--border-subtle)]/40 flex items-center gap-2">
                <span className="text-[10px] text-[var(--text-dim)]">Vol</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundVolume}
                  onChange={(e) => onSoundVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-1 bg-[var(--surface-hover)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
                />
              </div>
            </div>
          )}
        </div>

        {/* Keymap Toggle Button */}
        <button
          type="button"
          onClick={onToggleKeyboardMap}
          className={`p-1.5 rounded-lg transition-colors ${
            showKeyboardMap
              ? 'text-[var(--accent)] bg-[var(--surface-hover)]'
              : 'text-[var(--text-dim)] hover:text-[var(--text-bright)]'
          }`}
          title="Toggle On-Screen Keyboard Map"
        >
          <Keyboard className="w-3.5 h-3.5" />
        </button>

        {/* Custom Snippet Button */}
        <button
          type="button"
          onClick={onOpenCustomSnippet}
          className="p-1.5 rounded-lg text-[var(--text-dim)] hover:text-[var(--text-bright)] hover:bg-[var(--surface-hover)] transition-colors"
          title="Custom Code Snippet"
        >
          <FileCode className="w-3.5 h-3.5" />
        </button>

        {/* Command Palette Button */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono bg-[var(--surface-hover)]/60 hover:bg-[var(--surface-hover)] text-[var(--text-dim)] hover:text-[var(--text-bright)] transition-colors"
          title="Command Palette (Cmd+K)"
        >
          <Command className="w-3 h-3" />
          <span>K</span>
        </button>
      </div>
    </nav>
  );
}
