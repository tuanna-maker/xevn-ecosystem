import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiClientError } from '@/lib/apiError';
import {
  findEmployeeForInsuranceRow,
  isInsuranceFetchFailureEmpty,
  isRateLimitInsuranceError,
  loadInsuranceListProgressive,
  mapApiInsuranceToListItem,
  normalizeInsuranceEmployeeId,
  HRM_INSURANCE_LIST_PAGE_SIZE,
} from './useInsuranceList';

const baseEmployee = {
  id: 'emp-1',
  company_id: 'main',
  employee_code: 'LOG-0003',
  email: 'nv@xe.vn',
  full_name: 'Lê Văn An',
  job_title_key: 'staff',
  status: 'active' as const,
  hired_at: null,
  archived_at: null,
  custom_fields: {},
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
};

vi.mock('@/integrations/hrmApi', () => ({
  listInsuranceRecords: vi.fn(),
  listEmployees: vi.fn(),
  listInsurancePolicyParticipants: vi.fn(),
}));

import {
  listEmployees,
  listInsurancePolicyParticipants,
  listInsuranceRecords,
} from '@/integrations/hrmApi';

const listInsuranceRecordsMock = vi.mocked(listInsuranceRecords);
const listEmployeesMock = vi.mocked(listEmployees);
const listParticipantsMock = vi.mocked(listInsurancePolicyParticipants);

function makeInsRow(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    company_id: 'main',
    employee_id: 'emp-1',
    provider: 'BHXH',
    policy_number: `BH-${id}`,
    expiry_date: '2026-12-31',
    status: 'active' as const,
    created_at: '2025-01-01T00:00:00.000Z',
    updated_at: '2025-01-02T00:00:00.000Z',
    employee_code: 'LOG-0003',
    employee_name: 'Lê Văn An',
    ...overrides,
  };
}

describe('normalizeInsuranceEmployeeId', () => {
  it('returns undefined for empty values', () => {
    expect(normalizeInsuranceEmployeeId(null)).toBeUndefined();
    expect(normalizeInsuranceEmployeeId('  ')).toBeUndefined();
  });

  it('trims valid ids', () => {
    expect(normalizeInsuranceEmployeeId(' emp-1 ')).toBe('emp-1');
  });
});

describe('findEmployeeForInsuranceRow', () => {
  it('resolves by employee_code when row employee_id is missing (J-HRM-04)', () => {
    const found = findEmployeeForInsuranceRow(
      {
        id: 'ins-1',
        company_id: 'main',
        employee_id: '',
        provider: 'BHXH',
        policy_number: 'BH-001',
        expiry_date: '2026-12-31',
        status: 'active',
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-02T00:00:00.000Z',
        employee_code: 'LOG-0003',
        employee_name: 'Lê Văn An',
      },
      [baseEmployee],
    );
    expect(found?.id).toBe('emp-1');
  });
});

describe('mapApiInsuranceToListItem', () => {
  it('maps Nest insurance row with employee context', () => {
    const mapped = mapApiInsuranceToListItem(
      {
        id: 'ins-1',
        company_id: 'main',
        employee_id: 'emp-1',
        provider: 'BHXH',
        policy_number: 'BH-001',
        expiry_date: '2026-12-31',
        status: 'active',
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-02T00:00:00.000Z',
      },
      baseEmployee,
    );
    expect(mapped.employee_code).toBe('LOG-0003');
    expect(mapped.employee_id).toBe('emp-1');
    expect(mapped.health_insurance_number).toBe('BH-001');
    expect(mapped.status).toBe('active');
  });

  it('prefers employee fields embedded on insurance list API row', () => {
    const mapped = mapApiInsuranceToListItem({
      id: 'ins-2',
      company_id: 'main',
      employee_id: 'emp-2',
      provider: 'PVI',
      policy_number: 'PVI-1',
      expiry_date: '2027-01-01',
      status: 'active',
      created_at: '2025-01-01T00:00:00.000Z',
      updated_at: '2025-01-01T00:00:00.000Z',
      employee_code: 'NV002',
      employee_name: 'Tran B',
      department: 'HR',
    } as Parameters<typeof mapApiInsuranceToListItem>[0]);
    expect(mapped.employee_code).toBe('NV002');
    expect(mapped.employee_name).toBe('Tran B');
    expect(mapped.department).toBe('HR');
  });

  it('falls back employee_id from workforce row when API omits it', () => {
    const mapped = mapApiInsuranceToListItem(
      {
        id: 'ins-3',
        company_id: 'main',
        employee_id: '',
        provider: 'BHXH',
        policy_number: 'BH-003',
        expiry_date: '2026-12-31',
        status: 'active',
        created_at: '2025-01-01T00:00:00.000Z',
        updated_at: '2025-01-01T00:00:00.000Z',
        employee_code: 'LOG-0003',
        employee_name: 'Lê Văn An',
      },
      baseEmployee,
    );
    expect(mapped.employee_id).toBe('emp-1');
  });
});

describe('D-HRM-INS-EMPTY-MASK-01', () => {
  it('isInsuranceFetchFailureEmpty is true only when error + zero rows', () => {
    expect(isInsuranceFetchFailureEmpty('RATE-429', 0)).toBe(true);
    expect(isInsuranceFetchFailureEmpty('RATE-429', 10)).toBe(false);
    expect(isInsuranceFetchFailureEmpty(null, 0)).toBe(false);
  });

  it('classifies RATE-429 ApiClientError', () => {
    expect(
      isRateLimitInsuranceError(
        new ApiClientError({ status: 429, code: 'RATE-429', message: 'Too many requests' }),
      ),
    ).toBe(true);
    expect(isRateLimitInsuranceError(new ApiClientError({ status: 500, code: 'X' }))).toBe(false);
  });
});

describe('D-HRM-INS-PERF-01 loadInsuranceListProgressive', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listEmployeesMock.mockResolvedValue({ total: 1, data: [baseEmployee] });
    listParticipantsMock.mockResolvedValue({ total: 0, data: [] });
  });

  it('paints after first page then fetches remaining (not one blocking waterfall)', async () => {
    const page1 = Array.from({ length: HRM_INSURANCE_LIST_PAGE_SIZE }, (_, i) =>
      makeInsRow(`p1-${i}`),
    );
    const page2 = [makeInsRow('p2-0'), makeInsRow('p2-1')];
    listInsuranceRecordsMock
      .mockResolvedValueOnce({
        total: HRM_INSURANCE_LIST_PAGE_SIZE + 2,
        page: 1,
        page_size: HRM_INSURANCE_LIST_PAGE_SIZE,
        data: page1,
      })
      .mockResolvedValueOnce({
        total: HRM_INSURANCE_LIST_PAGE_SIZE + 2,
        page: 2,
        page_size: HRM_INSURANCE_LIST_PAGE_SIZE,
        data: page2,
      });

    const firstPageTotals: number[] = [];
    const progressTotals: number[] = [];

    const result = await loadInsuranceListProgressive('main', 'all', {
      onFirstPage: ({ items, total }) => {
        firstPageTotals.push(items.length);
        expect(total).toBe(HRM_INSURANCE_LIST_PAGE_SIZE + 2);
      },
      onProgress: ({ items }) => {
        progressTotals.push(items.length);
      },
    });

    expect(firstPageTotals[0]).toBe(HRM_INSURANCE_LIST_PAGE_SIZE);
    expect(result.pagesFetched).toBe(2);
    expect(result.items.length).toBe(HRM_INSURANCE_LIST_PAGE_SIZE + 2);
    expect(listInsuranceRecordsMock).toHaveBeenCalledTimes(2);
    expect(listInsuranceRecordsMock.mock.calls[0][0]).toMatchObject({
      page: 1,
      page_size: HRM_INSURANCE_LIST_PAGE_SIZE,
    });
    expect(progressTotals.at(-1)).toBe(HRM_INSURANCE_LIST_PAGE_SIZE + 2);
  });

  it('throws on first-page RATE-429 so UI can show error (not empty)', async () => {
    listInsuranceRecordsMock.mockRejectedValueOnce(
      new ApiClientError({ status: 429, code: 'RATE-429', message: 'Too many requests' }),
    );

    await expect(
      loadInsuranceListProgressive('main', 'all', {
        onFirstPage: () => {
          throw new Error('onFirstPage must not run on RATE-429');
        },
      }),
    ).rejects.toMatchObject({ code: 'RATE-429', status: 429 });

    expect(listInsuranceRecordsMock).toHaveBeenCalledTimes(1);
  });

  it('soft-fails companion employees 429 and still paints insurance page 1', async () => {
    listEmployeesMock.mockRejectedValueOnce(
      new ApiClientError({ status: 429, code: 'RATE-429', message: 'Too many requests' }),
    );
    listInsuranceRecordsMock.mockResolvedValueOnce({
      total: 1,
      page: 1,
      page_size: HRM_INSURANCE_LIST_PAGE_SIZE,
      data: [makeInsRow('only')],
    });

    const result = await loadInsuranceListProgressive('main', 'all', {
      onFirstPage: ({ items }) => {
        expect(items).toHaveLength(1);
      },
    });

    expect(result.items).toHaveLength(1);
    expect(result.pagesFetched).toBe(1);
  });
});
