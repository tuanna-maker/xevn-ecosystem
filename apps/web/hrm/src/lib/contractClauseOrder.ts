/**
 * @CODE-MEMORY
 * Screen:     Settings mẫu HĐ + form HĐ — reorder clause DnD
 * UC:         FR-UC-BP-CORE-09a · 09b · 09d · UNICOM DnD lock
 * BR:         Persist order → PUT …/clauses junction · layout_json mirror
 * SRS:        docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-UNICOM-OUTLINE-01.md
 * TechSpec:   docs/program/specs/PO-HRM-CONTRACT-LEGAL-PRINT-TECHSPEC-01.md layout_json
 * Purpose:    Pure helpers reorder / add / remove clause ids — testable without DnD DOM.
 * WorkItem:   PO-HRM-CONTRACT-LEGAL-PRINT-FE-01
 * Coded:      2026-08-06
 * Callers:    ContractLegalPrintSettingsPanel · ContractPrintSpinePanel
 * Callees:    none
 * must_keep:  No duplicate id on canvas; same-node drag handle pattern at UI
 * SOLID:      Pure functions — no React / no API
 * LastVerified: contractClauseOrder.test.ts · PO-HRM-MVP-GD1-CORE-09D-CLUSTER-FE-01
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-DYNAMIC-CONFIG-PLATFORM-CTR-CL-SNAPSHOT-BIND-FE-01
 * What: buildTemplateClauseBindPayload — dual layout_json + clause_ids for BE junction
 * Why: QA-03 — layout_json alone không gọi replaceTemplateClauses → snapshot thiếu code bind path
 * must_keep: parseTemplateLayoutJson · DnD helpers
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-CORE-09D-CLUSTER-FE-01
 * What: clauseIdsFromTemplate — prefer display-ready clauses[] over layout_json
 * Why: OBS R-QA-CORE-09B-CLAUSE-FP-EMPTY · F5 PREV non-empty after PUT /clauses
 * must_keep: buildTemplateClauseBindPayload · DnD helpers · printable=false
 */

export type ContractTemplateLayoutJson = {
  /** Ordered clause UUIDs composing the template body. */
  clause_ids: string[];
  chrome?: {
    show_quoc_hieu?: boolean;
  };
};

/**
 * layout_json + clause_ids for BE replaceTemplateClauses (hrm_contract_template_clauses).
 * layout_json alone does not populate issued clauses_snapshot_json code bind (R-CTR-CL-SNAPSHOT-BIND).
 */
export function buildTemplateClauseBindPayload(
  canvasIds: readonly string[],
): { layout_json: ContractTemplateLayoutJson; clause_ids: string[] } {
  const clause_ids = canvasIds
    .map((id) => id.trim())
    .filter((id) => id.length > 0);
  const layout_json: ContractTemplateLayoutJson = {
    clause_ids,
    chrome: { show_quoc_hieu: true },
  };
  return { layout_json, clause_ids };
}

export function parseTemplateLayoutJson(raw: unknown): ContractTemplateLayoutJson {
  if (!raw || typeof raw !== 'object') {
    return { clause_ids: [] };
  }
  const o = raw as { clause_ids?: unknown; chrome?: ContractTemplateLayoutJson['chrome'] };
  const ids = Array.isArray(o.clause_ids)
    ? o.clause_ids.filter((x): x is string => typeof x === 'string' && x.trim().length > 0)
    : [];
  return {
    clause_ids: ids,
    chrome: o.chrome,
  };
}

/**
 * Display-ready clause order from template DTO.
 * Prefer ordered `clauses[]` (junction) — fall back to layout_json.clause_ids.
 */
export function clauseIdsFromTemplate(tpl: {
  clauses?: Array<{ id?: string | null }> | null;
  layout_json?: unknown;
}): string[] {
  const fromClauses = (tpl.clauses ?? [])
    .map((c) => (typeof c?.id === 'string' ? c.id.trim() : ''))
    .filter((id) => id.length > 0);
  if (fromClauses.length > 0) return fromClauses;
  return parseTemplateLayoutJson(tpl.layout_json).clause_ids;
}

/** Reorder list by moving index `from` → `to` (inclusive bounds). */
export function reorderByIndex<T>(items: readonly T[], from: number, to: number): T[] {
  if (from < 0 || from >= items.length || to < 0 || to >= items.length || from === to) {
    return [...items];
  }
  const next = [...items];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

/**
 * Drop a library clause onto template canvas.
 * - If already on canvas → reorder to `toIndex`.
 * - Else insert at `toIndex` (clamped).
 */
export function placeClauseOnCanvas(
  canvasIds: readonly string[],
  clauseId: string,
  toIndex: number,
): string[] {
  const id = clauseId.trim();
  if (!id) return [...canvasIds];
  const existing = canvasIds.indexOf(id);
  if (existing >= 0) {
    return reorderByIndex(canvasIds, existing, Math.min(Math.max(0, toIndex), canvasIds.length - 1));
  }
  const next = [...canvasIds];
  const insertAt = Math.min(Math.max(0, toIndex), next.length);
  next.splice(insertAt, 0, id);
  return next;
}

export function removeClauseFromCanvas(canvasIds: readonly string[], clauseId: string): string[] {
  return canvasIds.filter((id) => id !== clauseId);
}

/** Filter library clauses applicable to pack (`*` or pack code). */
export function filterClausesForPack<T extends { apply_to_packs?: string[] | null; status?: string }>(
  clauses: readonly T[],
  packCode: string,
  opts?: { activeOnly?: boolean },
): T[] {
  const pack = packCode.trim().toUpperCase();
  return clauses.filter((c) => {
    if (opts?.activeOnly && c.status && c.status !== 'active') return false;
    const packs = c.apply_to_packs ?? [];
    if (packs.length === 0) return true;
    return packs.some((p) => p === '*' || p.toUpperCase() === pack);
  });
}
