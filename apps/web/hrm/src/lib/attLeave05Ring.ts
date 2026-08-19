/**
 * @CODE-MEMORY
 * Screen:     ATT-05 — phép chuyển kỳ (carry_over) catalog · panel · LVRULE · ledger tách
 * UC:         UC-BP-ATT-05 · FR-UC-BP-ATT-05 · BR-BP-LV-02 · J-HRM-ATT-05-01..06
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-05
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-ATT-05-CLUSTER-API-01.md §4.1–4.4
 * Purpose:    Path lock + panel bucket «Phép chuyển kỳ» + policy carry metadata + honesty/HOLD footers;
 *             DENY merge carry into annual UI · DENY att_leave_hold · FY/ENGINE HOLD.
 * WorkItem:   PO-HRM-MVP-GD1-ATT-05-CLUSTER-FE-01
 * Coded:      2026-08-10
 * Callers:    LeaveTab · AttLeaveTypeSettingsPanel · AttLeaveAccrualPolicySettingsPanel ·
 *             AttLeaveTrackedEntitlementGrantPanel · source tests
 * Callees:    ATT_LEAVE_04_PATH_ASSERT · ATT_LEAVE_04B_PANEL_BUCKET_LABELS_VI (peer)
 * must_keep:  ATT04QC1-MSM22G4W · ATT04BQC1-MSM3S8QC1 · ATT09QC1-MSLUTL9D · ATT03DQC1 ·
 *             Nest /core DENY · DENY att_leave_hold · ≠ FR-05 DONE · U65 · C-SLICE · printable false
 * SOLID:      Pure helpers — no invent rollover/expire job · no merge annual entitled
 * LastVerified: attLeave05Ring.test.ts · poHrmMvpGd1Att05ClusterFe01.source.test.ts
 */

import { ATT_LEAVE_04_PATH_ASSERT } from '@/lib/attLeave04Ring';
import { ATT_04B_PANEL_BUCKET_LABELS_VI } from '@/lib/attLeave04bRing';

export const ATT_LEAVE_05_PATH_ASSERT = {
  ...ATT_LEAVE_04_PATH_ASSERT,
  leaveFiscalConfigDenied: '/api/hrm/attendance/leave-fiscal-config',
} as const;

export const ATT_05_PANEL_CARRY_LEAVE_TYPE = 'carry_over' as const;
export const ATT_05_PANEL_CARRY_LABEL_VI = 'Phép chuyển kỳ' as const;

export const R_ATT_05_FY = 'R-ATT-05-FY' as const;
export const R_ATT_05_FY_CAL = 'R-ATT-05-FY-CAL' as const;
export const R_ATT_05_ENGINE = 'R-ATT-05-ENGINE' as const;
export const R_ATT_05_ROLLOVER = 'R-ATT-05-ROLLOVER' as const;
export const R_ATT_05_EXPIRE = 'R-ATT-05-EXPIRE' as const;
export const R_ATT_05_DEDUCT = 'R-ATT-05-DEDUCT' as const;
export const R_ATT_05_LEDGER_SEP = 'R-ATT-05-LEDGER-SEP' as const;

/** API-01 RETAIN — policy carry cols LIVE on BE; form always wired (≠ cap GAP 04b). */
export const ATT_05_CARRY_POLICY_FIELDS_API_LIVE = true;

export const ATT_05_HONESTY_FOOTER =
  'attendance_uat_ready=false · ≠ ATT-05 / FR-05 DONE · ≠ ATT-04/04b DONE · ≠ ATT UAT · C-SLICE' as const;

/** SRS-aligned vocabulary (free-text still allowed on POST). */
export const ATT_05_CARRY_EXPIRE_RULE_OPTIONS: readonly { value: string; label: string }[] = [
  { value: 'end_of_q1_next_year', label: 'Hết Q1 năm sau' },
  { value: 'forfeit_at_fy_cut', label: 'Hủy tại mốc cắt FY' },
  { value: 'carry_until_used', label: 'Dùng hết hoặc hết hạn (metadata)' },
  { value: 'manual_hr_review', label: 'HCNS xử lý thủ công (metadata)' },
] as const;

export const ATT_05_PANEL_BUCKET_LABELS_VI: Record<string, string> = {
  ...ATT_04B_PANEL_BUCKET_LABELS_VI,
  carry_over: ATT_05_PANEL_CARRY_LABEL_VI,
};

export function deriveAtt05PanelBucketLabelVi(
  leaveType: string | null | undefined,
  wireLabel?: string | null,
): string {
  const fromWire = wireLabel?.trim();
  if (fromWire) return fromWire;
  const key = (leaveType ?? '').trim().toLowerCase();
  return ATT_05_PANEL_BUCKET_LABELS_VI[key] ?? (key || '—');
}

export function isCarryOverLeaveTypeKey(leaveType: string | null | undefined): boolean {
  return (leaveType ?? '').trim().toLowerCase() === ATT_05_PANEL_CARRY_LEAVE_TYPE;
}

export type Att05CarryPolicyWire = {
  carryOverExpireRule: string | null;
  carryCapDays: number | null;
  carryOverExpireRuleLabelVi: string | null;
};

export function parseAtt05CarryPolicyFromPolicyRow(
  row: Record<string, unknown> | null | undefined,
): Att05CarryPolicyWire | null {
  if (!row) return null;
  const ruleRaw = row.carryOverExpireRule ?? row.carry_over_expire_rule;
  const capRaw = row.carryCapDays ?? row.carry_cap_days;
  const labelRaw = row.carryOverExpireRuleLabelVi ?? row.carry_over_expire_rule_label_vi;
  const hasRule = ruleRaw !== undefined && ruleRaw !== null && String(ruleRaw).trim() !== '';
  const hasCap = capRaw !== undefined && capRaw !== null && String(capRaw).trim() !== '';
  if (!hasRule && !hasCap) return null;
  const capNum = hasCap ? Number(capRaw) : null;
  return {
    carryOverExpireRule: hasRule ? String(ruleRaw).trim() : null,
    carryCapDays: Number.isFinite(capNum as number) ? (capNum as number) : null,
    carryOverExpireRuleLabelVi:
      labelRaw != null && String(labelRaw).trim() ? String(labelRaw).trim() : null,
  };
}

export function isAtt05CarryPolicyCrudLive(
  policies: readonly Record<string, unknown>[],
): boolean {
  if (ATT_05_CARRY_POLICY_FIELDS_API_LIVE) return true;
  return policies.some((row) => parseAtt05CarryPolicyFromPolicyRow(row) != null);
}

export function deriveAtt05CarryExpireRuleLabelVi(
  rule: string | null | undefined,
  wire?: string | null,
): string {
  const fromWire = wire?.trim();
  if (fromWire) return fromWire;
  const key = (rule ?? '').trim().toLowerCase();
  if (!key) return '—';
  const hit = ATT_05_CARRY_EXPIRE_RULE_OPTIONS.find((o) => o.value === key);
  return hit?.label ?? key;
}

export function att05HonestyBannerText(): string {
  return [
    'C-SLICE ATT-05 — loại mang sang · panel «Phép chuyển kỳ» · metadata LVRULE · hàng quỹ carry_over tách audit.',
    '≠ ATT-05 / FR-05 DONE · FY CRUD HOLD · ENGINE rollover/expire HOLD · deduct order GAP.',
    ATT_05_HONESTY_FOOTER,
  ].join(' ');
}

export function att05ResidualHoldFooterLines(): string[] {
  return [
    `${R_ATT_05_FY}=HOLD F-ATT-FY-01 until migrate+route`,
    `${R_ATT_05_FY_CAL}=GAP balance_year after FY`,
    `${R_ATT_05_ROLLOVER}=HOLD Diễn biến #1`,
    `${R_ATT_05_EXPIRE}=HOLD Diễn biến #2`,
    `${R_ATT_05_DEDUCT}=GAP annual vs carry order on submit`,
    `${R_ATT_05_LEDGER_SEP}=RETAIN separate carry_over row — DENY merge annual UI`,
    `peer ${ATT_LEAVE_04_PATH_ASSERT.inventHoldTableDenied} DENY`,
    'F-PAY-LEAVE-SETTLE=OUT',
  ];
}

export function att05LedgerSeparationNoteVi(): string {
  return 'Quỹ «Phép chuyển kỳ» (carry_over) tách riêng khỏi phép năm — cấp qua HR trên loại carry_over, không gộp vào annual (BR-BP-LV-02).';
}
