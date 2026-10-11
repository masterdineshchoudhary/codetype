/**
 * TypeScript / JavaScript Code Snippets and Syntax Token Drills
 */

export const TYPESCRIPT_SNIPPETS: string[] = [
  `const debounce = <T extends (...args: any[]) => void>(fn: T, ms: number) => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
};`,

  `type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

interface Result<T, E = Error> {
  ok: boolean;
  data?: T;
  error?: E;
}`,

  `export async function fetchWithRetry<T>(url: string, retries: number = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, { headers: { 'Content-Type': 'application/json' } });
      if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
      return (await response.json()) as T;
    } catch (err) {
      if (i === retries - 1) throw err;
    }
  }
  throw new Error('Unreachable');
}`,

  `const filterEvenSquares = (numbers: number[]): number[] => {
  return numbers
    .filter((n) => n % 2 === 0 && n > 0)
    .map((n) => n ** 2);
};`,

  `class LRUCache<K, V> {
  private map = new Map<K, V>();
  constructor(private capacity: number) {}
  get(key: K): V | undefined {
    if (!this.map.has(key)) return undefined;
    const value = this.map.get(key)!;
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }
}`
];

export const TYPESCRIPT_DRILL_SYMBOLS = [
  '=>', '===', '!==', '()', '{}', '[]', '<>', '&&', '||', '??', '?.', ';', ':', '::',
  '${}', '+=', '-=', '*=', '/=', '=> {', '}: Promise<', '<T extends'
];

