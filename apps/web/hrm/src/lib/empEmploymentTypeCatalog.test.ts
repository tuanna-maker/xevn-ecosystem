import { describe, expect, it } from 'vitest';
import {
  empEmploymentTypesToPickerOptions,
  ensureHistoricalEmploymentTypeOption,
  formatEmpEmploymentTypeDisplay,
  isValidEmpEmploymentTypeKeyFormat,
  normalizeEmpEmploymentTypeKey,
  resolveEmpEmploymentTypeLabel,
} from './empEmploymentTypeCatalog';

describe('empEmploymentTypeCatalog (PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-FE-01)', () => {
  it('accepts open keys including 5th+ and hyphen-normalized full-time', () => {
    expect(isValidEmpEmploymentTypeKeyFormat('seasonal_temp_09')).toBe(true);
    expect(isValidEmpEmploymentTypeKeyFormat('full_time')).toBe(true);
    expect(isValidEmpEmploymentTypeKeyFormat('full-time')).toBe(true);
  });

  it('accepts uppercase QA slug after lowercase normalize (pattern Loại phép)', () => {
    expect(isValidEmpEmploymentTypeKeyFormat('FULL_TIME')).toBe(true);
    expect(isValidEmpEmploymentTypeKeyFormat('9bad')).toBe(false);
    expect(isValidEmpEmploymentTypeKeyFormat('')).toBe(false);
  });

  it('normalizes hyphen→underscore and lowercase', () => {
    expect(normalizeEmpEmploymentTypeKey('full-time')).toBe('full_time');
    expect(normalizeEmpEmploymentTypeKey('  part-time  ')).toBe('part_time');
    expect(normalizeEmpEmploymentTypeKey('FULL_TIME')).toBe('full_time');
  });

  it('formats display + picker map', () => {
    expect(formatEmpEmploymentTypeDisplay('full_time', 'Toàn thời gian')).toBe(
      'Toàn thời gian (full_time)',
    );
    const opts = empEmploymentTypesToPickerOptions([
      { employmentTypeKey: 'seasonal_temp_09', nameVi: 'Thời vụ' },
    ]);
    expect(opts[0]?.value).toBe('seasonal_temp_09');
  });

  it('keeps retired historical key selectable and labeled', () => {
    const base = empEmploymentTypesToPickerOptions([
      { employmentTypeKey: 'full_time', nameVi: 'Toàn thời gian' },
    ]);
    const withHist = ensureHistoricalEmploymentTypeOption(base, 'legacy_temp');
    expect(withHist.some((o) => o.value === 'legacy_temp')).toBe(true);
    expect(resolveEmpEmploymentTypeLabel(base, 'full-time')).toBe('Toàn thời gian');
    expect(resolveEmpEmploymentTypeLabel(base, 'gone_key')).toBe('gone_key');
  });
});
