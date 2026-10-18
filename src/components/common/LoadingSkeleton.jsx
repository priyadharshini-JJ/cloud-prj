import React from 'react';

export function CardSkeleton() {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm animate-pulse flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-slate-200 rounded w-24"></div>
        <div className="h-4 bg-slate-200 rounded w-8"></div>
      </div>
      <div className="h-5 bg-slate-200 rounded w-4/5 mt-1"></div>
      <div className="h-4 bg-slate-100 rounded w-full"></div>
      <div className="h-4 bg-slate-100 rounded w-2/3"></div>
      <div className="flex gap-2 pt-2 border-t border-slate-100 mt-2">
        <div className="h-4 bg-slate-200 rounded w-16"></div>
        <div className="h-4 bg-slate-200 rounded w-16"></div>
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
