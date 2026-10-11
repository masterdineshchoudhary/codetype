/**
 * CodeType Multi-Theme Engine & Palette Registry
 * Defines high-contrast CSS variable tokens for Monochrome, Carbon, Matrix, Nord, and Cyberpunk.
 */

import type { ThemeId, ThemePreset, ThemeColors } from '../../types/typing';

export type { ThemeId, ThemePreset, ThemeColors };

export const THEME_STORAGE_KEY = 'codetype_theme_id_v1';

export const THEME_PRESETS: Record<ThemeId, ThemePreset> = {
  monochrome: {
    id: 'monochrome',
    name: 'Monochrome Minimal',
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
  carbon: {
    id: 'carbon',
    name: 'Carbon Gray',
    colors: {
      bg: '#161616',
      surface: '#262626',
      surfaceHover: '#333333',
      borderSubtle: '#393939',
      textDim: '#6f6f6f',
      textBright: '#f4f4f4',
      caretColor: '#33b1ff',
      accent: '#33b1ff',
      errorColor: '#fa4d56',
      errorExtra: '#750e13',
      syntaxKeyword: '#ee5396',
      syntaxString: '#25be6a',
      syntaxComment: '#6f6f6f',
      syntaxNumber: '#08bdba',
      syntaxOperator: '#33b1ff',
      syntaxFunction: '#78a9ff',
      syntaxType: '#be95ff',
      syntaxPunctuation: '#c6c6c6',
    },
  },
  matrix: {
    id: 'matrix',
    name: 'Matrix Terminal',
    colors: {
      bg: '#020904',
      surface: '#08140a',
      surfaceHover: '#0e2413',
      borderSubtle: '#12331b',
      textDim: '#2a6a3b',
      textBright: '#47e66f',
      caretColor: '#00ff41',
      accent: '#00ff41',
      errorColor: '#ff3344',
      errorExtra: '#66111a',
      syntaxKeyword: '#00ff41',
      syntaxString: '#20c20e',
      syntaxComment: '#1b5e20',
      syntaxNumber: '#54ff82',
      syntaxOperator: '#39ff14',
      syntaxFunction: '#00e676',
      syntaxType: '#69f0ae',
      syntaxPunctuation: '#47e66f',
    },
  },
  nord: {
    id: 'nord',
    name: 'Nordic Frost',
    colors: {
      bg: '#242933',
      surface: '#2e3440',
      surfaceHover: '#3b4252',
      borderSubtle: '#434c5e',
      textDim: '#707c93',
      textBright: '#eceff4',
      caretColor: '#88c0d0',
      accent: '#88c0d0',
      errorColor: '#bf616a',
      errorExtra: '#5e3035',
      syntaxKeyword: '#81a1c1',
      syntaxString: '#a3be8c',
      syntaxComment: '#616e88',
      syntaxNumber: '#b48ead',
      syntaxOperator: '#88c0d0',
      syntaxFunction: '#8fbcbb',
      syntaxType: '#ebcb8b',
      syntaxPunctuation: '#d8dee9',
    },
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    colors: {
      bg: '#0a0814',
      surface: '#141026',
      surfaceHover: '#211a3d',
      borderSubtle: '#2f2457',
      textDim: '#6d6199',
      textBright: '#00f0ff',
      caretColor: '#fcee0a',
      accent: '#fcee0a',
      errorColor: '#ff0055',
      errorExtra: '#770028',
      syntaxKeyword: '#ff0055',
      syntaxString: '#00f0ff',
      syntaxComment: '#6d6199',
      syntaxNumber: '#fcee0a',
      syntaxOperator: '#ff5500',
      syntaxFunction: '#39ff14',
      syntaxType: '#d600ff',
      syntaxPunctuation: '#ffffff',
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
