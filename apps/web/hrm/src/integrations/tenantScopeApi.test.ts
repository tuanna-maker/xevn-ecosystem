import { describe, expect, it } from 'vitest';
import {
  enrichHrmCompaniesWithLegalProfiles,
  extractIndustryFromLegalSources,
  mapGroupMemberUnitsToHrmCompanies,
  resolveIndustryDisplay,
} from '@/integrations/tenantScopeApi';

describe('tenantScopeApi', () => {
  it('maps group-member-units to HRM company rows (D-HRM-COMPANY-EMPTY-01)', () => {
    const rows = mapGroupMemberUnitsToHrmCompanies({
      holding: { tenant_id: 'xevn', name: 'Tập đoàn XeVN', short_name: 'XeVN' },
      members: [
        {
          tenant_id: 'xe-du-lich',
          tenant_name: 'Du lịch XeVN',
          tenant_short_name: 'DL',
          id: 'a7d2dbec-75d7-4b2e-8c75-c53cd14f22aa',
          code: 'DL',
          name: 'Công ty Du lịch XeVN',
          entity_type: 'subsidiary',
          payload: null,
        },
      ],
    });
    expect(rows).toHaveLength(2);
    expect(rows[0]?.name).toBe('Tập đoàn XeVN');
    expect(rows[1]?.code).toBe('DL');
  });

  it('keeps employee_count null from XBOS mapper (D-HRM-CO-EMP-COUNT-FE-01)', () => {
    const rows = mapGroupMemberUnitsToHrmCompanies({
      holding: { tenant_id: 'xevn', name: 'Tập đoàn XeVN', short_name: 'XeVN' },
      members: [
        {
          tenant_id: 'xe-du-lich',
          tenant_name: 'Du lịch',
          tenant_short_name: 'DL',
          id: 'a7d2dbec-75d7-4b2e-8c75-c53cd14f22aa',
          code: 'DL',
          name: 'Công ty TNHH Du lịch Visun',
          entity_type: 'subsidiary',
          payload: null,
        },
      ],
    });
    expect(rows.every((r) => r.employee_count === null)).toBe(true);
  });

  it('does not map entity_type into industry (D-HRM-CO-INDUSTRY-FE-01)', () => {
    const rows = mapGroupMemberUnitsToHrmCompanies({
      holding: { tenant_id: 'xevn', name: 'Tập đoàn XeVN', short_name: 'XeVN' },
      members: [
        {
          tenant_id: 'xe-du-lich',
          tenant_name: 'Du lịch',
          tenant_short_name: 'DL',
          id: 'a7d2dbec-75d7-4b2e-8c75-c53cd14f22aa',
          code: 'DL',
          name: 'Công ty TNHH Du lịch Visun',
          entity_type: 'subsidiary',
          payload: null,
        },
      ],
    });
    const member = rows.find((r) => r.code === 'DL');
    expect(member?.industry).toBeNull();
    expect(member?.industry).not.toBe('subsidiary');
    expect(member?.industry).not.toBe('holding');
  });

  it('maps business_lines human text to industry (D-HRM-CO-INDUSTRY-FE-01)', () => {
    const rows = mapGroupMemberUnitsToHrmCompanies({
      holding: null,
      members: [
        {
          tenant_id: 'xe-du-lich',
          tenant_name: 'Du lịch',
          tenant_short_name: 'DL',
          id: 'a7d2dbec-75d7-4b2e-8c75-c53cd14f22aa',
          code: 'DL',
          name: 'Công ty TNHH Du lịch Visun',
          entity_type: 'subsidiary',
          business_lines: 'Du lịch lữ hành quốc tế',
          payload: null,
        },
      ],
    });
    expect(rows[0]?.industry).toBe('Du lịch lữ hành quốc tế');
  });

  it('maps business_lines catalog key to VI industries.* label (D-HRM-CO-INDUSTRY-FE-01)', () => {
    const rows = mapGroupMemberUnitsToHrmCompanies({
      holding: null,
      members: [
        {
          tenant_id: 'trsport',
          tenant_name: 'Vận tải',
          tenant_short_name: 'VT',
          id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
          code: 'VT',
          name: 'Công ty Vận tải',
          entity_type: 'subsidiary',
          business_lines: 'tourism',
          payload: null,
        },
      ],
    });
    expect(rows[0]?.industry).toBe('Du lịch - Khách sạn');
    expect(resolveIndustryDisplay('logistics')).toBe('Vận tải - Logistics');
  });

  it('maps companyForm.industry when business_lines empty (D-HRM-CO-INDUSTRY-FE-01)', () => {
    expect(
      extractIndustryFromLegalSources({
        business_lines: null,
        payload: { companyForm: { industry: 'logistics' } },
      }),
    ).toBe('Vận tải - Logistics');
  });

  it('enrich legal profile business_lines overrides null industry (D-HRM-CO-INDUSTRY-FE-01)', () => {
    const base = mapGroupMemberUnitsToHrmCompanies({
      holding: null,
      members: [
        {
          tenant_id: 'xe-du-lich',
          tenant_name: 'Du lịch',
          tenant_short_name: 'DL',
          id: 'a7d2dbec-75d7-4b2e-8c75-c53cd14f22aa',
          code: 'DL',
          name: 'Công ty TNHH Du lịch Visun',
          entity_type: 'subsidiary',
          payload: null,
        },
      ],
    });
    expect(base[0]?.industry).toBeNull();

    const enriched = enrichHrmCompaniesWithLegalProfiles(base, {
      memberEntities: [
        {
          id: 'a7d2dbec-75d7-4b2e-8c75-c53cd14f22aa',
          tenant_id: 'xe-du-lich',
          entity_type: 'subsidiary',
          business_lines: 'tourism',
          payload: null,
        },
      ],
    });
    expect(enriched[0]?.industry).toBe('Du lịch - Khách sạn');
  });

  it('resolveIndustryDisplay never returns entity_type keys', () => {
    expect(resolveIndustryDisplay('subsidiary')).toBeNull();
    expect(resolveIndustryDisplay('holding')).toBeNull();
    expect(resolveIndustryDisplay('')).toBeNull();
    expect(resolveIndustryDisplay(null)).toBeNull();
  });
});
