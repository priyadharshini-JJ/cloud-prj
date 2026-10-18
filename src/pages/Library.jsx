import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useKnowledge } from '../context/KnowledgeContext';
import KnowledgeCard from '../components/knowledge/KnowledgeCard';
import { GridSkeleton } from '../components/common/LoadingSkeleton';
import EmptyState from '../components/common/EmptyState';
import { SOURCE_TYPES } from '../lib/defaultCategories';
import {
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  Star,
  Plus,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { SourceBadge, CategoryBadge } from '../components/common/Badge';

const ITEMS_PER_PAGE = 9;

export default function Library() {
  const { items, categories, loading, openCreateModal, setDetailModalItem } = useKnowledge();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters & State
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedSourceType, setSelectedSourceType] = useState(searchParams.get('type') || 'all');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [onlyFavorites, setOnlyFavorites] = useState(searchParams.get('favorites') === 'true');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, title_asc, title_desc
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [currentPage, setCurrentPage] = useState(1);

  // Sync state from query params on mount/param change
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null) setSearchTerm(q);

    const cat = searchParams.get('category');
    if (cat !== null) setSelectedCategory(cat);

    const type = searchParams.get('type');
    if (type !== null) setSelectedSourceType(type);

    const fav = searchParams.get('favorites');
    if (fav !== null) setOnlyFavorites(fav === 'true');
  }, [searchParams]);

  // Filtering and Sorting logic
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Filter by favorites
    if (onlyFavorites) {
      result = result.filter(item => item.isFavorite);
    }

    // Filter by Source Type
    if (selectedSourceType !== 'all') {
      result = result.filter(item => item.sourceType === selectedSourceType);
    }

    // Filter by Category
    if (selectedCategory !== 'all') {
      result = result.filter(
        item =>
          item.categoryId === selectedCategory ||
          (item.categoryName && item.categoryName.toLowerCase() === selectedCategory.toLowerCase())
      );
    }

    // Search query match (Title, Description, URL, Tags)
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(item => {
        const titleMatch = (item.title || '').toLowerCase().includes(q);
        const descMatch = (item.description || '').toLowerCase().includes(q);
        const urlMatch = (item.sourceUrl || '').toLowerCase().includes(q);
        const tagsMatch = Array.isArray(item.tags) && item.tags.some(t => t.toLowerCase().includes(q));
        const typeMatch = (item.sourceType || '').toLowerCase().includes(q);
        return titleMatch || descMatch || urlMatch || tagsMatch || typeMatch;
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'title_asc') {
        return (a.title || '').localeCompare(b.title || '');
      }
      if (sortBy === 'title_desc') {
        return (b.title || '').localeCompare(a.title || '');
      }
      return 0;
    });

    return result;
  }, [items, searchTerm, selectedSourceType, selectedCategory, onlyFavorites, sortBy]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSourceType, selectedCategory, onlyFavorites, sortBy]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSourceType('all');
    setSelectedCategory('all');
    setOnlyFavorites(false);
    setSortBy('newest');
    setSearchParams({});
  };

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    selectedSourceType !== 'all' ||
    selectedCategory !== 'all' ||
    onlyFavorites;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            My Knowledge Library
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Browse, filter, and organize your saved records ({filteredItems.length} items)
          </p>
        </div>

        <button
          type="button"
          onClick={() => openCreateModal()}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Save Knowledge</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
        {/* Search Input Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, personal notes, URL, or #tags..."
              className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-slate-200 rounded-xl p-1 bg-slate-50 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-2xs text-emerald-700' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Grid Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-2xs text-emerald-700' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Compact List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Selectors Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            {/* Source Type Filter */}
            <select
              value={selectedSourceType}
              onChange={(e) => setSelectedSourceType(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Source Types</option>
              {SOURCE_TYPES.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            {/* Favorites Only Toggle */}
            <button
              type="button"
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`px-2.5 py-1.5 rounded-lg border font-medium flex items-center gap-1 transition-colors ${
                onlyFavorites
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-current text-amber-500' : 'text-slate-400'}`} />
              <span>Favorites</span>
            </button>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-xs text-rose-600 hover:text-rose-700 underline font-medium ml-1"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 text-slate-500 font-medium ml-auto">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title_asc">Title (A - Z)</option>
              <option value="title_desc">Title (Z - A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <GridSkeleton count={6} />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={hasActiveFilters ? 'search' : 'bookmark'}
          title={hasActiveFilters ? 'No matching items found' : 'No knowledge saved yet'}
          description={
            hasActiveFilters
              ? 'Try modifying your search keywords or clearing active category filters.'
              : 'Add your first research snippet, paper, or tutorial to get started.'
          }
          actionText={hasActiveFilters ? 'Reset Filters' : 'Save Knowledge'}
          onAction={hasActiveFilters ? resetFilters : openCreateModal}
        />
      ) : viewMode === 'grid' ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedItems.map((item) => (
            <KnowledgeCard
              key={item.id}
              item={item}
              onSelectTag={(tag) => setSearchTerm(tag)}
            />
          ))}
        </div>
      ) : (
        /* Compact List View */
        <div className="bg-white rounded-2xl border border-slate-200/90 divide-y divide-slate-100 overflow-hidden shadow-2xs">
          {paginatedItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setDetailModalItem(item)}
              className="p-4 hover:bg-slate-50/80 cursor-pointer transition-colors flex items-center justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <SourceBadge type={item.sourceType} />
                  <CategoryBadge name={item.categoryName} />
                  {item.isFavorite && (
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                  )}
                  <span className="text-xs text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 truncate">
                  {item.title}
                </h3>
                {item.description && (
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {item.description}
                  </p>
                )}
              </div>

              {item.tags?.length > 0 && (
                <div className="hidden sm:flex items-center gap-1 max-w-[200px] overflow-hidden">
                  {item.tags.slice(0, 2).map(t => (
                    <span key={t} className="text-[11px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                      #{t}
                    </span>
                  ))}
                  {item.tags.length > 2 && (
                    <span className="text-[10px] text-slate-400">+{item.tags.length - 2}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs">
          <span className="text-slate-500">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length)} of {filteredItems.length} results
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-slate-800">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
