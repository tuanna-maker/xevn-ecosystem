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
import { formatViGroupedInteger } from '../lib/viNumberFormat';

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
  const inputRef = React.useRef<HTMLInputElement>(null);
  const lastEmittedValue = React.useRef(value);

  // Sync from props (only if external change, e.g. API load or reset)
  React.useEffect(() => {
    if (value !== lastEmittedValue.current) {
      if (inputRef.current) {
        inputRef.current.value = value === 0 ? '' : formatViGroupedInteger(value);
      }
      lastEmittedValue.current = value;
    }
  }, [value]);

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      maxLength={22}
      className={cn('tabular-nums min-h-[42px]', className)}
      defaultValue={value === 0 ? '' : formatViGroupedInteger(value)}
      onChange={(e) => {
        const raw = e.target.value;
        const selectionStart = e.target.selectionStart;
        
        // Strip non-digits
        const digits = raw.replace(/\D/g, '');
        const parsed = digits === '' ? 0 : Number(digits);
        const formatted = digits === '' ? '' : digits === '0' ? '0' : formatViGroupedInteger(parsed);

        // Calculate new cursor position safely
        let newCursor = 0;
        if (selectionStart !== null) {
          const digitsBefore = raw.substring(0, selectionStart).replace(/\D/g, '').length;
          let countedDigits = 0;
          for (let i = 0; i < formatted.length; i++) {
            if (countedDigits === digitsBefore) break;
            if (/\d/.test(formatted[i])) countedDigits++;
            newCursor = i + 1;
          }
        }

        // Synchronously update the DOM to prevent React event batching bugs
        if (inputRef.current) {
          inputRef.current.value = formatted;
          if (selectionStart !== null) {
            inputRef.current.setSelectionRange(newCursor, newCursor);
          }
        }

        lastEmittedValue.current = parsed;
        onValueChange(parsed);
      }}
      onBlur={(e) => {
        if (inputRef.current) {
           inputRef.current.value = value === 0 ? '' : formatViGroupedInteger(value);
        }
        onBlur?.(e);
      }}
      {...props}
    />
  );
};
