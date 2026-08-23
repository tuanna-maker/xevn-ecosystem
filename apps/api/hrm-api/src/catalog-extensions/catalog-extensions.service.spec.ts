import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HRM_GROUP_MEMBER_COMPANY_SLUGS } from '../common/hrm-list-scope';
import { CatalogExtensionsService } from './catalog-extensions.service';
import { HrmDbService } from '../db/hrm-db.service';

jest.mock('node:fs/promises', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined),
  access: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn().mockResolvedValue(Buffer.from('png-bytes')),
}));

const GROUP_CEO_TOKEN = () =>
  signServiceJwt({
    sub: 'ceo@xe.vn',
    tenantId: 'xevn',
    companyId: 'main',
    roleCode: 'group_ceo',
  });

describe('CatalogExtensionsService', () => {
  const query = jest.fn();
  const service = new CatalogExtensionsService({
    query,
  } as unknown as HrmDbService);

  beforeEach(() => {
    query.mockReset();
    query.mockResolvedValue({ rows: [] });
    jest.mocked(mkdir).mockClear();
    jest.mocked(writeFile).mockClear();
    jest.mocked(access).mockClear();
    jest.mocked(readFile).mockClear();
    jest.mocked(access).mockResolvedValue(undefined);
    jest.mocked(readFile).mockResolvedValue(Buffer.from('png-bytes'));
  });

  it('lists sales data with company filter', async () => {
    query.mockImplementation(async (sql: string) => {
      if (
        typeof sql === 'string' &&
        sql.includes('FROM public.hrm_sales_data')
      ) {
        return { rows: [{ id: '1' }] };
      }
      return { rows: [] };
    });
    const result = await service.listSalesData('main', 5, 2026);
    expect(result.total).toBe(1);
    expect(query).toHaveBeenCalled();
  });

  it('lists bonus policies empty array without 404', async () => {
    query.mockImplementation(async (sql: string) => {
      if (
        typeof sql === 'string' &&
        sql.includes('FROM public.hrm_bonus_policies')
      ) {
        return { rows: [] };
      }
      return { rows: [] };
    });
    const result = await service.listBonusPolicies('main');
    expect(result).toEqual({ total: 0, data: [] });
  });

  it('syncSalesData applies company_id ANY rollup for group CEO main (P1-QUAL-BE-W3-SCOPE-01)', async () => {
    const token = GROUP_CEO_TOKEN();
    query.mockImplementation(async (sql: string) => {
      if (
        typeof sql === 'string' &&
        sql.includes('UPDATE public.hrm_sales_data')
      ) {
        return { rows: [{ id: '1' }, { id: '2' }] };
      }
      return { rows: [] };
    });
    const result = await service.syncSalesData('main', `Bearer ${token}`);
    const updateCall = query.mock.calls.find(([sql]) =>
      String(sql).includes('UPDATE public.hrm_sales_data'),
    );
    expect(updateCall?.[0]).toMatch(/company_id = ANY/);
    expect(updateCall?.[0]).not.toMatch(/WHERE company_id = \$1[^:]/);
    expect(result.synced).toBe(2);
    expect(result.company_id).toBe('main');
    expect(result.company_ids).toEqual([...HRM_GROUP_MEMBER_COMPANY_SLUGS]);
  });

  it('deleteFaceData peeks row and deletes by stored company_id (P1-QUAL-BE-W3-SCOPE-02)', async () => {
    const employeeId = '289a9388-22c5-49be-a795-f498a0c72436';
    const token = GROUP_CEO_TOKEN();
    query.mockImplementation(async (sql: string) => {
      if (
        typeof sql === 'string' &&
        sql.includes('SELECT company_id FROM public.hrm_face_data')
      ) {
        return { rows: [{ company_id: 'logistics' }] };
      }
      if (
        typeof sql === 'string' &&
        sql.includes('DELETE FROM public.hrm_face_data')
      ) {
        return { rows: [] };
      }
      return { rows: [] };
    });
    await service.deleteFaceData(employeeId, 'main', `Bearer ${token}`);
    const peekCall = query.mock.calls.find(([sql]) =>
      String(sql).includes('SELECT company_id FROM public.hrm_face_data'),
    );
    expect(peekCall).toBeDefined();
    const deleteCall = query.mock.calls.find(([sql]) =>
      String(sql).includes('DELETE FROM public.hrm_face_data'),
    );
    expect(deleteCall?.[1]).toEqual(['logistics', employeeId]);
  });

  it('deleteFaceData rejects face row outside rollup scope (P1-QUAL-BE-W3-SCOPE-02)', async () => {
    const employeeId = '289a9388-22c5-49be-a795-f498a0c72436';
    const token = GROUP_CEO_TOKEN();
    query.mockImplementation(async (sql: string) => {
      if (
        typeof sql === 'string' &&
        sql.includes('SELECT company_id FROM public.hrm_face_data')
      ) {
        return { rows: [{ company_id: 'other-co' }] };
      }
      return { rows: [] };
    });
    await expect(
      service.deleteFaceData(employeeId, 'main', `Bearer ${token}`),
    ).rejects.toThrow(expect.objectContaining({ code: 'HRM-FACE-409' }));
    const deleteCall = query.mock.calls.find(([sql]) =>
      String(sql).includes('DELETE FROM public.hrm_face_data'),
    );
    expect(deleteCall).toBeUndefined();
  });

  it('createBonusPolicyParticipant asserts policy ownership before insert (P1-QUAL-BE-W3-SCOPE-03)', async () => {
    const policyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
    const token = GROUP_CEO_TOKEN();
    query.mockImplementation(async (sql: string) => {
      if (
        typeof sql === 'string' &&
        sql.includes('FROM public.hrm_bonus_policies WHERE id')
      ) {
        return { rows: [{ company_id: 'holding' }] };
      }
      if (
        typeof sql === 'string' &&
        sql.includes('INSERT INTO public.hrm_bonus_policy_participants')
      ) {
        return {
          rows: [
            {
              id: 'new-id',
              company_id: 'holding',
              policy_id: policyId,
              employee_code: 'E1',
              employee_name: 'Test',
            },
          ],
        };
      }
      return { rows: [] };
    });
    const row = await service.createBonusPolicyParticipant(
      {
        company_id: 'main',
        policy_id: policyId,
        employee_code: 'E1',
        employee_name: 'Test',
      },
      `Bearer ${token}`,
    );
    expect(row.company_id).toBe('holding');
    const policyPeek = query.mock.calls.find(([sql]) =>
      String(sql).includes('FROM public.hrm_bonus_policies WHERE id'),
    );
    expect(policyPeek?.[1]).toEqual([policyId]);
  });

  it('createBonusPolicyParticipant rejects policy outside scope (P1-QUAL-BE-W3-SCOPE-03)', async () => {
    const policyId = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
    const token = GROUP_CEO_TOKEN();
    query.mockImplementation(async (sql: string) => {
      if (
        typeof sql === 'string' &&
        sql.includes('FROM public.hrm_bonus_policies WHERE id')
      ) {
        return { rows: [{ company_id: 'other-co' }] };
      }
      return { rows: [] };
    });
    await expect(
      service.createBonusPolicyParticipant(
        {
          company_id: 'main',
          policy_id: policyId,
          employee_code: 'E1',
          employee_name: 'Test',
        },
        `Bearer ${token}`,
      ),
    ).rejects.toThrow(expect.objectContaining({ code: 'HRM-BONUS-409' }));
  });

  it('storeUploadedFile binds company_id and scoped storage path for group CEO main (P1-RESID-C01 / CE-04)', async () => {
    const token = GROUP_CEO_TOKEN();
    const out = await service.storeUploadedFile(
      'main',
      `Bearer ${token}`,
      'resume',
      {
        buffer: Buffer.from('data'),
        originalname: 'cv.pdf',
        mimetype: 'application/pdf',
      },
    );
    expect(out.company_id).toBe('holding');
    expect(out.url).toMatch(/^\/api\/hrm\/files\/holding\//);
    expect(jest.mocked(mkdir)).toHaveBeenCalledWith(
      expect.stringMatching(/hrm-files[\\/]holding$/),
      { recursive: true },
    );
    expect(jest.mocked(writeFile)).toHaveBeenCalledWith(
      expect.stringMatching(/hrm-files[\\/]holding[\\/]/),
      expect.any(Buffer),
    );
  });

  it('storeUploadedFile rejects cross-tenant company_id (P1-RESID-C01)', async () => {
    const token = signServiceJwt({
      sub: 'du-lich.ceo@xe.vn',
      tenantId: 'xe-du-lich',
      companyId: 'main',
      roleCode: 'subsidiary_ceo',
    });
    await expect(
      service.storeUploadedFile('logistics', `Bearer ${token}`, 'avatar', {
        buffer: Buffer.from('x'),
        originalname: 'a.png',
        mimetype: 'image/png',
      }),
    ).rejects.toThrow(expect.objectContaining({ code: 'HRM-FILE-409' }));
    expect(jest.mocked(writeFile)).not.toHaveBeenCalled();
  });

  it('readUploadedFile serves scoped path without auth (P1-RESID-C01 / GWC-AVT-01)', async () => {
    const out = await service.readUploadedFile(
      'holding',
      'employee-avatar-1-test.png',
      undefined,
    );
    expect(out.buffer.toString()).toBe('png-bytes');
    expect(out.mimetype).toBe('image/png');
    expect(jest.mocked(readFile)).toHaveBeenCalledWith(
      expect.stringMatching(
        /hrm-files[\\/]holding[\\/]employee-avatar-1-test\.png$/,
      ),
    );
  });

  it('readUploadedFile rejects path traversal (GWC-AVT-01)', async () => {
    await expect(
      service.readUploadedFile('holding', '../secret.png', undefined),
    ).rejects.toThrow(expect.objectContaining({ code: 'HRM-FILE-404' }));
    expect(jest.mocked(readFile)).not.toHaveBeenCalled();
  });

  it('readUploadedFile applies scope when JWT present (P1-RESID-C01)', async () => {
    const token = GROUP_CEO_TOKEN();
    await service.readUploadedFile(
      'main',
      'employee-avatar-2-test.png',
      `Bearer ${token}`,
    );
    expect(jest.mocked(readFile)).toHaveBeenCalledWith(
      expect.stringMatching(
        /hrm-files[\\/]holding[\\/]employee-avatar-2-test\.png$/,
      ),
    );
  });

  it('returns trial subscription when missing', async () => {
    query.mockImplementation(async (sql: string) => {
      if (
        typeof sql === 'string' &&
        sql.includes('FROM public.hrm_company_subscriptions') &&
        sql.includes('LIMIT 1')
      ) {
        return { rows: [] };
      }
      if (
        typeof sql === 'string' &&
        sql.includes('INSERT INTO public.hrm_company_subscriptions')
      ) {
        return {
          rows: [
            {
              company_id: 'main',
              plan_code: 'trial',
              trial_end_date: '2099-01-01',
            },
          ],
        };
      }
      return { rows: [] };
    });
    const sub = await service.getCompanySubscription('main');
    expect(sub.company_id).toBe('main');
    expect(sub.trial_days_remaining).toBeGreaterThanOrEqual(0);
  });
});
