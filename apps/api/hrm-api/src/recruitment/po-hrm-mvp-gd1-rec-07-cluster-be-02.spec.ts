/**
 * PO-HRM-MVP-GD1-REC-07-CLUSTER-BE-02 — UC-BP-REC-07
 * FIX soft-link projection list↔get · idempotent gate before offer-ready · persisted assert
 */
import { ApiException } from '../common/api.exception';
import { HrmDbService } from '../db/hrm-db.service';
import {
  EMP_STATUS_PENDING_DOCS,
  HRM_REC_HIRE_400,
  HRM_REC_HIRE_OFFER_INVALID,
} from './rec-hire.constants';
import {
  assertPersistedHireSoftLinkOrThrow,
  type HireLinkDb,
} from './hire-employee-link';
import { RecruitmentService } from './recruitment.service';

const APP_ID = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
const REQ_ID = 'b2c3d4e5-f6a7-4890-b123-456789abcdef';
const EMP_ID = 'c3d4e5f6-a7b8-4901-c234-56789abcdef0';
const HOLDING = 'holding';

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

function mockPersistedSoftReverse(
  db: jest.Mocked<Pick<HrmDbService, 'query' | 'withTransaction'>>,
) {
  db.query.mockImplementation(async (sql: string) => {
    if (
      sql.includes('FROM public.recruitment_candidates c') &&
      sql.includes('INNER JOIN public.job_requisitions')
    ) {
      return {
        rows: [
          offerAppRow({
            status: 'hired',
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
    if (
      sql.includes('FROM public.employees') &&
      sql.includes('id = $1::uuid')
    ) {
      return { rows: [empRow()] } as never;
    }
    if (
      sql.includes('UPDATE public.recruitment_candidates') &&
      sql.includes('employee_id')
    ) {
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
}

describe('PO-HRM-MVP-GD1-REC-07-CLUSTER-BE-02 soft-link + idempotent gate', () => {
  let service: RecruitmentService;
  let db: jest.Mocked<Pick<HrmDbService, 'query' | 'withTransaction'>>;

  beforeEach(() => {
    db = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
      withTransaction: jest.fn(async (fn) => fn(db.query)),
    };
    service = new RecruitmentService(
      db as unknown as HrmDbService,
      mockBridge() as never,
    );
  });

  it('listCandidates SELECT projects employee_id (soft stamp)', async () => {
    const sqlLog: string[] = [];
    db.query.mockImplementation(async (sql: string) => {
      sqlLog.push(sql);
      if (sql.includes('COUNT(*)')) {
        return { rows: [{ total: '1' }] } as never;
      }
      if (
        sql.includes('FROM public.recruitment_candidates') &&
        sql.includes('LIMIT')
      ) {
        return {
          rows: [
            {
              id: APP_ID,
              company_id: HOLDING,
              requisition_id: REQ_ID,
              full_name: 'Nguyễn Văn Offer',
              email: 'offer.nv@xe.vn',
              source: 'referral',
              status: 'hired',
              employee_id: EMP_ID,
              created_at: '2026-08-09T00:00:00.000Z',
              updated_at: '2026-08-09T02:00:00.000Z',
              yctd_title: 'Tài xế',
              position_code: 'driver',
              position_name: 'Tài xế',
              active_interview_id: null,
              active_interview_status: null,
              active_interview_at: null,
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const res = await service.listCandidates({ company_id: HOLDING });
    expect(res.data[0]?.employee_id).toBe(EMP_ID);
    const listSql = sqlLog.find(
      (s) =>
        s.includes('FROM public.recruitment_candidates') && s.includes('LIMIT'),
    );
    expect(listSql).toMatch(/c\.employee_id::text AS employee_id/);
  });

  it('getCandidateById SELECT projects employee_id · list↔get parity', async () => {
    const sqlLog: string[] = [];
    db.query.mockImplementation(async (sql: string) => {
      sqlLog.push(sql);
      if (
        sql.includes('FROM public.recruitment_candidates') &&
        sql.includes('LIMIT 1')
      ) {
        return {
          rows: [
            {
              id: APP_ID,
              company_id: HOLDING,
              requisition_id: REQ_ID,
              full_name: 'Nguyễn Văn Offer',
              email: 'offer.nv@xe.vn',
              source: 'referral',
              status: 'hired',
              employee_id: EMP_ID,
              created_at: '2026-08-09T00:00:00.000Z',
              updated_at: '2026-08-09T02:00:00.000Z',
              yctd_title: 'Tài xế',
              position_code: 'driver',
              position_name: 'Tài xế',
              active_interview_id: null,
              active_interview_status: null,
              active_interview_at: null,
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const dto = await service.getCandidateById(APP_ID, HOLDING);
    expect(dto.employee_id).toBe(EMP_ID);
    const getSql = sqlLog.find(
      (s) =>
        s.includes('FROM public.recruitment_candidates') &&
        s.includes('LIMIT 1'),
    );
    expect(getSql).toMatch(/c\.employee_id::text AS employee_id/);
  });

  it('re-accept after hired-outcome → idempotent · NO OFFER-INVALID · same employee_id', async () => {
    mockPersistedSoftReverse(db);
    const dto = await service.acceptOfferApplication(APP_ID, {}, HOLDING);
    expect(dto.mode).toBe('idempotent');
    expect(dto.employee_id).toBe(EMP_ID);
    expect(dto.status).toBe(EMP_STATUS_PENDING_DOCS);
    // Unlinked-only gate: assertOfferReady must not run (would throw for hired).
    expect(
      db.query.mock.calls.some(([sql]) =>
        String(sql).includes('INSERT INTO public.employees'),
      ),
    ).toBe(false);
  });

  it('unlinked non-offer stage still → HRM-REC-HIRE-OFFER-INVALID', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (
        sql.includes('FROM public.recruitment_candidates c') &&
        sql.includes('INNER JOIN public.job_requisitions')
      ) {
        return {
          rows: [offerAppRow({ status: 'interview', employee_id: null })],
        } as never;
      }
      if (sql.includes('WHERE candidate_id = $1::uuid')) {
        return { rows: [] } as never;
      }
      return { rows: [] } as never;
    });
    await expect(
      service.acceptOfferApplication(APP_ID, {}, HOLDING),
    ).rejects.toMatchObject({
      code: HRM_REC_HIRE_OFFER_INVALID,
    });
  });

  it('assertPersistedHireSoftLinkOrThrow reads DB soft+reverse (no in-memory bypass)', async () => {
    const queries: string[] = [];
    const linkDb: HireLinkDb = {
      query: jest.fn(async (sql: string) => {
        queries.push(sql);
        if (
          sql.includes('FROM public.recruitment_candidates') &&
          sql.includes('employee_id')
        ) {
          return { rows: [{ employee_id: EMP_ID }] } as never;
        }
        if (sql.includes('WHERE candidate_id = $1::uuid')) {
          return { rows: [{ id: EMP_ID }] } as never;
        }
        if (
          sql.includes('FROM public.employees') &&
          sql.includes('WHERE id =')
        ) {
          return { rows: [{ id: EMP_ID, company_id: HOLDING }] } as never;
        }
        return { rows: [] } as never;
      }),
    };
    await expect(
      assertPersistedHireSoftLinkOrThrow(linkDb, APP_ID, HOLDING, EMP_ID),
    ).resolves.toBe(EMP_ID);
    expect(
      queries.some(
        (s) =>
          s.includes('recruitment_candidates') && s.includes('employee_id'),
      ),
    ).toBe(true);
    expect(queries.some((s) => s.includes('candidate_id = $1::uuid'))).toBe(
      true,
    );
  });

  it('assertPersistedHireSoftLinkOrThrow missing soft → HRM-REC-HIRE-400', async () => {
    const linkDb: HireLinkDb = {
      query: jest.fn(async (sql: string) => {
        if (sql.includes('FROM public.recruitment_candidates')) {
          return { rows: [{ employee_id: null }] } as never;
        }
        if (sql.includes('WHERE candidate_id')) {
          return { rows: [{ id: EMP_ID }] } as never;
        }
        return { rows: [] } as never;
      }),
    };
    await expect(
      assertPersistedHireSoftLinkOrThrow(linkDb, APP_ID, HOLDING, EMP_ID),
    ).rejects.toMatchObject<ApiException>({ code: HRM_REC_HIRE_400 });
  });

  it('DENY Nest /rec dual · no second hire SoT', async () => {
    const sqlLog: string[] = [];
    db.query.mockImplementation(async (sql: string) => {
      sqlLog.push(sql);
      return { rows: [] } as never;
    });
    await expect(
      service.getCandidateById(APP_ID, HOLDING),
    ).rejects.toBeInstanceOf(ApiException);
    const joined = sqlLog.join('\n');
    expect(joined).not.toMatch(/CREATE TABLE IF NOT EXISTS public\.rec_hire/);
    expect(joined).not.toMatch(/\/rec\//);
  });
});
