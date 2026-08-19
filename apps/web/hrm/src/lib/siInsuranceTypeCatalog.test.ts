import { describe, expect, it } from 'vitest';
import {
  formatSiInsuranceTypeDisplay,
  isValidSiInsuranceTypeKeyFormat,
  normalizeSiInsuranceTypeKey,
  resolveSiInsuranceTypeLabel,
  siInsuranceTypesToPickerOptions,
  siInsuranceTypesToRateCfgPickerOptions,
  withSiInsuranceTypeHistoryOption,
} from './siInsuranceTypeCatalog';

describe('siInsuranceTypeCatalog (PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-FE-01)', () => {
  it('accepts open-catalog format keys including BHXH and #N+1 style', () => {
    expect(isValidSiInsuranceTypeKeyFormat('BHXH')).toBe(true);
    expect(isValidSiInsuranceTypeKeyFormat('BHYT')).toBe(true);
    expect(isValidSiInsuranceTypeKeyFormat('social')).toBe(true);
    expect(isValidSiInsuranceTypeKeyFormat('hr_custom_si_09')).toBe(true);
  });

  it('rejects format-only failures — not closed BHXH/BHYT enum', () => {
    expect(isValidSiInsuranceTypeKeyFormat('9starts_digit')).toBe(false);
    expect(isValidSiInsuranceTypeKeyFormat('BAD KEY')).toBe(false);
    expect(isValidSiInsuranceTypeKeyFormat('')).toBe(false);
    expect(isValidSiInsuranceTypeKeyFormat('_leading_us')).toBe(false);
  });

  it('normalizes key with trim only (preserves case)', () => {
    expect(normalizeSiInsuranceTypeKey('  BHXH  ')).toBe('BHXH');
    expect(normalizeSiInsuranceTypeKey('hr_custom_si_09')).toBe('hr_custom_si_09');
  });

  it('display-ready label never raw-key-only when nameVi present', () => {
    expect(formatSiInsuranceTypeDisplay('hr_custom_si_09', 'BH HR riêng')).toBe(
      'BH HR riêng (hr_custom_si_09)',
    );
  });

  it('maps rows to picker options without FE closed enum hardcode', () => {
    const opts = siInsuranceTypesToPickerOptions([
      { insuranceTypeKey: 'hr_custom_si_09', nameVi: 'BH HR riêng' },
      { insuranceTypeKey: 'BHXH', nameVi: 'Bảo hiểm xã hội' },
    ]);
    expect(opts.map((o) => o.value)).toEqual(['hr_custom_si_09', 'BHXH']);
    expect(opts[0]?.label).toBe('BH HR riêng');
  });

  it('rate-cfg picker hides rows with eligibleForRateCfg=false', () => {
    const opts = siInsuranceTypesToRateCfgPickerOptions([
      { insuranceTypeKey: 'BHXH', nameVi: 'BHXH', eligibleForRateCfg: true },
      { insuranceTypeKey: 'LIFE', nameVi: 'Nhân thọ', eligibleForRateCfg: false },
    ]);
    expect(opts.map((o) => o.value)).toEqual(['BHXH']);
  });

  it('history option keeps retired key selectable; resolve falls back to key', () => {
    const base = siInsuranceTypesToPickerOptions([
      { insuranceTypeKey: 'BHXH', nameVi: 'BHXH' },
    ]);
    const withHist = withSiInsuranceTypeHistoryOption(base, 'retired_legacy');
    expect(withHist.map((o) => o.value)).toContain('retired_legacy');
    expect(resolveSiInsuranceTypeLabel(base, 'unknown_hist')).toBe('unknown_hist');
  });
});
