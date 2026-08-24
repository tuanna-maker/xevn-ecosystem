/**
 * PO-HRM-JD-YCTD-REF-BE-01 — UT-YCTD-JD-01..12 + IT-YCTD-JD-SP-01..02
 * QA plan: docs/qa/evidence/po-hrm-jd-yctd-ref-qa-plan-01.md §3
 */
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { RecruitmentCatalogService } from './recruitment-catalog.service';
import { RecruitmentService } from './recruitment.service';
import {
  HRM_JD_YCTD_ALIAS,
  HRM_JD_YCTD_NOT_FOUND,
  HRM_JD_YCTD_REQUIRED,
  HRM_JD_YCTD_REBIND_LOCKED,
  HRM_JD_YCTD_STATUS,
  resolveYctdJdTemplateId,
} from './yctd-jd-bind';

const ACTIVE_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const DRAFT_ID = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const RETIRED_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const REQ_ID = '633e95b7-cf1b-469f-a0f8-4c91f3f35f80';

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

function templateRow(overrides: Record<string, unknown> = {}) {
  return {
    id: ACTIVE_ID,
    company_id: 'holding',
    code: 'JD-DRV-01',
    title: 'Lái xe tuyến',
    position_name: 'Lái xe',
    position_code: 'DRIVER',
    job_description: 'Mô tả ngắn JD',
    requirements: 'GPL B2',
    notes: null,
    is_active: true,
    values_json: { title: 'Lái xe tuyến', nested: { a: 1 } },
    layout_snapshot_json: { version: 2, groups: [] },
    layout_version: 2,
    created_at: '2026-08-01T00:00:00.000Z',
    updated_at: '2026-08-01T00:00:00.000Z',
    ...overrides,
  };
}

describe.skip('PO-HRM-JD-YCTD-REF-BE-01', () => {
  describe('alias helper', () => {
    it('UT-YCTD-JD-10: job_description_id only → physical id; ambiguous → ALIAS', () => {
      expect(resolveYctdJdTemplateId({ job_description_id: ACTIVE_ID })).toBe(
        ACTIVE_ID,
      );
      try {
        resolveYctdJdTemplateId({
          job_template_id: ACTIVE_ID,
          job_description_id: DRAFT_ID,
        });
        throw new Error('expected ALIAS throw');
      } catch (err) {
        expect(err).toMatchObject({ code: HRM_JD_YCTD_ALIAS });
      }
    });
  });

  describe('F-YCTD-JD-01 bindable list', () => {
    it('UT-YCTD-JD-01: bindable=true returns only Hiệu lực ids', async () => {
      const db = {
        query: jest.fn().mockImplementation(async (sql: string) => {
          const s = String(sql);
          if (
            s.includes('CREATE') ||
            s.includes('ALTER') ||
            s.includes('CREATE INDEX')
          ) {
            return { rows: [] };
          }
          if (
            s.includes('FROM public.job_description_templates') &&
            s.includes("status = 'active'") &&
            s.includes('is_active = TRUE')
          ) {
            expect(s).toContain("status = 'active'");
            expect(s).toContain('is_active = TRUE');
            expect(s).not.toContain('values_json');
            return {
              rows: [
                templateRow({
                  id: ACTIVE_ID,
                  is_active: true,
                  status: 'active',
                }),
              ],
            };
          }
          return { rows: [] };
        }),
      } as unknown as HrmDbService;
      const catalog = new RecruitmentCatalogService(db, mockBridge() as never);
      const result = await catalog.listJobDescriptionTemplates(
        'main',
        groupCeoToken(),
        {
          bindable: 'true',
        },
      );
      expect(result.items).toHaveLength(1);
      expect(result.items?.[0]?.id).toBe(ACTIVE_ID);
      expect(result.data[0]).not.toHaveProperty('values_json');
    });

    it('UT-YCTD-JD-02: empty bindable library → 200 items=[]', async () => {
      const db = {
        query: jest.fn().mockImplementation(async (sql: string) => {
          const s = String(sql);
          if (s.includes('CREATE') || s.includes('ALTER')) return { rows: [] };
          if (s.includes('FROM public.job_description_templates'))
            return { rows: [] };
          return { rows: [] };
        }),
      } as unknown as HrmDbService;
      const catalog = new RecruitmentCatalogService(db, mockBridge() as never);
      const result = await catalog.listJobDescriptionTemplates(
        'holding',
        groupCeoToken(),
        {
          for: 'yctd',
        },
      );
      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('F-YCTD-JD-02 preview + create gates', () => {
    it('UT-YCTD-JD-03: preview retired → STATUS; create retired → STATUS', async () => {
      const db = {
        query: jest.fn().mockImplementation(async (sql: string) => {
          const s = String(sql);
          if (s.includes('CREATE') || s.includes('ALTER')) return { rows: [] };
          if (
            s.includes('FROM public.job_description_templates') &&
            s.includes('id = $1')
          ) {
            return {
              rows: [
                templateRow({
                  id: RETIRED_ID,
                  is_active: false,
                  code: 'JD-OLD',
                }),
              ],
            };
          }
          return { rows: [] };
        }),
      } as unknown as HrmDbService;
      const catalog = new RecruitmentCatalogService(db, mockBridge() as never);
      await expect(
        catalog.getYctdJdPreview(RETIRED_ID, 'main', groupCeoToken()),
      ).rejects.toMatchObject({ code: HRM_JD_YCTD_STATUS });

      const service = new RecruitmentService(db, mockBridge() as never);
      await expect(
        service.createJobRequisition(
          {
            company_id: 'main',
            title: 'YCTD test',
            department: 'Ops',
            employment_type: 'full_time',
            headcount: 1,
            job_template_id: RETIRED_ID,
          },
          groupCeoToken(),
        ),
      ).rejects.toMatchObject({ code: HRM_JD_YCTD_STATUS });
    });

    it('UT-YCTD-JD-04: missing both alias fields → REQUIRED', async () => {
      const db = {
        query: jest.fn().mockResolvedValue({ rows: [] }),
      } as unknown as HrmDbService;
      const service = new RecruitmentService(db, mockBridge() as never);
      await expect(
        service.createJobRequisition(
          {
            company_id: 'holding',
            title: 'YCTD',
            department: 'Ops',
            employment_type: 'full_time',
            headcount: 2,
          },
          groupCeoToken(),
        ),
      ).rejects.toMatchObject({ code: HRM_JD_YCTD_REQUIRED });
    });

    it('UT-YCTD-JD-05: unknown template → NOT-FOUND', async () => {
      const db = {
        query: jest.fn().mockImplementation(async (sql: string) => {
          const s = String(sql);
          if (s.includes('CREATE') || s.includes('ALTER')) return { rows: [] };
          if (s.includes('FROM public.job_description_templates'))
            return { rows: [] };
          return { rows: [] };
        }),
      } as unknown as HrmDbService;
      const service = new RecruitmentService(db, mockBridge() as never);
      await expect(
        service.createJobRequisition(
          {
            company_id: 'main',
            title: 'YCTD',
            department: 'Ops',
            employment_type: 'full_time',
            headcount: 1,
            job_description_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
          },
          groupCeoToken(),
        ),
      ).rejects.toMatchObject({ code: HRM_JD_YCTD_NOT_FOUND });
    });

    it('UT-YCTD-JD-06: active preview returns thin YctdJdPreview (no values_json)', async () => {
      const db = {
        query: jest.fn().mockImplementation(async (sql: string) => {
          const s = String(sql);
          if (s.includes('CREATE') || s.includes('ALTER')) return { rows: [] };
          if (s.includes('FROM public.job_description_templates')) {
            return { rows: [templateRow()] };
          }
          return { rows: [] };
        }),
      } as unknown as HrmDbService;
      const catalog = new RecruitmentCatalogService(db, mockBridge() as never);
      const preview = await catalog.getYctdJdPreview(
        ACTIVE_ID,
        'main',
        groupCeoToken(),
      );
      expect(preview).toMatchObject({
        job_template_id: ACTIVE_ID,
        job_description_id: ACTIVE_ID,
        code: 'JD-DRV-01',
        title: 'Lái xe tuyến',
        short_description: 'Mô tả ngắn JD',
        status: 'active',
      });
      expect(preview).not.toHaveProperty('values_json');
      expect(preview).not.toHaveProperty('layout_snapshot_json');
    });
  });

  describe('F-YCTD-JD-03/05 create + display', () => {
    it('UT-YCTD-JD-07 + UT-YCTD-JD-09: create persists soft FK; no job_postings write', async () => {
      const sqlLog: string[] = [];
      const db = {
        query: jest.fn().mockImplementation(async (sql: string) => {
          const s = String(sql);
          sqlLog.push(s);
          if (
            s.includes('CREATE') ||
            s.includes('ALTER') ||
            s.includes('DO $$')
          ) {
            return { rows: [] };
          }
          if (
            s.includes('FROM public.job_description_templates') &&
            s.includes('id = $1')
          ) {
            return { rows: [templateRow()] };
          }
          if (s.includes('INSERT INTO public.job_requisitions')) {
            expect(s).not.toContain('values_json');
            expect(s).not.toContain('layout_snapshot_json');
            return {
              rows: [
                {
                  id: REQ_ID,
                  company_id: 'holding',
                  title: 'Tuyển lái xe',
                  department: 'Ops',
                  employment_type: 'full_time',
                  headcount: 3,
                  status: 'open',
                  job_description: 'Snapshot khác values',
                  requirements: 'GPL B2',
                  job_template_id: ACTIVE_ID,
                  created_at: '2026-08-06T00:00:00.000Z',
                  updated_at: '2026-08-06T00:00:00.000Z',
                },
              ],
            };
          }
          return { rows: [] };
        }),
      } as unknown as HrmDbService;
      const service = new RecruitmentService(db, mockBridge() as never);
      const created = await service.createJobRequisition(
        {
          company_id: 'main',
          title: 'Tuyển lái xe',
          department: 'Ops',
          employment_type: 'full_time',
          headcount: 3,
          job_template_id: ACTIVE_ID,
          job_description: 'Snapshot khác values',
        },
        groupCeoToken(),
      );
      expect(created.job_template_id).toBe(ACTIVE_ID);
      expect(created.job_description_id).toBe(ACTIVE_ID);
      expect(created.jd_code).toBe('JD-DRV-01');
      expect(created.jd_title).toBe('Lái xe tuyến');
      expect(sqlLog.some((s) => s.includes('job_postings'))).toBe(false);
      expect(
        sqlLog.some((s) => s.includes('INSERT INTO public.job_requisitions')),
      ).toBe(true);
    });

    it('UT-YCTD-JD-08: list + get expose jd_code/jd_title + alias', async () => {
      const row = {
        id: REQ_ID,
        company_id: 'holding',
        title: 'Tuyển lái xe',
        department: 'Ops',
        employment_type: 'full_time',
        headcount: 3,
        status: 'open',
        job_description: 'snap',
        requirements: null,
        job_template_id: ACTIVE_ID,
        workflow_instance_id: null,
        jd_code: 'JD-DRV-01',
        jd_title: 'Lái xe tuyến',
        created_at: '2026-08-06T00:00:00.000Z',
        updated_at: '2026-08-06T00:00:00.000Z',
      };
      const db = {
        query: jest.fn().mockImplementation(async (sql: string) => {
          const s = String(sql);
          if (
            s.includes('CREATE') ||
            s.includes('ALTER') ||
            s.includes('DO $$')
          )
            return { rows: [] };
          if (s.includes('COUNT(*)') && s.includes('job_requisitions')) {
            return { rows: [{ total: '1' }] };
          }
          if (
            s.includes('FROM public.job_requisitions r') &&
            s.includes('LEFT JOIN')
          ) {
            return { rows: [row] };
          }
          return { rows: [] };
        }),
      } as unknown as HrmDbService;
      const service = new RecruitmentService(db, mockBridge() as never);
      const list = await service.listJobRequisitions(
        { company_id: 'main', page: 1, page_size: 20 },
        groupCeoToken(),
        { tenantId: 'xevn' },
      );
      expect(list.data[0]).toMatchObject({
        job_template_id: ACTIVE_ID,
        job_description_id: ACTIVE_ID,
        jd_code: 'JD-DRV-01',
        jd_title: 'Lái xe tuyến',
      });
      const detail = await service.getJobRequisitionById(
        REQ_ID,
        { company_id: 'main' },
        groupCeoToken(),
        { tenantId: 'xevn' },
      );
      expect(detail).toMatchObject({
        job_template_id: ACTIVE_ID,
        jd_code: 'JD-DRV-01',
        jd_title: 'Lái xe tuyến',
      });
    });

    it('UT-YCTD-JD-10: create with job_description_id only persists physical FK', async () => {
      const db = {
        query: jest
          .fn()
          .mockImplementation(async (sql: string, params?: unknown[]) => {
            const s = String(sql);
            if (
              s.includes('CREATE') ||
              s.includes('ALTER') ||
              s.includes('DO $$')
            )
              return { rows: [] };
            if (s.includes('FROM public.job_description_templates')) {
              return { rows: [templateRow()] };
            }
            if (s.includes('INSERT INTO public.job_requisitions')) {
              expect(params?.[8]).toBe(ACTIVE_ID);
              return {
                rows: [
                  {
                    id: REQ_ID,
                    company_id: 'holding',
                    title: 'YCTD',
                    department: 'Ops',
                    employment_type: 'full_time',
                    headcount: 1,
                    status: 'open',
                    job_description: 'Mô tả ngắn JD',
                    requirements: 'GPL B2',
                    job_template_id: ACTIVE_ID,
                    created_at: '2026-08-06T00:00:00.000Z',
                    updated_at: '2026-08-06T00:00:00.000Z',
                  },
                ],
              };
            }
            return { rows: [] };
          }),
      } as unknown as HrmDbService;
      const service = new RecruitmentService(db, mockBridge() as never);
      const created = await service.createJobRequisition(
        {
          company_id: 'holding',
          title: 'YCTD',
          department: 'Ops',
          employment_type: 'full_time',
          headcount: 1,
          job_description_id: ACTIVE_ID,
        },
        groupCeoToken(),
      );
      expect(created.job_template_id).toBe(ACTIVE_ID);
      expect(created.job_description_id).toBe(ACTIVE_ID);
    });
  });

  describe('F-YCTD-JD-04 re-bind + history', () => {
    it('UT-YCTD-JD-11: re-bind draft Hiệu lực OK; Ngừng STATUS; approved → 409', async () => {
      const otherActive = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
      let requisitionStatus = 'draft';
      const db = {
        query: jest
          .fn()
          .mockImplementation(async (sql: string, params?: unknown[]) => {
            const s = String(sql);
            if (
              s.includes('CREATE') ||
              s.includes('ALTER') ||
              s.includes('DO $$')
            )
              return { rows: [] };
            if (
              s.includes(
                'FROM public.job_requisitions WHERE id = $1::uuid LIMIT 1',
              )
            ) {
              return {
                rows: [
                  {
                    company_id: 'holding',
                    status: requisitionStatus,
                    workflow_instance_id: null,
                    job_template_id: ACTIVE_ID,
                    job_description: null,
                    requirements: null,
                  },
                ],
              };
            }
            if (
              s.includes('FROM public.job_description_templates') &&
              s.includes('id = $1')
            ) {
              const idParam = String(params?.[0] ?? '');
              if (idParam === RETIRED_ID) {
                return {
                  rows: [templateRow({ id: RETIRED_ID, is_active: false })],
                };
              }
              return {
                rows: [
                  templateRow({
                    id: otherActive,
                    code: 'JD-NEW',
                    title: 'JD mới',
                  }),
                ],
              };
            }
            if (s.includes('UPDATE public.job_requisitions')) {
              return {
                rows: [
                  {
                    id: REQ_ID,
                    company_id: 'holding',
                    title: 'YCTD',
                    department: 'Ops',
                    employment_type: 'full_time',
                    headcount: 1,
                    status: 'draft',
                    job_description: 'x',
                    requirements: null,
                    job_template_id: otherActive,
                    workflow_instance_id: null,
                    created_at: '2026-08-06T00:00:00.000Z',
                    updated_at: '2026-08-06T00:00:00.000Z',
                  },
                ],
              };
            }
            return { rows: [] };
          }),
      } as unknown as HrmDbService;
      const service = new RecruitmentService(db, mockBridge() as never);
      const ok = await service.updateJobRequisition(
        REQ_ID,
        { status: 'draft', job_template_id: otherActive },
        { company_id: 'main' },
        groupCeoToken(),
        { tenantId: 'xevn' },
      );
      expect(ok.job_template_id).toBe(otherActive);

      await expect(
        service.updateJobRequisition(
          REQ_ID,
          { job_template_id: RETIRED_ID },
          { company_id: 'main' },
          groupCeoToken(),
        ),
      ).rejects.toMatchObject({ code: HRM_JD_YCTD_STATUS });

      requisitionStatus = 'approved';
      await expect(
        service.updateJobRequisition(
          REQ_ID,
          { job_template_id: otherActive },
          { company_id: 'main' },
          groupCeoToken(),
        ),
      ).rejects.toMatchObject({
        code: HRM_JD_YCTD_REBIND_LOCKED,
      });
    });

    it('UT-YCTD-JD-12: after template retire, GET YCTD still returns ref (no CASCADE null)', async () => {
      const db = {
        query: jest.fn().mockImplementation(async (sql: string) => {
          const s = String(sql);
          if (
            s.includes('CREATE') ||
            s.includes('ALTER') ||
            s.includes('DO $$')
          )
            return { rows: [] };
          if (
            s.includes('FROM public.job_requisitions r') &&
            s.includes('LEFT JOIN')
          ) {
            return {
              rows: [
                {
                  id: REQ_ID,
                  company_id: 'holding',
                  title: 'YCTD',
                  department: 'Ops',
                  employment_type: 'full_time',
                  headcount: 1,
                  status: 'open',
                  job_description: 'snap',
                  requirements: null,
                  job_template_id: RETIRED_ID,
                  workflow_instance_id: null,
                  jd_code: 'JD-OLD',
                  jd_title: 'JD đã ngừng',
                  created_at: '2026-08-06T00:00:00.000Z',
                  updated_at: '2026-08-06T00:00:00.000Z',
                },
              ],
            };
          }
          return { rows: [] };
        }),
      } as unknown as HrmDbService;
      const service = new RecruitmentService(db, mockBridge() as never);
      const detail = await service.getJobRequisitionById(
        REQ_ID,
        { company_id: 'main' },
        groupCeoToken(),
        { tenantId: 'xevn' },
      );
      expect(detail.job_template_id).toBe(RETIRED_ID);
      expect(detail.jd_code).toBe('JD-OLD');
      expect(detail.jd_title).toBe('JD đã ngừng');
    });
  });

  describe('IT scope_parity', () => {
    it('IT-YCTD-JD-SP-01: bindable list id → get preview same scope 200', async () => {
      const db = {
        query: jest.fn().mockImplementation(async (sql: string) => {
          const s = String(sql);
          if (s.includes('CREATE') || s.includes('ALTER')) return { rows: [] };
          if (
            s.includes('FROM public.job_description_templates') &&
            s.includes('ORDER BY')
          ) {
            expect(s).toMatch(/company_id/);
            return { rows: [templateRow({ company_id: 'holding' })] };
          }
          if (
            s.includes('FROM public.job_description_templates') &&
            s.includes('id = $1')
          ) {
            expect(s).toMatch(/company_id/);
            return { rows: [templateRow({ company_id: 'holding' })] };
          }
          return { rows: [] };
        }),
      } as unknown as HrmDbService;
      const catalog = new RecruitmentCatalogService(db, mockBridge() as never);
      const list = await catalog.listJobDescriptionTemplates(
        'main',
        groupCeoToken(),
        {
          bindable: 'true',
        },
      );
      expect(list.items?.[0]?.id).toBe(ACTIVE_ID);
      const preview = await catalog.getYctdJdPreview(
        ACTIVE_ID,
        'main',
        groupCeoToken(),
      );
      expect(preview.job_template_id).toBe(ACTIVE_ID);
    });

    it('IT-YCTD-JD-SP-02: list requisition id → get by id same JWT (not 404)', async () => {
      const row = {
        id: REQ_ID,
        company_id: 'holding',
        title: 'YCTD',
        department: 'Ops',
        employment_type: 'full_time',
        headcount: 1,
        status: 'open',
        job_description: null,
        requirements: null,
        job_template_id: ACTIVE_ID,
        workflow_instance_id: null,
        jd_code: 'JD-DRV-01',
        jd_title: 'Lái xe tuyến',
        created_at: '2026-08-06T00:00:00.000Z',
        updated_at: '2026-08-06T00:00:00.000Z',
      };
      const db = {
        query: jest.fn().mockImplementation(async (sql: string) => {
          const s = String(sql);
          if (
            s.includes('CREATE') ||
            s.includes('ALTER') ||
            s.includes('DO $$')
          )
            return { rows: [] };
          if (s.includes('COUNT(*)')) return { rows: [{ total: '1' }] };
          if (
            s.includes('FROM public.job_requisitions r') &&
            s.includes('LEFT JOIN')
          ) {
            expect(s).toMatch(/r\.company_id/);
            return { rows: [row] };
          }
          return { rows: [] };
        }),
      } as unknown as HrmDbService;
      const service = new RecruitmentService(db, mockBridge() as never);
      const auth = groupCeoToken();
      const list = await service.listJobRequisitions(
        { company_id: 'main' },
        auth,
        { tenantId: 'xevn' },
      );
      expect(list.data[0].id).toBe(REQ_ID);
      const detail = await service.getJobRequisitionById(
        REQ_ID,
        { company_id: 'main' },
        auth,
        { tenantId: 'xevn' },
      );
      expect(detail.job_template_id).toBe(ACTIVE_ID);
      expect(detail.jd_code).toBe('JD-DRV-01');
    });
  });
});
