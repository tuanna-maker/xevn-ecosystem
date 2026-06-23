/**
 * Canonical work_item_id patterns for PM scanners (bus, evidence, subagent titles).
 * work_item_id: PM-WORK-ITEM-ID-RE
 */
export const WORK_ITEM_ID_RE =
  /\b(?:P1|PCOMP|GOV|MOB|D-MOB|C|W|AC-FID|J-MOB|HRM)-[A-Z0-9][A-Z0-9-]*/gi;

/** @param {string} text */
export function extractWorkItemIds(text) {
  if (!text) return [];
  const m = text.match(WORK_ITEM_ID_RE);
  return m ? [...new Set(m.map((x) => x.toUpperCase()))] : [];
}

/** Collapse MOB-UX-11d-QC → MOB-UX-11D for handoff/dispatch pairing (U58). */
export function normalizeWorkItemBase(id) {
  const u = String(id || '').toUpperCase();
  return u
    .replace(/-(?:API-)?QC$/i, '')
    .replace(/-QA(?:-DEVICE)?$/i, '')
    .replace(/-DEVICE$/i, '');
}

/** @param {string} handoffId @param {string} dispatchId */
export function workItemsSameSlice(handoffId, dispatchId) {
  const a = normalizeWorkItemBase(handoffId);
  const b = normalizeWorkItemBase(dispatchId);
  return a === b || a.startsWith(`${b}-`) || b.startsWith(`${a}-`);
}
