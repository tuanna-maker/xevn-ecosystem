/**
 * PO-HRM-CTR-WORKSPACE-G4-CREATE-START-DATE-FIX-01
 * NV-first wizard Step1→2 — POST draft without start_date defaults today (HCM).
 */
import { HrmDbService } from '../db/hrm-db.service';
import { ContractsInsuranceService } from './contracts-insurance.service';

const EMP_ID = '33333333-3333-4333-8333-333333333333';
const TPL_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';

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

describe('PO-HRM-CTR-WORKSPACE-G4-CREATE-START-DATE-FIX-01', () => {
  it('createContract without start_date persists default ISO effective date for wizard draft', async () => {
    let insertStartDate: string | undefined;
    const db = {
      query: jest.fn().mockImplementation(async (sql: string, params?: unknown[]) => {
        const s = String(sql);
        if (schemaNoop(s)) return { rows: [] };
        if (s.includes('INSERT INTO public.employee_contracts')) {
          insertStartDate = params?.[8] as string;
          return {
            rows: [
              {
                id: 'ct-wizard-draft-1',
                company_id: 'holding',
                employee_id: EMP_ID,
                candidate_id: null,
                requisition_id: null,
                subject_type: 'employee',
                contract_type: 'indefinite',
                start_date: insertStartDate,
                end_date: null,
                status: 'active',
                template_id: TPL_ID,
                signed_at: '2026-08-11',
                work_arrangement: 'full_time',
                salary_ratio_percent: 100,
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
      employee_id: EMP_ID,
      contract_type: 'indefinite',
      position_key: 'NV_KD',
      template_id: TPL_ID,
      template_code: 'XEVN_FT_12M_DRIVER',
      signing_date: '2026-08-11',
      work_form: 'full_time',
      salary_ratio_percent: 100,
    });

    expect(insertStartDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(row.start_date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(insertStartDate).toBe(row.start_date);
  });

  it('createContract accepts effective_from alias when start_date omitted', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string, params?: unknown[]) => {
        const s = String(sql);
        if (schemaNoop(s)) return { rows: [] };
        if (s.includes('INSERT INTO public.employee_contracts')) {
          expect(params?.[8]).toBe('2026-09-01');
          return {
            rows: [
              {
                id: 'ct-alias-1',
                company_id: 'holding',
                employee_id: EMP_ID,
                contract_type: 'indefinite',
                start_date: '2026-09-01',
                end_date: null,
                status: 'active',
                created_at: '2026-09-01T00:00:00.000Z',
                updated_at: '2026-09-01T00:00:00.000Z',
              },
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const service = new ContractsInsuranceService(db);
    await service.createContract({
      company_id: 'holding',
      employee_id: EMP_ID,
      position_key: 'NV_KD',
      contract_type: 'indefinite',
      effective_from: '2026-09-01',
    });
  });
});
