import { ApiException } from '../common/api.exception';
import { XbosDbService } from '../db/xbos-db.service';
import { AssetRequestService } from './asset-request.service';

describe('AssetRequestService (UC-XBOS-16)', () => {
  let service: AssetRequestService;
  let db: jest.Mocked<XbosDbService>;

  beforeEach(() => {
    db = { query: jest.fn() } as unknown as jest.Mocked<XbosDbService>;
    service = new AssetRequestService(db);
  });

  it('UC-XBOS-16: walks 5-step accounting transition chain', async () => {
    let status = 'draft';
    db.query.mockImplementation(async (sql: string, params?: unknown[]) => {
      if (sql.includes('INSERT INTO public.xbos_asset_request')) {
        status = 'draft';
        return { rows: [{ id: 'req-1', status, request_code: 'AR-1' }] } as never;
      }
      if (sql.includes('SELECT * FROM public.xbos_asset_request WHERE id')) {
        return { rows: [{ id: 'req-1', status }] } as never;
      }
      if (sql.includes('UPDATE public.xbos_asset_request SET status')) {
        status = String(params?.[3] ?? params?.[0]);
        return { rows: [{ id: 'req-1', status }] } as never;
      }
      return { rows: [] } as never;
    });

    const created = await service.create('xevn', 'vtc', { requestCode: 'AR-1' });
    expect(created.status).toBe('draft');

    const steps = ['pending_finance', 'finance_confirmed', 'recorded', 'assigned', 'completed'] as const;
    for (const next of steps) {
      const row = await service.transition('xevn', 'vtc', 'req-1', next, 'ceo@xe.vn');
      expect(row.status).toBe(next);
    }
  });

  it('BR-AR-01: rejects invalid transition with ASSET-REQ-409', async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ id: 'req-1', status: 'pending_finance' }],
    } as never);

    await expect(
      service.transition('xevn', 'vtc', 'req-1', 'recorded', 'ceo@xe.vn'),
    ).rejects.toMatchObject<ApiException>({ code: 'ASSET-REQ-409' });
  });
});
