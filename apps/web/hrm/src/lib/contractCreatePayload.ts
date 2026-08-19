import {
  buildPositionKeyFields,
  type CatalogPickerOption,
} from '@/lib/catalogSearchPicker';

/**
 * @CODE-MEMORY
 * Screen:     /contracts — create payload helpers (position_key E1-A)
 * UC:         UF-HRM-08 · J-HRM-01
 * Purpose:    Resolve position_key for POST contracts; catalog + pass-through pilot NV.
 * WorkItem:   D-HDSD-MUTATE-FE-08 / FE-10 · PO-E2E-SPINE-01-FE-VITE-PAY-CON-01
 * Callers:    pages/Contracts.tsx
 * Callees:    catalogSearchPicker.buildPositionKeyFields
 * must_keep:  FE-09 form-ready gate; FE-07 date prefill; Leave TC-HDSD-08-02-01
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: PO-E2E-SPINE-01-FE-VITE-PAY-CON-01
 * change_mode: FIX
 * What: Restore contractCreatePayload từ stash 43c479a — dep Contracts.tsx mount
 * Why: QA W5 /hr/contracts Vite 500 (EmptyState + this module chain)
 * must_keep: position_key pass-through; U65 no seed
 */

/**
 * Resolve position_key for POST /contracts-insurance/contracts (E1-A required field).
 * D-HDSD-MUTATE-FE-08 — employee job_title_key first, then first job_titles catalog row.
 * D-HDSD-MUTATE-FE-10 — pass-through empKey when catalog row missing; department snapshot fallback (U65 pilot NV).
 */
export function resolveContractCreatePositionKey(input: {
  employeeJobTitleKey?: string | null;
  positionOptions: readonly CatalogPickerOption[];
  /** Department / job title text on form when catalog + job_title_key both empty */
  departmentSnapshot?: string | null;
  /** Last-resort when pilot NV has no catalog row or job_title_key */
  employeeCodeSnapshot?: string | null;
}): { position_key: string; position: string } | null {
  const empKey = input.employeeJobTitleKey?.trim() ?? '';
  if (empKey) {
    const fromEmployee = buildPositionKeyFields(empKey, input.positionOptions);
    if (fromEmployee) return fromEmployee;
    const firstFromCatalog = input.positionOptions[0];
    const catalogKey = firstFromCatalog?.value?.trim() ?? '';
    if (catalogKey) {
      return {
        position_key: catalogKey,
        position: firstFromCatalog!.label?.trim() || catalogKey,
      };
    }
    return { position_key: empKey, position: empKey };
  }
  const first = input.positionOptions[0];
  const firstKey = first?.value?.trim() ?? '';
  if (firstKey) {
    return { position_key: firstKey, position: first.label?.trim() || firstKey };
  }
  const dept = input.departmentSnapshot?.trim() ?? '';
  if (dept) {
    return { position_key: dept, position: dept };
  }
  const empCode = input.employeeCodeSnapshot?.trim() ?? '';
  if (empCode) {
    return { position_key: empCode, position: empCode };
  }
  return null;
}
