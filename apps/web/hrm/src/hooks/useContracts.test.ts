import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiClientError } from '@/lib/apiError';
import {
  HRM_CONTRACTS_LIST_PAGE_SIZE,
  isContractsFetchFailureEmpty,
  loadContractsListProgressive,
  mapApiContract,
} from './useContracts';
import { isListFetchFailureEmpty, isRateLimitApiError } from '@/lib/hrmListLoadFailure';

vi.mock('@/integrations/hrmApi', () => ({
  listEmployeeContracts: vi.fn(),
}));

import { listEmployeeContracts } from '@/integrations/hrmApi';

const listEmployeeContractsMock = vi.mocked(listEmployeeContracts);

function makeContractRow(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    company_id: 'main',
    employee_id: 'emp-1',
    contract_type: 'fixed_term',
    start_date: '2026-01-01',
    end_date: '2026-12-31',
    status: 'active' as const,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-02T00:00:00.000Z',
    employee_code: 'TCN-0954',
    employee_name: 'Đặng Xuân Hà',
    department: 'Vận hành',
    ...overrides,
  };
}

describe('P1-HRM-CON-PERF-01 — mapApiContract', () => {
  it('maps Nest contract row with embedded employee fields (J-HRM-03 list→detail)', () => {
    const mapped = mapApiContract(makeContractRow('c-1'));
    expect(mapped.contract_code).toBe('TCN-0954-HD');
    expect(mapped.employee_name).toBe('Đặng Xuân Hà');
    expect(mapped.employee_id).toBe('emp-1');
    expect(mapped.source).toBe('employee_contracts');
    expect(mapped.status).toBe('active');
  });
});

describe('P1-HRM-CON-PERF-01 — loadContractsListProgressive', () => {
  beforeEach(() => {
    listEmployeeContractsMock.mockReset();
  });

  it('paints after first page then fetches remaining (not blocking listAll waterfall)', async () => {
    const page1 = Array.from({ length: HRM_CONTRACTS_LIST_PAGE_SIZE }, (_, i) =>
      makeContractRow(`p1-${i}`),
    );
    const page2 = [makeContractRow('p2-0'), makeContractRow('p2-1')];
    listEmployeeContractsMock
      .mockResolvedValueOnce({
        total: HRM_CONTRACTS_LIST_PAGE_SIZE + 2,
        page: 1,
        page_size: HRM_CONTRACTS_LIST_PAGE_SIZE,
        data: page1,
      })
      .mockResolvedValueOnce({
        total: HRM_CONTRACTS_LIST_PAGE_SIZE + 2,
        page: 2,
        page_size: HRM_CONTRACTS_LIST_PAGE_SIZE,
        data: page2,
      });

    const firstPageTotals: number[] = [];
    const progressTotals: number[] = [];

    const result = await loadContractsListProgressive('main', 'all', {
      onFirstPage: ({ items, total }) => {
        firstPageTotals.push(items.length);
        expect(total).toBe(HRM_CONTRACTS_LIST_PAGE_SIZE + 2);
      },
      onProgress: ({ items }) => {
        progressTotals.push(items.length);
      },
    });

    expect(firstPageTotals[0]).toBe(HRM_CONTRACTS_LIST_PAGE_SIZE);
    expect(result.pagesFetched).toBe(2);
    expect(result.items.length).toBe(HRM_CONTRACTS_LIST_PAGE_SIZE + 2);
    expect(listEmployeeContractsMock).toHaveBeenCalledTimes(2);
    expect(listEmployeeContractsMock.mock.calls[0][0]).toMatchObject({
      page: 1,
      page_size: HRM_CONTRACTS_LIST_PAGE_SIZE,
    });
    expect(listEmployeeContractsMock.mock.calls[0][0]).not.toHaveProperty('listAll');
    expect(progressTotals.at(-1)).toBe(HRM_CONTRACTS_LIST_PAGE_SIZE + 2);
  });

  it('does not call employee list endpoints (picker deferred to dialog)', async () => {
    listEmployeeContractsMock.mockResolvedValueOnce({
      total: 1,
      page: 1,
      page_size: HRM_CONTRACTS_LIST_PAGE_SIZE,
      data: [makeContractRow('only')],
    });

    await loadContractsListProgressive('main', 'all', {
      onFirstPage: ({ items }) => {
        expect(items).toHaveLength(1);
      },
    });

    expect(listEmployeeContractsMock).toHaveBeenCalledTimes(1);
  });

  it('throws on first-page RATE-429 so UI can show error (not empty)', async () => {
    listEmployeeContractsMock.mockRejectedValueOnce(
      new ApiClientError({ status: 429, code: 'RATE-429', message: 'Too many requests' }),
    );

    await expect(
      loadContractsListProgressive('main', 'all', {
        onFirstPage: () => {
          throw new Error('onFirstPage must not run on RATE-429');
        },
      }),
    ).rejects.toMatchObject({ code: 'RATE-429', status: 429 });

    expect(listEmployeeContractsMock).toHaveBeenCalledTimes(1);
    expect(isRateLimitApiError({ status: 429, code: 'RATE-429' })).toBe(true);
  });

  it('applies type filter after map without extra API fan-out', async () => {
    listEmployeeContractsMock.mockResolvedValueOnce({
      total: 2,
      page: 1,
      page_size: HRM_CONTRACTS_LIST_PAGE_SIZE,
      data: [
        makeContractRow('a', { contract_type: 'Hợp đồng 1 năm' }),
        makeContractRow('b', { contract_type: 'fixed_term' }),
      ],
    });

    const result = await loadContractsListProgressive('main', 'Hợp đồng 1 năm', {
      onFirstPage: ({ items }) => {
        expect(items).toHaveLength(1);
        expect(items[0].id).toBe('a');
      },
    });

    expect(result.items).toHaveLength(1);
    expect(result.pagesFetched).toBe(1);
  });
});

describe('P1-HRM-CON-PERF-01 — empty-mask helpers', () => {
  it('isListFetchFailureEmpty is true for RATE-429 with 0 rows', () => {
    expect(isListFetchFailureEmpty('Too many requests', 0)).toBe(true);
    expect(isContractsFetchFailureEmpty('Too many requests', 0)).toBe(true);
  });

  it('isListFetchFailureEmpty is false when rows already painted', () => {
    expect(isListFetchFailureEmpty('Too many requests', 100)).toBe(false);
  });

  it('isListFetchFailureEmpty is false for happy empty (no error)', () => {
    expect(isListFetchFailureEmpty(null, 0)).toBe(false);
  });
});
