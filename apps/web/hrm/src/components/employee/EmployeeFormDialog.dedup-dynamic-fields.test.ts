/**
 * D-HRM-FE-EMPLOYEE-FORM-DEDUP-DYNAMIC-FIELDS-01
 * PM audit: docs/qa/evidence/pm-uiux-audit-employee-form-duplicate-fields-01.md
 * Root cause: XBOS sync catalog codes (BASIC_01, PERS_02...) don't match
 * resolveCatalogFormFieldCode's semantic aliases, so a catalog item that is really
 * a re-labelling of a built-in field (e.g. code BASIC_01 / label "Ma NV") used to
 * leak through buildDynamicFields() as a brand-new "custom field" -> duplicate input
 * rendered next to the real built-in field.
 * Fix (Huong A - FE-only, additive, no XBOS/API change): buildDynamicFields() now takes
 * a 3rd param `knownLabels` (built-in labels already rendered in that section) and drops
 * any catalog item whose LABEL normalizes (accent/case-insensitive) to one of them.
 */
import { describe, expect, it } from 'vitest';
import { buildDynamicFields, normalizeFieldLabel } from './EmployeeFormDialog';
import type { HrmSettingsCatalogItem, HrmSettingsCatalogOverviewRow } from '@/integrations/hrmApi';

type BasicKey = 'employee_code' | 'full_name' | 'department' | 'position';

function makeItem(overrides: Partial<HrmSettingsCatalogItem>): HrmSettingsCatalogItem {
  return {
    code: 'CUSTOM_X',
    label: 'Custom field',
    unit: null,
    status: 'active',
    origin: 'xbos',
    ...overrides,
  };
}

function makeCatalog(items: HrmSettingsCatalogItem[]): HrmSettingsCatalogOverviewRow {
  return {
    catalogKey: 'hrm_employee_basic_fields',
    name: null,
    domain: null,
    xbosVersion: 1,
    xbosSyncedAt: null,
    xbosItems: items,
    hrmExtensionItems: [],
    effectiveItems: items,
  };
}

const BASIC_DEFAULTS: BasicKey[] = ['employee_code', 'full_name', 'department', 'position'];

describe('normalizeFieldLabel', () => {
  it('strips Vietnamese diacritics and lowercases', () => {
    expect(normalizeFieldLabel('Mã NV')).toBe('ma nv');
    expect(normalizeFieldLabel('MÃ NV')).toBe('ma nv');
    expect(normalizeFieldLabel('  Mã NV  ')).toBe('ma nv');
  });

  it('normalizes label with no diacritics unchanged (besides case/trim)', () => {
    expect(normalizeFieldLabel('Dan toc')).toBe('dan toc');
  });
});

describe('buildDynamicFields — label-based dedup (D-HRM-FE-EMPLOYEE-FORM-DEDUP-DYNAMIC-FIELDS-01)', () => {
  it('drops a catalog item whose CODE does not match any alias but LABEL duplicates a built-in field label', () => {
    // Real bug: XBOS sync code BASIC_01, label "Mã NV" — duplicates built-in "Mã NV *".
    const catalog = makeCatalog([
      makeItem({ code: 'BASIC_01', label: 'Mã NV' }),
      makeItem({ code: 'BASIC_02', label: 'Họ tên' }),
      makeItem({ code: 'BASIC_03', label: 'Bộ phận' }),
      makeItem({ code: 'BASIC_04', label: 'Chức vụ' }),
    ]);
    const knownLabels = ['Mã NV *', 'Mã NV', 'Họ tên *', 'Họ tên', 'Phòng ban', 'Bộ phận', 'Chức vụ'];

    const result = buildDynamicFields<BasicKey>(catalog, BASIC_DEFAULTS, knownLabels);

    expect(result).toEqual([]);
  });

  it('keeps a catalog item whose label does NOT match any built-in label (e.g. "Dân tộc")', () => {
    const catalog = makeCatalog([
      makeItem({ code: 'PERS_04', label: 'Dân tộc' }),
    ]);
    const knownLabels = ['Ngày sinh', 'Giới tính', 'Số CMND/CCCD'];

    const result = buildDynamicFields(catalog, [] as string[], knownLabels);

    expect(result).toHaveLength(1);
    expect(result[0].code).toBe('PERS_04');
    expect(result[0].label).toBe('Dân tộc');
  });

  it('drops duplicate label even when case/diacritics differ ("MÃ NV" vs "Mã NV")', () => {
    const catalog = makeCatalog([makeItem({ code: 'BASIC_01', label: 'MÃ NV' })]);
    const knownLabels = ['Mã NV'];

    const result = buildDynamicFields<BasicKey>(catalog, BASIC_DEFAULTS, knownLabels);

    expect(result).toEqual([]);
  });

  it('drops duplicate label with extra whitespace ("  Mã NV  ")', () => {
    const catalog = makeCatalog([makeItem({ code: 'BASIC_01', label: '  Mã NV  ' })]);
    const knownLabels = ['Mã NV'];

    const result = buildDynamicFields<BasicKey>(catalog, BASIC_DEFAULTS, knownLabels);

    expect(result).toEqual([]);
  });

  it('mixed catalog: duplicate-label items dropped, non-duplicate custom field kept', () => {
    const catalog = makeCatalog([
      makeItem({ code: 'PERS_01', label: 'Năm sinh' }),
      makeItem({ code: 'PERS_02', label: 'Giới tính' }),
      makeItem({ code: 'PERS_03', label: 'CCCD' }),
      makeItem({ code: 'PERS_04', label: 'Dân tộc' }),
    ]);
    const knownLabels = [
      'Ngày sinh',
      'Năm sinh',
      'Giới tính',
      'Số CMND/CCCD',
      'CCCD',
      'CMND',
      'CCCD/CMND',
    ];

    const result = buildDynamicFields(catalog, [] as string[], knownLabels);
    const codes = result.map((r) => r.code).sort();

    expect(codes).toEqual(['PERS_04']);
    expect(codes).not.toContain('PERS_01');
    expect(codes).not.toContain('PERS_02');
    expect(codes).not.toContain('PERS_03');
  });

  it('dedupes duplicate dynamic labels (two catalog rows both "Dân tộc")', () => {
    const catalog = makeCatalog([
      makeItem({ code: 'ethnicity', label: 'Dân tộc' }),
      makeItem({ code: 'PERS_04', label: 'Dân tộc' }),
      makeItem({ code: 'religion', label: 'Tôn giáo' }),
    ]);
    const result = buildDynamicFields(catalog, [] as string[], []);
    expect(result.map((r) => r.code)).toEqual(['ethnicity', 'religion']);
  });

  it('drops CCCD when id_number spine is active via catalog alias', () => {
    type PersonalKey = 'gender' | 'birth_date' | 'id_number';
    const catalog = makeCatalog([
      makeItem({ code: 'gender', label: 'Giới tính' }),
      makeItem({ code: 'birth_year', label: 'Năm sinh' }),
      makeItem({ code: 'national_id', label: 'CCCD/CMND' }),
      makeItem({ code: 'PERS_03', label: 'CCCD' }),
      makeItem({ code: 'ethnicity', label: 'Dân tộc' }),
      makeItem({ code: 'religion', label: 'Tôn giáo' }),
    ]);
    const defaults: PersonalKey[] = ['gender', 'birth_date', 'id_number'];
    const knownLabels = [
      'Giới tính',
      'Năm sinh',
      'Ngày sinh',
      'CCCD/CMND',
      'CCCD',
      'CMND',
      'Số CMND/CCCD',
    ];
    const result = buildDynamicFields<PersonalKey>(catalog, defaults, knownLabels);
    expect(result.map((r) => r.code).sort()).toEqual(['ethnicity', 'religion']);
  });

  it('XBOS alias BASIC_01 maps to employee_code — excluded even without knownLabels', () => {
    const catalog = makeCatalog([makeItem({ code: 'BASIC_01', label: 'Mã NV' })]);
    const result = buildDynamicFields<BasicKey>(catalog, BASIC_DEFAULTS);
    expect(result).toEqual([]);
  });

  it('unknown code without spine alias still surfaces when knownLabels omitted', () => {
    const catalog = makeCatalog([makeItem({ code: 'CUSTOM_X', label: 'Mã thẻ nội bộ' })]);
    const result = buildDynamicFields<BasicKey>(catalog, BASIC_DEFAULTS);
    expect(result).toHaveLength(1);
    expect(result[0].code).toBe('CUSTOM_X');
  });

  it('inactive items are still excluded regardless of label', () => {
    const catalog = makeCatalog([makeItem({ code: 'BASIC_09', label: 'Ma moi', status: 'draft' })]);
    const result = buildDynamicFields<BasicKey>(catalog, BASIC_DEFAULTS, ['Ma moi']);
    expect(result).toEqual([]);
  });
});
