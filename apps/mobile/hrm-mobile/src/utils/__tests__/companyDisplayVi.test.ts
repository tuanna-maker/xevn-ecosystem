import { describe, expect, it } from 'vitest';
import { PILOT_HRM_OPERATING_UNITS } from '../../integrations/hrmOperatingUnits';
import {
  buildCompanyDisplayViMap,
  isRawCompanySlugLabel,
  resolveCompanyDisplayVi,
} from '../companyDisplayVi';

describe('companyDisplayVi', () => {
  it('maps holding and main to Tập đoàn XeVN', () => {
    expect(resolveCompanyDisplayVi('holding')).toBe('Tập đoàn XeVN');
    expect(resolveCompanyDisplayVi('main')).toBe('Tập đoàn XeVN');
  });

  it('maps operating slugs from pilot registry', () => {
    expect(resolveCompanyDisplayVi('trsport')).toBe('Khối Vận tải X.E');
    expect(resolveCompanyDisplayVi('logistics')).toBe('Khối Logistics X.E');
    expect(resolveCompanyDisplayVi('finance')).toBe('Khối Tài chính X.E');
    expect(resolveCompanyDisplayVi('services')).toBe('Khối Dịch vụ X.E');
  });

  it('prefers API operating-units rows over pilot when provided', () => {
    const label = resolveCompanyDisplayVi('trsport', {
      operatingUnits: [
        { operating_slug: 'trsport', display_name_vi: 'Vận tải API', rollup_order: 2 },
      ],
    });
    expect(label).toBe('Vận tải API');
  });

  it('overrides English membership seed for known slugs', () => {
    expect(
      resolveCompanyDisplayVi('holding', { membershipCompanyDisplay: 'XeVN Holding' }),
    ).toBe('Tập đoàn XeVN');
  });

  it('uses Vietnamese membership display for member legal entities', () => {
    expect(
      resolveCompanyDisplayVi('du-lich', { membershipCompanyDisplay: 'Công ty Du lịch X.E' }),
    ).toBe('Công ty Du lịch X.E');
  });

  it('isRawCompanySlugLabel detects slugs vs Vietnamese labels', () => {
    expect(isRawCompanySlugLabel('holding')).toBe(true);
    expect(isRawCompanySlugLabel('trsport')).toBe(true);
    expect(isRawCompanySlugLabel('du-lich')).toBe(true);
    expect(isRawCompanySlugLabel('XeVN Holding')).toBe(false);
    expect(isRawCompanySlugLabel('Tập đoàn XeVN')).toBe(false);
    expect(isRawCompanySlugLabel('Công ty Du lịch')).toBe(false);
  });

  it('buildCompanyDisplayViMap includes rollup aliases', () => {
    const map = buildCompanyDisplayViMap(PILOT_HRM_OPERATING_UNITS);
    expect(map.get('holding')).toBe('Tập đoàn XeVN');
    expect(map.get('main')).toBe('Tập đoàn XeVN');
    expect(map.get('logistics')).toBe('Khối Logistics X.E');
  });

  it('falls back when slug unknown and membership empty', () => {
    expect(resolveCompanyDisplayVi('unknown-slug')).toBe('Chưa chọn công ty');
  });
});
