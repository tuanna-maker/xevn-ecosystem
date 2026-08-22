/**
 * @CODE-MEMORY
 * Screen:     HRM shared — ô nhập tiền vi-VN (BH / lương / tuyển dụng / tạm ứng)
 * UC:         UX locale money MUST (salary, insurance base, budget)
 * BR:         AC-UX-VI-MONEY-01 — thousand grouping while typing; submit = plain number
 * SRS:        docs/program/UX_VI_DATE_NUMBER_FORMAT_AC.md · uiux-quality-accessibility
 * TechSpec:   HRM money fields bind number / plain digit string (không gửi "20.000.000")
 * Purpose:    Input tiền VND: hiển thị nhóm nghìn vi-VN khi gõ; onValueChange trả số thuần
 *             để form/API commit. Helper amountStringToNumber / numberToAmountString cho
 *             field lưu string (JD salary_min/max, BH base salary string state).
 * WorkItem:   D-HDSD-MUTATE-FE-VIMONEY-01
 * Coded:      2026-08-01
 *
 * Callers:
 *   - insurance/AddInsuranceDialog.tsx → base_salary
 *   - pages/Payroll.tsx · recruitment/JobPostingsTab · employee/* · payroll/*
 *
 * Callees:
 *   - Input (@/components/ui/input) · format/parse helpers trong file này
 *
 * FE-Actions:
 *   | Thao tác người dùng | Handler              | Lib / RPC        |
 *   |---------------------|----------------------|------------------|
 *   | Gõ số tiền          | handleChange         | parse → number   |
 *   | Blur / Lưu form     | onValueChange + RHF  | plain number API |
 *
 * BE-Chain: N/A (FE primitive)
 *
 * Impact:     Thiếu file → Vite 500 AddInsuranceDialog (R-8088-FE-BH-VIMONEY-01).
 *             Sai parse → POST salary/base_salary lệch (vd. parseFloat "15.000.000" = 15).
 * must_keep:  onValueChange(number); display vi-VN dots; numberToAmountString = plain digits;
 *             SoftDel · CatalogSearchPicker · policy_id · TC-041 · U65 no seed (call sites)
 * SOLID:      Presentational + pure format helpers — không business BH
 * LastVerified: ViMoneyInput.test.ts · docs/qa/evidence/d-hdsd-mutate-fe-vimoney-01-20260801.md
 */

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/** Strip grouping / currency junk → non-negative integer (VND). */
export function parseViMoneyDigits(raw: string): number {
  const digits = raw.replace(/[^\d]/g, '');
  if (!digits) return 0;
  const n = Number(digits);
  return Number.isFinite(n) ? n : 0;
}

/** Format non-negative integer with vi-VN thousand dots (1.000.000). */
export function formatViMoneyGrouped(value: number): string {
  if (!Number.isFinite(value) || value === 0) return '';
  const abs = Math.trunc(Math.abs(value));
  const sign = value < 0 ? '-' : '';
  return `${sign}${String(abs).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

/**
 * Accept plain digits, vi-VN grouped, or number — always plain number for forms/API.
 * Empty / invalid → 0.
 */
export function amountStringToNumber(
  value: string | number | null | undefined,
): number {
  if (value == null || value === '') return 0;
  if (typeof value === 'number') {
    return Number.isFinite(value) ? Math.trunc(value) : 0;
  }
  const trimmed = value.trim();
  if (!trimmed) return 0;
  // en-US commas OR vi-VN dots as thousand separators
  if (/^\d{1,3}([.,]\d{3})+$/.test(trimmed) || /^\d+$/.test(trimmed)) {
    return parseViMoneyDigits(trimmed);
  }
  // Mixed currency junk: "15.000.000 ₫" / "VNĐ 20,000,000"
  return parseViMoneyDigits(trimmed);
}

/** Plain digit string for string-backed form fields (safe for parseFloat / Number). */
export function numberToAmountString(n: number): string {
  if (!Number.isFinite(n) || n === 0) return '';
  return String(Math.trunc(n));
}

export type ViMoneyInputProps = Omit<
  React.ComponentPropsWithoutRef<'input'>,
  'type' | 'value' | 'onChange' | 'inputMode'
> & {
  value: number;
  onValueChange: (next: number) => void;
};

/**
 * Controlled money input: display grouped while typing; commit plain number via onValueChange.
 */
export const ViMoneyInput = React.forwardRef<HTMLInputElement, ViMoneyInputProps>(
  function ViMoneyInput(
    {
      value,
      onValueChange,
      onBlur,
      className,
      placeholder,
      name,
      disabled,
      id,
      'aria-label': ariaLabel,
      ...rest
    },
    ref,
  ) {
    const [text, setText] = React.useState(() => formatViMoneyGrouped(value));
    const focusedRef = React.useRef(false);
    const isComposingRef = React.useRef(false);

    React.useEffect(() => {
      if (focusedRef.current || isComposingRef.current) return;
      setText(formatViMoneyGrouped(value));
    }, [value]);

    const handleCompositionStart = () => {
      isComposingRef.current = true;
    };

    const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
      isComposingRef.current = false;
      const raw = e.currentTarget.value;
      const next = parseViMoneyDigits(raw);
      setText(formatViMoneyGrouped(next));
      onValueChange(next);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (isComposingRef.current) {
        setText(raw);
        return;
      }
      const next = parseViMoneyDigits(raw);
      setText(formatViMoneyGrouped(next));
      onValueChange(next);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      focusedRef.current = false;
      const next = parseViMoneyDigits(e.target.value);
      setText(formatViMoneyGrouped(next));
      if (next !== value) onValueChange(next);
      onBlur?.(e);
    };

    const { onFocus: onFocusProp, ...inputRest } = rest;

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      focusedRef.current = true;
      onFocusProp?.(e);
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        id={id}
        name={name}
        disabled={disabled}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={cn('tabular-nums', className)}
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        data-vi-money="1"
        {...inputRest}
      />
    );
  },
);

ViMoneyInput.displayName = 'ViMoneyInput';
