/**
 * @CODE-MEMORY
 * Screen:     Settings — Thư viện JD master IA helpers
 * UC:         UC-BP-REC-00 · AC-JD-SET-LIST-01 · AC-JD-SET-LIST-08
 * SRS:        docs/hrm/ui-screens/UI-SETTINGS-JD-MASTER-LIST.md
 * Purpose:    Nav/tab constants + empty copy — tách khỏi jd-dynamic CFG.
 * WorkItem:   PO-HRM-JD-IA-LIST-DETAIL-FE-01
 * Coded:      2026-08-11
 * must_keep:  settings_catalog_e2e_ready=false · U65 empty honesty
 */

import type { SettingsTabId } from '@/lib/settingsNavigation';

export const JD_MASTER_LIBRARY_TAB_ID: SettingsTabId = 'jd-master-library';
export const JD_DYNAMIC_CFG_TAB_ID: SettingsTabId = 'jd-dynamic';

export const JD_MASTER_LIBRARY_WRITER_DIALOG_TEST_ID = 'settings-jd-master-library-writer-dialog';

export const JD_MASTER_LIBRARY_EMPTY_PRIMARY =
  'Chưa có mẫu JD — cấu hình pack tại «Cấu hình trường JD» rồi thêm từ đây (U65).';

/** Query tab for Settings shell (embed + standalone). */
export function settingsTabQuery(tab: SettingsTabId): string {
  return `?tab=${tab}`;
}
