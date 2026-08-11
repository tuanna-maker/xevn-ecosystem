/**
 * @CODE-MEMORY
 * Screen:     Shared VI date text input (portal CC / settings)
 * Purpose:    type=text entry showing dd/MM/yyyy; value/onValueChange use ISO yyyy-MM-dd.
 *             Prefer over native type=date when Calendar/Popover not available on surface.
 * WorkItem:   D-UX-VI-FORMAT-PORTAL-01
 * Coded:      2026-07-20
 * must_keep:  API store remains ISO; display always dd/MM/yyyy when valid
 * LastVerified: apps/web/web-portal viNumberFormat.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-07-20 D-UX-VI-FORMAT-DATE-BLUR-01
 * Commit ISO on complete onChange (not blur-only) + flushSync on blur so Lưu after blur
 * sees parent state before click handler (AC-UX-DATE-02).
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { cn } from '../lib/utils';
import {
  formatIsoDateToViDisplay,
  isCompleteViDateDraft,
  parseViDisplayToIsoDate,
} from '../lib/viDateFormat';

export interface ViDateInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'onChange'> {
  /** ISO date-only yyyy-MM-dd (or empty). */
  value: string;
  /** Called with ISO yyyy-MM-dd or '' when cleared / committed. */
  onValueChange: (isoDate: string) => void;
}

/**
 * Date field with vi-VN display (dd/MM/yyyy) while storing ISO for APIs.
 * @example
 *   <ViDateInput value={iso} onValueChange={setIso} />
 */
export const ViDateInput: React.FC<ViDateInputProps> = ({
  value,
  onValueChange,
  className,
  onBlur,
  placeholder = 'dd/MM/yyyy',
  ...props
}) => {
  const [draft, setDraft] = useState(() => formatIsoDateToViDisplay(value));
  const valueRef = useRef(value);
  const onValueChangeRef = useRef(onValueChange);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    onValueChangeRef.current = onValueChange;
  }, [onValueChange]);

  useEffect(() => {
    setDraft(formatIsoDateToViDisplay(value));
  }, [value]);

  const commitIso = useCallback((iso: string, syncParent = false) => {
    if (iso === valueRef.current) return;
    if (syncParent) {
      flushSync(() => {
        onValueChangeRef.current(iso);
      });
      valueRef.current = iso;
      return;
    }
    onValueChangeRef.current(iso);
    valueRef.current = iso;
  }, []);

  const applyDisplayCommit = useCallback(
    (raw: string, syncParent = false) => {
      const parsed = parseViDisplayToIsoDate(raw);
      if (parsed === null) {
        setDraft(formatIsoDateToViDisplay(valueRef.current));
        return;
      }
      if (parsed === '') {
        setDraft('');
        commitIso('', syncParent);
        return;
      }
      setDraft(formatIsoDateToViDisplay(parsed));
      commitIso(parsed, syncParent);
    },
    [commitIso],
  );

  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      placeholder={placeholder}
      className={cn('tabular-nums', className)}
      value={draft}
      onChange={(e) => {
        const next = e.target.value;
        setDraft(next);
        if (isCompleteViDateDraft(next)) {
          applyDisplayCommit(next, false);
        }
      }}
      onBlur={(e) => {
        applyDisplayCommit(e.target.value, true);
        onBlur?.(e);
      }}
      {...props}
    />
  );
};
