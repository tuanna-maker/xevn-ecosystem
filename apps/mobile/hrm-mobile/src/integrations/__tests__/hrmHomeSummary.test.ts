import { beforeEach, describe, expect, it, vi } from 'vitest';
import { composeHomeSummaryParams, loadHomeCelebrateSections } from '../hrmHomeSummary';
import { hrmRequest } from '../hrmApiClient';

vi.mock('../hrmApiClient', () => ({
  hrmRequest: vi.fn(),
  resolveHrmCompanyHeaderId: vi.fn((uuid: string, slug: string) => slug || uuid),
}));

const holdingUuid = '6efaa5d6-a4a8-4bfd-805a-3c4f003e4013';
const employeeId = '3796d949-4513-45c0-88fa-33030a062b17';

describe('loadHomeCelebrateSections — PCOMP-W7-MOB-WHOS-OUT-01', () => {
  beforeEach(() => {
    vi.mocked(hrmRequest).mockReset();
  });

  it('queries home/summary with holding slug when membership scope is holding (not legal UUID)', async () => {
    vi.mocked(hrmRequest).mockResolvedValueOnce({
      ok: true,
      data: {
        viewer: { employee_id: employeeId, display_name: 'An', is_manager: true, is_birthday_today: false },
        celebrations: { total_count: 0, items: [] },
        whos_out: {
          total_count: 1,
          items: [
            {
              employee_id: '8ac84520-0d6b-4737-8341-2f9a929b5f81',
              display_name: 'Huỳnh Văn An',
              leave_type: 'annual',
              leave_request_id: 'c9afd4cf-05b0-4e89-84c9-3322b5a7ac79',
            },
          ],
        },
      },
      code: 'HRM-HOME-200',
      requestId: 'test',
    });

    const result = await loadHomeCelebrateSections(
      { baseUrl: 'https://example.test', companyId: 'holding', companyUuid: holdingUuid, employeeId },
      employeeId,
    );

    expect(result.whosOut).toHaveLength(1);
    expect(result.whosOut[0]?.display_name).toBe('Huỳnh Văn An');
    expect(result.whosOut[0]?.leave_request_id).toBe('c9afd4cf-05b0-4e89-84c9-3322b5a7ac79');
    expect(result.source).toBe('aggregate');

    const [auth, path] = vi.mocked(hrmRequest).mock.calls[0] ?? [];
    expect(path).toContain('/home/summary?');
    expect(path).toContain('company_id=holding');
    expect(path).not.toContain(`company_id=${holdingUuid}`);
    expect(auth?.companyId).toBe('holding');
  });

  it('PCOMP-W7-MOB-WHOS-OUT-02: holding slug when SecureStore companyId is legal UUID (device regression)', async () => {
    vi.mocked(hrmRequest).mockResolvedValueOnce({
      ok: true,
      data: {
        viewer: { employee_id: employeeId, display_name: 'An', is_manager: true, is_birthday_today: false },
        celebrations: { total_count: 0, items: [] },
        whos_out: {
          total_count: 1,
          items: [
            {
              employee_id: '8ac84520-0d6b-4737-8341-2f9a929b5f81',
              display_name: 'Huỳnh Văn An',
              leave_type: 'annual',
              leave_request_id: 'c9afd4cf-05b0-4e89-84c9-3322b5a7ac79',
            },
          ],
        },
      },
      code: 'HRM-HOME-200',
      requestId: 'test',
    });

    const auth = {
      baseUrl: 'https://example.test',
      companyId: holdingUuid,
      companyUuid: holdingUuid,
      employeeId,
      tenantId: 'xevn',
      memberships: [
        {
          tenant_id: 'xevn',
          company_id: 'holding',
          company_uuid: holdingUuid,
          employee_id: employeeId,
        },
      ],
    };

    const params = composeHomeSummaryParams(auth, employeeId);
    expect(params?.summaryCompanyId).toBe('holding');

    const result = await loadHomeCelebrateSections(auth, employeeId);
    expect(result.whosOut).toHaveLength(1);

    const [, path] = vi.mocked(hrmRequest).mock.calls[0] ?? [];
    expect(path).toContain('company_id=holding');
    expect(path).not.toContain(`company_id=${holdingUuid}`);
  });
});
