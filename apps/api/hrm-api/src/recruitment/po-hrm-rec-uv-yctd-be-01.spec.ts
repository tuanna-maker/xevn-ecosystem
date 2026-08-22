/**
 * PO-HRM-REC-UV-YCTD-BE-01 — UT-REC-UV-* / UT-REC-CMP-* / IT-REC-UV-SP-*
 * QA plan: docs/qa/evidence/po-hrm-rec-uv-yctd-qa-plan-01.md §4.4
 */
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { RecruitmentController } from './recruitment.controller';
import { RecruitmentService } from './recruitment.service';
import {
  assertCompareMaxNOrThrow,
  assertCompareSameYctdOrThrow,
  extractCompareCriterionName,
  extractCompareScoreValue,
  HRM_REC_CMP_MAX_N,
  HRM_REC_CMP_YCTD_MIX,
  HRM_REC_UV_POSITION_MISMATCH,
  HRM_REC_UV_YCTD_ALIAS,
  HRM_REC_UV_YCTD_NOT_FOUND,
  HRM_REC_UV_YCTD_REQUIRED,
  normalizeCompareScoreItems,
  resolveUvYctdRequisitionId,
} from './uv-yctd-bind';
import { HRM_YCTD_NOT_RECEIVABLE } from './yctd-requisition-gates';

const REQ_OPEN = '633e95b7-cf1b-469f-a0f8-4c91f3f35f80';
const REQ_CLOSED = '733e95b7-cf1b-469f-a0f8-4c91f3f35f81';
const REQ_OTHER = '833e95b7-cf1b-469f-a0f8-4c91f3f35f82';
const CAND_1 = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const CAND_2 = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const CAND_3 = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const CAND_4 = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const CAND_5 = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const CAND_OTHER_YCTD = 'ffffffff-ffff-4fff-8fff-ffffffffffff';

function groupCeoToken() {
  return `Bearer ${signServiceJwt({
    sub: 'ceo@xe.vn',
    tenantId: 'xevn',
    companyId: 'main',
    roleCode: 'group_ceo',
  })}`;
}

function mockBridge() {
  return {
    ensureSchema: jest.fn().mockResolvedValue(undefined),
    assertNotLockedOrThrow: jest.fn(),
    startRecruitmentWorkflowIfConfigured: jest.fn().mockResolvedValue(null),
  };
}

function openRequisition(overrides: Record<string, unknown> = {}) {
  return {
    id: REQ_OPEN,
    company_id: 'holding',
    title: 'Lái xe Bắc–Nam',
    department: 'Vận tải',
    employment_type: 'full_time',
    headcount: 2,
    status: 'open',
    headcount_mode: 'in_plan',
    job_description: null,
    requirements: null,
    job_template_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01',
    workflow_instance_id: null,
    jd_code: 'JD-DRV-01',
    jd_title: 'Lái xe tuyến',
    position_code: 'DRIVER',
    position_key: 'DRIVER',
    position_name: 'Lái xe',
    pipeline_flags_json: {},
    created_at: '2026-08-01T00:00:00.000Z',
    updated_at: '2026-08-01T00:00:00.000Z',
    ...overrides,
  };
}

/** Count ensureSchema ALTER/CREATE calls (variable) then stub business queries. */
function schemaThen(
  db: { query: jest.Mock },
  ...business: Array<{ rows: unknown[] }>
) {
  db.query.mockImplementation(async (sql: string) => {
    const s = String(sql);
    if (
      s.includes('CREATE TABLE') ||
      s.includes('ALTER TABLE') ||
      s.includes('CREATE UNIQUE INDEX') ||
      s.includes('CREATE INDEX') ||
      s.includes('DO $$')
    ) {
      return { rows: [] };
    }
    const next = business.shift();
    if (!next) return { rows: [] };
    return next;
  });
}

describe('PO-HRM-REC-UV-YCTD-BE-01', () => {
  describe('alias helper', () => {
    it('UT-REC-UV-10: recruitment_request_id only → physical; ambiguous → ALIAS', () => {
      expect(
        resolveUvYctdRequisitionId({ recruitment_request_id: REQ_OPEN }),
      ).toBe(REQ_OPEN);
      try {
        resolveUvYctdRequisitionId({
          requisition_id: REQ_OPEN,
          recruitment_request_id: REQ_CLOSED,
        });
        throw new Error('expected ALIAS');
      } catch (err) {
        expect(err).toMatchObject({ code: HRM_REC_UV_YCTD_ALIAS });
      }
    });
  });

  describe('F-REC-UV-YCTD-01 receivable list', () => {
    it('UT-REC-UV-01: receivable=true returns only open; no job_postings SQL', async () => {
      const db = { query: jest.fn() } as unknown as jest.Mocked<HrmDbService>;
      const sqlLog: string[] = [];
      (db.query as jest.Mock).mockImplementation(async (sql: string) => {
        sqlLog.push(String(sql));
        const s = String(sql);
        if (
          s.includes('CREATE TABLE') ||
          s.includes('ALTER TABLE') ||
          s.includes('DO $$') ||
          s.includes('CREATE UNIQUE') ||
          s.includes('CREATE INDEX')
        ) {
          return { rows: [] };
        }
        if (s.includes('COUNT(*)') || s.includes('COUNT(DISTINCT'))
          return { rows: [{ total: '1' }] };
        return { rows: [openRequisition()] };
      });
      const service = new RecruitmentService(db, mockBridge() as never);
      const list = await service.listJobRequisitions(
        { company_id: 'main', receivable: 'true', page: '1', page_size: '20' },
        groupCeoToken(),
        { tenantId: 'xevn' },
      );
      expect(list.total).toBe(1);
      expect(list.items?.[0]?.id).toBe(REQ_OPEN);
      expect(list.items?.[0]?.position_key).toBe('DRIVER');
      expect(sqlLog.some((s) => s.includes('job_postings'))).toBe(false);
      expect(sqlLog.some((s) => s.includes("lower(r.status) IN ('open'"))).toBe(
        true,
      );
    });

    it('UT-REC-UV-02: no receivable → 200 items=[]', async () => {
      const db = { query: jest.fn() } as unknown as jest.Mocked<HrmDbService>;
      schemaThen(db as never, { rows: [{ total: '0' }] }, { rows: [] });
      const service = new RecruitmentService(db, mockBridge() as never);
      const list = await service.listJobRequisitions(
        { company_id: 'main', receivable: 'true' },
        groupCeoToken(),
        { tenantId: 'xevn' },
      );
      expect(list.total).toBe(0);
      expect(list.items).toEqual([]);
      expect(list.data).toEqual([]);
    });
  });

  describe('F-REC-UV-YCTD-02 bind STATUS', () => {
    it('UT-REC-UV-03: GET :id for=uv closed → STATUS', async () => {
      const db = { query: jest.fn() } as unknown as jest.Mocked<HrmDbService>;
      schemaThen(db as never, {
        rows: [openRequisition({ id: REQ_CLOSED, status: 'closed' })],
      });
      const service = new RecruitmentService(db, mockBridge() as never);
      await expect(
        service.getJobRequisitionById(
          REQ_CLOSED,
          { company_id: 'main', for: 'uv' },
          groupCeoToken(),
          { tenantId: 'xevn' },
        ),
      ).rejects.toMatchObject({ code: HRM_YCTD_NOT_RECEIVABLE });
    });
  });

  describe('F-REC-UV-YCTD-03 create', () => {
    it('UT-REC-UV-04 / UT-REC-UV-13: missing YCTD → REQUIRED (controller no Lane B)', () => {
      process.env.INTERNAL_API_KEY = 'test-key';
      const serviceMock = {
        createCandidate: jest.fn(),
      };
      const catalogMock = {
        createCandidatePool: jest.fn(),
      };
      const controller = new RecruitmentController(
        serviceMock as never,
        catalogMock as never,
        {} as never,
        {} as never,
        {} as never,
      );
      try {
        controller.createCandidate(undefined, 'test-key', 'xevn', undefined, {
          company_id: 'holding',
          full_name: 'Nguyen Van A',
        });
        throw new Error('expected REQUIRED');
      } catch (err) {
        expect(err).toMatchObject({ code: HRM_REC_UV_YCTD_REQUIRED });
      }
      expect(serviceMock.createCandidate).not.toHaveBeenCalled();
      expect(catalogMock.createCandidatePool).not.toHaveBeenCalled();
    });

    it('UT-REC-UV-05: unknown YCTD → NOT-FOUND', async () => {
      const db = { query: jest.fn() } as unknown as jest.Mocked<HrmDbService>;
      schemaThen(db as never, { rows: [] });
      const service = new RecruitmentService(db, mockBridge() as never);
      await expect(
        service.createCandidate(
          {
            company_id: 'main',
            requisition_id: REQ_OPEN,
            full_name: 'Tran Thi B',
            email: 'b@xe.vn',
            source: 'referral',
          },
          groupCeoToken(),
        ),
      ).rejects.toMatchObject({ code: HRM_REC_UV_YCTD_NOT_FOUND });
    });

    it('UT-REC-UV-06: position derive + MISMATCH', async () => {
      const db = { query: jest.fn() } as unknown as jest.Mocked<HrmDbService>;
      schemaThen(db as never, { rows: [openRequisition()] });
      const service = new RecruitmentService(db, mockBridge() as never);
      await expect(
        service.createCandidate(
          {
            company_id: 'main',
            requisition_id: REQ_OPEN,
            full_name: 'Le Van C',
            position_key: 'WRONG_KEY',
            source: 'web',
          },
          groupCeoToken(),
        ),
      ).rejects.toMatchObject({ code: HRM_REC_UV_POSITION_MISMATCH });
    });

    it('UT-REC-UV-07: free-text position ignored — not persisted as SoT', async () => {
      const db = { query: jest.fn() } as unknown as jest.Mocked<HrmDbService>;
      const insertSql: string[] = [];
      (db.query as jest.Mock).mockImplementation(
        async (sql: string, params?: unknown[]) => {
          const s = String(sql);
          if (
            s.includes('CREATE TABLE') ||
            s.includes('ALTER TABLE') ||
            s.includes('DO $$') ||
            s.includes('CREATE UNIQUE') ||
            s.includes('CREATE INDEX')
          ) {
            return { rows: [] };
          }
          if (s.includes('FROM public.job_requisitions')) {
            return { rows: [openRequisition()] };
          }
          if (s.includes('INSERT INTO public.recruitment_candidates')) {
            insertSql.push(s);
            expect(params).not.toContain('FreeText Position SoT');
            return {
              rows: [
                {
                  id: CAND_1,
                  company_id: 'holding',
                  requisition_id: REQ_OPEN,
                  full_name: 'Pham D',
                  email: '',
                  source: 'web',
                  status: 'new',
                  created_at: '2026-08-06T00:00:00.000Z',
                  updated_at: '2026-08-06T00:00:00.000Z',
                },
              ],
            };
          }
          return { rows: [] };
        },
      );
      const service = new RecruitmentService(db, mockBridge() as never);
      const created = await service.createCandidate(
        {
          company_id: 'main',
          requisition_id: REQ_OPEN,
          full_name: 'Pham D',
          position: 'FreeText Position SoT',
          source: 'web',
        },
        groupCeoToken(),
      );
      expect(created.position_key).toBe('DRIVER');
      expect(created.position_source).toBe('yctd');
      expect(insertSql[0]).not.toMatch(/position\s*,/);
      expect(insertSql[0]).not.toMatch(/job_postings/);
    });

    it('UT-REC-UV-08 / UT-REC-UV-11: happy create + alias + non-receivable STATUS', async () => {
      const db = { query: jest.fn() } as unknown as jest.Mocked<HrmDbService>;
      schemaThen(db as never, {
        rows: [
          {
            id: CAND_1,
            company_id: 'holding',
            requisition_id: REQ_OPEN,
            full_name: 'Happy UV',
            email: 'happy@xe.vn',
            source: 'referral',
            status: 'new',
            created_at: '2026-08-06T00:00:00.000Z',
            updated_at: '2026-08-06T00:00:00.000Z',
          },
        ],
      });
      // First business query = requisition select
      (db.query as jest.Mock).mockReset();
      let phase = 0;
      (db.query as jest.Mock).mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (
          s.includes('CREATE TABLE') ||
          s.includes('ALTER TABLE') ||
          s.includes('DO $$') ||
          s.includes('CREATE UNIQUE') ||
          s.includes('CREATE INDEX')
        ) {
          return { rows: [] };
        }
        if (s.includes('FROM public.job_requisitions') && phase === 0) {
          phase = 1;
          return { rows: [openRequisition()] };
        }
        if (s.includes('INSERT INTO public.recruitment_candidates')) {
          return {
            rows: [
              {
                id: CAND_1,
                company_id: 'holding',
                requisition_id: REQ_OPEN,
                full_name: 'Happy UV',
                email: 'happy@xe.vn',
                source: 'referral',
                status: 'new',
                created_at: '2026-08-06T00:00:00.000Z',
                updated_at: '2026-08-06T00:00:00.000Z',
              },
            ],
          };
        }
        return { rows: [] };
      });
      const service = new RecruitmentService(db, mockBridge() as never);
      const created = await service.createCandidate(
        {
          company_id: 'main',
          recruitment_request_id: REQ_OPEN,
          full_name: 'Happy UV',
          email: 'happy@xe.vn',
          source: 'referral',
        },
        groupCeoToken(),
      );
      expect(created.requisition_id).toBe(REQ_OPEN);
      expect(created.recruitment_request_id).toBe(REQ_OPEN);
      expect(created.position_key).toBe('DRIVER');
      expect(created.stage).toBe('new');

      // UT-REC-UV-11 non-receivable prefill
      (db.query as jest.Mock).mockReset();
      (db.query as jest.Mock).mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (
          s.includes('CREATE TABLE') ||
          s.includes('ALTER TABLE') ||
          s.includes('DO $$') ||
          s.includes('CREATE UNIQUE') ||
          s.includes('CREATE INDEX')
        ) {
          return { rows: [] };
        }
        if (s.includes('FROM public.job_requisitions')) {
          return { rows: [openRequisition({ status: 'on_hold' })] };
        }
        return { rows: [] };
      });
      await expect(
        service.createCandidate(
          {
            company_id: 'main',
            requisition_id: REQ_OPEN,
            full_name: 'Blocked',
            source: 'web',
          },
          groupCeoToken(),
        ),
      ).rejects.toMatchObject({ code: HRM_YCTD_NOT_RECEIVABLE });
    });

    it('UT-REC-UV-12: create path never touches job_postings', async () => {
      const db = { query: jest.fn() } as unknown as jest.Mocked<HrmDbService>;
      const sqlLog: string[] = [];
      (db.query as jest.Mock).mockImplementation(async (sql: string) => {
        sqlLog.push(String(sql));
        const s = String(sql);
        if (
          s.includes('CREATE TABLE') ||
          s.includes('ALTER TABLE') ||
          s.includes('DO $$') ||
          s.includes('CREATE UNIQUE') ||
          s.includes('CREATE INDEX')
        ) {
          return { rows: [] };
        }
        if (s.includes('FROM public.job_requisitions'))
          return { rows: [openRequisition()] };
        if (s.includes('INSERT INTO public.recruitment_candidates')) {
          return {
            rows: [
              {
                id: CAND_1,
                company_id: 'holding',
                requisition_id: REQ_OPEN,
                full_name: 'Spy',
                email: '',
                source: 'web',
                status: 'new',
                created_at: '2026-08-06T00:00:00.000Z',
                updated_at: '2026-08-06T00:00:00.000Z',
              },
            ],
          };
        }
        return { rows: [] };
      });
      const service = new RecruitmentService(db, mockBridge() as never);
      await service.createCandidate(
        {
          company_id: 'main',
          requisition_id: REQ_OPEN,
          full_name: 'Spy',
          source: 'web',
        },
        groupCeoToken(),
      );
      expect(sqlLog.some((s) => /job_postings|job_posting_id/i.test(s))).toBe(
        false,
      );
    });
  });

  describe('F-REC-UV-YCTD-05 list/get display', () => {
    it('UT-REC-UV-09 + IT-REC-UV-SP-02: list and get expose YCTD + position', async () => {
      const db = { query: jest.fn() } as unknown as jest.Mocked<HrmDbService>;
      const listRow = {
        id: CAND_1,
        company_id: 'holding',
        requisition_id: REQ_OPEN,
        full_name: 'List UV',
        email: 'list@xe.vn',
        source: 'web',
        status: 'new',
        created_at: '2026-08-06T00:00:00.000Z',
        updated_at: '2026-08-06T00:00:00.000Z',
        yctd_title: 'Lái xe Bắc–Nam',
        position_code: 'DRIVER',
        position_name: 'Lái xe',
        active_interview_id: null,
        active_interview_status: null,
        active_interview_at: null,
      };
      (db.query as jest.Mock).mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (
          s.includes('CREATE TABLE') ||
          s.includes('ALTER TABLE') ||
          s.includes('DO $$') ||
          s.includes('CREATE UNIQUE') ||
          s.includes('CREATE INDEX')
        ) {
          return { rows: [] };
        }
        if (
          s.includes('pool_candidate_id') ||
          s.includes('FROM public.candidates')
        ) {
          return { rows: [] };
        }
        if (s.includes('COUNT(*)')) return { rows: [{ total: '1' }] };
        if (
          s.includes('FROM public.recruitment_candidates') &&
          s.includes('LIMIT 1')
        ) {
          return { rows: [listRow] };
        }
        if (s.includes('FROM public.recruitment_candidates')) {
          return { rows: [listRow] };
        }
        return { rows: [] };
      });
      const service = new RecruitmentService(db, mockBridge() as never);
      const list = await service.listCandidates(
        { company_id: 'main', page: '1', page_size: '20' },
        groupCeoToken(),
        { tenantId: 'xevn' },
      );
      expect(list.data[0].requisition_id).toBe(REQ_OPEN);
      expect(list.data[0].recruitment_request_id).toBe(REQ_OPEN);
      expect(list.data[0].position_key).toBe('DRIVER');
      const detail = await service.getCandidateById(
        CAND_1,
        'main',
        groupCeoToken(),
        {
          tenantId: 'xevn',
        },
      );
      expect(detail.requisition_id).toBe(REQ_OPEN);
      expect(detail.position_name).toBe('Lái xe');
    });

    it('IT-REC-UV-SP-01: receivable list id → get for=uv same scope', async () => {
      const db = { query: jest.fn() } as unknown as jest.Mocked<HrmDbService>;
      (db.query as jest.Mock).mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (
          s.includes('CREATE TABLE') ||
          s.includes('ALTER TABLE') ||
          s.includes('DO $$') ||
          s.includes('CREATE UNIQUE') ||
          s.includes('CREATE INDEX')
        ) {
          return { rows: [] };
        }
        if (s.includes('COUNT(*)')) return { rows: [{ total: '1' }] };
        if (s.includes('FROM public.job_requisitions'))
          return { rows: [openRequisition()] };
        return { rows: [] };
      });
      const service = new RecruitmentService(db, mockBridge() as never);
      const list = await service.listJobRequisitions(
        { company_id: 'main', receivable: 'true' },
        groupCeoToken(),
        { tenantId: 'xevn' },
      );
      const id = list.items?.[0]?.id;
      const detail = await service.getJobRequisitionById(
        id,
        { company_id: 'main', for: 'uv' },
        groupCeoToken(),
        { tenantId: 'xevn' },
      );
      expect(detail.id).toBe(id);
      expect(detail.uv_position?.source).toBe('yctd');
    });
  });

  describe('F-REC-CMP', () => {
    it('UT-REC-CMP-01 / UT-REC-CMP-07: filter SoT alias only — no job_postings', async () => {
      expect(resolveUvYctdRequisitionId({ requisition_id: REQ_OPEN })).toBe(
        REQ_OPEN,
      );
      expect(() =>
        resolveUvYctdRequisitionId({
          requisition_id: REQ_OPEN,
          recruitment_request_id: REQ_OTHER,
        }),
      ).toThrow(ApiException);
      const db = { query: jest.fn() } as unknown as jest.Mocked<HrmDbService>;
      const sqlLog: string[] = [];
      (db.query as jest.Mock).mockImplementation(async (sql: string) => {
        sqlLog.push(String(sql));
        const s = String(sql);
        if (
          s.includes('CREATE TABLE') ||
          s.includes('ALTER TABLE') ||
          s.includes('DO $$') ||
          s.includes('CREATE UNIQUE') ||
          s.includes('CREATE INDEX')
        ) {
          return { rows: [] };
        }
        if (s.includes('COUNT(*)')) return { rows: [{ total: '0' }] };
        return { rows: [] };
      });
      const service = new RecruitmentService(db, mockBridge() as never);
      const empty = await service.listApplicationsByYctd(
        { company_id: 'main', requisition_id: REQ_OPEN, include: 'evals' },
        groupCeoToken(),
        { tenantId: 'xevn' },
      );
      expect(empty.items).toEqual([]);
      expect(sqlLog.some((s) => /job_postings/i.test(s))).toBe(false);
    });

    it('UT-REC-CMP-02: 0 UV → 200 []', async () => {
      const db = { query: jest.fn() } as unknown as jest.Mocked<HrmDbService>;
      schemaThen(db as never, { rows: [{ total: '0' }] }, { rows: [] });
      const service = new RecruitmentService(db, mockBridge() as never);
      const empty = await service.listApplicationsByYctd(
        { company_id: 'main', recruitment_request_id: REQ_OPEN },
        groupCeoToken(),
        { tenantId: 'xevn' },
      );
      expect(empty.total).toBe(0);
      expect(empty.items).toEqual([]);
    });

    it('UT-REC-CMP-03: > N → MAX-N', () => {
      expect(() =>
        assertCompareMaxNOrThrow([CAND_1, CAND_2, CAND_3, CAND_4, CAND_5]),
      ).toThrow(expect.objectContaining({ code: HRM_REC_CMP_MAX_N }));
    });

    it('UT-REC-CMP-06: YCTD-MIX', () => {
      expect(() =>
        assertCompareSameYctdOrThrow(
          REQ_OPEN,
          [
            { id: CAND_1, requisition_id: REQ_OPEN },
            { id: CAND_OTHER_YCTD, requisition_id: REQ_OTHER },
          ],
          [CAND_1, CAND_OTHER_YCTD],
        ),
      ).toThrow(expect.objectContaining({ code: HRM_REC_CMP_YCTD_MIX }));
    });

    it('UT-REC-CMP-03+06 service: compare >N and mix', async () => {
      const db = { query: jest.fn() } as unknown as jest.Mocked<HrmDbService>;
      schemaThen(db as never);
      const service = new RecruitmentService(db, mockBridge() as never);
      await expect(
        service.compareCandidatesByYctd(
          {
            company_id: 'main',
            requisition_id: REQ_OPEN,
            candidate_ids: [CAND_1, CAND_2, CAND_3, CAND_4, CAND_5].join(','),
          },
          groupCeoToken(),
          { tenantId: 'xevn' },
        ),
      ).rejects.toMatchObject({ code: HRM_REC_CMP_MAX_N });

      (db.query as jest.Mock).mockReset();
      (db.query as jest.Mock).mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (
          s.includes('CREATE TABLE') ||
          s.includes('ALTER TABLE') ||
          s.includes('DO $$') ||
          s.includes('CREATE UNIQUE') ||
          s.includes('CREATE INDEX')
        ) {
          return { rows: [] };
        }
        if (s.includes('requisition_id = $2')) {
          return {
            rows: [
              {
                id: CAND_1,
                requisition_id: REQ_OPEN,
                full_name: 'A',
                status: 'new',
              },
            ],
          };
        }
        if (s.includes('FROM public.recruitment_candidates')) {
          return {
            rows: [
              { id: CAND_1, requisition_id: REQ_OPEN },
              { id: CAND_OTHER_YCTD, requisition_id: REQ_OTHER },
            ],
          };
        }
        return { rows: [] };
      });
      await expect(
        service.compareCandidatesByYctd(
          {
            company_id: 'main',
            requisition_id: REQ_OPEN,
            candidate_ids: `${CAND_1},${CAND_OTHER_YCTD}`,
          },
          groupCeoToken(),
          { tenantId: 'xevn' },
        ),
      ).rejects.toMatchObject({ code: HRM_REC_CMP_YCTD_MIX });
    });

    it('UT-REC-CMP-05 score shapes: criterion_name/actual_score + neo Lane A id', () => {
      expect(extractCompareCriterionName({ criterion_name: 'Giao tiếp' })).toBe(
        'Giao tiếp',
      );
      expect(extractCompareScoreValue({ actual_score: 4 })).toBe(4);
      expect(extractCompareCriterionName({ criterion: 'Kỹ năng' })).toBe(
        'Kỹ năng',
      );
      const normalized = normalizeCompareScoreItems([
        { criterion_name: 'Giao tiếp', actual_score: 4, weight: 20 },
        { name: 'Chuyên môn', score: 3 },
      ]);
      expect(normalized).toEqual([
        {
          criterion_name: 'Giao tiếp',
          category: '',
          actual_score: 4,
          required_score: 0,
          weight: 20,
        },
        {
          criterion_name: 'Chuyên môn',
          category: '',
          actual_score: 3,
          required_score: 0,
          weight: 0,
        },
      ]);
    });

    it('UT-REC-CMP-neo: compare joins recruitment_candidate_id (not pool candidate_id only)', async () => {
      const db = { query: jest.fn() } as unknown as jest.Mocked<HrmDbService>;
      const sqlLog: string[] = [];
      (db.query as jest.Mock).mockImplementation(async (sql: string) => {
        const s = String(sql);
        sqlLog.push(s);
        if (
          s.includes('CREATE TABLE') ||
          s.includes('ALTER TABLE') ||
          s.includes('DO $$') ||
          s.includes('CREATE UNIQUE') ||
          s.includes('CREATE INDEX')
        ) {
          return { rows: [] };
        }
        if (s.includes('WITH requested AS')) {
          return {
            rows: [{ requested_id: CAND_1, spine_id: CAND_1 }],
          };
        }
        if (s.includes('FROM public.recruitment_candidates')) {
          return {
            rows: [
              {
                id: CAND_1,
                requisition_id: REQ_OPEN,
                full_name: 'UV A',
                status: 'interview',
              },
            ],
          };
        }
        if (s.includes('candidate_evaluations')) {
          return {
            rows: [
              {
                lane_candidate_id: CAND_1,
                scores: [
                  { criterion_name: 'Giao tiếp', actual_score: 4 },
                ],
                result: 'pass',
                total_score: 4,
                weighted_score: 4,
                overall_feedback: 'ok',
                recommendation: 'hire',
              },
            ],
          };
        }
        if (s.includes('evaluation_criteria_templates')) {
          return { rows: [] };
        }
        return { rows: [] };
      });
      const service = new RecruitmentService(db, mockBridge() as never);
      const matrix = await service.compareCandidatesByYctd(
        {
          company_id: 'main',
          requisition_id: REQ_OPEN,
          candidate_ids: CAND_1,
        },
        groupCeoToken(),
        { tenantId: 'xevn' },
      );
      expect(
        sqlLog.some(
          (s) =>
            s.includes('candidate_evaluations') &&
            s.includes('recruitment_candidate_id') &&
            s.includes('COALESCE'),
        ),
      ).toBe(true);
      expect(matrix.criteria.map((c) => c.name)).toContain('Giao tiếp');
      expect(matrix.rows[0]?.scores['Giao tiếp']).toBe(4);
      expect(matrix.rows[0]?.weighted_score).toBe(4);
      expect(matrix.rows[0]?.eval_status).toBe('scored');
    });
  });
});
