/**
 * CodeType LanguageSelector Component
 * Language selector for Syntax Mode.
 */

'use client';

import React from 'react';
import type { SupportedLanguage } from '../../types/typing';

export interface LanguageSelectorProps {
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  disabled?: boolean;
}

const SUPPORTED_LANGUAGES: { id: SupportedLanguage; label: string }[] = [
  { id: 'typescript', label: 'TypeScript' },
  { id: 'python', label: 'Python' },
  { id: 'sql', label: 'SQL' },
  { id: 'rust', label: 'Rust' },
  { id: 'go', label: 'Go' },
];

export function LanguageSelector({
  language,
  onLanguageChange,
  disabled = false,
}: LanguageSelectorProps) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono select-none bg-[var(--surface)] border border-[var(--border-subtle)] rounded-full">
      <span className="text-[var(--text-dim)] uppercase text-[10px] tracking-wider pr-1">LANG:</span>
      {SUPPORTED_LANGUAGES.map((l) => (
        <button
          key={l.id}
          disabled={disabled}
          onClick={() => onLanguageChange(l.id)}
          className={`px-2 py-0.5 rounded transition-colors ${
            language === l.id
              ? 'text-[var(--accent)] bg-[var(--surface-hover)] font-bold'
              : 'text-[var(--text-dim)] hover:text-[var(--text-bright)]'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

