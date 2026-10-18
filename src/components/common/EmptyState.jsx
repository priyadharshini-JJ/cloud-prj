import React from 'react';
import { Plus, Search, Bookmark, FolderPlus } from 'lucide-react';

export default function EmptyState({
  icon = 'bookmark',
  title = 'No items found',
  description = 'Start capturing valuable insights and resources to recover them whenever you need.',
  actionText = 'Save Knowledge',
  onAction,
}) {
  const renderIcon = () => {
    switch (icon) {
      case 'search':
        return <Search className="w-8 h-8 text-slate-400" />;
      case 'folder':
        return <FolderPlus className="w-8 h-8 text-slate-400" />;
      default:
        return <Bookmark className="w-8 h-8 text-emerald-600" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
      <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 ring-8 ring-slate-50/50">
        {renderIcon()}
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl shadow-sm hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          <Plus className="w-4 h-4" />
          {actionText}
        </button>
      )}
    </div>
  );
}
