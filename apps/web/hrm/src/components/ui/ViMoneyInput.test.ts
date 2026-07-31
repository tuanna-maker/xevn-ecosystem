/**
 * D-HDSD-MUTATE-FE-VIMONEY-01 — vi-VN money grouping + plain commit helpers.
 */
import { createElement } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import {
  ViMoneyInput,
  amountStringToNumber,
  formatViMoneyGrouped,
  numberToAmountString,
  parseViMoneyDigits,
} from './ViMoneyInput';

afterEach(() => {
  cleanup();
});

describe('parse / format vi-VN money', () => {
  it('formats thousand grouping with dots', () => {
    expect(formatViMoneyGrouped(0)).toBe('');
    expect(formatViMoneyGrouped(999)).toBe('999');
    expect(formatViMoneyGrouped(1000)).toBe('1.000');
    expect(formatViMoneyGrouped(15_000_000)).toBe('15.000.000');
    expect(formatViMoneyGrouped(500_000_000_000)).toBe('500.000.000.000');
  });

  it('parses digits ignoring grouping and junk', () => {
    expect(parseViMoneyDigits('')).toBe(0);
    expect(parseViMoneyDigits('15.000.000')).toBe(15_000_000);
    expect(parseViMoneyDigits('20,000,000')).toBe(20_000_000);
    expect(parseViMoneyDigits('VNĐ 1.500.000')).toBe(1_500_000);
  });

  it('amountStringToNumber accepts plain, grouped, number', () => {
    expect(amountStringToNumber(undefined)).toBe(0);
    expect(amountStringToNumber('')).toBe(0);
    expect(amountStringToNumber(2_000_000)).toBe(2_000_000);
    expect(amountStringToNumber('15000000')).toBe(15_000_000);
    expect(amountStringToNumber('15.000.000')).toBe(15_000_000);
    expect(amountStringToNumber('1.234.567')).toBe(1_234_567);
  });

  it('numberToAmountString is plain digits (safe for parseFloat / API)', () => {
    expect(numberToAmountString(0)).toBe('');
    expect(numberToAmountString(15_000_000)).toBe('15000000');
    expect(numberToAmountString(1_234_567)).toBe('1234567');
    // InsurancePolicyTab uses parseFloat(addBaseSalary) — must not see dots
    expect(Number.parseFloat(numberToAmountString(15_000_000))).toBe(15_000_000);
  });
});

describe('ViMoneyInput', () => {
  it('groups while typing and emits plain number', () => {
    const onValueChange = vi.fn();
    render(
      createElement(ViMoneyInput, {
        value: 0,
        onValueChange,
        placeholder: 'VNĐ',
        'aria-label': 'Mức lương BH',
      }),
    );
    const input = screen.getByLabelText('Mức lương BH') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '15000000' } });
    expect(onValueChange).toHaveBeenCalledWith(15_000_000);
    expect(input.value).toBe('15.000.000');
  });

  it('syncs display from controlled value when not focused', () => {
    const onValueChange = vi.fn();
    const { rerender } = render(
      createElement(ViMoneyInput, {
        value: 1_000_000,
        onValueChange,
        'aria-label': 'salary',
      }),
    );
    expect((screen.getByLabelText('salary') as HTMLInputElement).value).toBe('1.000.000');
    rerender(
      createElement(ViMoneyInput, {
        value: 2_500_000,
        onValueChange,
        'aria-label': 'salary',
      }),
    );
    expect((screen.getByLabelText('salary') as HTMLInputElement).value).toBe('2.500.000');
  });
});
