/**
 * @CODE-MEMORY
 * Screen:     HRM → Process kỳ lương (SRC resolver)
 * UC:         FR-UC-BP-PAY-06 · AC-PAY-SRC-01..06 · AC-PAY-RUN-06
 * BR:         BR-AMIS-PAY-SRC-01..05 — Emp C&B > period input > template override > catalog default
 * SRS:        docs/qa/evidence/po-hrm-amis-parity-pay-depth-01.md §3
 * TechSpec:   docs/program/specs/PO-HRM-AMIS-PARITY-PAY-TPL-API-01.md §4 · §7
 * DB_DESIGN:  docs/qa/evidence/po-hrm-amis-parity-pay-data-01.md §4
 * Purpose:    Per-component SRC precedence on PROCESS — cấm Nest % fallback · cấm catalog TEXT engine.
 * WorkItem:   PO-HRM-AMIS-PARITY-PAY-SRC-BE-01
 * Coded:      2026-08-07
 * Callers:    PayFormulaService.processEmployeePayslipViaSrc · payroll.service processPayrollPeriod
 * Callees:    employee_compensation_* · pay_period_input_lines · pay_formula_definitions · snapshot JSON
 * must_keep:  ATT-412 closed sheet gate upstream · payroll_e2e_ready=false · OV-C published FK only on process
 * SOLID:      Pure precedence + I/O loaders tách khỏi Nest evaluate orchestration
 * LastVerified: pay-src-resolver.spec.ts
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-BE-01
 * change_mode: EXPAND
 * What: ensurePeriodInputSchema full DATA-01 cols; loadPeriodInputAmount returns id + tie-break source_kind; VAL-INP-SRC-03b throw corrupt row
 * must_keep: ATT-LINE-01 · payroll_e2e_ready=false · formula/TPL F.1 untouched
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-BE-SRC-02-01
 * change_mode: EXPAND
 * What: SRC-02 per-component fixed PC via component_code column + resolveEffectiveCompensationPackage
 *       source_ref emp_cb:package:{id}:line:{id} · CB_COMPONENT_UNMAPPED fall-through
 * Why:  BR-AMIS-PAY-SRC-02 · DATA-01 §4.3 · skip template/catalog when history line present
 * must_keep: expandCbReadCompanyIds order · ATT-412 upstream · payroll_e2e_ready=false
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-AMIS-PARITY-PAY-SRC-BE-02
 * change_mode: FIX
 * What: BASE↔LUONG_CO_BAN alias harden · asOfDate Y-M-D coerce · soft component_code backfill on load
 * Why:  D-PAY-SRC-01 QA FAIL — emp_cb missed on PROCESS despite active C&B
 * must_keep: ATT-412 upstream · payroll_e2e_ready=false · cấm silent 0
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-AMIS-PARITY-EMP-SALARY-HISTORY-BE-TIER-01
 * change_mode: FIX
 * What: resolvePayslipLineSourceTier — GET lines always resolve emp_cb|period_input|template_override|formula_default
 * Why:  R-PAY-SRC-TIER-FIELD — source_ref emp_cb:* present but source_tier absent on GET
 * must_keep: stored column wins · derive from source_ref prefix when NULL · payroll_e2e_ready=false
 */
import { expandPayrollAttendanceSheetCompanyIds } from '../common/hrm-list-scope';
import { toLeaveDayKey } from '../attendance/leave-attendance-funnel.service';
import { HrmDbService } from '../db/hrm-db.service';
import type { PayFormulaEvalSign } from './pay-formula-evaluator';
import { resolveEffectiveCompensationPackage } from './pay-formula-variable-bag';
import type { SheetTemplateSnapshotColumn } from './pay-sheet-template.service';

/** Audit tier on payslip line — BR-AMIS-PAY-SRC storage map (DATA §4). */
export type PaySrcTier =
  | 'emp_cb'
  | 'period_input'
  | 'template_override'
  | 'formula_default';

const PAY_SRC_TIERS: readonly PaySrcTier[] = [
  'emp_cb',
  'period_input',
  'template_override',
  'formula_default',
] as const;

/**
 * AC-PAY-SRC-GET-TIER / R-PAY-SRC-TIER-FIELD — expose source_tier on GET alongside source_ref.
 * Prefer DB column; when NULL/blank, derive from known source_ref prefixes written by PROCESS.
 */
export function resolvePayslipLineSourceTier(
  stored: string | null | undefined,
  sourceRef: string | null | undefined,
): PaySrcTier | null {
  const tier = String(stored ?? '')
    .trim()
    .toLowerCase();
  if ((PAY_SRC_TIERS as readonly string[]).includes(tier)) {
    return tier as PaySrcTier;
  }
  const ref = String(sourceRef ?? '')
    .trim()
    .toLowerCase();
  if (!ref) return null;
  if (ref === 'emp_cb' || ref.startsWith('emp_cb:')) return 'emp_cb';
  if (ref === 'period_input' || ref.startsWith('period_input:'))
    return 'period_input';
  if (ref === 'template_override' || ref.startsWith('template_override:'))
    return 'template_override';
  if (
    ref === 'formula_default' ||
    ref.startsWith('formula_default:') ||
    ref.startsWith('catalog:') ||
    ref.startsWith('expr:') ||
    ref.startsWith('var:') ||
    ref.startsWith('const:') ||
    ref === 'formula' ||
    ref.startsWith('formula:')
  ) {
    return 'formula_default';
  }
  return null;
}

export type PaySrcColumnDef = {
  component_code: string;
  display_label?: string | null;
  sort_order: number;
  formula_definition_id?: string | null;
  override_applied?: boolean;
  sign?: PayFormulaEvalSign;
};

export type PaySrcResolvedLine = {
  component_code: string;
  sign: PayFormulaEvalSign;
  amount: number;
  source_tier: PaySrcTier;
  source_ref: string;
  formula_definition_id: string | null;
  sort_order: number;
};

export type PaySrcSnapshotJson = {
  template_id?: string;
  template_code?: string;
  columns?: SheetTemplateSnapshotColumn[];
};

/** Canonical base-pay codes — template LUONG_CO_BAN ↔ C&B `base` / formula BASE. */
const BASE_COMPONENT_ALIASES = new Set([
  'base',
  'base_salary',
  'luong_co_ban',
  'luongcoban',
  'lcb',
  'luong_cb',
]);
const PROBATION_COMPONENT_ALIASES = new Set([
  'probation',
  'probation_salary',
  'thu_viec',
]);

export type EmpCbFixedAmount = {
  amount: number;
  source_ref: string;
  warnings: string[];
};

function normalizeComponentCode(code: string): string {
  return code
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_');
}

/** Coerce pg Date / ISO / yyyy-MM-dd → calendar day for C&B as-of (D-PAY-SRC-01). */
export function normalizePayrollAsOfDate(
  value: string | Date | null | undefined,
): string {
  const key = toLeaveDayKey(value);
  if (key) return key;
  return String(value ?? '')
    .trim()
    .slice(0, 10);
}

/** Map compensation line row → catalog component_code per DATA-01 §4.2. */
export function resolveLineComponentCode(row: {
  line_type: string;
  allowance_code: string | null;
  component_code?: string | null;
}): string | null {
  const explicit = row.component_code?.trim();
  if (explicit) return normalizeComponentCode(explicit);
  const lineType = String(row.line_type ?? '')
    .trim()
    .toLowerCase();
  if (lineType === 'allowance') {
    const code = row.allowance_code?.trim();
    return code ? normalizeComponentCode(code) : null;
  }
  if (lineType === 'base') return 'base';
  if (lineType === 'probation') return 'probation';
  return null;
}

/** True when template/formula code and C&B line code refer to the same pay component. */
export function componentCodesMatch(
  targetRaw: string,
  lineCodeRaw: string,
): boolean {
  const target = normalizeComponentCode(targetRaw);
  const lineCode = normalizeComponentCode(lineCodeRaw);
  if (target === lineCode) return true;
  if (
    BASE_COMPONENT_ALIASES.has(target) &&
    BASE_COMPONENT_ALIASES.has(lineCode)
  ) {
    return true;
  }
  if (BASE_COMPONENT_ALIASES.has(target) && lineCode === 'base') {
    return true;
  }
  if (BASE_COMPONENT_ALIASES.has(lineCode) && target === 'base') {
    return true;
  }
  if (
    PROBATION_COMPONENT_ALIASES.has(target) &&
    (lineCode === 'probation' || PROBATION_COMPONENT_ALIASES.has(lineCode))
  ) {
    return true;
  }
  return false;
}

/**
 * Soft ADD column + idempotent backfill so PROCESS SRC-02 works even when
 * compensation ensureSchema has not run on this process (live packages may lack mapping).
 */
export async function ensureCompensationComponentCodeForSrc(
  db: HrmDbService,
): Promise<void> {
  try {
    await db.query(`
      ALTER TABLE public.employee_compensation_lines
      ADD COLUMN IF NOT EXISTS component_code TEXT NULL;
    `);
    await db.query(`
      UPDATE public.employee_compensation_lines
      SET component_code = lower(trim(allowance_code))
      WHERE line_type = 'allowance'
        AND component_code IS NULL
        AND allowance_code IS NOT NULL
        AND trim(allowance_code) <> '';
    `);
    await db.query(`
      UPDATE public.employee_compensation_lines
      SET component_code = 'base'
      WHERE line_type = 'base'
        AND (component_code IS NULL OR trim(component_code) = '');
    `);
    await db.query(`
      UPDATE public.employee_compensation_lines
      SET component_code = 'probation'
      WHERE line_type = 'probation'
        AND (component_code IS NULL OR trim(component_code) = '');
    `);
  } catch {
    // Table may be absent on cold bootstrap — caller falls through honestly
  }
}

async function loadPackageLinesForSrc(
  db: HrmDbService,
  packageId: string,
): Promise<
  Array<{
    id: string;
    line_type: string;
    amount: string;
    allowance_code: string | null;
    component_code: string | null;
  }>
> {
  const lineRes = await db.query<{
    id: string;
    line_type: string;
    amount: string;
    allowance_code: string | null;
    component_code: string | null;
  }>(
    `
      SELECT
        id::text AS id,
        line_type,
        amount::text AS amount,
        allowance_code,
        component_code
      FROM public.employee_compensation_lines
      WHERE package_id = $1::uuid
      ORDER BY sort_order ASC, created_at ASC;
    `,
    [packageId],
  );
  return lineRes.rows;
}

function roundMoney(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Parse period sheet_template_snapshot_json → ordered column defs (AC-PAY-TPL-05 immutability). */
export function parsePeriodSnapshotColumns(
  snapshot: unknown,
): PaySrcColumnDef[] {
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
    return [];
  }
  const obj = snapshot as PaySrcSnapshotJson;
  const raw = Array.isArray(obj.columns) ? obj.columns : [];
  return raw
    .map((col, idx) => {
      const component_code = String(col?.component_code ?? '').trim();
      if (!component_code) return null;
      const def: PaySrcColumnDef = {
        component_code,
        display_label: col.display_label ?? null,
        sort_order: Number(col.sort_order ?? idx),
        formula_definition_id: col.formula_definition_id ?? null,
        override_applied: col.override_applied === true,
      };
      return def;
    })
    .filter((c): c is PaySrcColumnDef => c !== null)
    .sort((a, b) => a.sort_order - b.sort_order);
}

/** Aggregate gross/deduction/net from SRC-resolved lines. */
export function aggregateSrcPayslipTotals(lines: PaySrcResolvedLine[]): {
  gross: number;
  deduction: number;
  net: number;
} {
  let gross = 0;
  let deduction = 0;
  for (const line of lines) {
    if (line.sign === 'deduction') {
      deduction = roundMoney(deduction + line.amount);
    } else {
      gross = roundMoney(gross + line.amount);
    }
  }
  return { gross, deduction, net: roundMoney(gross - deduction) };
}

export async function probePeriodInputTable(
  db: HrmDbService,
): Promise<boolean> {
  try {
    const res = await db.query<{ exists: boolean }>(
      `
        SELECT EXISTS(
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'pay_period_input_lines'
        ) AS exists;
      `,
    );
    return Boolean(res.rows[0]?.exists);
  } catch {
    return false;
  }
}

/** ADD DDL — PO-HRM-AMIS-PARITY-PAY-INPUT-PACK-DATA-01 §3 */
export async function ensurePeriodInputSchema(db: HrmDbService): Promise<void> {
  await db.query(`
    CREATE TABLE IF NOT EXISTS public.pay_period_input_lines (
      id UUID PRIMARY KEY,
      company_id TEXT NOT NULL,
      period_id UUID NOT NULL,
      employee_id UUID NOT NULL,
      component_code TEXT NOT NULL,
      amount NUMERIC(18,2) NOT NULL DEFAULT 0,
      quantity NUMERIC(12,4) NULL,
      source_kind TEXT NOT NULL DEFAULT 'manual',
      source_ref TEXT NULL,
      effective_date DATE NULL,
      note TEXT NULL,
      created_by TEXT NULL,
      updated_by TEXT NULL,
      archived_at TIMESTAMPTZ NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await db.query(`
    ALTER TABLE public.pay_period_input_lines
      ADD COLUMN IF NOT EXISTS quantity NUMERIC(12,4) NULL;
  `);
  await db.query(`
    ALTER TABLE public.pay_period_input_lines
      ADD COLUMN IF NOT EXISTS source_ref TEXT NULL;
  `);
  await db.query(`
    ALTER TABLE public.pay_period_input_lines
      ADD COLUMN IF NOT EXISTS effective_date DATE NULL;
  `);
  await db.query(`
    ALTER TABLE public.pay_period_input_lines
      ADD COLUMN IF NOT EXISTS created_by TEXT NULL;
  `);
  await db.query(`
    ALTER TABLE public.pay_period_input_lines
      ADD COLUMN IF NOT EXISTS updated_by TEXT NULL;
  `);
  await db.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_pay_period_input_active
    ON public.pay_period_input_lines (period_id, employee_id, component_code, source_kind)
    WHERE archived_at IS NULL;
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS ix_pay_period_input_company_period
    ON public.pay_period_input_lines (company_id, period_id);
  `);
  await db.query(`
    CREATE INDEX IF NOT EXISTS ix_pay_period_input_employee_period
    ON public.pay_period_input_lines (employee_id, period_id);
  `);
}

/**
 * SRC-02: Employee C&B fixed amount for component_code (history wins).
 * Uses component_code column + allowance/base mapping; expandCbReadCompanyIds package order.
 * Aliases: BASE / LUONG_CO_BAN / base_salary ↔ C&B line_type=base.
 */
export async function loadEmployeeFixedAmountForComponent(
  db: HrmDbService,
  input: {
    companyId: string;
    employeeId: string;
    asOfDate: string | Date;
    componentCode: string;
  },
): Promise<EmpCbFixedAmount | null> {
  const target = normalizeComponentCode(input.componentCode);
  const asOfDate = normalizePayrollAsOfDate(input.asOfDate);
  const warnings: string[] = [];

  try {
    await ensureCompensationComponentCodeForSrc(db);
    const resolved = await resolveEffectiveCompensationPackage(db, {
      companyId: input.companyId,
      employeeId: input.employeeId,
      asOfDate,
    });
    if (!resolved) {
      warnings.push('CB_PACKAGE_ABSENT');
      return null;
    }
    warnings.push(...resolved.warnings);

    const lines = await loadPackageLinesForSrc(db, resolved.packageId);
    let hadUnmapped = false;
    for (const row of lines) {
      const lineCode = resolveLineComponentCode(row);
      if (!lineCode) {
        hadUnmapped = true;
        continue;
      }
      const amount = Number(row.amount);
      if (!Number.isFinite(amount)) continue;
      if (componentCodesMatch(target, lineCode)) {
        return {
          amount,
          source_ref: `emp_cb:package:${resolved.packageId}:line:${row.id}`,
          warnings,
        };
      }
    }
    if (hadUnmapped) {
      warnings.push('CB_COMPONENT_UNMAPPED');
    }
  } catch {
    warnings.push('CB_READ_UNAVAILABLE');
    return null;
  }
  return null;
}

export type PeriodInputPackRow = {
  id: string;
  amount: number;
  source_kind: string;
};

/** SRC-03: Period input pack row for component — VAL-INP-SRC-03b cấm silent-fail when table LIVE. */
export async function loadPeriodInputAmount(
  db: HrmDbService,
  input: {
    periodId: string;
    employeeId: string;
    componentCode: string;
  },
): Promise<PeriodInputPackRow | null> {
  const present = await probePeriodInputTable(db);
  if (!present) return null;
  const res = await db.query<{
    id: string;
    amount: string;
    source_kind: string;
  }>(
    `
      SELECT id::text AS id, amount::text AS amount, source_kind
      FROM public.pay_period_input_lines
      WHERE period_id = $1::uuid
        AND employee_id = $2::uuid
        AND lower(component_code) = lower($3::text)
        AND archived_at IS NULL
      ORDER BY
        CASE source_kind
          WHEN 'manual' THEN 1
          WHEN 'other_income' THEN 2
          WHEN 'rd_transfer' THEN 3
          WHEN 'advance' THEN 4
          ELSE 5
        END,
        updated_at DESC
      LIMIT 1;
    `,
    [input.periodId, input.employeeId, input.componentCode.trim()],
  );
  const row = res.rows[0];
  if (!row) return null;
  const amount = Number(row.amount);
  if (!Number.isFinite(amount)) {
    throw new Error(
      `VAL-INP-SRC-03b: pay_period_input_lines row ${row.id} has non-finite amount for ${input.componentCode}`,
    );
  }
  return { id: row.id, amount, source_kind: row.source_kind ?? 'manual' };
}

/** Load salary_components metadata for sign/nature/default_value (tier 4 fixed-only fallback). */
export async function loadSalaryComponentMeta(
  db: HrmDbService,
  input: { companyId: string; componentCode: string },
): Promise<{
  id: string;
  nature: string;
  default_value: number;
  value_type: string | null;
} | null> {
  const companyIds = expandPayrollAttendanceSheetCompanyIds(input.companyId);
  try {
    const res = await db.query<{
      id: string;
      nature: string;
      default_value: string;
      value_type: string | null;
    }>(
      `
        SELECT id::text AS id, nature, default_value::text, value_type
        FROM public.salary_components
        WHERE company_id = ANY($1::text[])
          AND lower(code) = lower($2::text)
          AND is_active = TRUE
        LIMIT 1;
      `,
      [companyIds, input.componentCode.trim()],
    );
    const row = res.rows[0];
    if (!row) return null;
    return {
      id: row.id,
      nature: row.nature,
      default_value: Number(row.default_value ?? 0),
      value_type: row.value_type,
    };
  } catch {
    return null;
  }
}

export function natureToSign(
  nature: string | undefined | null,
): PayFormulaEvalSign {
  const n = String(nature ?? 'income')
    .trim()
    .toLowerCase();
  return n === 'deduction' ? 'deduction' : 'earning';
}

/** Catalog default formula codes — open convention, no closed enum. */
export function catalogFormulaCodeCandidates(componentCode: string): string[] {
  const code = normalizeComponentCode(componentCode);
  return [`comp:${code}`, code, `COMP:${code.toUpperCase()}`, `tpl:${code}`];
}

/** Resolve published active formula id for component catalog default (SRC-05 tier 4). */
export async function resolveCatalogDefaultFormulaId(
  db: HrmDbService,
  input: { companyId: string; componentCode: string },
): Promise<string | null> {
  const companyIds = expandPayrollAttendanceSheetCompanyIds(input.companyId);
  const candidates = catalogFormulaCodeCandidates(input.componentCode);
  for (const code of candidates) {
    const res = await db.query<{ id: string }>(
      `
        SELECT id::text AS id
        FROM public.pay_formula_definitions
        WHERE company_id = ANY($1::text[])
          AND lower(code) = lower($2::text)
          AND status = 'active'
          AND archived_at IS NULL
        ORDER BY published_at DESC NULLS LAST, version DESC
        LIMIT 1;
      `,
      [companyIds, code],
    );
    if (res.rows[0]?.id) return res.rows[0].id;
  }
  return null;
}

/** Pure precedence pick for unit tests — mirrors BR-AMIS-PAY-SRC-02..05 short-circuit. */
export function pickSrcTierAvailable(input: {
  empCbAmount: number | null;
  periodInputAmount: number | null;
  templateOverrideFormulaId: string | null;
  catalogDefaultFormulaId: string | null;
  catalogDefaultValue: number | null;
}): PaySrcTier | 'blocked' {
  if (input.empCbAmount != null && Number.isFinite(input.empCbAmount))
    return 'emp_cb';
  if (
    input.periodInputAmount != null &&
    Number.isFinite(input.periodInputAmount)
  )
    return 'period_input';
  if (input.templateOverrideFormulaId) return 'template_override';
  if (input.catalogDefaultFormulaId) return 'formula_default';
  if (input.catalogDefaultValue != null && input.catalogDefaultValue > 0)
    return 'formula_default';
  return 'blocked';
}
