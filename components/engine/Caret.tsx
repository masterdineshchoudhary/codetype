/**
 * CodeType Caret Component
 * Renders smooth hardware-accelerated ghost caret via translate3d.
 * Supports line, block, underline, and box styles.
 */

'use client';

import React, { forwardRef } from 'react';
import type { CaretCoordinates, CaretStyle } from '../../types/typing';

export interface CaretProps {
  coords: CaretCoordinates;
  style?: CaretStyle;
  isMoving?: boolean;
}

export const Caret = forwardRef<HTMLDivElement, CaretProps>(function Caret(
  { coords, style = 'line', isMoving = false },
  ref
) {
  if (style === 'off' || !coords.visible) {
    return null;
  }

  // Base style class depending on CaretStyle
  let styleClasses = 'bg-[var(--caret-color)]';
  let inlineStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    transform: `translate3d(${coords.left}px, ${coords.top}px, 0)`,
    height: `${coords.height}px`,
    pointerEvents: 'none',
    transition: 'transform 75ms cubic-bezier(0.1, 0.9, 0.2, 1), opacity 150ms ease',
    willChange: 'transform',
    zIndex: 20,
  };

  switch (style) {
    case 'block':
      inlineStyles.width = `${Math.max(8, coords.width)}px`;
      styleClasses = 'bg-[var(--caret-color)] opacity-75';
      break;

    case 'underline':
      inlineStyles.width = `${Math.max(8, coords.width)}px`;
      inlineStyles.height = '2px';
      inlineStyles.top = `${coords.height - 2}px`;
      styleClasses = 'bg-[var(--caret-color)]';
      break;

    case 'box':
      inlineStyles.width = `${Math.max(8, coords.width)}px`;
      styleClasses = 'border-2 border-[var(--caret-color)] bg-transparent';
      break;

    case 'line':
    default:
      inlineStyles.width = '2px';
      styleClasses = 'bg-[var(--caret-color)] rounded-full';
      break;
  }

  const animationClass = isMoving ? '' : 'animate-caret-blink';

  return (
    <div
      ref={ref}
      style={inlineStyles}
      className={`caret-indicator ${styleClasses} ${animationClass}`}
    />
  );
});

