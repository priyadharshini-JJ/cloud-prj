/**
 * Client-Side Knowledge Recovery & Search Engine
 * 
 * NOTE ON SEARCH ARCHITECTURE:
 * Cloud Firestore does not provide native full-text keyword indexing.
 * For the MVP, this module implements transparent client-side search over
 * the authenticated user's private dataset.
 * It tokenizes multi-word queries, scores relevance across titles, notes, tags,
 * and URLs, produces match explanations, and highlights terms.
 * This interface is architected so it can be swapped for a backend search service
 * (e.g., Typesense, Meilisearch, or Algolia) as the library scales.
 */

const RECENT_SEARCHES_KEY = 'echocloud_recent_searches';

/**
 * Get recent search queries from browser local storage
 */
export function getRecentSearches() {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save a search query to recent searches
 */
export function saveRecentSearch(query) {
  if (!query || !query.trim()) return;
  const term = query.trim();
  try {
    const list = getRecentSearches().filter(item => item.toLowerCase() !== term.toLowerCase());
    const updated = [term, ...list].slice(0, 8); // Keep up to 8
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save recent search:', err);
  }
}

/**
 * Clear recent search history
 */
export function clearRecentSearches() {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch (err) {
    console.error('Failed to clear recent searches:', err);
  }
}

/**
 * Splits query into clean search tokens
 */
export function tokenizeQuery(query) {
  if (!query) return [];
  return query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(token => token.length > 0);
}

/**
 * Escape regular expression special characters
 */
export function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Breaks string into chunks for safe React rendering with highlights
 * Returns array of { text: string, isMatch: boolean }
 */
export function splitForHighlight(text, query) {
  if (!text) return [];
  if (!query || !query.trim()) return [{ text, isMatch: false }];

  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) return [{ text, isMatch: false }];

  const pattern = new RegExp(`(${tokens.map(escapeRegExp).join('|')})`, 'gi');
  const parts = text.split(pattern);

  return parts
    .filter(part => part.length > 0)
    .map(part => {
      const isMatch = tokens.some(token => part.toLowerCase() === token.toLowerCase());
      return { text: part, isMatch };
    });
}

/**
 * Extracts a concise excerpt around the matched token in a longer text
 */
function createSnippet(text, query, maxLength = 140) {
  if (!text) return '';
  if (text.length <= maxLength) return text;

  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) return text.substring(0, maxLength) + '...';

  const lowerText = text.toLowerCase();
  let firstIndex = -1;

  for (const token of tokens) {
    const idx = lowerText.indexOf(token);
    if (idx !== -1 && (firstIndex === -1 || idx < firstIndex)) {
      firstIndex = idx;
    }
  }

  if (firstIndex === -1) {
    return text.substring(0, maxLength) + '...';
  }

  const start = Math.max(0, firstIndex - 40);
  const end = Math.min(text.length, start + maxLength);
  let snippet = text.substring(start, end);

  if (start > 0) snippet = '...' + snippet;
  if (end < text.length) snippet = snippet + '...';

  return snippet;
}

/**
 * Search items with relevance scoring and match explanation
 * @param {Array} items
 * @param {string} query
 * @param {Object} filters { sourceType, categoryId, isFavorite }
 */
export function searchKnowledgeItems(items, query, filters = {}) {
  if (!Array.isArray(items)) return [];

  // Apply basic filters first
  let filtered = items.filter(item => {
    if (filters.sourceType && item.sourceType !== filters.sourceType) return false;
    if (filters.categoryId && item.categoryId !== filters.categoryId) return false;
    if (filters.isFavorite && !item.isFavorite) return false;
    return true;
  });

  const cleanQuery = (query || '').trim();
  if (!cleanQuery) {
    return filtered.map(item => ({
      item,
      score: 1,
      matchReasons: [],
      snippet: item.description ? item.description.substring(0, 120) : ''
    }));
  }

  const tokens = tokenizeQuery(cleanQuery);
  const results = [];

  for (const item of filtered) {
    let score = 0;
    const matchReasons = [];
    const titleLower = (item.title || '').toLowerCase();
    const descLower = (item.description || '').toLowerCase();
    const urlLower = (item.sourceUrl || '').toLowerCase();
    const typeLower = (item.sourceType || '').toLowerCase();
    const catLower = (item.categoryName || '').toLowerCase();
    const tagsLower = Array.isArray(item.tags)
      ? item.tags.map(t => t.toLowerCase())
      : [];

    let matchedTokensCount = 0;

    for (const token of tokens) {
      let tokenMatched = false;

      // Exact title match
      if (titleLower === token) {
        score += 50;
        tokenMatched = true;
        matchReasons.push(`Exact Title Match: "${token}"`);
      } else if (titleLower.includes(token)) {
        score += 25;
        tokenMatched = true;
        matchReasons.push(`Matched in Title: "${token}"`);
      }

      // Tags match
      const matchingTag = tagsLower.find(t => t === token || t.includes(token));
      if (matchingTag) {
        score += 20;
        tokenMatched = true;
        matchReasons.push(`Matched Tag: #${matchingTag}`);
      }

      // Notes / Description match
      if (descLower.includes(token)) {
        score += 15;
        tokenMatched = true;
        matchReasons.push(`Matched in Personal Notes`);
      }

      // Source URL match
      if (urlLower.includes(token)) {
        score += 10;
        tokenMatched = true;
        matchReasons.push(`Matched in Source URL`);
      }

      // Category match
      if (catLower.includes(token)) {
        score += 8;
        tokenMatched = true;
        matchReasons.push(`Matched Category: ${item.categoryName}`);
      }

      // Source Type match
      if (typeLower.includes(token)) {
        score += 5;
        tokenMatched = true;
        matchReasons.push(`Matched Source Type: ${item.sourceType}`);
      }

      if (tokenMatched) {
        matchedTokensCount++;
      }
    }

    // Require all tokens or at least one for fuzzy discovery
    if (matchedTokensCount > 0) {
      // Bonus if all tokens are present
      if (matchedTokensCount === tokens.length) {
        score += 20;
      }

      // Favor recent and favorited items slightly
      if (item.isFavorite) score += 5;

      const snippet = createSnippet(item.description, cleanQuery);

      results.push({
        item,
        score,
        // Unique reasons
        matchReasons: Array.from(new Set(matchReasons)),
        snippet
      });
    }
  }

  // Sort by relevance score descending
  results.sort((a, b) => b.score - a.score);

  return results;
}

/**
 * Generate suggestions based on available metadata (tags, titles, sources)
 */
export function getSearchSuggestions(items, query) {
  if (!query || query.trim().length < 2 || !Array.isArray(items)) return [];

  const q = query.trim().toLowerCase();
  const suggestions = new Set();

  for (const item of items) {
    // Title suggestions
    if (item.title && item.title.toLowerCase().includes(q)) {
      suggestions.add({ text: item.title, type: 'Title' });
    }

    // Tag suggestions
    if (Array.isArray(item.tags)) {
      for (const tag of item.tags) {
        if (tag.toLowerCase().includes(q)) {
          suggestions.add({ text: '#' + tag, type: 'Tag', rawValue: tag });
        }
      }
    }

    // Category suggestions
    if (item.categoryName && item.categoryName.toLowerCase().includes(q)) {
      suggestions.add({ text: item.categoryName, type: 'Category' });
    }

    // Source Type suggestions
    if (item.sourceType && item.sourceType.toLowerCase().includes(q)) {
      suggestions.add({ text: item.sourceType, type: 'Source' });
    }

    if (suggestions.size >= 6) break;
  }

  return Array.from(suggestions).slice(0, 6);
}
