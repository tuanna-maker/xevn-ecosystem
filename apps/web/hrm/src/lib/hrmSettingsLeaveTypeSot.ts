/**
 * @CODE-MEMORY
 * Screen:     Settings — dual SoT leave_types (group REF) vs att_leave_type writer
 * UC:         HRM-SC-01 · FR-HRM-SC-LEAVE-01
 * SRS:        docs/hrm/API_DESIGN_HRM_SETTINGS_CATALOG.md · FR-HRM-SC-LEAVE-01
 * TechSpec:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-LEAVE-CATALOG-SA-01 · F-ATT-CAT-EFF-01
 * Purpose:    FE policy — hide settings extension mutate when overview stamps tenantWriter REF-only.
 * WorkItem:   PO-HRM-SETTINGS-ATT-LVT-SOT-FE-01
 * Coded:      2026-08-10
 * Callers:    MasterDataSettingsPanel · SettingsCatalogsTab
 * Callees:    HrmSettingsCatalogOverviewRow.tenantWriter from GET /settings-catalogs
 * Impact:     Dual UX → user hits 409 HRM-SC-LEAVE-REF-ONLY on MD upsert
 * must_keep:  PUT /attendance/leave-types admin · GET leave-types/effective picker SoT · U65
 * SOLID:      Pure helpers — no React
 * LastVerified: hrmSettingsLeaveTypeSot.test.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-13 PO-HRM-SETTINGS-IA-COPY-WAVE2-FE-01
 * change_mode: FIX
 * What: LEAVE_TYPES_REF_READONLY_MD_COPY — bỏ tên bảng DB thô "leave_types" khỏi copy
 *       end-user, viết lại tự nhiên bằng tiếng Việt, giữ nguyên ý nghĩa (danh mục chỉ đọc,
 *       đồng bộ từ nơi khác, không sửa trực tiếp tại Cài đặt → Danh mục).
 * Why: PO-HRM-SETTINGS-IA-COPY-WAVE2-FE-01 (A3 — SettingsCatalogsTab.tsx) — UX-PRODUCT-RULES.md
 *      §10 R2 cấm render raw tên bảng/cột DB cho end-user.
 * must_keep: giá trị vẫn export cùng tên LEAVE_TYPES_REF_READONLY_MD_COPY; consumer
 *            (SettingsCatalogsTab.tsx, MasterDataSettingsPanel.tsx) không đổi cách dùng
 * LastVerified: docs/qa/evidence/po-hrm-settings-ia-copy-wave2-fe-01.md
 */
import type { HrmSettingsCatalogOverviewRow } from '@/integrations/hrmApi';

export type LeaveTypesTenantWriterMeta = {
  kind: 'att_leave_type';
  apiPath: string;
  effectiveApiPath: string;
  groupRefReadOnly: true;
};

export const SETTINGS_ATT_LEAVE_TYPES_TAB = 'att-leave-types' as const;
export const SETTINGS_ATT_LEAVE_TYPES_PATH = `/settings?tab=${SETTINGS_ATT_LEAVE_TYPES_TAB}`;

export function isLeaveTypesCatalogKey(catalogKey: string): boolean {
  const k = catalogKey.trim().toLowerCase();
  return k === 'leave_types' || k === 'leave-types';
}

/** True when BE stamps group REF read-only — tenant CRUD is Nest att_leave_type writer. */
export function isLeaveTypesGroupRefReadOnly(
  row: HrmSettingsCatalogOverviewRow | null | undefined,
): boolean {
  if (!row || !isLeaveTypesCatalogKey(row.catalogKey)) return false;
  return row.tenantWriter?.groupRefReadOnly === true;
}

export function leaveTypesTenantWriterHint(
  row: HrmSettingsCatalogOverviewRow | null | undefined,
): LeaveTypesTenantWriterMeta | null {
  if (!isLeaveTypesGroupRefReadOnly(row)) return null;
  const tw = row!.tenantWriter!;
  return {
    kind: 'att_leave_type',
    apiPath: tw.apiPath,
    effectiveApiPath: tw.effectiveApiPath,
    groupRefReadOnly: true,
  };
}

export const LEAVE_TYPES_REF_READONLY_MD_COPY =
  'Danh mục Loại phép tại đây chỉ hiển thị tham chiếu từ tập đoàn (đồng bộ qua XBOS) và không sửa trực tiếp được ở màn này. Thêm/sửa loại phép theo đơn vị tại tab «Loại phép ATT».';
