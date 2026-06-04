import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ASSET_REQUEST_STATUS_FLOW,
  resolveAssetRequestNextStatus,
  listAssetRequests,
  createAssetRequest,
  transitionAssetRequest,
} from './assetRequestApi';

describe('assetRequestApi', () => {
  beforeEach(() => {
    sessionStorage.setItem('xevn.portal.accessToken', 'test.jwt.token');
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url === '/api/xbos/asset-requests' && (!init || init.method === undefined || init.method === 'GET')) {
          return {
            ok: true,
            json: async () => ({
              data: {
                items: [{ id: 'ar-1', request_code: 'AR-001', status: 'pending_finance' }],
              },
            }),
          } as Response;
        }
        if (url === '/api/xbos/asset-requests' && init?.method === 'POST') {
          return {
            ok: true,
            json: async () => ({ data: { id: 'ar-new', request_code: 'AR-NEW', status: 'pending_finance' } }),
          } as Response;
        }
        if (url.includes('/transition') && init?.method === 'POST') {
          return {
            ok: true,
            json: async () => ({ data: { id: 'ar-1', status: 'finance_confirmed' } }),
          } as Response;
        }
        return { ok: false, json: async () => ({ message: 'not found' }) } as Response;
      }),
    );
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.unstubAllGlobals();
  });

  it('lists asset requests with auth headers', async () => {
    const items = await listAssetRequests('main');
    expect(items).toHaveLength(1);
    expect(items[0]?.request_code).toBe('AR-001');
  });

  it('creates asset request', async () => {
    const row = await createAssetRequest({ requestCode: 'AR-NEW' }, 'main');
    expect(row.request_code).toBe('AR-NEW');
  });

  it('transitions to next status in DAG', async () => {
    const row = await transitionAssetRequest('ar-1', 'finance_confirmed', 'main');
    expect(row.status).toBe('finance_confirmed');
  });

  it('resolves next status along 5-step flow', () => {
    expect(resolveAssetRequestNextStatus('pending_finance')).toBe('finance_confirmed');
    expect(resolveAssetRequestNextStatus('completed')).toBeNull();
    expect(ASSET_REQUEST_STATUS_FLOW).toHaveLength(6);
  });
});
