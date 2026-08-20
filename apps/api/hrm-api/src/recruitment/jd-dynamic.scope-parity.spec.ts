/**
 * PO-HRM-JD-DYNAMIC-BE-01 — scope_parity list ↔ get for defs / layouts / templates / groups / packs.
 * U19: same resolveHrmListScope + company_id filter.
 */
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { normalizePackCode, PACK_CORP_DEFAULT } from './jd-dynamic.constants';
import { JdDynamicService } from './jd-dynamic.service';
import { RecruitmentCatalogService } from './recruitment-catalog.service';

const FIELD_ID = '11111111-1111-4111-8111-111111111111';
const LAYOUT_ID = '22222222-2222-4222-8222-222222222222';
const GROUP_ID = '33333333-3333-4333-8333-333333333333';
const TEMPLATE_ID = '44444444-4444-4444-8444-444444444444';

function groupCeoToken() {
  return `Bearer ${signServiceJwt({
    sub: 'ceo@xe.vn',
    tenantId: 'xevn',
    companyId: 'main',
    roleCode: 'group_ceo',
  })}`;
}

function memberCeoToken() {
  return `Bearer ${signServiceJwt({
    sub: 'du-lich.ceo@xe.vn',
    tenantId: 'xe-du-lich',
    companyId: 'main',
    roleCode: 'subsidiary_ceo',
  })}`;
}

describe('JD dynamic scope_parity (PO-HRM-JD-DYNAMIC-BE-01)', () => {
  it('field def list id → getById 200 with same scope resolver (group CEO main)', async () => {
    const queries: string[] = [];
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        queries.push(s);
        if (
          s.includes('CREATE TABLE') ||
          s.includes('CREATE INDEX') ||
          s.includes('CREATE UNIQUE') ||
          s.includes('ALTER TABLE')
        ) {
          return { rows: [] };
        }
        if (s.includes('COUNT(*)') && s.includes('rec_jd_field_def')) {
          return { rows: [{ c: '1' }] };
        }
        if (s.includes('COUNT(*)') && s.includes('rec_jd_group_def')) {
          return { rows: [{ c: '1' }] };
        }
        if (
          s.includes('FROM public.rec_jd_field_def') &&
          s.includes('ORDER BY sort_order')
        ) {
          return {
            rows: [
              {
                id: FIELD_ID,
                company_id: 'holding',
                field_key: 'title',
                label: 'Tiêu đề',
                field_type: 'short_text',
                is_required: true,
                sort_order: 0,
                section_hint: 'hero',
                validation_json: null,
                is_system: true,
                is_active: true,
                applies_to_company_ids: null,
              },
            ],
          };
        }
        if (
          s.includes('FROM public.rec_jd_field_def') &&
          s.includes('id = $1')
        ) {
          expect(s).toMatch(/company_id/);
          return {
            rows: [
              {
                id: FIELD_ID,
                company_id: 'holding',
                field_key: 'title',
                label: 'Tiêu đề',
                field_type: 'short_text',
                is_required: true,
                sort_order: 0,
                section_hint: 'hero',
                validation_json: null,
                is_system: true,
                is_active: true,
                applies_to_company_ids: null,
              },
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;

    const svc = new JdDynamicService(db);
    const auth = groupCeoToken();
    const list = await svc.listFieldDefs('main', auth);
    expect(list.items).toHaveLength(1);
    const detail = await svc.getFieldDefById(FIELD_ID, 'main', auth);
    expect(detail.id).toBe(FIELD_ID);
    expect(detail.company_id).toBe('holding');
  });

  it('member CEO cannot get field stored under other LE (404)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (s.includes('CREATE ') || s.includes('ALTER ')) return { rows: [] };
        if (s.includes('COUNT(*)')) return { rows: [{ c: '1' }] };
        // list/get with member scope → empty (holding not in scope)
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new JdDynamicService(db);
    await expect(
      svc.getFieldDefById(FIELD_ID, 'main', memberCeoToken()),
    ).rejects.toMatchObject({
      code: 'HRM-JD-FIELD-404',
    });
  });

  it('layout list ↔ getById uses company_id filter', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (
          s.includes('CREATE ') ||
          s.includes('ALTER ') ||
          s.includes('CREATE INDEX') ||
          s.includes('CREATE UNIQUE')
        ) {
          return { rows: [] };
        }
        if (
          s.includes('FROM public.rec_jd_form_layout') &&
          s.includes('ORDER BY is_default')
        ) {
          expect(s).toMatch(/company_id/);
          return {
            rows: [
              {
                id: LAYOUT_ID,
                company_id: 'holding',
                name: 'Layout mặc định JD',
                is_default: true,
                status: 'published',
              },
            ],
          };
        }
        if (
          s.includes('FROM public.rec_jd_form_layout l') &&
          s.includes('l.id = $1')
        ) {
          expect(s).toMatch(/l\.company_id/);
          return {
            rows: [
              {
                id: LAYOUT_ID,
                company_id: 'holding',
                name: 'Layout mặc định JD',
                is_default: true,
                status: 'published',
              },
            ],
          };
        }
        if (s.includes('rec_jd_form_layout_item')) {
          return { rows: [] };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new JdDynamicService(db);
    const auth = groupCeoToken();
    const list = await svc.listLayouts('main', auth);
    expect(list.items[0].id).toBe(LAYOUT_ID);
    const detail = await svc.getLayoutById(LAYOUT_ID, 'main', auth);
    expect(detail.id).toBe(LAYOUT_ID);
  });

  it('group def list ↔ getById scope_parity', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (
          s.includes('CREATE ') ||
          s.includes('ALTER ') ||
          s.includes('CREATE INDEX') ||
          s.includes('CREATE UNIQUE')
        ) {
          return { rows: [] };
        }
        if (s.includes('COUNT(*)')) return { rows: [{ c: '1' }] };
        if (
          s.includes('FROM public.rec_jd_group_def g') &&
          s.includes('ORDER BY g.sort_order')
        ) {
          return {
            rows: [
              {
                id: GROUP_ID,
                company_id: 'holding',
                code: 'SEC_META',
                label: 'Meta',
                kind: 'system_skeleton',
                usage: 'default_eligible',
                view_style: 'chips',
                sort_order: 0,
                is_active: true,
              },
            ],
          };
        }
        if (
          s.includes('FROM public.rec_jd_group_def g') &&
          s.includes('g.id = $1')
        ) {
          expect(s).toMatch(/g\.company_id/);
          return {
            rows: [
              {
                id: GROUP_ID,
                company_id: 'holding',
                code: 'SEC_META',
                label: 'Meta',
                kind: 'system_skeleton',
                usage: 'default_eligible',
                view_style: 'chips',
                sort_order: 0,
                is_active: true,
              },
            ],
          };
        }
        if (s.includes('rec_jd_group_field')) return { rows: [] };
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new JdDynamicService(db);
    const auth = groupCeoToken();
    const list = await svc.listGroupDefs('main', auth);
    expect(list.items[0].id).toBe(GROUP_ID);
    const detail = await svc.getGroupDefById(GROUP_ID, 'main', auth);
    expect(detail.code).toBe('SEC_META');
  });

  it('job-templates list ↔ getById scope_parity (F-JD-01 ↔ F-JD-03)', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (s.includes('CREATE ') || s.includes('ALTER ')) return { rows: [] };
        if (
          s.includes('FROM public.job_description_templates') &&
          s.includes('ORDER BY updated_at')
        ) {
          expect(s).toMatch(/company_id/);
          return {
            rows: [
              {
                id: TEMPLATE_ID,
                company_id: 'holding',
                code: 'JD-1',
                title: 'Dev',
                position_name: 'Dev',
                position_code: 'DEV',
                job_description: null,
                requirements: null,
                notes: null,
                is_active: true,
                values_json: { title: 'Dev' },
                layout_snapshot_json: {
                  layout_version: 2,
                  groups: [
                    {
                      group_code: 'SEC_META',
                      label: 'Meta',
                      view_style: 'chips',
                      sort_order: 0,
                      source: 'pack_always_on',
                      fields: [
                        {
                          field_key: 'title',
                          label: 'Tiêu đề',
                          field_type: 'short_text',
                          is_required: true,
                          sort_order: 0,
                        },
                      ],
                    },
                  ],
                },
                layout_version: 2,
                has_dynamic_values: true,
              },
            ],
          };
        }
        if (
          s.includes('FROM public.job_description_templates') &&
          s.includes('id = $1')
        ) {
          expect(s).toMatch(/company_id/);
          return {
            rows: [
              {
                id: TEMPLATE_ID,
                company_id: 'holding',
                code: 'JD-1',
                title: 'Dev',
                position_name: 'Dev',
                position_code: 'DEV',
                job_description: null,
                requirements: null,
                notes: null,
                is_active: true,
                values_json: { title: 'Dev' },
                layout_snapshot_json: {
                  layout_version: 2,
                  groups: [
                    {
                      group_code: 'SEC_META',
                      label: 'Meta',
                      view_style: 'chips',
                      sort_order: 0,
                      source: 'pack_always_on',
                      fields: [
                        {
                          field_key: 'title',
                          label: 'Tiêu đề',
                          field_type: 'short_text',
                          is_required: true,
                          sort_order: 0,
                        },
                      ],
                    },
                  ],
                },
                layout_version: 2,
              },
            ],
          };
        }
        return { rows: [] };
      }),
    } as unknown as HrmDbService;

    const jd = new JdDynamicService(db);
    const catalog = new RecruitmentCatalogService(
      db,
      { ensureSchema: jest.fn() } as never,
      undefined,
      jd,
    );
    const auth = groupCeoToken();
    const list = await catalog.listJobDescriptionTemplates('main', auth);
    expect(list.data[0].id).toBe(TEMPLATE_ID);
    const detail = await catalog.getJobDescriptionTemplateById(
      TEMPLATE_ID,
      'main',
      auth,
    );
    expect(detail.id).toBe(TEMPLATE_ID);
    expect(detail.sections?.[0]?.group_code).toBe('SEC_META');
    expect(detail.sections?.[0]?.fields?.[0]?.value).toBe('Dev');
  });

  it('pack resolve fail-closed → PACK_CORP_DEFAULT when no family match', async () => {
    const packId = '55555555-5555-4555-8555-555555555555';
    const db = {
      query: jest
        .fn()
        .mockImplementation(async (sql: string, params?: unknown[]) => {
          const s = String(sql);
          if (
            s.includes('CREATE ') ||
            s.includes('ALTER ') ||
            s.includes('CREATE INDEX') ||
            s.includes('CREATE UNIQUE')
          ) {
            return { rows: [] };
          }
          if (s.includes('COUNT(*)')) return { rows: [{ c: '1' }] };
          if (s.includes('FROM public.rec_jd_pack_rule r')) {
            return {
              rows: [
                {
                  id: 'rule-fb',
                  priority: 100,
                  match_type: 'fallback',
                  match_value: null,
                  pack_id: packId,
                  pack_code: 'PACK_CORP_DEFAULT',
                  pack_label: 'Mặc định pháp nhân',
                },
              ],
            };
          }
          if (s.includes('FROM public.rec_jd_pack_group')) {
            return {
              rows: [
                {
                  group_id: GROUP_ID,
                  sort_order: 0,
                  always_on: true,
                  group_code: 'SEC_META',
                  label: 'Meta',
                  view_style: 'chips',
                  usage: 'default_eligible',
                  kind: 'system_skeleton',
                },
              ],
            };
          }
          if (s.includes('rec_jd_group_field')) return { rows: [] };
          if (s.includes('is_company_fallback')) {
            return {
              rows: [
                {
                  id: packId,
                  code: 'PACK_CORP_DEFAULT',
                  label: 'Mặc định pháp nhân',
                },
              ],
            };
          }
          return { rows: [] };
        }),
    } as unknown as HrmDbService;

    const svc = new JdDynamicService(db);
    const resolved = await svc.resolvePack(
      { company_id: 'holding', job_family: 'UNKNOWN_X' },
      groupCeoToken(),
    );
    expect(resolved.pack_code).toBe('PACK_CORP_DEFAULT');
    expect(resolved.resolved_by).toBe('fallback');
  });

  it('pack resolve throws HRM-JD-PACK-FALLBACK when no fallback configured', async () => {
    const db = {
      query: jest.fn().mockImplementation(async (sql: string) => {
        const s = String(sql);
        if (
          s.includes('CREATE ') ||
          s.includes('ALTER ') ||
          s.includes('CREATE INDEX') ||
          s.includes('CREATE UNIQUE')
        ) {
          return { rows: [] };
        }
        if (s.includes('COUNT(*)')) return { rows: [{ c: '1' }] };
        if (s.includes('FROM public.rec_jd_pack_rule')) return { rows: [] };
        if (s.includes('is_company_fallback')) return { rows: [] };
        return { rows: [] };
      }),
    } as unknown as HrmDbService;
    const svc = new JdDynamicService(db);
    await expect(
      svc.resolvePack({ company_id: 'holding' }, groupCeoToken()),
    ).rejects.toBeInstanceOf(ApiException);
    await expect(
      svc.resolvePack({ company_id: 'holding' }, groupCeoToken()),
    ).rejects.toMatchObject({
      code: 'HRM-JD-PACK-FALLBACK',
    });
  });

  it('normalizePackCode COMPANY_DEFAULT → CORP_DEFAULT', () => {
    expect(normalizePackCode('PACK_COMPANY_DEFAULT')).toBe(PACK_CORP_DEFAULT);
  });
});
