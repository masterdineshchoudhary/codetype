/**
 * CodeType ModeToggle Component
 * Dual Engine switcher: Standard (Words/Time) vs. Syntax (Developer/Keybr)
 */

'use client';

import React from 'react';
import type {
  EngineConfig,
  StandardDurationSeconds,
  StandardWordCount,
  TestEngineMode,
} from '../../types/typing';
import { Code2, Hash, PenTool, Timer, Type, Unlock } from 'lucide-react';

export interface ModeToggleProps {
  config: EngineConfig;
  onChange: (updated: Partial<EngineConfig>) => void;
  disabled?: boolean;
}

export function ModeToggle({ config, onChange, disabled = false }: ModeToggleProps) {
  const isStandard = config.mode === 'standard';
  const isKeybr = config.mode === 'keybr';
  const isSyntax = config.mode === 'syntax';
  const standardType = config.standardOptions.type;
  const currentWords = config.standardOptions.wordCount ?? 25;
  const currentDuration = config.standardOptions.duration ?? 30;

  const handleModeChange = (mode: TestEngineMode) => {
    onChange({ mode });
  };

  const handleStandardTypeChange = (type: 'words' | 'time') => {
    onChange({
      standardOptions: {
        ...config.standardOptions,
        type,
      },
    });
  };

  const handleWordCountChange = (count: StandardWordCount) => {
    onChange({
      standardOptions: {
        ...config.standardOptions,
        type: 'words',
        wordCount: count,
      },
    });
  };

  const handleDurationChange = (duration: StandardDurationSeconds) => {
    onChange({
      standardOptions: {
        ...config.standardOptions,
        type: 'time',
        duration,
      },
    });
  };

  const togglePunctuation = () => {
    onChange({
      standardOptions: {
        ...config.standardOptions,
        punctuation: !config.standardOptions.punctuation,
      },
    });
  };

  const toggleNumbers = () => {
    onChange({
      standardOptions: {
        ...config.standardOptions,
        numbers: !config.standardOptions.numbers,
      },
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 px-4 py-2 text-xs font-mono select-none bg-[var(--surface)] border border-[var(--border-subtle)] rounded-full transition-all">
      {/* Primary Mode Switcher */}
      <div className="flex items-center gap-1 border-r border-[var(--border-subtle)] pr-3">
        <button
          disabled={disabled}
          onClick={() => handleModeChange('standard')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
            isStandard
              ? 'text-[var(--text-bright)] bg-[var(--surface-hover)] font-medium'
              : 'text-[var(--text-dim)] hover:text-[var(--text-bright)]'
          }`}
        >
          <Type className="w-3.5 h-3.5" />
          Standard
        </button>
        <button
          disabled={disabled}
          onClick={() => handleModeChange('syntax')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
            isSyntax
              ? 'text-[var(--text-bright)] bg-[var(--surface-hover)] font-medium'
              : 'text-[var(--text-dim)] hover:text-[var(--text-bright)]'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          Syntax
        </button>
        <button
          disabled={disabled}
          onClick={() => handleModeChange('keybr')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
            isKeybr
              ? 'text-[var(--text-bright)] bg-[var(--surface-hover)] font-medium text-[var(--accent)]'
              : 'text-[var(--text-dim)] hover:text-[var(--text-bright)]'
          }`}
          title="Unlock Letters: Sequential progressive letter unlocking"
        >
          <Unlock className="w-3.5 h-3.5 text-[var(--accent)]" />
          Unlock
        </button>
      </div>

      {/* Mode Options */}
      {isStandard && (
        <div className="flex items-center gap-3">
          {/* Subtype: Words vs Time */}
          <div className="flex items-center gap-1">
            <button
              disabled={disabled}
              onClick={() => handleStandardTypeChange('time')}
              className={`p-1 rounded transition-colors ${
                standardType === 'time'
                  ? 'text-[var(--accent)] font-bold'
                  : 'text-[var(--text-dim)] hover:text-[var(--text-bright)]'
              }`}
              title="Timed sprint"
            >
              <Timer className="w-3.5 h-3.5" />
            </button>
            <button
              disabled={disabled}
              onClick={() => handleStandardTypeChange('words')}
              className={`p-1 rounded transition-colors ${
                standardType === 'words'
                  ? 'text-[var(--accent)] font-bold'
                  : 'text-[var(--text-dim)] hover:text-[var(--text-bright)]'
              }`}
              title="Word count"
            >
              <PenTool className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="text-[var(--border-subtle)]">|</span>

          {/* Counts */}
          {standardType === 'time' ? (
            <div className="flex items-center gap-1">
              {([15, 30, 60] as StandardDurationSeconds[]).map((dur) => (
                <button
                  key={dur}
                  disabled={disabled}
                  onClick={() => handleDurationChange(dur)}
                  className={`px-1.5 py-0.5 rounded transition-colors ${
                    currentDuration === dur
                      ? 'text-[var(--accent)] font-bold'
                      : 'text-[var(--text-dim)] hover:text-[var(--text-bright)]'
                  }`}
                >
                  {dur}s
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              {([25, 50, 100] as StandardWordCount[]).map((wc) => (
                <button
                  key={wc}
                  disabled={disabled}
                  onClick={() => handleWordCountChange(wc)}
                  className={`px-1.5 py-0.5 rounded transition-colors ${
                    currentWords === wc
                      ? 'text-[var(--accent)] font-bold'
                      : 'text-[var(--text-dim)] hover:text-[var(--text-bright)]'
                  }`}
                >
                  {wc}
                </button>
              ))}
            </div>
          )}

          <span className="text-[var(--border-subtle)]">|</span>

          {/* Modifiers */}
          <div className="flex items-center gap-2">
            <button
              disabled={disabled}
              onClick={togglePunctuation}
              className={`px-1.5 py-0.5 rounded transition-colors ${
                config.standardOptions.punctuation
                  ? 'text-[var(--accent)] font-bold'
                  : 'text-[var(--text-dim)] hover:text-[var(--text-bright)]'
              }`}
            >
              @ punctuation
            </button>
            <button
              disabled={disabled}
              onClick={toggleNumbers}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${
                config.standardOptions.numbers
                  ? 'text-[var(--accent)] font-bold'
                  : 'text-[var(--text-dim)] hover:text-[var(--text-bright)]'
              }`}
            >
              <Hash className="w-3 h-3" /> numbers
            </button>
          </div>
        </div>
      )}

      {/* Syntax Mode Options */}
      {isSyntax && (
        <div className="flex items-center gap-3">
          <button
            disabled={disabled}
            onClick={() =>
              onChange({
                syntaxOptions: {
                  ...config.syntaxOptions,
                  adaptiveWeakKeys: !config.syntaxOptions.adaptiveWeakKeys,
                },
              })
            }
            className={`px-2 py-0.5 rounded transition-colors ${
              config.syntaxOptions.adaptiveWeakKeys
                ? 'text-[var(--accent)] font-bold bg-[var(--surface-hover)]'
                : 'text-[var(--text-dim)] hover:text-[var(--text-bright)]'
            }`}
          >
            Adaptive Weak-Keys ({config.syntaxOptions.adaptiveWeakKeys ? 'ON' : 'OFF'})
          </button>
        </div>
      )}

      {/* Letter Unlock Mastery Mode Options */}
      {isKeybr && (
        <div className="flex items-center gap-2 text-[var(--accent)] font-medium">
          <Unlock className="w-3.5 h-3.5" />
          <span>Sequential Letter Unlock</span>
        </div>
      )}
    </div>
  );
}

