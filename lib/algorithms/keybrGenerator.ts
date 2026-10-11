/**
 * CodeType Keybr-Style Adaptive Weak-Key & Progressive Mastery Generator
 * Procedurally generates drill texts emphasizing user's weak keys and developer syntax tokens.
 */

import type { HeatmapData, KeybrMasteryState, SupportedLanguage } from '../../types/typing';
import { TYPESCRIPT_DRILL_SYMBOLS, TYPESCRIPT_SNIPPETS } from '../snippets/typescript.ts';
import { PYTHON_DRILL_SYMBOLS, PYTHON_SNIPPETS } from '../snippets/python.ts';
import { SQL_DRILL_SYMBOLS, SQL_SNIPPETS } from '../snippets/sql.ts';
import { RUST_DRILL_SYMBOLS, RUST_SNIPPETS } from '../snippets/rust.ts';
import { GO_DRILL_SYMBOLS, GO_SNIPPETS } from '../snippets/go.ts';

export const COMMON_WORDS: string[] = [
  'the', 'be', 'of', 'and', 'a', 'to', 'in', 'he', 'have', 'it', 'that', 'for', 'they',
  'with', 'as', 'not', 'on', 'she', 'at', 'by', 'this', 'we', 'you', 'do', 'but', 'his',
  'from', 'they', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would',
  'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go',
  'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people',
  'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then',
  'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use',
  'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because',
  'any', 'these', 'give', 'day', 'most', 'us'
];

export const PROGRAMMING_KEYWORDS: Record<SupportedLanguage, string[]> = {
  typescript: [
    'const', 'let', 'function', 'return', 'interface', 'type', 'export', 'import',
    'async', 'await', 'Promise', 'extends', 'implements', 'readonly', 'boolean', 'number',
    'string', 'Record', 'Array', 'unknown', 'never', 'undefined', 'null'
  ],
  javascript: [
    'const', 'let', 'var', 'function', 'return', 'class', 'constructor', 'prototype',
    'async', 'await', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'typeof'
  ],
  python: [
    'def', 'class', 'return', 'import', 'from', 'as', 'async', 'await', 'try',
    'except', 'finally', 'raise', 'with', 'lambda', 'yield', 'pass', 'None', 'True', 'False'
  ],
  rust: [
    'fn', 'let', 'mut', 'pub', 'struct', 'enum', 'impl', 'trait', 'match', 'use',
    'crate', 'where', 'type', 'unsafe', 'async', 'await', 'Option', 'Result', 'Some', 'None'
  ],
  go: [
    'func', 'package', 'import', 'type', 'struct', 'interface', 'return', 'defer',
    'go', 'select', 'chan', 'make', 'map', 'nil', 'error', 'range', 'switch', 'case'
  ],
  sql: [
    'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'GROUP BY', 'HAVING', 'ORDER BY',
    'LIMIT', 'OFFSET', 'INSERT INTO', 'UPDATE', 'DELETE', 'VALUES', 'CREATE TABLE'
  ],
  cpp: [
    'auto', 'template', 'typename', 'class', 'struct', 'namespace', 'std::vector',
    'std::string', 'nullptr', 'constexpr', 'virtual', 'override', 'public', 'private'
  ],
  html: ['div', 'span', 'section', 'article', 'main', 'header', 'footer', 'nav', 'button'],
  css: ['display', 'flex', 'grid', 'margin', 'padding', 'border', 'color', 'background']
};

/**
 * Procedurally generates standard prose words with optional punctuation/numbers
 */
export function generateStandardWords(
  count: number = 25,
  options?: { punctuation?: boolean; numbers?: boolean }
): string {
  const words: string[] = [];
  const puncs = [',', '.', ';', '?', '!', ':', '-', '"'];

  for (let i = 0; i < count; i++) {
    let word = COMMON_WORDS[Math.floor(Math.random() * COMMON_WORDS.length)];

    if (options?.numbers && Math.random() < 0.15) {
      word = Math.floor(Math.random() * 900 + 10).toString();
    } else if (options?.punctuation && Math.random() < 0.2) {
      const punc = puncs[Math.floor(Math.random() * puncs.length)];
      if (punc === '"') {
        word = `"${word}"`;
      } else {
        word = `${word}${punc}`;
      }
    }

    words.push(word);
  }

  return words.join(' ');
}

/**
 * Retrieves snippet for language
 */
export function getLanguageSnippet(language: SupportedLanguage): string {
  switch (language) {
    case 'typescript':
    case 'javascript':
      return TYPESCRIPT_SNIPPETS[Math.floor(Math.random() * TYPESCRIPT_SNIPPETS.length)];
    case 'python':
      return PYTHON_SNIPPETS[Math.floor(Math.random() * PYTHON_SNIPPETS.length)];
    case 'rust':
      return RUST_SNIPPETS[Math.floor(Math.random() * RUST_SNIPPETS.length)];
    case 'go':
      return GO_SNIPPETS[Math.floor(Math.random() * GO_SNIPPETS.length)];
    case 'sql':
      return SQL_SNIPPETS[Math.floor(Math.random() * SQL_SNIPPETS.length)];
    default:
      return TYPESCRIPT_SNIPPETS[0];
  }
}

/**
 * Keybr-style procedural generation:
 * Constructs pseudo-code sentences emphasizing characters with error rate > 10%
 * or low confidence.
 */
export function generateAdaptiveDrill(
  heatmap: HeatmapData,
  language: SupportedLanguage = 'typescript',
  wordCount: number = 30
): string {
  // Extract weak characters
  const entries = Object.values(heatmap);
  const weakChars = entries
    .filter((e) => e.errorRate > 10 || e.confidence < 0.75)
    .sort((a, b) => b.errorRate - a.errorRate)
    .map((e) => e.char);

  const keywords = PROGRAMMING_KEYWORDS[language] || PROGRAMMING_KEYWORDS.typescript;
  let symbolPool: string[] = [];

  if (language === 'python') {
    symbolPool = PYTHON_DRILL_SYMBOLS;
  } else if (language === 'sql') {
    symbolPool = SQL_DRILL_SYMBOLS;
  } else if (language === 'rust') {
    symbolPool = RUST_DRILL_SYMBOLS;
  } else if (language === 'go') {
    symbolPool = GO_DRILL_SYMBOLS;
  } else {
    symbolPool = TYPESCRIPT_DRILL_SYMBOLS;
  }


  const resultWords: string[] = [];

  for (let i = 0; i < wordCount; i++) {
    const roll = Math.random();

    if (weakChars.length > 0 && roll < 0.45) {
      const targetChar = weakChars[Math.floor(Math.random() * weakChars.length)];
      const baseWord = keywords[Math.floor(Math.random() * keywords.length)];

      if (['{', '}', '(', ')', '[', ']', '<', '>'].includes(targetChar)) {
        resultWords.push(`${baseWord}${targetChar}`);
      } else if ([';', ':', ',', '.'].includes(targetChar)) {
        resultWords.push(`${baseWord}${targetChar}`);
      } else if (['=', '+', '-', '*', '/'].includes(targetChar)) {
        resultWords.push(`${baseWord} ${targetChar} ${baseWord}`);
      } else {
        const matching = keywords.filter((k) => k.toLowerCase().includes(targetChar.toLowerCase()));
        if (matching.length > 0) {
          resultWords.push(matching[Math.floor(Math.random() * matching.length)]);
        } else {
          resultWords.push(`${targetChar}${baseWord}${targetChar}`);
        }
      }
    } else if (roll < 0.75) {
      resultWords.push(keywords[Math.floor(Math.random() * keywords.length)]);
    } else {
      resultWords.push(symbolPool[Math.floor(Math.random() * symbolPool.length)]);
    }
  }

  return resultWords.join(' ');
}

/**
 * Keybr Progressive Mastery N-Gram Generator:
 * Generates pronounceable syllables and pseudo-words using STRICTLY unlocked keys.
 * Biases frequency towards current target key and lowest-confidence keys.
 */
export function generateKeybrMasteryDrill(
  masteryState: KeybrMasteryState,
  wordCount: number = 25
): string {
  const { unlockedKeys, currentKey, keyConfidences } = masteryState;
  const VOWELS = ['a', 'e', 'i', 'o', 'u', 'y'];

  const availableVowels = unlockedKeys.filter((k) => VOWELS.includes(k));
  const availableConsonants = unlockedKeys.filter((k) => !VOWELS.includes(k));

  // If no vowels unlocked, use full unlocked pool
  const vowelPool = availableVowels.length > 0 ? availableVowels : unlockedKeys;
  const consonantPool = availableConsonants.length > 0 ? availableConsonants : unlockedKeys;

  // Find lowest confidence unlocked key
  let lowestKey = currentKey;
  let minConf = 1.0;
  for (const k of unlockedKeys) {
    const c = keyConfidences[k] ?? 0;
    if (c < minConf) {
      minConf = c;
      lowestKey = k;
    }
  }

  const words: string[] = [];
  const syllableTemplates = ['CVC', 'CV', 'VC', 'CVCV', 'CVCC', 'VCV', 'CCVC'];

  for (let i = 0; i < wordCount; i++) {
    const template = syllableTemplates[Math.floor(Math.random() * syllableTemplates.length)];
    let wordChars: string[] = [];

    for (const charType of template) {
      if (charType === 'V') {
        wordChars.push(vowelPool[Math.floor(Math.random() * vowelPool.length)]);
      } else {
        wordChars.push(consonantPool[Math.floor(Math.random() * consonantPool.length)]);
      }
    }

    // High bias: 50% of words include targetKey; 30% include lowest confidence key
    const roll = Math.random();
    if (roll < 0.50) {
      // Force target key into word
      const replaceIdx = Math.floor(Math.random() * wordChars.length);
      wordChars[replaceIdx] = currentKey;
    } else if (roll < 0.80) {
      // Force lowest confidence key into word
      const replaceIdx = Math.floor(Math.random() * wordChars.length);
      wordChars[replaceIdx] = lowestKey;
    }

    words.push(wordChars.join(''));
  }

  return words.join(' ');
}
