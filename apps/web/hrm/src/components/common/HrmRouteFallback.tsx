import React from 'react';

/** Suspense fallback for HRM lazy routes — reduces white flash on list→detail (UX-HRM-01). */
export function HrmRouteFallback() {
  return (
    <div
      className="flex min-h-[min(280px,45vh)] flex-col gap-4 p-4 animate-in fade-in duration-200"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Đang tải trang HRM…</span>
      <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200/80" />
      <div className="min-h-[200px] flex-1 animate-pulse rounded-xl bg-slate-200/80" />
    </div>
  );
}

/** Profile/detail routes — richer skeleton (UX-HRM-01 list→detail). */
export function HrmProfileRouteFallback() {
  return (
    <div
      className="flex flex-col gap-4 p-4 animate-in fade-in duration-200"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">Đang tải hồ sơ nhân viên…</span>
      <div className="h-7 w-48 animate-pulse rounded-lg bg-slate-200/80" />
      <div className="flex gap-4">
        <div className="h-28 w-28 shrink-0 animate-pulse rounded-full bg-slate-200/80" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-5 w-40 animate-pulse rounded bg-slate-200/80" />
          <div className="h-4 w-32 animate-pulse rounded bg-slate-200/80" />
          <div className="h-4 w-56 animate-pulse rounded bg-slate-200/80" />
        </div>
      </div>
      <div className="h-64 w-full animate-pulse rounded-xl bg-slate-200/80" />
    </div>
  );
}
