/**
 * @CODE-MEMORY
 * Screen:     ATT-06 — Phép bù OT · panel compensatory · OT comp policy · approve accrual
 * UC:         UC-BP-ATT-06 · FR-UC-BP-ATT-06 · BR-BP-LV-03
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-06
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-ATT-06-CLUSTER-API-01.md §4.1 · §4.5 · §4.8
 * API_DESIGN: GET/PUT ot-comp-leave-policy · ot-comp-types/effective · leave-balance/panel
 * Purpose:    Path lock + type-map ot_comp → compensatory bucket · peer ATT05BQC1 panel parity;
 *             DENY merge compensatory into annual · ≠ FR-06 DONE.
 * WorkItem:   PO-HRM-MVP-GD1-ATT-06-CLUSTER-FE-01
 * Coded:      2026-08-10
 * Callers:    LeaveTab · AttOtCompLeavePolicySettingsPanel · OvertimeRequestTab (invalidate)
 * Callees:    ATT_LEAVE_05B_PATH_ASSERT (panel paths)
 * must_keep:  ATT05BQC1-MSM5SDQC1 · ATT09QC1 pending_days · Nest /core DENY · U65 · C-SLICE
 * SOLID:      Pure helpers — no accrual formula on FE
 * LastVerified: attLeave06Ring.test.ts · poHrmMvpGd1Att06ClusterFe01.source.test.ts
 */

import { ATT_LEAVE_05B_PATH_ASSERT } from '@/lib/attLeave05bRing';
import { MVP_LEAVE_BALANCE_TYPE_CODES } from '@/lib/leaveBalance';

export const ATT_LEAVE_06_PATH_ASSERT = {
  leaveBalancePanel: ATT_LEAVE_05B_PATH_ASSERT.leaveBalancePanel,
  otCompTypesEffective: '/api/hrm/attendance/ot-comp-types/effective',
  otCompLeavePolicy: '/api/hrm/attendance/ot-comp-leave-policy',
  overtimeRequests: '/api/hrm/attendance/overtime-requests',
  nestCoreDenied: ATT_LEAVE_05B_PATH_ASSERT.nestCoreDenied,
  inventHoldTableDenied: ATT_LEAVE_05B_PATH_ASSERT.inventHoldTableDenied,
} as const;

export const ATT_06_COMPENSATORY_BUCKET = 'compensatory' as const;
export const ATT_06_COMPENSATORY_LABEL_VI = 'Phép bù OT' as const;
export const ATT_06_OT_COMP_CATEGORY = 'ot_comp' as const;

/** Khớp BE ATT_OT_COMP_LEAVE_ACCRUE_DEFAULT_CODES — mã compensation_type map accrual khi maps_comp_codes unset. */
export const ATT_OT_COMP_LEAVE_ACCRUE_DEFAULT_CODES = ['compensatory_leave', 'compensatory'] as const;

/** Mã loại phép chuẩn category ot_comp (R-ATT-06-TYPE-MAP). */
export const ATT_06_OT_COMP_LEAVE_TYPE_KEY = 'ot_comp_leave' as const;

export const ATT_06_OT_COMP_LEAVE_TYPE_NAME_VI = 'Nghỉ bù OT' as const;

export const ATT_06_OT_COMP_TYPE_CODE = 'compensatory_leave' as const;

export const ATT_06_OT_COMP_TYPE_NAME_VI = 'Nghỉ bù OT (chi trả)' as const;

export function isOtCompAccrualMappableCode(code: string | null | undefined): boolean {
  const c = (code ?? '').trim().toLowerCase();
  if (!c) return false;
  return (ATT_OT_COMP_LEAVE_ACCRUE_DEFAULT_CODES as readonly string[]).includes(c);
}

export function effectiveHasOtCompLeaveCategory(
  items: readonly { category?: string | null; leaveTypeKey?: string }[],
): boolean {
  return items.some(
    (row) => (row.category ?? '').trim().toLowerCase() === ATT_06_OT_COMP_CATEGORY,
  );
}

/** Ưu tiên mã map accrual; fallback option đầu catalog. */
export function pickPreferredOtCompTypeCode(
  codes: readonly string[],
): string {
  const normalized = codes.map((c) => c.trim()).filter(Boolean);
  for (const preferred of ATT_OT_COMP_LEAVE_ACCRUE_DEFAULT_CODES) {
    const hit = normalized.find((c) => c.toLowerCase() === preferred);
    if (hit) return hit;
  }
  return normalized[0] ?? '';
}

export function buildPolicyMapsCompCodes(effectiveCompCodes: readonly string[]): string[] | null {
  const codes = effectiveCompCodes.map((c) => c.trim().toLowerCase()).filter(Boolean);
  if (codes.length === 0) return null;
  const hasDefault = codes.some((c) => isOtCompAccrualMappableCode(c));
  if (hasDefault) return null;
  return [...new Set(codes)];
}

export const R_ATT_06_PANEL_FE = 'R-ATT-06-PANEL-FE' as const;
export const R_ATT_06_OT_PICKER = 'R-ATT-06-OT-PICKER' as const;
export const R_ATT_06_POLICY = 'R-ATT-06-POLICY' as const;
export const R_ATT_06_ACCRUE = 'R-ATT-06-ACCRUE' as const;
export const R_ATT_06_NEQ_DONE = 'R-ATT-06-≠-FR-06-DONE' as const;

export const ATT_06_HONESTY_FOOTER =
  'attendance_uat_ready=false · ≠ ATT-06 / FR-06 DONE · ≠ ATT-05b DONE · peer ATT05BQC1 compensatory · C-SLICE' as const;

export function att06HonestyBannerText(): string {
  return [
    'C-SLICE ATT-06 — quỹ compensatory tách annual/carry · approve OT → accrual BE · panel «Phép bù OT».',
    `${R_ATT_06_NEQ_DONE} — panel/catalog alone ≠ FR-06 DONE.`,
    'Giữ parity ATT-05b / ATT05QC1 panel path — không gộp compensatory→annual.',
    ATT_06_HONESTY_FOOTER,
  ].join(' ');
}

type EffectiveLeaveTypeLike = {
  leaveTypeKey: string;
  category?: string | null;
  nameVi?: string | null;
};

function normalizeLeaveTypeKey(raw: string | null | undefined): string {
  return (raw ?? '').trim().toLowerCase();
}

/** Known catalog keys / aliases for «Nghỉ bù OT» (J-05 att-06-form-panel). */
export function isKnownOtCompLeaveTypeKey(leaveTypeKey: string | null | undefined): boolean {
  const key = normalizeLeaveTypeKey(leaveTypeKey);
  if (!key) return false;
  if (key === ATT_06_COMPENSATORY_BUCKET) return true;
  if (key === ATT_06_OT_COMP_CATEGORY) return true;
  if (key === ATT_06_OT_COMP_LEAVE_TYPE_KEY) return true;
  return false;
}

function effectiveRowMatchesOtCompLeave(row: EffectiveLeaveTypeLike): boolean {
  const category = (row.category ?? '').trim().toLowerCase();
  if (category === ATT_06_OT_COMP_CATEGORY) return true;
  const name = (row.nameVi ?? '').trim().toLowerCase();
  if (!name) return false;
  return (
    name.includes('nghỉ bù') ||
    name.includes('phep bu ot') ||
    name === ATT_06_OT_COMP_LEAVE_TYPE_NAME_VI.toLowerCase() ||
    name === ATT_06_COMPENSATORY_LABEL_VI.toLowerCase()
  );
}

/**
 * Map loại phép catalog → bucket panel (R-ATT-06-TYPE-MAP).
 * ot_comp category → deduct/compensatory row; không gộp vào annual.
 */
export function resolveLeaveBalanceBucketForLeaveType(
  leaveTypeKey: string | null | undefined,
  effectiveItems: readonly EffectiveLeaveTypeLike[],
): string {
  const key = normalizeLeaveTypeKey(leaveTypeKey);
  if (!key) return 'annual';
  if (isKnownOtCompLeaveTypeKey(key)) return ATT_06_COMPENSATORY_BUCKET;
  const row = effectiveItems.find((i) => normalizeLeaveTypeKey(i.leaveTypeKey) === key);
  if (row && effectiveRowMatchesOtCompLeave(row)) return ATT_06_COMPENSATORY_BUCKET;
  const category = (row?.category ?? '').trim().toLowerCase();
  if (category === ATT_06_OT_COMP_CATEGORY) return ATT_06_COMPENSATORY_BUCKET;
  if ((MVP_LEAVE_BALANCE_TYPE_CODES as readonly string[]).includes(key)) return key;
  return key;
}

export function isOtCompLeaveTypeSelected(
  leaveTypeKey: string | null | undefined,
  effectiveItems: readonly EffectiveLeaveTypeLike[],
): boolean {
  if (isKnownOtCompLeaveTypeKey(leaveTypeKey)) return true;
  const key = normalizeLeaveTypeKey(leaveTypeKey);
  if (!key) return false;
  const row = effectiveItems.find((i) => normalizeLeaveTypeKey(i.leaveTypeKey) === key);
  return Boolean(row && effectiveRowMatchesOtCompLeave(row));
}
