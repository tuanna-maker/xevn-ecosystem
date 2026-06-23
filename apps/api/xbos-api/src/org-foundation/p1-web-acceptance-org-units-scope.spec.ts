import { MASTER_TENANT_ID, MEMBER_DEFAULT_COMPANY_ID } from '../common/tenant.constants';
import { OrgFoundationService } from './org-foundation.service';
import type { XbosDbService } from '../db/xbos-db.service';

const DU_LICH_LE_ID = '11d2bb7b-6190-4cb4-b0fe-03d43b5596b8';

/** UF-XBOS-12 — member legal-entity org-unit persist + GET tree parity */
describe('P1-WEB-ACCEPTANCE-BE-FIX-01 UF-XBOS-12 org-units scope', () => {
  const insertCalls: Array<{ sql: string; params: unknown[] }> = [];

  const db = {
    query: jest.fn(async (sql: string, params?: unknown[]) => {
      const text = String(sql);
      if (text.includes('SELECT tenant_id, company_id FROM public.xbos_legal_entity')) {
        return { rows: [{ tenant_id: 'xe-du-lich', company_id: MEMBER_DEFAULT_COMPANY_ID }] };
      }
      if (text.includes('INSERT INTO public.xbos_org_unit')) {
        insertCalls.push({ sql: text, params: params ?? [] });
        return {
          rows: [
            {
              id: 'fbffb6bb-1e7e-4d46-b91c-e64975474e4d',
              tenant_id: params?.[0],
              company_id: params?.[1],
              code: params?.[2],
              legal_entity_id: params?.[6],
            },
          ],
        };
      }
      if (text.includes('WITH RECURSIVE roots AS')) {
        return {
          rows: [
            {
              id: 'fbffb6bb-1e7e-4d46-b91c-e64975474e4d',
              code: 'QA-UF12-001',
              name: 'Phòng QA UF12',
              parent_id: null,
              legal_entity_id: DU_LICH_LE_ID,
              tenant_id: 'xe-du-lich',
              company_id: MEMBER_DEFAULT_COMPANY_ID,
              depth: 0,
              path: ['fbffb6bb-1e7e-4d46-b91c-e64975474e4d'],
            },
          ],
        };
      }
      return { rows: [] };
    }),
  } as unknown as XbosDbService;

  let service: OrgFoundationService;

  beforeEach(() => {
    insertCalls.length = 0;
    jest.clearAllMocks();
    service = new OrgFoundationService(db);
  });

  it('resolveOrgUnitPersistScope maps member legal entity to member tenant + main', async () => {
    const scope = await service.resolveOrgUnitPersistScope(MASTER_TENANT_ID, 'holding', DU_LICH_LE_ID);
    expect(scope).toEqual({ tenantId: 'xe-du-lich', companyId: MEMBER_DEFAULT_COMPANY_ID });
  });

  it('upsertOrgUnit INSERT uses member partition when legalEntityId is member UUID', async () => {
    await service.upsertOrgUnit(MASTER_TENANT_ID, 'holding', null, {
      code: 'QA-UF12-001',
      name: 'Phòng QA UF12',
      orgType: 'department',
      legalEntityId: DU_LICH_LE_ID,
    });

    expect(insertCalls).toHaveLength(1);
    expect(insertCalls[0].params?.[0]).toBe('xe-du-lich');
    expect(insertCalls[0].params?.[1]).toBe(MEMBER_DEFAULT_COMPANY_ID);
  });

  it('listOrgTreeForLegalEntity returns created unit for F5 reload', async () => {
    const tree = await service.listOrgTreeForLegalEntity(DU_LICH_LE_ID);
    expect(tree).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'QA-UF12-001', legal_entity_id: DU_LICH_LE_ID }),
      ]),
    );
  });
});
