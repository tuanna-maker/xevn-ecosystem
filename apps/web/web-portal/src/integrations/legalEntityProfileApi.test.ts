import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GROUP_HOLDING_ROOT_ID } from './tenantScopeApi';
import { resolveShareholderEntityScope, syncShareholders } from './legalEntityProfileApi';

vi.mock('./orgFoundationApi', () => ({
  fetchHoldingLegalEntities: vi.fn(),
}));

import { fetchHoldingLegalEntities } from './orgFoundationApi';

const ENTITY_ID = '68ec4570-0000-4000-8000-000000000001';
const HOLDING_UUID = 'b2c3d4e5-f6a7-4890-b123-456789abcdef';
const TENANT_ID = 'xe-du-lich';
const EXISTING_SHR_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee';

describe('resolveShareholderEntityScope (UF-XBOS-05)', () => {
  const fetchHoldingMock = vi.mocked(fetchHoldingLegalEntities);

  beforeEach(() => {
    fetchHoldingMock.mockReset();
    fetchHoldingMock.mockResolvedValue([]);
  });

  it('passes through member UUID unchanged', async () => {
    const scope = await resolveShareholderEntityScope(ENTITY_ID, TENANT_ID);
    expect(scope).toEqual({ entityId: ENTITY_ID, tenantId: TENANT_ID, companyId: 'main' });
  });

  it('resolves holding UI id to persisted UUID + holding partition', async () => {
    fetchHoldingMock.mockResolvedValueOnce([
      {
        id: HOLDING_UUID,
        tenant_id: 'xevn',
        company_id: 'holding',
        code: 'XEVN',
        name: 'Tap doan',
        entity_type: 'holding',
      },
    ]);
    const scope = await resolveShareholderEntityScope(GROUP_HOLDING_ROOT_ID, 'xevn');
    expect(scope.entityId).toBe(HOLDING_UUID);
    expect(scope.companyId).toBe('holding');
    expect(scope.tenantId).toBe('xevn');
  });

  it('recognizes holding persisted UUID and applies holding partition', async () => {
    fetchHoldingMock.mockResolvedValueOnce([
      {
        id: HOLDING_UUID,
        tenant_id: 'xevn',
        company_id: 'holding',
        code: 'XEVN',
        name: 'Tap doan',
        entity_type: 'holding',
      },
    ]);
    const scope = await resolveShareholderEntityScope(HOLDING_UUID, 'xevn');
    expect(scope.entityId).toBe(HOLDING_UUID);
    expect(scope.companyId).toBe('holding');
    expect(scope.tenantId).toBe('xevn');
  });
});

describe('syncShareholders', () => {  const fetchMock = vi.fn();

  beforeEach(() => {
    sessionStorage.setItem('xevn.portal.accessToken', 'test.jwt.token');
    sessionStorage.setItem('xevn.portal.tokenExpiresAt', String(Date.now() + 3600_000));
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.unstubAllGlobals();
  });

  it('POSTs new rows and PUTs persisted UUID rows; skips empty holderName', async () => {
    fetchMock.mockImplementation(async (_url: string, init?: RequestInit) => {
      const method = init?.method ?? 'GET';
      if (method === 'POST') {
        return {
          ok: true,
          json: async () => ({
            data: {
              id: 'bbbbbbbb-bbbb-4ccc-8ddd-eeeeeeeeeeee',
              holder_name: 'Cổ đông mới',
              identity_code: '123',
              ratio_percent: 10,
              contributed_value: 1000,
            },
          }),
        } as Response;
      }
      if (method === 'PUT') {
        return {
          ok: true,
          json: async () => ({
            data: {
              id: EXISTING_SHR_ID,
              holder_name: 'Cổ đông cũ',
              identity_code: '456',
              ratio_percent: 90,
              contributed_value: 9000,
            },
          }),
        } as Response;
      }
      throw new Error(`unexpected method ${method}`);
    });

    const results = await syncShareholders(ENTITY_ID, TENANT_ID, [
      { id: 'sh-local-1', holderName: 'Cổ đông mới', identityCode: '123', ratioPercent: 10, contributedValue: 1000 },
      { id: EXISTING_SHR_ID, holderName: 'Cổ đông cũ', identityCode: '456', ratioPercent: 90, contributedValue: 9000 },
      { id: 'sh-empty', holderName: '   ', ratioPercent: 0, contributedValue: 0 },
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toContain(`/legal-entities/${ENTITY_ID}/shareholders`);
    expect(fetchMock.mock.calls[0][1]?.method).toBe('POST');
    expect(fetchMock.mock.calls[1][0]).toContain(`/shareholders/${EXISTING_SHR_ID}`);
    expect(fetchMock.mock.calls[1][1]?.method).toBe('PUT');
    expect(results).toHaveLength(2);
    expect(results[0].holder_name).toBe('Cổ đông mới');
    expect(results[1].id).toBe(EXISTING_SHR_ID);
  });

  it('POSTs via holding persisted UUID path (not raw UI id in URL)', async () => {
    const fetchHoldingMock = vi.mocked(fetchHoldingLegalEntities);
    fetchHoldingMock.mockResolvedValueOnce([
      {
        id: HOLDING_UUID,
        tenant_id: 'xevn',
        company_id: 'holding',
        code: 'XEVN',
        name: 'Tap doan',
        entity_type: 'holding',
      },
    ]);

    fetchMock.mockImplementation(async (url: string, init?: RequestInit) => {
      expect(url).toContain(`/legal-entities/${HOLDING_UUID}/shareholders`);
      expect(url).not.toContain(GROUP_HOLDING_ROOT_ID);
      expect(init?.method).toBe('POST');
      return {
        ok: true,
        json: async () => ({
          data: {
            id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
            holder_name: 'Co dong tap doan',
          },
        }),
      } as Response;
    });

    await syncShareholders(HOLDING_UUID, 'xevn', [
      { id: 'sh-local', holderName: 'Co dong tap doan', ratioPercent: 100, contributedValue: 1_000_000 },
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1]?.method).toBe('POST');
  });
});
