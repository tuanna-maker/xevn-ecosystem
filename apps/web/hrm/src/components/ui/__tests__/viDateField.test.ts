import { describe, expect, it } from 'vitest';
import {
  formatIsoDateToViDisplay,
  isCompleteViDateDraft,
  parseViDisplayToIsoDate,
} from '@xevn/ui';

/** ViDateField delegates to @xevn/ui ViDateInput — assert SoT date round-trip. */
describe('ViDateField SoT (viDateFormat via @xevn/ui)', () => {
  it('formats ISO to dd/MM/yyyy display', () => {
    expect(formatIsoDateToViDisplay('2026-07-20')).toBe('20/07/2026');
    expect(formatIsoDateToViDisplay('')).toBe('');
  });

  it('parses complete vi draft to ISO', () => {
    expect(parseViDisplayToIsoDate('20/07/2026')).toBe('2026-07-20');
    expect(parseViDisplayToIsoDate('')).toBe('');
  });

  it('detects complete draft before commit', () => {
    expect(isCompleteViDateDraft('20/07/2026')).toBe(true);
    expect(isCompleteViDateDraft('20/07/20')).toBe(false);
  });

  it('round-trip ISO ↔ display', () => {
    const iso = '2024-03-15';
    const display = formatIsoDateToViDisplay(iso);
    expect(parseViDisplayToIsoDate(display)).toBe(iso);
  });
});
