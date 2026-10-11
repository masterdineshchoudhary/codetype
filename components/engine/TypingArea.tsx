/**
 * CodeType TypingArea Component
 * The high-performance text rendering arena.
 * Monospace typography, 3-line viewport scrolling, hidden focus handling,
 * and zero-lag hardware-accelerated caret tracking.
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CharacterSpan } from './CharacterSpan';
import { Caret } from './Caret';
import type { CaretCoordinates, CaretStyle, EngineStatus } from '../../types/typing';

export interface TypingAreaProps {
  targetText: string;
  status: EngineStatus;
  caretCoords: CaretCoordinates;
  caretStyle?: CaretStyle;
  containerRef: React.RefObject<HTMLDivElement | null>;
  caretRef: React.RefObject<HTMLDivElement | null>;
  registerCharElement: (index: number, el: HTMLElement | null) => void;
  handleKeyDown: (e: React.KeyboardEvent | KeyboardEvent) => void;
  isPaletteOpen?: boolean;
}

export function TypingArea({
  targetText,
  status,
  caretCoords,
  caretStyle = 'line',
  containerRef,
  caretRef,
  registerCharElement,
  handleKeyDown,
  isPaletteOpen = false,
}: TypingAreaProps) {
  const [isFocused, setIsFocused] = useState<boolean>(true);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const wordsRef = useRef<HTMLDivElement | null>(null);

  // Auto-focus hidden input on mount and when palette closes
  useEffect(() => {
    if (!isPaletteOpen) {
      inputRef.current?.focus();
      setIsFocused(true);
    }
  }, [isPaletteOpen]);

  // 3-Line Viewport Scrolling Window Math
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Line height is approximately 36px in text-2xl font-mono
    const caretTop = caretCoords.top;
    const lineHeight = caretCoords.height || 36;

    // If caret progresses past the second visible line, scroll container down
    if (caretTop > lineHeight * 1.5) {
      const targetScroll = caretTop - lineHeight;
      container.scrollTo({
        top: targetScroll,
        behavior: 'smooth',
      });
    } else if (caretTop <= lineHeight) {
      container.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, [caretCoords.top, caretCoords.height, containerRef]);

  // Keep focus on window keystroke
  const handleContainerClick = () => {
    inputRef.current?.focus();
    setIsFocused(true);
  };

  return (
    <div
      onClick={handleContainerClick}
      className="relative w-full max-w-4xl py-6 cursor-text outline-none select-none"
    >
      {/* Hidden input to capture IME/mobile and keyboard events reliably */}
      <input
        ref={inputRef}
        type="text"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        className="absolute opacity-0 pointer-events-none w-0 h-0"
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      {/* Focus Warning Overlay */}
      {!isFocused && status !== 'completed' && !isPaletteOpen && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg)]/75 backdrop-blur-[2px] z-30 transition-opacity">
          <div className="px-4 py-2 border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-bright)] text-sm font-mono rounded shadow-lg animate-pulse">
            Click or press any key to focus
          </div>
        </div>
      )}

      {/* 3-Line Text Viewport Container */}
      <div
        ref={containerRef}
        className="relative overflow-hidden max-h-[140px] text-2xl font-mono leading-relaxed tracking-wide transition-all"
        style={{ minHeight: '140px' }}
      >
        {/* Dynamic Smooth Caret */}
        <Caret
          ref={caretRef}
          coords={caretCoords}
          style={caretStyle}
          isMoving={status === 'running'}
        />

        {/* Text Buffer (Characters) */}
        <div ref={wordsRef} className="relative z-10 break-words whitespace-pre-wrap">
          {Array.from(targetText).map((char, index) => (
            <CharacterSpan
              key={index}
              char={char}
              index={index}
              registerCharElement={registerCharElement}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

