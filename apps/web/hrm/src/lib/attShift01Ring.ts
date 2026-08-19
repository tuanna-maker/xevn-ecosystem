/**
 * @CODE-MEMORY
 * Screen:     /attendance → Ca làm việc · Danh sách ca + Đổi ca CNS (ATT-01)
 * UC:         UC-BP-ATT-01 · FR-UC-BP-ATT-01 · AC-ATT-01-* · J-HRM-ATT-01-01..06
 * BR:         BR-BP-SHF-01 · ATT-01-PATH/≠-CAT-DONE/INVENT-BAN/EMPTY/ASSIGN/SCHED-OUT
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-ATT-01 Diễn biến #1–#2 + Thành công
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-ATT-01-CLUSTER-API-01.md
 *             F-ATT-CAT-SHIFT-01/02/EFF RETAIN · F-ATT-SHIFT-CNS-01 RETAIN ·
 *             F-ATT-SHIFT-02 ASSIGN residual HOLD · Nest /core DENY
 * Purpose:    Path lock + statusLabelVi FE-derive + empty CTA + invent-ban codes +
 *             honesty footers — bind LIVE work-shifts* + shift-change-requests*;
 *             DENY Nest /core · invent shift-assignments DONE · invent full roster GĐ1 ·
 *             claim catalog alone = ATT-01 DONE · claim LIVE=ATT-11 · AGG=ATT-10 ·
 *             soft/ATT-08=ATT-09 · ATT UAT · CFG=ATT-02 · invent PAY/printable · seed.
 * WorkItem:   PO-HRM-MVP-GD1-ATT-01-CLUSTER-FE-01
 * Coded:      2026-08-09
 * Callers:    Attendance (Danh sách ca) · ShiftChangeRequestTab · useWorkShifts · source tests
 * Callees:    contractLegalPrintConstants (printable false RETAIN)
 * must_keep:  ATT11QC1-MSLXTH9P ≠LIVE=DONE · ATT10QC1-MSLWGUYH ≠AGG=DONE ·
 *             ATT09QC1-MSLUTL9D · ATT08QC1-MSLSL36C · ATT02QC1-MSLQZUK7 CFG≠DONE ·
 *             PLT01QC1-MSLPUQIU · CORE10QC1-MSLP0EJB · CORE09QC1-MSLNBA89 printable false ·
 *             CORE07QC1-KZJTSHNT · soft≠CORE-06 · Nest /core DENY · DENY att_leave_hold ·
 *             R-ATT-01-ASSIGN open · Lịch GĐ2-HOLD · physical /attendance/* · U65 · C-SLICE
 * SOLID:      Pure helpers — no FE invent roster or ASSIGN writer
 * LastVerified: attShift01Ring.test.ts · poHrmMvpGd1Att01ClusterFe01.source.test.ts
 */

import { CONTRACTS_PRINTABLE_READY } from '@/lib/contractLegalPrintConstants';

/** Physical SoT paths — Network MUST contain; Nest /core shift SoT = FAIL O7. */
export const ATT_SHIFT_01_PATH_ASSERT = {
  workShifts: '/api/hrm/attendance/work-shifts',
  workShiftsEffective: '/api/hrm/attendance/work-shifts/effective',
  shiftChangeRequests: '/api/hrm/attendance/shift-change-requests',
  /** Residual ASSIGN — ABSENT Nest; DENY invent DONE this seat. */
  shiftAssignmentsResidual: '/api/hrm/attendance/shift-assignments',
  nestCoreDenied: '/api/hrm/core/',
  inventHoldTableDenied: 'att_leave_hold',
} as const;

/** Invent-ban wire when active catalog > 0 (O5). */
export const ATT_01_SHIFT_KEY_CODE = 'HRM-ATT-SHIFT-KEY' as const;

export const ATT_01_WS_CODES = {
  val: 'HRM-WS-VAL',
  notFound: 'HRM-WS-404',
  conflict: 'HRM-WS-409',
  scope: 'HRM-SCOPE-409',
} as const;

/** VI status labels — FE-derive when BE omits statusLabelVi (R-ATT-01-DISP). */
export const ATT_01_STATUS_LABELS_VI: Record<string, string> = {
  active: 'Đang dùng',
  inactive: 'Ngừng dùng',
  draft: 'Nháp',
  retired: 'Đã thu hồi',
};

/** Residual stamps — ASSIGN/SCHED remain open; CNS-FE narrowed this seat. */
export const R_ATT_01_ASSIGN = 'R-ATT-01-ASSIGN' as const;
export const R_ATT_01_SCHED = 'R-ATT-01-SCHED' as const;
export const R_ATT_01_CNS_FE = 'R-ATT-01-CNS-FE' as const;
export const R_ATT_01_DISP = 'R-ATT-01-DISP' as const;

/** GĐ2-HOLD stamp for Lịch phân ca (O3 · ≠ invent full roster DONE). */
export const ATT_01_SCHED_GD2_HOLD = 'GĐ2-HOLD' as const;

export type Att01WorkShiftDisplay = {
  shiftId: string | null;
  code: string;
  name: string;
  startTime: string | null;
  endTime: string | null;
  status: string;
  statusLabelVi: string;
  department: string | null;
  workFactor: number | null;
  breakMinutes: number | null;
  sourceFlags: Record<string, unknown> | null;
};

function asNum(v: unknown): number | null {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Prefer BE statusLabelVi; else FE-derive VI (DENY raw enum as sole UI). */
export function deriveAtt01StatusLabelVi(
  status: string | null | undefined,
  statusLabelVi?: string | null,
): string {
  const fromBe = String(statusLabelVi ?? '').trim();
  if (fromBe) return fromBe;
  const key = String(status ?? '')
    .trim()
    .toLowerCase();
  if (key && ATT_01_STATUS_LABELS_VI[key]) return ATT_01_STATUS_LABELS_VI[key];
  if (!key) return '—';
  return key;
}

/** Map list/detail row → display-ready (FE-derive statusLabelVi). */
export function parseAtt01WorkShiftDisplay(
  row: Record<string, unknown> | null | undefined,
): Att01WorkShiftDisplay {
  const r = row ?? {};
  const status = String(r.status ?? '').trim() || 'active';
  const beLabel =
    (typeof r.statusLabelVi === 'string' ? r.statusLabelVi : null) ??
    (typeof r.status_label_vi === 'string' ? r.status_label_vi : null) ??
    (typeof r.status_label === 'string' ? r.status_label : null);
  const sourceRaw = r.sourceFlags ?? r.source_flags;
  const sourceFlags =
    sourceRaw && typeof sourceRaw === 'object' && !Array.isArray(sourceRaw)
      ? (sourceRaw as Record<string, unknown>)
      : null;

  return {
    shiftId:
      r.shift_id != null
        ? String(r.shift_id)
        : r.id != null
          ? String(r.id)
          : null,
    code: String(r.code ?? '').trim(),
    name: String(r.name ?? '').trim() || String(r.code ?? '').trim() || '—',
    startTime: r.start_time != null ? String(r.start_time) : r.startTime != null ? String(r.startTime) : null,
    endTime: r.end_time != null ? String(r.end_time) : r.endTime != null ? String(r.endTime) : null,
    status,
    statusLabelVi: deriveAtt01StatusLabelVi(status, beLabel),
    department:
      r.department != null
        ? String(r.department)
        : r.department_id != null
          ? String(r.department_id)
          : null,
    workFactor: asNum(r.work_factor ?? r.coefficient ?? r.workFactor),
    breakMinutes: asNum(r.break_minutes ?? r.breakMinutes),
    sourceFlags,
  };
}

/** Empty EFF catalog — must show CTA (no seed / no bootstrap invent). */
export function isAtt01EffectiveEmpty(activeCount: number | null | undefined): boolean {
  return !activeCount || activeCount <= 0;
}

/** Empty CTA copy — admin tạo ca trong Danh sách ca (U65 · AC-ATT-01-EMPTY). */
export function att01EmptyCatalogCtaMessage(): string {
  return 'Chưa có ca hiệu lực — mở Chấm công → Ca làm việc → Danh sách ca để tạo ca (không seed).';
}

/** Invent-ban toast when BE returns HRM-ATT-SHIFT-KEY. */
export function att01ShiftKeyBanMessage(): string {
  return `${ATT_01_SHIFT_KEY_CODE}: Mã ca không thuộc danh mục Nest hiệu lực. Chọn ca từ danh sách hoặc tạo trong Danh sách ca.`;
}

/** TRUE when path is Nest dual /api/hrm/core/* ATT SoT (FAIL O7). */
export function isForbiddenAtt01SotPath(path: string | null | undefined): boolean {
  const p = String(path ?? '').toLowerCase();
  if (!p.includes('/api/hrm/core/')) return false;
  return (
    p.includes('attendance') ||
    p.includes('/att/') ||
    p.includes('work-shift') ||
    p.includes('work_shift') ||
    p.includes('shift-change') ||
    p.includes('shift_change') ||
    p.includes('shift-assign')
  );
}

/** Physical attendance family (PASS O7). */
export function isPhysicalAtt01Path(path: string | null | undefined): boolean {
  const p = String(path ?? '');
  return (
    p.includes('/attendance/work-shifts') ||
    p.includes('/attendance/shift-change-requests')
  );
}

/** Honesty footer lines — every ATT-01 evidence / UI smoke. */
export const ATT_01_HONESTY_FOOTER = {
  printableFalse: 'contracts_printable_ready=false',
  catNeAtt01Done: 'catalog alone ≠ ATT-01 DONE · ≠ FR-UC-BP-ATT-01 DONE',
  assignOpen: 'R-ATT-01-ASSIGN open · Nest shift-assignments ABSENT · ≠ invent DONE',
  schedGd2Hold: 'Lịch phân ca GĐ2-HOLD · ≠ invent full roster GĐ1 DONE',
  neLiveAtt11: '≠ LIVE=ATT-11 DONE · ATT11QC1-MSLXTH9P · R-ATT-11-WF/CSUM HOLD',
  neAggAtt10: '≠ AGG=ATT-10 DONE · ATT10QC1-MSLWGUYH · R-ATT-10-DISP P2 HOLD · HOL/MEAL OUT',
  neSoftAtt09: '≠ soft/ATT-08=ATT-09 DONE · ATT09QC1-MSLUTL9D · DENY att_leave_hold',
  mkAtt08: 'ATT-08 preview RETAIN · ATT08QC1-MSLSL36C',
  cfgNeAtt02: 'CFG ≠ ATT-02 DONE · ATT02QC1-MSLQZUK7',
  neAttModuleUat: '≠ ATT module UAT · attendance_uat_ready=false',
  nePltDone: '≠ PLT/platform UAT · PLT01QC1-MSLPUQIU',
  neCore10Done: '≠ CORE-10 DONE · CORE10QC1-MSLP0EJB',
  neCore09Done: '≠ CORE-09 DONE · printable false · CORE09QC1-MSLNBA89',
  neCore07Done: '≠ CORE-07 DONE · CORE07QC1-KZJTSHNT',
  softNeCore06: 'soft ≠ CORE-06 DONE',
  nestCoreDeny: 'Nest /core ATT = 0',
  payOut: 'PAY OUT invent DONE',
  noSeed: 'U65 zero-seed',
  cSlice: 'C-SLICE · ATT/personnel/PAY/PLT module UAT false',
  inventBan: 'HRM-ATT-SHIFT-KEY when active>0 · empty CTA · no bootstrap seed',
  cnsFe: 'R-ATT-01-CNS-FE · picker ∈ EFF Nest · empty CTA',
} as const;

export function att01HonestyFooterLines(): string[] {
  return [
    ATT_01_HONESTY_FOOTER.printableFalse,
    ATT_01_HONESTY_FOOTER.catNeAtt01Done,
    ATT_01_HONESTY_FOOTER.assignOpen,
    ATT_01_HONESTY_FOOTER.schedGd2Hold,
    ATT_01_HONESTY_FOOTER.neLiveAtt11,
    ATT_01_HONESTY_FOOTER.neAggAtt10,
    ATT_01_HONESTY_FOOTER.neSoftAtt09,
    ATT_01_HONESTY_FOOTER.mkAtt08,
    ATT_01_HONESTY_FOOTER.cfgNeAtt02,
    ATT_01_HONESTY_FOOTER.neAttModuleUat,
    ATT_01_HONESTY_FOOTER.nePltDone,
    ATT_01_HONESTY_FOOTER.neCore10Done,
    ATT_01_HONESTY_FOOTER.neCore09Done,
    ATT_01_HONESTY_FOOTER.neCore07Done,
    ATT_01_HONESTY_FOOTER.softNeCore06,
    ATT_01_HONESTY_FOOTER.nestCoreDeny,
    ATT_01_HONESTY_FOOTER.payOut,
    ATT_01_HONESTY_FOOTER.noSeed,
    ATT_01_HONESTY_FOOTER.cSlice,
    ATT_01_HONESTY_FOOTER.inventBan,
    ATT_01_HONESTY_FOOTER.cnsFe,
  ];
}

export function att01HonestyBannerText(): string {
  return [
    `Honesty: ${ATT_01_HONESTY_FOOTER.printableFalse}`,
    ATT_01_HONESTY_FOOTER.catNeAtt01Done,
    ATT_01_HONESTY_FOOTER.assignOpen,
    ATT_01_HONESTY_FOOTER.schedGd2Hold,
    '≠ LIVE=ATT-11 · ≠ AGG=ATT-10 · ≠ soft/ATT-08=ATT-09',
    ATT_01_HONESTY_FOOTER.cfgNeAtt02,
    ATT_01_HONESTY_FOOTER.neAttModuleUat,
    'PLT/CORE RETAIN (≠ DONE)',
    ATT_01_HONESTY_FOOTER.payOut,
    ATT_01_HONESTY_FOOTER.inventBan,
  ].join(' · ');
}

/** Guard — never flip printable from FE alone. */
export function assertAtt01PrintableHonesty(): boolean {
  return CONTRACTS_PRINTABLE_READY === false;
}
