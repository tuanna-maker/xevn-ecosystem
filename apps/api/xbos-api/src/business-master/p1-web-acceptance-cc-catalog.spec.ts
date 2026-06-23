import { BusinessMasterService } from './business-master.service';
import type { XbosDbService } from '../db/xbos-db.service';

/** UF-XBOS-14 — command_center_catalogs row autosave merges into regulations partition */
describe('P1-WEB-ACCEPTANCE-FIX-WAVE-02 UF-XBOS-14 command_center_catalogs', () => {
  const store = new Map<string, { payload: unknown }>();

  const db = {
    query: jest.fn(async (sql: string, params?: unknown[]) => {
      const text = String(sql);
      if (text.includes('CREATE TABLE')) {
        return { rows: [] };
      }
      if (text.includes('INSERT INTO public.xbos_business_master_entries')) {
        const key = `${params?.[0]}|${params?.[1]}|${params?.[2]}|${params?.[3]}`;
        store.set(key, { payload: JSON.parse(String(params?.[4])) });
        return {
          rows: [
            {
              tenant_id: params?.[0],
              company_id: params?.[1],
              domain: params?.[2],
              item_id: params?.[3],
              payload: JSON.parse(String(params?.[4])),
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ],
        };
      }
      if (text.includes('FROM public.xbos_business_master_entries')) {
        const tenantId = params?.[0];
        const companyId = params?.[1];
        const domain = params?.[2];
        const rows = [...store.entries()]
          .filter(([key]) => key.startsWith(`${tenantId}|${companyId}|${domain}|`))
          .map(([key, value]) => {
            const itemId = key.split('|')[3];
            return {
              tenant_id: tenantId,
              company_id: companyId,
              domain,
              item_id: itemId,
              payload: value.payload,
              status: 'active',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
          });
        return { rows };
      }
      return { rows: [] };
    }),
  } as unknown as XbosDbService;

  let service: BusinessMasterService;

  beforeEach(() => {
    store.clear();
    jest.clearAllMocks();
    service = new BusinessMasterService(db);
  });

  it('merges dynamic itemId row into regulations partition on GET list', async () => {
    const itemCode = 'qa-uf14-test';
    await service.upsert('xevn', 'holding', 'command_center_catalogs', itemCode, {
      code: itemCode,
      title: 'QA Catalog UF14',
      category: 'regulations',
      status: 'active',
    });

    const items = await service.list('xevn', 'holding', 'command_center_catalogs');
    const regulations = items.find((row) => row.id === 'regulations');
    expect(regulations).toBeDefined();
    const rows = (regulations as { rows?: Array<{ code?: string }> }).rows ?? [];
    expect(rows.some((row) => row.code === itemCode)).toBe(true);
    const flatRow = items.find((row) => row.id === itemCode || row.code === itemCode);
    expect(flatRow).toBeDefined();
    expect(String(flatRow?.code ?? flatRow?.id)).toBe(itemCode);
  });
});
