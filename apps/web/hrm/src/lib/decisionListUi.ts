/**
 * @CODE-MEMORY
 * Screen:     /decisions — helpers empty honesty + create→list visibility (HCNS/CEO)
 * UC:          UC-HRM-27 / FR-HRM-27
 * BR:          BR-DEC-03 · BR-DEC-06 · AC-DEC-02 · AC-DEC-04 · AC-DEC-DENSITY
 * SRS:         docs/hrm/SRS.md § UC-HRM-27 · docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.50 FR-HRM-27
 * TechSpec:    docs/hrm/TECHSPEC.md §16.5 #50 · §16.9 G-DEC-01
 * Purpose:     Khóa copy empty live «Không có quyết định nào» (cấm stub «chưa triển khai»)
 *              và reset bộ lọc sau tạo để dòng mới hiện trên list (create→list→F5).
 * WorkItem:    FE-HRM-G-DEC-01-DENSITY-01
 * Coded:       2026-07-22
 *
 * Callers:
 *   - apps/web/hrm/src/pages/Decisions.tsx → resolveListVisibilityAfterCreate / isForbiddenDecisionEmptyCopy
 *   - apps/web/hrm/src/lib/decisionListUi.test.ts
 *
 * Callees: N/A (pure helpers)
 *
 * FE-Actions:
 *   | Thao tác người dùng     | Handler                         | Lib                      |
 *   |-------------------------|----------------------------------|--------------------------|
 *   | Lưu tạo QSĐ thành công  | resolveListVisibilityAfterCreate | decisionListUi           |
 *   | Empty list              | isForbiddenDecisionEmptyCopy     | gate copy stub           |
 *
 * BE-Chain: N/A — FE pure; POST/GET /api/hrm/decisions do hook/API
 * Impact:      Copy stub hoặc giữ filter type sau create → user thấy list trống dù POST 201.
 * must_keep:   AC-ATT-SHEET không đụng · U65 zero-seed · empty «Không có quyết định nào»
 * SOLID:       Tách pure helpers khỏi page để vitest density không mount React.
 * LastVerified: apps/web/hrm/src/lib/decisionListUi.test.ts
 */

/** SoT VI empty copy — AC-DEC-02 / BR-DEC-03 */
export const DECISIONS_LIVE_EMPTY_VI = 'Không có quyết định nào';

const FORBIDDEN_EMPTY_FRAGMENTS = [
  'chưa triển khai',
  'chua trien khai',
  'not implemented',
  'chưa có phần mềm',
  'api chưa',
] as const;

export function isForbiddenDecisionEmptyCopy(copy: string): boolean {
  const normalized = copy.trim().toLowerCase();
  if (!normalized) return true;
  return FORBIDDEN_EMPTY_FRAGMENTS.some((fragment) => normalized.includes(fragment));
}

export function isHonestDecisionLiveEmptyCopy(copy: string): boolean {
  const trimmed = copy.trim();
  if (isForbiddenDecisionEmptyCopy(trimmed)) return false;
  return (
    trimmed === DECISIONS_LIVE_EMPTY_VI ||
    /không có quyết định/i.test(trimmed) ||
    /no decisions/i.test(trimmed)
  );
}

export type DecisionListVisibilityState = {
  selectedType: string;
  searchQuery: string;
  filterStatus: string[];
  currentPage: number;
};

/**
 * Sau POST create thành công: về tab Tất cả + bỏ search/status filter + trang 1
 * để dòng mới luôn thấy trên list (AC-DEC-04 / AC-DEC-DENSITY) dù tạo từ tab loại khác.
 */
export function resolveListVisibilityAfterCreate(
  createdDecisionType?: string,
): DecisionListVisibilityState {
  void createdDecisionType;
  return {
    selectedType: 'all',
    searchQuery: '',
    filterStatus: [],
    currentPage: 1,
  };
}

/**
 * Prefill loại QSĐ khi mở dialog tạo từ tab loại (không phải «all»).
 */
export function resolveCreateDialogDecisionType(selectedType: string): string {
  if (!selectedType || selectedType === 'all') return 'appointment';
  return selectedType;
}
