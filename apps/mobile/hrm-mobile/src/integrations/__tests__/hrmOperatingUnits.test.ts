import { describe, expect, it } from 'vitest';
import {
  isPilotKhoiFictionLabel,
  normalizeOperatingUnitRows,
  PILOT_HRM_OPERATING_UNITS,
  PLANE_A_COMPANY_LABELS_FALLBACK,
  sanitizeOperatingUnitDisplayLabel,
  sortOperatingUnits,
} from '../hrmOperatingUnits';
import {
  isGroupCeoMasterTenant,
  isHrmOperatingUnitSlug,
  readOperatingUnitFilterSelection,
  resolveHrmOperatingUnitQueryCompanyId,
} from '../hrmListScope';

describe('hrmListScope U39 parity', () => {
  it('group CEO master tenant is xevn', () => {
    expect(isGroupCeoMasterTenant('xevn')).toBe(true);
    expect(isGroupCeoMasterTenant('xe-du-lich')).toBe(false);
  });

  it('resolveHrmOperatingUnitQueryCompanyId maps all to main rollup', () => {
    expect(resolveHrmOperatingUnitQueryCompanyId('all')).toBe('main');
    expect(resolveHrmOperatingUnitQueryCompanyId(null)).toBe('main');
  });

  it('preserves operating slugs for list query (BR-INT-03)', () => {
    expect(resolveHrmOperatingUnitQueryCompanyId('holding')).toBe('holding');
    expect(resolveHrmOperatingUnitQueryCompanyId('logistics')).toBe('logistics');
    expect(resolveHrmOperatingUnitQueryCompanyId('trsport')).toBe('trsport');
  });

  it('readOperatingUnitFilterSelection round-trips companyId', () => {
    expect(readOperatingUnitFilterSelection('main')).toBe('all');
    expect(readOperatingUnitFilterSelection('holding')).toBe('holding');
    expect(readOperatingUnitFilterSelection('finance')).toBe('finance');
  });

  it('recognizes five GROUP_MEMBER_SLUGS from pcomp-w3-qa-04 probe', () => {
    for (const slug of ['holding', 'trsport', 'logistics', 'finance', 'services']) {
      expect(isHrmOperatingUnitSlug(slug)).toBe(true);
    }
    expect(isHrmOperatingUnitSlug('main')).toBe(false);
    expect(isHrmOperatingUnitSlug('xevn')).toBe(false);
  });
});

describe('hrmOperatingUnits registry', () => {
  it('Plane A fallback has 5 TECHSPEC §19.1 labels (no Khối fiction)', () => {
    expect(PLANE_A_COMPANY_LABELS_FALLBACK).toHaveLength(5);
    expect(PILOT_HRM_OPERATING_UNITS).toBe(PLANE_A_COMPANY_LABELS_FALLBACK);
    expect(PILOT_HRM_OPERATING_UNITS[0].display_name_vi).toBe('Tập đoàn XeVN');
    expect(
      PILOT_HRM_OPERATING_UNITS.find((r) => r.operating_slug === 'services')?.display_name_vi,
    ).toBe('Công ty TNHH X.E Việt Nam');
    for (const row of PLANE_A_COMPANY_LABELS_FALLBACK) {
      expect(row.display_name_vi).not.toMatch(/Khối/i);
    }
  });

  it('sanitizeOperatingUnitDisplayLabel replaces Khối from API', () => {
    expect(isPilotKhoiFictionLabel('Khối Dịch vụ X.E')).toBe(true);
    expect(sanitizeOperatingUnitDisplayLabel('services', 'Khối Dịch vụ X.E')).toBe(
      'Công ty TNHH X.E Việt Nam',
    );
  });

  it('normalizeOperatingUnitRows sorts by rollup_order and sanitizes labels', () => {
    const rows = normalizeOperatingUnitRows([
      { operating_slug: 'services', display_name_vi: 'Khối Dịch vụ X.E', rollup_order: 5 },
      { operating_slug: 'holding', display_name_vi: 'Tập đoàn XeVN', rollup_order: 1 },
    ]);
    expect(rows[0].operating_slug).toBe('holding');
    expect(rows[1].operating_slug).toBe('services');
    expect(rows[1].display_name_vi).toBe('Công ty TNHH X.E Việt Nam');
  });

  it('sortOperatingUnits orders ascending', () => {
    const sorted = sortOperatingUnits([
      { operating_slug: 'finance', display_name_vi: 'F', rollup_order: 4 },
      { operating_slug: 'holding', display_name_vi: 'H', rollup_order: 1 },
    ]);
    expect(sorted[0].operating_slug).toBe('holding');
  });

  it('drops invalid slugs from API payload', () => {
    const rows = normalizeOperatingUnitRows([
      { operating_slug: 'xevn', display_name_vi: 'Bad', rollup_order: 1 },
      { operating_slug: 'logistics', display_name_vi: 'Khối Logistics X.E', rollup_order: 3 },
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0].operating_slug).toBe('logistics');
    expect(rows[0].display_name_vi).toBe('Công ty TNHH Du lịch Visun');
  });
});
