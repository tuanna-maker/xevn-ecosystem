import React from 'react';
import { Loader2 } from 'lucide-react';

export type MutationButtonVariant = 'success' | 'danger' | 'neutral';

export type MutationButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'children'
> & {
  pending?: boolean;
  variant?: MutationButtonVariant;
  iconOnly?: boolean;
  children: React.ReactNode;
};

const VARIANT_CLASS: Record<MutationButtonVariant, string> = {
  success:
    'border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
  danger: 'border border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100',
  neutral: 'border border-xevn-border text-xevn-text hover:bg-slate-100',
};

export function MutationButton({
  pending = false,
  variant = 'neutral',
  iconOnly = false,
  disabled,
  className = '',
  children,
  ...props
}: MutationButtonProps) {
  const sizeClass = iconOnly ? 'p-2' : 'px-3 py-2 text-sm font-medium';
  const isDisabled = disabled || pending;

  return (
    <button
      type="button"
      disabled={isDisabled}
      aria-busy={pending || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-lg transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASS[variant]} ${sizeClass} ${className}`}
      {...props}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : children}
    </button>
  );
}
