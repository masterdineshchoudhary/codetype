/**
 * CodeType Command Registry & Fuzzy Search Filter
 * Manages action commands for Command Palette (Cmd+K / Tab+Enter)
 */

export type CommandCategory = 'test' | 'mode' | 'language' | 'theme' | 'sound' | 'caret' | 'snippet';

export interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: CommandCategory;
  keywords?: string[];
  action: () => void;
}

/**
 * Filters and ranks commands based on a user search query
 */
export function filterCommands(query: string, commands: CommandItem[]): CommandItem[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return [...commands];
  }

  const scored: { item: CommandItem; score: number }[] = [];

  for (const item of commands) {
    const titleLower = item.title.toLowerCase();
    const subtitleLower = item.subtitle ? item.subtitle.toLowerCase() : '';
    const categoryLower = item.category.toLowerCase();
    const keywordsLower = item.keywords ? item.keywords.map((k) => k.toLowerCase()) : [];

    let score = 0;

    if (titleLower === trimmed) {
      score = 100;
    } else if (titleLower.startsWith(trimmed)) {
      score = 80;
    } else if (titleLower.includes(trimmed)) {
      score = 60;
    } else if (categoryLower.startsWith(trimmed) || subtitleLower.includes(trimmed)) {
      score = 40;
    } else {
      // Check keywords
      const matchedKeyword = keywordsLower.some((k) => k.includes(trimmed));
      if (matchedKeyword) {
        score = 30;
      }
    }

    if (score > 0) {
      scored.push({ item, score });
    }
  }

  // Sort descending by score
  return scored.sort((a, b) => b.score - a.score).map((s) => s.item);
}

