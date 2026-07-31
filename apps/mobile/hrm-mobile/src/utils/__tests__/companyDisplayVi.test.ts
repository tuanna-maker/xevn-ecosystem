import { describe, expect, it } from 'vitest';
import { PLANE_A_COMPANY_LABELS_FALLBACK } from '../../integrations/hrmOperatingUnits';
import {
  buildCompanyDisplayViMap,
  HRM_PLANE_B_HOLDING_UUID,
  isPilotKhoiFictionLabel,
  isRawCompanySlugLabel,
  isValidViLegalCompanyDisplay,
  resolveCompanyDisplayVi,
  resolveOperatingSlugForDisplay,
} from '../companyDisplayVi';

const TRSPORT_PLANE_A = 'Công ty Cổ phần Thương mại và Dịch vụ X.E';
const LOGISTICS_PLANE_A = 'Công ty TNHH Du lịch Visun';
const FINANCE_PLANE_A = 'Công ty TNHH Du lịch X.E Việt Nam';
const SERVICES_PLANE_A = 'Công ty TNHH X.E Việt Nam';

describe('companyDisplayVi', () => {
  it('maps holding and main to Tập đoàn XeVN', () => {
    expect(resolveCompanyDisplayVi('holding')).toBe('Tập đoàn XeVN');
    expect(resolveCompanyDisplayVi('main')).toBe('Tập đoàn XeVN');
  });

  it('maps operating slugs from Plane A fallback (TECHSPEC §19.1)', () => {
    expect(resolveCompanyDisplayVi('trsport')).toBe(TRSPORT_PLANE_A);
    expect(resolveCompanyDisplayVi('logistics')).toBe(LOGISTICS_PLANE_A);
    expect(resolveCompanyDisplayVi('finance')).toBe(FINANCE_PLANE_A);
    expect(resolveCompanyDisplayVi('services')).toBe(SERVICES_PLANE_A);
  });

  it('prefers valid API operating-units rows over Plane A when provided', () => {
    const label = resolveCompanyDisplayVi('trsport', {
      operatingUnits: [
        { operating_slug: 'trsport', display_name_vi: 'Vận tải API', rollup_order: 2 },
      ],
    });
    expect(label).toBe('Vận tải API');
  });

  it('rejects API Khối fiction and uses Plane A fallback', () => {
    const label = resolveCompanyDisplayVi('trsport', {
      operatingUnits: [
        { operating_slug: 'trsport', display_name_vi: 'Khối Vận tải X.E', rollup_order: 2 },
      ],
    });
    expect(label).toBe(TRSPORT_PLANE_A);
    expect(label).not.toMatch(/Khối/);
  });

  it('prefers valid Vietnamese membership display (priority 1)', () => {
    expect(
      resolveCompanyDisplayVi('du-lich', { membershipCompanyDisplay: 'Công ty Du lịch X.E' }),
    ).toBe('Công ty Du lịch X.E');
  });

  it('overrides English membership seed for known slugs', () => {
    expect(
      resolveCompanyDisplayVi('holding', { membershipCompanyDisplay: 'XeVN Holding' }),
    ).toBe('Tập đoàn XeVN');
  });

  it('isRawCompanySlugLabel detects slugs vs Vietnamese labels', () => {
    expect(isRawCompanySlugLabel('holding')).toBe(true);
    expect(isRawCompanySlugLabel('trsport')).toBe(true);
    expect(isRawCompanySlugLabel('du-lich')).toBe(true);
    expect(isRawCompanySlugLabel('XeVN Holding')).toBe(false);
    expect(isRawCompanySlugLabel('Tập đoàn XeVN')).toBe(false);
    expect(isRawCompanySlugLabel('Công ty Du lịch')).toBe(false);
  });

  it('isPilotKhoiFictionLabel detects BA FAIL pattern', () => {
    expect(isPilotKhoiFictionLabel('Khối Logistics X.E')).toBe(true);
    expect(isPilotKhoiFictionLabel(TRSPORT_PLANE_A)).toBe(false);
  });

  it('isValidViLegalCompanyDisplay accepts Plane A legal names', () => {
    expect(isValidViLegalCompanyDisplay(TRSPORT_PLANE_A)).toBe(true);
    expect(isValidViLegalCompanyDisplay('trsport')).toBe(false);
    expect(isValidViLegalCompanyDisplay('Khối Vận tải X.E')).toBe(false);
  });

  it('buildCompanyDisplayViMap includes rollup aliases without Khối', () => {
    const map = buildCompanyDisplayViMap(PLANE_A_COMPANY_LABELS_FALLBACK);
    expect(map.get('holding')).toBe('Tập đoàn XeVN');
    expect(map.get('main')).toBe('Tập đoàn XeVN');
    expect(map.get('logistics')).toBe(LOGISTICS_PLANE_A);
    for (const label of map.values()) {
      expect(label).not.toMatch(/Khối.*X\.E/);
    }
  });

  it('unknown slug without membership → em-dash (BR-EMP-COL-02)', () => {
    expect(resolveCompanyDisplayVi('unknown-slug')).toBe('—');
  });

  it('D-MOB-UUID-BPRIME-FE-01: Plane B′ UUID maps to Vietnamese label', () => {
    expect(resolveOperatingSlugForDisplay(HRM_PLANE_B_HOLDING_UUID)).toBe('holding');
    expect(resolveCompanyDisplayVi(HRM_PLANE_B_HOLDING_UUID)).toBe('Tập đoàn XeVN');
    expect(resolveCompanyDisplayVi('10000000-0000-4000-8000-000000000005')).toBe(SERVICES_PLANE_A);
  });

  it('D-MOB-UUID-BPRIME-FE-01: unknown LE UUID never prints raw UUID', () => {
    const le = '78b8a663-1111-4111-8111-111111111111';
    expect(resolveCompanyDisplayVi(le)).toBe('—');
    expect(resolveCompanyDisplayVi(le)).not.toBe(le);
  });

  it('D-MOB-G-ORPH-KHOI-01: company-semantics resolver never returns Khối fiction', () => {
    const slugs = ['holding', 'trsport', 'logistics', 'finance', 'services', 'main'];
    for (const slug of slugs) {
      const label = resolveCompanyDisplayVi(slug);
      expect(label).not.toMatch(/Khối/i);
    }
  });
});
