import { describe, expect, it } from 'vitest';
import {
  decDecisionTypesToPickerOptions,
  formatDecDecisionTypeDisplay,
  isValidDecDecisionTypeKeyFormat,
  normalizeDecDecisionTypeKey,
  resolveDecDecisionTypeLabel,
  withDecDecisionTypeHistoryOption,
} from './decDecisionTypeCatalog';

describe('decDecisionTypeCatalog (PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-FE-01)', () => {
  it('accepts open catalog keys including HRD_* case (not a ceiling)', () => {
    expect(isValidDecDecisionTypeKeyFormat('hr_custom_dec_09')).toBe(true);
    expect(isValidDecDecisionTypeKeyFormat('HRD_01')).toBe(true);
    expect(isValidDecDecisionTypeKeyFormat('HRD_QA_MSJ1')).toBe(true);
    expect(isValidDecDecisionTypeKeyFormat('appointment')).toBe(true);
  });

  it('rejects format-invalid keys (space / leading digit → HRM-PLT-CAT-CODE-INVALID path)', () => {
    expect(isValidDecDecisionTypeKeyFormat('BAD KEY')).toBe(false);
    expect(isValidDecDecisionTypeKeyFormat('9bad_key')).toBe(false);
    expect(isValidDecDecisionTypeKeyFormat('')).toBe(false);
    expect(isValidDecDecisionTypeKeyFormat('has-hyphen')).toBe(false);
  });

  it('normalize is trim-only (keeps HRD case — no lowercase invent)', () => {
    expect(normalizeDecDecisionTypeKey('  hr_custom_dec_09  ')).toBe('hr_custom_dec_09');
    expect(normalizeDecDecisionTypeKey('HRD_01')).toBe('HRD_01');
  });

  it('formats display-ready label', () => {
    expect(formatDecDecisionTypeDisplay('HRD_01', 'Bổ nhiệm')).toBe('Bổ nhiệm (HRD_01)');
  });

  it('maps picker options + history key fallback', () => {
    const opts = decDecisionTypesToPickerOptions([
      { decisionTypeKey: 'hr_custom_dec_09', nameVi: 'QSĐ HR riêng' },
    ]);
    expect(opts[0]).toEqual({
      value: 'hr_custom_dec_09',
      label: 'QSĐ HR riêng',
      code: 'hr_custom_dec_09',
    });
    expect(resolveDecDecisionTypeLabel(opts, 'retired_old_key')).toBe('retired_old_key');
    const withHist = withDecDecisionTypeHistoryOption(opts, 'retired_old_key');
    expect(withHist).toHaveLength(2);
    expect(withHist[1]).toEqual({
      value: 'retired_old_key',
      label: 'retired_old_key',
      code: 'retired_old_key',
    });
  });
});
