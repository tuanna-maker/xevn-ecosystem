/**
 * @CODE-MEMORY
 * Screen:     /hr/employee-metadata — Hàng chờ metadata (cột Quy trình)
 * UC:         UC-HRM-26
 * BR:         BRD §5.3 (workflow_code → XBOS definition; UI không lộ mã kỹ thuật)
 * SRS:        docs/hrm/SRS.md §13 · UC-HRM-26
 * TechSpec:   docs/hrm/TECHSPEC.md § metadata queue
 * Purpose:    Đổi mã workflow kỹ thuật (vd. xbos.employee_metadata.default) thành
 *             nhãn nghiệp vụ tiếng Việt cho bảng hàng chờ metadata.
 * WorkItem:   D-HRM-METADATA-WORKFLOW-ID-HUMANIZE-01
 * Coded:      2026-07-20
 *
 * Callers:
 *   - components/settings/MetadataQueueTab.tsx → formatMetadataWorkflowLabel()
 *
 * Callees:
 *   - N/A (pure map / heuristic)
 *
 * FE-Actions:
 *   | Thao tác người dùng | Handler | Lib |
 *   |---------------------|---------|-----|
 *   | Xem cột Quy trình   | render  | formatMetadataWorkflowLabel |
 *
 * BE-Chain: N/A — chỉ hiển thị; payload approve/reject không đổi
 *
 * Impact:     Hiện raw id → user thấy mã XBOS; map sai → nhầm quy trình
 * must_keep:  Không render chuỗi xbos.* / dotted workflow id ra UI; duyệt/từ chối giữ nguyên
 * SOLID:      Tách map nhãn khỏi hook fetch/mutate để test độc lập
 * LastVerified: lib/metadataWorkflowLabel.test.ts · build-gap-metadata-workflow-label-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: BUILD-GAP-METADATA-WORKFLOW-LABEL-01
 * change_mode: ADD
 * What: Khôi phục module sau build-gap decisionListUi — import MetadataQueueTab/useMetadataQueue
 * Why: vite build fail missing @/lib/metadataWorkflowLabel
 * must_keep: METADATA_WORKFLOW_LABELS_VI · formatMetadataWorkflowLabel contract; không đổi MD panel / decide payloads
 */

/** Known metadata workflow_code → business Vietnamese (never show raw ids). */
export const METADATA_WORKFLOW_LABELS_VI: Readonly<Record<string, string>> = {
  'xbos.employee_metadata.default': 'Duyệt thay đổi hồ sơ (mặc định)',
};

const DEFAULT_EMPTY_LABEL = 'Quy trình mặc định';
const DEFAULT_TECHNICAL_FALLBACK = 'Quy trình phê duyệt metadata';

/**
 * Humanize or hide technical workflow ids for Metadata queue UI.
 * Returns business Vietnamese only — never leaks `xbos.*` / dotted machine codes.
 */
export function formatMetadataWorkflowLabel(code: string | null | undefined): string {
  const trimmed = typeof code === 'string' ? code.trim() : '';
  if (!trimmed) return DEFAULT_EMPTY_LABEL;

  const known = METADATA_WORKFLOW_LABELS_VI[trimmed];
  if (known) return known;

  // Free-text / already human label from admin (spaces or Vietnamese letters)
  const looksHuman =
    /[\sÀ-ỹ]/.test(trimmed) && !/^xbos\./i.test(trimmed) && !/^[a-z0-9]+(\.[a-z0-9_]+)+$/i.test(trimmed);
  if (looksHuman) return trimmed;

  // Technical machine ids: xbos.*, dotted, snake_case, kebab-case
  if (
    /^xbos\./i.test(trimmed) ||
    trimmed.includes('.') ||
    /^[a-z][a-z0-9_-]*$/i.test(trimmed)
  ) {
    return DEFAULT_TECHNICAL_FALLBACK;
  }

  return trimmed;
}
