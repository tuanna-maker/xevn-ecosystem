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
import { normalizeLegalEntityPutBody } from './legalEntityPutBody';
import { xbosFetch, xbosGetData } from './xbosHttp';
import { fetchGroupOrgOverview, GROUP_HOLDING_ROOT_ID } from './tenantScopeApi';

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
  return fetchOrgTreeForScope(tenantId, MEMBER_DEFAULT_COMPANY_ID);
}

export async function fetchOrgTreeForScope(
  tenantId: string,
  companyId: string,
): Promise<OrgTreeNode[]> {
  const { tenantId: tid, companyId: cid } = scopeHeaders(tenantId, companyId);
  const data = await xbosGetData<{
    tree?: OrgTreeNode[] | Array<{ tenantId?: string; tree?: OrgTreeNode[] }>;
    mode?: string;
  }>('/org-foundation/org-units/tree', {
    scope: 'org-foundation.org-tree',
    tenantId: tid,
    companyId: cid,
  });
  const tree = data?.tree;
  if (!Array.isArray(tree) || tree.length === 0) {
    return [];
  }
  const first = tree[0];
  if (first && typeof first === 'object' && 'tenantId' in first && 'tree' in first) {
    return [];
  }
  return tree as OrgTreeNode[];
}

/** UF-XBOS-12 — scoped tree reload after org-unit save (legal_entity_id query). */
export async function fetchOrgTreeForLegalEntity(
  legalEntityId: string,
  tenantId?: string,
  companyId?: string,
): Promise<OrgTreeNode[]> {
  const trimmed = legalEntityId.trim();
  if (!trimmed) return [];
  const { tenantId: tid, companyId: cid } = scopeHeaders(tenantId, companyId);
  const search = new URLSearchParams({ legal_entity_id: trimmed });
  const data = await xbosGetData<{ tree?: OrgTreeNode[] }>(
    `/org-foundation/org-units/tree?${search.toString()}`,
    {
      scope: 'org-foundation.org-tree-legal-entity',
      tenantId: tid,
      companyId: cid,
    },
  );
  return Array.isArray(data?.tree) ? data.tree : [];
}

export type LegalEntityDepartmentTreeHints = LegalEntityIdHints & {
  entityLevel?: string | null;
};

export function isHoldingDepartmentScope(
  hints: Pick<LegalEntityDepartmentTreeHints, 'id' | 'entityLevel'>,
): boolean {
  return hints.id === GROUP_HOLDING_ROOT_ID || hints.entityLevel === 'parent';
}

/** Resolve persisted legal-entity UUID + XBOS company partition for org-unit writes. */
export async function resolveDepartmentSaveContext(
  hints: LegalEntityDepartmentTreeHints,
): Promise<{ tenantId: string; companyId: string; legalEntityId: string | null }> {
  const scopeTenantId = hints.tenantId?.trim() || MASTER_TENANT_ID;
  const holding = isHoldingDepartmentScope(hints);
  const companyId = holding ? GROUP_HOLDING_COMPANY_ID : MEMBER_DEFAULT_COMPANY_ID;
  const saveTenantId = holding ? MASTER_TENANT_ID : scopeTenantId;

  if (holding) {
    const items = await fetchHoldingLegalEntities(scopeTenantId);
    return {
      tenantId: saveTenantId,
      companyId,
      legalEntityId: resolveLegalEntityApiIdFromList(hints, items),
    };
  }

  const listTenantId = isMasterTenant(scopeTenantId) ? MASTER_TENANT_ID : scopeTenantId;
  const items = await fetchLegalEntities(listTenantId, MEMBER_DEFAULT_COMPANY_ID);
  const legalEntityId =
    resolveLegalEntityApiIdFromList(hints, items) ??
    (hints.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(hints.id)
      ? hints.id
      : null);

  return { tenantId: saveTenantId, companyId, legalEntityId };
}

/** UC-CC-01 / J-XBOS-07 — department tree keyed by UI legal-entity id (holding root or member UUID). */
export async function loadLegalEntityDepartmentTree(
  tenantId: string,
  legalEntityUiId?: string | null,
  hints?: LegalEntityDepartmentTreeHints,
): Promise<OrgTreeNode[]> {
  const uiId = (legalEntityUiId ?? hints?.id ?? '').trim();
  const scopeHints: LegalEntityDepartmentTreeHints = {
    id: uiId,
    tenantId: hints?.tenantId?.trim() || tenantId,
    code: hints?.code,
    entityLevel: hints?.entityLevel,
  };
  const holding = isHoldingDepartmentScope(scopeHints);

  try {
    const overview = await fetchGroupOrgOverview();
    const trees = overview?.trees ?? [];
    if (uiId) {
      const match = trees.find((t) => t.tenantId === uiId);
      if (match?.tree?.length) {
        return match.tree;
      }
    }
    if (holding) {
      const holdingMatch = trees.find((t) => t.tenantId === GROUP_HOLDING_ROOT_ID);
      if (holdingMatch?.tree?.length) {
        return holdingMatch.tree;
      }
    }
  } catch {
    /* direct tree fallback below */
  }

  try {
    const ctx = await resolveDepartmentSaveContext(scopeHints);
    if (ctx.legalEntityId) {
      const scopedTree = await fetchOrgTreeForLegalEntity(
        ctx.legalEntityId,
        ctx.tenantId,
        ctx.companyId,
      );
      if (scopedTree.length > 0) {
        return scopedTree;
      }
    }
  } catch {
    /* legacy fallbacks below */
  }

  if (holding) {
    try {
      const tree = await fetchOrgTreeForScope(MASTER_TENANT_ID, GROUP_HOLDING_COMPANY_ID);
      if (tree.length > 0) {
        return tree;
      }
    } catch {
      return [];
    }
  }

  const memberTenantId = scopeHints.tenantId?.trim() || tenantId;
  if (!isMasterTenant(memberTenantId)) {
    try {
      return await fetchOrgTreeForScope(memberTenantId, MEMBER_DEFAULT_COMPANY_ID);
    } catch {
      return [];
    }
  }

  return [];
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
    body: JSON.stringify(normalizeLegalEntityPutBody(body)),
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
      body: JSON.stringify(normalizeLegalEntityPutBody(body)),
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

/** Flatten org tree and match department/unit by code (case-insensitive). */
export function findOrgUnitInTreeByCode(nodes: OrgTreeNode[], code: string): OrgTreeNode | null {
  const normalized = code.trim().toLowerCase();
  if (!normalized) return null;
  for (const node of nodes) {
    if ((node.code ?? '').trim().toLowerCase() === normalized) {
      return node;
    }
    if (node.children?.length) {
      const nested = findOrgUnitInTreeByCode(node.children, code);
      if (nested) return nested;
    }
  }
  return null;
}

export function isOrgUnitDuplicateKeyError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const msg = error.message.toLowerCase();
  return (
    msg.includes('duplicate key') ||
    msg.includes('unique constraint') ||
    msg.includes('already exists')
  );
}

async function resolveExistingOrgUnitIdByCode(
  tenantId: string,
  companyId: string,
  code: string,
): Promise<string | null> {
  const trimmed = code.trim();
  if (!trimmed) return null;
  try {
    const tree = await fetchOrgTreeForScope(tenantId, companyId);
    const existing = findOrgUnitInTreeByCode(tree, trimmed);
    return existing?.id ? String(existing.id) : null;
  } catch {
    return null;
  }
}

async function performOrgUnitSave(
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

/** D-W4-DEPT-DUP-SAVE-01 — upsert by code when client row id is not yet persisted. */
export async function saveOrgUnit(
  tenantId: string,
  companyId: string,
  body: OrgUnitInputPayload,
  unitId?: string,
): Promise<Record<string, unknown>> {
  const { tenantId: tid, companyId: cid } = scopeHeaders(tenantId, companyId);
  let resolvedUnitId = unitId;

  if (!resolvedUnitId && body.code?.trim()) {
    resolvedUnitId = (await resolveExistingOrgUnitIdByCode(tid, cid, body.code)) ?? undefined;
  }

  try {
    return await performOrgUnitSave(tid, cid, body, resolvedUnitId);
  } catch (error) {
    if (!unitId && isOrgUnitDuplicateKeyError(error)) {
      const existingId = await resolveExistingOrgUnitIdByCode(tid, cid, body.code);
      if (existingId) {
        return performOrgUnitSave(tid, cid, body, existingId);
      }
    }
    throw error;
  }
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
