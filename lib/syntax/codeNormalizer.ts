/**
 * CodeType Code Normalizer and Ingestion Utility
 * Normalizes user-pasted code or uploaded files:
 * - Tab to space expansion
 * - CRLF to LF normalization
 * - Trailing whitespace and blank line trimming
 * - Common indentation dedenting
 * - Language detection from filenames
 */

import type { SupportedLanguage } from '../../types/typing';

export interface NormalizerOptions {
  tabSize?: number;
  maxChars?: number;
}

export interface NormalizerResult {
  normalized: string;
  lineCount: number;
  error?: string;
}

const EXTENSION_TO_LANGUAGE: Record<string, SupportedLanguage> = {
  ts: 'typescript',
  tsx: 'typescript',
  mts: 'typescript',
  cts: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  py: 'python',
  pyw: 'python',
  rs: 'rust',
  go: 'go',
  sql: 'sql',
  cpp: 'cpp',
  cc: 'cpp',
  cxx: 'cpp',
  hpp: 'cpp',
  h: 'cpp',
  html: 'html',
  htm: 'html',
  css: 'css',
};

/**
 * Infers SupportedLanguage from a given filename
 */
export function detectLanguageFromFilename(filename: string): SupportedLanguage | null {
  const parts = filename.split('.');
  if (parts.length < 2) return null;
  const ext = parts.pop()?.toLowerCase() || '';
  return EXTENSION_TO_LANGUAGE[ext] || null;
}

/**
 * Normalizes raw code snippet for typing arena ingestion
 */
export function normalizeCodeSnippet(
  raw: string,
  options?: NormalizerOptions
): NormalizerResult {
  const tabSize = options?.tabSize ?? 2;
  const maxChars = options?.maxChars ?? 5000;

  if (!raw || raw.trim().length === 0) {
    return {
      normalized: '',
      lineCount: 0,
      error: 'Code snippet cannot be empty or whitespace-only.',
    };
  }

  if (raw.length > maxChars) {
    return {
      normalized: '',
      lineCount: 0,
      error: `Code snippet length (${raw.length}) exceeds maximum allowed of ${maxChars} characters.`,
    };
  }

  // 1. Normalize line breaks to \n
  const unified = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // 2. Expand tabs to spaces
  const spaces = ' '.repeat(tabSize);
  const tabExpanded = unified.replace(/\t/g, spaces);

  // 3. Split into lines and strip trailing whitespace
  let lines = tabExpanded.split('\n').map((l) => l.trimEnd());

  // 4. Remove leading and trailing empty lines
  while (lines.length > 0 && lines[0].trim().length === 0) {
    lines.shift();
  }
  while (lines.length > 0 && lines[lines.length - 1].trim().length === 0) {
    lines.pop();
  }

  if (lines.length === 0) {
    return {
      normalized: '',
      lineCount: 0,
      error: 'Code snippet contains no readable lines.',
    };
  }

  // 5. Calculate common leading indentation for dedenting
  let minIndent = Infinity;
  for (const line of lines) {
    if (line.trim().length === 0) continue;
    const match = line.match(/^( *)/);
    const indent = match ? match[1].length : 0;
    if (indent < minIndent) {
      minIndent = indent;
    }
  }

  // Apply dedent if common leading indentation exists
  if (minIndent > 0 && minIndent !== Infinity) {
    lines = lines.map((line) => {
      if (line.trim().length === 0) return '';
      return line.slice(minIndent);
    });
  }

  const normalized = lines.join('\n');

  return {
    normalized,
    lineCount: lines.length,
  };
}
