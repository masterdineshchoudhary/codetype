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
