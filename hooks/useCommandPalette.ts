/**
 * CodeType Command Palette Controller Hook (useCommandPalette)
 * Manages Cmd+K hotkey detection, fuzzy filter queries, and arrow key navigation.
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CommandItem, filterCommands } from '../lib/commands/commandRegistry';

export interface UseCommandPaletteProps {
  commands: CommandItem[];
  onOpen?: () => void;
  onClose?: () => void;
}

export interface UseCommandPaletteReturn {
  isOpen: boolean;
  query: string;
  selectedIndex: number;
  filteredCommands: CommandItem[];
  openPalette: () => void;
  closePalette: () => void;
  togglePalette: () => void;
  setQuery: (q: string) => void;
  setSelectedIndex: (idx: number) => void;
  executeSelected: () => void;
  handlePaletteKeyDown: (e: React.KeyboardEvent) => void;
}

export function useCommandPalette({
  commands,
  onOpen,
  onClose,
}: UseCommandPaletteProps): UseCommandPaletteReturn {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // Filter commands by query
  const filteredCommands = useMemo(() => {
    return filterCommands(query, commands);
  }, [query, commands]);

  // Adjust selected index when filtered list changes
  useEffect(() => {
    setSelectedIndex((prev) => {
      if (filteredCommands.length === 0) return 0;
      return Math.min(prev, filteredCommands.length - 1);
    });
  }, [filteredCommands.length]);

  const openPalette = useCallback(() => {
    setIsOpen(true);
    setQuery('');
    setSelectedIndex(0);
    onOpen?.();
  }, [onOpen]);

  const closePalette = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(0);
    onClose?.();
  }, [onClose]);

  const togglePalette = useCallback(() => {
    if (isOpen) {
      closePalette();
    } else {
      openPalette();
    }
  }, [closePalette, isOpen, openPalette]);

  const executeSelected = useCallback(() => {
    const target = filteredCommands[selectedIndex];
    if (target) {
      target.action();
      closePalette();
    }
  }, [closePalette, filteredCommands, selectedIndex]);

  // Keyboard navigation inside palette
  const handlePaletteKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closePalette();
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredCommands.length === 0 ? 0 : (prev + 1) % filteredCommands.length
        );
        return;
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredCommands.length === 0
            ? 0
            : (prev - 1 + filteredCommands.length) % filteredCommands.length
        );
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        executeSelected();
        return;
      }
    },
    [closePalette, executeSelected, filteredCommands.length]
  );

  // Global hotkey detection (Cmd+K / Ctrl+K)
  useEffect(() => {
    let lastTabTimestamp = 0;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        e.stopPropagation();
        togglePalette();
        return;
      }

      // Tab + Enter shortcut
      if (e.key === 'Tab') {
        lastTabTimestamp = Date.now();
      } else if (e.key === 'Enter' && Date.now() - lastTabTimestamp < 400 && !isOpen) {
        e.preventDefault();
        openPalette();
        return;
      }

      // Close on Escape if open
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        closePalette();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown, true);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown, true);
  }, [closePalette, isOpen, openPalette, togglePalette]);

  return {
    isOpen,
    query,
    selectedIndex,
    filteredCommands,
    openPalette,
    closePalette,
    togglePalette,
    setQuery,
    setSelectedIndex,
    executeSelected,
    handlePaletteKeyDown,
  };
}

