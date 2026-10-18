import { describe, it, expect } from 'vitest';
import {
  tokenizeQuery,
  splitForHighlight,
  searchKnowledgeItems,
  getSearchSuggestions
} from '../lib/search';

describe('Search & Knowledge Recovery Engine', () => {
  const sampleItems = [
    {
      id: '1',
      title: 'React 19 Server Components Deep Dive',
      description: 'Understanding actions, useActionState hook, and streaming SSR.',
      sourceUrl: 'https://react.dev/reference/react',
      sourceType: 'Website',
      categoryId: 'development',
      categoryName: 'Development',
      tags: ['react', 'javascript', 'frontend'],
      isFavorite: true,
      createdAt: '2026-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      title: 'Distributed Systems Raft Consensus Paper',
      description: 'Leader election, log replication, and cluster membership changes.',
      sourceUrl: 'https://raft.github.io/raft.pdf',
      sourceType: 'Research Paper',
      categoryId: 'research',
      categoryName: 'Research',
      tags: ['raft', 'distributed', 'consensus'],
      isFavorite: false,
      createdAt: '2026-01-02T00:00:00.000Z',
    },
    {
      id: '3',
      title: 'Accessible Web Dialog Components',
      description: 'Native dialog element, keyboard trapping, and ARIA labels.',
      sourceUrl: 'https://web.dev/dialogs',
      sourceType: 'Website',
      categoryId: 'learning',
      categoryName: 'Learning',
      tags: ['a11y', 'html', 'accessibility'],
      isFavorite: true,
      createdAt: '2026-01-03T00:00:00.000Z',
    }
  ];

  it('correctly tokenizes queries into clean lowercase words', () => {
    const tokens = tokenizeQuery('  React  HOOKS   19  ');
    expect(tokens).toEqual(['react', 'hooks', '19']);
  });

  it('splits text for safe highlighting matches', () => {
    const parts = splitForHighlight('Understanding React 19 Hooks', 'react');
    expect(parts).toEqual([
      { text: 'Understanding ', isMatch: false },
      { text: 'React', isMatch: true },
      { text: ' 19 Hooks', isMatch: false }
    ]);
  });

  it('ranks title matches higher than description matches', () => {
    const results = searchKnowledgeItems(sampleItems, 'React');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].item.id).toBe('1');
    expect(results[0].matchReasons).toContain('Matched in Title: "react"');
  });

  it('matches items by tag', () => {
    const results = searchKnowledgeItems(sampleItems, 'consensus');
    expect(results.length).toBe(1);
    expect(results[0].item.id).toBe('2');
    expect(results[0].matchReasons).toContain('Matched Tag: #consensus');
  });

  it('filters results by source type and category', () => {
    const filtered = searchKnowledgeItems(sampleItems, '', {
      sourceType: 'Research Paper',
      categoryId: 'research'
    });
    expect(filtered.length).toBe(1);
    expect(filtered[0].item.title).toContain('Raft');
  });

  it('filters favorites correctly', () => {
    const favorites = searchKnowledgeItems(sampleItems, '', { isFavorite: true });
    expect(favorites.length).toBe(2);
    expect(favorites.every(r => r.item.isFavorite)).toBe(true);
  });

  it('provides autocomplete search suggestions from titles and tags', () => {
    const suggestions = getSearchSuggestions(sampleItems, 'dia');
    expect(suggestions.some(s => s.text.toLowerCase().includes('dialog'))).toBe(true);
  });
});
