/**
 * @CODE-MEMORY
 * Screen:     ATT-05b — panel quỹ trên form đơn nghỉ (consumer bind)
 * UC:         UC-BP-ATT-05b · FR-UC-BP-ATT-05b · BR-BP-LV-PANEL-01 · J-HRM-ATT-05B-01..06
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-05b
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-ATT-05B-CLUSTER-SA-01.md · BA-01 O1–O18
 * Purpose:    Path lock + submit-form panel consumer stamps (picker · refetch · hold · empty · overlap peer · advance hint);
 *             DENY merge carry→annual · DENY att_leave_hold · ≠ FR-05b/ATT UAT DONE.
 * WorkItem:   PO-HRM-MVP-GD1-ATT-05B-CLUSTER-FE-01
 * Coded:      2026-08-10
 * Callers:    LeaveTab create dialog · source tests
 * Callees:    ATT_LEAVE_09_PATH_ASSERT (panel paths) · ATT_LEAVE_05_PANEL_CARRY_LEAVE_TYPE (peer ATT-05)
 * must_keep:  ATT05QC1-MSM52GWC1 · ATT04BQC1-MSM3S8QC1 · ATT04QC1-MSM22G4W · ATT09QC1-MSLUTL9D · ATT03DQC1 ·
 *             Nest /core DENY · DENY att_leave_hold · DENY merge carry→annual · U65 · C-SLICE · printable false
 * SOLID:      Pure helpers — no invent hold ledger · no merge carry into annual display
 * LastVerified: attLeave05bRing.test.ts · poHrmMvpGd1Att05bClusterFe01.source.test.ts
 */

import { ATT_05_PANEL_CARRY_LEAVE_TYPE } from '@/lib/attLeave05Ring';
import { ATT_LEAVE_09_PATH_ASSERT } from '@/lib/attLeave09Ring';
import { ATT_LEAVE_08_PATH_ASSERT } from '@/lib/attLeaveRing';

export const ATT_LEAVE_05B_PATH_ASSERT = {
  leaveBalancePanel: ATT_LEAVE_09_PATH_ASSERT.leaveBalancePanel,
  leaveBalanceByType: ATT_LEAVE_09_PATH_ASSERT.leaveBalance,
  leaveTypesEffective: '/api/hrm/attendance/leave-types/effective',
  previewDeduction: ATT_LEAVE_08_PATH_ASSERT.previewDeduction,
  leaveRequests: ATT_LEAVE_09_PATH_ASSERT.leaveRequests,
  nestCoreDenied: ATT_LEAVE_09_PATH_ASSERT.nestCoreDenied,
  inventHoldTableDenied: ATT_LEAVE_09_PATH_ASSERT.inventHoldTableDenied,
} as const;

export const R_ATT_05B_PANEL_FE = 'R-ATT-05B-PANEL-FE' as const;
export const R_ATT_05B_PICKER = 'R-ATT-05B-PICKER' as const;
export const R_ATT_05B_HOLD_UI = 'R-ATT-05B-HOLD-UI' as const;
export const R_ATT_05B_EMPTY = 'R-ATT-05B-EMPTY' as const;
export const R_ATT_05B_OVERLAP = 'R-ATT-05B-OVERLAP' as const;
export const R_ATT_05B_ADV_HINT = 'R-ATT-05B-ADV-HINT' as const;
export const R_ATT_05B_FY_FOOTER = 'R-ATT-05B-FY-FOOTER' as const;
export const R_ATT_05B_DEDUCT_FOOTER = 'R-ATT-05B-DEDUCT-FOOTER' as const;
export const R_ATT_05B_NEQ_API_DONE = 'R-ATT-05B-≠-API-DONE' as const;

export const ATT_05B_HONESTY_FOOTER =
  'attendance_uat_ready=false · ≠ ATT-05b / FR-05b DONE · ≠ ATT-05/04/04b DONE · ≠ ATT UAT · C-SLICE' as const;

export const ATT_05B_EMPTY_CATALOG_HINT_VI =
  'Chưa có loại phép hiệu lực. HCNS cần cấu hình danh mục Loại phép ATT (Cài đặt) hoặc đồng bộ từ XBOS — không tự bịa mã trên form (SRS #0b).';

export function att05bHonestyBannerText(): string {
  return [
    'C-SLICE ATT-05b — panel quỹ trên form đơn nghỉ · GET panel/by-type · pending_days hold · carry_over bucket tách annual.',
    `${R_ATT_05B_NEQ_API_DONE} — endpoint 200 alone ≠ FR-05b DONE.`,
    ATT_05B_HONESTY_FOOTER,
  ].join(' ');
}

export function att05bResidualHoldFooterLines(): string[] {
  return [
    `${R_ATT_05B_FY_FOOTER}=HOLD balance_year calendar interim`,
    `${R_ATT_05B_DEDUCT_FOOTER}=HOLD R-ATT-05-DEDUCT annual vs carry order`,
    `${R_ATT_05B_PANEL_FE}=RETAIN create form wire`,
    `${R_ATT_05B_HOLD_UI}=RETAIN post-submit invalidate+F5`,
    `peer ${ATT_05_PANEL_CARRY_LEAVE_TYPE}=separate bucket — DENY merge annual`,
    `peer ${ATT_LEAVE_05B_PATH_ASSERT.inventHoldTableDenied} DENY`,
    'ATT05QC1-MSM52GWC1 must_keep',
    'ATT09QC1-MSLUTL9D pending_days',
  ];
}

export type Att05bAdvanceHintInput = {
  availableDays: number | null;
  requestedDays: number | null;
  allowsAdvance: boolean;
};

/**
 * Footer gợi ý ứng/không lương khi hết hoặc vượt quỹ (peer ATT-04b · ≠ FR-04b DONE).
 */
export function att05bAdvanceHintMessage(input: Att05bAdvanceHintInput): string | null {
  const available = input.availableDays;
  const requested = input.requestedDays;
  if (available == null || requested == null || requested <= 0) return null;
  if (requested <= available) return null;
  if (input.allowsAdvance) {
    return `Số ngày nghỉ (${requested}) vượt quỹ khả dụng (${available}). Có thể chọn ứng phép nếu chính sách cho phép (peer ATT-04b — nhánh balance_resolution HOLD khi BE chưa bật).`;
  }
  return `Số ngày nghỉ (${requested}) vượt quỹ khả dụng (${available}). Gợi ý: giảm số ngày, chọn loại không lương/ứng (nếu HCNS bật allows_advance), hoặc liên hệ HCNS.`;
}

export function att05bShouldShowEmptyCatalogHint(
  catalogLoading: boolean,
  catalogError: boolean,
  optionCount: number,
): boolean {
  if (catalogLoading || catalogError) return false;
  return optionCount === 0;
}
