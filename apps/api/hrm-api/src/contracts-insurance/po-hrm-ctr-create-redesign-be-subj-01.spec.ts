import { ApiException } from '../common/api.exception';
import { HrmDbService } from '../db/hrm-db.service';
import {
  ContractsInsuranceService,
  HRM_CTR_CANDIDATE_404,
  HRM_CTR_SIGN_REQ_400,
  HRM_CTR_SUBJECT_400,
} from './contracts-insurance.service';

const CAND_ID = 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1';
const EMP_ID = '11111111-1111-4111-8111-111111111111';
const REC_LINK_ID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd1';

function schemaNoop(sql: string): boolean {
  const s = String(sql);
  return (
    s.includes('CREATE TABLE') ||
    s.includes('CREATE INDEX') ||
    s.includes('CREATE UNIQUE') ||
    s.includes('ALTER TABLE') ||
    (s.includes('INSERT INTO public.employee_contracts') &&
      s.includes('holding'))
  );
}

describe('PO-HRM-CTR-CREATE-REDESIGN-BE-SUBJ-01', () => {
  it('wizard candidate create persists candidate_id with null employee_id', async () => {
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
          if (s.includes('INSERT INTO public.employee_contracts')) {
            expect(params?.[2]).toBeNull();
            expect(params?.[3]).toBe(CAND_ID);
            expect(params?.[5]).toBe('candidate');
            return {
              rows: [
                {
                  id: 'ct-cand-1',
                  company_id: 'holding',
                  employee_id: null,
                  candidate_id: CAND_ID,
                  requisition_id: null,
                  subject_type: 'candidate',
                  contract_type: 'indefinite',
                  start_date: '2026-01-01',
                  end_date: null,
                  status: 'active',
                  signed_at: '2026-01-02',
                  work_arrangement: 'full_time',
                  salary_ratio_percent: 100,
                  contract_abstract: 'Trich yeu',
                  created_at: '2026-01-01T00:00:00.000Z',
                  updated_at: '2026-01-01T00:00:00.000Z',
                },
              ],
            };
          }
          return { rows: [] };
        }),
    } as unknown as HrmDbService;
    const service = new ContractsInsuranceService(db);
    const row = await service.createContract({
      company_id: 'holding',
      subject_type: 'candidate',
      candidate_id: CAND_ID,
      contract_type: 'indefinite',
      start_date: '2026-01-01',
      position_key: 'NV_KD',
      signing_date: '2026-01-02',
      work_form: 'full_time',
      salary_ratio_percent: 100,
      abstract: 'Trich yeu',
    });
    expect(row.candidate_id).toBe(CAND_ID);
    expect(row.employee_id).toBeNull();
    expect(row.signing_date).toBe('2026-01-02');
    expect(row.contract_abstract).toBe('Trich yeu');
  });

  it('rejects wizard persist without signed_at (HRM-CTR-SIGN-REQ-400)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaNoop(String(sql))) return { rows: [] };
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const service = new ContractsInsuranceService(db);
    await expect(
      service.createContract({
        company_id: 'holding',
        subject_type: 'candidate',
        candidate_id: CAND_ID,
        contract_type: 'indefinite',
        start_date: '2026-01-01',
        position_key: 'NV_KD',
        salary_ratio_percent: 100,
      }),
    ).rejects.toMatchObject<ApiException>({ code: HRM_CTR_SIGN_REQ_400 });
  });

  it('rejects candidate path without candidate_id (HRM-CTR-SUBJECT-400)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaNoop(String(sql))) return { rows: [] };
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const service = new ContractsInsuranceService(db);
    await expect(
      service.createContract({
        company_id: 'holding',
        subject_type: 'candidate',
        contract_type: 'indefinite',
        start_date: '2026-01-01',
        position_key: 'NV_KD',
        signing_date: '2026-01-02',
        salary_ratio_percent: 100,
      }),
    ).rejects.toMatchObject<ApiException>({ code: HRM_CTR_SUBJECT_400 });
  });

  it('employee subject_type without REC trace succeeds (NV-first BA-03)', async () => {
    const db = {
      query: jest
        .fn()
        .mockImplementation(async (sql: string, params?: unknown[]) => {
          const s = String(sql);
          if (schemaNoop(s)) return { rows: [] };
          if (s.includes('INSERT INTO public.employee_contracts')) {
            expect(params?.[2]).toBe(EMP_ID);
            expect(params?.[5]).toBe('employee');
            return {
              rows: [
                {
                  id: 'ct-emp-legacy-nv',
                  company_id: 'holding',
                  employee_id: EMP_ID,
                  candidate_id: null,
                  subject_type: 'employee',
                  contract_type: 'indefinite',
                  start_date: '2026-01-01',
                  end_date: null,
                  status: 'active',
                  signed_at: '2026-01-02',
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
    const service = new ContractsInsuranceService(db);
    const row = await service.createContract({
      company_id: 'holding',
      subject_type: 'employee',
      employee_id: EMP_ID,
      contract_type: 'indefinite',
      start_date: '2026-01-01',
      position_key: 'NV_KD',
      signing_date: '2026-01-02',
      work_form: 'full_time',
      salary_ratio_percent: 100,
    });
    expect(row.subject_type).toBe('employee');
    expect(row.employee_id).toBe(EMP_ID);
    const recTraceCalls = (db.query as jest.Mock).mock.calls.filter(
      (c) =>
        String(c[0]).includes('FROM public.recruitment_candidates') &&
        String(c[0]).includes('employee_id ='),
    );
    expect(recTraceCalls).toHaveLength(0);
  });

  it('listContracts includes candidate_label display fields', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (schemaNoop(s)) return { rows: [] };
        if (s.includes('FROM public.employee_contracts ec')) {
          return {
            rows: [
              {
                id: 'ct-cand-1',
                company_id: 'holding',
                employee_id: null,
                candidate_id: CAND_ID,
                requisition_id: null,
                subject_type: 'candidate',
                contract_type: 'indefinite',
                start_date: '2026-01-01',
                end_date: null,
                status: 'active',
                signed_at: '2026-01-02',
                work_arrangement: 'full_time',
                salary_ratio_percent: 100,
                contract_abstract: 'abc',
                candidate_name: 'Tran UV',
                created_at: '2026-01-01T00:00:00.000Z',
                updated_at: '2026-01-01T00:00:00.000Z',
              },
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const service = new ContractsInsuranceService(db);
    const result = await service.listContracts({ company_id: 'holding' });
    expect(result.data[0].candidate_label).toBe('Tran UV');
    expect(result.data[0].signing_date).toBe('2026-01-02');
    const listSql = (db.query as jest.Mock).mock.calls.find((c) =>
      String(c[0]).includes('recruitment_candidates rc'),
    )?.[0] as string;
    expect(listSql).toContain('recruitment_candidates rc');
  });

  it('candidate out of scope → HRM-CTR-CANDIDATE-404', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaNoop(String(sql))) return { rows: [] };
        if (String(sql).includes('FROM public.recruitment_candidates'))
          return { rows: [] };
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const service = new ContractsInsuranceService(db);
    await expect(
      service.createContract({
        company_id: 'holding',
        subject_type: 'candidate',
        candidate_id: CAND_ID,
        contract_type: 'indefinite',
        start_date: '2026-01-01',
        position_key: 'NV_KD',
        signing_date: '2026-01-02',
        salary_ratio_percent: 100,
      }),
    ).rejects.toMatchObject<ApiException>({ code: HRM_CTR_CANDIDATE_404 });
  });

  it('legacy employee create without wizard fields still allowed (UF-HRM-02)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (schemaNoop(s)) return { rows: [] };
        if (s.includes('INSERT INTO public.employee_contracts')) {
          return {
            rows: [
              {
                id: 'ct-emp-legacy',
                company_id: 'holding',
                employee_id: EMP_ID,
                contract_type: 'indefinite',
                start_date: '2026-01-01',
                end_date: null,
                status: 'active',
                created_at: '2026-01-01T00:00:00.000Z',
                updated_at: '2026-01-01T00:00:00.000Z',
              },
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const service = new ContractsInsuranceService(db);
    const row = await service.createContract({
      company_id: 'holding',
      employee_id: EMP_ID,
      position_key: 'NV_KD',
      contract_type: 'indefinite',
      start_date: '2026-01-01',
    });
    expect(row.employee_id).toBe(EMP_ID);
  });

  it('employee subject_type with REC link succeeds', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (schemaNoop(s)) return { rows: [] };
        if (
          s.includes('FROM public.recruitment_candidates') &&
          s.includes('employee_id =')
        ) {
          return { rows: [{ id: REC_LINK_ID }] };
        }
        if (s.includes('INSERT INTO public.employee_contracts')) {
          return {
            rows: [
              {
                id: 'ct-emp-rec',
                company_id: 'holding',
                employee_id: EMP_ID,
                candidate_id: null,
                subject_type: 'employee',
                contract_type: 'indefinite',
                start_date: '2026-01-01',
                end_date: null,
                status: 'active',
                signed_at: '2026-01-02',
                salary_ratio_percent: 80,
                created_at: '2026-01-01T00:00:00.000Z',
                updated_at: '2026-01-01T00:00:00.000Z',
              },
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const service = new ContractsInsuranceService(db);
    const row = await service.createContract({
      company_id: 'holding',
      subject_type: 'employee',
      employee_id: EMP_ID,
      contract_type: 'indefinite',
      start_date: '2026-01-01',
      position_key: 'NV_KD',
      signing_date: '2026-01-02',
      work_form: 'full_time',
      salary_ratio_percent: 80,
    });
    expect(row.subject_type).toBe('employee');
    expect(row.employee_id).toBe(EMP_ID);
  });
});
