/**
 * CodeType ThemeSelector Component
 * Compact, accessible selector for the 4 curated minimal themes:
 * Soft Black, Soft White, Monochrome, and Terminal.
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { THEME_PRESETS } from '../../lib/themes/themeDefinitions';
import type { ThemeId } from '../../types/typing';

export interface ThemeSelectorProps {
  currentTheme: ThemeId;
  onThemeChange: (themeId: ThemeId) => void;
  disabled?: boolean;
}

export function ThemeSelector({
  currentTheme,
  onThemeChange,
  disabled = false,
}: ThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close dropdown on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const themes = Object.values(THEME_PRESETS);
  const activePreset = THEME_PRESETS[currentTheme] || THEME_PRESETS.monochrome;

  return (
    <div ref={dropdownRef} className="relative inline-block text-left font-mono">
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-2.5 py-1 text-xs select-none bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] rounded-full text-[var(--text-dim)] hover:text-[var(--text-bright)] transition-colors disabled:opacity-50 disabled:pointer-events-none"
        title="Select Theme (4 minimal presets)"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span
          className="w-3.5 h-3.5 rounded-[3px] border border-[var(--border-subtle)] shadow-xs shrink-0"
          style={{ backgroundColor: activePreset.colors.accent }}
        />
        <span className="hidden sm:inline capitalize">
          {activePreset.name}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 mt-2 w-56 p-1.5 bg-[var(--surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl z-50 animate-fade-in"
        >
          <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-dim)] border-b border-[var(--border-subtle)]/60 mb-1 flex items-center justify-between">
            <span>Color Themes</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-[var(--bg)] border border-[var(--border-subtle)]">
              4 Presets
            </span>
          </div>

          <div className="space-y-1">
            {themes.map((t) => {
              const isSelected = t.id === currentTheme;
              return (
                <button
                  key={t.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onThemeChange(t.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg transition-all ${
                    isSelected
                      ? 'bg-[var(--surface-hover)] text-[var(--text-bright)] font-semibold border border-[var(--border-subtle)]'
                      : 'text-[var(--text-dim)] hover:text-[var(--text-bright)] hover:bg-[var(--surface-hover)]/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Container box preview */}
                    <span
                      className="w-3.5 h-3.5 rounded-[3px] border border-[var(--border-subtle)] shadow-xs shrink-0"
                      style={{ backgroundColor: t.colors.accent }}
                    />
                    <div className="flex flex-col text-left">
                      <span className="text-xs">{t.name}</span>
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

