#!/usr/bin/env node
/**
 * Seed cấu hình lương VP Hà Nội 05/2026 — tenant xevn, company main.
 *
 * - pay_types (catalog)
 * - salary_components (22 mã TP)
 * - pay_formula_definitions (formula_vp_hanoi — active)
 * - pay_payroll_group (pg_vp_hanoi)
 * - pay_sheet_templates + lines (cột như Excel)
 * - employee_compensation_packages (P1/P2/P3)
 * - payroll_periods 05/2026 + bind bảng công + snapshot mẫu
 * - pay_period_input_lines (input kỳ từ Excel — trừ LUONG_THEO_CONG tính công thức)
 *
 * Usage:
 *   node scripts/seed-vp-hanoi-payroll-config.mjs
 *
 * Prerequisite:
 *   node scripts/seed-vp-hanoi-workforce-and-attendance.mjs
 */
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadDeployEnv } from './seed-env-loader.mjs';
import { createHrmClient } from './lib/uat-db.mjs';
import { stableUuid } from './lib/stable-uuid.mjs';
import {
  VP_HANOI_SEED_TAG,
  VP_HANOI_TENANT_ID,
  VP_HANOI_COMPANY_ID,
  VP_HANOI_PERIOD_START,
  VP_HANOI_PERIOD_END,
} from './lib/vp-hanoi-seed-constants.mjs';
import {
  VP_PAY_TYPES,
  VP_SALARY_COMPONENTS,
  VP_SHEET_COLUMN_ORDER,
  amountForComponentFromPayrollRow,
  shouldSeedPeriodInput,
  normalizeSocialInsuranceDeduction,
  buildGd1EvalExpressionJson,
  buildPayrollAggregateFormulaExpression,
} from './lib/vp-hanoi-payroll-config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, '..');
const REPORT_DIR = resolve(REPO, 'scripts/seed-reports/payroll-vp-hanoi-2026-05');

const FORMULA_CODE = 'formula_vp_hanoi';
const FORMULA_COL_TONG_THU_NHAP_CODE = 'formula_col_tong_thu_nhap';
const FORMULA_COL_THUC_LINH_CODE = 'formula_col_thuc_linh';
const GROUP_CODE = 'pg_vp_hanoi';
const TEMPLATE_CODE = 'tpl_vp_hanoi_2026_05';

const IDS = {
  formula: stableUuid(`${VP_HANOI_SEED_TAG}:pay-formula:${FORMULA_CODE}`),
  formulaTongThuNhap: stableUuid(
    `${VP_HANOI_SEED_TAG}:pay-formula:${FORMULA_COL_TONG_THU_NHAP_CODE}`,
  ),
  formulaThucLinh: stableUuid(
    `${VP_HANOI_SEED_TAG}:pay-formula:${FORMULA_COL_THUC_LINH_CODE}`,
  ),
  group: stableUuid(`${VP_HANOI_SEED_TAG}:pay-group:${GROUP_CODE}`),
  template: stableUuid(`${VP_HANOI_SEED_TAG}:pay-sheet-tpl:${TEMPLATE_CODE}`),
  period: stableUuid(`${VP_HANOI_SEED_TAG}:payroll-period:2026-05`),
  sheet: stableUuid(`${VP_HANOI_SEED_TAG}:attendance-sheet:2026-05`),
  timesheetBind: stableUuid(`${VP_HANOI_SEED_TAG}:period-timesheet-bind:2026-05`),
};

function loadJson(name) {
  return JSON.parse(readFileSync(resolve(REPORT_DIR, name), 'utf8'));
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

async function ensureSchemas(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.hrm_catalog_extension_items (
      id BIGSERIAL PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      company_id TEXT NOT NULL,
      catalog_key TEXT NOT NULL,
      code TEXT NOT NULL,
      label TEXT NOT NULL,
      unit TEXT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_hrm_catalog_ext_tenant_company_key_code
    ON public.hrm_catalog_extension_items (tenant_id, company_id, catalog_key, code);
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.hrm_seed_runs (
      seed_tag TEXT PRIMARY KEY,
      ran_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb
    );
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.hrm_seed_metadata (
      seed_tag TEXT NOT NULL,
      entity_table TEXT NOT NULL,
      entity_id UUID NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (seed_tag, entity_table, entity_id)
    );
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.salary_components (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id TEXT NOT NULL,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      component_type TEXT NOT NULL,
      nature TEXT NOT NULL DEFAULT 'income',
      value_type TEXT NOT NULL DEFAULT 'currency',
      is_taxable BOOLEAN NOT NULL DEFAULT FALSE,
      is_insurance_base BOOLEAN NOT NULL DEFAULT FALSE,
      include_in_gross BOOLEAN NOT NULL DEFAULT TRUE,
      formula TEXT,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      sort_order INTEGER NOT NULL DEFAULT 0,
      archived_at TIMESTAMPTZ NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_salary_components_company_code
    ON public.salary_components (company_id, lower(code))
    WHERE archived_at IS NULL;
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.pay_formula_definitions (
      id UUID PRIMARY KEY,
      company_id TEXT NOT NULL,
      code TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'draft',
      expression_json JSONB NULL,
      required_vars_json JSONB NULL,
      meta_json JSONB NULL,
      published_by TEXT NULL,
      published_at TIMESTAMPTZ NULL,
      archived_at TIMESTAMPTZ NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.pay_payroll_group (
      id UUID PRIMARY KEY,
      company_id TEXT NOT NULL,
      code TEXT NOT NULL,
      name_vi TEXT NOT NULL,
      priority INT NOT NULL DEFAULT 0,
      match_rule_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      formula_definition_id UUID NULL,
      status TEXT NOT NULL DEFAULT 'active',
      archived_at TIMESTAMPTZ NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.pay_sheet_templates (
      id UUID PRIMARY KEY,
      company_id TEXT NOT NULL,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      is_default BOOLEAN NOT NULL DEFAULT FALSE,
      applicability_scope TEXT NOT NULL DEFAULT 'company',
      archived_at TIMESTAMPTZ NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.pay_sheet_template_lines (
      id UUID PRIMARY KEY,
      template_id UUID NOT NULL,
      company_id TEXT NOT NULL,
      component_id UUID NOT NULL,
      component_code TEXT NOT NULL,
      display_label TEXT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_visible BOOLEAN NOT NULL DEFAULT TRUE,
      archived_at TIMESTAMPTZ NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.payroll_periods (
      id UUID PRIMARY KEY,
      company_id TEXT NOT NULL,
      period_label TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(`
    ALTER TABLE public.payroll_periods
      ADD COLUMN IF NOT EXISTS payroll_group_id UUID NULL,
      ADD COLUMN IF NOT EXISTS formula_definition_id UUID NULL,
      ADD COLUMN IF NOT EXISTS pay_sheet_template_id UUID NULL,
      ADD COLUMN IF NOT EXISTS sheet_template_snapshot_json JSONB NULL,
      ADD COLUMN IF NOT EXISTS tenant_id TEXT NULL;
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.pay_period_timesheet_bind (
      id UUID PRIMARY KEY,
      company_id TEXT NOT NULL,
      payroll_period_id UUID NOT NULL,
      timesheet_header_id UUID NOT NULL,
      transfer_kind TEXT NOT NULL DEFAULT 'closed_transfer',
      bound_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      archived_at TIMESTAMPTZ NULL
    );
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.pay_period_input_lines (
      id UUID PRIMARY KEY,
      company_id TEXT NOT NULL,
      period_id UUID NOT NULL,
      employee_id UUID NOT NULL,
      component_code TEXT NOT NULL,
      amount NUMERIC(18,2) NOT NULL DEFAULT 0,
      source_kind TEXT NOT NULL DEFAULT 'manual',
      archived_at TIMESTAMPTZ NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.employee_compensation_packages (
      id UUID PRIMARY KEY,
      company_id TEXT NOT NULL,
      employee_id UUID NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      effective_from DATE NOT NULL,
      effective_to DATE NULL,
      currency TEXT NOT NULL DEFAULT 'VND',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.employee_compensation_lines (
      id UUID PRIMARY KEY,
      package_id UUID NOT NULL,
      line_type TEXT NOT NULL,
      amount NUMERIC(18, 2) NOT NULL,
      currency TEXT NOT NULL DEFAULT 'VND',
      allowance_code TEXT NULL,
      component_code TEXT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function trackMeta(client, table, id) {
  await client.query(
    `INSERT INTO public.hrm_seed_metadata (seed_tag, entity_table, entity_id)
     VALUES ($1, $2, $3::uuid)
     ON CONFLICT DO NOTHING`,
    [VP_HANOI_SEED_TAG, table, id],
  );
}

async function seedPayTypes(client) {
  let count = 0;
  for (const row of VP_PAY_TYPES) {
    await client.query(
      `INSERT INTO public.hrm_catalog_extension_items
         (tenant_id, company_id, catalog_key, code, label, status)
       VALUES ($1, $2, 'pay_types', $3, $4, 'active')
       ON CONFLICT (tenant_id, company_id, catalog_key, code)
       DO UPDATE SET label = EXCLUDED.label, status = 'active'`,
      [VP_HANOI_TENANT_ID, VP_HANOI_COMPANY_ID, row.code, row.label],
    );
    count++;
  }
  return count;
}

async function seedSalaryComponents(client) {
  const componentIds = new Map();
  for (const row of VP_SALARY_COMPONENTS) {
    const stableId = stableUuid(`${VP_HANOI_SEED_TAG}:salary-component:${row.code}`);
    const existing = await client.query(
      `SELECT id::text AS id FROM public.salary_components
       WHERE company_id = $1 AND lower(code) = lower($2) AND archived_at IS NULL
       LIMIT 1`,
      [VP_HANOI_COMPANY_ID, row.code],
    );
    const id = existing.rows[0]?.id ?? stableId;
    await client.query(
      `INSERT INTO public.salary_components (
         id, company_id, code, name, component_type, nature,
         is_taxable, is_insurance_base, include_in_gross, formula, sort_order, is_active, updated_at
       ) VALUES (
         $1::uuid, $2, $3, $4, $5, $6,
         $7, $8, $9, $10, $11, TRUE, NOW()
       )
       ON CONFLICT (id) DO UPDATE SET
         code = EXCLUDED.code,
         name = EXCLUDED.name,
         component_type = EXCLUDED.component_type,
         nature = EXCLUDED.nature,
         is_taxable = EXCLUDED.is_taxable,
         is_insurance_base = EXCLUDED.is_insurance_base,
         include_in_gross = EXCLUDED.include_in_gross,
         formula = EXCLUDED.formula,
         sort_order = EXCLUDED.sort_order,
         is_active = TRUE,
         archived_at = NULL,
         updated_at = NOW()`,
      [
        id,
        VP_HANOI_COMPANY_ID,
        row.code,
        row.name,
        row.component_type,
        row.nature,
        row.is_taxable,
        row.is_insurance_base,
        row.include_in_gross !== false,
        row.formula,
        row.sort_order,
      ],
    );
    componentIds.set(row.code, id);
    await trackMeta(client, 'salary_components', id);
  }
  return componentIds;
}

async function seedFormula(client) {
  const expressionJson = buildGd1EvalExpressionJson();
  const requiredVars = {
    keys: [
      'base_salary',
      'payable_hours',
      'standard_hours',
      'allowance_kpi',
      'performance_bonus_p4',
      'ot_150_hours',
      'ot_200_hours',
      'paid_leave_hours',
      'revenue_salary',
      'online_pay',
      'holiday_pay',
      'other_salary',
      'fuel_allowance',
      'social_insurance',
      'union_fee',
      'discipline',
      'salary_advance_1',
      'pit',
      'recovery',
    ],
  };
  const meta = {
    description_vi:
      'Công thức VP Hà Nội 05/2026 — Tổng thu nhập = 12 cột thu nhập thực (không cộng Lương CB P1+P2 tham chiếu)',
    gross_summary_vi:
      'LUONG_THEO_CONG + LUONG_KPI + THUONG_P4 + OT + nghỉ phép/lễ + doanh số + online + khác + PC xăng + truy lĩnh',
    seed_tag: VP_HANOI_SEED_TAG,
  };
  await client.query(
    `INSERT INTO public.pay_formula_definitions (
       id, company_id, code, version, status,
       expression_json, required_vars_json, meta_json,
       published_by, published_at, updated_at
     ) VALUES (
       $1::uuid, $2, $3, 1, 'active',
       $4::jsonb, $5::jsonb, $6::jsonb,
       $7, NOW(), NOW()
     )
     ON CONFLICT (company_id, code, version)
     DO UPDATE SET
       status = 'active',
       expression_json = EXCLUDED.expression_json,
       required_vars_json = EXCLUDED.required_vars_json,
       meta_json = EXCLUDED.meta_json,
       published_by = EXCLUDED.published_by,
       published_at = COALESCE(pay_formula_definitions.published_at, NOW()),
       updated_at = NOW()`,
    [
      IDS.formula,
      VP_HANOI_COMPANY_ID,
      FORMULA_CODE,
      JSON.stringify(expressionJson),
      JSON.stringify(requiredVars),
      JSON.stringify(meta),
      VP_HANOI_SEED_TAG,
    ],
  );
  await trackMeta(client, 'pay_formula_definitions', IDS.formula);
}

async function seedTotalColumnFormulas(client) {
  const rows = [
    {
      id: IDS.formulaTongThuNhap,
      code: FORMULA_COL_TONG_THU_NHAP_CODE,
      expression: buildPayrollAggregateFormulaExpression('gross'),
      description: 'Cột Tổng thu nhập — tổng hợp thu nhập trên bảng lương',
    },
    {
      id: IDS.formulaThucLinh,
      code: FORMULA_COL_THUC_LINH_CODE,
      expression: buildPayrollAggregateFormulaExpression('net'),
      description: 'Cột Thực lĩnh — thực lĩnh sau khấu trừ',
    },
  ];
  for (const row of rows) {
    await client.query(
      `INSERT INTO public.pay_formula_definitions (
         id, company_id, code, version, status,
         expression_json, required_vars_json, meta_json,
         published_by, published_at, updated_at
       ) VALUES (
         $1::uuid, $2, $3, 1, 'active',
         $4::jsonb, $5::jsonb, $6::jsonb,
         $7, NOW(), NOW()
       )
       ON CONFLICT (company_id, code, version)
       DO UPDATE SET
         status = 'active',
         expression_json = EXCLUDED.expression_json,
         required_vars_json = EXCLUDED.required_vars_json,
         meta_json = EXCLUDED.meta_json,
         published_by = EXCLUDED.published_by,
         published_at = COALESCE(pay_formula_definitions.published_at, NOW()),
         updated_at = NOW()`,
      [
        row.id,
        VP_HANOI_COMPANY_ID,
        row.code,
        JSON.stringify(row.expression),
        JSON.stringify({ keys: [] }),
        JSON.stringify({
          description_vi: row.description,
          seed_tag: VP_HANOI_SEED_TAG,
        }),
        VP_HANOI_SEED_TAG,
      ],
    );
    await trackMeta(client, 'pay_formula_definitions', row.id);
  }
}

function buildSheetSnapshot(formulaId) {
  const totalFormulaByCode = {
    TONG_THU_NHAP: IDS.formulaTongThuNhap,
    THUC_LINH: IDS.formulaThucLinh,
  };
  const columns = VP_SHEET_COLUMN_ORDER.map((code, idx) => {
    const comp = VP_SALARY_COMPONENTS.find((c) => c.code === code);
    const totalFormulaId = totalFormulaByCode[code];
    const isTotalColumn = Boolean(totalFormulaId);
    return {
      component_code: code,
      display_label: comp?.name ?? code,
      sort_order: idx,
      formula_definition_id: isTotalColumn ? totalFormulaId : formulaId,
      override_applied: isTotalColumn,
      sign: comp?.nature === 'deduction' ? 'deduction' : 'earning',
    };
  });
  return {
    template_id: IDS.template,
    template_code: TEMPLATE_CODE,
    columns,
  };
}

async function seedPayrollGroup(client, employeeIds) {
  const matchRule = { employee_ids: employeeIds };
  await client.query(
    `INSERT INTO public.pay_payroll_group (
       id, company_id, code, name_vi, priority, match_rule_json,
       formula_definition_id, status, updated_at
     ) VALUES (
       $1::uuid, $2, $3, $4, 10, $5::jsonb,
       $6::uuid, 'active', NOW()
     )
     ON CONFLICT (id) DO UPDATE SET
       name_vi = EXCLUDED.name_vi,
       match_rule_json = EXCLUDED.match_rule_json,
       formula_definition_id = EXCLUDED.formula_definition_id,
       status = 'active',
       archived_at = NULL,
       updated_at = NOW()`,
    [
      IDS.group,
      VP_HANOI_COMPANY_ID,
      GROUP_CODE,
      'Văn phòng Hà Nội',
      JSON.stringify(matchRule),
      IDS.formula,
    ],
  );
  await trackMeta(client, 'pay_payroll_group', IDS.group);
}

async function seedSheetTemplate(client, componentIds) {
  await client.query(
    `INSERT INTO public.pay_sheet_templates (
       id, company_id, code, name, description, status, is_default, updated_at
     ) VALUES (
       $1::uuid, $2, $3, $4, $5, 'active', TRUE, NOW()
     )
     ON CONFLICT (id) DO UPDATE SET
       name = EXCLUDED.name,
       description = EXCLUDED.description,
       status = 'active',
       is_default = EXCLUDED.is_default,
       archived_at = NULL,
       updated_at = NOW()`,
    [
      IDS.template,
      VP_HANOI_COMPANY_ID,
      TEMPLATE_CODE,
      'Mẫu bảng lương VP Hà Nội 05/2026',
      'Cột theo Excel bảng lương văn phòng Hà Nội — seed_tag vp-hanoi-payroll-2026-05',
    ],
  );
  await trackMeta(client, 'pay_sheet_templates', IDS.template);

  for (let i = 0; i < VP_SHEET_COLUMN_ORDER.length; i++) {
    const code = VP_SHEET_COLUMN_ORDER[i];
    const componentId = componentIds.get(code);
    if (!componentId) continue;
    const lineId = stableUuid(`${VP_HANOI_SEED_TAG}:sheet-tpl-line:${code}`);
    const comp = VP_SALARY_COMPONENTS.find((c) => c.code === code);
    const isTotalColumn = code === 'TONG_THU_NHAP' || code === 'THUC_LINH';
    const formulaOverrideId =
      code === 'TONG_THU_NHAP'
        ? IDS.formulaTongThuNhap
        : code === 'THUC_LINH'
          ? IDS.formulaThucLinh
          : null;
    await client.query(
      `DELETE FROM public.pay_sheet_template_lines
       WHERE template_id = $1::uuid AND component_code = $2`,
      [IDS.template, code],
    );
    await client.query(
      `INSERT INTO public.pay_sheet_template_lines (
         id, template_id, company_id, component_id, component_code,
         display_label, sort_order, is_visible, is_identity_or_total,
         formula_override_definition_id, updated_at
       ) VALUES (
         $1::uuid, $2::uuid, $3, $4::uuid, $5,
         $6, $7, TRUE, $8,
         $9::uuid, NOW()
       )`,
      [
        lineId,
        IDS.template,
        VP_HANOI_COMPANY_ID,
        componentId,
        code,
        comp?.name ?? code,
        i,
        isTotalColumn,
        formulaOverrideId,
      ],
    );
    await trackMeta(client, 'pay_sheet_template_lines', lineId);
  }
}

async function loadVpEmployees(client) {
  const res = await client.query(
    `SELECT id, employee_code, full_name
     FROM public.employees
     WHERE custom_fields->>'seed_tag' = $1
       AND archived_at IS NULL
     ORDER BY employee_code`,
    [VP_HANOI_SEED_TAG],
  );
  return res.rows;
}

async function seedCompensation(client, payrollRows, employees) {
  const byCode = new Map(payrollRows.map((r) => [r.employee_code.toUpperCase(), r]));
  let packages = 0;
  for (const emp of employees) {
    const row = byCode.get(emp.employee_code.toUpperCase());
    if (!row?.income) continue;
    const pkgId = stableUuid(`${VP_HANOI_SEED_TAG}:comp-pkg:${emp.employee_code}`);
    await client.query(
      `DELETE FROM public.employee_compensation_lines
       WHERE package_id = $1::uuid`,
      [pkgId],
    );
    await client.query(
      `INSERT INTO public.employee_compensation_packages (
         id, company_id, employee_id, version, effective_from, currency, updated_at
       ) VALUES ($1::uuid, $2, $3::uuid, 1, $4::date, 'VND', NOW())
       ON CONFLICT (id) DO UPDATE SET updated_at = NOW()`,
      [pkgId, VP_HANOI_COMPANY_ID, emp.id, VP_HANOI_PERIOD_START],
    );
    const lines = [
      {
        line_type: 'base',
        amount: num(row.income.insurance_base_p1) || num(row.income.base_salary_p1_p2),
        allowance_code: null,
        component_code: 'base',
        sort_order: 1,
      },
      {
        line_type: 'allowance',
        amount: num(row.income.supplemental_income_p2),
        allowance_code: 'p2',
        component_code: 'allowance_p2',
        sort_order: 2,
      },
      {
        line_type: 'allowance',
        amount: num(row.income.kpi_salary_p3),
        allowance_code: 'kpi',
        component_code: 'allowance_kpi',
        sort_order: 3,
      },
    ];
    for (const line of lines) {
      if (line.amount <= 0 && line.line_type !== 'base') continue;
      const lineId = stableUuid(
        `${VP_HANOI_SEED_TAG}:comp-line:${emp.employee_code}:${line.sort_order}`,
      );
      await client.query(
        `INSERT INTO public.employee_compensation_lines (
           id, package_id, line_type, amount, allowance_code, component_code, sort_order
         ) VALUES ($1::uuid, $2::uuid, $3, $4, $5, $6, $7)`,
        [
          lineId,
          pkgId,
          line.line_type,
          line.amount,
          line.allowance_code,
          line.component_code,
          line.sort_order,
        ],
      );
    }
    packages++;
    await trackMeta(client, 'employee_compensation_packages', pkgId);
  }
  return packages;
}

async function backfillPayrollPeriodTenantId(client) {
  const res = await client.query(
    `UPDATE public.payroll_periods
     SET tenant_id = $1, updated_at = NOW()
     WHERE company_id = $2
       AND start_date = $3::date
       AND end_date = $4::date
       AND (tenant_id IS NULL OR TRIM(tenant_id) = '')
     RETURNING id`,
    [VP_HANOI_TENANT_ID, VP_HANOI_COMPANY_ID, VP_HANOI_PERIOD_START, VP_HANOI_PERIOD_END],
  );
  return res.rowCount ?? 0;
}

async function seedPayrollPeriod(client) {
  const snapshot = buildSheetSnapshot(IDS.formula);
  await client.query(
    `INSERT INTO public.payroll_periods (
       id, company_id, tenant_id, period_label, start_date, end_date, status,
       payroll_group_id, formula_definition_id, pay_sheet_template_id,
       sheet_template_snapshot_json, updated_at
     ) VALUES (
       $1::uuid, $2, $3, $4, $5::date, $6::date, 'draft',
       $7::uuid, $8::uuid, $9::uuid,
       $10::jsonb, NOW()
     )
     ON CONFLICT (company_id, start_date, end_date)
     DO UPDATE SET
       tenant_id = EXCLUDED.tenant_id,
       period_label = EXCLUDED.period_label,
       payroll_group_id = EXCLUDED.payroll_group_id,
       formula_definition_id = EXCLUDED.formula_definition_id,
       pay_sheet_template_id = EXCLUDED.pay_sheet_template_id,
       sheet_template_snapshot_json = EXCLUDED.sheet_template_snapshot_json,
       updated_at = NOW()`,
    [
      IDS.period,
      VP_HANOI_COMPANY_ID,
      VP_HANOI_TENANT_ID,
      'Kỳ lương VP Hà Nội 05/2026',
      VP_HANOI_PERIOD_START,
      VP_HANOI_PERIOD_END,
      IDS.group,
      IDS.formula,
      IDS.template,
      JSON.stringify(snapshot),
    ],
  );
  await trackMeta(client, 'payroll_periods', IDS.period);

  await client.query(
    `UPDATE public.pay_period_timesheet_bind SET archived_at = NOW()
     WHERE payroll_period_id = $1::uuid AND archived_at IS NULL`,
    [IDS.period],
  );
  await client.query(
    `INSERT INTO public.pay_period_timesheet_bind (
       id, company_id, payroll_period_id, timesheet_header_id, transfer_kind, bound_by
     ) VALUES ($1::uuid, $2, $3::uuid, $4::uuid, 'closed_transfer', $5)
     ON CONFLICT (id) DO UPDATE SET
       archived_at = NULL,
       timesheet_header_id = EXCLUDED.timesheet_header_id,
       transfer_kind = EXCLUDED.transfer_kind,
       bound_by = EXCLUDED.bound_by`,
    [IDS.timesheetBind, VP_HANOI_COMPANY_ID, IDS.period, IDS.sheet, VP_HANOI_SEED_TAG],
  );
  await trackMeta(client, 'pay_period_timesheet_bind', IDS.timesheetBind);
}

async function seedPeriodInputs(client, payrollRows, employees) {
  const byCode = new Map(payrollRows.map((r) => [r.employee_code.toUpperCase(), r]));
  let lines = 0;
  for (const emp of employees) {
    const row = byCode.get(emp.employee_code.toUpperCase());
    if (!row) continue;
    for (const code of VP_SHEET_COLUMN_ORDER) {
      const amount = amountForComponentFromPayrollRow(code, row);
      if (!shouldSeedPeriodInput(code, amount)) continue;
      const lineId = stableUuid(
        `${VP_HANOI_SEED_TAG}:period-input:${emp.employee_code}:${code}`,
      );
      await client.query(
        `DELETE FROM public.pay_period_input_lines
         WHERE period_id = $1::uuid AND employee_id = $2::uuid
           AND component_code = $3 AND source_kind = 'excel_seed'`,
        [IDS.period, emp.id, code],
      );
      await client.query(
        `INSERT INTO public.pay_period_input_lines (
           id, company_id, period_id, employee_id, component_code,
           amount, source_kind, note, updated_at
         ) VALUES (
           $1::uuid, $2, $3::uuid, $4::uuid, $5,
           $6, 'excel_seed', $7, NOW()
         )`,
        [
          lineId,
          VP_HANOI_COMPANY_ID,
          IDS.period,
          emp.id,
          code,
          amount,
          VP_HANOI_SEED_TAG,
        ],
      );
      lines++;
      await trackMeta(client, 'pay_period_input_lines', lineId);
    }
  }
  return lines;
}

async function main() {
  loadDeployEnv();
  const payrollRows = loadJson('01-employees-payroll.json');
  const client = createHrmClient();
  await client.connect();
  try {
    await client.query('BEGIN');
    await ensureSchemas(client);
    const payTypes = await seedPayTypes(client);
    const componentIds = await seedSalaryComponents(client);
    await seedFormula(client);
    await seedTotalColumnFormulas(client);
    const employees = await loadVpEmployees(client);
    if (employees.length === 0) {
      throw new Error(
        'Không tìm thấy NV seed_tag=vp-hanoi-payroll-2026-05 — chạy seed workforce trước.',
      );
    }
    await seedPayrollGroup(
      client,
      employees.map((e) => e.id),
    );
    await seedSheetTemplate(client, componentIds);
    const compPkgs = await seedCompensation(client, payrollRows, employees);
    await seedPayrollPeriod(client);
    const tenantBackfill = await backfillPayrollPeriodTenantId(client);
    const inputLines = await seedPeriodInputs(client, payrollRows, employees);

    await client.query(
      `INSERT INTO public.hrm_seed_runs (seed_tag, metadata)
       VALUES ($1, $2::jsonb)
       ON CONFLICT (seed_tag) DO UPDATE SET ran_at = NOW(), metadata = EXCLUDED.metadata`,
      [
        `${VP_HANOI_SEED_TAG}:payroll-config`,
        JSON.stringify({
          tenant_id: VP_HANOI_TENANT_ID,
          company_id: VP_HANOI_COMPANY_ID,
          pay_types: payTypes,
          salary_components: VP_SALARY_COMPONENTS.length,
          formula_code: FORMULA_CODE,
          formula_id: IDS.formula,
          group_code: GROUP_CODE,
          template_code: TEMPLATE_CODE,
          period_id: IDS.period,
          employees: employees.length,
          compensation_packages: compPkgs,
          period_input_lines: inputLines,
        }),
      ],
    );

    await client.query('COMMIT');
    console.log(JSON.stringify({
      ok: true,
      seed_tag: VP_HANOI_SEED_TAG,
      tenant_id: VP_HANOI_TENANT_ID,
      company_id: VP_HANOI_COMPANY_ID,
      pay_types: payTypes,
      salary_components: VP_SALARY_COMPONENTS.length,
      formula: { code: FORMULA_CODE, id: IDS.formula, status: 'active' },
      payroll_group: { code: GROUP_CODE, id: IDS.group, members: employees.length },
      sheet_template: { code: TEMPLATE_CODE, id: IDS.template, columns: VP_SHEET_COLUMN_ORDER.length },
          payroll_period: { id: IDS.period, label: '05/2026', status: 'draft' },
          tenant_id_backfill: tenantBackfill,
      attendance_sheet_bind: IDS.sheet,
      compensation_packages: compPkgs,
      period_input_lines: inputLines,
    }, null, 2));
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

const isMain =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export { main, IDS as VP_PAYROLL_CONFIG_IDS };
