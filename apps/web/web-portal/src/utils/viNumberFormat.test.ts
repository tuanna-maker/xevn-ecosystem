import { describe, expect, it } from 'vitest';
import {
  formatViGroupedInteger,
  parseViGroupedInteger,
  formatViGroupedDecimal,
  parseViGroupedDecimal,
} from './viNumberFormat';
import {
  formatViGroupedInteger as fromUiInteger,
  parseViGroupedInteger as fromUiParse,
  formatDisplayDate,
  VI_DATE_DISPLAY_PATTERN,
  formatIsoDateToViDisplay,
  parseViDisplayToIsoDate,
  isCompleteViDateDraft,
  isViMoneyFieldHint,
} from '@xevn/ui';
import { isKpiMoneyUnit } from '../pages/settings/kpiMoneyUnit';

describe('viNumberFormat (dual export → @xevn/ui SoT)', () => {
  it('formats >= 1000 with dot grouping', () => {
    expect(formatViGroupedInteger(999)).toBe('999');
    expect(formatViGroupedInteger(1000)).toBe('1.000');
    expect(formatViGroupedInteger(500000000000)).toBe('500.000.000.000');
  });

  it('parses grouped and plain input', () => {
    expect(parseViGroupedInteger('1.234.567')).toBe(1234567);
    expect(parseViGroupedInteger('500000000000')).toBe(500000000000);
    expect(parseViGroupedInteger('')).toBe(0);
  });

  it('dual export matches @xevn/ui SoT', () => {
    expect(formatViGroupedInteger(1234567)).toBe(fromUiInteger(1234567));
    expect(parseViGroupedInteger('1.234.567')).toBe(fromUiParse('1.234.567'));
  });

  it('formatViGroupedDecimal uses comma fraction (optional rates path)', () => {
    expect(formatViGroupedDecimal(1234.5, 2)).toMatch(/1\.234/);
    expect(parseViGroupedDecimal('1.234,56')).toBe(1234.56);
    expect(parseViGroupedDecimal('')).toBe(0);
  });
});

describe('formatDisplayDate SoT (@xevn/ui)', () => {
  it('defaults to dd/MM/yyyy', () => {
    expect(VI_DATE_DISPLAY_PATTERN).toBe('dd/MM/yyyy');
    expect(formatDisplayDate('2025-01-05')).toBe('05/01/2025');
  });

  it('keeps period labels verbatim', () => {
    expect(formatDisplayDate('01/2025')).toBe('01/2025');
    expect(formatDisplayDate('2026-07')).toBe('2026-07');
  });
});

describe('viDateFormat portal entry (D-UX-VI-FORMAT-PORTAL-01)', () => {
  it('ISO ↔ dd/MM/yyyy round-trip', () => {
    expect(formatIsoDateToViDisplay('2026-07-20')).toBe('20/07/2026');
    expect(parseViDisplayToIsoDate('20/07/2026')).toBe('2026-07-20');
    expect(parseViDisplayToIsoDate('5/1/2026')).toBe('2026-01-05');
    expect(parseViDisplayToIsoDate('2026-07-20')).toBe('2026-07-20');
    expect(parseViDisplayToIsoDate('')).toBe('');
    expect(parseViDisplayToIsoDate('99/99/2026')).toBeNull();
  });

  it('isCompleteViDateDraft gates commit while typing (D-UX-VI-FORMAT-DATE-BLUR-01)', () => {
    expect(isCompleteViDateDraft('')).toBe(true);
    expect(isCompleteViDateDraft('20/07/202')).toBe(false);
    expect(isCompleteViDateDraft('20/07/2026')).toBe(true);
    expect(isCompleteViDateDraft('2026-07-20')).toBe(true);
    expect(isCompleteViDateDraft('99/99/2026')).toBe(false);
    expect(isCompleteViDateDraft('16/07')).toBe(false);
  });

  it('money field hint detects MUST vs EXEMPT', () => {
    expect(isViMoneyFieldHint('Hạn mức công nợ (VNĐ)')).toBe(true);
    expect(isViMoneyFieldHint('Vốn góp', 'contributed_value')).toBe(true);
    expect(isViMoneyFieldHint('Tỷ lệ %', 'ratio_percent')).toBe(false);
    expect(isViMoneyFieldHint('Thứ tự hiển thị', 'sort_order')).toBe(false);
  });

  it('creditLimit / expense / charter samples stay numeric after parse', () => {
    expect(parseViGroupedInteger('500.000.000')).toBe(500000000);
    expect(parseViGroupedInteger('10.000.000')).toBe(10000000);
    expect(parseViGroupedInteger('500.000.000.000')).toBe(500000000000);
  });

  it('KPI unit gate — money MUST, percent EXEMPT', () => {
    expect(isKpiMoneyUnit('VNĐ')).toBe(true);
    expect(isKpiMoneyUnit('VND')).toBe(true);
    expect(isKpiMoneyUnit('%')).toBe(false);
    expect(isKpiMoneyUnit('điểm')).toBe(false);
  });
});
