/**
 * @CODE-MEMORY
 * Screen:     HRM Tuyển dụng → Kế hoạch tuyển / Định biên (months_data cell projection)
 * UC:         UC-BP-REC-01 · UC-BP-REC-01b
 * BR:         BR-BP-HC-01 · BR-BP-HC-04 · O1 ns/dx migrate
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-01 · FR-UC-BP-REC-01b
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01.md
 *             docs/program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-DATA-01.md §6
 * Purpose:    Normalize months_data → cell projection (need_hire SoT); DENY dual ns+dx writers.
 * WorkItem:   PO-HRM-MVP-GD1-REC-01-CLUSTER-BE-01
 * Coded:      2026-08-09
 * Callers:    recruitment-catalog.service.ts · recruitment-workflow.bridge.ts
 * Callees:    (pure) — no DB
 * must_keep:  O1 dx→headcount_need_hire · ns→headcount_current · no invent rec_headcount_* table
 * SOLID:      Cell projection helpers separated from Nest catalog service
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-be-01.md
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem:   PO-HRM-MVP-GD1-REC-HC-OVERRIDE-CELLID-BE-01
 * Coded:      2026-08-09
 * SRS/BA:     docs/program/specs/PO-HRM-MVP-GD1-REC-HC-OVERRIDE-CELLID-BA-01.md
 *             (Option A LOCKED · BR-REC-HC-CELL-STABLE / MINT-ONCE / ID-MISMATCH)
 * Change:     normalizeHeadcountCell/normalizeMonthsData nhận opts.mintWhenMissing.
 *             Khi false, ô thiếu cell_id trả về '' (KHÔNG mint) để write path reuse
 *             cell_id theo natural key trước, chỉ mint lần đầu. Thêm mã lỗi
 *             HRM-HC-CELL-ID-MISMATCH (409) cho payload cell_id lạ cùng natural key.
 * must_keep:  Đường đọc/GET (projectMonthsForApi) giữ mint mặc định (mintWhenMissing
 *             không set → true) để không đổi hành vi GET/lock hiện tại.
 */
import { randomUUID } from 'node:crypto';
import { HttpStatus } from '@nestjs/common';
import { ApiException } from '../common/api.exception';

export const HRM_HC_VAL_400 = 'HRM-HC-VAL-400';
export const HRM_HC_LEGACY_DUAL = 'HRM-HC-LEGACY-DUAL';
export const HRM_HC_KEY_UNKNOWN = 'HRM-HC-KEY-UNKNOWN';
export const HRM_HC_CELL_LOCKED = 'HRM-HC-CELL-LOCKED';
export const HRM_HC_CELL_ID_MISMATCH = 'HRM-HC-CELL-ID-MISMATCH';
export const HRM_HC_SPAWN_PLAN_NOT_APPROVED = 'HRM-HC-SPAWN-PLAN-NOT-APPROVED';
export const HRM_HC_SPAWN_DUP = 'HRM-HC-SPAWN-DUP';
export const HRM_HC_SPAWN_QTY_DRIFT = 'HRM-HC-SPAWN-QTY-DRIFT';
export const HRM_HC_ACTIVATION_CFG = 'HRM-HC-ACTIVATION-CFG';

export type CellStatus = 'current' | 'need_hire' | 'projected';
export type LifecycleStatus = 'open' | 'need_hire_approved' | 'fulfilled' | 'cancelled';

export type HeadcountCell = {
  cell_id: string;
  month: number;
  cell_status: CellStatus;
  lifecycle_status: LifecycleStatus;
  need_hire: number;
  headcount_need_hire: number;
  headcount_current: number;
  headcount_projected: number | null;
};

type RawCell = Record<string, unknown>;

function asNonNegInt(value: unknown, fallback = 0): number {
  if (value === null || value === undefined || value === '') return fallback;
  const n = Math.trunc(Number(value));
  if (!Number.isFinite(n) || n < 0) return fallback;
  return n;
}

/** DENY dual SoT editors ns+dx on write (VAL-REC-HC-15 · O1). */
export function assertNoLegacyDualSotWriters(raw: unknown, path = 'months'): void {
  if (raw == null) return;
  if (Array.isArray(raw)) {
    raw.forEach((item, i) => assertNoLegacyDualSotWriters(item, `${path}[${i}]`));
    return;
  }
  if (typeof raw !== 'object') return;
  const obj = raw as RawCell;
  const hasNs = Object.prototype.hasOwnProperty.call(obj, 'ns');
  const hasDx = Object.prototype.hasOwnProperty.call(obj, 'dx');
  if (hasNs && hasDx) {
    throw new ApiException(
      HRM_HC_LEGACY_DUAL,
      'Không được gửi đồng thời ns và dx làm SoT — dùng need_hire / headcount_need_hire và headcount_current',
      HttpStatus.BAD_REQUEST,
    );
  }
  for (const [k, v] of Object.entries(obj)) {
    if (k === 'departments' || k === 'positions' || k === 'months' || k === 'months_data') {
      assertNoLegacyDualSotWriters(v, `${path}.${k}`);
    }
  }
}

/**
 * O1 LOCK: dx → headcount_need_hire · ns → headcount_current.
 * Derive cell_status: need_hire when qty≥1 else current (projected never invented from legacy).
 */
export function normalizeHeadcountCell(
  raw: unknown,
  monthHint: number,
  opts?: { planApproved?: boolean; mintWhenMissing?: boolean },
): HeadcountCell {
  const obj = (raw && typeof raw === 'object' ? (raw as RawCell) : {}) as RawCell;
  const monthRaw = asNonNegInt(obj.month, monthHint);
  const month = monthRaw >= 1 && monthRaw <= 12 ? monthRaw : monthHint;

  const needHireExplicit =
    obj.need_hire ?? obj.need_to_hire ?? obj.headcount_need_hire ?? undefined;
  const currentExplicit = obj.headcount_current ?? undefined;

  // Legacy migrate (read path): dx prefer for Cần tuyển, ns for Hiện tại.
  const fromDx = Object.prototype.hasOwnProperty.call(obj, 'dx')
    ? asNonNegInt(obj.dx, 0)
    : undefined;
  const fromNs = Object.prototype.hasOwnProperty.call(obj, 'ns')
    ? asNonNegInt(obj.ns, 0)
    : undefined;

  const headcount_need_hire = asNonNegInt(
    needHireExplicit !== undefined ? needHireExplicit : fromDx,
    0,
  );
  const headcount_current = asNonNegInt(
    currentExplicit !== undefined ? currentExplicit : fromNs,
    0,
  );

  let cell_status: CellStatus = 'current';
  const statusRaw = typeof obj.cell_status === 'string' ? obj.cell_status.trim() : '';
  if (statusRaw === 'current' || statusRaw === 'need_hire' || statusRaw === 'projected') {
    cell_status = statusRaw;
  } else if (headcount_need_hire >= 1) {
    cell_status = 'need_hire';
  }

  let headcount_projected: number | null = null;
  if (obj.headcount_projected !== undefined && obj.headcount_projected !== null) {
    headcount_projected = asNonNegInt(obj.headcount_projected, 0);
  } else if (cell_status === 'projected') {
    headcount_projected = headcount_need_hire;
  }

  let lifecycle_status: LifecycleStatus = 'open';
  const lifeRaw = typeof obj.lifecycle_status === 'string' ? obj.lifecycle_status.trim() : '';
  if (
    lifeRaw === 'open' ||
    lifeRaw === 'need_hire_approved' ||
    lifeRaw === 'fulfilled' ||
    lifeRaw === 'cancelled'
  ) {
    lifecycle_status = lifeRaw;
  } else if (opts?.planApproved && cell_status === 'need_hire' && headcount_need_hire >= 1) {
    lifecycle_status = 'need_hire_approved';
  }

  // Stable identity (DATA-01 §6.1): keep explicit cell_id verbatim. When omitted, mint by default
  // (read/GET projection) but allow callers to DEFER minting (mintWhenMissing:false) so the write
  // path can reuse an existing cell_id by natural key before minting a new surrogate.
  const explicitCellId =
    typeof obj.cell_id === 'string' && obj.cell_id.trim() ? obj.cell_id.trim() : '';
  const cell_id = explicitCellId
    ? explicitCellId
    : opts?.mintWhenMissing === false
      ? ''
      : randomUUID();

  return {
    cell_id,
    month,
    cell_status,
    lifecycle_status,
    need_hire: headcount_need_hire,
    headcount_need_hire,
    headcount_current,
    headcount_projected,
  };
}

/** Persist shape — no ns/dx dual SoT. */
export function toPersistCell(cell: HeadcountCell): Record<string, unknown> {
  return {
    cell_id: cell.cell_id,
    month: cell.month,
    cell_status: cell.cell_status,
    lifecycle_status: cell.lifecycle_status,
    headcount_need_hire: cell.headcount_need_hire,
    headcount_current: cell.headcount_current,
    headcount_projected: cell.headcount_projected,
  };
}

export function normalizeMonthsData(
  raw: unknown,
  opts?: { planApproved?: boolean; requireTwelve?: boolean; mintWhenMissing?: boolean },
): HeadcountCell[] {
  const arr = Array.isArray(raw) ? raw : [];
  if (opts?.requireTwelve && arr.length > 0 && arr.length !== 12) {
    throw new ApiException(
      HRM_HC_VAL_400,
      'Lưới định biên phải đủ 12 tháng khi lưu/gửi duyệt',
      HttpStatus.BAD_REQUEST,
    );
  }
  const cells: HeadcountCell[] = [];
  for (let i = 0; i < Math.max(arr.length, opts?.requireTwelve ? 12 : arr.length); i++) {
    const hint = i + 1;
    const source = arr[i] ?? { month: hint, cell_status: 'current' };
    const cell = normalizeHeadcountCell(source, hint, opts);
    if (cell.cell_status === 'need_hire' && cell.headcount_need_hire < 1) {
      throw new ApiException(
        HRM_HC_VAL_400,
        `Ô tháng ${cell.month}: trạng thái Cần tuyển yêu cầu số lượng ≥ 1`,
        HttpStatus.BAD_REQUEST,
      );
    }
    cells.push(cell);
  }
  return cells;
}

/** After plan approve — lock need_hire cells. */
export function lockNeedHireCells(cells: HeadcountCell[]): HeadcountCell[] {
  return cells.map((c) => {
    if (c.cell_status === 'need_hire' && c.headcount_need_hire >= 1) {
      return { ...c, lifecycle_status: 'need_hire_approved' as const };
    }
    return c;
  });
}

export function projectMonthsForApi(raw: unknown, planApproved?: boolean): HeadcountCell[] {
  const arr = Array.isArray(raw) ? raw : [];
  if (arr.length === 0) return [];
  return arr.map((item, i) => normalizeHeadcountCell(item, i + 1, { planApproved }));
}

export function isPlanApprovedStatus(status: unknown): boolean {
  return String(status ?? '')
    .trim()
    .toLowerCase() === 'approved';
}

export function normalizePlanStatusToken(status: unknown): string {
  const s = String(status ?? '')
    .trim()
    .toLowerCase();
  if (s === 'pending' || s === 'draft') return s === 'draft' ? 'draft' : 'pending';
  if (s === 'submitted') return 'pending_approval';
  return s || 'pending';
}

export function assertCellUnlockedForMutate(
  existing: HeadcountCell,
  next: HeadcountCell,
  allowOverride?: boolean,
): void {
  if (allowOverride) return;
  if (existing.lifecycle_status !== 'need_hire_approved') return;
  const qtyChanged = existing.headcount_need_hire !== next.headcount_need_hire;
  const statusChanged = existing.cell_status !== next.cell_status;
  if (qtyChanged || statusChanged) {
    throw new ApiException(
      HRM_HC_CELL_LOCKED,
      'Ô Cần tuyển đã duyệt — không được chỉnh số lượng/trạng thái (thiếu quyền override)',
      HttpStatus.CONFLICT,
    );
  }
}

export function firstOfMonthIso(year: number, month: number): string {
  const m = String(Math.max(1, Math.min(12, month))).padStart(2, '0');
  return `${year}-${m}-01`;
}
