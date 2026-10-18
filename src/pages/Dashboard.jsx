import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useKnowledge } from '../context/KnowledgeContext';
import {
  Bookmark,
  Star,
  Clock,
  FolderTree,
  Plus,
  Search,
  ArrowRight,
  ExternalLink,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import KnowledgeCard from '../components/knowledge/KnowledgeCard';
import { SourceBadge } from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/LoadingSkeleton';

export default function Dashboard() {
  const { stats, items, loading, openCreateModal, setDetailModalItem } = useKnowledge();
  const navigate = useNavigate();

  const recentItems = items.slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            EchoCloud Knowledge Hub
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Knowledge Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Capture, organize, and recover critical insights, snippets, and research in seconds.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/recovery')}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors flex items-center gap-2"
          >
            <Search className="w-4 h-4 text-slate-500" />
            <span>Search Library</span>
          </button>
          <button
            type="button"
            onClick={() => openCreateModal()}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Save Knowledge</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Items */}
        <div
          onClick={() => navigate('/library')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 cursor-pointer transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Saved
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2">
            {loading ? '...' : stats.total}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span>View full repository</span>
            <ArrowRight className="w-3 h-3 text-emerald-600" />
          </div>
        </div>

        {/* Recently Added */}
        <div
          onClick={() => navigate('/library')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 cursor-pointer transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Recent (7 Days)
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2">
            {loading ? '...' : stats.recent}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Added this week
          </div>
        </div>

        {/* Favorites */}
        <div
          onClick={() => navigate('/favorites')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-amber-300 cursor-pointer transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Favorites
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2">
            {loading ? '...' : stats.favorites}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span>Starred knowledge</span>
            <ArrowRight className="w-3 h-3 text-amber-600" />
          </div>
        </div>

        {/* Categories Count */}
        <div
          onClick={() => navigate('/categories')}
          className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-purple-300 cursor-pointer transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Categories
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <FolderTree className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mt-2">
            {loading ? '...' : stats.categoryDistribution.length}
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <span>Manage taxonomy</span>
            <ArrowRight className="w-3 h-3 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Main Grid: Category Distribution & Quick Recovery Search */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Category Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900">
              Category Distribution
            </h2>
            <button
              onClick={() => navigate('/categories')}
              className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
            >
              View All
            </button>
          </div>

          {stats.categoryDistribution.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No categories yet</p>
          ) : (
            <div className="space-y-3">
              {stats.categoryDistribution.map((cat) => {
                const percentage = stats.total > 0
                  ? Math.round((cat.count / stats.total) * 100)
                  : 0;

                return (
                  <div
                    key={cat.name}
                    className="group cursor-pointer"
                    onClick={() => navigate(`/library?category=${encodeURIComponent(cat.name.toLowerCase())}`)}
                  >
                    <div className="flex items-center justify-between text-xs mb-1 font-medium">
                      <span className="text-slate-700 group-hover:text-emerald-700 transition-colors">
                        {cat.name}
                      </span>
                      <span className="text-slate-400">
                        {cat.count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-300 group-hover:bg-emerald-600"
                        style={{ width: `${Math.max(percentage, 3)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 2 Columns: Recent Knowledge Activity */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900">
                Recent Knowledge Activity
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                Latest
              </span>
            </div>
            <button
              onClick={() => navigate('/library')}
              className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <span>Explore Library</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              title="Your knowledge cloud is empty"
              description="Save your first tutorial, article, code snippet, or note to start your personal knowledge bank."
              actionText="Add First Item"
              onAction={openCreateModal}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentItems.map((item) => (
                <KnowledgeCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
