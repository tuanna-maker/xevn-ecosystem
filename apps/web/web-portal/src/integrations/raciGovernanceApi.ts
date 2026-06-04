import { resolveXbosStrictCompanyId } from './commandCenterScope';
import { resolveIdentityScope } from './identityScope';
import { normalizeRaciLettersInput } from './raciGovernanceHelpers';

export { RACI_CATALOG_SEED_CMD } from './raciGovernanceHelpers';

async function headers(tenantIdHint?: string | null, companyIdHint?: string | null, withBody = false) {
  const scope = resolveIdentityScope(tenantIdHint ?? null, companyIdHint ?? null);
  const companyId = resolveXbosStrictCompanyId(scope.tenantId, companyIdHint ?? scope.companyId);
  const h: Record<string, string> = {
    'x-tenant-id': scope.tenantId,
    'x-company-id': companyId,
  };
  const key = import.meta.env.VITE_INTERNAL_API_KEY?.trim();
  if (key) h['x-internal-api-key'] = key;
  if (withBody) h['Content-Type'] = 'application/json';
  return { headers: h, scope };
}

export type RaciDomainSummary = {
  domain_code: string;
  domain_label: string;
  count: number;
};

export type RaciCatalogPayload = {
  domains: RaciDomainSummary[];
  activities: RaciActivityRow[];
  total: number;
};

export type RaciActivityRow = {
  id: string;
  activity_code: string;
  domain_code: string;
  domain_label: string;
  seq_no: number;
  name: string;
  default_matrix: Record<string, string>;
};

export type RaciMatrixRow = {
  activity_id: string;
  activity_code: string;
  domain_code: string;
  domain_label: string;
  seq_no: number;
  name: string;
  matrix: Record<string, string>;
  has_override?: boolean;
};

export type RaciCapabilityRow = {
  id?: string;
  activity_code: string;
  activity_name?: string;
  module_code: string;
  feature_code: string;
  permission_code?: string;
  raci_letter_required?: string;
  status?: string;
};

export async function fetchRaciCatalog(domain?: string, tenantIdHint?: string | null, companyIdHint?: string | null) {
  const { headers: h } = await headers(tenantIdHint, companyIdHint);
  const q = domain ? `?domain=${encodeURIComponent(domain)}` : '';
  const res = await fetch(`/api/xbos/raci-governance/catalog${q}`, { headers: h });
  if (!res.ok) throw new Error('Không tải được danh mục RACI');
  const json = await res.json();
  return json?.data as RaciCatalogPayload;
}

/** UC-RACI-04 — local bindings until PUT /column-binding ships on xbos-api. */
export function buildRaciMatrixCellBody(
  activityId: string,
  orgColumnId: string,
  rawLetters: string,
): { activity_id: string; org_column_id: string; raci_letters: string } {
  return {
    activity_id: activityId,
    org_column_id: orgColumnId,
    raci_letters: normalizeRaciLettersInput(rawLetters),
  };
}

export async function fetchCompanyRaciMatrix(
  companyId: string,
  domain?: string,
  tenantIdHint?: string | null,
  companyIdHint?: string | null,
) {
  const { headers: h } = await headers(tenantIdHint, companyIdHint);
  const q = domain ? `?domain=${encodeURIComponent(domain)}` : '';
  const res = await fetch(`/api/xbos/raci-governance/companies/${encodeURIComponent(companyId)}/matrix${q}`, {
    headers: h,
  });
  if (!res.ok) throw new Error('Không tải được ma trận RACI');
  const json = await res.json();
  return json?.data as { company_id: string; rows: RaciMatrixRow[] };
}

export async function fetchRaciCapabilities(
  activityCode?: string,
  tenantIdHint?: string | null,
  companyIdHint?: string | null,
) {
  const { headers: h } = await headers(tenantIdHint, companyIdHint);
  const q = activityCode ? `?activityCode=${encodeURIComponent(activityCode)}` : '';
  const res = await fetch(`/api/xbos/raci-governance/capabilities${q}`, { headers: h });
  if (!res.ok) throw new Error('Không tải được ánh xạ phân hệ');
  const json = await res.json();
  return (json?.data?.items ?? []) as RaciCapabilityRow[];
}

export async function fetchRaciCoverage(
  companyId: string,
  tenantIdHint?: string | null,
  companyIdHint?: string | null,
) {
  const { headers: h } = await headers(tenantIdHint, companyIdHint);
  const res = await fetch(`/api/xbos/raci-governance/companies/${encodeURIComponent(companyId)}/coverage`, {
    headers: h,
  });
  if (!res.ok) throw new Error('Không tải được báo cáo phủ');
  const json = await res.json();
  return json?.data as {
    activities_total: number;
    activities_with_capability_map: number;
    activities_with_matrix_letters: number;
    capability_coverage_pct: number;
  };
}

export async function saveRaciMatrixCell(
  companyId: string,
  body: { activity_id: string; org_column_id: string; raci_letters: string; actor_id?: string },
  tenantIdHint?: string | null,
  companyIdHint?: string | null,
) {
  const { headers: h } = await headers(tenantIdHint, companyIdHint, true);
  const res = await fetch(`/api/xbos/raci-governance/companies/${encodeURIComponent(companyId)}/matrix/cell`, {
    method: 'PUT',
    headers: h,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Không lưu được ô ma trận');
  return res.json();
}
