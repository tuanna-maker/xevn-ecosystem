/**
 * @CODE-MEMORY
 * Screen:     /attendance — Bảng chấm công → Gửi chờ ký / Tổng hợp kỳ
 * UC:         FR-UC-BP-ATT-10 · F-ATT-SHEET-AGG-01
 * BR:         BR-ATT-SHEET-06 empty honesty · AC-ATT-SHEET
 * SRS:        docs/hrm/SRS.md UC-HRM-23 / HRM-AT-14 · API-ATT-LINE AGG
 * TechSpec:   PO-HRM-PAYROLL-FORMULA-RUN-GAP-API-ATT-LINE-01 §2
 * Purpose:    Pure copy for AGG submit/aggregate result — line_count + AGG_EMPTY_ENROLLMENT honesty.
 * WorkItem:   PO-HRM-PAYROLL-FORMULA-RUN-GAP-FE-ATT-ENROLL-01
 * Coded:      2026-08-07
 * Callers:    AttendanceSheetSignPanel
 * Callees:    none (pure)
 * must_keep:  no invent hours; empty enrollment ≠ error; U65 no seed; payroll_e2e_ready=false
 * SOLID:      UI copy helper tách khỏi panel Nest calls
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-ATT-10-CLUSTER-FE-01
 * change_mode: UPGRADE
 * What: RETAIN toast copy; display-ready/gold/statusLabelVi moved to attSheet10Ring (peer)
 * Why: UC-BP-ATT-10 cluster FE bind · Nest /core DENY · ≠ AGG=ATT-10 DONE
 * must_keep: empty enrollment honesty · U65 · ATT-09/08 seals via ring
 */

export type AttSheetAggResult = {
  sheet_id?: string;
  status?: string;
  line_count?: number;
  warnings?: string[] | null;
};

export function normalizeAttSheetAggWarnings(warnings: string[] | null | undefined): string[] {
  if (!Array.isArray(warnings)) return [];
  return warnings.map((w) => String(w).trim()).filter(Boolean);
}

export function isAttSheetAggEmptyEnrollment(result: AttSheetAggResult | null | undefined): boolean {
  const warnings = normalizeAttSheetAggWarnings(result?.warnings);
  if (warnings.includes('AGG_EMPTY_ENROLLMENT')) return true;
  const lineCount = Number(result?.line_count ?? 0);
  return Number.isFinite(lineCount) && lineCount <= 0;
}

/**
 * Toast / alert copy after submit or explicit /aggregate.
 * Empty enrollment stays honest — points HCNS to Clock-In (today in window) or OT dated in kỳ.
 */
export function formatAttSheetAggToast(result: AttSheetAggResult | null | undefined): {
  titleKey: 'success' | 'notice';
  description: string;
  emptyEnrollment: boolean;
  lineCount: number;
} {
  const lineCount = Math.max(0, Math.floor(Number(result?.line_count ?? 0) || 0));
  const emptyEnrollment = isAttSheetAggEmptyEnrollment(result);
  if (emptyEnrollment) {
    return {
      titleKey: 'notice',
      description:
        'Tổng hợp kỳ: chưa có NV ghi nhận trong cửa sổ bảng (line_count=0). Chấm công thủ công trong kỳ (Clock-In) hoặc tạo/duyệt tăng ca có ngày trong kỳ, rồi bấm Tổng hợp lại.',
      emptyEnrollment: true,
      lineCount,
    };
  }
  return {
    titleKey: 'success',
    description: `Đã tổng hợp kỳ — ${lineCount} dòng công (att_timesheet_line). Có thể ký chốt khi đủ bước.`,
    emptyEnrollment: false,
    lineCount,
  };
}
