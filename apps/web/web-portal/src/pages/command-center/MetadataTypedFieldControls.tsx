/**
 * @CODE-MEMORY
 * Screen:     Command Center metadata typed fields (infra + employee preview)
 * Purpose:    Render number/date metadata inputs with VI format (money group + dd/MM/yyyy).
 * WorkItem:   D-UX-VI-FORMAT-PORTAL-01
 * Coded:      2026-07-20
 * must_keep:  string store for customFields; money → number on submit via String(n); %/order EXEMPT
 * LastVerified: apps/web/web-portal viNumberFormat.test.ts
 */

import React from 'react';
import {
  isViMoneyFieldHint,
  parseViGroupedInteger,
  ViDateInput,
  ViGroupedIntegerInput,
} from '@xevn/ui';

export type MetadataFieldDataType =
  | 'text'
  | 'number'
  | 'date'
  | 'phone'
  | 'email'
  | 'select'
  | string;

export function MetadataNumberOrMoneyInput(props: {
  label: string;
  fieldCode?: string;
  value: string;
  onChange: (v: string) => void;
  className: string;
  'aria-label'?: string;
}): React.ReactElement {
  const { label, fieldCode = '', value, onChange, className } = props;
  if (isViMoneyFieldHint(label, fieldCode)) {
    return (
      <ViGroupedIntegerInput
        aria-label={props['aria-label'] ?? label}
        value={parseViGroupedInteger(value)}
        onValueChange={(n) => onChange(n === 0 ? '' : String(n))}
        className={className}
      />
    );
  }
  return (
    <input
      type="number"
      aria-label={props['aria-label'] ?? label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    />
  );
}

export function MetadataDateInput(props: {
  value: string;
  onChange: (iso: string) => void;
  className: string;
  'aria-label'?: string;
}): React.ReactElement {
  return (
    <ViDateInput
      aria-label={props['aria-label']}
      value={props.value}
      onValueChange={props.onChange}
      className={props.className}
    />
  );
}
