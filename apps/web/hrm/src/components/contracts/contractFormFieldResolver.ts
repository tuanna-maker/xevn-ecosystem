/**
 * @CODE-MEMORY
 * Screen:     /contracts create-edit — hrm_contract_form_fields visibility
 * UC:         UF-HRM-10 · AC-SET-FS consumer matrix
 * SRS:        docs/hrm/API_DESIGN_HRM_SETTINGS_CATALOG.md
 * Purpose:    Resolve active contract form fields from Settings catalog; spine fields always mount when catalog partial.
 * WorkItem:   PO-HRM-SETTINGS-FIDELITY-FE-03
 * Coded:      2026-08-10
 * must_keep:  department picker (ctr-create-department-picker) when catalog omits department row
 * @CODE-MEMORY-CHANGE 2026-08-10 HRM-CTR-CREATE-REDESIGN-FE-03
 * What: isContractCreateWizardFormReady — hdsd-contracts-form-ready after catalogs settle; template empty CTA Settings
 * Why: QA CTRCREATEQA02-MSN049ZL timeout — cấm gate employee/type khi U65 template_list=0
 */

import type { HrmSettingsCatalogOverviewRow } from '@/integrations/hrmApi';

export type ContractFormFieldKey =
  | 'contract_code'
  | 'employee_name'
  | 'department'
  | 'contract_type'
  | 'effective_date'
  | 'expiry_date'
  | 'status'
  | 'notes'
  | 'file_url';

export const DEFAULT_CONTRACT_FORM_FIELDS: readonly ContractFormFieldKey[] = [
  'contract_code',
  'employee_name',
  'department',
  'contract_type',
  'effective_date',
  'expiry_date',
  'status',
  'notes',
  'file_url',
] as const;

/** Always visible on create wizard even when hrm_contract_form_fields catalog is partial (peer EmployeeFormDialog basic spine). */
export const REQUIRED_CONTRACT_FORM_FIELDS: readonly ContractFormFieldKey[] = [
  'contract_code',
  'employee_name',
  'department',
] as const;

export function buildActiveContractFormFields(
  catalog: HrmSettingsCatalogOverviewRow | undefined,
): Set<ContractFormFieldKey> {
  const configured = new Set<ContractFormFieldKey>();
  for (const item of catalog?.effectiveItems ?? []) {
    if (item.status !== 'active') continue;
    const code = item.code as ContractFormFieldKey;
    if (DEFAULT_CONTRACT_FORM_FIELDS.includes(code)) {
      configured.add(code);
    }
  }
  if (configured.size === 0) {
    return new Set(DEFAULT_CONTRACT_FORM_FIELDS);
  }
  for (const req of REQUIRED_CONTRACT_FORM_FIELDS) {
    configured.add(req);
  }
  return configured;
}

/**
 * HDSD / QA `hdsd-contracts-form-ready` — wizard shell interactive after settings catalogs settle.
 * Cấm gate employee, template list, or contract_type picker (resolved at submit / registry-only).
 */
export function isContractCreateWizardFormReady(params: {
  editing: boolean;
  catalogsLoading: boolean;
}): boolean {
  if (params.editing) return true;
  return !params.catalogsLoading;
}
