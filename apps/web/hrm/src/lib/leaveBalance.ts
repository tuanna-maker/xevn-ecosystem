/**
 * @CODE-MEMORY
 * Screen:     Attendance → Nghỉ phép (LeaveTab) — số dư phép
 * UC:         UC-HRM-ATT-LEAVE-01 · HRM-AT-12 · UC-BP-ATT-05b
 * BR:         BR-LEAVE-BAL-01 · BR-BP-LV-PANEL-01
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md · FR-UC-BP-ATT-05b
 * TechSpec:   docs/hrm/TECHSPEC.md · GET /attendance/leave-balance
 * Purpose:    Parse + hiển thị payload GET leave-balance — không invent số dư.
 * WorkItem:   PO-MFD-M2-ATT-WIRE-BALANCE-01
 * Coded:      2026-08-04
 * Callers:    useLeaveBalance · useLeaveBalancesByType · LeaveTab
 * Callees:    fetchLeaveBalance (hrmApi)
 * must_keep:  Không hardcode balance số; empty/error honest; U65 no seed
 * SOLID:      Pure parse/format — fetch ở hook/integration
 * LastVerified: lib/leaveBalance.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-ATT-03d-05b-FE-01
 * change_mode: ADD
 * What: MVP type codes + resolveLeaveBalanceTypeCodes + projected remaining helper (ATT-05b panel)
 * Why: FR-UC-BP-ATT-05b — panel quỹ theo loại trước/khi nộp đơn
 * must_keep: không invent số dư; empty OK; GET single-type contract
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-ATT-03d-05b-FE-01 (RE-KICK)
 * change_mode: UPGRADE
 * What: parseLeaveBalancePanelPayload — GET /attendance/leave-balance/panel (5 loại MVP)
 * Why: BE READY_FOR_QA — một response, không N×GET storm; zeros hợp lệ
 * must_keep: không invent số; empty/zeros OK; single-type GET vẫn parse được
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-09-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: resolveLeaveBalanceHeldDays — paper held = LIVE pending_days (DENY invent att_leave_hold);
 *       display-ready pending·available·used·held for ATT-09 panel F5.
 * Why: UC-BP-ATT-09 · BR-BP-LV-06 · AC-ATT-09-HOLD-SOT/PANEL · API-01 RETAIN
 * must_keep: Nest /core DENY · ATT08QC1-MSLSL36C preview peer · CFG≠ATT-02 · printable false ·
 *            PAY OUT · ≠ soft/ATT-08=ATT-09 DONE · ≠ ATT UAT · U65 · C-SLICE
 *
 * @CODE-MEMORY-CHANGE 2026-08-10 PO-HRM-MVP-GD1-ATT-04B-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: Parse advanced_days on balance/panel when BE sends field
 * Why: AC-ATT-04B-ADVANCED-WIRE conditional · R-ATT-04B-ADVANCED-WIRE
 * must_keep: không invent số · ATT09 pending_days · U65
 */
export type LeaveBalancePayload = {
  company_id: string;
  employee_id: string;
  leave_type: string;
  leave_type_label?: string;
  balance_year: number;
  entitled_days: number;
  used_days: number;
  pending_days: number;
  /** Paper advanced — LIVE when BE wires advanced_days (AC-ATT-04B-ADVANCED-WIRE). */
  advanced_days?: number;
  remaining_days: number;
  available_days: number;
  as_of: string;
  source: 'employee_leave_balances' | 'custom_fields' | 'default' | string;
};

export function parseLeaveBalancePayload(data: unknown): LeaveBalancePayload | null {
  if (!data || typeof data !== 'object') return null;
  const row = data as Record<string, unknown>;
  const employeeId = String(row.employee_id ?? '').trim();
  if (!employeeId) return null;
  const entitled = Number(row.entitled_days ?? 0);
  const used = Number(row.used_days ?? 0);
  const pending = Number(row.pending_days ?? 0);
  const advancedRaw = Number(row.advanced_days ?? 0);
  const advanced = Number.isFinite(advancedRaw) ? Math.max(0, advancedRaw) : 0;
  const remainingFromApi = Number(row.remaining_days ?? NaN);
  const remaining = Number.isFinite(remainingFromApi)
    ? remainingFromApi
    : Math.max(0, entitled - used - pending - advanced);
  const availableFromApi = Number(row.available_days ?? NaN);
  const available =
    Number.isFinite(availableFromApi) && availableFromApi >= 0 ? availableFromApi : remaining;
  const year = Number(row.balance_year ?? row.year ?? new Date().getFullYear());
  return {
    company_id: String(row.company_id ?? ''),
    employee_id: employeeId,
    leave_type: String(row.leave_type ?? 'annual'),
    leave_type_label:
      typeof row.leave_type_label === 'string' ? row.leave_type_label : undefined,
    balance_year: year,
    entitled_days: entitled,
    used_days: used,
    pending_days: pending,
    advanced_days: advanced,
    remaining_days: remaining,
    available_days: available,
    as_of: String(row.as_of ?? ''),
    source: String(row.source ?? 'default'),
  };
}

/** UC-BP-ATT-05b — panel quỹ (một GET /leave-balance/panel). */
export type LeaveBalancePanelPayload = {
  company_id: string;
  employee_id: string;
  balance_year: number;
  year: number;
  as_of: string;
  items: LeaveBalancePayload[];
};

/**
 * Parse GET /attendance/leave-balance/panel.
 * Missing/invalid items → []; zeros trên từng loại vẫn hợp lệ (source default).
 */
export function parseLeaveBalancePanelPayload(data: unknown): LeaveBalancePanelPayload | null {
  if (!data || typeof data !== 'object') return null;
  const row = data as Record<string, unknown>;
  const employeeId = String(row.employee_id ?? '').trim();
  if (!employeeId) return null;
  const year = Number(row.balance_year ?? row.year ?? new Date().getFullYear());
  const rawItems = Array.isArray(row.items) ? row.items : [];
  const items: LeaveBalancePayload[] = [];
  for (const raw of rawItems) {
    const parsed = parseLeaveBalancePayload(raw);
    if (parsed) items.push(parsed);
  }
  // BE luôn trả 5 MVP — nếu thiếu, không invent số; hook sẽ map zeros từ type codes.
  return {
    company_id: String(row.company_id ?? ''),
    employee_id: employeeId,
    balance_year: year,
    year,
    as_of: String(row.as_of ?? ''),
    items,
  };
}

/** Pick one leave_type from panel items (case-insensitive). */
export function findLeaveBalanceInPanel(
  panel: LeaveBalancePanelPayload | null | undefined,
  leaveType: string,
): LeaveBalancePayload | null {
  const code = leaveType.trim().toLowerCase();
  if (!panel || !code) return null;
  return panel.items.find((i) => i.leave_type.trim().toLowerCase() === code) ?? null;
}

export function resolveLeaveBalanceDisplayDays(
  balance: Pick<LeaveBalancePayload, 'available_days' | 'remaining_days'>,
): number {
  const remaining = Number.isFinite(balance.remaining_days) ? balance.remaining_days : 0;
  const available = Number.isFinite(balance.available_days) ? balance.available_days : remaining;
  return available > 0 ? available : remaining;
}

/**
 * Paper held / held_units = LIVE pending_days (AC-ATT-09-HOLD-SOT).
 * DENY invent att_leave_hold dual ledger.
 */
export function resolveLeaveBalanceHeldDays(
  balance: Pick<LeaveBalancePayload, 'pending_days'> | null | undefined,
): number {
  if (!balance) return 0;
  const pending = Number(balance.pending_days);
  return Number.isFinite(pending) ? Math.max(0, pending) : 0;
}

export function formatLeaveBalanceSummary(balance: LeaveBalancePayload): string {
  const days = resolveLeaveBalanceDisplayDays(balance);
  const label = balance.leave_type_label?.trim() || balance.leave_type;
  return `${days} ngày · ${label} · năm ${balance.balance_year}`;
}

/** SRS ATT-04/05b MVP five buckets — used when catalog empty (codes only; balances still from API). */
export const MVP_LEAVE_BALANCE_TYPE_CODES = [
  'annual',
  'seniority',
  'compensatory',
  'carry_over',
  'advance',
] as const;

/**
 * Resolve leave_type codes for multi-row quỹ panel.
 * Prefer active catalog codes; fall back to MVP five when catalog empty.
 */
/** Cap parallel GETs — avoid leave-type catalog storm on create dialog. */
export const MAX_LEAVE_BALANCE_TYPE_FETCH = 12;

export function resolveLeaveBalanceTypeCodes(
  catalogCodes: readonly string[] | null | undefined,
): string[] {
  const fromCatalog = (catalogCodes ?? [])
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
  if (fromCatalog.length > 0) {
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const code of fromCatalog) {
      if (seen.has(code)) continue;
      seen.add(code);
      unique.push(code);
      if (unique.length >= MAX_LEAVE_BALANCE_TYPE_FETCH) break;
    }
    return unique;
  }
  return [...MVP_LEAVE_BALANCE_TYPE_CODES];
}

/** Remaining after pending hold + optional days requested (preview only — read-only panel). */
export function projectLeaveBalanceAfterRequest(
  balance: Pick<LeaveBalancePayload, 'available_days' | 'remaining_days' | 'pending_days'>,
  requestedDays: number,
): { available: number; pendingHold: number; projected: number } {
  const available = resolveLeaveBalanceDisplayDays(balance);
  const pendingHold = Number.isFinite(balance.pending_days) ? Math.max(0, balance.pending_days) : 0;
  const req = Number.isFinite(requestedDays) && requestedDays > 0 ? requestedDays : 0;
  return {
    available,
    pendingHold,
    projected: Math.max(0, available - req),
  };
}
