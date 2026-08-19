/**
 * @CODE-MEMORY
 * Screen:     /settings · ATT CFG — admin catalog loại tăng ca (F-ATT-CAT-OT)
 * UC:         AC-PLT-ATT-OT-01* · BR-PLT-04/05 · R-PLT-ATT-FE-ADMIN-01 (sponsor unlock)
 * BR:         DYNAMIC-LOCK — format-only code · open catalog N+ · soft-delete retire
 * SRS:        docs/program/specs/PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-FE-ADMIN-NOTES-SA-01.md §5.2
 * API_DESIGN: F-ATT-CAT-OT-01/02 · PUT/POST /attendance/ot-types · retire
 * Purpose:    Helper admin ATT OT-type — nhãn vi-VN + validate slug; defaultCoeff ≠ payroll formula.
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-OT-FE-ADMIN-BUILD-FE-01
 * Coded:      2026-08-09
 * Callers:    AttOtTypeSettingsPanel
 * Callees:    (pure)
 * must_keep:  Nest SoT only · no dual-write · LVRULE HOLD · consumer FE CLOSED · U65 · honesty false
 * SOLID:      Constants/helpers SRP
 * solid_convention_ack: FE chỉ format + nhãn; attendance_uat_ready=false
 * LastVerified: docs/qa/evidence/po-hrm-dynamic-config-platform-att-code-ot-fe-admin-build-fe-01.md
 */

/** Format-only — khớp BE ATT_OT_TYPE_KEY_FORMAT. */
export const ATT_OT_TYPE_ADMIN_KEY_FORMAT = /^[a-z][a-z0-9_]*$/;

export const ATT_OT_TYPE_SOURCE_LABELS: Record<string, string> = {
  att_native: 'ATT (đơn vị)',
  group_ref: 'Danh mục tập đoàn',
  att_override: 'ATT ghi đè REF',
};

export const ATT_OT_TYPE_ADMIN_UAT_HONESTY = false;

export function isValidAttOtTypeKeyFormat(raw: string): boolean {
  const key = raw.trim().toLowerCase();
  return Boolean(key) && ATT_OT_TYPE_ADMIN_KEY_FORMAT.test(key);
}

export function normalizeAttOtTypeKey(raw: string): string {
  return raw.trim().toLowerCase();
}

export function attOtTypeSourceLabel(source: string | null | undefined): string {
  const s = (source ?? '').trim();
  return ATT_OT_TYPE_SOURCE_LABELS[s] ?? (s || '—');
}

export function formatAttOtTypeDisplay(
  code: string,
  nameVi: string | null | undefined,
): string {
  const key = code.trim();
  const label = (nameVi ?? '').trim();
  if (label) return `${label} (${key})`;
  return key || '—';
}

/** Parse display-ready defaultCoeff — ≥0; KHÔNG phải payroll formula. */
export function parseAttOtTypeDefaultCoeff(raw: string): number | null {
  const n = Number.parseFloat(raw.trim().replace(',', '.'));
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}
