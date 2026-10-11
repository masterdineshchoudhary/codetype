/**
 * CodeType CommandPalette Component
 * High-performance, keyboard-first modal action palette (Cmd+K / Tab+Enter).
 */

'use client';

import React, { useEffect, useRef } from 'react';
import type { CommandItem } from '../../lib/commands/commandRegistry';
import {
  Code2,
  MousePointer,
  Hash,
  Palette,
  Search,
  Sparkles,
  Type,
  Volume2,
} from 'lucide-react';

export interface CommandPaletteProps {
  isOpen: boolean;
  query: string;
  selectedIndex: number;
  filteredCommands: CommandItem[];
  onQueryChange: (query: string) => void;
  onSelectIndex: (index: number) => void;
  onExecute: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onClose: () => void;
}

export function CommandPalette({
  isOpen,
  query,
  selectedIndex,
  filteredCommands,
  onQueryChange,
  onSelectIndex,
  onExecute,
  onKeyDown,
  onClose,
}: CommandPaletteProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  // Auto-focus search input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Scroll active item into view
  useEffect(() => {
    if (!isOpen || !listRef.current) return;
    const activeEl = listRef.current.querySelector<HTMLElement>(`[data-index="${selectedIndex}"]`);
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, isOpen]);

  if (!isOpen) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'theme':
        return <Palette className="w-3.5 h-3.5 text-[var(--accent)]" />;
      case 'sound':
        return <Volume2 className="w-3.5 h-3.5 text-blue-400" />;
      case 'language':
        return <Code2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'mode':
        return <Type className="w-3.5 h-3.5 text-purple-400" />;
      case 'caret':
        return <MousePointer className="w-3.5 h-3.5 text-amber-400" />;
      case 'snippet':
        return <Code2 className="w-3.5 h-3.5 text-cyan-400" />;
      case 'test':
      default:
        return <Sparkles className="w-3.5 h-3.5 text-orange-400" />;
    }
  };


  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm animate-fade-in font-mono"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col w-full max-w-xl bg-[var(--surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl overflow-hidden transition-all"
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--bg)]">
          <Search className="w-4 h-4 text-[var(--text-dim)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type a command or search (theme, mode, language, sound)..."
            className="w-full bg-transparent text-sm text-[var(--text-bright)] placeholder:text-[var(--text-dim)] outline-none"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] text-[var(--text-dim)] bg-[var(--surface)] border border-[var(--border-subtle)] rounded shrink-0">
            Esc
          </kbd>
        </div>

        {/* Command List */}
        <div ref={listRef} className="max-h-72 overflow-y-auto p-1.5 space-y-0.5">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-[var(--text-dim)]">
              No matching commands found.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  data-index={idx}
                  onClick={() => {
                    onSelectIndex(idx);
                    onExecute();
                  }}
                  onMouseEnter={() => onSelectIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[var(--surface-hover)] text-[var(--text-bright)] font-medium border-l-2 border-[var(--accent)]'
                      : 'text-[var(--text-dim)] hover:text-[var(--text-bright)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {getCategoryIcon(cmd.category)}
                    <span>{cmd.title}</span>
                    {cmd.subtitle && (
                      <span className="text-[10px] text-[var(--text-dim)]">
                        — {cmd.subtitle}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-[var(--text-dim)] px-1.5 py-0.5 rounded bg-[var(--bg)] border border-[var(--border-subtle)]">
                    {cmd.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--border-subtle)] bg-[var(--bg)] text-[10px] text-[var(--text-dim)]">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.2 bg-[var(--surface)] border border-[var(--border-subtle)] rounded mr-1">
                ↑
              </kbd>
              <kbd className="px-1 py-0.2 bg-[var(--surface)] border border-[var(--border-subtle)] rounded mr-1">
                ↓
              </kbd>
              navigate
            </span>
            <span>
              <kbd className="px-1 py-0.2 bg-[var(--surface)] border border-[var(--border-subtle)] rounded mr-1">
                ↵
              </kbd>
              select
            </span>
          </div>
          <span>
            <kbd className="px-1 py-0.2 bg-[var(--surface)] border border-[var(--border-subtle)] rounded mr-1">
              Cmd+K
            </kbd>
            toggle
          </span>
        </div>
      </div>
    </div>
  );
}
