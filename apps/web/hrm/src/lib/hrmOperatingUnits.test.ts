import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildOperatingUnitLabelMap,
  fetchHrmOperatingUnits,
  HRM_OPERATING_UNIT_TEST_FIXTURE,
  isHrmOperatingUnitSlug,
  resolveHrmOperatingUnitQueryCompanyId,
  resolveOperatingUnitDisplayName,
} from './hrmOperatingUnits';

describe('hrmOperatingUnits (U39 / G-INT-02)', () => {
  const liveLabels = buildOperatingUnitLabelMap(HRM_OPERATING_UNIT_TEST_FIXTURE);

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps all rollup to main', () => {
    expect(resolveHrmOperatingUnitQueryCompanyId('all')).toBe('main');
    expect(resolveHrmOperatingUnitQueryCompanyId(null)).toBe('main');
  });

  it('preserves holding as single-unit filter slug', () => {
    expect(resolveHrmOperatingUnitQueryCompanyId('holding')).toBe('holding');
  });

  it('preserves member operating slugs', () => {
    expect(resolveHrmOperatingUnitQueryCompanyId('trsport')).toBe('trsport');
    expect(resolveHrmOperatingUnitQueryCompanyId('logistics')).toBe('logistics');
  });

  it('recognizes pilot slugs', () => {
    for (const row of HRM_OPERATING_UNIT_TEST_FIXTURE) {
      expect(isHrmOperatingUnitSlug(row.operating_slug)).toBe(true);
    }
    expect(isHrmOperatingUnitSlug('xevn')).toBe(false);
  });

  it('resolves display labels from live label map only (no static fallback)', () => {
    expect(resolveOperatingUnitDisplayName('trsport', liveLabels)).toContain('Thương mại');
    expect(resolveOperatingUnitDisplayName('trsport')).toBeNull();
    expect(resolveOperatingUnitDisplayName('unknown', liveLabels)).toBeNull();
  });

  it('test fixture uses LE/ĐVTV names — never Khối (AC-EMP-COL-01)', () => {
    for (const row of HRM_OPERATING_UNIT_TEST_FIXTURE) {
      expect(row.display_name_vi).not.toMatch(/^Khối\s+/u);
    }
  });

  it('buildOperatingUnitLabelMap requires explicit units array', () => {
    const map = buildOperatingUnitLabelMap(HRM_OPERATING_UNIT_TEST_FIXTURE);
    expect(map.get('holding')).toBe('Tập đoàn XeVN');
    expect(map.size).toBe(5);
    expect(buildOperatingUnitLabelMap([]).size).toBe(0);
  });

  it('fetchHrmOperatingUnits returns empty array when fetch unavailable', async () => {
    const units = await fetchHrmOperatingUnits();
    expect(Array.isArray(units)).toBe(true);
    expect(units.some((row) => row.display_name_vi.includes('1OFFICE'))).toBe(false);
  });

  it('fetchHrmOperatingUnits parses GET /api/hrm/operating-units envelope', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          success: true,
          data: [
            { operating_slug: 'trsport', display_name_vi: 'Công ty Cổ phần Thương mại và Dịch vụ X.E', rollup_order: 2 },
            { operating_slug: 'holding', display_name_vi: 'Tập đoàn XeVN', rollup_order: 1 },
          ],
        }),
      }),
    );

    const units = await fetchHrmOperatingUnits();
    expect(units).toHaveLength(2);
    expect(units[0]?.operating_slug).toBe('holding');
    expect(units[1]?.operating_slug).toBe('trsport');
    expect(fetch).toHaveBeenCalledWith(
      '/api/hrm/operating-units',
      expect.objectContaining({ method: 'GET' }),
    );
  });
});
