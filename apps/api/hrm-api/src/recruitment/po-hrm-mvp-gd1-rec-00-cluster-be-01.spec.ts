/**
 * PO-HRM-MVP-GD1-REC-00-CLUSTER-BE-01 — UC-BP-REC-00 Option A
 * create draft · publish PASS/FAIL · bindable · code dup · scope · retire
 * Spec: API-01 + DATA-01 CONFIRMED · U65 no seed
 */
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import {
  JdDynamicService,
  type JdLayoutSnapshotV2,
} from './jd-dynamic.service';
import { RecruitmentCatalogService } from './recruitment-catalog.service';
import {
  HRM_JD_YCTD_STATUS,
  isYctdJdBindable,
  normalizeJdTemplateStatus,
} from './yctd-jd-bind';

const TPL_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const TPL_ID_2 = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

function groupCeoAuth() {
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

function layoutWithRequired(keys: string[]): JdLayoutSnapshotV2 {
  return {
    layout_version: 2,
    groups: [
      {
        group_code: 'SEC_CORE',
        label: 'Cốt lõi',
        sort_order: 1,
        view_style: 'plain',
        source: 'manual',
        fields: [
          {
            field_key: 'title',
            label: 'Tiêu đề',
            field_type: 'short_text',
            sort_order: 1,
            is_required: true,
          },
          ...keys.map((k, i) => ({
            field_key: k,
            label: k,
            field_type: 'long_text' as const,
            sort_order: i + 2,
            is_required: true,
          })),
        ],
      },
    ],
  };
}

function isSchemaSql(s: string): boolean {
  return (
    s.includes('CREATE TABLE') ||
    s.includes('ALTER TABLE') ||
    s.includes('CREATE INDEX') ||
    s.includes('DO $$') ||
    (s.includes('UPDATE public.job_description_templates') &&
      s.includes('SET status =') &&
      !s.includes('WHERE id'))
  );
}

describe('PO-HRM-MVP-GD1-REC-00-CLUSTER-BE-01', () => {
  describe('yctd-jd-bind dual-assert', () => {
    it('isYctdJdBindable requires status=active AND is_active when status present', () => {
      expect(isYctdJdBindable({ status: 'active', is_active: true })).toBe(
        true,
      );
      expect(isYctdJdBindable({ status: 'draft', is_active: false })).toBe(
        false,
      );
      expect(isYctdJdBindable({ status: 'retired', is_active: false })).toBe(
        false,
      );
      expect(isYctdJdBindable({ status: 'active', is_active: false })).toBe(
        false,
      );
      expect(isYctdJdBindable({ status: null, is_active: true })).toBe(true);
      expect(normalizeJdTemplateStatus({ is_active: true })).toBe('active');
      expect(normalizeJdTemplateStatus({ is_active: false })).toBe('draft');
    });
  });

  describe('F-JD-02 create force draft', () => {
    it('create ignores is_active=true / status=active → draft + is_active=false', async () => {
      let insertParams: unknown[] = [];
      const db = {
        query: jest
          .fn()
          .mockImplementation(async (sql: string, params?: unknown[]) => {
            const s = String(sql);
            if (isSchemaSql(s)) return { rows: [] };
            if (
              s.includes(
                'SELECT id FROM public.job_description_templates WHERE company_id',
              )
            ) {
              return { rows: [] };
            }
            if (s.includes('INSERT INTO public.job_description_templates')) {
              insertParams = params ?? [];
              return {
                rows: [
                  {
                    id: TPL_ID,
                    company_id: 'holding',
                    code: 'JD-NEW-01',
                    title: 'Mẫu Nháp',
                    position_name: 'Lái xe',
                    position_code: 'DRIVER',
                    job_description: null,
                    requirements: null,
                    notes: null,
                    status: 'draft',
                    is_active: false,
                    values_json: null,
                    layout_snapshot_json: null,
                    layout_version: 1,
                    created_at: '2026-08-09T00:00:00.000Z',
                    updated_at: '2026-08-09T00:00:00.000Z',
                  },
                ],
              };
            }
            return { rows: [] };
          }),
      } as unknown as HrmDbService;
      const catalogs = {
        assertCodeInEffectiveCatalog: jest.fn().mockResolvedValue({
          code: 'DRIVER',
          label: 'Lái xe',
          status: 'active',
        }),
      };
      const svc = new RecruitmentCatalogService(
        db,
        mockBridge() as never,
        catalogs as never,
      );
      const row = await svc.createJobDescriptionTemplate(
        {
          company_id: 'holding',
          code: 'JD-NEW-01',
          title: 'Mẫu Nháp',
          position_code: 'DRIVER',
          is_active: true,
          status: 'active',
        },
        groupCeoAuth(),
        { tenantId: 'xevn' },
      );
      expect(row.status).toBe('draft');
      expect(row.is_active).toBe(false);
      // INSERT: status=$10 (idx 9), is_active=$11 (idx 10)
      expect(insertParams[9]).toBe('draft');
      expect(insertParams[10]).toBe(false);
    });

    it('create duplicate code → 409 HRM-JD-CODE-DUP', async () => {
      const db = {
        query: jest.fn().mockImplementation(async (sql: string) => {
          const s = String(sql);
          if (isSchemaSql(s)) return { rows: [] };
          if (
            s.includes(
              'SELECT id FROM public.job_description_templates WHERE company_id',
            )
          ) {
            return { rows: [{ id: TPL_ID }] };
          }
          return { rows: [] };
        }),
      } as unknown as HrmDbService;
      const catalogs = {
        assertCodeInEffectiveCatalog: jest.fn().mockResolvedValue({
          code: 'DRIVER',
          label: 'Lái xe',
          status: 'active',
        }),
      };
      const svc = new RecruitmentCatalogService(
        db,
        mockBridge() as never,
        catalogs as never,
      );
      await expect(
        svc.createJobDescriptionTemplate(
          {
            company_id: 'holding',
            code: 'JD-DUP',
            title: 'Dup',
            position_code: 'DRIVER',
          },
          groupCeoAuth(),
          { tenantId: 'xevn' },
        ),
      ).rejects.toMatchObject({ code: 'HRM-JD-CODE-DUP', status: 409 });
    });
  });

  describe('F-JD-04 publish', () => {
    it('publish PASS draft→active when required-on-layout filled', async () => {
      const snap = layoutWithRequired(['responsibilities']);
      const db = {
        query: jest.fn().mockImplementation(async (sql: string) => {
          const s = String(sql);
          if (isSchemaSql(s)) return { rows: [] };
          if (
            s.includes(
              'FROM public.job_description_templates WHERE id = $1::uuid',
            ) &&
            s.includes('layout_snapshot')
          ) {
            return {
              rows: [
                {
                  company_id: 'holding',
                  status: 'draft',
                  is_active: false,
                  values_json: {
                    title: 'OK',
                    responsibilities: 'Lái tuyến HN-SG',
                  },
                  layout_snapshot_json: snap,
                },
              ],
            };
          }
          if (
            s.includes('UPDATE public.job_description_templates') &&
            s.includes("status = 'active'")
          ) {
            return {
              rows: [
                {
                  id: TPL_ID,
                  company_id: 'holding',
                  code: 'JD-PUB',
                  title: 'OK',
                  position_name: 'Lái xe',
                  position_code: 'DRIVER',
                  job_description: 'Lái tuyến HN-SG',
                  requirements: null,
                  notes: null,
                  status: 'active',
                  is_active: true,
                  values_json: {
                    title: 'OK',
                    responsibilities: 'Lái tuyến HN-SG',
                  },
                  layout_snapshot_json: snap,
                  layout_version: 2,
                  created_at: '2026-08-09T00:00:00.000Z',
                  updated_at: '2026-08-09T00:00:00.000Z',
                },
              ],
            };
          }
          return { rows: [] };
        }),
      } as unknown as HrmDbService;
      const jdDynamic = {
        ensureSchema: jest.fn().mockResolvedValue(undefined),
        collectMissingRequiredKeys: jest.fn().mockReturnValue([]),
        validateSnapshotAndValues: jest
          .fn()
          .mockImplementation((snapshot, values) => ({
            layout_version: 2,
            snapshot,
            values,
          })),
      };
      const svc = new RecruitmentCatalogService(
        db,
        mockBridge() as never,
        undefined,
        jdDynamic as unknown as JdDynamicService,
      );
      const row = await svc.publishJobDescriptionTemplate(
        TPL_ID,
        'main',
        groupCeoAuth(),
      );
      expect(row.status).toBe('active');
      expect(row.is_active).toBe(true);
    });

    it('publish FAIL missing required → HRM-REC-JD-PUB-REQUIRED', async () => {
      const snap = layoutWithRequired(['responsibilities']);
      const db = {
        query: jest.fn().mockImplementation(async (sql: string) => {
          const s = String(sql);
          if (isSchemaSql(s)) return { rows: [] };
          if (
            s.includes(
              'FROM public.job_description_templates WHERE id = $1::uuid',
            )
          ) {
            return {
              rows: [
                {
                  company_id: 'holding',
                  status: 'draft',
                  is_active: false,
                  values_json: { title: 'OK' },
                  layout_snapshot_json: snap,
                },
              ],
            };
          }
          return { rows: [] };
        }),
      } as unknown as HrmDbService;
      const jdDynamic = {
        ensureSchema: jest.fn().mockResolvedValue(undefined),
        collectMissingRequiredKeys: jest
          .fn()
          .mockReturnValue(['responsibilities']),
        validateSnapshotAndValues: jest.fn(),
      };
      const svc = new RecruitmentCatalogService(
        db,
        mockBridge() as never,
        undefined,
        jdDynamic as unknown as JdDynamicService,
      );
      try {
        await svc.publishJobDescriptionTemplate(TPL_ID, 'main', groupCeoAuth());
        throw new Error('expected PUB-REQUIRED');
      } catch (err) {
        expect(err).toBeInstanceOf(ApiException);
        expect((err as ApiException).code).toBe('HRM-REC-JD-PUB-REQUIRED');
        expect((err as ApiException).details).toMatchObject({
          missing_keys: ['responsibilities'],
          status: 'draft',
        });
      }
    });

    it('publish FAIL empty layout → HRM-REC-JD-PUB-LAYOUT-EMPTY', async () => {
      const db = {
        query: jest.fn().mockImplementation(async (sql: string) => {
          const s = String(sql);
          if (isSchemaSql(s)) return { rows: [] };
          if (
            s.includes(
              'FROM public.job_description_templates WHERE id = $1::uuid',
            )
          ) {
            return {
              rows: [
                {
                  company_id: 'holding',
                  status: 'draft',
                  is_active: false,
                  values_json: {},
                  layout_snapshot_json: { layout_version: 2, groups: [] },
                },
              ],
            };
          }
          return { rows: [] };
        }),
      } as unknown as HrmDbService;
      const svc = new RecruitmentCatalogService(db, mockBridge() as never);
      await expect(
        svc.publishJobDescriptionTemplate(TPL_ID, 'main', groupCeoAuth()),
      ).rejects.toMatchObject({ code: 'HRM-REC-JD-PUB-LAYOUT-EMPTY' });
    });

    it('publish FAIL when not draft → HRM-REC-JD-PUB-STATE', async () => {
      const db = {
        query: jest.fn().mockImplementation(async (sql: string) => {
          const s = String(sql);
          if (isSchemaSql(s)) return { rows: [] };
          if (
            s.includes(
              'FROM public.job_description_templates WHERE id = $1::uuid',
            )
          ) {
            return {
              rows: [
                {
                  company_id: 'holding',
                  status: 'active',
                  is_active: true,
                  values_json: {},
                  layout_snapshot_json: layoutWithRequired([]),
                },
              ],
            };
          }
          return { rows: [] };
        }),
      } as unknown as HrmDbService;
      const svc = new RecruitmentCatalogService(db, mockBridge() as never);
      await expect(
        svc.publishJobDescriptionTemplate(TPL_ID, 'main', groupCeoAuth()),
      ).rejects.toMatchObject({ code: 'HRM-REC-JD-PUB-STATE' });
    });

    it('publish retired → HRM-REC-JD-REACTIVATE-HOLD', async () => {
      const db = {
        query: jest.fn().mockImplementation(async (sql: string) => {
          const s = String(sql);
          if (isSchemaSql(s)) return { rows: [] };
          if (
            s.includes(
              'FROM public.job_description_templates WHERE id = $1::uuid',
            )
          ) {
            return {
              rows: [
                {
                  company_id: 'holding',
                  status: 'retired',
                  is_active: false,
                  values_json: {},
                  layout_snapshot_json: layoutWithRequired([]),
                },
              ],
            };
          }
          return { rows: [] };
        }),
      } as unknown as HrmDbService;
      const svc = new RecruitmentCatalogService(db, mockBridge() as never);
      await expect(
        svc.publishJobDescriptionTemplate(TPL_ID, 'main', groupCeoAuth()),
      ).rejects.toMatchObject({ code: 'HRM-REC-JD-REACTIVATE-HOLD' });
    });
  });

  describe('F-JD-01 bindable + F-JD-03 preview STATUS', () => {
    it('bindable/for=yctd filters status=active AND is_active=TRUE', async () => {
      const db = {
        query: jest.fn().mockImplementation(async (sql: string) => {
          const s = String(sql);
          if (isSchemaSql(s)) return { rows: [] };
          if (
            s.includes('FROM public.job_description_templates') &&
            s.includes('ORDER BY')
          ) {
            expect(s).toContain("status = 'active'");
            expect(s).toContain('is_active = TRUE');
            return {
              rows: [
                {
                  id: TPL_ID,
                  company_id: 'holding',
                  code: 'JD-A',
                  title: 'Active',
                  position_code: 'DRIVER',
                  position_name: 'Lái xe',
                  job_description: 'desc',
                  requirements: null,
                  status: 'active',
                  is_active: true,
                },
              ],
            };
          }
          return { rows: [] };
        }),
      } as unknown as HrmDbService;
      const svc = new RecruitmentCatalogService(db, mockBridge() as never);
      const result = await svc.listJobDescriptionTemplates(
        'main',
        groupCeoAuth(),
        {
          for: 'yctd',
        },
      );
      expect(result.total).toBe(1);
      expect(result.items?.[0]?.status).toBe('active');
      expect(result.items?.[0]?.is_active).toBe(true);
    });

    it('preview=yctd on draft → HRM-JD-YCTD-STATUS', async () => {
      const db = {
        query: jest.fn().mockImplementation(async (sql: string) => {
          const s = String(sql);
          if (isSchemaSql(s)) return { rows: [] };
          if (
            s.includes('FROM public.job_description_templates') &&
            s.includes('id = $1')
          ) {
            return {
              rows: [
                {
                  id: TPL_ID,
                  code: 'JD-D',
                  title: 'Draft',
                  job_description: null,
                  requirements: null,
                  status: 'draft',
                  is_active: false,
                },
              ],
            };
          }
          return { rows: [] };
        }),
      } as unknown as HrmDbService;
      const svc = new RecruitmentCatalogService(db, mockBridge() as never);
      await expect(
        svc.getYctdJdPreview(TPL_ID, 'main', groupCeoAuth()),
      ).rejects.toMatchObject({
        code: HRM_JD_YCTD_STATUS,
      });
    });
  });

  describe('F-JD-04 soft-retire + U19 scope', () => {
    it('DELETE soft-retire → status=retired is_active=false', async () => {
      let updateSql = '';
      const db = {
        query: jest.fn().mockImplementation(async (sql: string) => {
          const s = String(sql);
          if (isSchemaSql(s)) return { rows: [] };
          if (
            s.includes('UPDATE public.job_description_templates') &&
            s.includes('WHERE id')
          ) {
            updateSql = s;
            return {
              rows: [{ id: TPL_ID, status: 'retired', is_active: false }],
            };
          }
          return { rows: [] };
        }),
      } as unknown as HrmDbService;
      const svc = new RecruitmentCatalogService(db, mockBridge() as never);
      const row = await svc.deleteJobDescriptionTemplate(
        TPL_ID,
        'main',
        groupCeoAuth(),
      );
      expect(row).toEqual({ id: TPL_ID, status: 'retired', is_active: false });
      expect(updateSql).toContain("status = 'retired'");
      expect(updateSql).toContain('is_active = FALSE');
    });

    it('get-by-id uses same company filter as list (U19) — out of scope 404', async () => {
      const db = {
        query: jest.fn().mockImplementation(async (sql: string) => {
          const s = String(sql);
          if (isSchemaSql(s)) return { rows: [] };
          if (
            s.includes('FROM public.job_description_templates') &&
            s.includes('id = $1')
          ) {
            expect(s).toMatch(/company_id/);
            return { rows: [] };
          }
          return { rows: [] };
        }),
      } as unknown as HrmDbService;
      const svc = new RecruitmentCatalogService(db, mockBridge() as never);
      await expect(
        svc.getJobDescriptionTemplateById(TPL_ID_2, 'main', groupCeoAuth()),
      ).rejects.toMatchObject({ code: 'HRM-REC-JD-404' });
    });

    it('PATCH content on retired → HRM-REC-JD-RETIRED-LOCKED', async () => {
      const db = {
        query: jest.fn().mockImplementation(async (sql: string) => {
          const s = String(sql);
          if (isSchemaSql(s)) return { rows: [] };
          if (
            s.includes(
              'FROM public.job_description_templates WHERE id = $1::uuid',
            )
          ) {
            return {
              rows: [
                {
                  company_id: 'holding',
                  code: 'JD-R',
                  position_code: 'DRIVER',
                  status: 'retired',
                  is_active: false,
                  values_json: null,
                  layout_snapshot_json: null,
                  layout_version: 1,
                },
              ],
            };
          }
          return { rows: [] };
        }),
      } as unknown as HrmDbService;
      const svc = new RecruitmentCatalogService(db, mockBridge() as never);
      await expect(
        svc.updateJobDescriptionTemplate(
          TPL_ID,
          'main',
          { title: 'Nope' },
          groupCeoAuth(),
        ),
      ).rejects.toMatchObject({ code: 'HRM-REC-JD-RETIRED-LOCKED' });
    });
  });
});
