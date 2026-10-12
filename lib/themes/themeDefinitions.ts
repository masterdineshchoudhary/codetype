/**
 * CodeType Multi-Theme Engine & Palette Registry
 * Defines high-contrast CSS variable tokens for Monochrome, Carbon, Matrix, Nord, and Cyberpunk.
 */

import type { ThemeId, ThemePreset, ThemeColors } from '../../types/typing';

export type { ThemeId, ThemePreset, ThemeColors };

export const THEME_STORAGE_KEY = 'codetype_theme_id_v1';

export const THEME_PRESETS: Record<ThemeId, ThemePreset> = {
  'soft-black': {
    id: 'soft-black',
    name: 'Soft Black',
    colors: {
      bg: '#121214',
      surface: '#18181b',
      surfaceHover: '#27272a',
      borderSubtle: '#2e2e34',
      textDim: '#71717a',
      textBright: '#f4f4f5',
      caretColor: '#e4e4e7',
      accent: '#e4e4e7',
      errorColor: '#ef4444',
      errorExtra: '#7f1d1d',
      syntaxKeyword: '#e4e4e7',
      syntaxString: '#a1a1aa',
      syntaxComment: '#52525b',
      syntaxNumber: '#d4d4d8',
      syntaxOperator: '#a1a1aa',
      syntaxFunction: '#f4f4f5',
      syntaxType: '#e4e4e7',
      syntaxPunctuation: '#71717a',
    },
  },
  'soft-white': {
    id: 'soft-white',
    name: 'Soft White',
    colors: {
      bg: '#f7f7f8',
      surface: '#ffffff',
      surfaceHover: '#ededf0',
      borderSubtle: '#e2e2e6',
      textDim: '#9ca3af',
      textBright: '#18181b',
      caretColor: '#18181b',
      accent: '#18181b',
      errorColor: '#dc2626',
      errorExtra: '#f87171',
      syntaxKeyword: '#09090b',
      syntaxString: '#52525b',
      syntaxComment: '#a1a1aa',
      syntaxNumber: '#27272a',
      syntaxOperator: '#71717a',
      syntaxFunction: '#18181b',
      syntaxType: '#27272a',
      syntaxPunctuation: '#a1a1aa',
    },
  },
  monochrome: {
    id: 'monochrome',
    name: 'Monochrome',
    colors: {
      bg: '#0e0f12',
      surface: '#14161b',
      surfaceHover: '#1d2027',
      borderSubtle: '#252831',
      textDim: '#646669',
      textBright: '#d1d0c5',
      caretColor: '#e2b714',
      accent: '#e2b714',
      errorColor: '#ca4754',
      errorExtra: '#7e2a33',
      syntaxKeyword: '#c678dd',
      syntaxString: '#98c379',
      syntaxComment: '#5c6370',
      syntaxNumber: '#d19a66',
      syntaxOperator: '#56b6c2',
      syntaxFunction: '#61afef',
      syntaxType: '#e5c07b',
      syntaxPunctuation: '#abb2bf',
    },
  },
  terminal: {
    id: 'terminal',
    name: 'Terminal',
    colors: {
      bg: '#0a0f0d',
      surface: '#0f1712',
      surfaceHover: '#16231b',
      borderSubtle: '#1d3324',
      textDim: '#2e6b43',
      textBright: '#4ade80',
      caretColor: '#22c55e',
      accent: '#22c55e',
      errorColor: '#f87171',
      errorExtra: '#7f1d1d',
      syntaxKeyword: '#22c55e',
      syntaxString: '#86efac',
      syntaxComment: '#166534',
      syntaxNumber: '#4ade80',
      syntaxOperator: '#34d399',
      syntaxFunction: '#22c55e',
      syntaxType: '#86efac',
      syntaxPunctuation: '#4ade80',
    },
  },
};

/**
 * Dynamically applies the theme's colors to document.documentElement CSS variables
 */
export function applyTheme(themeId: ThemeId): void {
  if (typeof document === 'undefined') return;

  const preset = THEME_PRESETS[themeId] || THEME_PRESETS.monochrome;
  const root = document.documentElement;

  root.style.setProperty('--bg', preset.colors.bg);
  root.style.setProperty('--surface', preset.colors.surface);
  root.style.setProperty('--surface-hover', preset.colors.surfaceHover);
  root.style.setProperty('--border-subtle', preset.colors.borderSubtle);
  root.style.setProperty('--text-dim', preset.colors.textDim);
  root.style.setProperty('--text-bright', preset.colors.textBright);
  root.style.setProperty('--caret-color', preset.colors.caretColor);
  root.style.setProperty('--accent', preset.colors.accent);
  root.style.setProperty('--error-color', preset.colors.errorColor);
  root.style.setProperty('--error-extra', preset.colors.errorExtra);

  // Apply syntax variables
  root.style.setProperty('--syntax-keyword', preset.colors.syntaxKeyword);
  root.style.setProperty('--syntax-string', preset.colors.syntaxString);
  root.style.setProperty('--syntax-comment', preset.colors.syntaxComment);
  root.style.setProperty('--syntax-number', preset.colors.syntaxNumber);
  root.style.setProperty('--syntax-operator', preset.colors.syntaxOperator);
  root.style.setProperty('--syntax-function', preset.colors.syntaxFunction);
  root.style.setProperty('--syntax-type', preset.colors.syntaxType);
  root.style.setProperty('--syntax-punctuation', preset.colors.syntaxPunctuation);
}


/**
 * Gets saved theme from localStorage, defaulting to 'monochrome'
 */
export function getStoredTheme(): ThemeId {
  if (typeof window === 'undefined') return 'monochrome';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
    if (saved && saved in THEME_PRESETS) {
      return saved;
    }
  } catch {
    // Storage access fallback
  }
  return 'monochrome';
}

/**
 * Stores theme choice in localStorage
 */
export function storeTheme(themeId: ThemeId): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
  } catch {
    // Storage access fallback
  }
}
