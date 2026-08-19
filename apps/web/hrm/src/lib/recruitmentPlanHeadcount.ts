/**
 * @CODE-MEMORY
 * Screen:     /recruitment → tab Kế hoạch / Định biên (UC-BP-REC-01 · 01b)
 * UC:         UC-BP-REC-01 · UC-BP-REC-01b
 * BR:         BR-BP-HC-01 · BR-BP-HC-04 · O1 ns/dx → need_hire · VAL-REC-HC-15
 * SRS:        docs/brand-new-documents-20270801/SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-01 · 01b
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-REC-01-CLUSTER-API-01.md F-REC-HC-01/05
 * Purpose:    Chuẩn hóa ô tháng định biên: một số Cần tuyển (need_hire); map legacy ns/dx;
 *             serialize PUT/POST không gửi dual SoT; toast KEY / spawn feedback.
 * WorkItem:   PO-HRM-MVP-GD1-REC-01-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    useRecruitmentPlans · Recruitment.tsx plan dialog/detail
 * Callees:    — (pure helpers)
 * FE-Actions: | Lưu lưới | serializeMonthsForApi → PUT/POST need_hire |
 *             | Spawn YCTD | formatSpawnFeedback |
 * Impact:     Dual ns+dx editor = FAIL ALT-03; free-text khi EFF>0 = EX-03
 * must_keep:  XBOS WF · UF-HRM-12 · REC-03 OUT · recruitment_uat_ready=false · U65
 * SOLID:      Pure cell projection — tách khỏi page shell
 * LastVerified: docs/qa/evidence/po-hrm-mvp-gd1-rec-01-cluster-fe-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-01-CLUSTER-FE-01 (re-dispatch)
 * change_mode: ADD
 * What: detectQtyDrift / countOverHeadcountCells helpers + O3/O4 VI copy
 * Why: BA O3 qty_drift confirm · O4 vượt HC warn-allow
 * must_keep: serialize never emits ns/dx · formatSpawnFeedback created/skipped
 */

export type HeadcountCellStatus = 'current' | 'need_hire' | 'projected';
export type HeadcountLifecycleStatus =
  | 'open'
  | 'need_hire_approved'
  | 'fulfilled'
  | 'cancelled';

/** Canonical FE cell — Option A O1 (single Cần tuyển SoT). */
export type HeadcountMonthCell = {
  cell_id?: string;
  month: number;
  cell_status: HeadcountCellStatus;
  lifecycle_status: HeadcountLifecycleStatus;
  need_hire: number;
  headcount_current: number;
  headcount_projected: number | null;
};

export const HRM_HC_KEY_UNKNOWN_TOAST_VI =
  'Phòng ban / chức danh phải chọn từ danh mục hiệu lực (không nhập tự do).';

export const HRM_HC_LEGACY_DUAL_TOAST_VI =
  'Không còn cặp cột NS/ĐX — chỉ nhập số Cần tuyển.';

export const HRM_HC_CELL_LOCKED_TOAST_VI =
  'Ô Cần tuyển đã duyệt — không chỉnh sửa trừ khi có quyền override.';

export const HRM_HC_SPAWN_NOT_APPROVED_TOAST_VI =
  'Kế hoạch chưa duyệt — chưa thể sinh YCTD tự động.';

/** BA O3 — qty drift after spawn / need_hire_approved cell. */
export const HRM_HC_QTY_DRIFT_TITLE_VI = 'Cảnh báo lệch số lượng (qty_drift)';
export const HRM_HC_QTY_DRIFT_CONFIRM_VI =
  'Ô Cần tuyển đã duyệt/sinh YCTD — đổi SL không ghi đè YCTD im lặng. Xác nhận cập nhật có kiểm soát (phiên bản) để tiếp tục?';

/** BA O4 — vượt headcount hiện tại trên lưới; vẫn cho duyệt. */
export const HRM_HC_OVER_HC_WARN_VI =
  'Có ô Cần tuyển vượt Hiện tại (định biên). Có thể duyệt lưới — không chặn BOD trên FR-01.';

export function emptyHeadcountMonth(month: number): HeadcountMonthCell {
  return {
    month,
    cell_status: 'current',
    lifecycle_status: 'open',
    need_hire: 0,
    headcount_current: 0,
    headcount_projected: null,
  };
}

export function emptyHeadcountYear(): HeadcountMonthCell[] {
  return Array.from({ length: 12 }, (_, i) => emptyHeadcountMonth(i + 1));
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function num(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function inferCellStatus(
  needHire: number,
  explicit: unknown,
): HeadcountCellStatus {
  if (explicit === 'need_hire' || explicit === 'current' || explicit === 'projected') {
    return explicit;
  }
  if (needHire >= 1) return 'need_hire';
  return 'current';
}

function inferLifecycle(raw: unknown): HeadcountLifecycleStatus {
  if (
    raw === 'open' ||
    raw === 'need_hire_approved' ||
    raw === 'fulfilled' ||
    raw === 'cancelled'
  ) {
    return raw;
  }
  return 'open';
}

/**
 * O1 migrate: need_hire = dx (legacy đề xuất); headcount_current = ns.
 * Prefer canonical need_hire / headcount_need_hire when present.
 */
export function parseMonthCell(raw: unknown, monthFallback: number): HeadcountMonthCell {
  const row = asRecord(raw);
  if (!row) return emptyHeadcountMonth(monthFallback);

  const hasCanonical =
    row.need_hire != null ||
    row.headcount_need_hire != null ||
    row.need_to_hire != null;

  const legacyDx = num(row.dx, 0);
  const legacyNs = num(row.ns, 0);

  const needHire = hasCanonical
    ? num(row.need_hire ?? row.headcount_need_hire ?? row.need_to_hire, 0)
    : legacyDx;

  const headcountCurrent = hasCanonical
    ? num(row.headcount_current ?? row.current_headcount, 0)
    : legacyNs;

  const projectedRaw = row.headcount_projected ?? row.projected;
  const headcountProjected =
    projectedRaw == null || projectedRaw === ''
      ? null
      : num(projectedRaw, 0);

  const month = num(row.month, monthFallback);

  return {
    cell_id: typeof row.cell_id === 'string' ? row.cell_id : undefined,
    month: month >= 1 && month <= 12 ? month : monthFallback,
    cell_status: inferCellStatus(needHire, row.cell_status),
    lifecycle_status: inferLifecycle(row.lifecycle_status),
    need_hire: needHire,
    headcount_current: headcountCurrent,
    headcount_projected: headcountProjected,
  };
}

export function parseMonthsData(raw: unknown): HeadcountMonthCell[] {
  let arr: unknown[] = [];
  if (Array.isArray(raw)) {
    arr = raw;
  } else if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) arr = parsed;
    } catch {
      arr = [];
    }
  }

  const cells = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const found = arr.find((item) => {
      const r = asRecord(item);
      return r != null && num(r.month, -1) === month;
    });
    if (found) return parseMonthCell(found, month);
    if (arr[i] != null && asRecord(arr[i])?.month == null) {
      return parseMonthCell(arr[i], month);
    }
    return emptyHeadcountMonth(month);
  });
  return cells;
}

/** Write DTO — never emit ns/dx dual SoT (VAL-REC-HC-15 · HRM-HC-LEGACY-DUAL). */
export function serializeMonthsForApi(months: HeadcountMonthCell[]): Array<{
  cell_id?: string;
  month: number;
  cell_status: HeadcountCellStatus;
  lifecycle_status: HeadcountLifecycleStatus;
  need_hire: number;
  headcount_current: number;
  headcount_projected: number | null;
}> {
  const padded = months.length >= 12 ? months : [...months, ...emptyHeadcountYear()].slice(0, 12);
  return padded.slice(0, 12).map((m, i) => {
    const month = m.month >= 1 && m.month <= 12 ? m.month : i + 1;
    const needHire = Math.max(0, Math.floor(num(m.need_hire, 0)));
    const cellStatus: HeadcountCellStatus =
      needHire >= 1
        ? 'need_hire'
        : m.cell_status === 'projected'
          ? 'projected'
          : 'current';
    return {
      ...(m.cell_id ? { cell_id: m.cell_id } : {}),
      month,
      cell_status: cellStatus,
      lifecycle_status: m.lifecycle_status ?? 'open',
      need_hire: needHire,
      headcount_current: Math.max(0, Math.floor(num(m.headcount_current, 0))),
      headcount_projected: m.headcount_projected,
    };
  });
}

/** True if a write body still carries dual ns+dx editors (forbidden post-wave). */
export function bodyHasLegacyDualEditors(body: unknown): boolean {
  const walk = (node: unknown): boolean => {
    if (Array.isArray(node)) return node.some(walk);
    const r = asRecord(node);
    if (!r) return false;
    if (Object.prototype.hasOwnProperty.call(r, 'ns') && Object.prototype.hasOwnProperty.call(r, 'dx')) {
      return true;
    }
    if (Array.isArray(r.months) && r.months.some(walk)) return true;
    if (Array.isArray(r.departments) && r.departments.some(walk)) return true;
    if (Array.isArray(r.positions) && r.positions.some(walk)) return true;
    return false;
  };
  return walk(body);
}

export type SpawnRequestsResult = {
  created?: Array<{
    requisition_id?: string;
    headcount_cell_id?: string;
    headcount?: number;
    target_month?: string;
  }>;
  skipped_duplicate?: Array<{
    headcount_cell_id?: string;
    existing_requisition_id?: string;
  }>;
  blocked?: Array<{ reason_code?: string; message?: string }>;
  drift_warnings?: Array<{
    headcount_cell_id?: string;
    cell_need_hire?: number;
    yctd_headcount?: number;
    code?: string;
  }>;
};

export function formatSpawnFeedback(result: SpawnRequestsResult): {
  title: string;
  description: string;
  variant: 'default' | 'destructive';
} {
  const created = result.created?.length ?? 0;
  const skipped = result.skipped_duplicate?.length ?? 0;
  const blocked = result.blocked?.length ?? 0;
  const drift = result.drift_warnings?.length ?? 0;

  if (blocked > 0) {
    const msg = result.blocked?.[0]?.message?.trim();
    return {
      title: 'Không sinh được YCTD',
      description: msg || `Có ${blocked} ô bị chặn (cấu hình kích hoạt / điều kiện).`,
      variant: 'destructive',
    };
  }

  if (created === 0 && skipped > 0) {
    return {
      title: 'Không tạo YCTD trùng',
      description: `Đã bỏ qua ${skipped} ô (idempotent — BR-BP-HC-04).`,
      variant: 'default',
    };
  }

  const parts: string[] = [];
  if (created > 0) parts.push(`tạo mới ${created}`);
  if (skipped > 0) parts.push(`bỏ qua trùng ${skipped}`);
  if (drift > 0) parts.push(`cảnh báo lệch SL ${drift}`);

  return {
    title: created > 0 ? 'Đã sinh YCTD từ định biên' : 'Kết quả sinh YCTD',
    description: parts.length > 0 ? parts.join(' · ') : 'Không có ô Cần tuyển đủ điều kiện.',
    variant: 'default',
  };
}

export function mapHrmHcErrorToToast(code: string | undefined, fallback: string): string {
  switch ((code ?? '').toUpperCase()) {
    case 'HRM-HC-KEY-UNKNOWN':
      return HRM_HC_KEY_UNKNOWN_TOAST_VI;
    case 'HRM-HC-LEGACY-DUAL':
      return HRM_HC_LEGACY_DUAL_TOAST_VI;
    case 'HRM-HC-CELL-LOCKED':
      return HRM_HC_CELL_LOCKED_TOAST_VI;
    case 'HRM-HC-SPAWN-PLAN-NOT-APPROVED':
      return HRM_HC_SPAWN_NOT_APPROVED_TOAST_VI;
    default:
      return fallback;
  }
}

export function withNeedHireAt(
  months: HeadcountMonthCell[],
  monthIdx: number,
  needHire: number,
): HeadcountMonthCell[] {
  const next = months.map((m) => ({ ...m }));
  const idx = monthIdx >= 0 && monthIdx < 12 ? monthIdx : 0;
  const value = Math.max(0, Math.floor(needHire));
  const prev = next[idx] ?? emptyHeadcountMonth(idx + 1);
  next[idx] = {
    ...prev,
    month: prev.month || idx + 1,
    need_hire: value,
    cell_status: value >= 1 ? 'need_hire' : prev.cell_status === 'projected' ? 'projected' : 'current',
  };
  return next;
}

export type QtyDriftHit = {
  month: number;
  from: number;
  to: number;
  cell_id?: string;
};

/**
 * O3 — detect need_hire change on cells already locked/spawned (need_hire_approved / fulfilled).
 * Silent overwrite without confirm = FAIL AC-REC-HC-01b-ALT-02.
 */
export function detectQtyDrift(
  baseline: HeadcountMonthCell[] | undefined,
  next: HeadcountMonthCell[],
): QtyDriftHit[] {
  if (!baseline?.length) return [];
  const hits: QtyDriftHit[] = [];
  for (let i = 0; i < 12; i++) {
    const prev = baseline[i];
    const cur = next[i];
    if (!prev || !cur) continue;
    const locked =
      prev.lifecycle_status === 'need_hire_approved' ||
      prev.lifecycle_status === 'fulfilled';
    if (!locked) continue;
    const from = Math.floor(num(prev.need_hire, 0));
    const to = Math.floor(num(cur.need_hire, 0));
    if (from !== to) {
      hits.push({
        month: cur.month || i + 1,
        from,
        to,
        cell_id: cur.cell_id ?? prev.cell_id,
      });
    }
  }
  return hits;
}

export function detectQtyDriftInDepartments(
  baselineDepts: Array<{ positions: Array<{ id: string; months: HeadcountMonthCell[] }> }>,
  nextDepts: Array<{ positions: Array<{ id: string; months: HeadcountMonthCell[] }> }>,
): QtyDriftHit[] {
  const hits: QtyDriftHit[] = [];
  for (const nextDept of nextDepts) {
    for (const nextPos of nextDept.positions) {
      let baselinePos: { months: HeadcountMonthCell[] } | undefined;
      for (const bDept of baselineDepts) {
        const found = bDept.positions.find((p) => p.id === nextPos.id);
        if (found) {
          baselinePos = found;
          break;
        }
      }
      hits.push(...detectQtyDrift(baselinePos?.months, nextPos.months));
    }
  }
  return hits;
}

/** O4 — Cần tuyển SL > Hiện tại snapshot on the same cell. */
export function countOverHeadcountCells(
  departments: Array<{ positions: Array<{ months: HeadcountMonthCell[] }> }>,
): number {
  let n = 0;
  for (const dept of departments) {
    for (const pos of dept.positions) {
      for (const cell of pos.months) {
        const need = Math.floor(num(cell.need_hire, 0));
        const current = Math.floor(num(cell.headcount_current, 0));
        if (need >= 1 && need > current) n += 1;
      }
    }
  }
  return n;
}
