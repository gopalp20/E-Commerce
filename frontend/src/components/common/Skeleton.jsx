import React from 'react';

export const Skeleton = ({ className = '', rounded = 'rounded-md' }) => {
  return (
    <div className={`shimmer-loader bg-slate-200 animate-pulse ${rounded} ${className}`} />
  );
};

export const ProductCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-subtle flex flex-col gap-3">
      <Skeleton className="w-full aspect-square rounded-xl" />
      <div className="space-y-2 pt-1">
        <Skeleton className="h-3 w-1/3 rounded" />
        <Skeleton className="h-4 w-5/6 rounded" />
        <Skeleton className="h-3 w-1/2 rounded" />
      </div>
      <div className="flex items-center justify-between pt-2 mt-auto">
        <Skeleton className="h-5 w-20 rounded" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-100">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1 rounded" />
          ))}
        </div>
      ))}
    </div>
  );
};
