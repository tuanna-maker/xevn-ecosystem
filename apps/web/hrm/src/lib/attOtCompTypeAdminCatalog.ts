/**
 * @CODE-MEMORY
 * Screen:     /settings · ATT CFG — admin catalog loại chi trả OT (F-ATT-CAT-OTC)
 * UC:         AC-PLT-ATT-COMP-01* · BR-PLT-04/05 · R-PLT-ATT-FE-ADMIN-01 (sponsor unlock)
 * BR:         DYNAMIC-LOCK — format-only code · open catalog N+ · soft-delete retire
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-ADMIN-NOTES-SA-01.md §5.2
 * API_DESIGN: F-ATT-CAT-OTC-01/02 · PUT/POST /attendance/ot-comp-types · retire
 * Purpose:    Helper admin ATT OT compensation-type — nhãn vi-VN + validate slug (không IsIn salary|leave).
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-OT-FE-ADMIN-BUILD-FE-01
 * Coded:      2026-08-09
 * Callers:    AttOtCompTypeSettingsPanel
 * Callees:    (pure)
 * must_keep:  Nest SoT only · orthogonal ≠ OT-TYPE · LVRULE HOLD · consumer FE CLOSED · U65 · honesty false
 * SOLID:      Constants/helpers SRP
 * solid_convention_ack: FE chỉ format + nhãn; attendance_uat_ready=false
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-ot-fe-admin-build-fe-01.md
 */

/** Format-only — khớp BE ATT_OT_COMP_TYPE_KEY_FORMAT. */
export const ATT_OT_COMP_TYPE_ADMIN_KEY_FORMAT = /^[a-z][a-z0-9_]*$/;

export const ATT_OT_COMP_TYPE_SOURCE_LABELS: Record<string, string> = {
  att_native: 'ATT (đơn vị)',
  group_ref: 'Danh mục tập đoàn',
  att_override: 'ATT ghi đè REF',
};

export const ATT_OT_COMP_TYPE_ADMIN_UAT_HONESTY = false;

export function isValidAttOtCompTypeKeyFormat(raw: string): boolean {
  const key = raw.trim().toLowerCase();
  return Boolean(key) && ATT_OT_COMP_TYPE_ADMIN_KEY_FORMAT.test(key);
}

export function normalizeAttOtCompTypeKey(raw: string): string {
  return raw.trim().toLowerCase();
}

export function attOtCompTypeSourceLabel(source: string | null | undefined): string {
  const s = (source ?? '').trim();
  return ATT_OT_COMP_TYPE_SOURCE_LABELS[s] ?? (s || '—');
}

export function formatAttOtCompTypeDisplay(
  code: string,
  nameVi: string | null | undefined,
): string {
  const key = code.trim();
  const label = (nameVi ?? '').trim();
  if (label) return `${label} (${key})`;
  return key || '—';
}
