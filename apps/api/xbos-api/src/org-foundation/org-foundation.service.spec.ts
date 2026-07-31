import { ApiException } from '../common/api.exception';
import { OrgFoundationService } from './org-foundation.service';
import type { XbosDbService } from '../db/xbos-db.service';

const MEMBER_ENTITY_ID = '11d2bb7b-6190-4cb4-b0fe-03d43b5596b8';

function createDbMock(handlers: {
  partition?: { tenant_id: string; company_id: string } | null;
  updateRow?: Record<string, unknown>;
}) {
  const query = jest.fn(async (sql: string, params?: unknown[]) => {
    const text = String(sql);
    if (text.includes('SELECT tenant_id, company_id') && text.includes('xbos_legal_entity')) {
      if (!handlers.partition) return { rows: [] };
      return {
        rows: [
          {
            tenant_id: handlers.partition.tenant_id,
            company_id: handlers.partition.company_id,
          },
        ],
      };
    }
    if (text.includes('UPDATE public.xbos_legal_entity')) {
      if (!handlers.updateRow) return { rows: [] };
      return { rows: [handlers.updateRow] };
    }
    if (text.includes('INSERT INTO public.xbos_legal_entity')) {
      return { rows: [{ id: 'new-le-id', code: 'NEW', name: 'New LE' }] };
    }
    return { rows: [] };
  });
  return { query } as unknown as XbosDbService;
}

describe('OrgFoundationService — legal entity upsert (UC-CC-03)', () => {
  const body = {
    code: 'XE_DU_LICH',
    name: 'Công ty Du lịch XeVN',
    entityType: 'subsidiary',
    taxCode: '0123456789',
    charterCapital: 1_000_000_000,
    payload: { companyForm: { shortName: 'XE_DL' } },
  };

  it('updates member legal entity using DB partition (not request headers)', async () => {
    const db = createDbMock({
      partition: { tenant_id: 'xe-du-lich', company_id: 'xe-du-lich' },
      updateRow: {
        id: MEMBER_ENTITY_ID,
        tenant_id: 'xe-du-lich',
        company_id: 'xe-du-lich',
        code: body.code,
        name: body.name,
      },
    });
    const service = new OrgFoundationService(db);

    const row = await service.upsertLegalEntity('xe-du-lich', 'main', MEMBER_ENTITY_ID, body);

    expect(row.id).toBe(MEMBER_ENTITY_ID);
    const updateCall = (db.query as jest.Mock).mock.calls.find((c) =>
      String(c[0]).includes('UPDATE public.xbos_legal_entity'),
    );
    expect(updateCall).toBeDefined();
    expect(updateCall![1]).toEqual(
      expect.arrayContaining([MEMBER_ENTITY_ID, 'xe-du-lich', 'xe-du-lich']),
    );
  });

  it('returns 404 when entity UUID not in DB', async () => {
    const db = createDbMock({ partition: null });
    const service = new OrgFoundationService(db);

    await expect(
      service.upsertLegalEntity('xe-du-lich', 'main', MEMBER_ENTITY_ID, body),
    ).rejects.toMatchObject({
      code: 'XBOS-ORG-404',
    });
  });

  it('returns 404 when UPDATE matches zero rows (partition drift)', async () => {
    const db = createDbMock({
      partition: { tenant_id: 'xe-du-lich', company_id: 'xe-du-lich' },
      updateRow: undefined,
    });
    const service = new OrgFoundationService(db);

    await expect(
      service.upsertLegalEntity('xe-du-lich', 'main', MEMBER_ENTITY_ID, body),
    ).rejects.toMatchObject({ code: 'XBOS-ORG-404' });
  });

  it('rejects invalid tax code on update', async () => {
    const db = createDbMock({
      partition: { tenant_id: 'xevn', company_id: 'holding' },
    });
    const service = new OrgFoundationService(db);

    await expect(
      service.upsertLegalEntity('xevn', 'holding', MEMBER_ENTITY_ID, {
        ...body,
        taxCode: 'bad',
      }),
    ).rejects.toMatchObject({ code: 'XBOS-ORG-400' });
  });
});

describe('OrgFoundationService — group member units industry contract (UC-HRM-CO-01)', () => {
  it('includes business_lines in members payload so FE does not infer industry from entity_type', async () => {
    const db = {
      query: jest
        .fn()
        .mockResolvedValueOnce({
          rows: [{ tenant_id: 'xevn', name: 'Tập đoàn XeVN', short_name: 'XeVN' }],
        })
        .mockResolvedValueOnce({
          rows: [
            {
              tenant_id: 'xe-du-lich',
              tenant_name: 'XeVN Du lịch',
              tenant_short_name: 'Du lịch',
              id: MEMBER_ENTITY_ID,
              code: 'XE_DULICH',
              name: 'Công ty Du lịch XeVN',
              business_lines: 'tourism',
              entity_type: 'subsidiary',
              payload: { companyForm: { industry: 'Du lịch lữ hành' } },
            },
          ],
        }),
    } as unknown as XbosDbService;
    const service = new OrgFoundationService(db);

    const result = await service.listGroupMemberUnits();

    expect(result.holding).toEqual({ tenant_id: 'xevn', name: 'Tập đoàn XeVN', short_name: 'XeVN' });
    expect(result.members).toEqual([
      expect.objectContaining({
        tenant_id: 'xe-du-lich',
        id: MEMBER_ENTITY_ID,
        business_lines: 'tourism',
        entity_type: 'subsidiary',
      }),
    ]);
    const membersQuery = (db.query as jest.Mock).mock.calls[1];
    expect(String(membersQuery?.[0])).toContain('le.business_lines');
  });
});
