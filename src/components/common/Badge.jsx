import React from 'react';
import { SOURCE_TYPE_COLORS } from '../../lib/defaultCategories';

export function SourceBadge({ type }) {
  const colorClass = SOURCE_TYPE_COLORS[type] || 'bg-slate-100 text-slate-700 border-slate-200';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${colorClass}`}
    >
      {type}
    </span>
  );
}

export function CategoryBadge({ name, color = 'emerald' }) {
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
    slate: 'bg-slate-50 text-slate-700 border-slate-200',
  };

  const style = colorMap[color] || colorMap.emerald;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${style}`}>
      {name}
    </span>
  );
}

export function TagBadge({ tag, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors ${
        onClick ? 'cursor-pointer' : 'cursor-default'
      }`}
    >
      #{tag}
    </button>
  );
}
