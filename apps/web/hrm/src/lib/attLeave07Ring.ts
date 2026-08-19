/**
 * @CODE-MEMORY
 * Screen:     ATT-07 — Nghỉ ốm · cờ BH/CTY · thứ tự quỹ · phân nhánh ngày
 * UC:         UC-BP-ATT-07 · FR-UC-BP-ATT-07 · BR-BP-LV-04 · DV-16
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-07
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-ATT-07-CLUSTER-API-01.md §4.1–§4.4 · §4.7
 * API_DESIGN: F-ATT-CAT-LVT-EFF · F-ATT-LEAVE-02 · F-ATT-SICK-POLICY-ORDER · F-ATT-SICK-DAY-BRANCH
 * Purpose:    Path lock + sick picker flags + day-branch display + panel RETAIN (5 MVP, no sick bucket);
 *             DENY merge compensatory/sick/carry→annual · ≠ FR-07 DONE.
 * WorkItem:   PO-HRM-MVP-GD1-ATT-07-CLUSTER-FE-01
 * Coded:      2026-08-10
 * Callers:    LeaveTab · AttSickLeaveFundOrderSettingsPanel · source tests
 * Callees:    ATT_LEAVE_06_PATH_ASSERT · MVP_LEAVE_BALANCE_TYPES · leaveAttachment sick detect
 * must_keep:  ATT06QC1-MSM84GWC1 · ATT05BQC1-MSM5SDQC1 · ATT09QC1 pending_days · Nest /core DENY · U65 · C-SLICE
 * SOLID:      Pure helpers — allocator/policy logic on BE only
 * LastVerified: attLeave07Ring.test.ts · poHrmMvpGd1Att07ClusterFe01.source.test.ts
 */

import { ATT_LEAVE_06_PATH_ASSERT } from '@/lib/attLeave06Ring';
import { MVP_LEAVE_BALANCE_TYPE_CODES } from '@/lib/leaveBalance';
import { isSickLeaveType } from '@/lib/leaveAttachment';

export const ATT_LEAVE_07_PATH_ASSERT = {
  leaveTypesEffective: '/api/hrm/attendance/leave-types/effective',
  sickLeaveFundOrder: '/api/hrm/attendance/sick-leave-fund-order',
  leaveRequests: '/api/hrm/attendance/leave-requests',
  leaveBalancePanel: ATT_LEAVE_06_PATH_ASSERT.leaveBalancePanel,
  nestCoreDenied: ATT_LEAVE_06_PATH_ASSERT.nestCoreDenied,
  inventHoldTableDenied: ATT_LEAVE_06_PATH_ASSERT.inventHoldTableDenied,
} as const;

export const SICK_FUND_SEQUENCE_TOKENS = [
  'annual',
  'insurance',
  'company',
  'unpaid',
] as const;

export type SickFundSequenceToken = (typeof SICK_FUND_SEQUENCE_TOKENS)[number];

export const SICK_DAY_BRANCH_CODES = [
  'annual',
  'insurance',
  'company_topup',
  'unpaid',
] as const;

export type SickDayBranchCode = (typeof SICK_DAY_BRANCH_CODES)[number];

export const SICK_FUND_TOKEN_LABEL_VI: Record<SickFundSequenceToken, string> = {
  annual: 'Phép năm',
  insurance: 'Bảo hiểm (BH)',
  company: 'Công ty (CTY)',
  unpaid: 'Không lương',
};

export const SICK_DAY_BRANCH_LABEL_VI: Record<SickDayBranchCode, string> = {
  annual: 'Phép năm',
  insurance: 'Bảo hiểm (BH)',
  company_topup: 'Hỗ trợ CTY',
  unpaid: 'Không lương',
};

export const R_ATT_07_PICKER_FE = 'R-ATT-07-FE-PICKER' as const;
export const R_ATT_07_POLICY_ORDER = 'R-ATT-07-POLICY-ORDER' as const;
export const R_ATT_07_DAY_BRANCH = 'R-ATT-07-DAY-BRANCH' as const;
export const R_ATT_07_PANEL_RETAIN = 'R-ATT-07-PANEL-NO-SICK' as const;
export const R_ATT_07_NEQ_DONE = 'R-ATT-07-≠-FR-07-DONE' as const;

export const ATT_07_PROGRAM_DEFAULT_LABEL_VI =
  'Mặc định chương trình (chưa lưu cấu hình tenant)' as const;

export const ATT_07_HONESTY_FOOTER =
  'attendance_uat_ready=false · ≠ ATT-07 / FR-07 DONE · ≠ ATT UAT · C-SLICE' as const;

export function att07HonestyBannerText(): string {
  return [
    'C-SLICE ATT-07 — picker ốm từ EFF (cờ BH/CTY) · đính kèm VAL-ATT · phân nhánh ngày sau 201 khi BE allocator LIVE.',
    `${R_ATT_07_PANEL_RETAIN} — panel giữ 5 quỹ MVP, không quỹ ốm BH · DENY gộp compensatory/carry→annual (ATT06QC1).`,
    `${R_ATT_07_NEQ_DONE} — picker/attach alone ≠ FR-07 DONE.`,
    ATT_07_HONESTY_FOOTER,
  ].join(' ');
}

export function att07ResidualHoldFooterLines(): string[] {
  return [
    `${R_ATT_07_POLICY_ORDER}=GET/PUT sick-leave-fund-order`,
    `${R_ATT_07_DAY_BRANCH}=embedded POST leave-requests dayBranches[]`,
    'R-ATT-07-SHEET-CODE=HOLD writer',
    'R-ATT-07-AGG=HOLD footer ATT-10',
    'ATT06QC1-MSM84GWC1 must_keep',
    'ATT05BQC1-MSM5SDQC1 panel',
    ATT_LEAVE_07_PATH_ASSERT.inventHoldTableDenied,
  ];
}

/** Panel MVP keys — sick ∉ panel (AC-ATT-07-PANEL-NO-SICK). */
export function att07PanelMvpBucketKeys(): readonly string[] {
  return MVP_LEAVE_BALANCE_TYPE_CODES;
}

export function att07PanelExcludesSickBucket(): boolean {
  const keys = att07PanelMvpBucketKeys().map((k) => k.toLowerCase());
  return !keys.includes('sick') && !keys.includes('sick_leave');
}

export type EffectiveLeaveTypeFlagsRow = {
  leaveTypeKey: string;
  nameVi?: string | null;
  category?: string | null;
  insuranceRegimeFlag?: boolean;
  companyTopupFlag?: boolean;
};

export type SickLeaveTypeFlagsDisplay = {
  insuranceRegimeFlag: boolean;
  companyTopupFlag: boolean;
  dv16BothFlags: boolean;
};

export function resolveSickLeaveTypeFlags(
  leaveTypeKey: string | null | undefined,
  leaveTypeLabel: string | null | undefined,
  effectiveRows: readonly EffectiveLeaveTypeFlagsRow[],
): SickLeaveTypeFlagsDisplay | null {
  const key = (leaveTypeKey ?? '').trim();
  if (!key) return null;
  const row =
    effectiveRows.find((r) => r.leaveTypeKey.trim().toLowerCase() === key.toLowerCase()) ??
    null;
  const label = leaveTypeLabel ?? row?.nameVi ?? '';
  const cat = (row?.category ?? '').trim().toLowerCase();
  const isSick =
    isSickLeaveType(key, label) ||
    cat === 'sick' ||
    cat === 'om' ||
    cat === 'sick_leave';
  if (!isSick) return null;
  const insuranceRegimeFlag = Boolean(row?.insuranceRegimeFlag);
  const companyTopupFlag = Boolean(row?.companyTopupFlag);
  return {
    insuranceRegimeFlag,
    companyTopupFlag,
    dv16BothFlags: insuranceRegimeFlag && companyTopupFlag,
  };
}

export type HrmSickDayBranch = {
  calendarDate: string;
  branchCode: string;
  deductUnits: number;
  sheetDayCode?: string | null;
};

export function parseLeaveCreateDayBranches(raw: unknown): HrmSickDayBranch[] | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const branches = (raw as { dayBranches?: unknown }).dayBranches;
  if (!Array.isArray(branches) || branches.length === 0) return undefined;
  const out: HrmSickDayBranch[] = [];
  for (const item of branches) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const calendarDate = String(row.calendarDate ?? row.calendar_date ?? '').trim();
    const branchCode = String(row.branchCode ?? row.branch_code ?? '').trim();
    const unitsRaw = row.deductUnits ?? row.deduct_units ?? 0;
    const deductUnits = Number.parseFloat(String(unitsRaw));
    if (!calendarDate || !branchCode) continue;
    out.push({
      calendarDate,
      branchCode,
      deductUnits: Number.isFinite(deductUnits) ? deductUnits : 0,
      sheetDayCode:
        (row.sheetDayCode ?? row.sheet_day_code ?? null) as string | null | undefined,
    });
  }
  return out.length ? out : undefined;
}

export function sickDayBranchLabelVi(branchCode: string): string {
  const code = branchCode.trim().toLowerCase() as SickDayBranchCode;
  if ((SICK_DAY_BRANCH_CODES as readonly string[]).includes(code)) {
    return SICK_DAY_BRANCH_LABEL_VI[code];
  }
  return branchCode || '—';
}

/** Tóm tắt phân nhánh ngày sau POST 201 (J-HRM-ATT-07-03/04). */
export function formatSickDayBranchesSummary(branches: readonly HrmSickDayBranch[]): string {
  const lines = branches.map((b) => {
    const date = b.calendarDate;
    const label = sickDayBranchLabelVi(b.branchCode);
    const units =
      b.deductUnits > 0 && b.deductUnits !== 1
        ? ` (${b.deductUnits} công)`
        : '';
    return `${date}: ${label}${units}`;
  });
  return `Phân nhánh ngày ốm: ${lines.join(' · ')}`;
}

export function fundSequenceTokenLabelVi(token: string): string {
  const t = token.trim().toLowerCase() as SickFundSequenceToken;
  if ((SICK_FUND_SEQUENCE_TOKENS as readonly string[]).includes(t)) {
    return SICK_FUND_TOKEN_LABEL_VI[t];
  }
  return token || '—';
}
