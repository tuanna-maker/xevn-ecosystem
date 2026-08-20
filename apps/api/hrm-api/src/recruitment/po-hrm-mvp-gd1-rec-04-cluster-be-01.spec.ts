/**
 * PO-HRM-MVP-GD1-REC-04-CLUSTER-BE-01 — Quét kho CV nội bộ (UC-BP-REC-04).
 * Spot: internal_scan_* · POST internal-scan · posted gate · pool title+skill · U19 · mint SCAN-*.
 */
import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { RecruitmentCatalogService } from './recruitment-catalog.service';
import { RecruitmentService } from './recruitment.service';
import {
  assertInternalScanSkipActorOrThrow,
  assertPostedAllowedOrThrow,
  assertYctdOpenForInternalScanOrThrow,
  EMPTY_PIPELINE_FLAGS,
  HRM_REC_CV_SCAN_FORBIDDEN,
  HRM_REC_CV_SCAN_REQUIRED,
  HRM_REC_CV_SCAN_SKIP_REASON,
  HRM_REC_CV_SCAN_YCTD,
  isInternalScanSatisfiedForPosted,
  mergePipelineFlags,
  parsePipelineFlags,
} from './yctd-requisition-gates';

const REQ_ID = 'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeee0401';
const CAND_ID = 'bbbbbbbb-cccc-4ddd-8eee-eeeeeeee0401';

function groupCeoToken() {
  return `Bearer ${signServiceJwt({
    sub: 'ceo@xe.vn',
    tenantId: 'xevn',
    companyId: 'main',
    roleCode: 'group_ceo',
  })}`;
}

function hrToken() {
  return `Bearer ${signServiceJwt({
    sub: 'hr@xe.vn',
    tenantId: 'xevn',
    companyId: 'holding',
    roleCode: 'hr_manager',
  })}`;
}

function employeeToken() {
  return `Bearer ${signServiceJwt({
    sub: 'nv@xe.vn',
    tenantId: 'xevn',
    companyId: 'holding',
    roleCode: 'employee',
  })}`;
}

function schemaOk(sql: string): boolean {
  const s = String(sql);
  return (
    s.includes('CREATE TABLE') ||
    s.includes('CREATE INDEX') ||
    s.includes('CREATE UNIQUE') ||
    s.includes('ALTER TABLE') ||
    s.includes('DO $$')
  );
}

function codeOf(err: unknown): string {
  if (err instanceof ApiException) {
    const body = err.getResponse() as { code?: string };
    return String(body?.code ?? '');
  }
  return '';
}

describe('REC-04 PipelineFlags helpers (O2/O5)', () => {
  it('parse defaults scan keys false/null — RETAIN posted family', () => {
    const flags = parsePipelineFlags({
      posted: true,
      posted_at: '2026-08-01T00:00:00.000Z',
    });
    expect(flags.posted).toBe(true);
    expect(flags.internal_scan_done).toBe(false);
    expect(flags.internal_scan_skipped).toBe(false);
    expect(flags.internal_scan_at).toBeNull();
    expect(flags.internal_scan_skip_reason).toBeNull();
    expect(flags.has_cv).toBe(false);
  });

  it('merge complete: done=true · skipped=false · reason null · at set; RETAIN posted', () => {
    const now = '2026-08-09T10:00:00.000Z';
    const merged = mergePipelineFlags(
      { ...EMPTY_PIPELINE_FLAGS, posted: false, has_cv: true, has_cv_at: 'x' },
      { internal_scan_done: true },
      now,
    );
    expect(merged.internal_scan_done).toBe(true);
    expect(merged.internal_scan_skipped).toBe(false);
    expect(merged.internal_scan_skip_reason).toBeNull();
    expect(merged.internal_scan_at).toBe(now);
    expect(merged.has_cv).toBe(true);
  });

  it('merge skip exclusive + posted gate', () => {
    const now = '2026-08-09T10:00:00.000Z';
    const skipped = mergePipelineFlags(
      EMPTY_PIPELINE_FLAGS,
      {
        internal_scan_skipped: true,
        internal_scan_skip_reason: 'Không có UV khớp nội bộ',
      },
      now,
    );
    expect(skipped.internal_scan_skipped).toBe(true);
    expect(skipped.internal_scan_done).toBe(false);
    expect(isInternalScanSatisfiedForPosted(skipped)).toBe(true);
    expect(() => assertPostedAllowedOrThrow(EMPTY_PIPELINE_FLAGS)).toThrow(
      ApiException,
    );
    try {
      assertPostedAllowedOrThrow(EMPTY_PIPELINE_FLAGS);
    } catch (e) {
      expect(codeOf(e)).toBe(HRM_REC_CV_SCAN_REQUIRED);
    }
  });

  it('skip actor: employee → FORBIDDEN; hr → allow', () => {
    try {
      assertInternalScanSkipActorOrThrow(employeeToken());
      fail('expected throw');
    } catch (e) {
      expect(codeOf(e)).toBe(HRM_REC_CV_SCAN_FORBIDDEN);
      expect((e as ApiException).getStatus()).toBe(HttpStatus.FORBIDDEN);
    }
    expect(() => assertInternalScanSkipActorOrThrow(hrToken())).not.toThrow();
    expect(() =>
      assertInternalScanSkipActorOrThrow(groupCeoToken()),
    ).not.toThrow();
  });

  it('YCTD scan gate: draft → SCAN-YCTD', () => {
    try {
      assertYctdOpenForInternalScanOrThrow({
        status: 'draft',
        headcount_mode: 'in_plan',
      });
      fail('expected throw');
    } catch (e) {
      expect(codeOf(e)).toBe(HRM_REC_CV_SCAN_YCTD);
    }
  });
});

describe('PO-HRM-MVP-GD1-REC-04-CLUSTER-BE-01 service', () => {
  function openYctdRow(flags: Record<string, unknown> = {}) {
    return {
      id: REQ_ID,
      company_id: 'holding',
      status: 'open_for_hire',
      headcount_mode: 'in_plan',
      pipeline_flags_json: flags,
      title: 'YCTD Driver',
      department: 'HCNS',
      employment_type: 'full-time',
      headcount: 1,
      job_description: null,
      requirements: null,
      job_template_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  it('POST internal-scan complete (0 hits) → done=true · display-ready', async () => {
    let stored: unknown = null;
    const db = {
      query: jest
        .fn()
        .mockImplementation(async (sql: string, params?: unknown[]) => {
          const s = String(sql);
          if (schemaOk(s)) return { rows: [] };
          if (s.includes('FROM public.job_requisitions WHERE id')) {
            return { rows: [openYctdRow()] };
          }
          if (s.includes('UPDATE public.job_requisitions')) {
            stored = params?.[0];
            return {
              rows: [
                openYctdRow(
                  typeof params?.[0] === 'string' ? JSON.parse(params[0]) : {},
                ),
              ],
            };
          }
          return { rows: [] };
        }),
    };
    const bridge = { ensureSchema: jest.fn().mockResolvedValue(undefined) };
    const svc = new RecruitmentService(
      db as unknown as HrmDbService,
      bridge as never,
    );
    const out = await svc.postRequisitionInternalScan(
      REQ_ID,
      { action: 'complete', hit_count: 0 },
      { company_id: 'main' },
      groupCeoToken(),
    );
    expect(out.pipeline_flags.internal_scan_done).toBe(true);
    expect(out.pipeline_flags.internal_scan_skipped).toBe(false);
    expect(out.pipeline_flags.internal_scan_at).toBeTruthy();
    expect(out.pipeline_flags.posted).toBe(false);
    const parsed = JSON.parse(String(stored));
    expect(parsed.internal_scan_hit_count).toBe(0);
  });

  it('POST internal-scan skip missing reason → SKIP-REASON', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (schemaOk(s)) return { rows: [] };
        if (s.includes('FROM public.job_requisitions WHERE id')) {
          return { rows: [openYctdRow()] };
        }
        return { rows: [] };
      }),
    };
    const bridge = { ensureSchema: jest.fn().mockResolvedValue(undefined) };
    const svc = new RecruitmentService(
      db as unknown as HrmDbService,
      bridge as never,
    );
    try {
      await svc.postRequisitionInternalScan(
        REQ_ID,
        { action: 'skip', skip_reason: '  ' },
        { company_id: 'holding' },
        hrToken(),
      );
      fail('expected throw');
    } catch (e) {
      expect(codeOf(e)).toBe(HRM_REC_CV_SCAN_SKIP_REASON);
    }
  });

  it('POST internal-scan skip employee → FORBIDDEN', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (schemaOk(s)) return { rows: [] };
        if (s.includes('FROM public.job_requisitions WHERE id')) {
          return { rows: [openYctdRow()] };
        }
        return { rows: [] };
      }),
    };
    const bridge = { ensureSchema: jest.fn().mockResolvedValue(undefined) };
    const svc = new RecruitmentService(
      db as unknown as HrmDbService,
      bridge as never,
    );
    try {
      await svc.postRequisitionInternalScan(
        REQ_ID,
        { action: 'skip', skip_reason: 'Gấp mở kênh ngoài' },
        { company_id: 'holding' },
        employeeToken(),
      );
      fail('expected throw');
    } catch (e) {
      expect(codeOf(e)).toBe(HRM_REC_CV_SCAN_FORBIDDEN);
    }
  });

  it('PATCH posted without scan → SCAN-REQUIRED; after complete → posted ok', async () => {
    let flagsState: Record<string, unknown> = {};
    const db = {
      query: jest
        .fn()
        .mockImplementation(async (sql: string, params?: unknown[]) => {
          const s = String(sql);
          if (schemaOk(s)) return { rows: [] };
          if (s.includes('FROM public.job_requisitions WHERE id')) {
            return { rows: [openYctdRow(flagsState)] };
          }
          if (s.includes('UPDATE public.job_requisitions')) {
            flagsState =
              typeof params?.[0] === 'string'
                ? JSON.parse(params[0])
                : flagsState;
            return { rows: [openYctdRow(flagsState)] };
          }
          return { rows: [] };
        }),
    };
    const bridge = { ensureSchema: jest.fn().mockResolvedValue(undefined) };
    const svc = new RecruitmentService(
      db as unknown as HrmDbService,
      bridge as never,
    );
    try {
      await svc.patchRequisitionPipelineFlags(
        REQ_ID,
        { posted: true },
        { company_id: 'main' },
        groupCeoToken(),
      );
      fail('expected throw');
    } catch (e) {
      expect(codeOf(e)).toBe(HRM_REC_CV_SCAN_REQUIRED);
    }
    const done = await svc.postRequisitionInternalScan(
      REQ_ID,
      { action: 'complete' },
      { company_id: 'main' },
      groupCeoToken(),
    );
    expect(done.pipeline_flags.internal_scan_done).toBe(true);
    const posted = await svc.patchRequisitionPipelineFlags(
      REQ_ID,
      { posted: true },
      { company_id: 'main' },
      groupCeoToken(),
    );
    expect(posted.pipeline_flags.posted).toBe(true);
    expect(posted.pipeline_flags.internal_scan_done).toBe(true);
  });

  it('U19: list pool + get pool + flags + scan share company_id scope filter', async () => {
    const seen: string[] = [];
    const catalogDb = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (schemaOk(s)) return { rows: [] };
        if (s.includes('company_id')) seen.push(s);
        if (s.includes('FROM public.candidates') && s.includes('LIMIT 1')) {
          return {
            rows: [
              {
                id: CAND_ID,
                company_id: 'holding',
                full_name: 'UV A',
                position: 'Lái xe',
                notes: 'kinh nghiệm 3 năm',
                stage: 'applied',
              },
            ],
          };
        }
        if (s.includes('FROM public.candidates')) {
          return {
            rows: [
              {
                id: CAND_ID,
                company_id: 'holding',
                full_name: 'UV A',
                position: 'Lái xe',
                notes: 'kinh nghiệm 3 năm',
                stage: 'applied',
              },
            ],
          };
        }
        return { rows: [] };
      }),
    };
    const bridge = {
      ensureSchema: jest.fn().mockResolvedValue(undefined),
      assertNotLockedOrThrow: jest.fn(),
      startRecruitmentWorkflowIfConfigured: jest.fn().mockResolvedValue(null),
    };
    const catalog = new RecruitmentCatalogService(
      catalogDb as unknown as HrmDbService,
      bridge as never,
    );
    const auth = groupCeoToken();
    const list = await catalog.listCandidatesTable(
      {
        company_id: 'main',
        for: 'internal_scan',
        position: 'Lái xe',
        skill: 'kinh nghiệm',
      },
      auth,
    );
    expect(list.total).toBe(1);
    const one = await catalog.getCandidatePoolById(CAND_ID, 'main', auth);
    expect(one.id).toBe(CAND_ID);
    expect(seen.some((q) => q.includes('company_id'))).toBe(true);
  });

  it('pool exact-title-only under for=internal_scan → HRM-REC-400', async () => {
    const catalogDb = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        if (schemaOk(String(sql))) return { rows: [] };
        return { rows: [] };
      }),
    };
    const bridge = {
      ensureSchema: jest.fn().mockResolvedValue(undefined),
    };
    const catalog = new RecruitmentCatalogService(
      catalogDb as unknown as HrmDbService,
      bridge as never,
    );
    try {
      await catalog.listCandidatesTable(
        {
          company_id: 'holding',
          for: 'internal_scan',
          position_code: 'DRIVER',
        },
        hrToken(),
      );
      fail('expected throw');
    } catch (e) {
      expect(codeOf(e)).toBe('HRM-REC-400');
    }
  });

  it('pool + requisition_id not receivable → SCAN-YCTD', async () => {
    const catalogDb = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (schemaOk(s)) return { rows: [] };
        if (s.includes('FROM public.job_requisitions')) {
          return {
            rows: [
              {
                id: REQ_ID,
                company_id: 'holding',
                status: 'draft',
                headcount_mode: 'in_plan',
              },
            ],
          };
        }
        return { rows: [] };
      }),
    };
    const bridge = {
      ensureSchema: jest.fn().mockResolvedValue(undefined),
    };
    const catalog = new RecruitmentCatalogService(
      catalogDb as unknown as HrmDbService,
      bridge as never,
    );
    try {
      await catalog.listCandidatesTable(
        {
          company_id: 'holding',
          requisition_id: REQ_ID,
          for: 'internal_scan',
        },
        hrToken(),
      );
      fail('expected throw');
    } catch (e) {
      expect(codeOf(e)).toBe(HRM_REC_CV_SCAN_YCTD);
    }
  });
});
