import { GROUP_HOLDING_ROOT_ID, MASTER_TENANT_ID } from '../common/tenant.constants';
import { OrgFoundationService } from './org-foundation.service';
import type { XbosDbService } from '../db/xbos-db.service';

const HOLDING_LE_PRIMARY = '14f0a473-0000-4000-8000-000000000001';
const HOLDING_LE_ALT = '14f0a473-0000-4000-8000-000000000004';
const DU_LICH_LE_ID = '11d2bb7b-6190-4cb4-b0fe-03d43b5596b8';
const QA_W4_UNIT_UNLINKED_ID = 'a1000000-0000-4000-8000-000000000099';
const QA_W4_UNIT_LINKED_ALT_ID = 'a1000000-0000-4000-8000-000000000098';

function flatOrgUnitRows() {
  return [
    {
      id: QA_W4_UNIT_UNLINKED_ID,
      tenant_id: MASTER_TENANT_ID,
      company_id: 'holding',
      code: 'QA-W4-PB-001',
      name: 'QA W4 Dept Tree Audit 20260606',
      org_type: 'department',
      parent_id: null,
      legal_entity_id: null,
      sort_order: 0,
      status: 'active',
      payload: {},
      depth: 0,
      path: [QA_W4_UNIT_UNLINKED_ID],
    },
    {
      id: QA_W4_UNIT_LINKED_ALT_ID,
      tenant_id: MASTER_TENANT_ID,
      company_id: 'holding',
      code: 'QA-W4-PB-003',
      name: 'QA W4 Dept Tree Retest 20260606',
      org_type: 'department',
      parent_id: null,
      legal_entity_id: HOLDING_LE_ALT,
      sort_order: 1,
      status: 'active',
      payload: {},
      depth: 0,
      path: [QA_W4_UNIT_LINKED_ALT_ID],
    },
    {
      id: 'b2000000-0000-4000-8000-000000000001',
      tenant_id: MASTER_TENANT_ID,
      company_id: 'xe-du-lich',
      code: 'xe-du-lich-PHONG-HCNS',
      name: 'Phòng HCNS',
      org_type: 'department',
      parent_id: null,
      legal_entity_id: DU_LICH_LE_ID,
      sort_order: 1,
      status: 'active',
      payload: {},
      depth: 0,
      path: ['b2000000-0000-4000-8000-000000000001'],
    },
  ];
}

function createDeptTreeDbMock() {
  const query = jest.fn(async (sql: string, params?: unknown[]) => {
    const text = String(sql);

    if (
      text.includes('FROM public.xbos_legal_entity le') &&
      text.includes('le.company_id = $2') &&
      !text.includes('JOIN public.xbos_legal_entity le ON')
    ) {
      return {
        rows: [
          { id: HOLDING_LE_PRIMARY, name: 'Tập đoàn XeVN (primary)' },
          { id: HOLDING_LE_ALT, name: 'Tập đoàn XeVN (alt segment)' },
        ],
      };
    }

    if (text.includes('FROM public.xbos_tenant_registry') && text.includes('LIMIT 1')) {
      return { rows: [{ name: 'Tập đoàn XeVN' }] };
    }

    if (text.includes('FROM public.xbos_tenant_registry t') && text.includes('JOIN public.xbos_legal_entity le ON')) {
      return {
        rows: [
          {
            tenant_id: 'xe-du-lich',
            tenant_name: 'Công ty TNHH Du lịch X.E Việt Nam',
            id: DU_LICH_LE_ID,
            name: 'Công ty TNHH Du lịch X.E Việt Nam',
          },
        ],
      };
    }

    if (text.includes('WITH RECURSIVE roots AS') || text.includes('WITH RECURSIVE tree AS')) {
      const legalEntityIds = params?.[0];
      const ids = Array.isArray(legalEntityIds) ? legalEntityIds : [legalEntityIds];
      const holdingSet = new Set([HOLDING_LE_PRIMARY, HOLDING_LE_ALT]);
      const matchesHolding = ids.some((id) => holdingSet.has(String(id)));
      if (matchesHolding || legalEntityIds === null) {
        return {
          rows: flatOrgUnitRows().filter(
            (r) =>
              r.company_id === 'holding' &&
              (r.legal_entity_id === null || holdingSet.has(String(r.legal_entity_id))),
          ),
        };
      }
      if (ids.includes(DU_LICH_LE_ID)) {
        return { rows: flatOrgUnitRows().filter((r) => r.legal_entity_id === DU_LICH_LE_ID) };
      }
      return { rows: [] };
    }

    return { rows: [] };
  });
  return { query } as unknown as XbosDbService;
}

describe('P1-XBOS-W4-DEPT-BE — org-foundation dept tree overview (integration)', () => {
  it('D-W4-DEPT-OVERVIEW-01: listGroupOrgTreesForUser includes holding root + member legal-entity trees', async () => {
    const service = new OrgFoundationService(createDeptTreeDbMock());
    const trees = await service.listGroupOrgTreesForUser('ceo@xe.vn');

    expect(trees.length).toBeGreaterThanOrEqual(2);
    const holding = trees.find((t) => t.tenantId === GROUP_HOLDING_ROOT_ID);
    expect(holding).toBeDefined();
    expect(holding?.tree).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'QA-W4-PB-001', name: 'QA W4 Dept Tree Audit 20260606' }),
      ]),
    );

    const duLich = trees.find((t) => t.tenantId === DU_LICH_LE_ID);
    expect(duLich?.memberTenantId).toBe('xe-du-lich');
    expect(duLich?.tree).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: 'xe-du-lich-PHONG-HCNS' })]),
    );
  });

  it('D-W4-DEPT-LEGAL-MATCH-01: holding tree aggregates ALL holding legal_entity rows (not LIMIT 1)', async () => {
    const db = createDeptTreeDbMock();
    const service = new OrgFoundationService(db);
    const trees = await service.listGroupOrgTreesForUser('ceo@xe.vn');
    const holding = trees.find((t) => t.tenantId === GROUP_HOLDING_ROOT_ID);

    expect(holding?.tree).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'QA-W4-PB-003', name: 'QA W4 Dept Tree Retest 20260606' }),
      ]),
    );

    const recursiveCalls = (db.query as jest.Mock).mock.calls.filter((call) =>
      String(call[0]).includes('WITH RECURSIVE roots AS'),
    );
    expect(recursiveCalls.length).toBeGreaterThan(0);
    const holdingCall = recursiveCalls.find((call) => {
      const ids = call[1]?.[0];
      return Array.isArray(ids) && ids.includes(HOLDING_LE_ALT);
    });
    expect(holdingCall?.[1]?.[0]).toEqual(
      expect.arrayContaining([HOLDING_LE_PRIMARY, HOLDING_LE_ALT]),
    );
  });

  it('D-W4-DEPT-RELOAD-01: holding org units resolve under main+holding partitions after POST', async () => {
    const db = createDeptTreeDbMock();
    const service = new OrgFoundationService(db);
    const trees = await service.listGroupOrgTreesForUser('ceo@xe.vn');
    const holding = trees.find((t) => t.tenantId === GROUP_HOLDING_ROOT_ID);

    expect(holding?.tree?.length).toBeGreaterThan(0);

    const recursiveCalls = (db.query as jest.Mock).mock.calls.filter((call) =>
      String(call[0]).includes('WITH RECURSIVE roots AS'),
    );
    expect(recursiveCalls.length).toBeGreaterThan(0);
    expect(recursiveCalls[0]?.[1]).toEqual(
      expect.arrayContaining([
        expect.arrayContaining([HOLDING_LE_PRIMARY, HOLDING_LE_ALT]),
        MASTER_TENANT_ID,
        expect.arrayContaining(['main', 'holding']),
      ]),
    );
  });

  it('listOrgTree on master tenant delegates to listGroupOrgTreesForUser', async () => {
    const db = createDeptTreeDbMock();
    const service = new OrgFoundationService(db);
    const result = await service.listOrgTree(MASTER_TENANT_ID, 'holding', 'ceo@xe.vn');
    expect(Array.isArray(result)).toBe(true);
    expect((result as { tenantId: string }[])[0]?.tenantId).toBe(GROUP_HOLDING_ROOT_ID);
  });
});
