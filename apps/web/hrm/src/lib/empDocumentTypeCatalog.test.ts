import { describe, expect, it } from 'vitest';
import {
  empDocumentTypesToPickerOptions,
  formatEmpDocumentTypeDisplay,
  isValidEmpDocumentTypeKeyFormat,
  normalizeEmpDocumentTypeKey,
  resolveEmpDocumentTypeLabel,
} from './empDocumentTypeCatalog';

describe('empDocumentTypeCatalog (PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-FE-01)', () => {
  it('accepts open catalog keys (N+ / starter-shaped — not a ceiling)', () => {
    expect(isValidEmpDocumentTypeKeyFormat('hr_doc_custom_09')).toBe(true);
    expect(isValidEmpDocumentTypeKeyFormat('cccd')).toBe(true);
    expect(isValidEmpDocumentTypeKeyFormat('health_cert')).toBe(true);
  });

  it('rejects format-invalid keys after lowercase normalize', () => {
    expect(isValidEmpDocumentTypeKeyFormat('9starts_digit')).toBe(false);
    expect(isValidEmpDocumentTypeKeyFormat('BAD KEY')).toBe(false);
    expect(isValidEmpDocumentTypeKeyFormat('')).toBe(false);
  });

  it('normalizes to lowercase (pattern Loại phép — QA U65 uppercase slug)', () => {
    expect(normalizeEmpDocumentTypeKey('  hr_doc_custom_09  ')).toBe('hr_doc_custom_09');
    expect(normalizeEmpDocumentTypeKey('CCCD')).toBe('cccd');
    expect(isValidEmpDocumentTypeKeyFormat('CCCD')).toBe(true);
  });

  it('formats display-ready label', () => {
    expect(formatEmpDocumentTypeDisplay('hr_doc_custom_09', 'Giấy tờ HR riêng')).toBe(
      'Giấy tờ HR riêng (hr_doc_custom_09)',
    );
  });

  it('maps picker options + history key fallback', () => {
    const opts = empDocumentTypesToPickerOptions([
      { documentTypeKey: 'hr_doc_custom_09', nameVi: 'Giấy tờ HR riêng' },
    ]);
    expect(opts[0]).toEqual({
      value: 'hr_doc_custom_09',
      label: 'Giấy tờ HR riêng',
      code: 'hr_doc_custom_09',
    });
    expect(resolveEmpDocumentTypeLabel(opts, 'retired_old_key')).toBe('retired_old_key');
  });
});
