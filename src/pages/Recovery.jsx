import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useKnowledge } from '../context/KnowledgeContext';
import {
  searchKnowledgeItems,
  getSearchSuggestions,
  splitForHighlight
} from '../lib/search';
import {
  Search,
  History,
  Trash2,
  ExternalLink,
  Sparkles,
  FileText,
  Star,
  Info,
  ArrowRight,
  CheckCircle,
  Tag
} from 'lucide-react';
import { SourceBadge, CategoryBadge } from '../components/common/Badge';

export default function Recovery() {
  const { items, recentSearches, recordSearch, clearSearches, setDetailModalItem } = useKnowledge();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef(null);

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      if (query.trim()) {
        recordSearch(query);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Search Results
  const searchResults = useMemo(() => {
    return searchKnowledgeItems(items, debouncedQuery);
  }, [items, debouncedQuery]);

  // Suggestions
  const suggestions = useMemo(() => {
    return getSearchSuggestions(items, query);
  }, [items, query]);

  // Highlight helper component
  const Highlighted = ({ text, term }) => {
    const parts = splitForHighlight(text, term);
    return (
      <span>
        {parts.map((part, i) =>
          part.isMatch ? (
            <mark key={i} className="highlight-term bg-amber-200 text-amber-950 px-0.5 rounded font-medium">
              {part.text}
            </mark>
          ) : (
            <span key={i}>{part.text}</span>
          )
        )}
      </span>
    );
  };

  const handleSelectRecent = (term) => {
    setQuery(term);
    setShowSuggestions(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Recovery Banner Header */}
      <div className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/20 mb-3 text-emerald-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Knowledge Recovery Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Recover Forgotten Knowledge
          </h1>
          <p className="text-emerald-100/90 text-sm mt-2 leading-relaxed">
            Search what you recall—a fragment of personal notes, an old URL, a tagged topic, or a title keyword.
          </p>
        </div>

        {/* Decorative cloud wave pattern */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
          <div className="w-72 h-72 rounded-full border-8 border-white" />
        </div>
      </div>

      {/* Prominent Search Bar & Suggestions */}
      <div className="relative">
        <div className="relative bg-white rounded-2xl shadow-sm border-2 border-emerald-500/40 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all p-2 flex items-center gap-3">
          <Search className="w-6 h-6 text-emerald-600 ml-3 shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search words you remember (e.g. 'react hooks', 'database consensus', 'css dialog')..."
            className="w-full py-2.5 text-base sm:text-lg bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setDebouncedQuery('');
              }}
              className="px-3 py-1 text-xs font-semibold text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg mr-1 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Search Suggestions Dropdown */}
        {showSuggestions && query.trim().length >= 2 && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-20">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-1">
              Suggestions based on your saved records
            </div>
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(s.rawValue || s.text);
                  setShowSuggestions(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center justify-between transition-colors"
              >
                <span className="font-medium truncate">{s.text}</span>
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  {s.type}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Recent Searches Row */}
      {recentSearches.length > 0 && (
        <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <History className="w-3.5 h-3.5" />
              Recent Searches:
            </span>
            {recentSearches.map((term, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectRecent(term)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded-lg transition-colors font-medium"
              >
                {term}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={clearSearches}
            className="text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1 font-medium ml-auto"
            title="Clear search history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          {debouncedQuery.trim()
            ? `Found ${searchResults.length} matching item(s) for "${debouncedQuery}"`
            : `Showing all ${searchResults.length} saved records`}
        </span>
        <span className="text-slate-400">
          Ranked by metadata relevance
        </span>
      </div>

      {/* Results List */}
      {searchResults.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900 mb-1">
            No matching knowledge found
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">
            We couldn't match "{debouncedQuery}" against any saved titles, personal notes, URLs, or tags.
          </p>
          <button
            type="button"
            onClick={() => setQuery('')}
            className="px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-semibold transition-colors"
          >
            Reset Query
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {searchResults.map(({ item, matchReasons, snippet, score }) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 p-5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-3 group"
            >
              <div>
                {/* Header row: badges & match explanations */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <SourceBadge type={item.sourceType} />
                    <CategoryBadge name={item.categoryName} />
                    {item.isFavorite && (
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                    )}
                  </div>

                  {/* Why it matched badge */}
                  {matchReasons.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {matchReasons.slice(0, 2).map((reason, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                        >
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          {reason}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Title with highlighting */}
                <h2
                  onClick={() => setDetailModalItem(item)}
                  className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors cursor-pointer leading-snug mb-2"
                >
                  <Highlighted text={item.title} term={debouncedQuery} />
                </h2>

                {/* Excerpt / Personal notes with highlighting */}
                {snippet && (
                  <p className="text-sm text-slate-600 leading-relaxed mb-3 bg-slate-50/60 p-3 rounded-xl border border-slate-100">
                    <Highlighted text={snippet} term={debouncedQuery} />
                  </p>
                )}

                {/* Source URL with highlighting */}
                {item.sourceUrl && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3 truncate">
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      <Highlighted text={item.sourceUrl} term={debouncedQuery} />
                    </span>
                  </div>
                )}

                {/* Tags */}
                {Array.isArray(item.tags) && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-1">
                    {item.tags.map(t => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-0.5 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded"
                      >
                        <Tag className="w-2.5 h-2.5 text-slate-400" />
                        <Highlighted text={`#${t}`} term={debouncedQuery} />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Saved on {new Date(item.createdAt).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-2">
                  {item.sourceUrl && (
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open URL
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => setDetailModalItem(item)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Architecture Disclaimer / Note */}
      <div className="p-4 bg-slate-100/70 border border-slate-200 rounded-xl text-xs text-slate-500 leading-relaxed flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-700">Client-Side Search Architecture: </span>
          Cloud Firestore does not have built-in full-text token indexing. In this EchoCloud MVP, multi-token recovery operates directly over your private authenticated dataset in the browser for high speed and privacy. As your library grows to tens of thousands of items, this layer can be backed by a dedicated indexing service.
        </div>
      </div>
    </div>
  );
}
