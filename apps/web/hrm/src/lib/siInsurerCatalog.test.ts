import { describe, expect, it } from 'vitest';
import {
  formatSiInsurerDisplay,
  isValidSiInsurerKeyFormat,
  normalizeSiInsurerKey,
  resolveSiInsurerLabel,
  siInsurersToPickerOptions,
  withSiInsurerHistoryOption,
} from './siInsurerCatalog';

describe('siInsurerCatalog (PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INSURER-CATALOG-FE-01)', () => {
  it('accepts open-catalog format keys including VSS and #N+1 style', () => {
    expect(isValidSiInsurerKeyFormat('VSS')).toBe(true);
    expect(isValidSiInsurerKeyFormat('BaoViet')).toBe(true);
    expect(isValidSiInsurerKeyFormat('PVI')).toBe(true);
    expect(isValidSiInsurerKeyFormat('hr_insurer_custom_09')).toBe(true);
  });

  it('rejects format-only failures — not closed VSS/BaoViet enum', () => {
    expect(isValidSiInsurerKeyFormat('9starts_digit')).toBe(false);
    expect(isValidSiInsurerKeyFormat('BAD KEY')).toBe(false);
    expect(isValidSiInsurerKeyFormat('')).toBe(false);
    expect(isValidSiInsurerKeyFormat('_leading_us')).toBe(false);
  });

  it('normalizes key with trim only (preserves case)', () => {
    expect(normalizeSiInsurerKey('  BaoViet  ')).toBe('BaoViet');
    expect(normalizeSiInsurerKey('hr_insurer_custom_09')).toBe('hr_insurer_custom_09');
  });

  it('display-ready label never raw-key-only when nameVi present', () => {
    expect(formatSiInsurerDisplay('hr_insurer_custom_09', 'BH HR riêng')).toBe(
      'BH HR riêng (hr_insurer_custom_09)',
    );
  });

  it('maps rows to picker options without FE closed enum hardcode', () => {
    const opts = siInsurersToPickerOptions([
      { insurerKey: 'hr_insurer_custom_09', nameVi: 'BH HR riêng' },
      { insurerKey: 'VSS', nameVi: 'Bảo hiểm xã hội VN' },
    ]);
    expect(opts.map((o) => o.value)).toEqual(['hr_insurer_custom_09', 'VSS']);
    expect(opts[0]?.label).toBe('BH HR riêng');
  });

  it('history option keeps retired key selectable; resolve falls back to key', () => {
    const base = siInsurersToPickerOptions([{ insurerKey: 'VSS', nameVi: 'VSS' }]);
    const withHist = withSiInsurerHistoryOption(base, 'retired_legacy');
    expect(withHist.map((o) => o.value)).toContain('retired_legacy');
    expect(resolveSiInsurerLabel(base, 'unknown_hist')).toBe('unknown_hist');
  });
});
