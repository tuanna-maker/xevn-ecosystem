/**
 * @CODE-MEMORY
 * Screen:     /attendance — Bảng chấm công · Tổng hợp kỳ (phễu giờ công tính lương)
 * UC:         UC-BP-ATT-10 · FR-UC-BP-ATT-10 · AC-ATT-10-* · J-HRM-ATT-10-01..06
 * BR:         BR-BP-TS-01 · ATT-10-PATH/SUBMIT/PAYABLE/GOLD/OT/FUNNEL/FOOTER/≠-AGG-DONE/≠-11/≠-09/≠-UAT/PAY-OUT
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-10 Diễn biến #1–#3 + Thành công
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-ATT-10-CLUSTER-API-01.md
 *             F-ATT-SHEET-01/AGG POST …/attendance-sheets/{id}/aggregate · submit MUST AGG ·
 *             GET peer · Nest /core DENY · DENY invent att_leave_hold · second hour ledger ·
 *             HOL/MEAL/−penalty DONE · PAY OUT · printable false
 * Purpose:    Path lock + display-ready parse (sheet_id·status·statusLabelVi·line_count·warnings·lines)
 *             + payable gold GĐ1 (std+paidLeave+otWeighted) · late_penalty display · unpaid∉ ·
 *             HOL/MEAL footer OUT · honesty ≠ AGG=ATT-10 DONE · ≠ ATT-11/PAY · ≠ soft/ATT-08=ATT-09 ·
 *             ≠ ATT UAT · CFG≠ATT-02 · Nest /core DENY.
 * WorkItem:   PO-HRM-MVP-GD1-ATT-10-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    AttendanceSheetSignPanel · attSheetAggUi · source tests
 * Callees:    contractLegalPrintConstants (printable false RETAIN)
 * must_keep:  ATT09QC1-MSLUTL9D hold/settle · ATT08QC1-MSLSL36C preview · ATT02QC1-MSLQZUK7 CFG≠DONE ·
 *             PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false ·
 *             CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest /core DENY · physical /attendance/* · U65 · C-SLICE
 * SOLID:      Pure helpers tách panel — no FE invent Nest /core · no fake lines gold
 * LastVerified: attSheet10Ring.test.ts · poHrmMvpGd1Att10ClusterFe01.source.test.ts
 */

import { CONTRACTS_PRINTABLE_READY } from '@/lib/contractLegalPrintConstants';

/** Physical SoT paths (O1/O9) — Network MUST contain; Nest /core AGG = FAIL. */
export const ATT_SHEET_10_PATH_ASSERT = {
  aggregate: '/api/hrm/attendance/attendance-sheets/:sheetId/aggregate',
  submit: '/api/hrm/attendance/attendance-sheets/:sheetId/submit',
  getSheet: '/api/hrm/attendance/attendance-sheets/:id',
  listSheets: '/api/hrm/attendance/attendance-sheets',
  nestCoreDenied: '/api/hrm/core/',
  /** DENY invent dual hold ledger (ATT-09 must_keep). */
  inventHoldTableDenied: 'att_leave_hold',
  /** DENY second hour ledger invent. */
  secondLedgerDenied: 'second_hour_ledger',
} as const;

export const R_ATT_10_FUNNEL_FE = 'R-ATT-10-FUNNEL' as const;
export const R_ATT_10_PAYABLE_FE = 'R-ATT-10-PAYABLE' as const;
export const R_ATT_10_DISP_FE = 'R-ATT-10-DISP' as const;
export const R_ATT_10_OT_FE = 'R-ATT-10-OT' as const;

/** VI status labels — FE-derive when BE omits statusLabelVi (API-01 §6.2). */
export const ATT_10_STATUS_LABELS_VI: Record<string, string> = {
  draft: 'Nháp',
  open: 'Nháp',
  submitted: 'Chờ ký',
  closed: 'Đã chốt',
};

export const ATT_10_PAYABLE_GOLD_EPS = 0.01;

export type Att10TimesheetLineDisplay = {
  employeeId: string;
  employeeName: string | null;
  standardHours: number;
  otHoursWeighted: number;
  paidLeaveHours: number;
  unpaidLeaveHours: number;
  latePenaltyHours: number;
  mealShiftHours: number | null;
  holidayHours: number | null;
  payableHours: number;
  workDays: number;
  lineLocked: boolean;
  /** True when payable matches gold ±eps. */
  payableGoldOk: boolean;
};

export type Att10SheetAggDisplay = {
  sheetId: string | null;
  status: string;
  statusLabelVi: string;
  lineCount: number;
  warnings: string[];
  lines: Att10TimesheetLineDisplay[];
  /** True when BE returned lines[] (DISP present). */
  linesEnvelopePresent: boolean;
  emptyEnrollment: boolean;
};

function asNum(v: unknown): number | null {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function isPhysicalAttSheet10Path(path: string): boolean {
  const p = String(path ?? '');
  return p.includes('/api/hrm/attendance/attendance-sheets');
}

export function isForbiddenAttSheet10SotPath(path: string): boolean {
  const p = String(path ?? '').toLowerCase();
  if (p.includes('/api/hrm/core/')) return true;
  if (p.includes('att_leave_hold')) return true;
  return false;
}

/** FE-derive statusLabelVi — wire label wins when non-empty. */
export function deriveAtt10StatusLabelVi(
  status: string | null | undefined,
  wireLabel?: string | null,
): string {
  const wire = String(wireLabel ?? '').trim();
  if (wire) return wire;
  const key = String(status ?? '')
    .trim()
    .toLowerCase();
  return ATT_10_STATUS_LABELS_VI[key] ?? (key || '—');
}

/**
 * Payable gold GĐ1 — standard + paidLeave + otWeighted (±0.01).
 * late_penalty NOT subtracted · unpaid excluded · −penalty OUT GĐ1.
 */
export function computeAtt10PayableGold(input: {
  standardHours: number;
  paidLeaveHours: number;
  otHoursWeighted: number;
}): number {
  return (
    Math.max(0, Number(input.standardHours) || 0) +
    Math.max(0, Number(input.paidLeaveHours) || 0) +
    Math.max(0, Number(input.otHoursWeighted) || 0)
  );
}

export function isAtt10PayableGoldOk(
  payableHours: number,
  goldParts: { standardHours: number; paidLeaveHours: number; otHoursWeighted: number },
  eps: number = ATT_10_PAYABLE_GOLD_EPS,
): boolean {
  const gold = computeAtt10PayableGold(goldParts);
  return Math.abs(Number(payableHours) - gold) <= eps;
}

/** Raw OT into payable = FAIL (AC-ATT-10-FAIL-RAW-OT) — detect when payable uses unweighted OT. */
export function isAtt10RawOtInPayableFail(input: {
  payableHours: number;
  standardHours: number;
  paidLeaveHours: number;
  otHoursRaw: number;
  otHoursWeighted: number;
}): boolean {
  const withRaw =
    Math.max(0, input.standardHours) +
    Math.max(0, input.paidLeaveHours) +
    Math.max(0, input.otHoursRaw);
  const withWeighted = computeAtt10PayableGold({
    standardHours: input.standardHours,
    paidLeaveHours: input.paidLeaveHours,
    otHoursWeighted: input.otHoursWeighted,
  });
  if (Math.abs(input.otHoursRaw - input.otHoursWeighted) < ATT_10_PAYABLE_GOLD_EPS) {
    return false;
  }
  return Math.abs(input.payableHours - withRaw) <= ATT_10_PAYABLE_GOLD_EPS &&
    Math.abs(input.payableHours - withWeighted) > ATT_10_PAYABLE_GOLD_EPS;
}

function parseLine(raw: unknown): Att10TimesheetLineDisplay | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const employeeId = String(row.employee_id ?? row.employeeId ?? '').trim();
  if (!employeeId) return null;
  const standardHours = asNum(row.standard_hours ?? row.standardHours) ?? 0;
  const otHoursWeighted = asNum(row.ot_hours_weighted ?? row.otHoursWeighted) ?? 0;
  const paidLeaveHours = asNum(row.paid_leave_hours ?? row.paidLeaveHours) ?? 0;
  const unpaidLeaveHours = asNum(row.unpaid_leave_hours ?? row.unpaidLeaveHours) ?? 0;
  const latePenaltyHours = asNum(row.late_penalty_hours ?? row.latePenaltyHours) ?? 0;
  const mealRaw = row.meal_shift_hours ?? row.mealShiftHours;
  const holRaw = row.holiday_hours ?? row.holidayHours;
  const mealShiftHours = mealRaw == null || mealRaw === '' ? null : asNum(mealRaw);
  const holidayHours = holRaw == null || holRaw === '' ? null : asNum(holRaw);
  const payableHours = asNum(row.payable_hours ?? row.payableHours) ?? 0;
  const workDays = asNum(row.work_days ?? row.workDays) ?? 0;
  const lineLocked = Boolean(row.line_locked ?? row.lineLocked ?? false);
  const employeeNameRaw = row.employee_name ?? row.employeeName;
  const employeeName =
    employeeNameRaw == null || String(employeeNameRaw).trim() === ''
      ? null
      : String(employeeNameRaw).trim();
  return {
    employeeId,
    employeeName,
    standardHours,
    otHoursWeighted,
    paidLeaveHours,
    unpaidLeaveHours,
    latePenaltyHours,
    mealShiftHours,
    holidayHours,
    payableHours,
    workDays,
    lineLocked,
    payableGoldOk: isAtt10PayableGoldOk(payableHours, {
      standardHours,
      paidLeaveHours,
      otHoursWeighted,
    }),
  };
}

export function normalizeAtt10Warnings(warnings: string[] | null | undefined): string[] {
  if (!Array.isArray(warnings)) return [];
  return warnings.map((w) => String(w).trim()).filter(Boolean);
}

export function isAtt10EmptyEnrollment(input: {
  lineCount?: number;
  warnings?: string[] | null;
}): boolean {
  const warnings = normalizeAtt10Warnings(input.warnings);
  if (warnings.includes('AGG_EMPTY_ENROLLMENT')) return true;
  const lineCount = Number(input.lineCount ?? 0);
  return Number.isFinite(lineCount) && lineCount <= 0;
}

/** Display-ready AGG/submit/GET envelope — FE-derive statusLabelVi · optional lines[]. */
export function parseAtt10SheetAggDisplay(raw: unknown): Att10SheetAggDisplay | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const sheetIdRaw = row.sheet_id ?? row.sheetId ?? row.id;
  const sheetId =
    sheetIdRaw == null || String(sheetIdRaw).trim() === '' ? null : String(sheetIdRaw).trim();
  const status = String(row.status ?? '').trim() || 'draft';
  const statusLabelVi = deriveAtt10StatusLabelVi(
    status,
    typeof row.statusLabelVi === 'string'
      ? row.statusLabelVi
      : typeof row.status_label_vi === 'string'
        ? row.status_label_vi
        : typeof row.status_label === 'string'
          ? row.status_label
          : null,
  );
  const lineCount = Math.max(0, Math.floor(asNum(row.line_count ?? row.lineCount) ?? 0));
  const warnings = normalizeAtt10Warnings(
    (row.warnings as string[] | null | undefined) ?? null,
  );
  const linesRaw = row.lines;
  const lines: Att10TimesheetLineDisplay[] = [];
  if (Array.isArray(linesRaw)) {
    for (const item of linesRaw) {
      const line = parseLine(item);
      if (line) lines.push(line);
    }
  }
  return {
    sheetId,
    status,
    statusLabelVi,
    lineCount,
    warnings,
    lines,
    linesEnvelopePresent: Array.isArray(linesRaw),
    emptyEnrollment: isAtt10EmptyEnrollment({ lineCount, warnings }),
  };
}

/** HOL/MEAL footer OUT GĐ1 — ABSENT/null OK · DENY invent DONE. */
export function att10HolMealFooterText(): string {
  return 'Công lễ / Ăn ca: OUT GĐ1 (ABSENT/null OK) — không invent writer DONE.';
}

export function att10HonestyBannerText(): string {
  return [
    'ATT-10 Tổng hợp bảng công (phễu giờ công tính lương) — C-SLICE · U65.',
    '≠ AGG alone = ATT-10 DONE · ≠ ATT-11/PAY DONE · ≠ soft/ATT-08 = ATT-09 DONE · ≠ ATT module UAT · CFG ≠ ATT-02 DONE (ATT02QC1-MSLQZUK7).',
    'must_keep ATT09QC1-MSLUTL9D hold/settle pending_days · DENY att_leave_hold · ATT08QC1-MSLSL36C preview RETAIN.',
    'Nest /core DENY · DENY second hour ledger · printable false RETAIN · PAY OUT.',
    'Payable gold GĐ1 = chuẩn + phép paid + OT×hệ số · phạt muộn chỉ display · unpaid∉ · −penalty OUT.',
    att10HolMealFooterText(),
  ].join(' ');
}

export function att10LinesDispResidualText(display: Att10SheetAggDisplay): string | null {
  if (display.linesEnvelopePresent) return null;
  if (display.lineCount <= 0) return null;
  return `line_count=${display.lineCount} SoT PRESENT · lines[] envelope ABSENT (R-ATT-10-DISP) — FE không invent gold rows; thin GET enrich chỉ khi QA prove closable gap · Dev-BE HOLD.`;
}

/** Seal stamps for QA/source lock. */
export const ATT_10_MUST_KEEP_STAMPS = {
  att09: 'ATT09QC1-MSLUTL9D',
  att08: 'ATT08QC1-MSLSL36C',
  att02: 'ATT02QC1-MSLQZUK7',
  plt01: 'PLT01QC1-MSLPUQIU',
  core10: 'CORE10QC1-MSLP0EJB',
  core09: 'CORE09QC1-MSLNBA89',
  core07: 'CORE07QC1-KZJTSHNT',
} as const;

/** Always false for this seat — printable RETAIN false (CORE09QC1). */
export function att10PrintableReady(): boolean {
  void CONTRACTS_PRINTABLE_READY;
  return false;
}
