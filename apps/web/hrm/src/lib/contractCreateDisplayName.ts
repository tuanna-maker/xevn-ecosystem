/**
 * @CODE-MEMORY
 * Screen:     /contracts wizard — Tên HĐ read-only (Q3-B)
 * UC:         FR-UC-BP-CORE-09a · AC-CTR-FIELD-01
 * WorkItem:   PO-HRM-CTR-CREATE-REDESIGN-FE-03
 * Purpose:    Derive display contract name from mã HĐ + loại HĐ (catalog label).
 */
import type { CatalogPickerOption } from '@/lib/catalogSearchPicker';

export function deriveContractDisplayName(
  contractCode: string,
  contractType: string,
  contractTypeOptions: readonly CatalogPickerOption[],
): string {
  const code = contractCode.trim();
  const typeLabel =
    contractTypeOptions.find((o) => o.value === contractType)?.label?.trim() ||
    contractType.trim();
  if (!code && !typeLabel) return '';
  if (!code) return typeLabel;
  if (!typeLabel) return code;
  return `${code} — ${typeLabel}`;
}
