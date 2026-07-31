import { normalizeHrmApiListCompanyId } from '@/lib/hrmListScope';

export type SettingsCatalogItemWriteInput = {
  companyId: string;
  catalogKey: string;
  code: string;
  label: string;
  itemValue?: string;
  /** active = in picker; draft = soft-stop / ngưng (AC-SET-UI-03). */
  status?: 'active' | 'draft';
};

/** POST /api/hrm/settings-catalogs/items — UF-HRM-10 contract (category_key + item_key + item_name). */
export function buildSettingsCatalogItemPayload(input: SettingsCatalogItemWriteInput) {
  const catalogKey = input.catalogKey.trim().toLowerCase();
  const code = input.code.trim();
  const label = input.label.trim();
  return {
    company_id: normalizeHrmApiListCompanyId(input.companyId),
    category_key: catalogKey,
    item_key: code,
    item_name: label,
    ...(input.itemValue?.trim() ? { item_value: input.itemValue.trim() } : {}),
    ...(input.status === 'draft' || input.status === 'active' ? { status: input.status } : {}),
  };
}
