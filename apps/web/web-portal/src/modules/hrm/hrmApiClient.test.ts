import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { listEmployeeMetadataQueue, listHrmInsurance } from './hrmApiClient';
import { HrmApiClientError } from './hrmApiErrors';

const scope = { tenantId: 't-unit', companyId: 'c-unit' };

describe('hrmApiClient (fetch mocks)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              success: true,
              code: 'OK',
              message: 'ok',
              data: { total: 0, data: [] },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } },
          ),
        ),
      ),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns envelope data on success', async () => {
    const result = await listEmployeeMetadataQueue(scope);
    expect(result).toEqual({ total: 0, data: [] });
    expect(fetch).toHaveBeenCalled();
    const callUrl = String(vi.mocked(fetch).mock.calls[0]?.[0]);
    expect(callUrl).toContain('/api/hrm/employee-metadata/change-requests');
    expect(callUrl).toContain('company_id=main');
  });

  it('listHrmEmployees uses main when scope hint is holding (EX-SA01-P1-03)', async () => {
    const { listHrmEmployees } = await import('./hrmApiClient');
    await listHrmEmployees({ tenantId: 'xevn', companyId: 'holding' });
    const callUrl = String(vi.mocked(fetch).mock.calls[0]?.[0]);
    expect(callUrl).toContain('company_id=main');
    expect(callUrl).not.toContain('company_id=holding');
  });

  it('listHrmInsurance calls contracts-insurance insurance endpoint (BR-INS-01)', async () => {
    await listHrmInsurance(scope);
    const callUrl = String(vi.mocked(fetch).mock.calls[0]?.[0]);
    expect(callUrl).toContain('/api/hrm/contracts-insurance/insurance');
    expect(callUrl).toContain('company_id=main');
  });

  it('throws HrmApiClientError with backend code on HTTP error', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: false,
          code: 'HRM-ATT-FORBIDDEN',
          message: 'Not allowed',
          details: { scope: 'unit' },
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    await expect(listEmployeeMetadataQueue(scope)).rejects.toMatchObject({
      code: 'HRM-ATT-FORBIDDEN',
      status: 403,
      details: { scope: 'unit' },
    });
  });

  it('throws NETWORK_ERROR when fetch rejects', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError('network'));
    await expect(listEmployeeMetadataQueue(scope)).rejects.toMatchObject({
      code: 'NETWORK_ERROR',
      status: 0,
    });
  });

  it('throws invalid envelope error when data missing (code falls back if absent)', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true, message: 'ok' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    await expect(listEmployeeMetadataQueue(scope)).rejects.toMatchObject({
      code: 'HRM_INVALID_ENVELOPE',
    });
  });

  it('throws TIMEOUT when fetch rejects with AbortError', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new DOMException('Aborted', 'AbortError'));
    await expect(listEmployeeMetadataQueue(scope)).rejects.toMatchObject({
      code: 'TIMEOUT',
      status: 408,
    });
  });

  it('surfaces instances of HrmApiClientError', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(null, { status: 500, statusText: 'Server Error' }),
    );
    try {
      await listEmployeeMetadataQueue(scope);
      expect.fail('expected throw');
    } catch (e) {
      expect(e).toBeInstanceOf(HrmApiClientError);
    }
  });
});
