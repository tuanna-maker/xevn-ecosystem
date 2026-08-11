/**
 * @CODE-MEMORY
 * Screen: Command Center — holding shareholder table (UF-XBOS-05)
 * UC: UC-CC-03 · UF-XBOS-05
 * SRS: docs/ecosystem/SRS.md · Thêm/sửa cổ đông holding · FE sau POST 2xx hiển thị row + F5
 * TechSpec: legal-entity-profile shareholders API
 * Purpose: Map API shareholder rows ↔ UI state; refetch list sau mutate để F5 và post-save đồng bộ.
 * WorkItem: D-HDSD-MUTATE-SHR-F5-01
 * Coded: 2026-07-30
 * must_keep: holder_name snake_case từ BE; U65 không mock seed cổ đông; testid giữ nguyên ở CommandCenterPage
 */
import type { ShareholderApiRow } from '../../integrations/legalEntityProfileApi';
import { listShareholders } from '../../integrations/legalEntityProfileApi';

export type ShareholderUiRow = {
  id: string;
  holderName: string;
  identityCode: string;
  ratioPercent: number;
  contributedValue: number;
  submitted: boolean;
};

export function mapShareholderApiRowToUiRow(row: ShareholderApiRow): ShareholderUiRow {
  return {
    id: String(row.id),
    holderName: String(row.holder_name ?? ''),
    identityCode: String(row.identity_code ?? ''),
    ratioPercent: Number(row.ratio_percent ?? 0),
    contributedValue: Number(row.contributed_value ?? 0),
    submitted: true,
  };
}

export function mapShareholderApiRowsToUiRows(rows: ShareholderApiRow[]): ShareholderUiRow[] {
  return rows.map(mapShareholderApiRowToUiRow);
}

/** Authoritative list load — dùng sau save và khi mở holding edit (F5 persist). */
export async function fetchShareholderUiRows(
  entityApiKey: string,
  tenantId: string,
): Promise<ShareholderUiRow[]> {
  const items = await listShareholders(entityApiKey, tenantId);
  return mapShareholderApiRowsToUiRows(items);
}
