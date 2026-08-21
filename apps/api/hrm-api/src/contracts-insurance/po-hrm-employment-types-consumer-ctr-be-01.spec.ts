import { ApiException } from '../common/api.exception';
import { HrmDbService } from '../db/hrm-db.service';
import { SettingsCatalogsService } from '../settings-catalogs/settings-catalogs.service';
import { HRM_EMP_ET_UNKNOWN } from '../employees/emp-employment-type.constants';
import type { EmpEmploymentTypeService } from '../employees/emp-employment-type.service';
import {
  ContractsInsuranceService,
  HRM_CTR_WORK_FORM_400,
} from './contracts-insurance.service';

const EMP_ET_KEY = 'fidmz_full_time_emp';
const CONTRACT_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const EMP_ID = '11111111-1111-4111-8111-111111111111';
const CAND_ID = 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1';

function schemaNoop(sql: string): boolean {
  const s = String(sql);
  return (
    s.includes('CREATE TABLE') ||
    s.includes('CREATE INDEX') ||
    s.includes('CREATE UNIQUE') ||
    s.includes('ALTER TABLE')
  );
}

describe('PO-HRM-EMPLOYMENT-TYPES-CONSUMER-CTR-BE-01', () => {
  const empCatalog = {
    assertEmploymentTypeInEffectiveCatalog: jest.fn(),
    listEffective: jest.fn(),
  } as unknown as jest.Mocked<EmpEmploymentTypeService>;

  const settingsCatalogs = {
    getEffectiveItemsForKey: jest.fn(),
    assertCodeInEffectiveCatalog: jest.fn(),
  } as unknown as jest.Mocked<SettingsCatalogsService>;

  beforeEach(() => {
    jest.clearAllMocks();
    settingsCatalogs.getEffectiveItemsForKey.mockImplementation(
      async (_t, _c, key: string) => {
        if (key === 'job_titles') {
          return [{ code: 'NV_KD', label: 'NV KD', status: 'active' }];
        }
        if (key === 'contract_types') {
          return [
            { code: 'indefinite', label: 'Không thời hạn', status: 'active' },
          ];
        }
        if (key === 'work_arrangements') {
          return [
            { code: 'full_time', label: 'Toàn thời gian', status: 'active' },
          ];
        }
        return [];
      },
    );
    settingsCatalogs.assertCodeInEffectiveCatalog.mockImplementation(
      async ({ code, catalogKey }) => ({
        code,
        label: String(catalogKey),
        status: 'active',
      }),
    );
  });

  function dbWithContractCount(db: HrmDbService): HrmDbService {
    const base = db.query as jest.Mock;
    db.query = jest
      .fn()
      .mockImplementation(async (sql: string, params?: unknown[]) => {
        const s = String(sql);
        if (
          s.includes('COUNT(*)::text AS total FROM public.employee_contracts')
        ) {
          return { rows: [{ total: '1' }] };
        }
        if (
          s.includes('COUNT(*)::text AS total FROM public.employee_insurance')
        ) {
          return { rows: [{ total: '1' }] };
        }
        return base(sql, params);
      }) as typeof db.query;
    return db;
  }

  it('accepts work_arrangement from EMP effective union (not work_arrangements only)', async () => {
    empCatalog.assertEmploymentTypeInEffectiveCatalog.mockResolvedValue({
      employmentTypeKey: EMP_ET_KEY,
      nameVi: 'Toàn thời gian (EMP)',
      source: 'emp_native',
      sortOrder: 1,
      countsTowardHeadcount: true,
      eligibleForSi: true,
      isContingent: false,
      status: 'active',
    });

    const db = {
      query: jest
        .fn()
        .mockImplementation(async (sql: string, params?: unknown[]) => {
          const s = String(sql);
          if (schemaNoop(s)) return { rows: [] };
          if (
            s.includes('FROM public.recruitment_candidates') &&
            s.includes('WHERE id =')
          ) {
            return {
              rows: [
                {
                  id: CAND_ID,
                  company_id: 'holding',
                  full_name: 'Tran UV',
                  requisition_id: null,
                },
              ],
            };
          }
          if (
            s.includes('INSERT INTO public.employee_contracts') &&
            s.includes('work_arrangement')
          ) {
            expect(params).toEqual(expect.arrayContaining([EMP_ET_KEY]));
            return {
              rows: [
                {
                  id: 'ct-emp-wa-1',
                  company_id: 'holding',
                  employee_id: null,
                  candidate_id: CAND_ID,
                  subject_type: 'candidate',
                  contract_type: 'indefinite',
                  start_date: '2026-01-01',
                  end_date: null,
                  status: 'active',
                  signed_at: '2026-01-02',
                  work_arrangement: EMP_ET_KEY,
                  salary_ratio_percent: 100,
                  created_at: '2026-01-01T00:00:00.000Z',
                  updated_at: '2026-01-01T00:00:00.000Z',
                },
              ],
            };
          }
          return { rows: [] };
        }),
    } as unknown as HrmDbService;

    empCatalog.listEffective.mockResolvedValue({
      total: 1,
      data: [
        {
          employmentTypeKey: EMP_ET_KEY,
          nameVi: 'Toàn thời gian (EMP)',
          source: 'emp_native',
          sortOrder: 1,
          countsTowardHeadcount: true,
          eligibleForSi: true,
          isContingent: false,
          status: 'active',
        },
      ],
    });

    const service = new ContractsInsuranceService(
      dbWithContractCount(db),
      settingsCatalogs,
      undefined,
      undefined,
      empCatalog,
    );
    const row = await service.createContract(
      {
        company_id: 'holding',
        subject_type: 'candidate',
        candidate_id: CAND_ID,
        contract_type: 'indefinite',
        start_date: '2026-01-01',
        position_key: 'NV_KD',
        signing_date: '2026-01-02',
        work_arrangement: EMP_ET_KEY,
        salary_ratio_percent: 100,
      },
      undefined,
    );
    expect(row.work_arrangement).toBe(EMP_ET_KEY);
    expect(
      empCatalog.assertEmploymentTypeInEffectiveCatalog,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        employmentType: EMP_ET_KEY,
        companyId: 'holding',
      }),
    );
    expect(
      settingsCatalogs.assertCodeInEffectiveCatalog,
    ).not.toHaveBeenCalledWith(
      expect.objectContaining({ catalogKey: 'work_arrangements' }),
    );
  });

  it('falls back to work_arrangements when code missing from EMP effective', async () => {
    empCatalog.assertEmploymentTypeInEffectiveCatalog.mockRejectedValue(
      new ApiException(HRM_EMP_ET_UNKNOWN, 'missing', 400),
    );
    settingsCatalogs.getEffectiveItemsForKey.mockResolvedValue([
      { code: 'full_time', label: 'Toàn thời gian', status: 'active' },
    ]);
    settingsCatalogs.assertCodeInEffectiveCatalog.mockImplementation(
      async ({ code, catalogKey }) => {
        if (catalogKey === 'work_arrangements' && code === 'full_time') {
          return {
            code: 'full_time',
            label: 'Toàn thời gian',
            status: 'active',
          };
        }
        return { code, label: String(catalogKey), status: 'active' };
      },
    );

    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaNoop(String(sql))) return { rows: [] };
        if (String(sql).includes('FROM public.recruitment_candidates')) {
          return {
            rows: [
              {
                id: CAND_ID,
                company_id: 'holding',
                full_name: 'Tran UV',
                requisition_id: null,
              },
            ],
          };
        }
        if (String(sql).includes('INSERT INTO public.employee_contracts')) {
          return {
            rows: [
              {
                id: 'ct-wa-legacy',
                company_id: 'holding',
                employee_id: null,
                candidate_id: CAND_ID,
                subject_type: 'candidate',
                contract_type: 'indefinite',
                start_date: '2026-01-01',
                end_date: null,
                status: 'active',
                signed_at: '2026-01-02',
                work_arrangement: 'full_time',
                salary_ratio_percent: 100,
                created_at: '2026-01-01T00:00:00.000Z',
                updated_at: '2026-01-01T00:00:00.000Z',
              },
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;

    empCatalog.listEffective.mockResolvedValue({ total: 0, data: [] });
    const service = new ContractsInsuranceService(
      dbWithContractCount(db),
      settingsCatalogs,
      undefined,
      undefined,
      empCatalog,
    );
    await expect(
      service.createContract({
        company_id: 'holding',
        subject_type: 'candidate',
        candidate_id: CAND_ID,
        contract_type: 'indefinite',
        start_date: '2026-01-01',
        position_key: 'NV_KD',
        signing_date: '2026-01-02',
        work_form: 'full_time',
        salary_ratio_percent: 100,
      }),
    ).resolves.toMatchObject({ work_arrangement: 'full_time' });
    expect(settingsCatalogs.assertCodeInEffectiveCatalog).toHaveBeenCalledWith(
      expect.objectContaining({
        catalogKey: 'work_arrangements',
        code: 'full_time',
      }),
    );
  });

  it('PATCH update validates EMP effective work_arrangement', async () => {
    empCatalog.assertEmploymentTypeInEffectiveCatalog.mockResolvedValue({
      employmentTypeKey: EMP_ET_KEY,
      nameVi: 'Toàn thời gian (EMP)',
      source: 'emp_native',
      sortOrder: 1,
      countsTowardHeadcount: true,
      eligibleForSi: true,
      isContingent: false,
      status: 'active',
    });
    empCatalog.listEffective.mockResolvedValue({
      total: 1,
      data: [
        {
          employmentTypeKey: EMP_ET_KEY,
          nameVi: 'Toàn thời gian (EMP)',
          source: 'emp_native',
          sortOrder: 1,
          countsTowardHeadcount: true,
          eligibleForSi: true,
          isContingent: false,
          status: 'active',
        },
      ],
    });

    const db = {
      query: jest
        .fn()
        .mockImplementation(async (sql: string, params?: unknown[]) => {
          const s = String(sql);
          if (schemaNoop(s)) return { rows: [] };
          if (
            s.includes('FROM public.employee_contracts') &&
            s.includes('archived_at IS NULL LIMIT 1')
          ) {
            return { rows: [{ company_id: 'holding' }] };
          }
          if (
            s.includes('UPDATE public.employee_contracts SET') &&
            s.includes('work_arrangement')
          ) {
            expect(params).toEqual(
              expect.arrayContaining([EMP_ET_KEY, CONTRACT_ID]),
            );
            return { rows: [] };
          }
          if (
            s.includes('FROM public.employee_contracts ec') &&
            s.includes('WHERE ec.id')
          ) {
            return {
              rows: [
                {
                  id: CONTRACT_ID,
                  company_id: 'holding',
                  employee_id: EMP_ID,
                  contract_type: 'indefinite',
                  start_date: '2026-01-01',
                  end_date: null,
                  status: 'active',
                  work_arrangement: EMP_ET_KEY,
                  created_at: '2026-01-01T00:00:00.000Z',
                  updated_at: '2026-01-02T00:00:00.000Z',
                },
              ],
            };
          }
          if (
            s.includes('UPDATE public.employee_contracts') &&
            s.includes('contract_type = COALESCE')
          ) {
            return {
              rows: [
                {
                  id: CONTRACT_ID,
                  company_id: 'holding',
                  employee_id: EMP_ID,
                  contract_type: 'indefinite',
                  start_date: '2026-01-01',
                  end_date: null,
                  status: 'active',
                  created_at: '2026-01-01T00:00:00.000Z',
                  updated_at: '2026-01-02T00:00:00.000Z',
                },
              ],
            };
          }
          if (
            s.includes('UPDATE public.employee_contracts SET') &&
            s.includes('work_arrangement')
          ) {
            return { rows: [] };
          }
          return { rows: [] };
        }),
    } as unknown as HrmDbService;

    const service = new ContractsInsuranceService(
      dbWithContractCount(db),
      settingsCatalogs,
      undefined,
      undefined,
      empCatalog,
    );
    const row = await service.updateContract(
      CONTRACT_ID,
      { work_arrangement: EMP_ET_KEY },
      'holding',
      undefined,
    );
    expect(row.work_arrangement).toBe(EMP_ET_KEY);
    expect(row.work_form_label_vi).toBe('Toàn thời gian (EMP)');
  });

  it('rejects unknown work_arrangement when EMP and work_arrangements both miss', async () => {
    empCatalog.assertEmploymentTypeInEffectiveCatalog.mockRejectedValue(
      new ApiException(HRM_EMP_ET_UNKNOWN, 'missing', 400),
    );
    settingsCatalogs.getEffectiveItemsForKey.mockResolvedValue([
      { code: 'full_time', label: 'FT', status: 'active' },
    ]);
    settingsCatalogs.assertCodeInEffectiveCatalog.mockRejectedValue(
      new ApiException(HRM_CTR_WORK_FORM_400, 'bad', 400),
    );

    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaNoop(String(sql))) return { rows: [] };
        if (String(sql).includes('FROM public.recruitment_candidates')) {
          return {
            rows: [
              {
                id: CAND_ID,
                company_id: 'holding',
                full_name: 'Tran UV',
                requisition_id: null,
              },
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;

    const service = new ContractsInsuranceService(
      dbWithContractCount(db),
      settingsCatalogs,
      undefined,
      undefined,
      empCatalog,
    );
    await expect(
      service.createContract({
        company_id: 'holding',
        subject_type: 'candidate',
        candidate_id: CAND_ID,
        contract_type: 'indefinite',
        start_date: '2026-01-01',
        position_key: 'NV_KD',
        signing_date: '2026-01-02',
        work_arrangement: 'not_a_real_code',
        salary_ratio_percent: 100,
      }),
    ).rejects.toMatchObject({ code: HRM_CTR_WORK_FORM_400 });
  });
});
