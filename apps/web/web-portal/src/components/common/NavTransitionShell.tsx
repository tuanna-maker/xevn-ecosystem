import React from 'react';
import { NAV_TRANSITION_FADE_MS } from './navTransitionTiming';

export type NavTransitionShellVariant = 'settings' | 'drawer' | 'embed' | 'profile';

export type NavTransitionShellProps = {
  variant?: NavTransitionShellVariant;
  className?: string;
  label?: string;
};

const ShellBlock: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`animate-pulse rounded-xl bg-slate-200/80 ${className ?? ''}`} aria-hidden />
);

function SettingsSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
      <ShellBlock className="h-10 shrink-0" />
      <div className="grid gap-4 sm:grid-cols-3">
        <ShellBlock className="h-24" />
        <ShellBlock className="h-24" />
        <ShellBlock className="h-24" />
      </div>
      <ShellBlock className="min-h-[min(320px,50vh)] flex-1" />
    </div>
  );
}

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-5 py-4">
      <ShellBlock className="h-4 w-24" />
      <ShellBlock className="h-6 w-full max-w-xs" />
      <ShellBlock className="h-4 w-full" />
      <ShellBlock className="h-4 w-5/6" />
      <ShellBlock className="mt-2 h-32 w-full" />
      <div className="mt-auto flex gap-2 pt-6">
        <ShellBlock className="h-10 flex-1" />
        <ShellBlock className="h-10 flex-1" />
      </div>
    </div>
  );
}

function EmbedSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 bg-slate-50 p-4">
      <ShellBlock className="h-8 w-40 shrink-0" />
      <ShellBlock className="min-h-[min(280px,55vh)] flex-1" />
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <ShellBlock className="h-7 w-48" />
      <div className="flex gap-4">
        <ShellBlock className="h-28 w-28 shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <ShellBlock className="h-5 w-40" />
          <ShellBlock className="h-4 w-32" />
          <ShellBlock className="h-4 w-56" />
        </div>
      </div>
      <ShellBlock className="h-64 w-full" />
    </div>
  );
}

const VARIANT_CONTENT: Record<NavTransitionShellVariant, React.FC> = {
  settings: SettingsSkeleton,
  drawer: DrawerSkeleton,
  embed: EmbedSkeleton,
  profile: ProfileSkeleton,
};

export function NavTransitionShell({
  variant = 'settings',
  className = '',
  label = 'Đang tải nội dung…',
}: NavTransitionShellProps) {
  const Content = VARIANT_CONTENT[variant];

  return (
    <div
      className={`flex min-h-0 flex-col bg-white/95 backdrop-blur-sm transition-opacity duration-200 ${className}`}
      style={{ transitionDuration: `${NAV_TRANSITION_FADE_MS}ms` }}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">{label}</span>
      <Content />
    </div>
  );
}
