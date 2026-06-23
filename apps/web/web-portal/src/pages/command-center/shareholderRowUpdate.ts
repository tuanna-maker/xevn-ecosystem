/**
 * UC-CC-P0-01 — ratio_percent and contributed_value are independent fields (SRS).
 * No charterCapital×ratio/100 derivation on edit.
 */
export type ShareholderRowEditable = {
  id: string;
  holderName: string;
  identityCode: string;
  ratioPercent: number;
  contributedValue: number;
  submitted: boolean;
};

export function applyShareholderRowFieldUpdate<K extends keyof ShareholderRowEditable>(
  row: ShareholderRowEditable,
  key: K,
  value: ShareholderRowEditable[K],
): ShareholderRowEditable {
  return { ...row, [key]: value };
}
