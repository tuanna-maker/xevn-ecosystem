/**
 * @CODE-MEMORY
 * Screen:     ATT-04b — ứng phép catalog flag · panel advance/unpaid · balance gate · GAP cap/branch
 * UC:         UC-BP-ATT-04b · FR-UC-BP-ATT-04b · BR-BP-LV-07 · J-HRM-ATT-04B-01..06
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md Diễn biến #1 · #2
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-ATT-04B-CLUSTER-API-01.md
 * Purpose:    Path lock + panel bucket labels + balance reject parse + honesty/residual stamps;
 *             conditional LIVE detect for cap CRUD and over-balance branch (BE-01).
 * WorkItem:   PO-HRM-MVP-GD1-ATT-04B-CLUSTER-FE-01
 * Coded:      2026-08-10
 * Callers:    LeaveTab · AttLeaveAccrualPolicySettingsPanel · AttLeaveTypeSettingsPanel · source tests
 * Callees:    ATT_LEAVE_04_PATH_ASSERT · ApiClientError shape
 * must_keep:  ATT04QC1-MSM22G4W · ATT09QC1-MSLUTL9D pending_days · ATT03DQC1-MSM1CR19 ·
 *             Nest /core DENY · DENY att_leave_hold · ≠ FR-04b DONE from reject-only · U65 · C-SLICE
 * SOLID:      Pure helpers — no invent PAY bridge · no offset LIVE claim
 * LastVerified: attLeave04bRing.test.ts · poHrmMvpGd1Att04bClusterFe01.source.test.ts
 */

import { ApiClientError } from '@/lib/apiError';
import { ATT_LEAVE_04_PATH_ASSERT } from '@/lib/attLeave04Ring';

export const ATT_LEAVE_04B_PATH_ASSERT = {
  ...ATT_LEAVE_04_PATH_ASSERT,
  leaveRequests: '/api/hrm/attendance/leave-requests',
} as const;

export const HRM_LEAVE_VAL_BALANCE_CODE = 'HRM-LEAVE-VAL-BALANCE' as const;

export const R_ATT_04B_OVER_BAL = 'R-ATT-04B-OVER-BAL' as const;
export const R_ATT_04B_CAP_CRUD = 'R-ATT-04B-CAP-CRUD' as const;
export const R_ATT_04B_ADVANCED_WIRE = 'R-ATT-04B-ADVANCED-WIRE' as const;
export const R_ATT_04B_GATE_REJECT = 'R-ATT-04B-GATE-REJECT' as const;

/**
 * Flip to true when BE-01 documents balance_resolution on POST leave-requests (coordinate OpenAPI).
 * Until then J-HRM-ATT-04B-04 stays HOLD footer — reject-only ≠ Diễn biến #1 DONE.
 */
export const ATT_04B_BALANCE_RESOLUTION_API_LIVE = false;

export const ATT_04B_PANEL_BUCKET_LABELS_VI: Record<string, string> = {
  advance: 'Ứng phép',
  leave_advance: 'Ứng phép',
  advance_leave: 'Ứng phép',
  unpaid: 'Không lương',
  unpaid_leave: 'Không lương',
  annual: 'Phép năm',
  seniority: 'Phép thâm niên',
  compensatory: 'Phép bù OT',
  carry_over: 'Phép chuyển kỳ',
};

export const ATT_04B_HONESTY_FOOTER =
  'attendance_uat_ready=false · ≠ ATT-04b / FR-04b DONE · ≠ ATT-04 DONE · ≠ ATT UAT · C-SLICE' as const;

export function deriveAtt04bPanelBucketLabelVi(
  leaveType: string | null | undefined,
  wireLabel?: string | null,
): string {
  const fromWire = wireLabel?.trim();
  if (fromWire) return fromWire;
  const key = (leaveType ?? '').trim().toLowerCase();
  return ATT_04B_PANEL_BUCKET_LABELS_VI[key] ?? (key || '—');
}

export type Att04bBalanceRejectDetail = {
  code: string;
  message: string;
  availableDays: number | null;
  requestedDays: number | null;
};

export function isAtt04bBalanceRejectCode(code: string | null | undefined): boolean {
  const c = (code ?? '').trim();
  return c === HRM_LEAVE_VAL_BALANCE_CODE || c === 'HRM_LEAVE_VAL_BALANCE';
}

export function parseAtt04bBalanceReject(error: unknown): Att04bBalanceRejectDetail | null {
  const read = (payload: {
    code?: string;
    message?: string;
    details?: unknown;
  }): Att04bBalanceRejectDetail | null => {
    if (!isAtt04bBalanceRejectCode(payload.code)) return null;
    let availableDays: number | null = null;
    let requestedDays: number | null = null;
    if (payload.details && typeof payload.details === 'object') {
      const d = payload.details as Record<string, unknown>;
      const a = Number(d.available_days ?? d.availableDays);
      const r = Number(d.requested_days ?? d.requestedDays);
      if (Number.isFinite(a)) availableDays = a;
      if (Number.isFinite(r)) requestedDays = r;
    }
    const enriched =
      availableDays != null && requestedDays != null
        ? `Không đủ số dư phép (ứng tắt hoặc vượt khả dụng). Còn ${availableDays} ngày, yêu cầu ${requestedDays} ngày.`
        : 'Không đủ số dư phép để nộp đơn (BR-BP-LV-07 · ứng tắt hoặc vượt khả dụng).';
    return {
      code: payload.code ?? HRM_LEAVE_VAL_BALANCE_CODE,
      message: enriched,
      availableDays,
      requestedDays,
    };
  };

  if (error instanceof ApiClientError) {
    return read({ code: error.code, message: error.message, details: error.details });
  }
  if (error && typeof error === 'object') {
    const e = error as { code?: string; message?: string; details?: unknown };
    return read(e);
  }
  return null;
}

export function att04bBalanceRejectBannerMessage(detail: Att04bBalanceRejectDetail): string {
  if (detail.availableDays != null && detail.requestedDays != null) {
    return `Không đủ quỹ phép: còn ${detail.availableDays} ngày khả dụng, đơn yêu cầu ${detail.requestedDays} ngày. Kiểm tra loại phép (ứng phép tắt) hoặc giảm số ngày.`;
  }
  return detail.message;
}

export type Att04bAdvanceCapWire = {
  advanceMaxDays: number | null;
  advanceCapPercent: number | null;
};

export function parseAtt04bAdvanceCapFromPolicyRow(
  row: Record<string, unknown> | null | undefined,
): Att04bAdvanceCapWire | null {
  if (!row) return null;
  const maxRaw = row.advanceMaxDays ?? row.advance_max_days;
  const pctRaw = row.advanceCapPercent ?? row.advance_cap_percent;
  const hasMax = maxRaw !== undefined && maxRaw !== null && String(maxRaw).trim() !== '';
  const hasPct = pctRaw !== undefined && pctRaw !== null && String(pctRaw).trim() !== '';
  if (!hasMax && !hasPct) return null;
  const advanceMaxDays = hasMax ? Number(maxRaw) : null;
  const advanceCapPercent = hasPct ? Number(pctRaw) : null;
  return {
    advanceMaxDays: Number.isFinite(advanceMaxDays as number) ? (advanceMaxDays as number) : null,
    advanceCapPercent: Number.isFinite(advanceCapPercent as number)
      ? (advanceCapPercent as number)
      : null,
  };
}

export function isAtt04bAdvanceCapCrudLive(
  policies: readonly Record<string, unknown>[],
): boolean {
  return policies.some((row) => parseAtt04bAdvanceCapFromPolicyRow(row) != null);
}

export function isAtt04bOverBalanceBranchLive(): boolean {
  return ATT_04B_BALANCE_RESOLUTION_API_LIVE;
}

export function resolveEffectiveAllowsAdvance(
  items: readonly { leaveTypeKey: string; allowsAdvance?: boolean }[],
  leaveTypeKey: string | null | undefined,
): boolean {
  const key = (leaveTypeKey ?? '').trim().toLowerCase();
  if (!key) return false;
  const row = items.find((i) => i.leaveTypeKey.trim().toLowerCase() === key);
  return Boolean(row?.allowsAdvance);
}

export function att04bHonestyBannerText(): string {
  return [
    'C-SLICE ATT-04b — catalog allows_advance · panel ứng/không lương · gate 400 HRM-LEAVE-VAL-BALANCE.',
    '≠ ATT-04b / FR-04b DONE · reject-only ≠ Diễn biến #1 DONE until branch wired.',
    ATT_04B_HONESTY_FOOTER,
  ].join(' ');
}

export function att04bResidualHoldFooterLines(): string[] {
  const lines = [
    `${R_ATT_04B_OVER_BAL}=HOLD until cap+branch LIVE`,
    `${R_ATT_04B_CAP_CRUD}=HOLD until DATA+BE cap fields`,
    `${R_ATT_04B_ADVANCED_WIRE}=conditional panel advanced_days`,
    `${R_ATT_04B_GATE_REJECT}=RETAIN`,
    'F-ATT-LEAVE-04 offset=HOLD · F-PAY-ADV-BRIDGE=OUT',
    `peer ${ATT_LEAVE_04_PATH_ASSERT.inventHoldTableDenied} DENY`,
  ];
  if (!isAtt04bOverBalanceBranchLive()) {
    lines.push('J-HRM-ATT-04B-04 browser=HOLD (balance_resolution API)');
  }
  if (!ATT_04B_BALANCE_RESOLUTION_API_LIVE) {
    lines.push('balance_resolution POST=ABSENT');
  }
  return lines;
}

export type Att04bBalanceResolution = 'advance' | 'unpaid';

export function buildAtt04bCreateExtras(
  resolution: Att04bBalanceResolution | null,
): Record<string, unknown> {
  if (!isAtt04bOverBalanceBranchLive() || !resolution) return {};
  return { balance_resolution: resolution };
}
