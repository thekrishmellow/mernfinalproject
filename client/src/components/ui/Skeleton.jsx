import React from 'react';
import { cn } from '../../utils/cn.js';

export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-2xl bg-slate-200/70', className)}
      aria-hidden="true"
      {...props}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4" aria-busy="true" aria-label="Loading content">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28 rounded-lg" />
        <Skeleton className="size-9 rounded-2xl" />
      </div>
      <Skeleton className="h-8 w-16 rounded-xl" />
      <Skeleton className="h-3 w-36 rounded-md" />
    </div>
  );
}

export default Skeleton;
