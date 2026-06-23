import { describe, expect, it } from 'vitest';
import { mapGroupMemberUnitsToHrmCompanies } from '@/integrations/tenantScopeApi';

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
});
