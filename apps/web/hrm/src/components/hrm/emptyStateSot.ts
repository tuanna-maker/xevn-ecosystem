/**
 * @CODE-MEMORY
 * Screen:     HRM — EmptyState SoT copy (Wave B)
 * UC:         UX-10 · EmptyState moods
 * BR:         3 mood none/error/permission — VI CTA mặc định
 * SRS:        docs/program/UX-UI-ERP-ANALYSIS.md § Wave B EmptyState
 * Purpose:    Hằng số mood + copy VI cho EmptyState + vitest (không JSX).
 * WorkItem:   D-UX-EMPTY-STATE-FE-01
 * Coded:      2026-07-28
 * Callers:    EmptyState.tsx · EmptyState.test.ts
 * must_keep:  moods none|error|permission; VI title/description/actionLabel
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: PO-E2E-SPINE-01-FE-VITE-PAY-CON-01
 * change_mode: FIX
 * What: Restore emptyStateSot từ stash 43c479a (dep EmptyState → Contracts mount)
 * Why: Transitive Vite resolve sau restore EmptyState
 * must_keep: VI SoT copy; mood keys none/error/permission
 *
 * LastVerified: docs/qa/evidence/d-ux-empty-state-fe-01-20260728.md
 */

export type EmptyStateMood = 'none' | 'error' | 'permission';

export const EMPTY_STATE_MOODS = ['none', 'error', 'permission'] as const;

export const EMPTY_STATE_VI: Record<
  EmptyStateMood,
  { title: string; description: string; actionLabel: string }
> = {
  none: {
    title: 'Chưa có dữ liệu',
    description: 'Thêm bản ghi đầu tiên hoặc đổi bộ lọc để xem kết quả.',
    actionLabel: 'Thêm mới',
  },
  error: {
    title: 'Không tải được dữ liệu',
    description: 'Hệ thống gặp lỗi khi tải. Thử lại hoặc liên hệ hỗ trợ nếu vẫn lỗi.',
    actionLabel: 'Thử lại',
  },
  permission: {
    title: 'Không có quyền xem',
    description:
      'Nội dung bị hạn chế theo phân quyền. Liên hệ HR nếu bạn cần được cấp quyền.',
    actionLabel: 'Liên hệ HR',
  },
};

export function isEmptyStateMood(value: string): value is EmptyStateMood {
  return (EMPTY_STATE_MOODS as readonly string[]).includes(value);
}
