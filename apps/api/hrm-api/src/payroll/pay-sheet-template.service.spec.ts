/**
 * PO-HRM-AMIS-PARITY-PAY-TPL-BE-01
 * Jest: ensureSchema · scope_parity list↔get · duplicate code/line · archive hide · snapshot immutability
 */
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import {
  HRM_PAY_TPL_404,
  HRM_PAY_TPL_409_CODE,
  HRM_PAY_TPL_409_IMMUTABLE,
  HRM_PAY_TPL_409_LINE,
  HRM_PAY_TPL_412_TEMPLATE,
} from './pay-sheet-template.constants';
import { PaySheetTemplateService } from './pay-sheet-template.service';

const TPL_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const LINE_ID = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const COMP_ID = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const COMP_ID_2 = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
const FORMULA_ID = 'ffffffff-ffff-4fff-8fff-ffffffffffff';
const PERIOD_ID = '99999999-9999-4999-8999-999999999999';

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
  archived_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

type LineRow = {
  id: string;
  template_id: string;
  company_id: string;
  component_id: string;
  component_code: string;
  display_label: string | null;
  sort_order: number;
  group_key: string | null;
  is_visible: boolean;
  is_identity_or_total: boolean;
  formula_override_definition_id: string | null;
  formula_override_json: unknown;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

type PeriodRow = {
  id: string;
  company_id: string;
  period_label: string;
  start_date: string;
  end_date: string;
  status: string;
  processed_at: string | null;
  closed_at: string | null;
  pay_sheet_template_id: string | null;
  sheet_template_snapshot_json: unknown;
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

function memberCeoToken() {
  return `Bearer ${signServiceJwt({
    sub: 'du-lich.ceo@xe.vn',
    tenantId: 'xe-du-lich',
    companyId: 'main',
    roleCode: 'subsidiary_ceo',
  })}`;
}

function baseHeader(overrides: Partial<HeaderRow> = {}): HeaderRow {
  return {
    id: TPL_ID,
    company_id: 'holding',
    code: 'bang_luong_chuan',
    name: 'Bảng lương chuẩn',
    description: null,
    status: 'active',
    is_default: true,
    applicability_scope: 'company',
    ou_id: null,
    position_key: null,
    employee_id: null,
    archived_at: null,
    created_by: 'ceo@xe.vn',
    updated_by: 'ceo@xe.vn',
    created_at: '2026-08-07T00:00:00Z',
    updated_at: '2026-08-07T00:00:00Z',
    ...overrides,
  };
}

function baseLine(overrides: Partial<LineRow> = {}): LineRow {
  return {
    id: LINE_ID,
    template_id: TPL_ID,
    company_id: 'holding',
    component_id: COMP_ID,
    component_code: 'BASIC',
    display_label: 'Lương cơ bản',
    sort_order: 10,
    group_key: null,
    is_visible: true,
    is_identity_or_total: false,
    formula_override_definition_id: null,
    formula_override_json: null,
    archived_at: null,
    created_at: '2026-08-07T00:00:00Z',
    updated_at: '2026-08-07T00:00:00Z',
    ...overrides,
  };
}

function createStatefulDb(opts?: {
  headers?: HeaderRow[];
  lines?: LineRow[];
  periods?: PeriodRow[];
  components?: Array<{ id: string; company_id: string; code: string }>;
  formulas?: Array<{
    id: string;
    company_id: string;
    archived_at: string | null;
  }>;
}) {
  const headers: HeaderRow[] = (opts?.headers ?? []).map((r) => ({ ...r }));
  const lines: LineRow[] = (opts?.lines ?? []).map((r) => ({ ...r }));
  const periods: PeriodRow[] = (opts?.periods ?? []).map((r) => ({ ...r }));
  const components = opts?.components ?? [
    { id: COMP_ID, company_id: 'holding', code: 'BASIC' },
    { id: COMP_ID_2, company_id: 'holding', code: 'OT' },
  ];
  const formulas = opts?.formulas ?? [
    { id: FORMULA_ID, company_id: 'holding', archived_at: null },
  ];
  const sqls: string[] = [];

  const db = {
    query: jest
      .fn()
      .mockImplementation(async (sql: string, params?: unknown[]) => {
        const s = String(sql).replace(/\s+/g, ' ');
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

        if (s.includes('INSERT INTO public.pay_sheet_templates')) {
          const row = baseHeader({
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
            created_by: (params?.[11] as string | null) ?? null,
            updated_by: (params?.[11] as string | null) ?? null,
          });
          if (
            headers.some(
              (h) =>
                h.company_id === row.company_id &&
                h.code === row.code &&
                !h.archived_at,
            )
          ) {
            throw new Error('uq_pay_sheet_templates_company_code_active');
          }
          headers.push(row);
          return { rows: [{ ...row }] };
        }

        if (
          s.includes(
            'UPDATE public.pay_sheet_templates SET is_default = FALSE',
          ) &&
          s.includes('archived_at IS NULL') &&
          !s.includes('id <>')
        ) {
          const companyId = String(params?.[0]);
          for (const h of headers) {
            if (h.company_id === companyId && !h.archived_at)
              h.is_default = false;
          }
          return { rows: [] };
        }

        if (
          s.includes(
            'UPDATE public.pay_sheet_templates SET is_default = FALSE',
          ) &&
          s.includes('id <>')
        ) {
          const companyId = String(params?.[0]);
          const keepId = String(params?.[1]);
          for (const h of headers) {
            if (
              h.company_id === companyId &&
              h.id !== keepId &&
              !h.archived_at
            ) {
              h.is_default = false;
            }
          }
          return { rows: [] };
        }

        if (
          s.includes('UPDATE public.pay_sheet_templates') &&
          s.includes('RETURNING')
        ) {
          // Archive: SET archived_at / updated_by $2 WHERE id = $1
          // Patch: WHERE id = $N last param
          const id =
            s.includes('archived_at = NOW()') &&
            s.includes("status = 'retired'")
              ? String(params?.[0])
              : String(params?.[params.length - 1]);
          const row = headers.find((h) => h.id === id);
          if (!row) return { rows: [] };
          if (
            s.includes("status = 'retired'") &&
            s.includes('archived_at = NOW()')
          ) {
            row.archived_at = '2026-08-07T12:00:00Z';
            row.status = 'retired';
          }
          return { rows: [{ ...row }] };
        }

        if (
          s.includes('FROM public.pay_sheet_templates') &&
          s.includes('id = $1::uuid') &&
          !s.includes('INSERT') &&
          !s.includes('UPDATE')
        ) {
          const id = String(params?.[0]);
          const row = headers.find((h) => h.id === id);
          if (!row) return { rows: [] };
          if (
            s.includes('t.company_id = ANY') ||
            s.includes('company_id = ANY')
          ) {
            const ids = (params?.[1] as string[]) ?? (params?.[0] as string[]);
            if (!ids.includes(row.company_id)) return { rows: [] };
          } else if (
            s.includes('t.company_id = $2') ||
            s.includes('company_id = $2')
          ) {
            if (row.company_id !== String(params?.[1])) return { rows: [] };
          }
          return { rows: [{ ...row }] };
        }

        if (
          s.includes('FROM public.pay_sheet_templates') &&
          (s.includes('ORDER BY is_default') ||
            s.includes('ORDER BY t.is_default'))
        ) {
          let rows = headers.filter(
            (h) => !h.archived_at || s.includes('include'),
          );
          if (
            s.includes('archived_at IS NULL') ||
            s.includes('t.archived_at IS NULL')
          ) {
            rows = headers.filter((h) => !h.archived_at);
          }
          if (
            s.includes('t.company_id = ANY') ||
            s.includes('company_id = ANY')
          ) {
            const ids = (params?.[0] as string[]) ?? (params?.[1] as string[]);
            rows = rows.filter((h) => ids.includes(h.company_id));
          } else if (
            params?.[0] != null &&
            (s.includes('t.company_id = $1') || s.includes('company_id = $1'))
          ) {
            rows = rows.filter((h) => h.company_id === String(params[0]));
          }
          if (
            s.includes("status = 'active'") ||
            s.includes("t.status = 'active'")
          ) {
            rows = rows.filter((h) => h.status === 'active');
          }
          return { rows: rows.map((r) => ({ ...r })) };
        }

        if (s.includes('FROM public.salary_components')) {
          if (s.includes('COUNT(*)')) {
            const ids = (params?.[0] as string[]) ?? [];
            const n = components.filter(
              (c) =>
                ids.includes(c.company_id) &&
                (c as { is_active?: boolean }).is_active !== false &&
                !(c as { archived_at?: string | null }).archived_at,
            ).length;
            return { rows: [{ c: String(n) }] };
          }
          const id = String(params?.[0]);
          const row = components.find((c) => c.id === id);
          if (!row) return { rows: [] };
          if (s.includes('company_id = ANY')) {
            const ids = params?.[1] as string[];
            if (!ids.includes(row.company_id)) return { rows: [] };
          } else if (params?.[1] != null) {
            if (row.company_id !== String(params[1])) return { rows: [] };
          }
          return {
            rows: [
              {
                id: row.id,
                code: row.code,
                company_id: row.company_id,
                is_active: (row as { is_active?: boolean }).is_active !== false,
              },
            ],
          };
        }

        if (s.includes('FROM public.pay_formula_definitions')) {
          const id = String(params?.[0]);
          const row = formulas.find((f) => f.id === id && !f.archived_at);
          if (!row) return { rows: [] };
          if (s.includes('company_id = ANY')) {
            const ids = params?.[1] as string[];
            if (!ids.includes(row.company_id)) return { rows: [] };
          }
          return { rows: [{ id: row.id }] };
        }

        if (
          s.includes('UPDATE public.pay_sheet_template_lines') &&
          s.includes('archived_at = NOW()') &&
          s.includes('NOT (component_id = ANY')
        ) {
          const templateId = String(params?.[0]);
          const keep = (params?.[1] as string[]) ?? [];
          for (const l of lines) {
            if (
              l.template_id === templateId &&
              !l.archived_at &&
              !keep.includes(l.component_id)
            ) {
              l.archived_at = '2026-08-07T12:00:00Z';
            }
          }
          return { rows: [] };
        }

        if (
          s.includes('UPDATE public.pay_sheet_template_lines') &&
          s.includes('archived_at = NOW()') &&
          s.includes('archived_at IS NULL') &&
          !s.includes('component_id = ANY') &&
          !s.includes('id = $1')
        ) {
          const templateId = String(params?.[0]);
          for (const l of lines) {
            if (l.template_id === templateId && !l.archived_at) {
              l.archived_at = '2026-08-07T12:00:00Z';
            }
          }
          return { rows: [] };
        }

        if (
          s.includes('SELECT id FROM public.pay_sheet_template_lines') &&
          s.includes('component_id = $2')
        ) {
          const templateId = String(params?.[0]);
          const componentId = String(params?.[1]);
          const row = lines.find(
            (l) =>
              l.template_id === templateId && l.component_id === componentId,
          );
          return { rows: row ? [{ id: row.id }] : [] };
        }

        if (s.includes('INSERT INTO public.pay_sheet_template_lines')) {
          const row = baseLine({
            id: String(params?.[0]),
            template_id: String(params?.[1]),
            company_id: String(params?.[2]),
            component_id: String(params?.[3]),
            component_code: String(params?.[4]),
            display_label: (params?.[5] as string | null) ?? null,
            sort_order: Number(params?.[6] ?? 0),
            group_key: (params?.[7] as string | null) ?? null,
            is_visible: params?.[8] !== false,
            is_identity_or_total: Boolean(params?.[9]),
            formula_override_definition_id:
              (params?.[10] as string | null) ?? null,
            formula_override_json: params?.[11]
              ? JSON.parse(String(params[11]))
              : null,
          });
          lines.push(row);
          return { rows: [{ ...row }] };
        }

        if (
          s.includes('UPDATE public.pay_sheet_template_lines') &&
          s.includes('component_code = $2')
        ) {
          const id = String(params?.[0]);
          const row = lines.find((l) => l.id === id);
          if (!row) return { rows: [] };
          row.component_code = String(params?.[1]);
          row.display_label = (params?.[2] as string | null) ?? null;
          row.sort_order = Number(params?.[3]);
          row.group_key = (params?.[4] as string | null) ?? null;
          row.is_visible = params?.[5] !== false;
          row.is_identity_or_total = Boolean(params?.[6]);
          row.formula_override_definition_id =
            (params?.[7] as string | null) ?? null;
          row.formula_override_json = params?.[8]
            ? JSON.parse(String(params[8]))
            : null;
          row.archived_at = null;
          return { rows: [{ ...row }] };
        }

        if (
          s.includes('FROM public.pay_sheet_template_lines') &&
          s.includes('template_id = $1')
        ) {
          const templateId = String(params?.[0]);
          let rows = lines.filter((l) => l.template_id === templateId);
          if (s.includes('archived_at IS NULL')) {
            rows = rows.filter((l) => !l.archived_at);
          }
          return { rows: rows.map((r) => ({ ...r })) };
        }

        if (
          s.includes('UPDATE public.pay_sheet_template_lines') &&
          s.includes('id = $1::uuid') &&
          s.includes('template_id = $2::uuid')
        ) {
          const lineId = String(params?.[0]);
          const templateId = String(params?.[1]);
          const row = lines.find(
            (l) =>
              l.id === lineId && l.template_id === templateId && !l.archived_at,
          );
          if (!row) return { rows: [] };
          row.archived_at = '2026-08-07T12:00:00Z';
          return { rows: [{ ...row }] };
        }

        if (
          s.includes('FROM public.payroll_periods') &&
          s.includes('id = $1::uuid')
        ) {
          const id = String(params?.[0]);
          const row = periods.find((p) => p.id === id);
          if (!row) return { rows: [] };
          if (s.includes('company_id = ANY')) {
            const ids = params?.[1] as string[];
            if (!ids.includes(row.company_id)) return { rows: [] };
          }
          return { rows: [{ ...row }] };
        }

        if (
          s.includes('UPDATE public.payroll_periods') &&
          s.includes('pay_sheet_template_id')
        ) {
          const id = String(params?.[0]);
          const row = periods.find((p) => p.id === id);
          if (!row) return { rows: [] };
          row.pay_sheet_template_id = String(params?.[1]);
          row.sheet_template_snapshot_json = params?.[2]
            ? JSON.parse(String(params[2]))
            : null;
          return { rows: [{ ...row }] };
        }

        return { rows: [] };
      }),
  } as unknown as HrmDbService;

  return { db, sqls, headers, lines, periods };
}

describe('PaySheetTemplateService (PO-HRM-AMIS-PARITY-PAY-TPL-BE-01)', () => {
  it('ensureSchema ADD pay_sheet_templates/_lines + period snapshot cols; FORBIDDEN closed code enum', async () => {
    const { db, sqls } = createStatefulDb();
    const svc = new PaySheetTemplateService(db);
    await svc.ensureSchema();
    expect(
      sqls.some((q) =>
        q.includes('CREATE TABLE IF NOT EXISTS public.pay_sheet_templates'),
      ),
    ).toBe(true);
    expect(
      sqls.some((q) =>
        q.includes(
          'CREATE TABLE IF NOT EXISTS public.pay_sheet_template_lines',
        ),
      ),
    ).toBe(true);
    expect(
      sqls.some((q) =>
        q.includes('uq_pay_sheet_templates_company_code_active'),
      ),
    ).toBe(true);
    expect(sqls.some((q) => q.includes('pay_sheet_template_id'))).toBe(true);
    expect(sqls.some((q) => q.includes('sheet_template_snapshot_json'))).toBe(
      true,
    );
    expect(sqls.some((q) => /CHECK\s*\(\s*code\s+IN/i.test(q))).toBe(false);
  });

  it('scope_parity: group CEO main list finds holding template; get-by-id same predicate', async () => {
    const { db } = createStatefulDb({
      headers: [baseHeader({ company_id: 'holding' })],
    });
    const svc = new PaySheetTemplateService(db);
    const auth = groupCeoToken();
    const listed = await svc.listTemplates({ company_id: 'main' }, auth);
    expect(listed.items).toHaveLength(1);
    expect(listed.items[0].id).toBe(TPL_ID);
    const got = await svc.getTemplateById(TPL_ID, 'main', auth);
    expect(got.id).toBe(TPL_ID);
    expect(got.companyId).toBe('holding');
  });

  it('scope_parity: member CEO cannot get holding template', async () => {
    const { db } = createStatefulDb({
      headers: [baseHeader({ company_id: 'holding' })],
    });
    const svc = new PaySheetTemplateService(db);
    await expect(
      svc.getTemplateById(TPL_ID, 'main', memberCeoToken()),
    ).rejects.toBeInstanceOf(ApiException);
  });

  it('VAL-PAY-TPL-02 duplicate active code → HRM-PAY-TPL-409-CODE', async () => {
    const { db } = createStatefulDb({
      headers: [baseHeader({ code: 'bang_luong_chuan' })],
    });
    const svc = new PaySheetTemplateService(db);
    await expect(
      svc.createTemplate(
        {
          company_id: 'main',
          code: 'bang_luong_chuan',
          name: 'Dup',
        },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: HRM_PAY_TPL_409_CODE });
  });

  it('VAL-PAY-TPL-04 duplicate component lines → HRM-PAY-TPL-409-LINE', async () => {
    const { db } = createStatefulDb({ headers: [baseHeader()] });
    const svc = new PaySheetTemplateService(db);
    await expect(
      svc.replaceLines(
        TPL_ID,
        {
          company_id: 'main',
          lines: [
            { componentId: COMP_ID, sortOrder: 1 },
            { componentId: COMP_ID, sortOrder: 2 },
          ],
        },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: HRM_PAY_TPL_409_LINE });
  });

  it('VAL-PAY-TPL-03 / VAL-PAY-CNS-01 unknown component → HRM-SC-COMP-KEY', async () => {
    const { db } = createStatefulDb({ headers: [baseHeader()] });
    const svc = new PaySheetTemplateService(db);
    await expect(
      svc.replaceLines(
        TPL_ID,
        {
          company_id: 'main',
          lines: [
            {
              componentId: '00000000-0000-4000-8000-000000000099',
              sortOrder: 1,
            },
          ],
        },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: 'HRM-SC-COMP-KEY' });
  });

  it('replace lines OV-C definition_id + archive removed lines (soft-delete)', async () => {
    const { db, lines } = createStatefulDb({
      headers: [baseHeader()],
      lines: [
        baseLine({
          component_id: COMP_ID_2,
          component_code: 'OT',
          sort_order: 5,
        }),
      ],
    });
    const svc = new PaySheetTemplateService(db);
    const result = await svc.replaceLines(
      TPL_ID,
      {
        company_id: 'main',
        lines: [
          {
            componentId: COMP_ID,
            sortOrder: 10,
            displayLabel: 'Lương CB',
            formulaOverrideDefinitionId: FORMULA_ID,
            formulaOverrideJson: { draft: true },
          },
        ],
      },
      groupCeoToken(),
    );
    expect(result.lines).toHaveLength(1);
    expect(result.lines[0].componentCode).toBe('BASIC');
    expect(result.lines[0].formulaOverrideDefinitionId).toBe(FORMULA_ID);
    expect(
      lines.find((l) => l.component_id === COMP_ID_2)?.archived_at,
    ).toBeTruthy();
  });

  it('ARCHIVE soft-delete hides from default list; FORBIDDEN hard DELETE SQL', async () => {
    const { db, sqls } = createStatefulDb({ headers: [baseHeader()] });
    const svc = new PaySheetTemplateService(db);
    const auth = groupCeoToken();
    await svc.archiveTemplate(TPL_ID, 'main', auth);
    const listed = await svc.listTemplates({ company_id: 'main' }, auth);
    expect(listed.items).toHaveLength(0);
    expect(
      sqls.some((q) => /DELETE\s+FROM\s+public\.pay_sheet_templates/i.test(q)),
    ).toBe(false);
  });

  it('bind snapshot; immutability after processed → HRM-PAY-TPL-409-IMMUTABLE', async () => {
    const { db } = createStatefulDb({
      headers: [baseHeader({ status: 'active' })],
      lines: [baseLine()],
      periods: [
        {
          id: PERIOD_ID,
          company_id: 'holding',
          period_label: '2026-08',
          start_date: '2026-08-01',
          end_date: '2026-08-31',
          status: 'processed',
          processed_at: '2026-08-07T01:00:00Z',
          closed_at: null,
          pay_sheet_template_id: null,
          sheet_template_snapshot_json: null,
          created_at: '2026-08-01T00:00:00Z',
          updated_at: '2026-08-07T01:00:00Z',
        },
      ],
    });
    const svc = new PaySheetTemplateService(db);
    await expect(
      svc.bindToPeriod(
        PERIOD_ID,
        { company_id: 'main', paySheetTemplateId: TPL_ID },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: HRM_PAY_TPL_409_IMMUTABLE });
  });

  it('bind rejects draft/archived template → HRM-PAY-TPL-412-TEMPLATE', async () => {
    const { db } = createStatefulDb({
      headers: [baseHeader({ status: 'draft' })],
      periods: [
        {
          id: PERIOD_ID,
          company_id: 'holding',
          period_label: '2026-08',
          start_date: '2026-08-01',
          end_date: '2026-08-31',
          status: 'draft',
          processed_at: null,
          closed_at: null,
          pay_sheet_template_id: null,
          sheet_template_snapshot_json: null,
          created_at: '2026-08-01T00:00:00Z',
          updated_at: '2026-08-01T00:00:00Z',
        },
      ],
    });
    const svc = new PaySheetTemplateService(db);
    await expect(
      svc.bindToPeriod(
        PERIOD_ID,
        { company_id: 'main', paySheetTemplateId: TPL_ID },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: HRM_PAY_TPL_412_TEMPLATE });
  });

  it('bind draft period snapshots columns from active mẫu', async () => {
    const { db, periods } = createStatefulDb({
      headers: [baseHeader({ status: 'active' })],
      lines: [baseLine({ formula_override_definition_id: FORMULA_ID })],
      periods: [
        {
          id: PERIOD_ID,
          company_id: 'holding',
          period_label: '2026-08',
          start_date: '2026-08-01',
          end_date: '2026-08-31',
          status: 'draft',
          processed_at: null,
          closed_at: null,
          pay_sheet_template_id: null,
          sheet_template_snapshot_json: null,
          created_at: '2026-08-01T00:00:00Z',
          updated_at: '2026-08-01T00:00:00Z',
        },
      ],
    });
    const svc = new PaySheetTemplateService(db);
    const bound = await svc.bindToPeriod(
      PERIOD_ID,
      { company_id: 'main', paySheetTemplateId: TPL_ID },
      groupCeoToken(),
    );
    expect(bound.pay_sheet_template_id).toBe(TPL_ID);
    expect(periods[0].sheet_template_snapshot_json).toMatchObject({
      template_id: TPL_ID,
      columns: [
        expect.objectContaining({
          component_code: 'BASIC',
          override_applied: true,
          formula_definition_id: FORMULA_ID,
        }),
      ],
    });
  });

  it('patch archived header → 404', async () => {
    const { db } = createStatefulDb({
      headers: [baseHeader({ archived_at: '2026-08-07T00:00:00Z' })],
    });
    const svc = new PaySheetTemplateService(db);
    await expect(
      svc.updateTemplate(
        TPL_ID,
        { company_id: 'main', name: 'X' },
        groupCeoToken(),
      ),
    ).rejects.toMatchObject({ code: HRM_PAY_TPL_404 });
  });
});
