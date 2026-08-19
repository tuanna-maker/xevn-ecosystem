import { describe, expect, it } from 'vitest';
import {
  XEVN_STARTER_TEMPLATE_CODES,
  activeTemplatesForPicker,
  buildNumberPatternSettingValue,
  buildOrgSuffixSettingValue,
  formatTemplatePickerLabel,
  isValidTemplateCodeFormat,
  isXevnStarterTemplateCode,
  missingStarterTemplateCodes,
  normalizeTemplateCode,
  parseNumberPatternValue,
  parseOrgSuffixValue,
} from './contractTemplateCatalog';

describe('contractTemplateCatalog (PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-FE-01)', () => {
  it('isValidTemplateCodeFormat — format gate only (not closed 8)', () => {
    expect(isValidTemplateCodeFormat('XEVN_CUSTOM_OFFICE_01')).toBe(true);
    expect(isValidTemplateCodeFormat('xevn_custom_office_01')).toBe(true);
    expect(isValidTemplateCodeFormat('A1')).toBe(true);
    expect(isValidTemplateCodeFormat('1BAD')).toBe(false);
    expect(isValidTemplateCodeFormat('')).toBe(false);
    expect(isValidTemplateCodeFormat('HAS SPACE')).toBe(false);
    // 9th+ custom codes are valid — starter list is NOT a ceiling
    expect(isValidTemplateCodeFormat('XEVN_CUSTOM_SEASONAL_OFFICE')).toBe(true);
    expect(isXevnStarterTemplateCode('XEVN_CUSTOM_SEASONAL_OFFICE')).toBe(false);
  });

  it('normalizeTemplateCode uppercases', () => {
    expect(normalizeTemplateCode('  xevn_ft_12m_office ')).toBe('XEVN_FT_12M_OFFICE');
  });

  it('missingStarterTemplateCodes soft-warn only — never blocks #9+', () => {
    expect(missingStarterTemplateCodes([])).toHaveLength(8);
    expect(missingStarterTemplateCodes([...XEVN_STARTER_TEMPLATE_CODES])).toEqual([]);
    const one = missingStarterTemplateCodes(['XEVN_PROBATION_OFFICE', 'HR_CUSTOM_09']);
    expect(one).toContain('XEVN_FT_12M_OFFICE');
    expect(one).not.toContain('HR_CUSTOM_09' as never);
  });

  it('activeTemplatesForPicker includes any active code (open catalog)', () => {
    const rows = [
      { id: '1', code: 'XEVN_FT_12M_OFFICE', status: 'active' },
      { id: '2', code: 'XEVN_CUSTOM_OFFICE_01', status: 'active' },
      { id: '3', code: 'DRAFT_ONLY', status: 'draft' },
    ];
    const active = activeTemplatesForPicker(rows);
    expect(active.map((r) => r.code)).toEqual([
      'XEVN_FT_12M_OFFICE',
      'XEVN_CUSTOM_OFFICE_01',
    ]);
    // Must NOT slice to starter 8 only
    expect(active.some((r) => r.code === 'XEVN_CUSTOM_OFFICE_01')).toBe(true);
  });

  it('formatTemplatePickerLabel shows pack + term + duration + title (CORE-09d)', () => {
    const line = formatTemplatePickerLabel({
      name_vi: 'HĐ IT Office',
      code: 'XEVN_CUSTOM_IT_09',
      template_code: 'XEVN_CUSTOM_IT_09',
      pack_label_vi: 'IT / văn phòng',
      default_term_type: 'definite',
      default_duration_months: 12,
      title_print_vi: 'HỢP ĐỒNG LAO ĐỘNG',
    });
    expect(line).toContain('HĐ IT Office');
    expect(line).toContain('XEVN_CUSTOM_IT_09');
    expect(line).toContain('IT / văn phòng');
    expect(line).toContain('Xác định thời hạn');
    expect(line).toContain('12 tháng');
    expect(line).toContain('HỢP ĐỒNG LAO ĐỘNG');
  });

  it('CFG value builders / parsers for org_suffix + pattern', () => {
    expect(buildOrgSuffixSettingValue(' X.E ')).toEqual({ suffix: 'X.E' });
    expect(parseOrgSuffixValue({ suffix: 'DLX.E' })).toBe('DLX.E');
    expect(parseOrgSuffixValue(null)).toBe('');
    expect(buildNumberPatternSettingValue('')).toEqual({
      pattern: '{seq}/{yyyy}/{docKind}-{orgSuffix}',
    });
    expect(parseNumberPatternValue({ pattern: '{seq}/{yyyy}' })).toBe('{seq}/{yyyy}');
  });
});
