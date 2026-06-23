import { signServiceJwt } from '../common/jwt-sign';
import { HRM_GROUP_MEMBER_COMPANY_SLUGS } from '../common/hrm-list-scope';
import { HRM_OPERATING_UNIT_DEFAULT_DISPLAY_NAMES } from './hrm-operating-unit-registry';
import { OperatingUnitsService } from './operating-units.service';
import { HrmDbService } from '../db/hrm-db.service';

const GROUP_CEO_TOKEN = () =>
  signServiceJwt({
    sub: 'ceo@xe.vn',
    tenantId: 'xevn',
    companyId: 'main',
    roleCode: 'group_ceo',
  });

const MEMBER_CEO_TOKEN = () =>
  signServiceJwt({
    sub: 'du-lich.ceo@xe.vn',
    tenantId: 'xe-du-lich',
    companyId: 'main',
    roleCode: 'member_ceo',
  });

describe('OperatingUnitsService', () => {
  const query = jest.fn();
  const service = new OperatingUnitsService({ query } as unknown as HrmDbService);

  beforeEach(() => {
    query.mockReset();
    query.mockResolvedValue({ rows: [] });
  });

  it('group CEO on main returns all 5 GROUP_MEMBER_SLUGS with BA-D-01 display names (P1-PROD-INT-BE-04)', async () => {
    query.mockImplementation(async (sql: string) => {
      if (typeof sql === 'string' && sql.includes('FROM public.company_slug_map')) {
        return {
          rows: HRM_GROUP_MEMBER_COMPANY_SLUGS.map((slug) => ({
            company_slug: slug,
            display_name: HRM_OPERATING_UNIT_DEFAULT_DISPLAY_NAMES[slug],
          })),
        };
      }
      return { rows: [] };
    });

    const rows = await service.listOperatingUnits(`Bearer ${GROUP_CEO_TOKEN()}`, { tenantId: 'xevn' });
    expect(rows).toHaveLength(5);
    expect(rows.map((r) => r.operating_slug)).toEqual([...HRM_GROUP_MEMBER_COMPANY_SLUGS]);
    expect(rows[0]).toMatchObject({
      operating_slug: 'holding',
      display_name_vi: 'Tập đoàn XeVN',
      rollup_order: 1,
    });
    expect(rows[4]).toMatchObject({
      operating_slug: 'services',
      display_name_vi: 'Khối Dịch vụ X.E',
      rollup_order: 5,
    });
  });

  it('member CEO sees empty partition (no GROUP_MEMBER rollup slugs)', async () => {
    const rows = await service.listOperatingUnits(`Bearer ${MEMBER_CEO_TOKEN()}`, {
      tenantId: 'xe-du-lich',
    });
    expect(rows).toEqual([]);
    const selectCall = query.mock.calls.find(([sql]) =>
      String(sql).includes('FROM public.company_slug_map'),
    );
    expect(selectCall).toBeUndefined();
  });

  it('falls back to seed defaults when company_slug_map.display_name is blank', async () => {
    query.mockImplementation(async (sql: string) => {
      if (typeof sql === 'string' && sql.includes('FROM public.company_slug_map')) {
        return {
          rows: [{ company_slug: 'holding', display_name: '  ' }],
        };
      }
      return { rows: [] };
    });

    const rows = await service.listOperatingUnits(`Bearer ${GROUP_CEO_TOKEN()}`, { tenantId: 'xevn' });
    const holding = rows.find((r) => r.operating_slug === 'holding');
    expect(holding?.display_name_vi).toBe('Tập đoàn XeVN');
  });

  it('seeds company_slug_map display_name rows on first call', async () => {
    await service.listOperatingUnits(`Bearer ${GROUP_CEO_TOKEN()}`, { tenantId: 'xevn' });
    const alterCall = query.mock.calls.find(([sql]) =>
      String(sql).includes('ADD COLUMN IF NOT EXISTS display_name'),
    );
    expect(alterCall).toBeDefined();
    const upsertCalls = query.mock.calls.filter(([sql]) =>
      String(sql).includes('INSERT INTO public.company_slug_map'),
    );
    expect(upsertCalls.length).toBe(5);
  });
});
