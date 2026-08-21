/**
 * PO-HRM-PAY-TPL-RESOLVE-PROVINCE-BE-01
 * Jest theo 6 AC (PO-HRM-PAY-SHEET-TEMPLATE-SPEC-01 §7):
 *   AC-PAY-TPL-PROV-01/02 — createTemplate BR-TPL-PROV-01/02 (province scope guard + dup)
 *   AC-PAY-TPL-PROV-03/04 — resolveForEmployee ranking + NO_PROVINCE_MATCH fallback
 *   AC-PAY-TPL-PROV-05 — PROCESS payslip line warning: KHÔNG implement Task này (out of scope, xem evidence)
 *   AC-PAY-TPL-PROV-06 — kế thừa AC-PAY-TPL-05 immutability, đã PASS ở pay-sheet-template.service.spec.ts
 * Plus 2 test phòng thủ (BR-TPL-RESOLVE-01/02, ngoài 6 AC nhưng task yêu cầu):
 *   NO_CANDIDATE (ranking rỗng) và AMBIGUOUS (2 template cùng tier cao nhất).
 */
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import {
  HRM_PAY_TPL_400_PROVINCE_SCOPE,
  HRM_PAY_TPL_404,
  HRM_PAY_TPL_409_PROVINCE_DUP,
  HRM_PAY_TPL_412_NO_PROVINCE_MATCH,
} from './pay-sheet-template.constants';
import { PaySheetTemplateService } from './pay-sheet-template.service';

type HeaderRow = {
  id: string;
  company_id: string;
  code: string;
  name: string;
  description: string | null;
  status: string;
  is_default: boolean;
  applicability_scope: string;
  ou_id: string | null;
  position_key: string | null;
  employee_id: string | null;
  applicability_province_code: string | null;
  business_line_tag: string | null;
  policy_pack_id: string | null;
  input_pack_profile_id: string | null;
  archived_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

function groupCeoToken() {
  return `Bearer ${signServiceJwt({
    sub: 'ceo@xe.vn',
    tenantId: 'xevn',
    companyId: 'main',
    roleCode: 'group_ceo',
  })}`;
}

function baseHeader(overrides: Partial<HeaderRow> = {}): HeaderRow {
  return {
    id: 'aaaaaaaa-0000-4000-8000-000000000001',
    company_id: 'holding',
    code: 'lx_route_default',
    name: 'LX Route mặc định',
    description: null,
    status: 'active',
    is_default: false,
    applicability_scope: 'company',
    ou_id: null,
    position_key: null,
    employee_id: null,
    applicability_province_code: null,
    business_line_tag: null,
    policy_pack_id: null,
    input_pack_profile_id: null,
    archived_at: null,
    created_by: 'ceo@xe.vn',
    updated_by: 'ceo@xe.vn',
    created_at: '2026-08-12T00:00:00Z',
    updated_at: '2026-08-12T00:00:00Z',
    ...overrides,
  };
}

/** Mock DB tối giản cho createTemplate + resolveForEmployee (không cần list/lines/archive). */
function createProvinceDb(seed: HeaderRow[] = []) {
  const headers: HeaderRow[] = seed.map((h) => ({ ...h }));
  const sqls: string[] = [];

  const db = {
    query: jest
      .fn()
      .mockImplementation(async (sql: string, params?: unknown[]) => {
        const s = String(sql).replace(/\s+/g, ' ').trim();
        sqls.push(s);

        if (
          s.includes('CREATE TABLE') ||
          s.includes('CREATE INDEX') ||
          s.includes('CREATE UNIQUE') ||
          s.includes('ALTER TABLE') ||
          s.includes('DO $$')
        ) {
          return { rows: [] };
        }

        // assertNoProvinceDuplicate (BR-TPL-PROV-02)
        if (s.startsWith('SELECT id FROM public.pay_sheet_templates WHERE')) {
          const companyId = String(params?.[0]);
          const provinceCode = String(params?.[1]);
          let idx = 2;
          let tag: string | null = null;
          let excludeId: string | null = null;
          if (s.includes('business_line_tag = $')) {
            tag = String(params?.[idx]);
            idx += 1;
          }
          if (s.includes('id <> $')) {
            excludeId = String(params?.[idx]);
            idx += 1;
          }
          const match = headers.find(
            (h) =>
              h.company_id === companyId &&
              !h.archived_at &&
              h.applicability_province_code === provinceCode &&
              (tag !== null
                ? h.business_line_tag === tag
                : h.business_line_tag === null) &&
              (excludeId ? h.id !== excludeId : true),
          );
          return { rows: match ? [{ id: match.id }] : [] };
        }

        // createTemplate INSERT
        if (s.includes('INSERT INTO public.pay_sheet_templates (')) {
          const row: HeaderRow = {
            id: String(params?.[0]),
            company_id: String(params?.[1]),
            code: String(params?.[2]),
            name: String(params?.[3]),
            description: (params?.[4] as string | null) ?? null,
            status: String(params?.[5] ?? 'draft'),
            is_default: Boolean(params?.[6]),
            applicability_scope: String(params?.[7] ?? 'company'),
            ou_id: (params?.[8] as string | null) ?? null,
            position_key: (params?.[9] as string | null) ?? null,
            employee_id: (params?.[10] as string | null) ?? null,
            applicability_province_code:
              (params?.[11] as string | null) ?? null,
            business_line_tag: (params?.[12] as string | null) ?? null,
            policy_pack_id: (params?.[13] as string | null) ?? null,
            input_pack_profile_id: (params?.[14] as string | null) ?? null,
            archived_at: null,
            created_by: (params?.[15] as string | null) ?? null,
            updated_by: (params?.[15] as string | null) ?? null,
            created_at: '2026-08-12T00:00:00Z',
            updated_at: '2026-08-12T00:00:00Z',
          };
          headers.push(row);
          return { rows: [{ ...row }] };
        }

        // is_default reset (only hit if payload.isDefault === true — unused in this spec but kept safe)
        if (
          s.startsWith(
            'UPDATE public.pay_sheet_templates SET is_default = FALSE',
          )
        ) {
          const companyId = String(params?.[0]);
          for (const h of headers) {
            if (h.company_id === companyId && !h.archived_at)
              h.is_default = false;
          }
          return { rows: [] };
        }

        // resolveForEmployee candidate list
        if (
          s.includes('FROM public.pay_sheet_templates t') &&
          s.includes("t.status = 'active'") &&
          s.includes('t.archived_at IS NULL')
        ) {
          let rows = headers.filter(
            (h) => h.status === 'active' && !h.archived_at,
          );
          if (s.includes('t.company_id = ANY')) {
            const ids = params?.[0] as string[];
            rows = rows.filter((h) => ids.includes(h.company_id));
          } else if (s.includes('t.company_id = $1')) {
            rows = rows.filter((h) => h.company_id === String(params?.[0]));
          }
          if (s.includes('t.business_line_tag = $')) {
            const tagParam = params?.[(params?.length ?? 1) - 1];
            rows = rows.filter((h) => h.business_line_tag === String(tagParam));
          }
          rows = [...rows].sort((a, b) => {
            if (a.is_default !== b.is_default) return a.is_default ? -1 : 1;
            return b.updated_at.localeCompare(a.updated_at);
          });
          return { rows: rows.map((r) => ({ ...r })) };
        }

        return { rows: [] };
      }),
  } as unknown as HrmDbService;

  return { db, sqls, headers };
}

describe('PaySheetTemplateService.resolveForEmployee (PO-HRM-PAY-TPL-RESOLVE-PROVINCE-BE-01)', () => {
  const auth = groupCeoToken();

  it('AC-PAY-TPL-PROV-01: 2 template cùng business_line_tag khác province đều lưu 2xx', async () => {
    const { db, headers } = createProvinceDb();
    const svc = new PaySheetTemplateService(db);
    const nd = await svc.createTemplate(
      {
        company_id: 'main',
        code: 'lx_route_nd',
        name: 'LX Tuyến Nam Định',
        businessLineTag: 'LX_ROUTE',
        applicabilityScope: 'province',
        applicabilityProvinceCode: 'ND',
      } as never,
      auth,
    );
    const nb = await svc.createTemplate(
      {
        company_id: 'main',
        code: 'lx_route_nb',
        name: 'LX Tuyến Ninh Bình',
        businessLineTag: 'LX_ROUTE',
        applicabilityScope: 'province',
        applicabilityProvinceCode: 'NB',
      } as never,
      auth,
    );
    expect(nd.applicabilityProvinceCode).toBe('ND');
    expect(nb.applicabilityProvinceCode).toBe('NB');
    expect(headers).toHaveLength(2);
  });

  it('AC-PAY-TPL-PROV-01: applicability_province_code set mà thiếu business_line_tag → HRM-PAY-TPL-400-PROVINCE-SCOPE', async () => {
    const { db } = createProvinceDb();
    const svc = new PaySheetTemplateService(db);
    await expect(
      svc.createTemplate(
        {
          company_id: 'main',
          code: 'lx_route_orphan',
          name: 'Thiếu business_line_tag',
          applicabilityScope: 'province',
          applicabilityProvinceCode: 'ND',
        } as never,
        auth,
      ),
    ).rejects.toMatchObject({ code: HRM_PAY_TPL_400_PROVINCE_SCOPE });
  });

  it('AC-PAY-TPL-PROV-02: tạo template thứ 3 trùng (business_line_tag, province) khi bản 1 còn active → HRM-PAY-TPL-409-PROVINCE-DUP', async () => {
    const { db } = createProvinceDb([
      baseHeader({
        id: 'aaaaaaaa-0000-4000-8000-000000000010',
        code: 'lx_route_nd',
        applicability_scope: 'province',
        business_line_tag: 'LX_ROUTE',
        applicability_province_code: 'ND',
      }),
    ]);
    const svc = new PaySheetTemplateService(db);
    await expect(
      svc.createTemplate(
        {
          company_id: 'main',
          code: 'lx_route_nd_v2',
          name: 'LX Tuyến ND bản 2 (trùng)',
          businessLineTag: 'LX_ROUTE',
          applicabilityScope: 'province',
          applicabilityProvinceCode: 'ND',
        } as never,
        auth,
      ),
    ).rejects.toMatchObject({ code: HRM_PAY_TPL_409_PROVINCE_DUP });
  });

  it('AC-PAY-TPL-PROV-03: resolveForEmployee province_code=ND chọn đúng template ND trong 3 mẫu LX-T (ND/NB/TB)', async () => {
    const { db } = createProvinceDb([
      baseHeader({
        id: 'aaaaaaaa-0000-4000-8000-0000000000nd',
        code: 'lx_route_nd',
        applicability_scope: 'province',
        business_line_tag: 'LX_ROUTE',
        applicability_province_code: 'ND',
      }),
      baseHeader({
        id: 'aaaaaaaa-0000-4000-8000-0000000000nb',
        code: 'lx_route_nb',
        applicability_scope: 'province',
        business_line_tag: 'LX_ROUTE',
        applicability_province_code: 'NB',
      }),
      baseHeader({
        id: 'aaaaaaaa-0000-4000-8000-0000000000tb',
        code: 'lx_route_tb',
        applicability_scope: 'province',
        business_line_tag: 'LX_ROUTE',
        applicability_province_code: 'TB',
      }),
      baseHeader({
        id: 'aaaaaaaa-0000-4000-8000-000000000cty',
        code: 'lx_route_company_default',
        applicability_scope: 'company',
        business_line_tag: 'LX_ROUTE',
        is_default: true,
      }),
    ]);
    const svc = new PaySheetTemplateService(db);
    const result = await svc.resolveForEmployee(
      { id: 'emp-1', provinceCode: 'ND' },
      { companyId: 'main', businessLineTag: 'LX_ROUTE' },
      auth,
    );
    expect(result.matchStatus).toBe('MATCHED');
    expect(result.recommended?.id).toBe('aaaaaaaa-0000-4000-8000-0000000000nd');
    expect(result.recommended?.id).not.toBe(
      'aaaaaaaa-0000-4000-8000-0000000000nb',
    );
    expect(result.recommended?.id).not.toBe(
      'aaaaaaaa-0000-4000-8000-000000000cty',
    );
  });

  it('AC-PAY-TPL-PROV-04: province_code không khớp catalog (VT khi chỉ có ND/NB/TB) → NO_PROVINCE_MATCH, fallback company, cảnh báo, không tự bịa mẫu', async () => {
    const { db } = createProvinceDb([
      baseHeader({
        id: 'bbbbbbbb-0000-4000-8000-0000000000nd',
        code: 'vpt_nd',
        applicability_scope: 'province',
        business_line_tag: 'PROV_OFFICE',
        applicability_province_code: 'ND',
      }),
      baseHeader({
        id: 'bbbbbbbb-0000-4000-8000-0000000000nb',
        code: 'vpt_nb',
        applicability_scope: 'province',
        business_line_tag: 'PROV_OFFICE',
        applicability_province_code: 'NB',
      }),
      baseHeader({
        id: 'bbbbbbbb-0000-4000-8000-0000000000tb',
        code: 'vpt_tb',
        applicability_scope: 'province',
        business_line_tag: 'PROV_OFFICE',
        applicability_province_code: 'TB',
      }),
      baseHeader({
        id: 'bbbbbbbb-0000-4000-8000-000000000cty',
        code: 'vpt_company_default',
        applicability_scope: 'company',
        business_line_tag: 'PROV_OFFICE',
        is_default: true,
      }),
    ]);
    const svc = new PaySheetTemplateService(db);
    const result = await svc.resolveForEmployee(
      { id: 'emp-2', provinceCode: 'VT' },
      { companyId: 'main', businessLineTag: 'PROV_OFFICE' },
      auth,
    );
    expect(result.matchStatus).toBe('NO_PROVINCE_MATCH');
    expect(result.warnings).toContain(HRM_PAY_TPL_412_NO_PROVINCE_MATCH);
    expect(result.recommended?.id).toBe('bbbbbbbb-0000-4000-8000-000000000cty');
    expect(result.recommended).not.toBeNull();
  });

  it('TG (VP Hà Nội) không có trục tỉnh — resolver chọn thẳng company-wide, không cảnh báo NO_PROVINCE_MATCH', async () => {
    const { db } = createProvinceDb([
      baseHeader({
        id: 'cccccccc-0000-4000-8000-000000000tg',
        code: 'vp_hn_thoi_gian',
        applicability_scope: 'company',
        business_line_tag: 'TIME_VP_HN',
        is_default: true,
      }),
    ]);
    const svc = new PaySheetTemplateService(db);
    const result = await svc.resolveForEmployee(
      { id: 'emp-3', provinceCode: null },
      { companyId: 'main', businessLineTag: 'TIME_VP_HN' },
      auth,
    );
    expect(result.matchStatus).toBe('MATCHED');
    expect(result.warnings).toHaveLength(0);
    expect(result.recommended?.id).toBe('cccccccc-0000-4000-8000-000000000tg');
  });

  it('BR-TPL-RESOLVE-02 (phòng thủ, ngoài 6 AC): 2 template cùng tier province + cùng is_default/updated_at → AMBIGUOUS, không tự chọn 1', async () => {
    const { db } = createProvinceDb([
      baseHeader({
        id: 'dddddddd-0000-4000-8000-000000000001',
        code: 'lx_route_nd_dup1',
        applicability_scope: 'province',
        business_line_tag: 'LX_ROUTE',
        applicability_province_code: 'ND',
        updated_at: '2026-08-12T00:00:00Z',
      }),
      baseHeader({
        id: 'dddddddd-0000-4000-8000-000000000002',
        code: 'lx_route_nd_dup2',
        applicability_scope: 'province',
        business_line_tag: 'LX_ROUTE',
        applicability_province_code: 'ND',
        updated_at: '2026-08-12T00:00:00Z',
      }),
    ]);
    const svc = new PaySheetTemplateService(db);
    const result = await svc.resolveForEmployee(
      { id: 'emp-4', provinceCode: 'ND' },
      { companyId: 'main', businessLineTag: 'LX_ROUTE' },
      auth,
    );
    expect(result.matchStatus).toBe('AMBIGUOUS');
    expect(result.recommended).toBeNull();
    expect(result.errorCode).toBe(HRM_PAY_TPL_409_PROVINCE_DUP);
    expect(result.tiedTemplateIds).toHaveLength(2);
  });

  it('ranking rỗng (phòng thủ, ngoài 6 AC): company scope không có template active nào → NO_CANDIDATE, errorCode HRM-PAY-TPL-404', async () => {
    const { db } = createProvinceDb([]);
    const svc = new PaySheetTemplateService(db);
    const result = await svc.resolveForEmployee(
      { id: 'emp-5', provinceCode: 'ND' },
      { companyId: 'main', businessLineTag: 'LX_ROUTE' },
      auth,
    );
    expect(result.matchStatus).toBe('NO_CANDIDATE');
    expect(result.recommended).toBeNull();
    expect(result.errorCode).toBe(HRM_PAY_TPL_404);
  });

  it('ApiException instance check (đúng convention lỗi service này)', async () => {
    const { db } = createProvinceDb();
    const svc = new PaySheetTemplateService(db);
    await expect(
      svc.createTemplate(
        {
          company_id: 'main',
          code: 'lx_route_orphan2',
          name: 'Thiếu business_line_tag 2',
          applicabilityScope: 'province',
          applicabilityProvinceCode: 'ND',
        } as never,
        auth,
      ),
    ).rejects.toBeInstanceOf(ApiException);
  });
});
