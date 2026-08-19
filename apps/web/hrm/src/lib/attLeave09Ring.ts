/**
 * @CODE-MEMORY
 * Screen:     /attendance → Nghỉ phép · hold quỹ khi nộp/duyệt (ATT-09)
 * UC:         UC-BP-ATT-09 · FR-UC-BP-ATT-09 · AC-ATT-09-* · J-HRM-ATT-09-01..06
 * BR:         BR-BP-LV-06 · ATT-09-PATH/HOLD-SOT/SETTLE/PANEL/TYPE-BLOCK/≠-SOFT/≠-08/≠-UAT/≠-CFG02/PAY-OUT
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-09 Diễn biến #0a–#6 + Thành công
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-ATT-09-CLUSTER-API-01.md
 *             F-ATT-LEAVE-02 submit+hold · F-ATT-LEAVE-03 approve/reject/cancel · leave-balance/panel
 *             peer F-ATT-LEAVE-01 preview must_keep ATT-08 · Nest /core DENY · DENY invent att_leave_hold
 * Purpose:    Path lock + display-ready parse (pending·available·used·held·statusLabelVi) +
 *             type-block when pending + honesty footers — bind LIVE RETAIN leave spine;
 *             DENY Nest /core · invent att_leave_hold · claim soft/ATT-08=ATT-09 DONE ·
 *             client-days=ATT-08 DONE · ATT UAT · CFG=ATT-02 DONE · invent PAY/printable.
 * WorkItem:   PO-HRM-MVP-GD1-ATT-09-CLUSTER-FE-01 · FE-02 TYPE-BLOCK overlap UX
 * Coded:      2026-08-09
 * Callers:    LeaveTab · useLeaveRequests · source tests
 * Callees:    contractLegalPrintConstants (printable false RETAIN) · attLeaveRing (peer ATT-08 paths)
 * must_keep:  ATT08QC1-MSLSL36C preview RETAIN · ATT02QC1-MSLQZUK7 CFG≠DONE · PLT01QC1-MSLPUQIU ·
 *             CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false · CORE07QC1-KZJTSHNT ·
 *             soft≠CORE-06 · Nest /core DENY · physical /attendance/* · U65 · C-SLICE
 * SOLID:      Pure helpers tách panel — no FE invent hold ledger dual
 * LastVerified: attLeave09Ring.test.ts · poHrmMvpGd1Att09ClusterFe01.source.test.ts · FE-02
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-09-CLUSTER-FE-02
 * change_mode: UPGRADE
 * What: findAtt09DateOverlapConflict + parseAtt09OverlapConflictId + att09OverlapTypeBlockBannerMessage —
 *       TYPE-BLOCK visible on create overlap (≠ toast-only) · R-ATT-09-TYPE-BLOCK-UI residual.
 * Why: QA J-05 PASS_WITH_RESIDUAL · QC ATT09QC1-MSLUTL9D GWC carry
 * must_keep: FE-01 hold/settle · honesty seals · Nest /core DENY · DENY att_leave_hold · ATT-08 RETAIN
 */

import { CONTRACTS_PRINTABLE_READY } from '@/lib/contractLegalPrintConstants';
import {
  ATT_LEAVE_08_PATH_ASSERT,
  isForbiddenAttLeaveSotPath,
  isPhysicalAttLeavePath,
} from '@/lib/attLeaveRing';

/** Physical SoT paths (O1/O9) — Network MUST contain; Nest /core leave-hold = FAIL. */
export const ATT_LEAVE_09_PATH_ASSERT = {
  leaveRequests: '/api/hrm/attendance/leave-requests',
  approve: '/api/hrm/attendance/leave-requests/:id/approve',
  reject: '/api/hrm/attendance/leave-requests/:id/reject',
  cancel: '/api/hrm/attendance/leave-requests/:id/cancel',
  leaveBalance: '/api/hrm/attendance/leave-balance',
  leaveBalancePanel: '/api/hrm/attendance/leave-balance/panel',
  /** Peer must_keep ATT-08 — ≠ ATT-09 DONE · ≠ wipe. */
  previewDeduction: ATT_LEAVE_08_PATH_ASSERT.previewDeduction,
  nestCoreDenied: '/api/hrm/core/',
  /** DENY invent dual hold ledger table name in FE SoT. */
  inventHoldTableDenied: 'att_leave_hold',
} as const;

export const R_ATT_09_HOLD_FE = 'R-ATT-09-HOLD' as const;
export const R_ATT_09_SETTLE_FE = 'R-ATT-09-SETTLE' as const;
export const R_ATT_09_PANEL_FE = 'R-ATT-09-PANEL' as const;
export const R_ATT_09_TYPE_FE = 'R-ATT-09-TYPE' as const;

/** VI status labels — FE-derive when BE omits status_label (R-ATT-09-DISP). */
export const ATT_09_STATUS_LABELS_VI: Record<string, string> = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  cancelled: 'Đã hủy',
  canceled: 'Đã hủy',
};

export type Att09BalanceDisplay = {
  pendingDays: number;
  availableDays: number;
  usedDays: number;
  /** Paper held / held_units = LIVE pending_days (O1 · DENY dual). */
  heldDays: number;
  entitledDays: number;
  leaveType: string | null;
  leaveTypeLabel: string | null;
};

export type Att09LeaveRequestDisplay = {
  requestId: string | null;
  status: string;
  statusLabelVi: string;
  leaveType: string | null;
  leaveTypeLabel: string | null;
  totalDays: number | null;
};

function asNum(v: unknown): number | null {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * Map paper held / held_units → LIVE pending_days (AC-ATT-09-HOLD-SOT).
 * DENY invent second ledger.
 */
export function resolveAtt09HeldDays(
  balance: {
    pending_days?: number | null;
    held_units?: number | null;
    held?: number | null;
    heldDays?: number | null;
  } | null | undefined,
): number {
  if (!balance) return 0;
  const pending = asNum(balance.pending_days);
  if (pending != null) return Math.max(0, pending);
  const heldUnits = asNum(balance.held_units ?? balance.held ?? balance.heldDays);
  return heldUnits != null ? Math.max(0, heldUnits) : 0;
}

/** Display-ready balance row — pending·available·used·held. */
export function parseAtt09BalanceDisplay(raw: unknown): Att09BalanceDisplay | null {
  if (!raw || typeof raw !== 'object') return null;
  const row = raw as Record<string, unknown>;
  const pending =
    asNum(row.pending_days ?? row.pendingDays) ??
    asNum(row.held_units ?? row.held) ??
    0;
  const used = asNum(row.used_days ?? row.usedDays) ?? 0;
  const entitled = asNum(row.entitled_days ?? row.entitledDays) ?? 0;
  const availableFromApi = asNum(row.available_days ?? row.availableDays);
  const remainingFromApi = asNum(row.remaining_days ?? row.remainingDays);
  const available =
    availableFromApi != null
      ? availableFromApi
      : remainingFromApi != null
        ? remainingFromApi
        : Math.max(0, entitled - used - pending);
  return {
    pendingDays: Math.max(0, pending),
    availableDays: Math.max(0, available),
    usedDays: Math.max(0, used),
    heldDays: Math.max(0, pending),
    entitledDays: Math.max(0, entitled),
    leaveType:
      row.leave_type != null
        ? String(row.leave_type)
        : row.leaveType != null
          ? String(row.leaveType)
          : null,
    leaveTypeLabel:
      row.leave_type_label != null
        ? String(row.leave_type_label)
        : row.leaveTypeLabel != null
          ? String(row.leaveTypeLabel)
          : null,
  };
}

/** Prefer BE status_label / statusLabelVi; else FE-derive (R-ATT-09-DISP). */
export function resolveAtt09StatusLabelVi(
  status: string | null | undefined,
  statusLabelVi?: string | null,
): string {
  const fromBe = String(statusLabelVi ?? '').trim();
  if (fromBe) return fromBe;
  const key = String(status ?? '')
    .trim()
    .toLowerCase();
  return ATT_09_STATUS_LABELS_VI[key] ?? (String(status ?? '').trim() || '—');
}

export function parseAtt09LeaveRequestDisplay(raw: unknown): Att09LeaveRequestDisplay {
  if (!raw || typeof raw !== 'object') {
    return {
      requestId: null,
      status: '',
      statusLabelVi: '—',
      leaveType: null,
      leaveTypeLabel: null,
      totalDays: null,
    };
  }
  const row = raw as Record<string, unknown>;
  const status = String(row.status ?? '').trim();
  const beLabel =
    (row.statusLabelVi as string | null | undefined) ??
    (row.status_label as string | null | undefined) ??
    (row.status_label_vi as string | null | undefined) ??
    null;
  return {
    requestId:
      row.id != null
        ? String(row.id)
        : row.request_id != null
          ? String(row.request_id)
          : null,
    status,
    statusLabelVi: resolveAtt09StatusLabelVi(status, beLabel),
    leaveType:
      row.leave_type != null
        ? String(row.leave_type)
        : row.leaveType != null
          ? String(row.leaveType)
          : null,
    leaveTypeLabel:
      row.leave_type_label != null
        ? String(row.leave_type_label)
        : row.leaveTypeLabel != null
          ? String(row.leaveTypeLabel)
          : null,
    totalDays: asNum(row.total_days ?? row.totalDays),
  };
}

/**
 * AC-ATT-09-TYPE-BLOCK — chặn đổi loại phép khi status=pending.
 * DENY invent full release+re-lock edit workflow this seat.
 */
/** Normalize leave status for ATT-09 guards (BE uses lowercase pending). */
export function normalizeAtt09LeaveStatus(status: string | null | undefined): string {
  return String(status ?? '').trim().toLowerCase();
}

export function isAtt09LeaveTypeChangeBlocked(
  status: string | null | undefined,
): boolean {
  return normalizeAtt09LeaveStatus(status) === 'pending';
}

export type Att09OverlapLeaveRow = {
  id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  status: string;
  leave_type?: string | null;
};

const ATT_09_OVERLAP_STATUSES = new Set(['pending', 'approved']);

function att09ParseIsoDay(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso).trim());
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function att09RangesOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart <= bEnd && bStart <= aEnd;
}

/**
 * FE prefer — detect date overlap with pending/approved before POST (J-05 TYPE-BLOCK UX).
 */
export function findAtt09DateOverlapConflict(
  rows: readonly Att09OverlapLeaveRow[],
  employeeId: string,
  startIso: string,
  endIso: string,
): Att09OverlapLeaveRow | null {
  const emp = String(employeeId ?? '').trim();
  if (!emp) return null;
  const start = att09ParseIsoDay(startIso);
  const end = att09ParseIsoDay(endIso);
  if (!start || !end) return null;
  for (const row of rows) {
    if (String(row.employee_id ?? '').trim() !== emp) continue;
    const st = normalizeAtt09LeaveStatus(row.status);
    if (!ATT_09_OVERLAP_STATUSES.has(st)) continue;
    const oStart = att09ParseIsoDay(row.start_date);
    const oEnd = att09ParseIsoDay(row.end_date);
    if (!oStart || !oEnd) continue;
    if (att09RangesOverlap(start, end, oStart, oEnd)) return row;
  }
  return null;
}

/** Parse conflicting leave id from HRM-LEAVE-VAL-OVERLAP (409) envelope. */
export function parseAtt09OverlapConflictId(error: unknown): string | null {
  if (!error || typeof error !== 'object') return null;
  const e = error as { code?: string; details?: unknown };
  if (e.code !== 'HRM-LEAVE-VAL-OVERLAP') return null;
  if (!e.details || typeof e.details !== 'object') return null;
  const d = e.details as Record<string, unknown>;
  const id = d.conflicting_id ?? d.conflictingId ?? d.conflict_id;
  if (id == null) return null;
  const s = String(id).trim();
  return s || null;
}

export function isAtt09OverlapApiError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  return (error as { code?: string }).code === 'HRM-LEAVE-VAL-OVERLAP';
}

/** User-visible overlap + TYPE-BLOCK (not toast-only). */
export function att09OverlapTypeBlockBannerMessage(opts?: {
  pendingConflict?: boolean;
}): string {
  const base = att09TypeBlockMessage();
  if (opts?.pendingConflict) {
    return `${base} Khoảng ngày trùng với đơn đang chờ duyệt — không gửi thêm đơn chồng lịch; mở chi tiết đơn chờ để xem loại phép đã khóa (AC-ATT-09-OVERLAP · TYPE-BLOCK).`;
  }
  return `${base} Khoảng ngày trùng với đơn nghỉ khác — chọn ngày khác hoặc xử lý đơn trùng trước (AC-ATT-09-OVERLAP).`;
}

/**
 * Guard update payload — strip leave_type change when pending (FE prefer).
 * Returns blocked=true when caller attempted type change while pending.
 */
export function assertAtt09LeaveTypeUpdateAllowed(
  currentStatus: string | null | undefined,
  currentLeaveType: string | null | undefined,
  nextLeaveType: string | null | undefined,
): { allowed: boolean; blocked: boolean } {
  if (!isAtt09LeaveTypeChangeBlocked(currentStatus)) {
    return { allowed: true, blocked: false };
  }
  const cur = String(currentLeaveType ?? '').trim().toLowerCase();
  const next = String(nextLeaveType ?? '').trim().toLowerCase();
  if (!next || next === cur) return { allowed: true, blocked: false };
  return { allowed: false, blocked: true };
}

export function att09TypeBlockMessage(): string {
  return 'Không đổi loại phép khi đơn đang chờ duyệt — quỹ đã giữ chỗ theo loại hiện tại (AC-ATT-09-TYPE-BLOCK · BR-BP-LV-06).';
}

export function isForbiddenAtt09SotPath(path: string | null | undefined): boolean {
  return isForbiddenAttLeaveSotPath(path);
}

export function isPhysicalAtt09Path(path: string | null | undefined): boolean {
  return isPhysicalAttLeavePath(path);
}

/** Honesty footer — every ATT-09 evidence / UI smoke. */
export const ATT_09_HONESTY_FOOTER = {
  printableFalse: 'contracts_printable_ready=false',
  softNeDone: 'soft create alone ≠ ATT-09 DONE · ≠ FR-09 DONE',
  neAtt08Done: '≠ ATT-08 preview = ATT-09 DONE · ATT08QC1-MSLSL36C RETAIN',
  clientDaysNeAtt08: 'client total_days / calendar ≠ ATT-08 DONE',
  neAttModuleUat: '≠ ATT module UAT · attendance_uat_ready=false',
  cfgNeAtt02Done: 'CFG ≠ ATT-02 DONE · ATT02QC1-MSLQZUK7',
  nePltDone: '≠ PLT/platform UAT · PLT01QC1-MSLPUQIU',
  neCore10Done: '≠ CORE-10 DONE · CORE10QC1-MSLP0EJB',
  neCore09Done: '≠ CORE-09 DONE · printable false · CORE09QC1-MSLNBA89',
  neCore07Done:
    '≠ CORE-07 DONE · GATE 409 · ACT-400 · Nest DENY · CORE07QC1-KZJTSHNT',
  softNeCore06: 'soft ≠ CORE-06 DONE',
  nestCoreDeny: 'Nest /core leave-hold = 0',
  denyAttLeaveHold: 'DENY invent att_leave_hold dual · held=pending_days',
  payOut: 'PAY OUT invent DONE',
  noSeed: 'U65 zero-seed',
  cSlice: 'C-SLICE · ATT/personnel/PAY/PLT module UAT false',
  gd1One: 'GĐ1 = một QL trực tiếp · ≠ multi-level by days',
} as const;

export function att09HonestyFooterLines(): string[] {
  return [
    ATT_09_HONESTY_FOOTER.printableFalse,
    ATT_09_HONESTY_FOOTER.softNeDone,
    ATT_09_HONESTY_FOOTER.neAtt08Done,
    ATT_09_HONESTY_FOOTER.clientDaysNeAtt08,
    ATT_09_HONESTY_FOOTER.neAttModuleUat,
    ATT_09_HONESTY_FOOTER.cfgNeAtt02Done,
    ATT_09_HONESTY_FOOTER.nePltDone,
    ATT_09_HONESTY_FOOTER.neCore10Done,
    ATT_09_HONESTY_FOOTER.neCore09Done,
    ATT_09_HONESTY_FOOTER.neCore07Done,
    ATT_09_HONESTY_FOOTER.softNeCore06,
    ATT_09_HONESTY_FOOTER.nestCoreDeny,
    ATT_09_HONESTY_FOOTER.denyAttLeaveHold,
    ATT_09_HONESTY_FOOTER.payOut,
    ATT_09_HONESTY_FOOTER.noSeed,
    ATT_09_HONESTY_FOOTER.cSlice,
    ATT_09_HONESTY_FOOTER.gd1One,
  ];
}

export function att09HonestyBannerText(): string {
  return [
    `Honesty: ${ATT_09_HONESTY_FOOTER.printableFalse}`,
    ATT_09_HONESTY_FOOTER.softNeDone,
    ATT_09_HONESTY_FOOTER.neAtt08Done,
    ATT_09_HONESTY_FOOTER.clientDaysNeAtt08,
    ATT_09_HONESTY_FOOTER.neAttModuleUat,
    ATT_09_HONESTY_FOOTER.cfgNeAtt02Done,
    ATT_09_HONESTY_FOOTER.denyAttLeaveHold,
    'PLT/CORE RETAIN (≠ DONE)',
    ATT_09_HONESTY_FOOTER.softNeCore06,
    ATT_09_HONESTY_FOOTER.payOut,
    ATT_09_HONESTY_FOOTER.nestCoreDeny,
  ].join(' · ');
}

/** Guard — never flip printable from FE alone. */
export function assertAtt09PrintableHonesty(): boolean {
  return CONTRACTS_PRINTABLE_READY === false;
}
