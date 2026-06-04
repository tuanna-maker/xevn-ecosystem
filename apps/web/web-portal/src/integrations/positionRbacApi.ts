import { resolveXbosStrictCompanyId } from './commandCenterScope';
import { resolveIdentityScope } from './identityScope';

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

export async function listPositionTemplates(tenantIdHint?: string | null, companyIdHint?: string | null) {
  const { headers: h } = await headers(tenantIdHint, companyIdHint);
  const res = await fetch('/api/xbos/position-rbac/templates', { headers: h });
  if (!res.ok) throw new Error('templates load failed');
  const json = await res.json();
  return json?.data?.items ?? [];
}

export type PermissionMatrixCell = {
  rowId: string;
  view: boolean;
  write: boolean;
  delete: boolean;
  approve: boolean;
  dataScope: string;
};

export async function fetchPermissionMatrix(
  roleId: string,
  tenantIdHint?: string | null,
): Promise<PermissionMatrixCell[]> {
  const { headers: h } = await headers(tenantIdHint, null);
  const res = await fetch(
    `/api/xbos/position-rbac/matrix?roleId=${encodeURIComponent(roleId)}`,
    { headers: h },
  );
  if (!res.ok) throw new Error('permission matrix load failed');
  const json = await res.json();
  return json?.data?.rows ?? [];
}

export async function savePermissionMatrix(
  roleId: string,
  rows: PermissionMatrixCell[],
  tenantIdHint?: string | null,
): Promise<void> {
  const { headers: h } = await headers(tenantIdHint, null, true);
  const res = await fetch('/api/xbos/position-rbac/matrix', {
    method: 'PUT',
    headers: h,
    body: JSON.stringify({ roleId, rows }),
  });
  if (!res.ok) throw new Error('permission matrix save failed');
}

export async function savePositionTemplate(
  body: Record<string, unknown>,
  templateId?: string,
  tenantIdHint?: string | null,
  companyIdHint?: string | null,
) {
  const { headers: h } = await headers(tenantIdHint, companyIdHint, true);
  const url = templateId
    ? `/api/xbos/position-rbac/templates/${encodeURIComponent(templateId)}`
    : '/api/xbos/position-rbac/templates';
  const res = await fetch(url, { method: templateId ? 'PUT' : 'POST', headers: h, body: JSON.stringify(body) });
  if (!res.ok) throw new Error('template save failed');
  return res.json();
}
