import { resolveIdentityScope } from './identityScope';
import {
  GROUP_HOLDING_COMPANY_ID,
  isMasterTenant,
  MASTER_TENANT_ID,
  MEMBER_DEFAULT_COMPANY_ID,
} from '../constants/tenant';
import {
  resolveLegalEntityApiIdFromList,
  type LegalEntityIdHints,
} from './legalEntityIdResolver';
import { xbosFetch, xbosGetData } from './xbosHttp';
import { fetchGroupOrgOverview } from './tenantScopeApi';

export { resolveLegalEntityApiIdFromList, type LegalEntityIdHints };

function scopeHeaders(tenantId?: string, companyId?: string, withBody = false) {
  const scope = resolveIdentityScope(tenantId ?? null, companyId ?? null);
  const headers: Record<string, string> = {};
  if (withBody) headers['Content-Type'] = 'application/json';
  return { tenantId: scope.tenantId, companyId: scope.companyId, headers };
}

export type OrgTreeNode = {
  id: string;
  name: string;
  code: string;
  org_type: string;
  payload?: Record<string, unknown>;
  children?: OrgTreeNode[];
};

export type LegalEntityApiRow = {
  id: string;
  tenant_id: string;
  company_id: string;
  code: string;
  name: string;
  entity_type?: string;
  tax_code?: string | null;
  established_at?: string | null;
  address?: string | null;
  business_lines?: string | null;
  charter_capital?: number | null;
  legal_representative?: string | null;
  payload?: Record<string, unknown> | null;
};

export type LegalEntityInputPayload = {
  code: string;
  name: string;
  entityType?: string;
  taxCode?: string;
  establishedAt?: string;
  address?: string;
  businessLines?: string;
  charterCapital?: number;
  legalRepresentative?: string;
  payload?: Record<string, unknown>;
};

export async function fetchOrgTree(tenantId: string): Promise<OrgTreeNode[]> {
  if (isMasterTenant(tenantId)) {
    return [];
  }
  const { tenantId: tid, companyId } = scopeHeaders(tenantId, MEMBER_DEFAULT_COMPANY_ID);
  const data = await xbosGetData<{ tree?: OrgTreeNode[] }>('/org-foundation/org-units/tree', {
    scope: 'org-foundation.org-tree',
    tenantId: tid,
    companyId,
  });
  return data?.tree ?? [];
}

/** UC-CC-01 — load department rows for a legal entity (group overview when master tenant). */
export async function loadLegalEntityDepartmentTree(
  tenantId: string,
  legalEntityId?: string | null,
): Promise<OrgTreeNode[]> {
  if (isMasterTenant(tenantId)) {
    const overview = await fetchGroupOrgOverview();
    const trees = overview?.trees ?? [];
    if (legalEntityId) {
      const match = trees.find((t) => t.tenantId === legalEntityId);
      if (match?.tree?.length) return match.tree;
    }
    return trees.flatMap((t) => t.tree ?? []);
  }
  return fetchOrgTree(tenantId);
}

/** UC-CC-03 — pháp nhân holding (tenant master, company holding). */
export async function fetchHoldingLegalEntities(
  tenantId: string = MASTER_TENANT_ID,
): Promise<LegalEntityApiRow[]> {
  return fetchLegalEntities(tenantId, GROUP_HOLDING_COMPANY_ID);
}

export async function fetchLegalEntities(
  tenantId: string,
  companyId = MEMBER_DEFAULT_COMPANY_ID,
): Promise<LegalEntityApiRow[]> {
  const { tenantId: tid, companyId: cid } = scopeHeaders(tenantId, companyId);
  const data = await xbosGetData<{ items?: LegalEntityApiRow[] }>('/org-foundation/legal-entities', {
    scope: 'org-foundation.legal-entities',
    tenantId: tid,
    companyId: cid,
  });
  return data?.items ?? [];
}

export async function createLegalEntity(
  tenantId: string,
  companyId: string,
  body: LegalEntityInputPayload,
): Promise<LegalEntityApiRow> {
  const { tenantId: tid, companyId: cid, headers } = scopeHeaders(tenantId, companyId, true);
  const envelope = await xbosFetch<{ data?: LegalEntityApiRow }>('/org-foundation/legal-entities', {
    method: 'POST',
    scope: 'org-foundation.legal-entities.create',
    tenantId: tid,
    companyId: cid,
    headers,
    body: JSON.stringify(body),
  });
  if (!envelope?.data) throw new Error('legal entity create returned empty payload');
  return envelope.data;
}

/** UC-CC-03 — resolve + load legal entity row (member unit id may differ from DB uuid). */
export async function resolveLegalEntityApiIdForCompany(
  tenantId: string,
  company: LegalEntityIdHints,
  companyId = MEMBER_DEFAULT_COMPANY_ID,
): Promise<string | null> {
  const items = await fetchLegalEntities(tenantId, companyId);
  return resolveLegalEntityApiIdFromList(company, items);
}

export async function fetchLegalEntityForEdit(
  tenantId: string,
  entityId: string,
  companyId = MEMBER_DEFAULT_COMPANY_ID,
  hints?: { code?: string },
): Promise<LegalEntityApiRow | null> {
  const items = await fetchLegalEntities(tenantId, companyId);
  const resolvedId = resolveLegalEntityApiIdFromList(
    { id: entityId, tenantId, code: hints?.code },
    items,
  );
  if (!resolvedId) {
    return null;
  }
  return items.find((row) => String(row.id) === resolvedId) ?? null;
}

export async function updateLegalEntity(
  tenantId: string,
  companyId: string,
  entityId: string,
  body: LegalEntityInputPayload,
): Promise<LegalEntityApiRow> {
  const { tenantId: tid, companyId: cid, headers } = scopeHeaders(tenantId, companyId, true);
  const envelope = await xbosFetch<{ data?: LegalEntityApiRow }>(
    `/org-foundation/legal-entities/${encodeURIComponent(entityId)}`,
    {
      method: 'PUT',
      scope: 'org-foundation.legal-entities.update',
      tenantId: tid,
      companyId: cid,
      headers,
      body: JSON.stringify(body),
    },
  );
  if (!envelope?.data) throw new Error('legal entity update returned empty payload');
  return envelope.data;
}

export type OrgUnitInputPayload = {
  code: string;
  name: string;
  orgType: string;
  parentId?: string | null;
  legalEntityId?: string | null;
  sortOrder?: number;
  payload?: Record<string, unknown>;
};

export async function saveOrgUnit(
  tenantId: string,
  companyId: string,
  body: OrgUnitInputPayload,
  unitId?: string,
): Promise<Record<string, unknown>> {
  const { tenantId: tid, companyId: cid, headers } = scopeHeaders(tenantId, companyId, true);
  const path = unitId
    ? `/org-foundation/org-units/${encodeURIComponent(unitId)}`
    : '/org-foundation/org-units';
  const envelope = await xbosFetch<{ data?: Record<string, unknown> }>(path, {
    method: unitId ? 'PUT' : 'POST',
    scope: unitId ? 'org-foundation.org-units.update' : 'org-foundation.org-units.create',
    tenantId: tid,
    companyId: cid,
    headers,
    body: JSON.stringify(body),
  });
  if (!envelope?.data) throw new Error('org unit save returned empty payload');
  return envelope.data;
}

export async function deleteOrgUnit(
  tenantId: string,
  companyId: string,
  unitId: string,
): Promise<void> {
  const { tenantId: tid, companyId: cid, headers } = scopeHeaders(tenantId, companyId);
  await xbosFetch(`/org-foundation/org-units/${encodeURIComponent(unitId)}`, {
    method: 'DELETE',
    scope: 'org-foundation.org-units.delete',
    tenantId: tid,
    companyId: cid,
    headers,
  });
}

export function orgTreeToViewNodes(nodes: OrgTreeNode[]): Array<Record<string, unknown>> {
  return nodes.map((n) => ({
    id: n.id,
    name: n.name,
    type: n.org_type === 'department' ? 'department' : 'company',
    children: n.children ? orgTreeToViewNodes(n.children) : [],
  }));
}
