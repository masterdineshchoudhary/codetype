/**
 * CodeType Pure-TypeScript Lightweight Syntax Tokenizer
 * Performance Law 1 Compliant:
 * Lexically scans code once at initialization and maps each character index
 * to a SyntaxTokenType for zero-lag CSS-variable syntax rendering.
 */

import type { SupportedLanguage, SyntaxTokenType } from '../../types/typing';

// Language Keywords
const KEYWORDS: Record<SupportedLanguage, Set<string>> = {
  typescript: new Set([
    'const', 'let', 'var', 'function', 'return', 'interface', 'type', 'export', 'import',
    'from', 'as', 'async', 'await', 'extends', 'implements', 'readonly', 'class', 'constructor',
    'new', 'this', 'super', 'if', 'else', 'switch', 'case', 'break', 'continue', 'while',
    'for', 'of', 'in', 'try', 'catch', 'finally', 'throw', 'default', 'static', 'public',
    'private', 'protected', 'null', 'undefined', 'true', 'false', 'typeof', 'instanceof'
  ]),
  javascript: new Set([
    'const', 'let', 'var', 'function', 'return', 'class', 'constructor', 'prototype',
    'async', 'await', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'typeof',
    'if', 'else', 'switch', 'case', 'break', 'continue', 'while', 'for', 'of', 'in',
    'export', 'import', 'from', 'default', 'null', 'undefined', 'true', 'false'
  ]),
  python: new Set([
    'def', 'class', 'return', 'import', 'from', 'as', 'async', 'await', 'try',
    'except', 'finally', 'raise', 'with', 'lambda', 'yield', 'pass', 'None', 'True',
    'False', 'if', 'elif', 'else', 'for', 'while', 'break', 'continue', 'in', 'is',
    'not', 'and', 'or', 'global', 'nonlocal', 'assert', 'del'
  ]),
  rust: new Set([
    'fn', 'let', 'mut', 'pub', 'struct', 'enum', 'impl', 'trait', 'match', 'use',
    'crate', 'mod', 'where', 'type', 'unsafe', 'async', 'await', 'move', 'ref',
    'self', 'Self', 'return', 'if', 'else', 'while', 'for', 'in', 'loop', 'break',
    'continue', 'true', 'false', 'as', 'const', 'static', 'dyn'
  ]),
  go: new Set([
    'func', 'package', 'import', 'type', 'struct', 'interface', 'return', 'defer',
    'go', 'select', 'chan', 'make', 'map', 'nil', 'error', 'range', 'switch', 'case',
    'default', 'if', 'else', 'for', 'break', 'continue', 'fallthrough', 'const', 'var',
    'true', 'false'
  ]),
  sql: new Set([
    'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL',
    'GROUP', 'BY', 'HAVING', 'ORDER', 'ASC', 'DESC', 'LIMIT', 'OFFSET', 'INSERT',
    'INTO', 'UPDATE', 'DELETE', 'SET', 'VALUES', 'CREATE', 'TABLE', 'DROP', 'ALTER',
    'ADD', 'COLUMN', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'NOT', 'NULL', 'UNIQUE',
    'AND', 'OR', 'IN', 'IS', 'LIKE', 'BETWEEN', 'EXISTS', 'COUNT', 'SUM', 'AVG', 'MIN',
    'MAX', 'AS', 'UNION', 'ALL', 'VIEW', 'INDEX', 'TRIGGER'
  ]),
  cpp: new Set([
    'auto', 'template', 'typename', 'class', 'struct', 'namespace', 'using', 'return',
    'constexpr', 'virtual', 'override', 'public', 'private', 'protected', 'const',
    'static', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue',
    'new', 'delete', 'nullptr', 'true', 'false', 'this', 'throw', 'try', 'catch'
  ]),
  html: new Set([
    'DOCTYPE', 'html', 'head', 'body', 'div', 'span', 'h1', 'h2', 'h3', 'p', 'a',
    'ul', 'ol', 'li', 'button', 'input', 'form', 'label', 'textarea', 'select', 'option',
    'table', 'tr', 'td', 'th', 'thead', 'tbody', 'section', 'article', 'nav', 'header',
    'footer', 'main', 'script', 'style', 'link', 'meta', 'img'
  ]),
  css: new Set([
    'display', 'position', 'flex', 'grid', 'margin', 'padding', 'width', 'height',
    'color', 'background', 'border', 'border-radius', 'font-family', 'font-size',
    'overflow', 'opacity', 'cursor', 'transition', 'animation', 'transform', 'important'
  ])
};

// Built-in Types
const BUILTIN_TYPES: Record<SupportedLanguage, Set<string>> = {
  typescript: new Set([
    'string', 'number', 'boolean', 'symbol', 'bigint', 'any', 'unknown', 'never',
    'void', 'Record', 'Array', 'Promise', 'Partial', 'Required', 'Readonly', 'Pick',
    'Omit', 'Exclude', 'Extract', 'NonNullable', 'Parameters', 'ReturnType', 'Set', 'Map'
  ]),
  javascript: new Set(['String', 'Number', 'Boolean', 'Array', 'Object', 'Promise', 'Set', 'Map', 'RegExp']),
  python: new Set(['int', 'float', 'str', 'bool', 'list', 'dict', 'set', 'tuple', 'bytes', 'Optional', 'List', 'Dict', 'Any', 'Union']),
  rust: new Set([
    'i8', 'i16', 'i32', 'i64', 'i128', 'isize',
    'u8', 'u16', 'u32', 'u64', 'u128', 'usize',
    'f32', 'f64', 'bool', 'char', 'str', 'String', 'Option', 'Some', 'None',
    'Result', 'Ok', 'Err', 'Vec', 'Box', 'Rc', 'Arc', 'Mutex', 'HashMap'
  ]),
  go: new Set([
    'int', 'int8', 'int16', 'int32', 'int64',
    'uint', 'uint8', 'uint16', 'uint32', 'uint64', 'uintptr',
    'float32', 'float64', 'complex64', 'complex128',
    'string', 'bool', 'byte', 'rune', 'error'
  ]),
  sql: new Set([
    'INT', 'INTEGER', 'BIGINT', 'SMALLINT', 'VARCHAR', 'CHAR', 'TEXT', 'BOOLEAN',
    'DATE', 'TIMESTAMP', 'FLOAT', 'DOUBLE', 'DECIMAL', 'NUMERIC', 'JSON', 'BLOB'
  ]),
  cpp: new Set([
    'int', 'long', 'short', 'char', 'float', 'double', 'bool', 'void',
    'std::string', 'std::vector', 'std::map', 'std::unordered_map', 'std::pair',
    'int32_t', 'int64_t', 'uint32_t', 'uint64_t', 'size_t'
  ]),
  html: new Set([]),
  css: new Set(['rem', 'em', 'px', 'vh', 'vw', '%', 'deg', 'ms', 's'])
};

const OPERATORS = new Set([
  '+', '-', '*', '/', '%', '=', '!', '<', '>', '&', '|', '^', '~', '?', ':',
  '.', '->', '=>', '::', ':=', '<-', '&&', '||', '==', '!=', '===', '!=='
]);

const PUNCTUATION = new Set(['(', ')', '{', '}', '[', ']', ';', ',', '@']);

/**
 * Tokenizes entire code snippet into an array of SyntaxTokenType.
 * The output array has exactly the same length as the code string.
 */
export function tokenizeCode(code: string, language: SupportedLanguage): SyntaxTokenType[] {
  const len = code.length;
  const tokens: SyntaxTokenType[] = new Array(len).fill('default');
  const langKeywords = KEYWORDS[language] || KEYWORDS.typescript;
  const langTypes = BUILTIN_TYPES[language] || BUILTIN_TYPES.typescript;

  let i = 0;
  while (i < len) {
    const char = code[i];

    // 1. Whitespace
    if (char === ' ' || char === '\t' || char === '\n' || char === '\r') {
      tokens[i] = 'default';
      i++;
      continue;
    }

    // 2. Comments
    // Single-line //, #, or --
    if (
      (char === '/' && code[i + 1] === '/') ||
      (char === '#' && (language === 'python' || language === 'sql')) ||
      (char === '-' && code[i + 1] === '-' && language === 'sql')
    ) {
      while (i < len && code[i] !== '\n') {
        tokens[i] = 'comment';
        i++;
      }
      continue;
    }

    // Multi-line /* ... */
    if (char === '/' && code[i + 1] === '*') {
      tokens[i] = 'comment';
      tokens[i + 1] = 'comment';
      i += 2;
      while (i < len && !(code[i] === '*' && code[i + 1] === '/')) {
        tokens[i] = 'comment';
        i++;
      }
      if (i < len) {
        tokens[i] = 'comment'; // *
        tokens[i + 1] = 'comment'; // /
        i += 2;
      }
      continue;
    }

    // 3. Strings: single-quote, double-quote, or backtick
    if (char === '"' || char === "'" || char === '`') {
      const quote = char;
      tokens[i] = 'string';
      i++;
      while (i < len && code[i] !== quote) {
        if (code[i] === '\\' && i + 1 < len) {
          tokens[i] = 'string';
          tokens[i + 1] = 'string';
          i += 2;
          continue;
        }
        if (code[i] === '\n' && quote !== '`') {
          break; // unclosed string
        }
        tokens[i] = 'string';
        i++;
      }
      if (i < len && code[i] === quote) {
        tokens[i] = 'string';
        i++;
      }
      continue;
    }

    // 4. Numbers (e.g. 42, 3.14, 0xFF)
    if (/[0-9]/.test(char)) {
      while (i < len && /[0-9a-fA-Fx_.]/.test(code[i])) {
        tokens[i] = 'number';
        i++;
      }
      continue;
    }

    // 5. Multi-character operators: =>, ->, ::, :=, <-, ==, !=, ===, !==, <=, >=, &&, ||
    const twoChars = code.slice(i, i + 2);
    const threeChars = code.slice(i, i + 3);

    if (threeChars === '===' || threeChars === '!==') {
      tokens[i] = 'operator';
      tokens[i + 1] = 'operator';
      tokens[i + 2] = 'operator';
      i += 3;
      continue;
    }

    if (
      twoChars === '=>' ||
      twoChars === '->' ||
      twoChars === '::' ||
      twoChars === ':=' ||
      twoChars === '<-' ||
      twoChars === '==' ||
      twoChars === '!=' ||
      twoChars === '<=' ||
      twoChars === '>=' ||
      twoChars === '&&' ||
      twoChars === '||' ||
      twoChars === '++' ||
      twoChars === '--'
    ) {
      tokens[i] = 'operator';
      tokens[i + 1] = 'operator';
      i += 2;
      continue;
    }

    // 6. Single character punctuation & operators
    if (PUNCTUATION.has(char)) {
      tokens[i] = 'punctuation';
      i++;
      continue;
    }

    if (OPERATORS.has(char)) {
      tokens[i] = 'operator';
      i++;
      continue;
    }

    // 7. Identifiers / Keywords / Types
    if (/[a-zA-Z_$]/.test(char)) {
      const start = i;
      while (i < len && /[a-zA-Z0-9_$]/.test(code[i])) {
        i++;
      }
      const word = code.slice(start, i);
      const upperWord = word.toUpperCase();

      let tokenType: SyntaxTokenType = 'default';

      if (langKeywords.has(word) || (language === 'sql' && langKeywords.has(upperWord))) {
        tokenType = 'keyword';
      } else if (
        langTypes.has(word) ||
        (language === 'sql' && langTypes.has(upperWord)) ||
        (/^[A-Z][a-zA-Z0-9_]*$/.test(word) && language !== 'sql') // PascalCase convention as Type
      ) {
        tokenType = 'type';
      } else {
        // Lookahead to check if it's a function call: `name(`
        let lookahead = i;
        while (lookahead < len && (code[lookahead] === ' ' || code[lookahead] === '\t')) {
          lookahead++;
        }
        if (code[lookahead] === '(') {
          tokenType = 'function';
        }
      }

      for (let k = start; k < i; k++) {
        tokens[k] = tokenType;
      }
      continue;
    }

    // Fallback default
    tokens[i] = 'default';
    i++;
  }

  return tokens;
}

