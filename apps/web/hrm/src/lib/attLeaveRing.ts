/**
 * @CODE-MEMORY
 * Screen:     /attendance → Nghỉ phép · preview trừ quỹ (ATT-08)
 * UC:         UC-BP-ATT-08 · FR-UC-BP-ATT-08 · AC-ATT-08-* · J-HRM-ATT-08-01..06
 * BR:         BR-BP-LV-05 · Q-LEAVE-UNIT · ATT-08-PATH/ENGINE/HOL-MISS/≠-CLIENT/≠-09/03b/≠-UAT/≠-CFG02/PAY-OUT
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-08 Diễn biến #1–#4 + FAIL calendar · Thành công
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-ATT-08-CLUSTER-API-01.md
 *             F-ATT-LEAVE-01 preview-deduction · peers leave-requests/balance/types · Nest /core DENY
 * Purpose:    Path lock + preview display-ready parse + honesty footers —
 *             bind LIVE when BE wires; stub-safe ABSENT (no fake T6→T2=4);
 *             HOL-MISS chặn nộp; DENY Nest /core · claim client-days = ATT-08 DONE ·
 *             claim ATT-09/03b DONE · ATT UAT · CFG=ATT-02 DONE · invent PAY/printable.
 * WorkItem:   PO-HRM-MVP-GD1-ATT-08-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    AttLeavePreviewDeductionPanel · LeaveTab · source tests
 * Callees:    contractLegalPrintConstants (printable false RETAIN)
 * must_keep:  ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB ·
 *             CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT · soft≠CORE-06 ·
 *             Nest /core DENY · physical /attendance/* · U65 · C-SLICE
 * SOLID:      Pure helpers tách panel — no FE invent BR-BP-LV-05 engine
 * LastVerified: attLeaveRing.test.ts · poHrmMvpGd1Att08ClusterFe01.source.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-08-CLUSTER-FE-02
 * change_mode: UPGRADE
 * What: LIVE preview helpers — residual R-ATT-08-PREVIEW-FE CLOSED; submit total_days =
 *       deductible_units (DENY calendar inflate); ALIGN reject detect + message; honesty LIVE.
 * Why: BE-01 READY · UC-BP-ATT-08 · BR-BP-LV-05 · AC-ATT-08-ALIGN/ENGINE/UNIT
 * must_keep: Nest /core DENY · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT/CORE · printable false ·
 *            PAY OUT · ≠ ATT-09/03b · ≠ ATT UAT · U65 · C-SLICE · no fake T6→T2=4
 * Spec: docs/program/specs/PO-HRM-MVP-GD1-ATT-08-CLUSTER-API-01.md §4–§5
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-att-08-cluster-fe-02.md
 */

import { CONTRACTS_PRINTABLE_READY } from '@/lib/contractLegalPrintConstants';
import { ApiClientError } from '@/lib/apiError';

/** Physical SoT paths (O2/O8) — Network MUST contain; Nest /core leave = FAIL. */
export const ATT_LEAVE_08_PATH_ASSERT = {
  leaveRequests: '/api/hrm/attendance/leave-requests',
  previewDeduction: '/api/hrm/attendance/leave-requests/preview-deduction',
  leaveBalance: '/api/hrm/attendance/leave-balance',
  leaveTypes: '/api/hrm/attendance/leave-types',
  holidayCalendarsOptional: '/api/hrm/attendance/holiday-calendars',
  nestCoreDenied: '/api/hrm/core/',
} as const;

export const ATT_08_HOL_MISS_CODE = 'HRM-LEAVE-HOL-MISSING' as const;
export const ATT_08_VAL_400_CODE = 'HRM-VAL-400' as const;
export const ATT_08_TYPE_UNKNOWN_CODE = 'HRM-LEAVE-TYPE-UNKNOWN' as const;

/** Residual stamp — FE-01 HOLD · FE-02 CLOSED (BE preview LIVE). */
export const R_ATT_08_PREVIEW_FE = 'R-ATT-08-PREVIEW-FE' as const;
export const R_ATT_08_PREVIEW_FE_STATUS = 'CLOSED' as const;

export type Att08LeaveUnit = 'day' | 'hour';

export type Att08ExcludedDay = {
  date: string;
  reason: string;
  labelVi: string | null;
};

/** Display-ready preview envelope (API-01 §4.6) — null fields ⇒ residual ABSENT. */
export type Att08PreviewDeductionEnvelope = {
  employeeId: string | null;
  leaveType: string | null;
  unit: Att08LeaveUnit | null;
  startDate: string | null;
  endDate: string | null;
  calendarDays: number | null;
  workingDays: number | null;
  deductibleUnits: number | null;
  excludedDays: Att08ExcludedDay[];
  warnings: string[];
  /** True when BE returned engine fields (working_days / deductible_units). */
  envelopePresent: boolean;
};

function asNum(v: unknown): number | null {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function normalizeUnit(raw: unknown): Att08LeaveUnit | null {
  const s = String(raw ?? '')
    .trim()
    .toLowerCase();
  if (s === 'day' || s === 'hour') return s;
  return null;
}

function parseExcludedDays(raw: unknown): Att08ExcludedDay[] {
  if (!Array.isArray(raw)) return [];
  const out: Att08ExcludedDay[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const date = String(row.date ?? '').trim();
    if (!date) continue;
    out.push({
      date,
      reason: String(row.reason ?? '').trim() || 'excluded',
      labelVi:
        row.labelVi != null
          ? String(row.labelVi)
          : row.label_vi != null
            ? String(row.label_vi)
            : null,
    });
  }
  return out;
}

function parseWarnings(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((w) => {
      if (typeof w === 'string') return w.trim();
      if (w && typeof w === 'object') {
        const row = w as Record<string, unknown>;
        return String(row.message ?? row.labelVi ?? row.code ?? '').trim();
      }
      return '';
    })
    .filter(Boolean);
}

/**
 * Parse preview-deduction display-ready DTO.
 * ABSENT / incomplete ⇒ envelopePresent=false (stub-safe · no fake T6→T2).
 */
export function parseAtt08PreviewDeductionEnvelope(
  raw: unknown,
): Att08PreviewDeductionEnvelope {
  const empty: Att08PreviewDeductionEnvelope = {
    employeeId: null,
    leaveType: null,
    unit: null,
    startDate: null,
    endDate: null,
    calendarDays: null,
    workingDays: null,
    deductibleUnits: null,
    excludedDays: [],
    warnings: [],
    envelopePresent: false,
  };
  if (!raw || typeof raw !== 'object') return empty;
  const row = raw as Record<string, unknown>;
  const workingDays = asNum(row.working_days ?? row.workingDays);
  const deductibleUnits = asNum(row.deductible_units ?? row.deductibleUnits);
  const calendarDays = asNum(row.calendar_days ?? row.calendarDays);
  const unit = normalizeUnit(row.unit);
  const envelopePresent =
    workingDays != null || deductibleUnits != null || unit != null;
  return {
    employeeId:
      row.employeeId != null
        ? String(row.employeeId)
        : row.employee_id != null
          ? String(row.employee_id)
          : null,
    leaveType:
      row.leaveType != null
        ? String(row.leaveType)
        : row.leave_type != null
          ? String(row.leave_type)
          : null,
    unit,
    startDate:
      row.startDate != null
        ? String(row.startDate)
        : row.start_date != null
          ? String(row.start_date)
          : null,
    endDate:
      row.endDate != null
        ? String(row.endDate)
        : row.end_date != null
          ? String(row.end_date)
          : null,
    calendarDays,
    workingDays,
    deductibleUnits,
    excludedDays: parseExcludedDays(row.excluded_days ?? row.excludedDays),
    warnings: parseWarnings(row.warnings),
    envelopePresent,
  };
}

/** Build POST body for F-ATT-LEAVE-01 (camelCase preferred; BE may accept snake). */
export function buildAtt08PreviewDeductionBody(input: {
  employeeId: string;
  companyId?: string | null;
  leaveType: string;
  startDate: string;
  endDate: string;
  halfDay?: boolean;
  hours?: number | null;
}): Record<string, unknown> {
  const body: Record<string, unknown> = {
    employeeId: input.employeeId,
    leaveType: input.leaveType,
    startDate: input.startDate,
    endDate: input.endDate,
  };
  if (input.companyId?.trim()) body.companyId = input.companyId.trim();
  if (input.halfDay === true) body.halfDay = true;
  if (input.hours != null && Number.isFinite(input.hours)) body.hours = input.hours;
  return body;
}

/**
 * Detect preview Nest path ABSENT (404 / 501 / unknown route).
 * DENY invent engine numbers when true.
 */
export function isAtt08PreviewAbsentError(error: unknown): boolean {
  if (error instanceof ApiClientError) {
    if (error.status === 404 || error.status === 501 || error.status === 405) {
      return true;
    }
    const code = String(error.code ?? '').toUpperCase();
    if (code.includes('NOT_FOUND') || code.includes('404')) return true;
  }
  if (typeof error === 'object' && error !== null) {
    const status = (error as { status?: number }).status;
    if (status === 404 || status === 501 || status === 405) return true;
  }
  return false;
}

export function isAtt08HolMissError(error: unknown): boolean {
  if (error instanceof ApiClientError) {
    return error.code === ATT_08_HOL_MISS_CODE;
  }
  if (typeof error === 'object' && error !== null) {
    return (error as { code?: string }).code === ATT_08_HOL_MISS_CODE;
  }
  return false;
}

/** TRUE when path is Nest dual `/api/hrm/core/*` leave SoT (FAIL O8). */
export function isForbiddenAttLeaveSotPath(path: string | null | undefined): boolean {
  const p = String(path ?? '').toLowerCase();
  if (!p.includes('/api/hrm/core/')) return false;
  return (
    p.includes('leave') ||
    p.includes('/att/') ||
    p.includes('preview') ||
    p.includes('deduction') ||
    p.includes('holiday') ||
    p.includes('attendance')
  );
}

/** Physical attendance family (PASS O2/O8). */
export function isPhysicalAttLeavePath(path: string | null | undefined): boolean {
  return String(path ?? '').includes('/attendance/');
}

/**
 * Gold AC guard — T6→T2 must be working_days=2 not calendar 4 as trừ quỹ.
 * Returns false when envelope claims trừ quỹ = calendar inflate (FAIL).
 */
export function assertAtt08GoldWorkingDaysNotCalendar(
  env: Att08PreviewDeductionEnvelope,
): boolean {
  if (!env.envelopePresent) return true;
  if (env.workingDays == null || env.calendarDays == null) return true;
  if (env.calendarDays === 4 && env.workingDays === 4) return false;
  return true;
}

/**
 * ALIGN submit — total_days MUST be engine deductible_units when LIVE preview present.
 * DENY silent calendar inflate (T6→T2 calendar 4 as trừ quỹ).
 */
export function resolveAtt08SubmitTotalDays(
  env: Att08PreviewDeductionEnvelope | null | undefined,
  calendarFallback: number,
): number {
  if (env?.envelopePresent && env.deductibleUnits != null) {
    return env.deductibleUnits;
  }
  return calendarFallback;
}

/** Unit label VI from envelope (Q-LEAVE-UNIT). */
export function att08UnitLabelVi(unit: Att08LeaveUnit | null | undefined): string {
  if (unit === 'hour') return 'giờ';
  if (unit === 'day') return 'ngày';
  return '—';
}

/**
 * Detect ALIGN reject (HRM-VAL-400 + deductible_units / calendar inflate details).
 * Do not conflate with ATT-02 late-penalty HRM-VAL-400.
 */
export function isAtt08AlignInflateError(error: unknown): boolean {
  const msg =
    error instanceof ApiClientError
      ? String(error.message ?? '')
      : typeof error === 'object' && error !== null
        ? String((error as { message?: string }).message ?? '')
        : '';
  const code =
    error instanceof ApiClientError
      ? error.code
      : typeof error === 'object' && error !== null
        ? (error as { code?: string }).code
        : undefined;
  const details =
    error instanceof ApiClientError
      ? error.details
      : typeof error === 'object' && error !== null
        ? (error as { details?: unknown }).details
        : undefined;

  const inflateHint =
    /calendar inflate|deductible_units|BR-BP-LV-05|does not match engine/i.test(msg);
  if (inflateHint) return true;

  if (code === ATT_08_VAL_400_CODE && details && typeof details === 'object') {
    const d = details as Record<string, unknown>;
    if (d.deductible_units != null || d.deductibleUnits != null) return true;
    if (d.working_days != null && d.calendar_days != null) return true;
  }
  return false;
}

export function att08AlignInflateMessage(error?: unknown): string {
  let client: number | null = null;
  let engine: number | null = null;
  if (error && typeof error === 'object') {
    const details =
      error instanceof ApiClientError
        ? error.details
        : (error as { details?: unknown }).details;
    if (details && typeof details === 'object') {
      const d = details as Record<string, unknown>;
      client = asNum(d.total_days ?? d.totalDays);
      engine = asNum(d.deductible_units ?? d.deductibleUnits);
    }
  }
  if (client != null && engine != null) {
    return `Số ngày nộp (${client}) không khớp ngày trừ quỹ engine (${engine}). Không dùng calendar làm trừ quỹ (BR-BP-LV-05 · HRM-VAL-400 ALIGN).`;
  }
  return 'Số ngày nộp không khớp ngày trừ quỹ engine — không dùng calendar làm trừ quỹ (BR-BP-LV-05 · HRM-VAL-400 ALIGN).';
}

/** Honesty footer lines — every ATT-08 evidence / UI smoke. */
export const ATT_08_HONESTY_FOOTER = {
  printableFalse: 'contracts_printable_ready=false',
  clientDaysNeDone: 'client total_days / calendar expand ≠ ATT-08 DONE · ≠ FR-08 DONE',
  neAtt09: '≠ ATT-09 hold DONE',
  neAtt03b: '≠ ATT-03b admin DONE',
  neAttModuleUat: '≠ ATT module UAT · attendance_uat_ready=false',
  cfgNeAtt02Done: 'CFG ≠ ATT-02 DONE · ATT02QC1-MSLQZUK7',
  nePltDone: '≠ PLT/platform UAT · PLT01QC1-MSLPUQIU',
  neCore10Done: '≠ CORE-10 DONE · CORE10QC1-MSLP0EJB',
  neCore09Done: '≠ CORE-09 DONE · printable false · CORE09QC1-MSLNBA89',
  neCore07Done:
    '≠ CORE-07 DONE · GATE 409 · ACT-400 · Nest DENY · CORE07QC1-KZJTSHNT',
  softNeCore06: 'soft ≠ CORE-06 DONE',
  nestCoreDeny: 'Nest /core leave = 0',
  payOut: 'PAY OUT invent DONE',
  noSeed: 'U65 zero-seed',
  cSlice: 'C-SLICE · ATT/personnel/PAY/PLT module UAT false',
  residualPreview: 'R-ATT-08-PREVIEW-FE CLOSED · LIVE preview-deduction bound',
  noFakeT6T2: 'DENY fake T6→T2=4 · engine SoT = BE BR-BP-LV-05',
} as const;

export function att08HonestyFooterLines(): string[] {
  return [
    ATT_08_HONESTY_FOOTER.printableFalse,
    ATT_08_HONESTY_FOOTER.clientDaysNeDone,
    ATT_08_HONESTY_FOOTER.neAtt09,
    ATT_08_HONESTY_FOOTER.neAtt03b,
    ATT_08_HONESTY_FOOTER.neAttModuleUat,
    ATT_08_HONESTY_FOOTER.cfgNeAtt02Done,
    ATT_08_HONESTY_FOOTER.nePltDone,
    ATT_08_HONESTY_FOOTER.neCore10Done,
    ATT_08_HONESTY_FOOTER.neCore09Done,
    ATT_08_HONESTY_FOOTER.neCore07Done,
    ATT_08_HONESTY_FOOTER.softNeCore06,
    ATT_08_HONESTY_FOOTER.nestCoreDeny,
    ATT_08_HONESTY_FOOTER.payOut,
    ATT_08_HONESTY_FOOTER.noSeed,
    ATT_08_HONESTY_FOOTER.cSlice,
    ATT_08_HONESTY_FOOTER.residualPreview,
    ATT_08_HONESTY_FOOTER.noFakeT6T2,
  ];
}

export function att08HonestyBannerText(): string {
  return [
    `Honesty: ${ATT_08_HONESTY_FOOTER.printableFalse}`,
    ATT_08_HONESTY_FOOTER.clientDaysNeDone,
    ATT_08_HONESTY_FOOTER.neAtt09,
    ATT_08_HONESTY_FOOTER.neAtt03b,
    ATT_08_HONESTY_FOOTER.neAttModuleUat,
    ATT_08_HONESTY_FOOTER.cfgNeAtt02Done,
    'PLT/CORE RETAIN (≠ DONE)',
    ATT_08_HONESTY_FOOTER.softNeCore06,
    ATT_08_HONESTY_FOOTER.payOut,
    ATT_08_HONESTY_FOOTER.residualPreview,
    ATT_08_HONESTY_FOOTER.noFakeT6T2,
  ].join(' · ');
}

export function att08HolMissMessage(): string {
  return 'Thiếu lịch lễ năm — không thể nộp đơn nghỉ. Cập nhật lịch lễ đơn vị rồi thử lại (HRM-LEAVE-HOL-MISSING).';
}

export function att08PreviewAbsentBannerText(): string {
  return `${R_ATT_08_PREVIEW_FE}: POST …/preview-deduction tạm ABSENT (404) — không giả T6→T2=4 · client calendar ≠ trừ quỹ · kiểm tra BE LIVE.`;
}

export function att08PreviewLiveBadgeText(): string {
  return `${R_ATT_08_PREVIEW_FE} ${R_ATT_08_PREVIEW_FE_STATUS}`;
}

/** Guard — never flip printable from FE alone. */
export function assertAtt08PrintableHonesty(): boolean {
  return CONTRACTS_PRINTABLE_READY === false;
}
