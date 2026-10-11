/**
 * CodeType CharacterSpan Component
 * Performance Law 1 Compliant:
 * Renders individual character with memoization and ref registration.
 * State updates are applied directly by the engine via DOM classList / data-status
 * avoiding costly React component tree re-renders per keystroke.
 */

'use client';

import React, { memo, useEffect, useRef } from 'react';
import type { CharacterStatus, SyntaxTokenType } from '../../types/typing';

export interface CharacterSpanProps {
  char: string;
  index: number;
  syntaxType?: SyntaxTokenType;
  registerCharElement: (index: number, el: HTMLElement | null) => void;
  getCharStatus?: (index: number) => CharacterStatus;
}

export const CharacterSpan = memo(function CharacterSpan({
  char,
  index,
  syntaxType,
  registerCharElement,
}: CharacterSpanProps) {
  const spanRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    registerCharElement(index, spanRef.current);
    return () => {
      registerCharElement(index, null);
    };
  }, [index, registerCharElement]);

  // Handle display formatting
  if (char === '\n') {
    return (
      <span
        ref={spanRef}
        data-index={index}
        data-status="pending"
        className="char-span inline-block w-full h-0 my-1 pointer-events-none"
      >
        <span className="text-[var(--text-dim)] text-xs opacity-40 select-none">↵</span>
        <br />
      </span>
    );
  }

  if (char === ' ') {
    return (
      <span
        ref={spanRef}
        data-index={index}
        data-status="pending"
        className="char-span inline-block whitespace-pre select-none transition-colors duration-75 text-[var(--text-dim)]"
      >
        {' '}
      </span>
    );
  }

  return (
    <span
      ref={spanRef}
      data-index={index}
      data-status="pending"
      data-syntax={syntaxType && syntaxType !== 'default' ? syntaxType : undefined}
      className="char-span inline-block select-none transition-colors duration-75 text-[var(--text-dim)]"
    >
      {char}
    </span>
  );
});


