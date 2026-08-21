/**
 * @CODE-MEMORY
 * Screen:     HRM → Payroll formula variable bag (ATT closed + CORE C&B)
 * UC:         FR-UC-BP-PAY-02 · Q-PAY-F-3
 * BR:         Hours only from closed timesheet grain — cấm Leave/OT HTTP
 * SRS:        docs/program/specs/PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-01.md §4.4 · §5
 * TechSpec:   DATA-01 §3 variable ownership · G-PAY-F-06
 * Purpose:    Probe att_timesheet_line readiness + merge overrides / C&B reads.
 * WorkItem:   PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-EVAL-01
 * Coded:      2026-08-07
 * Callers:    pay-formula.service · payroll.service
 * Callees:    HrmDbService information_schema · employee_compensation_* (read-only)
 * must_keep:  honesty — ATT hours absent until line table LIVE; FORMULA-412-VARS when C&B incomplete
 * SOLID:      Bag builder SRP — không evaluate
 * LastVerified: docs/qa/evidence/po-hrm-payroll-formula-run-gap-be-cb-bag-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-EVAL-01
 * change_mode: ADD
 * What: att_timesheet_line probe + C&B base/allowance soft-read
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-CB-BAG-01
 * change_mode: ADD
 * What: Resolve CORE C&B vào var bag không cần variableOverrides — expand company
 *       (period + employee OU + main↔holding UUID) · contract.compensation_package_id fallback
 *       · map base/probation → base_salary · giữ FORMULA-412-VARS khi thiếu.
 * Why:  QC R-PAY-F-CB-BAG — PROCESS CB_PACKAGE_ABSENT khi exact company_id lệch OU NV.
 * SRS:  API §5 PROCESS bind · CORE C&B read-only bag
 * must_keep: ATT-412 / FORMULA-412 / VARS-412 honesty · payroll_e2e_ready=false · cấm seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-07
 * WorkItem: PO-HRM-PAYROLL-FORMULA-RUN-GAP-BE-ATT-LINE-01
 * change_mode: ADD
 * What: loadAttHoursFromClosedLine → PAY_FORMULA_ATT_HOUR_VARS từ closed+locked line
 * Why:  R-PAY-F-ATT-LINE — bỏ probe-only ABSENT khi bảng LIVE + line khóa
 * SRS:  API-ATT-LINE-01 §3–§4 · DATA-ATT-LINE-01 §1/§3 · FR-UC-BP-PAY-02
 * must_keep: cấm silent 0 · PREVIEW-STUB ABSENT/incomplete · PROCESS ATT-412
 *
 * @CODE-MEMORY-CHANGE 2026-08-10
 * WorkItem: PO-HRM-MVP-GD1-PAY-01-CLUSTER-BE-01
 * change_mode: FIX (RETAIN cite)
 * What: loadAttHoursFromClosedLine — NO_CLOSED_SHEET / ATT_LINE_NOT_LOCKED warnings (F-PAY-ATT-CLOSED-01)
 * SRS:  API-01 §4.6 · BR-BP-TS-03 · cấm Leave/OT HTTP
 * must_keep: payroll_e2e_ready=false · C-SLICE
 *
 * @CODE-MEMORY-CHANGE 2026-08-10
 * WorkItem: PO-HRM-MVP-GD1-PAY-03-CLUSTER-BE-01
 * change_mode: ADD
 * What: injectPayGtgcIntoVariableBag after loadCoreCbVariableBag — dependents_count + gtgc_amount_vnd
 * SRS:  API-01 §4.2 F-PAY-GTCG-01 · AC-PAY-03-BAG · before gd1_eval_v1
 * must_keep: PAY01/02 process order · payroll_e2e_ready=false
 */

import { expandPayrollAttendanceSheetCompanyIds } from '../common/hrm-list-scope';
import {
  injectPayGtgcIntoVariableBag,
  type PayGtgcResolveBlocked,
} from './pay-gtgc-resolver';
import { HrmDbService } from '../db/hrm-db.service';
import { resolveBoundClosedSheetIds } from './pay-period-bind-resolver';
import {
  isAttHoursVarKey,
  PAY_FORMULA_ATT_HOUR_VARS,
} from './pay-formula-evaluator';
import { PAY_FORMULA_REQUIRED_VAR_ALLOWLIST } from './pay-formula.constants'; // W10 BA-HRM-PAYROLL-FORMULA-INPUT-PACK-BE-01

export type AttHoursFidelityReason =
  | 'ATT_TIMESHEET_LINE_ABSENT'
  | 'NO_CLOSED_SHEET'
  | 'ATT_LINE_MISSING'
  | 'ATT_LINE_INCOMPLETE'
  | 'ATT_HOURS_READY'
  | null;

export type PayFormulaVarBagBuild = {
  vars: Record<string, number>;
  warnings: string[];
  attTimesheetLinePresent: boolean;
  attHoursReady: boolean;
  /** Taxonomy hint for PREVIEW-STUB vs ATT-412 (API-ATT-LINE §4). */
  attHoursReason: AttHoursFidelityReason;
  sheetId?: string;
  lineId?: string;
  sourcePrecedence: Array<
    'override' | 'emp_cb' | 'att_line' | 'period' | 'template' | 'catalog'
  >;
  /** F-PAY-GTCG-01 — missing statutory CFG at as_of (process → 412). */
  gtgcBlocked?: PayGtgcResolveBlocked;
  gtgcSnapshot?: {
    dependents_count: number;
    gtgc_amount_vnd: number;
    as_of: string;
    cfg_id: string;
  };
};

function toNumber(raw: unknown): number | null {
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (
    typeof raw === 'string' &&
    raw.trim() !== '' &&
    Number.isFinite(Number(raw))
  ) {
    return Number(raw);
  }
  return null;
}

/** Merge admin/smoke overrides — only finite numbers. */
export function applyVariableOverrides(
  bag: Record<string, number>,
  overrides?: Record<string, unknown> | null,
): { vars: Record<string, number>; applied: string[] } {
  const vars = { ...bag };
  const applied: string[] = [];
  if (!overrides || typeof overrides !== 'object') return { vars, applied };
  for (const [key, raw] of Object.entries(overrides)) {
    const k = key.trim();
    if (!k) continue;
    const n = toNumber(raw);
    if (n == null) continue;
    vars[k] = n;
    applied.push(k);
  }
  return { vars, applied };
}

/**
 * Company TEXT aliases for C&B soft-read: period OU + employee home OU + main↔holding↔UUID.
 * (Payroll period may be holding while package persists under member slug.)
 */
export type EffectiveCompensationPackage = {
  packageId: string;
  packageCompanyId: string;
  source: 'scoped_package' | 'employee_fallback' | 'contract_link';
  warnings: string[];
};

/**
 * Resolve one effective C&B package for as-of date — same order as loadCoreCbVariableBag.
 * Reused by SRC-02 per-component fixed PC resolver (BR-AMIS-PAY-SRC-02).
 */
export async function resolveEffectiveCompensationPackage(
  db: HrmDbService,
  input: {
    companyId: string;
    employeeId: string;
    asOfDate: string;
  },
): Promise<EffectiveCompensationPackage | null> {
  const warnings: string[] = [];
  let employeeCompanyId: string | null = null;
  try {
    const empRes = await db.query<{ company_id: string }>(
      `
        SELECT e.company_id::text AS company_id
        FROM public.employees e
        WHERE e.id = $1::uuid
          AND e.archived_at IS NULL
        LIMIT 1;
      `,
      [input.employeeId],
    );
    employeeCompanyId = empRes.rows[0]?.company_id?.trim() || null;
    if (!employeeCompanyId) {
      warnings.push('CB_EMPLOYEE_COMPANY_ABSENT');
    }
  } catch {
    warnings.push('CB_EMPLOYEE_LOOKUP_UNAVAILABLE');
  }

  const companyIds = expandCbReadCompanyIds(input.companyId, employeeCompanyId);
  if (companyIds.length === 0) {
    warnings.push('CB_COMPANY_SCOPE_EMPTY');
    return null;
  }

  let packageId: string | undefined;
  let packageCompanyId = '';
  let packageSource: EffectiveCompensationPackage['source'] | undefined;

  const scopedPkg = await db.query<{ id: string; company_id: string }>(
    `
      SELECT p.id::text AS id, p.company_id::text AS company_id
      FROM public.employee_compensation_packages p
      WHERE p.employee_id = $1::uuid
        AND p.company_id = ANY($2::text[])
        AND p.effective_from::date <= $3::date
        AND (p.effective_to IS NULL OR p.effective_to::date >= $3::date)
      ORDER BY p.effective_from DESC, p.version DESC
      LIMIT 1;
    `,
    [input.employeeId, companyIds, input.asOfDate],
  );
  packageId = scopedPkg.rows[0]?.id;
  if (packageId) {
    packageCompanyId = scopedPkg.rows[0]?.company_id ?? '';
    packageSource = 'scoped_package';
    if (
      employeeCompanyId &&
      scopedPkg.rows[0]?.company_id &&
      scopedPkg.rows[0].company_id !== input.companyId
    ) {
      warnings.push('CB_PACKAGE_COMPANY_ALIAS_MATCH');
    }
  }

  if (!packageId) {
    const empPkg = await db.query<{ id: string; company_id: string }>(
      `
        SELECT p.id::text AS id, p.company_id::text AS company_id
        FROM public.employee_compensation_packages p
        WHERE p.employee_id = $1::uuid
          AND p.effective_from::date <= $2::date
          AND (p.effective_to IS NULL OR p.effective_to::date >= $2::date)
        ORDER BY p.effective_from DESC, p.version DESC
        LIMIT 1;
      `,
      [input.employeeId, input.asOfDate],
    );
    packageId = empPkg.rows[0]?.id;
    if (packageId) {
      packageCompanyId = empPkg.rows[0]?.company_id ?? '';
      packageSource = 'employee_fallback';
      warnings.push('CB_PACKAGE_EMPLOYEE_FALLBACK');
    }
  }

  if (!packageId) {
    try {
      const contractPkg = await db.query<{ compensation_package_id: string }>(
        `
          SELECT c.compensation_package_id::text AS compensation_package_id
          FROM public.employee_contracts c
          WHERE c.employee_id = $1::uuid
            AND c.compensation_package_id IS NOT NULL
            AND (c.archived_at IS NULL)
          ORDER BY c.effective_date DESC NULLS LAST, c.created_at DESC
          LIMIT 1;
        `,
        [input.employeeId],
      );
      packageId = contractPkg.rows[0]?.compensation_package_id;
      if (packageId) {
        packageSource = 'contract_link';
        warnings.push('CB_PACKAGE_FROM_CONTRACT_LINK');
      }
    } catch {
      try {
        const contractPkg2 = await db.query<{
          compensation_package_id: string;
        }>(
          `
            SELECT c.compensation_package_id::text AS compensation_package_id
            FROM public.employee_contracts c
            WHERE c.employee_id = $1::uuid
              AND c.compensation_package_id IS NOT NULL
            ORDER BY c.created_at DESC
            LIMIT 1;
          `,
          [input.employeeId],
        );
        packageId = contractPkg2.rows[0]?.compensation_package_id;
        if (packageId) {
          packageSource = 'contract_link';
          warnings.push('CB_PACKAGE_FROM_CONTRACT_LINK');
        }
      } catch {
        warnings.push('CB_CONTRACT_LINK_UNAVAILABLE');
      }
    }
  }

  if (!packageId || !packageSource) {
    warnings.push('CB_PACKAGE_ABSENT');
    return null;
  }

  warnings.push(`CB_PACKAGE_SOURCE:${packageSource}`);
  return {
    packageId,
    packageCompanyId,
    source: packageSource,
    warnings,
  };
}

export function expandCbReadCompanyIds(
  periodCompanyId: string,
  employeeCompanyId?: string | null,
): string[] {
  const out = new Set<string>();
  for (const id of expandPayrollAttendanceSheetCompanyIds(periodCompanyId)) {
    out.add(id);
  }
  const emp = employeeCompanyId?.trim();
  if (emp) {
    for (const id of expandPayrollAttendanceSheetCompanyIds(emp)) {
      out.add(id);
    }
  }
  return [...out];
}

export async function probeAttTimesheetLinePresent(
  db: HrmDbService,
): Promise<boolean> {
  try {
    const res = await db.query<{ exists: boolean }>(
      `
        SELECT EXISTS(
          SELECT 1
          FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_name = 'att_timesheet_line'
        ) AS exists;
      `,
    );
    return Boolean(res.rows[0]?.exists);
  } catch {
    return false;
  }
}

function mapCompensationLinesToVars(
  rows: Array<{
    line_type: string;
    amount: string;
    allowance_code: string | null;
  }>,
): { vars: Record<string, number>; warnings: string[] } {
  const warnings: string[] = [];
  const vars: Record<string, number> = {};
  let probationAmount: number | null = null;
  for (const row of rows) {
    const amount = toNumber(row.amount);
    if (amount == null) continue;
    const lineType = String(row.line_type ?? '')
      .trim()
      .toLowerCase();
    if (lineType === 'base') {
      vars.base_salary = amount;
    } else if (lineType === 'probation') {
      probationAmount = amount;
    } else if (lineType === 'allowance') {
      const code = String(row.allowance_code ?? '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_');
      if (code) {
        vars[`allowance_${code}`] = amount;
      }
    }
  }
  if (!('base_salary' in vars) && probationAmount != null) {
    vars.base_salary = probationAmount;
    warnings.push('CB_BASE_FROM_PROBATION_LINE');
  }
  if (!('base_salary' in vars)) {
    warnings.push('CB_BASE_ABSENT');
  }
  return { vars, warnings };
}

async function loadLinesForPackage(
  db: HrmDbService,
  packageId: string,
): Promise<
  Array<{ line_type: string; amount: string; allowance_code: string | null }>
> {
  const linesRes = await db.query<{
    line_type: string;
    amount: string;
    allowance_code: string | null;
  }>(
    `
      SELECT line_type, amount::text AS amount, allowance_code
      FROM public.employee_compensation_lines
      WHERE package_id = $1::uuid
      ORDER BY sort_order ASC, created_at ASC;
    `,
    [packageId],
  );
  return linesRes.rows;
}

/**
 * Soft-read CORE C&B effective package → base_salary + allowance_* keys.
 * Fail-open empty bag if table missing (no throw — caller honesty → FORMULA-412-VARS).
 */
export async function loadCoreCbVariableBag(
  db: HrmDbService,
  input: {
    companyId: string;
    employeeId: string;
    asOfDate: string;
  },
): Promise<{ vars: Record<string, number>; warnings: string[] }> {
  const warnings: string[] = [];
  const vars: Record<string, number> = {};
  try {
    const resolved = await resolveEffectiveCompensationPackage(db, input);
    if (!resolved) {
      warnings.push('CB_PACKAGE_ABSENT');
      return { vars, warnings };
    }
    warnings.push(...resolved.warnings);
    const packageId = resolved.packageId;

    const lines = await loadLinesForPackage(db, packageId);
    const mapped = mapCompensationLinesToVars(lines);
    Object.assign(vars, mapped.vars);
    warnings.push(...mapped.warnings);
  } catch {
    warnings.push('CB_READ_UNAVAILABLE');
  }
  return { vars, warnings };
}

export type LoadAttHoursResult = {
  vars: Record<string, number>;
  warnings: string[];
  attTimesheetLinePresent: boolean;
  attHoursReady: boolean;
  attHoursReason: AttHoursFidelityReason;
  sheetId?: string;
  lineId?: string;
};

function mapLineRowToAttVars(row: {
  payable_hours: string | null;
  standard_hours: string | null;
  ot_hours_weighted: string | null;
  paid_leave_hours: string | null;
  unpaid_leave_hours: string | null;
}): Record<string, number> {
  const vars: Record<string, number> = {};
  const pairs: Array<
    [keyof typeof row, (typeof PAY_FORMULA_ATT_HOUR_VARS)[number]]
  > = [
    ['payable_hours', 'payable_hours'],
    ['standard_hours', 'standard_hours'],
    ['ot_hours_weighted', 'ot_hours_weighted'],
    ['paid_leave_hours', 'paid_leave_hours'],
    ['unpaid_leave_hours', 'unpaid_leave_hours'],
  ];
  for (const [col, key] of pairs) {
    const n = toNumber(row[col]);
    // Never invent 0 for null/non-finite — omit key (honesty).
    if (n == null) continue;
    vars[key] = n;
  }
  return vars;
}

/**
 * F-PAY-ATT-CLOSED-01 — SELECT closed+locked att_timesheet_line → ATT hour vars.
 * Cấm silent 0; cấm Leave/OT HTTP; cấm VIEW invent.
 */
export async function loadAttHoursFromClosedLine(
  db: HrmDbService,
  input: {
    companyId: string;
    employeeId: string;
    periodFrom: string;
    periodTo: string;
    periodId?: string;
    requiredKeys?: string[];
  },
): Promise<LoadAttHoursResult> {
  const warnings: string[] = [];
  const neededAtt = (
    input.requiredKeys ?? [...PAY_FORMULA_ATT_HOUR_VARS]
  ).filter(isAttHoursVarKey);

  const attTimesheetLinePresent = await probeAttTimesheetLinePresent(db);
  if (!attTimesheetLinePresent) {
    warnings.push('ATT_TIMESHEET_LINE_ABSENT');
    if (neededAtt.length > 0) {
      warnings.push('ATT_HOURS_BLOCKED_UNTIL_LINE');
      warnings.push('ATT_HOURS_VAR_BAG_INCOMPLETE');
    }
    return {
      vars: {},
      warnings,
      attTimesheetLinePresent: false,
      attHoursReady: neededAtt.length === 0,
      attHoursReason:
        neededAtt.length === 0 ? null : 'ATT_TIMESHEET_LINE_ABSENT',
    };
  }

  const companyIds = expandPayrollAttendanceSheetCompanyIds(input.companyId);
  let sheetId: string | undefined;

  // F-PAY-ATT-CLOSED-01 — prefer pay_period_timesheet_bind when present (AMIS chuyển công).
  if (input.periodId) {
    const boundIds = await resolveBoundClosedSheetIds(db, input.periodId);
    if (boundIds.length > 0) {
      sheetId = boundIds[0];
    }
  }

  if (!sheetId) {
    try {
      const sheetRes = await db.query<{ id: string }>(
        `
        SELECT s.id::text AS id
        FROM public.attendance_sheets s
        WHERE s.company_id = ANY($1::text[])
          AND s.status = 'closed'
          AND date_trunc('month', s.start_date::timestamp) = date_trunc('month', $2::date::timestamp)
        ORDER BY s.closed_at DESC NULLS LAST, s.updated_at DESC
        LIMIT 1;
      `,
        [companyIds, input.periodFrom],
      );
      sheetId = sheetRes.rows[0]?.id;
    } catch {
      warnings.push('ATT_CLOSED_SHEET_LOOKUP_UNAVAILABLE');
    }
  }

  if (!sheetId) {
    // Also accept window cover (period inside sheet dates) as secondary — month gate primary.
    try {
      const coverRes = await db.query<{ id: string }>(
        `
          SELECT s.id::text AS id
          FROM public.attendance_sheets s
          WHERE s.company_id = ANY($1::text[])
            AND s.status = 'closed'
            AND s.start_date::date <= $3::date
            AND s.end_date::date >= $2::date
          ORDER BY s.closed_at DESC NULLS LAST, s.updated_at DESC
          LIMIT 1;
        `,
        [companyIds, input.periodFrom, input.periodTo],
      );
      sheetId = coverRes.rows[0]?.id;
    } catch {
      /* soft */
    }
  }

  if (!sheetId) {
    if (neededAtt.length > 0) {
      warnings.push('NO_CLOSED_SHEET');
      warnings.push('ATT_HOURS_VAR_BAG_INCOMPLETE');
    }
    return {
      vars: {},
      warnings,
      attTimesheetLinePresent: true,
      attHoursReady: neededAtt.length === 0,
      attHoursReason: neededAtt.length === 0 ? null : 'NO_CLOSED_SHEET',
    };
  }

  let line:
    | {
        id: string;
        line_locked: boolean;
        payable_hours: string | null;
        standard_hours: string | null;
        ot_hours_weighted: string | null;
        paid_leave_hours: string | null;
        unpaid_leave_hours: string | null;
      }
    | undefined;
  try {
    const lineRes = await db.query<{
      id: string;
      line_locked: boolean;
      payable_hours: string | null;
      standard_hours: string | null;
      ot_hours_weighted: string | null;
      paid_leave_hours: string | null;
      unpaid_leave_hours: string | null;
    }>(
      `
        SELECT
          id::text AS id,
          line_locked,
          payable_hours::text AS payable_hours,
          standard_hours::text AS standard_hours,
          ot_hours_weighted::text AS ot_hours_weighted,
          paid_leave_hours::text AS paid_leave_hours,
          unpaid_leave_hours::text AS unpaid_leave_hours
        FROM public.att_timesheet_line
        WHERE header_id = $1::uuid
          AND employee_id = $2::uuid
          AND archived_at IS NULL
        ORDER BY line_locked DESC, updated_at DESC
        LIMIT 1;
      `,
      [sheetId, input.employeeId],
    );
    line = lineRes.rows[0];
  } catch {
    warnings.push('ATT_LINE_LOOKUP_UNAVAILABLE');
  }

  if (!line) {
    if (neededAtt.length > 0) {
      warnings.push('ATT_LINE_MISSING');
      warnings.push('ATT_HOURS_VAR_BAG_INCOMPLETE');
    }
    return {
      vars: {},
      warnings,
      attTimesheetLinePresent: true,
      attHoursReady: neededAtt.length === 0,
      attHoursReason: neededAtt.length === 0 ? null : 'ATT_LINE_MISSING',
      sheetId,
    };
  }

  if (!line.line_locked) {
    if (neededAtt.length > 0) {
      warnings.push('ATT_LINE_INCOMPLETE');
      warnings.push('ATT_LINE_NOT_LOCKED');
      warnings.push('ATT_HOURS_VAR_BAG_INCOMPLETE');
    }
    return {
      vars: {},
      warnings,
      attTimesheetLinePresent: true,
      attHoursReady: neededAtt.length === 0,
      attHoursReason: neededAtt.length === 0 ? null : 'ATT_LINE_INCOMPLETE',
      sheetId,
      lineId: line.id,
    };
  }

  const vars = mapLineRowToAttVars(line);
  const missingNeeded = neededAtt.filter(
    (k) => !(k in vars) || !Number.isFinite(vars[k]),
  );
  if (missingNeeded.length > 0) {
    warnings.push('ATT_LINE_INCOMPLETE');
    warnings.push(`ATT_LINE_NULL_KEYS:${missingNeeded.join(',')}`);
    warnings.push('ATT_HOURS_VAR_BAG_INCOMPLETE');
    // Omit incomplete keys — never invent 0.
    for (const k of missingNeeded) {
      delete vars[k];
    }
    return {
      vars,
      warnings,
      attTimesheetLinePresent: true,
      attHoursReady: false,
      attHoursReason: 'ATT_LINE_INCOMPLETE',
      sheetId,
      lineId: line.id,
    };
  }

  warnings.push('ATT_HOURS_FROM_CLOSED_LINE');
  return {
    vars,
    warnings,
    attTimesheetLinePresent: true,
    attHoursReady: true,
    attHoursReason: 'ATT_HOURS_READY',
    sheetId,
    lineId: line.id,
  };
}

/**
 * W10 BA-HRM-PAYROLL-FORMULA-INPUT-PACK-BE-01
 * Loads pay_period_input_lines for (periodId, employeeId), aggregates SUM(amount)
 * per source_kind, returns Record<source_kind, number>.
 *
 * BR-W10-03: source_kinds that collide with PAY_FORMULA_REQUIRED_VAR_ALLOWLIST names
 * are silently skipped — ATT-computed vars cannot be overridden by input packs.
 *
 * @param periodId    pay_period_input_lines.pay_period_id (UUID)
 * @param employeeId  pay_period_input_lines.employee_id (UUID)
 * @param db          HrmDbService — only pay_period_input_lines is queried (be_boundary)
 */
export async function loadInputPackBag(
  periodId: string,
  employeeId: string,
  db: HrmDbService,
): Promise<Record<string, number>> {
  const coreSet = new Set<string>(
    PAY_FORMULA_REQUIRED_VAR_ALLOWLIST as readonly string[],
  );
  const res = await db.query<{ source_kind: string; total: string }>(
    `SELECT source_kind, SUM(amount)::text AS total
     FROM pay_period_input_lines
     WHERE pay_period_id = $1
       AND employee_id = $2
       AND deleted_at IS NULL
     GROUP BY source_kind`,
    [periodId, employeeId],
  );
  const bag: Record<string, number> = {};
  for (const row of res.rows) {
    // BR-W10-03: skip source_kinds colliding with protected ATT var names
    if (coreSet.has(row.source_kind)) continue;
    const val = parseFloat(row.total);
    if (Number.isFinite(val)) bag[row.source_kind] = val;
  }
  return bag;
}

/**
 * Build variable bag for preview/process.
 * SRC precedence (AMIS cite — GĐ1 implemented layers only):
 * 1) variableOverrides (admin smoke)
 * 2) Emp C&B history (base/allowance) — required for PROCESS without cheat overrides
 * 3) Closed+locked att_timesheet_line hours (PAY_FORMULA_ATT_HOUR_VARS)
 * 4) Period input bag — not alternate formulas (none yet)
 * 5) Template override — FORBIDDEN invent this wave (not merged)
 * 6) Catalog salary_components.formula — FORBIDDEN as engine
 */
export async function buildPayFormulaVariableBag(
  db: HrmDbService,
  input: {
    companyId: string;
    employeeId?: string;
    asOfDate?: string;
    periodFrom?: string;
    periodTo?: string;
    periodId?: string;
    requiredKeys: string[];
    variableOverrides?: Record<string, unknown> | null;
  },
): Promise<PayFormulaVarBagBuild> {
  const warnings: string[] = [];
  const sourcePrecedence: PayFormulaVarBagBuild['sourcePrecedence'] = [];

  // W10 BA-HRM-PAYROLL-FORMULA-INPUT-PACK-BE-01: IP bag lowest priority
  // Merge order: { ...ipBag, ...cbBag, ...attBag } — ATT wins conflicts (BR-W10-03)
  const ipBag =
    input.periodId && input.employeeId
      ? await loadInputPackBag(input.periodId, input.employeeId, db)
      : {};
  if (Object.keys(ipBag).length > 0) {
    sourcePrecedence.push('period');
  }

  let vars: Record<string, number> = { ...ipBag };
  let attTimesheetLinePresent = await probeAttTimesheetLinePresent(db);
  let attHoursReady = true;
  let attHoursReason: AttHoursFidelityReason = null;
  let sheetId: string | undefined;
  let lineId: string | undefined;

  if (!attTimesheetLinePresent) {
    warnings.push('ATT_TIMESHEET_LINE_ABSENT');
  }

  let gtgcBlocked: PayGtgcResolveBlocked | undefined;
  let gtgcSnapshot: PayFormulaVarBagBuild['gtgcSnapshot'];

  if (input.employeeId && input.asOfDate) {
    const cb = await loadCoreCbVariableBag(db, {
      companyId: input.companyId,
      employeeId: input.employeeId,
      asOfDate: input.asOfDate,
    });
    vars = { ...vars, ...cb.vars };
    warnings.push(...cb.warnings);
    if (Object.keys(cb.vars).length > 0) {
      sourcePrecedence.push('emp_cb');
    }

    const gtgcAsOf = (input.periodTo ?? input.asOfDate).slice(0, 10);
    const gtgcInject = await injectPayGtgcIntoVariableBag(db, {
      periodCompanyId: input.companyId,
      employeeId: input.employeeId,
      asOf: gtgcAsOf,
      vars,
      warnings,
    });
    if (gtgcInject.injected) {
      gtgcSnapshot = {
        dependents_count: gtgcInject.snapshot.dependents_count,
        gtgc_amount_vnd: gtgcInject.snapshot.gtgc_amount_vnd,
        as_of: gtgcInject.snapshot.as_of,
        cfg_id: gtgcInject.snapshot.cfg_id,
      };
    } else {
      gtgcBlocked = gtgcInject.blocked;
      warnings.push('F-PAY-GTCG-01:CFG_MISSING');
    }
  } else {
    warnings.push('CB_CONTEXT_SKIPPED');
  }

  const periodFrom = (input.periodFrom ?? input.asOfDate ?? '').slice(0, 10);
  const periodTo = (input.periodTo ?? input.asOfDate ?? periodFrom).slice(
    0,
    10,
  );
  const neededAtt = input.requiredKeys.filter(isAttHoursVarKey);

  if (input.employeeId && /^\d{4}-\d{2}-\d{2}$/.test(periodFrom)) {
    const att = await loadAttHoursFromClosedLine(db, {
      companyId: input.companyId,
      employeeId: input.employeeId,
      periodFrom,
      periodTo,
      periodId: input.periodId,
      // Empty requiredKeys = opportunistic bind; do not force ATT readiness.
      requiredKeys: neededAtt,
    });
    attTimesheetLinePresent = att.attTimesheetLinePresent;
    sheetId = att.sheetId;
    lineId = att.lineId;
    // Deduplicate probe warnings already pushed.
    for (const w of att.warnings) {
      if (w === 'ATT_TIMESHEET_LINE_ABSENT' && warnings.includes(w)) continue;
      warnings.push(w);
    }
    if (Object.keys(att.vars).length > 0) {
      vars = { ...vars, ...att.vars };
      sourcePrecedence.push('att_line');
    }
    attHoursReason = att.attHoursReason;
    if (neededAtt.length > 0) {
      attHoursReady = neededAtt.every(
        (k) => k in vars && Number.isFinite(vars[k]),
      );
      if (!attHoursReady && att.attHoursReason == null) {
        attHoursReason = 'ATT_LINE_INCOMPLETE';
      }
    } else {
      attHoursReady = true;
      attHoursReason = null;
    }
  } else if (neededAtt.length > 0) {
    attHoursReady = false;
    attHoursReason = attTimesheetLinePresent
      ? 'NO_CLOSED_SHEET'
      : 'ATT_TIMESHEET_LINE_ABSENT';
    warnings.push('ATT_HOURS_VAR_BAG_INCOMPLETE');
    if (!attTimesheetLinePresent) {
      warnings.push('ATT_HOURS_BLOCKED_UNTIL_LINE');
    }
  }

  // Period input + template override resolved in pay-src-resolver on PROCESS (SRC-BE-01).
  // Catalog formula TEXT remains FORBIDDEN as engine.
  warnings.push('CATALOG_FORMULA_TEXT_FORBIDDEN');

  const overridden = applyVariableOverrides(vars, input.variableOverrides);
  vars = overridden.vars;
  if (overridden.applied.length > 0) {
    sourcePrecedence.unshift('override');
    warnings.push(`OVERRIDES_APPLIED:${overridden.applied.join(',')}`);
  }

  // Re-evaluate ATT readiness after overrides (admin smoke may supply hours).
  if (neededAtt.length > 0) {
    attHoursReady = neededAtt.every(
      (k) => k in vars && Number.isFinite(vars[k]),
    );
    if (attHoursReady) {
      attHoursReason = 'ATT_HOURS_READY';
    } else if (!warnings.includes('ATT_HOURS_VAR_BAG_INCOMPLETE')) {
      warnings.push('ATT_HOURS_VAR_BAG_INCOMPLETE');
    }
  }

  return {
    vars,
    warnings,
    attTimesheetLinePresent,
    attHoursReady,
    attHoursReason,
    sheetId,
    lineId,
    sourcePrecedence,
    gtgcBlocked,
    gtgcSnapshot,
  };
}

/**
 * W12b: Load insurance variables (7 vars) from hrm_insurance_rate + hrm_minimum_wage_region.
 * @CODE-MEMORY WorkItem: BA-HRM-INSURANCE-RATE-TECHSPEC-01
 * SOLID: Pure loader function, no evaluation logic.
 * Purpose: Supply 7 insurance vars cho payroll formula.
 */
export async function loadInsuranceBag(
  tenantId: string,
  companyId: string,
  payPeriodStartDate: Date,
  db: HrmDbService,
): Promise<Record<string, number>> {
  const year = payPeriodStartDate.getFullYear();
  const rates = await db.query<{
    insurance_type: string;
    employer_rate_percent: string;
    employee_rate_percent: string;
    salary_cap_multiplier: string;
  }>(
    `SELECT insurance_type, employer_rate_percent, employee_rate_percent, salary_cap_multiplier
     FROM hrm_insurance_rate
     WHERE tenant_id = $1 AND company_id = $2 AND effective_year = $3 AND status = 'active'`,
    [tenantId, companyId, year],
  );

  // Get company region for salary cap
  const company = await db.queryOne<{ region_code: string }>(
    `SELECT region_code FROM company WHERE id = $1`,
    [companyId],
  );
  const regionCode = company?.region_code ?? 'REGION_1';
  const minWage = await db.queryOne<{ monthly_min_wage: string }>(
    `SELECT monthly_min_wage FROM hrm_minimum_wage_region
     WHERE tenant_id = $1 AND company_id = $2 AND region_code = $3
     AND effective_from <= $4 AND (effective_to IS NULL OR effective_to >= $4)
     AND status = 'active' ORDER BY effective_from DESC LIMIT 1`,
    [tenantId, companyId, regionCode, payPeriodStartDate],
  );
  const monthlyMinWage = minWage
    ? parseFloat(minWage.monthly_min_wage)
    : 4680000;
  // Use BHXH rate's salary_cap_multiplier if available, else default 20
  const bhxhRate = rates.rows.find((r) => r.insurance_type === 'BHXH');
  const salaryCapMultiplier = bhxhRate
    ? parseFloat(bhxhRate.salary_cap_multiplier)
    : 20;
  const salaryCap = monthlyMinWage * salaryCapMultiplier;

  const bag: Record<string, number> = {};
  for (const r of rates.rows) {
    const type = r.insurance_type.toLowerCase();
    bag[`insurance_${type}_employer_rate`] = parseFloat(
      r.employer_rate_percent,
    );
    bag[`insurance_${type}_employee_rate`] = parseFloat(
      r.employee_rate_percent,
    );
  }
  bag['insurance_salary_cap'] = salaryCap;
  return bag;
}

/**
 * W12a: Load leave_type_pay_rate từ hrm_leave_type table.
 * @CODE-MEMORY WorkItem: BA-HRM-LEAVE-TYPE-TECHSPEC-01
 * SOLID: Pure loader function, no evaluation logic.
 * Purpose: Supply pay_rate_percent cho payroll formula khi có leave_type_code.
 */
export async function loadLeaveTypePayRate(
  tenantId: string,
  companyId: string,
  leaveTypeCode: string,
  db: HrmDbService,
): Promise<number> {
  const row = await db.queryOne<{ pay_rate_percent: string }>(
    `SELECT pay_rate_percent FROM public.hrm_leave_type WHERE tenant_id = $1 AND company_id = $2 AND code = $3 AND status = 'active' AND deleted_at IS NULL`,
    [tenantId, companyId, leaveTypeCode],
  );
  return row ? parseFloat(row.pay_rate_percent) : 100;
}
