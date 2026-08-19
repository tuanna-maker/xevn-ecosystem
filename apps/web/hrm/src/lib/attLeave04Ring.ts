/**
 * @CODE-MEMORY
 * Screen:     /attendance → Cài đặt Loại phép + Quy tắc quỹ · Nghỉ phép grant/panel (ATT-04)
 * UC:         UC-BP-ATT-04 · FR-UC-BP-ATT-04 · J-HRM-ATT-04-01..06
 * BR:         BR-BP-LV-01 · BR-BP-LV-TYPE-01 · ATT-04-PATH/RULE-SOLE/ENGINE/FY/HOLD-DUAL
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-04 Diễn biến #0a · #1 · #2
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-ATT-04-CLUSTER-API-01.md
 *             F-ATT-CAT-LVT/EFF · F-ATT-LVRULE-01..04 · PUT tracked-entitlement · peer ATT-09 panel
 * Purpose:    Path lock + statusLabelVi FE-derive + honesty footers — bind LIVE LVT/LVRULE/grant;
 *             DENY Nest /core · invent att_leave_hold · claim L1/LVRULE/grant=ATT-04 DONE ·
 *             F-ATT-LEAVE-04 LIVE · FY LIVE · ATT UAT · CFG=ATT-02 · invent PAY/printable.
 * WorkItem:   PO-HRM-MVP-GD1-ATT-04-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    AttLeaveTypeSettingsPanel · AttLeaveAccrualPolicySettingsPanel ·
 *             AttLeaveTrackedEntitlementGrantPanel · source tests
 * Callees:    contractLegalPrintConstants · ATT_LEAVE_09_PATH_ASSERT (peer panel)
 * must_keep:  ATT03DQC1-MSM1CR19 GPS · ATT09QC1-MSLUTL9D pending_days · ATT peers seals ·
 *             Nest /core DENY · DENY att_leave_hold · R-ATT-04-FY HOLD · R-ATT-04-ENGINE HOLD ·
 *             physical /attendance/* · U65 · C-SLICE · printable false
 * SOLID:      Pure helpers — no Settings/attendance_rules sole accrual SoT
 * LastVerified: attLeave04Ring.test.ts · poHrmMvpGd1Att04ClusterFe01.source.test.ts
 */

import { CONTRACTS_PRINTABLE_READY } from '@/lib/contractLegalPrintConstants';
import { ATT_LEAVE_09_PATH_ASSERT } from '@/lib/attLeave09Ring';

/** Physical SoT paths — Network MUST contain; Nest /core leave SoT = FAIL O8. */
export const ATT_LEAVE_04_PATH_ASSERT = {
  leaveTypes: '/api/hrm/attendance/leave-types',
  leaveTypesEffective: '/api/hrm/attendance/leave-types/effective',
  leaveAccrualPolicies: '/api/hrm/attendance/leave-accrual-policies',
  leaveAccrualPoliciesEffective: '/api/hrm/attendance/leave-accrual-policies/effective',
  trackedEntitlement: '/api/hrm/attendance/leave-balance/tracked-entitlement',
  leaveBalancePanel: ATT_LEAVE_09_PATH_ASSERT.leaveBalancePanel,
  leaveBalance: ATT_LEAVE_09_PATH_ASSERT.leaveBalance,
  /** HOLD — no LIVE accrue job in GĐ1. */
  accrueJobDenied: '/api/hrm/attendance/leave-balances/accrue',
  nestCoreDenied: '/api/hrm/core/',
  inventHoldTableDenied: 'att_leave_hold',
} as const;

export const R_ATT_04_POLICY_ADM = 'R-ATT-04-POLICY-ADM' as const;
export const R_ATT_04_FY = 'R-ATT-04-FY' as const;
export const R_ATT_04_ENGINE = 'R-ATT-04-ENGINE' as const;
export const R_ATT_04_TYPE_ADMIN = 'R-ATT-04-TYPE-ADMIN' as const;
export const R_ATT_04_GRANT = 'R-ATT-04-GRANT' as const;

export const ATT_04_LVT_STATUS_LABELS_VI: Record<string, string> = {
  active: 'Đang dùng',
  inactive: 'Ngừng',
  retired: 'Đã thu hồi',
  draft: 'Nháp',
};

export const ATT_04_LVRULE_STATUS_LABELS_VI: Record<string, string> = {
  active: 'Đang hiệu lực',
  retired: 'Đã ngừng',
};

export const ATT_04_ACCRUAL_MODE_LABELS_VI: Record<string, string> = {
  year_start_grant: 'Cấp đầu năm',
  month_end_accrual: 'Tích lũy cuối tháng',
  after_6_months: 'Sau 6 tháng',
  manual_only: 'Chỉ cấp thủ công',
  other: 'Khác',
};

export const ATT_04_HONESTY_FOOTER =
  'attendance_uat_ready=false · ≠ ATT-04 DONE · ≠ ATT module UAT · FY HOLD · ENGINE HOLD · PAY OUT · printable false' as const;

export function deriveAtt04LvtStatusLabelVi(
  status: string | null | undefined,
  wire?: string | null,
): string {
  const fromWire = wire?.trim();
  if (fromWire) return fromWire;
  const key = (status ?? '').trim().toLowerCase();
  return ATT_04_LVT_STATUS_LABELS_VI[key] ?? (key ? key : '—');
}

export function deriveAtt04LvRuleStatusLabelVi(
  status: string | null | undefined,
  wire?: string | null,
): string {
  const fromWire = wire?.trim();
  if (fromWire) return fromWire;
  const key = (status ?? '').trim().toLowerCase();
  return ATT_04_LVRULE_STATUS_LABELS_VI[key] ?? (key ? key : '—');
}

export function deriveAtt04AccrualModeLabelVi(
  mode: string | null | undefined,
  wire?: string | null,
): string {
  const fromWire = wire?.trim();
  if (fromWire) return fromWire;
  const key = (mode ?? '').trim().toLowerCase();
  return ATT_04_ACCRUAL_MODE_LABELS_VI[key] ?? (key ? key : '—');
}

export function isPhysicalAtt04Path(path: string): boolean {
  const p = path.trim();
  return (
    p.includes('/api/hrm/attendance/leave-types') ||
    p.includes('/api/hrm/attendance/leave-accrual-policies') ||
    p.includes('/api/hrm/attendance/leave-balance')
  );
}

export function isForbiddenAtt04SotPath(path: string): boolean {
  const p = path.trim();
  if (!p.includes('/api/hrm/')) return false;
  if (p.includes(ATT_LEAVE_04_PATH_ASSERT.nestCoreDenied) && p.includes('leave')) {
    return true;
  }
  return false;
}

export function att04HonestyBannerText(): string {
  return [
    'C-SLICE ATT-04 — catalog LVT + quy tắc quỹ LVRULE + cấp entitled (HR).',
    '≠ ATT-04 DONE · ≠ L1/LVRULE/grant alone · FY/engine HOLD · U65 zero-seed.',
    ATT_04_HONESTY_FOOTER,
  ].join(' ');
}

export function att04HonestyFooterLines(): string[] {
  return [
    ATT_04_HONESTY_FOOTER,
    `printable=${CONTRACTS_PRINTABLE_READY}`,
    `${R_ATT_04_FY}=HOLD`,
    `${R_ATT_04_ENGINE}=HOLD`,
    `peer=${ATT_LEAVE_09_PATH_ASSERT.inventHoldTableDenied} DENY dual`,
  ];
}

export function assertAtt04PrintableHonesty(): void {
  if (CONTRACTS_PRINTABLE_READY) {
    throw new Error('ATT-04 honesty: contracts_printable_ready must stay false this seat');
  }
}

export type Att04AccrualPolicyDisplay = {
  policyId: string;
  leaveTypeKey: string;
  leaveTypeNameVi: string;
  version: number;
  effectiveFrom: string;
  effectiveTo: string | null;
  accrualMode: string;
  accrualModeLabelVi: string;
  annualDays: number;
  unit: string;
  status: string;
  statusLabelVi: string;
};

export function parseAtt04AccrualPolicyDisplay(row: Record<string, unknown>): Att04AccrualPolicyDisplay {
  const id = String(row.id ?? '');
  const leaveTypeKey = String(row.leaveTypeKey ?? row.leave_type_key ?? '');
  const leaveTypeNameVi = String(
    row.leaveTypeNameVi ?? row.leave_type_name_vi ?? leaveTypeKey,
  );
  const version = Number(row.version ?? 1) || 1;
  const effectiveFrom = String(row.effectiveFrom ?? row.effective_from ?? '');
  const effectiveToRaw = row.effectiveTo ?? row.effective_to;
  const effectiveTo =
    effectiveToRaw == null || effectiveToRaw === '' ? null : String(effectiveToRaw);
  const accrualMode = String(row.accrualMode ?? row.accrual_mode ?? '');
  const accrualModeLabelVi = deriveAtt04AccrualModeLabelVi(
    accrualMode,
    (row.accrualModeLabel ?? row.accrual_mode_label_vi) as string | null,
  );
  const annualDays = Number(row.annualDays ?? row.annual_days ?? 0) || 0;
  const unit = String(row.unit ?? 'day');
  const status = String(row.status ?? 'active');
  const statusLabelVi = deriveAtt04LvRuleStatusLabelVi(
    status,
    (row.statusLabelVi ?? row.statusLabel ?? row.status_label_vi) as string | null,
  );
  return {
    policyId: id,
    leaveTypeKey,
    leaveTypeNameVi,
    version,
    effectiveFrom,
    effectiveTo,
    accrualMode,
    accrualModeLabelVi,
    annualDays,
    unit,
    status,
    statusLabelVi,
  };
}
