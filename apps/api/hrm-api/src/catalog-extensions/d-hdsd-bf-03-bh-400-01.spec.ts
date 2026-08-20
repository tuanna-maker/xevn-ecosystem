/**
 * D-HDSD-BF-03-BH-400-01 — POST insurance-policy-participants without policy_id.
 * Root cause TC-049: FE dialog omits policy_id → was hard 400.
 * Soft-resolve: exactly one active policy (prefer insurer_key) → 201; 0/many → clear codes.
 */
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import {
  CatalogExtensionsService,
  HRM_INS_POL_404,
  HRM_INS_POL_AMBIG,
  HRM_INS_EMP_404,
} from './catalog-extensions.service';
import { HrmDbService } from '../db/hrm-db.service';

const GROUP_CEO_TOKEN = () =>
  signServiceJwt({
    sub: 'ceo@xe.vn',
    tenantId: 'xevn',
    companyId: 'main',
    roleCode: 'group_ceo',
  });

const EMP_ID = '289a9388-22c5-49be-a795-f498a0c72436';
const POL_ID = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
const POL_ID_2 = 'b2c3d4e5-f6a7-4890-b123-456789abcdef';

describe('D-HDSD-BF-03-BH-400-01 createInsurancePolicyParticipant', () => {
  const query = jest.fn();
  const service = new CatalogExtensionsService({
    query,
  } as unknown as HrmDbService);

  beforeEach(() => {
    query.mockReset();
    query.mockResolvedValue({ rows: [] });
  });

  function mockHappyPath(opts: {
    policies: Array<{ id: string; insurer_key: string | null }>;
    employeeFound?: boolean;
  }) {
    query.mockImplementation(async (sql: string) => {
      const s = String(sql);
      if (
        s.includes('FROM public.hrm_insurance_policies') &&
        s.includes(`status = 'active'`)
      ) {
        return { rows: opts.policies };
      }
      if (
        s.includes('FROM public.hrm_insurance_policies') &&
        s.includes('id = $1::uuid')
      ) {
        const pol = opts.policies[0];
        return pol
          ? {
              rows: [
                {
                  id: pol.id,
                  company_id: 'holding',
                  status: 'active',
                  insurer_key: pol.insurer_key,
                },
              ],
            }
          : { rows: [] };
      }
      if (s.includes('FROM public.employees')) {
        return opts.employeeFound === false
          ? { rows: [] }
          : { rows: [{ id: EMP_ID }] };
      }
      if (s.includes('INSERT INTO public.hrm_insurance_policy_participants')) {
        return {
          rows: [
            {
              id: 'new-participant',
              company_id: 'holding',
              policy_id: opts.policies[0]?.id ?? POL_ID,
              employee_id: EMP_ID,
              employee_code: 'NV001',
              employee_name: 'QA BH',
            },
          ],
        };
      }
      return { rows: [] };
    });
  }

  it('omitted policy_id + insurer_key → resolves single active policy → insert', async () => {
    mockHappyPath({
      policies: [{ id: POL_ID, insurer_key: 'bao_viet' }],
    });
    const token = GROUP_CEO_TOKEN();
    const row = await service.createInsurancePolicyParticipant(
      {
        company_id: 'main',
        employee_id: EMP_ID,
        employee_code: 'NV001',
        employee_name: 'QA BH',
        insurer_key: 'bao_viet',
        insurance_type: 'bhxh',
        base_salary: 10_000_000,
      },
      `Bearer ${token}`,
    );
    expect(row.policy_id).toBe(POL_ID);
    const insertCall = query.mock.calls.find(([sql]) =>
      String(sql).includes(
        'INSERT INTO public.hrm_insurance_policy_participants',
      ),
    );
    expect(insertCall?.[1]?.[2]).toBe(POL_ID);
    expect(insertCall?.[1]?.[3]).toBe('bao_viet');
    expect(insertCall?.[1]?.[4]).toBe(EMP_ID);
  });

  it('omitted policy_id + no active policy → HRM-INS-POL-404 (no orphan widen)', async () => {
    mockHappyPath({ policies: [] });
    const token = GROUP_CEO_TOKEN();
    await expect(
      service.createInsurancePolicyParticipant(
        {
          company_id: 'main',
          employee_id: EMP_ID,
          employee_code: 'NV001',
          employee_name: 'QA BH',
          insurer_key: 'bao_viet',
        },
        `Bearer ${token}`,
      ),
    ).rejects.toThrow(
      expect.objectContaining<Partial<ApiException>>({
        code: HRM_INS_POL_404,
      }),
    );
    const insertCall = query.mock.calls.find(([sql]) =>
      String(sql).includes(
        'INSERT INTO public.hrm_insurance_policy_participants',
      ),
    );
    expect(insertCall).toBeUndefined();
  });

  it('omitted policy_id + multiple active matches → HRM-INS-POL-AMBIG', async () => {
    mockHappyPath({
      policies: [
        { id: POL_ID, insurer_key: 'bao_viet' },
        { id: POL_ID_2, insurer_key: 'bao_viet' },
      ],
    });
    const token = GROUP_CEO_TOKEN();
    await expect(
      service.createInsurancePolicyParticipant(
        {
          company_id: 'main',
          employee_id: EMP_ID,
          employee_code: 'NV001',
          employee_name: 'QA BH',
          insurer_key: 'bao_viet',
        },
        `Bearer ${token}`,
      ),
    ).rejects.toThrow(
      expect.objectContaining<Partial<ApiException>>({
        code: HRM_INS_POL_AMBIG,
      }),
    );
  });

  it('explicit policy_id still wins (must_keep path)', async () => {
    mockHappyPath({
      policies: [{ id: POL_ID, insurer_key: 'pvi' }],
    });
    const token = GROUP_CEO_TOKEN();
    const row = await service.createInsurancePolicyParticipant(
      {
        company_id: 'main',
        policy_id: POL_ID,
        employee_id: EMP_ID,
        employee_code: 'NV001',
        employee_name: 'QA BH',
        insurer_key: 'ignored_for_resolve',
      },
      `Bearer ${token}`,
    );
    expect(row.policy_id).toBe(POL_ID);
    const peekCall = query.mock.calls.find(
      ([sql]) =>
        String(sql).includes('FROM public.hrm_insurance_policies') &&
        String(sql).includes('id = $1::uuid'),
    );
    expect(peekCall).toBeDefined();
  });

  it('missing employee_id → HRM-INS-EMP-404', async () => {
    mockHappyPath({
      policies: [{ id: POL_ID, insurer_key: 'bao_viet' }],
    });
    const token = GROUP_CEO_TOKEN();
    await expect(
      service.createInsurancePolicyParticipant(
        {
          company_id: 'main',
          insurer_key: 'bao_viet',
          employee_code: 'NV001',
          employee_name: 'QA BH',
        },
        `Bearer ${token}`,
      ),
    ).rejects.toThrow(
      expect.objectContaining<Partial<ApiException>>({
        code: HRM_INS_EMP_404,
      }),
    );
  });
});
