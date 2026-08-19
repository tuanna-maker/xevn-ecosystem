/**
 * PO-HRM-CTR-WORKSPACE-G4-SUBJECT-REC-NV-FIRST-01
 * NV-first CREATE — legacy NV without REC→EMP trace must POST 2xx (BA-03 AC-CTR-SUBJECT-02).
 */
import { ApiException } from '../common/api.exception';
import { HrmDbService } from '../db/hrm-db.service';
import {
  ContractsInsuranceService,
  HRM_CTR_CANDIDATE_404,
  HRM_CTR_SUBJECT_400,
} from './contracts-insurance.service';

const NV101_ID = '33333333-3333-4333-8333-333333333333';
const CAND_ID = 'cccccccc-cccc-4ccc-8ccc-ccccccccccc1';

function schemaNoop(sql: string): boolean {
  const s = String(sql);
  return (
    s.includes('CREATE TABLE') ||
    s.includes('CREATE INDEX') ||
    s.includes('CREATE UNIQUE') ||
    s.includes('ALTER TABLE') ||
    (s.includes('INSERT INTO public.employee_contracts') && s.includes('holding'))
  );
}

describe('PO-HRM-CTR-WORKSPACE-G4-SUBJECT-REC-NV-FIRST-01', () => {
  it('NV-first wizard POST with subject_type=employee succeeds when candidate_id null on legacy NV', async () => {
    let insertEmployeeId: string | undefined;
    let insertSubjectType: string | undefined;
    const db = {
      query: jest.fn().mockImplementation(async (sql: string, params?: unknown[]) => {
        const s = String(sql);
        if (schemaNoop(s)) return { rows: [] };
        if (s.includes('INSERT INTO public.employee_contracts')) {
          insertEmployeeId = params?.[2] as string;
          insertSubjectType = params?.[5] as string;
          return {
            rows: [
              {
                id: 'ct-nv101-wizard',
                company_id: 'holding',
                employee_id: NV101_ID,
                candidate_id: null,
                requisition_id: null,
                subject_type: 'employee',
                contract_type: 'HDHV',
                start_date: '2026-08-11',
                end_date: null,
                status: 'active',
                signed_at: '2026-08-11',
                work_arrangement: 'full_time',
                salary_ratio_percent: 100,
                contract_abstract: 'QG4NVO3491G',
                created_at: '2026-08-11T00:00:00.000Z',
                updated_at: '2026-08-11T00:00:00.000Z',
              },
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;

    const service = new ContractsInsuranceService(db);
    const row = await service.createContract({
      company_id: 'main',
      subject_type: 'employee',
      employee_id: NV101_ID,
      contract_type: 'HDHV',
      position_key: 'NV_KD',
      start_date: '2026-08-11',
      end_date: '2027-08-10',
      signing_date: '2026-08-11',
      work_form: 'full_time',
      salary_ratio_percent: 100,
      abstract: 'QG4NVO3491G',
    });

    expect(insertEmployeeId).toBe(NV101_ID);
    expect(insertSubjectType).toBe('employee');
    expect(row.employee_id).toBe(NV101_ID);
    expect(row.candidate_id).toBeNull();
    expect(row.subject_type).toBe('employee');

    const recTraceCalls = (db.query as jest.Mock).mock.calls.filter((c) =>
      String(c[0]).includes('FROM public.recruitment_candidates') &&
      String(c[0]).includes('employee_id ='),
    );
    expect(recTraceCalls).toHaveLength(0);
  });

  it('candidate path still requires valid candidate in scope', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaNoop(String(sql))) return { rows: [] };
        if (String(sql).includes('FROM public.recruitment_candidates')) return { rows: [] };
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
        start_date: '2026-08-11',
        position_key: 'NV_KD',
        signing_date: '2026-08-11',
        salary_ratio_percent: 100,
      }),
    ).rejects.toMatchObject<ApiException>({ code: HRM_CTR_CANDIDATE_404 });
  });

  it('candidate path rejects missing candidate_id (HRM-CTR-SUBJECT-400)', async () => {
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
        start_date: '2026-08-11',
        position_key: 'NV_KD',
        signing_date: '2026-08-11',
        salary_ratio_percent: 100,
      }),
    ).rejects.toMatchObject<ApiException>({ code: HRM_CTR_SUBJECT_400 });
  });
});
