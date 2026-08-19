/**
 * PO-HRM-MVP-GD1-REC-07-CLUSTER-BE-01 — UC-BP-REC-07
 * ensureSchema reverse+audit · POST accept-offer create/link/idempotent · PAY-403 · U19
 */
import { ApiException } from '../common/api.exception';
import { HrmDbService } from '../db/hrm-db.service';
import {
  EMP_STATUS_PENDING_DOCS,
  HRM_REC_HIRE_CANCELLED,
  HRM_REC_HIRE_DUP,
  HRM_REC_HIRE_OFFER_INVALID,
  HRM_REC_HIRE_PREFILL_FAIL,
  HRM_REC_PAY_403,
  OFFER_ACCEPTED_EVENT,
} from './rec-hire.constants';
import { RecruitmentService } from './recruitment.service';

const APP_ID = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
const REQ_ID = 'b2c3d4e5-f6a7-4890-b123-456789abcdef';
const EMP_ID = 'c3d4e5f6-a7b8-4901-c234-56789abcdef0';
const EMP_OTHER = 'd4e5f6a7-b8c9-4012-d345-6789abcdef01';
const HOLDING = 'holding';
const MEMBER = 'du-lich';

function mockBridge() {
  return {
    ensureSchema: jest.fn().mockResolvedValue(undefined),
    assertNotLockedOrThrow: jest.fn(),
    startRecruitmentWorkflowIfConfigured: jest.fn().mockResolvedValue(null),
  };
}

function offerAppRow(overrides: Record<string, unknown> = {}) {
  return {
    id: APP_ID,
    company_id: HOLDING,
    requisition_id: REQ_ID,
    full_name: 'Nguyễn Văn Offer',
    email: 'offer.nv@xe.vn',
    source: 'referral',
    status: 'offer',
    employee_id: null,
    pool_candidate_id: null,
    offer_accepted_at: null,
    offer_accepted_by: null,
    accepted_application_id: null,
    offer_id: null,
    yctd_company_id: HOLDING,
    department_key: 'ops',
    position_key: 'driver',
    pool_phone: '0901234567',
    ...overrides,
  };
}

function empRow(overrides: Record<string, unknown> = {}) {
  return {
    id: EMP_ID,
    company_id: HOLDING,
    employee_code: 'HIRE-HOLDING-001',
    email: 'offer.nv@xe.vn',
    full_name: 'Nguyễn Văn Offer',
    job_title_key: 'driver',
    status: EMP_STATUS_PENDING_DOCS,
    hired_at: '2026-09-01',
    candidate_id: APP_ID,
    custom_fields: { phone_number: '0901234567', department_key: 'ops' },
    ...overrides,
  };
}

describe('PO-HRM-MVP-GD1-REC-07-CLUSTER-BE-01 accept-offer', () => {
  let service: RecruitmentService;
  let db: jest.Mocked<Pick<HrmDbService, 'query' | 'withTransaction'>>;

  beforeEach(() => {
    db = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
      withTransaction: jest.fn(async (fn) => fn(db.query)),
    };
    service = new RecruitmentService(db as unknown as HrmDbService, mockBridge() as never);
  });

  it('ensureSchema ADD employees.candidate_id + Lane A accept-audit (DATA-01)', async () => {
    const sqlLog: string[] = [];
    db.query.mockImplementation(async (sql: string) => {
      sqlLog.push(sql);
      return { rows: [] } as never;
    });
    await expect(service.getCandidateById(APP_ID, HOLDING)).rejects.toMatchObject({
      code: 'HRM-REC-404',
    });
    const joined = sqlLog.join('\n');
    expect(joined).toMatch(/ALTER TABLE public\.employees[\s\S]*candidate_id UUID NULL/);
    expect(joined).toMatch(/idx_employees_candidate_id_active/);
    expect(joined).toMatch(/offer_accepted_at TIMESTAMPTZ NULL/);
    expect(joined).toMatch(/accepted_application_id UUID NULL/);
    expect(joined).toMatch(/idx_rec_cand_accepted_app/);
    expect(joined).not.toMatch(/CREATE TABLE IF NOT EXISTS public\.rec_hire/);
    expect(joined).not.toMatch(/FOREIGN KEY \(employee_id\) REFERENCES public\.employees/);
    expect(joined).not.toMatch(/\/rec\//);
  });

  it('CREATE happy — pending_docs + soft stamp + reverse · no stage UPDATE · event echo', async () => {
    const sqlLog: string[] = [];
    let createdEmpId = EMP_ID;
    db.query.mockImplementation(async (sql: string, params?: unknown[]) => {
      sqlLog.push(sql);
      if (
        sql.includes('FROM public.recruitment_candidates c') &&
        sql.includes('INNER JOIN public.job_requisitions') &&
        sql.includes('LIMIT 1')
      ) {
        return { rows: [offerAppRow()] } as never;
      }
      if (sql.includes('WHERE candidate_id = $1::uuid AND archived_at IS NULL')) {
        // Pre-create reverse empty; post-stamp reverse returns created emp.
        if (sqlLog.filter((s) => s.includes('INSERT INTO public.employees')).length > 0) {
          return { rows: [{ id: createdEmpId, company_id: HOLDING }] } as never;
        }
        return { rows: [] } as never;
      }
      if (sql.includes('INSERT INTO public.employees')) {
        createdEmpId = String(params?.[0] ?? EMP_ID);
        return {
          rows: [
            empRow({
              id: createdEmpId,
              employee_code: String(params?.[2] ?? 'HIRE-X'),
              hired_at: params?.[7] ?? null,
            }),
          ],
        } as never;
      }
      if (sql.includes('UPDATE public.recruitment_candidates') && sql.includes('employee_id')) {
        return {
          rows: [
            {
              offer_accepted_at: '2026-08-09T02:00:00.000Z',
              offer_accepted_by: 'actor-1',
              accepted_application_id: APP_ID,
              offer_id: null,
            },
          ],
        } as never;
      }
      // Post-stamp soft seal (assertPersistedHireSoftLinkOrThrow)
      if (
        sql.includes('FROM public.recruitment_candidates') &&
        sql.includes('employee_id::text AS employee_id') &&
        !sql.includes('INNER JOIN') &&
        sql.includes('WHERE id = $1::uuid')
      ) {
        return { rows: [{ employee_id: createdEmpId }] } as never;
      }
      if (sql.includes('FROM public.employees') && sql.includes('id = $1::uuid')) {
        return { rows: [empRow({ id: createdEmpId })] } as never;
      }
      return { rows: [] } as never;
    });

    const dto = await service.acceptOfferApplication(
      APP_ID,
      { expected_start_date: '2026-09-01' },
      HOLDING,
      undefined,
      undefined,
      { actorId: 'actor-1' },
    );
    expect(dto.mode).toBe('created');
    expect(dto.status).toBe(EMP_STATUS_PENDING_DOCS);
    expect(dto.employee_id).toBeTruthy();
    expect(dto.full_name).toBe('Nguyễn Văn Offer');
    expect(dto.phone_number).toBe('0901234567');
    expect(dto.department_key).toBe('ops');
    expect(dto.event).toBe(OFFER_ACCEPTED_EVENT);
    expect(dto.history_id).toBeNull();
    expect(sqlLog.some((s) => s.includes('INSERT INTO public.employees'))).toBe(true);
    expect(
      sqlLog.some(
        (s) =>
          s.includes('UPDATE public.recruitment_candidates') && s.includes('SET status'),
      ),
    ).toBe(false);
  });

  it('idempotent re-accept → same employee_id · no second INSERT · preserve offer_accepted_at', async () => {
    let empInserts = 0;
    db.query.mockImplementation(async (sql: string) => {
      if (
        sql.includes('FROM public.recruitment_candidates c') &&
        sql.includes('INNER JOIN public.job_requisitions')
      ) {
        return {
          rows: [
            offerAppRow({
              employee_id: EMP_ID,
              offer_accepted_at: '2026-08-09T01:00:00.000Z',
              offer_accepted_by: 'first-actor',
              accepted_application_id: APP_ID,
            }),
          ],
        } as never;
      }
      if (sql.includes('WHERE candidate_id = $1::uuid AND archived_at IS NULL')) {
        return { rows: [{ id: EMP_ID, company_id: HOLDING }] } as never;
      }
      if (
        sql.includes('FROM public.recruitment_candidates') &&
        sql.includes('employee_id::text AS employee_id') &&
        !sql.includes('INNER JOIN') &&
        sql.includes('WHERE id = $1::uuid')
      ) {
        return { rows: [{ employee_id: EMP_ID }] } as never;
      }
      if (sql.includes('FROM public.employees') && sql.includes('id = $1::uuid')) {
        return { rows: [empRow()] } as never;
      }
      if (sql.includes('INSERT INTO public.employees')) {
        empInserts += 1;
        return { rows: [empRow()] } as never;
      }
      if (sql.includes('UPDATE public.recruitment_candidates') && sql.includes('employee_id')) {
        return {
          rows: [
            {
              offer_accepted_at: '2026-08-09T01:00:00.000Z',
              offer_accepted_by: 'first-actor',
              accepted_application_id: APP_ID,
              offer_id: null,
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const dto = await service.acceptOfferApplication(APP_ID, {}, HOLDING);
    expect(dto.mode).toBe('idempotent');
    expect(dto.employee_id).toBe(EMP_ID);
    expect(dto.offer_accepted_at).toBe('2026-08-09T01:00:00.000Z');
    expect(dto.offer_accepted_by).toBe('first-actor');
    expect(empInserts).toBe(0);
  });

  it('true conflict soft vs reverse → HRM-REC-HIRE-DUP', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (
        sql.includes('FROM public.recruitment_candidates c') &&
        sql.includes('INNER JOIN public.job_requisitions')
      ) {
        return { rows: [offerAppRow({ employee_id: EMP_ID })] } as never;
      }
      if (sql.includes('WHERE candidate_id = $1::uuid AND archived_at IS NULL')) {
        return { rows: [{ id: EMP_OTHER, company_id: HOLDING }] } as never;
      }
      return { rows: [] } as never;
    });
    await expect(service.acceptOfferApplication(APP_ID, {}, HOLDING)).rejects.toMatchObject({
      code: HRM_REC_HIRE_DUP,
    });
  });

  it('not offer-ready → HRM-REC-HIRE-OFFER-INVALID · no emp INSERT', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (
        sql.includes('FROM public.recruitment_candidates c') &&
        sql.includes('INNER JOIN public.job_requisitions')
      ) {
        return { rows: [offerAppRow({ status: 'interview' })] } as never;
      }
      return { rows: [] } as never;
    });
    await expect(service.acceptOfferApplication(APP_ID, {}, HOLDING)).rejects.toMatchObject({
      code: HRM_REC_HIRE_OFFER_INVALID,
    });
    expect(db.query.mock.calls.some(([sql]) => String(sql).includes('INSERT INTO public.employees'))).toBe(
      false,
    );
  });

  it('cancelled stage → HRM-REC-HIRE-CANCELLED', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (
        sql.includes('FROM public.recruitment_candidates c') &&
        sql.includes('INNER JOIN public.job_requisitions')
      ) {
        return { rows: [offerAppRow({ status: 'cancelled' })] } as never;
      }
      return { rows: [] } as never;
    });
    await expect(service.acceptOfferApplication(APP_ID, {}, HOLDING)).rejects.toMatchObject({
      code: HRM_REC_HIRE_CANCELLED,
    });
  });

  it('missing full_name → HRM-REC-HIRE-PREFILL-FAIL', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (
        sql.includes('FROM public.recruitment_candidates c') &&
        sql.includes('INNER JOIN public.job_requisitions')
      ) {
        return { rows: [offerAppRow({ full_name: '   ' })] } as never;
      }
      if (sql.includes('WHERE candidate_id = $1::uuid')) {
        return { rows: [] } as never;
      }
      return { rows: [] } as never;
    });
    await expect(service.acceptOfferApplication(APP_ID, {}, HOLDING)).rejects.toMatchObject({
      code: HRM_REC_HIRE_PREFILL_FAIL,
    });
  });

  it('payroll body → HRM-REC-PAY-403 before mutate', async () => {
    await expect(
      service.acceptOfferApplication(
        APP_ID,
        { expected_start_date: '2026-09-01', base_salary: 20_000_000 } as never,
        HOLDING,
      ),
    ).rejects.toMatchObject({ code: HRM_REC_PAY_403 });
    expect(db.query.mock.calls.length).toBe(0);
  });

  it('U19 cross-company YCTD mismatch → HRM-REC-HIRE-409', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (
        sql.includes('FROM public.recruitment_candidates c') &&
        sql.includes('INNER JOIN public.job_requisitions')
      ) {
        return {
          rows: [offerAppRow({ company_id: HOLDING, yctd_company_id: MEMBER })],
        } as never;
      }
      return { rows: [] } as never;
    });
    await expect(service.acceptOfferApplication(APP_ID, {}, HOLDING)).rejects.toMatchObject({
      code: 'HRM-REC-HIRE-409',
    });
  });

  it('thin candidate alias without YCTD neo → OFFER-INVALID', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.recruitment_candidates c') && sql.includes('LIMIT 1')) {
        return { rows: [{ id: APP_ID, requisition_id: null }] } as never;
      }
      return { rows: [] } as never;
    });
    await expect(service.acceptOfferByCandidateId(APP_ID, {}, HOLDING)).rejects.toMatchObject({
      code: HRM_REC_HIRE_OFFER_INVALID,
    });
  });

  it('DENY Nest /rec dual · no second hire SoT invent in ensureSchema', async () => {
    const sqlLog: string[] = [];
    db.query.mockImplementation(async (sql: string) => {
      sqlLog.push(sql);
      return { rows: [] } as never;
    });
    await expect(service.getCandidateById(APP_ID, HOLDING)).rejects.toBeInstanceOf(ApiException);
    const joined = sqlLog.join('\n');
    expect(joined).not.toMatch(/CREATE TABLE IF NOT EXISTS public\.rec_offer/);
    expect(joined).not.toMatch(/CREATE TABLE IF NOT EXISTS public\.rec_hire_event/);
    expect(joined).not.toMatch(/REFERENCES public\.employees \(id\)/);
  });
});
