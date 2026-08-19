/**
 * @CODE-MEMORY
 * Screen:     EmployeeProfile — strip xác nhận quỹ + ca sau Hoạt động (ATT-12)
 * UC:         UC-BP-ATT-12 · FR-UC-BP-ATT-12 · BR-BP-LC-03 · J-HRM-ATT-12-05
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-12 Luồng #4
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-ATT-12-CLUSTER-API-01.md §4.3 panel · AC-ATT-12-FE-CONFIRM
 * Purpose:    Path lock + honesty for HCNS read-only confirm strip; DENY merge buckets; ≠ FR-12 DONE.
 * WorkItem:   PO-HRM-MVP-GD1-ATT-12-CLUSTER-FE-01
 * Coded:      2026-08-10
 * Callers:    EmployeeActivateEnrollConfirmStrip · source tests
 * Callees:    ATT_LEAVE_09_PATH_ASSERT (panel) · ATT_LEAVE_05/06/07 peer seals
 * must_keep:  ATT07QC1 · ATT06QC1 · ATT05QC1 · ATT09QC1 · CORE07QC1 · Nest /core DENY ·
 *             DENY merge sick/compensatory/carry→annual · U65 · C-SLICE · printable false
 * SOLID:      Pure helpers — no invent enroll DONE · no merge panel buckets
 * LastVerified: attLeave12Ring.test.ts · poHrmMvpGd1Att12ClusterFe01.source.test.ts
 */

import { ATT_LEAVE_05B_PATH_ASSERT } from '@/lib/attLeave05bRing';
import { ATT_05_PANEL_CARRY_LEAVE_TYPE } from '@/lib/attLeave05Ring';
import { ATT_06_COMPENSATORY_BUCKET } from '@/lib/attLeave06Ring';

export const R_ATT_12_FE_CONFIRM = 'R-ATT-12-FE-CONFIRM' as const;
export const R_ATT_12_NEQ_DONE = 'R-ATT-12-≠-FR-12-DONE' as const;

export const ATT_LEAVE_12_PATH_ASSERT = {
  leaveBalancePanel: ATT_LEAVE_05B_PATH_ASSERT.leaveBalancePanel,
  activateDefaultShift:
    '/api/hrm/attendance/shift-assignments/activate-default',
  employeesActivate: '/api/hrm/employees/',
  nestCoreDenied: ATT_LEAVE_05B_PATH_ASSERT.nestCoreDenied,
  inventHoldTableDenied: ATT_LEAVE_05B_PATH_ASSERT.inventHoldTableDenied,
} as const;

export const ATT_12_HONESTY_FOOTER =
  'attendance_uat_ready=false · ≠ ATT-12 / FR-12 DONE · ≠ ATT-07/06/05/05b/04 DONE · ≠ ATT UAT · C-SLICE' as const;

export const ATT_12_MERGE_BUCKETS_DENIED =
  'DENY merge compensatory/carry/sick→annual' as const;

export function att12HonestyBannerText(): string {
  return [
    'C-SLICE ATT-12 — strip xác nhận quỹ (GET panel) + ca mặc định sau Hoạt động.',
    `${R_ATT_12_NEQ_DONE} — emit hoặc panel 200 alone ≠ FR-12 DONE.`,
    ATT_12_MERGE_BUCKETS_DENIED,
    ATT_12_HONESTY_FOOTER,
  ].join(' ');
}

export function att12MustKeepSealLines(): string[] {
  return [
    'CORE07QC1-KZJTSHNT emit-only',
    'ATT07QC1-MSM9GWC1 · DENY reopen J-07',
    'ATT06QC1-MSM84GWC1 · J-06-04 compensatory sep',
    'ATT05QC1-MSM52GWC1 carry sep',
    'ATT09QC1-MSLUTL9D pending_days',
    `peer ${ATT_05_PANEL_CARRY_LEAVE_TYPE} ≠ annual`,
    `peer ${ATT_06_COMPENSATORY_BUCKET} ≠ annual`,
    ATT_12_MERGE_BUCKETS_DENIED,
  ];
}

export type ActivateDefaultShiftDisplay = {
  assignmentId: string | null;
  shiftId: string | null;
  shiftCode: string | null;
  shiftName: string | null;
  effectiveFrom: string | null;
  source: string | null;
};

export function formatActivateDefaultShiftSummaryVi(
  row: ActivateDefaultShiftDisplay | null | undefined,
): string {
  if (!row?.shiftId && !row?.assignmentId) {
    return 'Chưa có ca mặc định (activate_default) — kiểm tra catalog ca và rule ATT-02.';
  }
  const label =
    row.shiftName?.trim() ||
    row.shiftCode?.trim() ||
    row.shiftId?.trim() ||
    '—';
  const from = row.effectiveFrom?.trim();
  return from ? `${label} · hiệu lực ${from}` : label;
}
