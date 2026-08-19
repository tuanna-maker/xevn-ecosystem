/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile → tab Bảo hiểm — CORE-10 BHXH lifecycle ring
 * UC:         UC-BP-CORE-10 · FR-UC-BP-CORE-10 · AC-SI-TL-01..05 · AC-CORE-10-*
 * BR:         BR-CORE-10-PATH/VOCAB/SUSPEND/≠CAT/≠ENR/≠LIVE/PAY-06-OUT/PRINTABLE
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-CORE-10 Diễn biến #1–#5 · Luồng #0a–#0f
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-CORE-10-CLUSTER-API-01.md
 *             F-CORE-SI-01/02/03 RETAIN · R-CORE-10-DISP FE-derive
 * Purpose:    Path lock + statusLabelVi FE-derive + honesty footers —
 *             DENY Nest /core SI dual · claim catalog/CRUD/LIVE = CORE-10 DONE ·
 *             invent PAY/ATT/printable/Word DONE · conflate BH Hoạt động ↔ CORE-07 ·
 *             wipe CORE-09/07 · soft=CORE-06 DONE.
 * WorkItem:   PO-HRM-MVP-GD1-CORE-10-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    EmployeeInsurance · InsuranceTimelineActionsPanel · insuranceTimelineActions · source tests
 * Callees:    contractLegalPrintConstants (printable false RETAIN) · formatDisplayDate peers
 * must_keep:  CORE09QC1 printable false · CORE07QC1 GATE/ACT · soft≠CORE-06 DONE · Nest /core DENY ·
 *             physical /employee-insurances* only · U65 zero-seed · C-SLICE
 * SOLID:      Pure helpers tách panel / hooks — no schema invent · no FE PAY formulas
 * LastVerified: empCoreSiRing.test.ts
 */

import { CONTRACTS_PRINTABLE_READY } from '@/lib/contractLegalPrintConstants';

/** Physical SoT paths (O1) — Network MUST contain; Nest /core SI = FAIL. */
export const CORE_SI_10_PATH_ASSERT = {
  list: '/api/hrm/employee-insurances',
  getById: '/api/hrm/employee-insurances/:insuranceId',
  create: '/api/hrm/employee-insurances',
  patch: '/api/hrm/employee-insurances/:insuranceId',
  delete: '/api/hrm/employee-insurances/:insuranceId',
  actions: '/api/hrm/employee-insurances/:insuranceId/actions',
  nestCoreDenied: '/api/hrm/core/',
} as const;

/** Enrollment status HOLD RETAIN (API-01 / InsuranceActionDto map). */
export const CORE_SI_ENROLLMENT_STATUSES = [
  'active',
  'pending',
  'expired',
  'suspended',
  'stopped',
  'closed',
] as const;
export type CoreSiEnrollmentStatus = (typeof CORE_SI_ENROLLMENT_STATUSES)[number];

/**
 * R-CORE-10-DISP / O3 — BH «Hoạt động» = enrollment `active` (timeline BH).
 * DENY conflate with CORE-07 employee activate CTA / employees.status=active as same SoT.
 */
export const CORE_SI_ENROLLMENT_STATUS_LABEL_VI: Record<CoreSiEnrollmentStatus, string> = {
  active: 'Hoạt động',
  pending: 'Chờ xử lý',
  expired: 'Hết hạn',
  suspended: 'Tạm hoãn',
  stopped: 'Ngừng',
  closed: 'Đóng',
};

/** Period status FE-derive when BE omits statusLabelVi (R-CORE-10-DISP). */
export const CORE_SI_PERIOD_STATUS_LABEL_VI: Record<string, string> = {
  applying: 'Đang áp dụng',
  active: 'Đang áp dụng',
  closed: 'Đã đóng',
  stopped: 'Ngừng',
  suspended: 'Tạm hoãn',
  superseded: 'Đã thay thế',
};

export function enrollmentStatusLabelFallback(status: string | null | undefined): string {
  const s = String(status ?? '')
    .trim()
    .toLowerCase();
  if ((CORE_SI_ENROLLMENT_STATUSES as readonly string[]).includes(s)) {
    return CORE_SI_ENROLLMENT_STATUS_LABEL_VI[s as CoreSiEnrollmentStatus];
  }
  return s || '—';
}

export function periodStatusLabelFallback(periodStatus: string | null | undefined): string {
  const s = String(periodStatus ?? '')
    .trim()
    .toLowerCase();
  if (CORE_SI_PERIOD_STATUS_LABEL_VI[s]) return CORE_SI_PERIOD_STATUS_LABEL_VI[s];
  return s || '—';
}

/** Prefer BE statusLabelVi; else FE-derive from status (R-CORE-10-DISP — HOLD schema invent). */
export function resolveInsuranceStatusLabelVi(
  status: string | null | undefined,
  statusLabelVi?: string | null,
): string {
  const fromBe = String(statusLabelVi ?? '').trim();
  if (fromBe) return fromBe;
  return enrollmentStatusLabelFallback(status);
}

export function resolveInsurancePeriodStatusLabelVi(
  periodStatus: string | null | undefined,
  statusLabelVi?: string | null,
): string {
  const fromBe = String(statusLabelVi ?? '').trim();
  if (fromBe) return fromBe;
  return periodStatusLabelFallback(periodStatus);
}

/** Amounts vi-VN grouping — display only; DENY invent PAY formulas. */
export function formatInsuranceAmountVi(value: number | null | undefined): string {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return Number(value).toLocaleString('vi-VN');
}

/** TRUE when path is Nest dual `/api/hrm/core/*` SI SoT (FAIL O1). */
export function isForbiddenCoreSiSotPath(path: string | null | undefined): boolean {
  const p = String(path ?? '').toLowerCase();
  if (!p.includes('/api/hrm/core/')) return false;
  return (
    p.includes('insurance') ||
    p.includes('insurer') ||
    p.includes('/si/') ||
    p.includes('employee-insurance')
  );
}

/** Physical employee-insurances family (PASS O1). */
export function isPhysicalEmployeeInsurancesPath(path: string | null | undefined): boolean {
  return String(path ?? '').includes('/employee-insurances');
}

/** Honesty footer lines — every CORE-10 evidence / UI smoke (O6/O7/O8/O9/O10). */
export const CORE_10_HONESTY_FOOTER = {
  printableFalse: 'contracts_printable_ready=false',
  catalogNeDone: 'catalog ≠ CORE-10 DONE',
  enrollmentNeDone: 'enrollment CRUD ≠ CORE-10 DONE',
  liveNeDone: 'LIVE actions ≠ module DONE without J-*',
  bhNeCore07: 'BH «Hoạt động» ≠ CORE-07 employee activate',
  nestCoreDeny: 'Nest /core SI = 0',
  core09Retain: 'CORE-09 RETAIN · printable false · ≠ CORE-09 DONE · CORE09QC1-MSLNBA89',
  core07Retain:
    'CORE-07 RETAIN · GATE 409 · ACT-400 · Nest DENY · checklist≠DONE · free PATCH≠DONE · ≠ CORE-07 DONE · CORE07QC1-KZJTSHNT',
  softNeCore06: 'soft ≠ CORE-06 DONE',
  payTl06Out: 'PAY AC-SI-TL-06 OUT invent DONE',
  wordOut: 'Word/DOCX invent OUT',
  cSlice: 'C-SLICE · personnel/CORE/SI module UAT false',
} as const;

export function core10HonestyFooterLines(): string[] {
  return [
    CORE_10_HONESTY_FOOTER.printableFalse,
    CORE_10_HONESTY_FOOTER.catalogNeDone,
    CORE_10_HONESTY_FOOTER.enrollmentNeDone,
    CORE_10_HONESTY_FOOTER.liveNeDone,
    CORE_10_HONESTY_FOOTER.bhNeCore07,
    CORE_10_HONESTY_FOOTER.nestCoreDeny,
    CORE_10_HONESTY_FOOTER.core09Retain,
    CORE_10_HONESTY_FOOTER.core07Retain,
    CORE_10_HONESTY_FOOTER.softNeCore06,
    CORE_10_HONESTY_FOOTER.payTl06Out,
    CORE_10_HONESTY_FOOTER.wordOut,
    CORE_10_HONESTY_FOOTER.cSlice,
  ];
}

/** Short UI banner — ≠DONE + BH≠CORE-07 + seals. */
export function core10HonestyBannerText(): string {
  return [
    `Honesty: ${CORE_10_HONESTY_FOOTER.printableFalse}`,
    CORE_10_HONESTY_FOOTER.catalogNeDone,
    CORE_10_HONESTY_FOOTER.enrollmentNeDone,
    CORE_10_HONESTY_FOOTER.liveNeDone,
    CORE_10_HONESTY_FOOTER.bhNeCore07,
    'CORE-09/07 RETAIN (≠ DONE)',
    CORE_10_HONESTY_FOOTER.softNeCore06,
    CORE_10_HONESTY_FOOTER.payTl06Out,
  ].join(' · ');
}

/** Guard — never flip printable from FE alone. */
export function assertCore10PrintableHonesty(): boolean {
  return CONTRACTS_PRINTABLE_READY === false;
}

/** ACTION-400 / HRM-SI-ACTION-400 surface codes (AC-SI-TL-03). */
export const CORE_SI_ACTION_ERROR_CODES = [
  'HRM-SI-ACTION-400',
  'ACTION-400',
] as const;

export function isInsuranceActionValidationError(code: string | null | undefined): boolean {
  const c = String(code ?? '').trim().toUpperCase();
  return (CORE_SI_ACTION_ERROR_CODES as readonly string[]).some(
    (k) => k.toUpperCase() === c,
  );
}
