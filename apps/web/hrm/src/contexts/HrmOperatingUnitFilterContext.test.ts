import { describe, expect, it } from 'vitest';
import {
  coerceOperatingUnitSelection,
  HRM_OPERATING_UNITS_QUERY_KEY,
  shouldInvalidateQueryOnOuChange,
} from '@/contexts/HrmOperatingUnitFilterContext';
import { HRM_OPERATING_UNIT_TEST_FIXTURE } from '@/lib/hrmOperatingUnits';

describe('coerceOperatingUnitSelection (D-HRM-OU-FILTER-EMBED-01)', () => {
  it('keeps rollup all', () => {
    expect(coerceOperatingUnitSelection('all', HRM_OPERATING_UNIT_TEST_FIXTURE)).toBe('all');
    expect(coerceOperatingUnitSelection('all', [])).toBe('all');
  });

  it('keeps slug present in loaded units', () => {
    expect(coerceOperatingUnitSelection('trsport', HRM_OPERATING_UNIT_TEST_FIXTURE)).toBe(
      'trsport',
    );
  });

  it('coerces stale slug not in loaded units to all', () => {
    expect(coerceOperatingUnitSelection('trsport', [])).toBe('all');
    expect(
      coerceOperatingUnitSelection('trsport', [
        {
          operating_slug: 'holding',
          display_name_vi: 'Tập đoàn XeVN',
          rollup_order: 1,
        },
      ]),
    ).toBe('all');
  });
});

describe('shouldInvalidateQueryOnOuChange (D-HRM-OU-FILTER-EMBED-01)', () => {
  it('excludes hrm-operating-units cache key', () => {
    expect(shouldInvalidateQueryOnOuChange(HRM_OPERATING_UNITS_QUERY_KEY)).toBe(false);
    expect(shouldInvalidateQueryOnOuChange(['hrm-operating-units'])).toBe(false);
  });

  it('invalidates list / unrelated query keys', () => {
    expect(shouldInvalidateQueryOnOuChange(['employees', 'main'])).toBe(true);
    expect(shouldInvalidateQueryOnOuChange(['hrm-dashboard-kpis'])).toBe(true);
  });
});
