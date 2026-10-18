import React, { useState } from 'react';
import { useKnowledge } from '../context/KnowledgeContext';
import KnowledgeCard from '../components/knowledge/KnowledgeCard';
import EmptyState from '../components/common/EmptyState';
import { GridSkeleton } from '../components/common/LoadingSkeleton';
import { Star, Search, Plus } from 'lucide-react';

export default function Favorites() {
  const { items, loading, openCreateModal } = useKnowledge();
  const [searchTerm, setSearchTerm] = useState('');

  const favoriteItems = items.filter(item => {
    if (!item.isFavorite) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      const titleMatch = (item.title || '').toLowerCase().includes(q);
      const descMatch = (item.description || '').toLowerCase().includes(q);
      const tagsMatch = Array.isArray(item.tags) && item.tags.some(t => t.toLowerCase().includes(q));
      return titleMatch || descMatch || tagsMatch;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Starred & Favorite Knowledge
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              {favoriteItems.length}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Quick-access collection of your most valuable bookmarks, notes, and references.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openCreateModal()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Save Knowledge</span>
        </button>
      </div>

      {/* Search Filter if there are items */}
      {items.some(i => i.isFavorite) && (
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search favorite titles or tags..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <GridSkeleton count={4} />
      ) : favoriteItems.length === 0 ? (
        <EmptyState
          icon="bookmark"
          title="No favorites yet"
          description="Click the star icon on any knowledge card to pin your favorite articles, notes, and resources here."
          actionText="Browse Library"
          onAction={() => window.location.href = '/library'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteItems.map(item => (
            <KnowledgeCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
