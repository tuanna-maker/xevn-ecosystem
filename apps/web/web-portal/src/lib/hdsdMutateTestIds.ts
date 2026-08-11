/**
 * Stable data-testid hooks for HDSD holding shareholder mutate (UF-XBOS-05).
 * WorkItem: D-HDSD-MUTATE-FE-02
 */
export const HDSD_SHAREHOLDER_TEST_IDS = {
  addRow: 'hdsd-shareholder-add-row',
} as const;

export function hdsdShareholderSaveTestId(rowId: string): string {
  return `hdsd-shareholder-save-${rowId}`;
}

export function hdsdShareholderNameTestId(rowId: string): string {
  return `hdsd-shareholder-name-${rowId}`;
}
