import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MASTER_TENANT_ID, MEMBER_DEFAULT_COMPANY_ID } from '../constants/tenant';
import { minimalScopeJwt } from '../test/jwtTestUtils';
import {
  resolveGroupHrHrmCatalogScope,
  syncGroupHrFieldDefsToHrm,
  type GroupHrCatalogFieldDto,
} from './groupHrCatalogApi';

describe('groupHrCatalogApi (P1-GHR-SYNC-SCOPE-FE)', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_STRICT_IDENTITY', 'true');
    sessionStorage.setItem('xevn.portal.accessToken', minimalScopeJwt(MASTER_TENANT_ID, MEMBER_DEFAULT_COMPANY_ID));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('resolveGroupHrHrmCatalogScope keeps master tenant + main for group CEO JWT', () => {
    expect(resolveGroupHrHrmCatalogScope('xe-du-lich')).toEqual({
      tenantId: MASTER_TENANT_ID,
      companyId: MEMBER_DEFAULT_COMPANY_ID,
    });
    expect(resolveGroupHrHrmCatalogScope(MASTER_TENANT_ID)).toEqual({
      tenantId: MASTER_TENANT_ID,
      companyId: MEMBER_DEFAULT_COMPANY_ID,
    });
  });

  it('syncGroupHrFieldDefsToHrm posts buckets in parallel with progress', async () => {
    const fetchMock = vi.fn(async (url: string) => ({
      ok: true,
      status: 200,
      json: async () => ({ data: {} }),
    }));
    vi.stubGlobal('fetch', fetchMock);

    const defs: GroupHrCatalogFieldDto[] = [
      {
        id: 'ghr-a',
        fieldCode: 'full_name',
        labelVi: 'Họ tên',
        dataType: 'text',
        blockCode: 'personal',
        visible: true,
        selectConfig: '',
        hrmCatalogKey: 'hrm_employee_basic_fields',
      },
      {
        id: 'ghr-b',
        fieldCode: 'phone_number',
        labelVi: 'Điện thoại',
        dataType: 'phone',
        blockCode: 'contact',
        visible: true,
        selectConfig: '',
        hrmCatalogKey: 'hrm_employee_contact_fields',
      },
    ];

    const progress: Array<{ completed: number; total: number }> = [];
    await syncGroupHrFieldDefsToHrm(defs, MASTER_TENANT_ID, MEMBER_DEFAULT_COMPANY_ID, (p) => {
      progress.push({ completed: p.completed, total: p.total });
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    const headers = (fetchMock.mock.calls[0]?.[1] as RequestInit | undefined)?.headers as Record<
      string,
      string
    >;
    expect(headers['x-tenant-id']).toBe(MASTER_TENANT_ID);
    expect(headers['x-company-id']).toBe(MEMBER_DEFAULT_COMPANY_ID);
    expect(progress).toEqual([
      { completed: 1, total: 2 },
      { completed: 2, total: 2 },
    ]);
  });
});
