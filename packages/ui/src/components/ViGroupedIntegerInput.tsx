/**
 * @CODE-MEMORY
 * Screen:     Shared VI grouped integer input
 * Purpose:    text + inputMode=numeric; format while typing; onValueChange emits number.
 * WorkItem:   D-UX-VI-FORMAT-SHARED-01
 * Coded:      2026-07-20
 * must_keep:  value/onValueChange are number; empty UI ↔ 0; never submit string
 * LastVerified: apps/web/web-portal viNumberFormat.test.ts + CommandCenter charter/shareholder
 */

import React from 'react';
import { cn } from '../lib/utils';
import { formatViGroupedInteger, parseViGroupedInteger } from '../lib/viNumberFormat';

export interface ViGroupedIntegerInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  /** Numeric value (store / submit). Empty field maps to 0. */
  value: number;
  /** Called with parsed integer on every change. */
  onValueChange: (value: number) => void;
}

/**
 * Money/quantity integer field with vi-VN thousand separators while typing.
 * @example
 *   <ViGroupedIntegerInput value={capital} onValueChange={setCapital} />
 */
export const ViGroupedIntegerInput: React.FC<ViGroupedIntegerInputProps> = ({
  value,
  onValueChange,
  className,
  onBlur,
  ...props
}) => {
  const display = value === 0 ? '' : formatViGroupedInteger(value);

  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      className={cn('tabular-nums', className)}
      value={display}
      onChange={(e) => {
        onValueChange(parseViGroupedInteger(e.target.value));
      }}
      onBlur={(e) => {
        // Re-sync display from numeric value (already controlled via `value`).
        onBlur?.(e);
      }}
      {...props}
    />
  );
};
