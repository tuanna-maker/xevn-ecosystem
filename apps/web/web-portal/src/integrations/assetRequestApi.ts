import { buildApiAuthHeaders } from './authSession';
import { resolveXbosStrictCompanyId } from './commandCenterScope';
import { resolveIdentityScope } from './identityScope';

export type AssetRequestRow = {
  id: string;
  tenant_id?: string;
  company_id?: string;
  asset_id?: string | null;
  request_code?: string;
  status?: string;
  requested_by?: string | null;
  payload?: Record<string, unknown> | null;
  created_at?: string;
  updated_at?: string;
};

export const ASSET_REQUEST_STATUS_FLOW = [
  'draft',
  'pending_finance',
  'finance_confirmed',
  'recorded',
  'assigned',
  'completed',
] as const;

export type AssetRequestStatus = (typeof ASSET_REQUEST_STATUS_FLOW)[number];

export const ASSET_REQUEST_STATUS_LABELS: Record<string, string> = {
  draft: 'Nháp',
  pending_finance: 'Chờ KT duyệt',
  finance_confirmed: 'KT đã xác nhận',
  recorded: 'Đã ghi sổ',
  assigned: 'Đã giao tài sản',
  completed: 'Hoàn tất',
};

async function headers(companyHint?: string | null, withBody = false) {
  const scope = resolveIdentityScope(null, companyHint ?? null);
  const companyId = resolveXbosStrictCompanyId(scope.tenantId, companyHint ?? scope.companyId);
  const h: Record<string, string> = {
    ...buildApiAuthHeaders(),
    'x-tenant-id': scope.tenantId,
    'x-company-id': companyId,
  };
  if (withBody) h['Content-Type'] = 'application/json';
  return { headers: h, scope };
}

function nextStatus(current: string | undefined): AssetRequestStatus | null {
  const idx = ASSET_REQUEST_STATUS_FLOW.indexOf((current ?? '') as AssetRequestStatus);
  if (idx < 0 || idx >= ASSET_REQUEST_STATUS_FLOW.length - 1) return null;
  return ASSET_REQUEST_STATUS_FLOW[idx + 1];
}

export function resolveAssetRequestNextStatus(current: string | undefined): AssetRequestStatus | null {
  return nextStatus(current);
}

export async function listAssetRequests(companyHint?: string | null): Promise<AssetRequestRow[]> {
  const { headers: h } = await headers(companyHint);
  const res = await fetch('/api/xbos/asset-requests', { headers: h });
  if (!res.ok) throw new Error('asset requests load failed');
  const json = await res.json();
  return (json?.data?.items ?? []) as AssetRequestRow[];
}

export async function createAssetRequest(
  input: {
    requestCode?: string;
    assetId?: string | null;
    requestedBy?: string;
    payload?: Record<string, unknown>;
  },
  companyHint?: string | null,
): Promise<AssetRequestRow> {
  const { headers: h } = await headers(companyHint, true);
  const res = await fetch('/api/xbos/asset-requests', {
    method: 'POST',
    headers: h,
    body: JSON.stringify({
      requestCode: input.requestCode,
      assetId: input.assetId ?? null,
      requestedBy: input.requestedBy ?? 'portal-user',
      payload: input.payload ?? {},
    }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(json?.message ?? 'asset request create failed');
  }
  return json?.data as AssetRequestRow;
}

export async function transitionAssetRequest(
  requestId: string,
  status: string,
  companyHint?: string | null,
  actor?: string,
): Promise<AssetRequestRow> {
  const { headers: h } = await headers(companyHint, true);
  const res = await fetch(`/api/xbos/asset-requests/${encodeURIComponent(requestId)}/transition`, {
    method: 'POST',
    headers: h,
    body: JSON.stringify({ status, actor: actor ?? 'portal-user' }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(json?.message ?? 'asset request transition failed');
  }
  return json?.data as AssetRequestRow;
}
