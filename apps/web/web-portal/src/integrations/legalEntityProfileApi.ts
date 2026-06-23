import {
  GROUP_HOLDING_COMPANY_ID,
  MASTER_TENANT_ID,
  MEMBER_DEFAULT_COMPANY_ID,
} from '../constants/tenant';
import { resolveLegalEntityApiIdFromList } from './legalEntityIdResolver';
import { fetchHoldingLegalEntities } from './orgFoundationApi';
import { GROUP_HOLDING_ROOT_ID } from './tenantScopeApi';
import { xbosFetch, xbosGetData } from './xbosHttp';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isPersistedShareholderId(id: string): boolean {
  return UUID_RE.test(id);
}

/** Resolve UI holding root / holding UUID → persisted UUID + holding partition (UF-XBOS-05). */
export async function resolveShareholderEntityScope(
  entityId: string,
  tenantId: string,
): Promise<{ entityId: string; tenantId: string; companyId: string }> {
  if (entityId === GROUP_HOLDING_ROOT_ID) {
    const holdingRows = await fetchHoldingLegalEntities(tenantId);
    const resolved = resolveLegalEntityApiIdFromList(
      { id: GROUP_HOLDING_ROOT_ID, tenantId },
      holdingRows,
    );
    if (!resolved) {
      throw new Error('Chưa có hồ sơ tập đoàn — lưu pháp nhân trước khi ghi cổ đông.');
    }
    return {
      entityId: resolved,
      tenantId: MASTER_TENANT_ID,
      companyId: GROUP_HOLDING_COMPANY_ID,
    };
  }

  if (isPersistedShareholderId(entityId)) {
    const holdingRows = (await fetchHoldingLegalEntities(tenantId)) ?? [];
    const holdingMatch = holdingRows.find(
      (row) => String(row.id) === entityId && row.entity_type === 'holding',
    );
    if (holdingMatch) {
      return {
        entityId,
        tenantId: MASTER_TENANT_ID,
        companyId: GROUP_HOLDING_COMPANY_ID,
      };
    }
  }

  return { entityId, tenantId, companyId: MEMBER_DEFAULT_COMPANY_ID };
}

function scopeInit(tenantId: string, companyId = MEMBER_DEFAULT_COMPANY_ID, withBody = false) {
  return {
    tenantId,
    companyId,
    headers: withBody ? { 'Content-Type': 'application/json' } : undefined,
  };
}

export type ShareholderApiRow = {
  id: string;
  holder_name: string;
  identity_code?: string | null;
  ratio_percent?: number | string | null;
  contributed_value?: number | string | null;
};

export type LegalDocumentApiRow = {
  id: string;
  document_code?: string | null;
  document_name: string;
  issued_date?: string | null;
  expired_date?: string | null;
  file_url?: string | null;
  mime_type?: string | null;
  file_size?: number | null;
};

export async function listShareholders(entityId: string, tenantId: string): Promise<ShareholderApiRow[]> {
  const scope = await resolveShareholderEntityScope(entityId, tenantId);
  const data = await xbosGetData<{ items?: ShareholderApiRow[] }>(
    `/org-foundation/legal-entities/${encodeURIComponent(scope.entityId)}/shareholders`,
    { scope: 'legal-entity.shareholders.list', ...scopeInit(scope.tenantId, scope.companyId) },
  );
  return data?.items ?? [];
}

export async function saveShareholder(
  entityId: string,
  tenantId: string,
  body: { holderName: string; identityCode?: string; ratioPercent?: number; contributedValue?: number },
  shareholderId?: string,
): Promise<ShareholderApiRow> {
  const scope = await resolveShareholderEntityScope(entityId, tenantId);
  const path = shareholderId
    ? `/org-foundation/legal-entities/${encodeURIComponent(scope.entityId)}/shareholders/${encodeURIComponent(shareholderId)}`
    : `/org-foundation/legal-entities/${encodeURIComponent(scope.entityId)}/shareholders`;
  const envelope = await xbosFetch<{ data?: ShareholderApiRow }>(path, {
    method: shareholderId ? 'PUT' : 'POST',
    scope: shareholderId ? 'legal-entity.shareholders.update' : 'legal-entity.shareholders.create',
    ...scopeInit(scope.tenantId, scope.companyId, true),
    body: JSON.stringify(body),
  });
  if (!envelope?.data) throw new Error('shareholder save returned empty payload');
  return envelope.data;
}

export async function deleteShareholderApi(
  entityId: string,
  tenantId: string,
  shareholderId: string,
): Promise<void> {
  const scope = await resolveShareholderEntityScope(entityId, tenantId);
  await xbosFetch(
    `/org-foundation/legal-entities/${encodeURIComponent(scope.entityId)}/shareholders/${encodeURIComponent(shareholderId)}`,
    {
      method: 'DELETE',
      scope: 'legal-entity.shareholders.delete',
      ...scopeInit(scope.tenantId, scope.companyId),
    },
  );
}

export type ShareholderFormRow = {
  id: string;
  holderName: string;
  identityCode?: string;
  ratioPercent?: number;
  contributedValue?: number;
};

/** Persist all non-empty shareholder rows (POST new / PUT existing) — used on legal entity save. */
export async function syncShareholders(
  entityId: string,
  tenantId: string,
  rows: ShareholderFormRow[],
): Promise<ShareholderApiRow[]> {
  const toSave = rows.filter((r) => String(r.holderName ?? '').trim());
  const results: ShareholderApiRow[] = [];
  for (const row of toSave) {
    const saved = await saveShareholder(
      entityId,
      tenantId,
      {
        holderName: row.holderName.trim(),
        identityCode: row.identityCode?.trim() || undefined,
        ratioPercent: row.ratioPercent,
        contributedValue: row.contributedValue,
      },
      isPersistedShareholderId(row.id) ? row.id : undefined,
    );
    results.push(saved);
  }
  return results;
}

export async function listLegalDocuments(entityId: string, tenantId: string): Promise<LegalDocumentApiRow[]> {
  const data = await xbosGetData<{ items?: LegalDocumentApiRow[] }>(
    `/org-foundation/legal-entities/${encodeURIComponent(entityId)}/documents`,
    { scope: 'legal-entity.documents.list', ...scopeInit(tenantId) },
  );
  return data?.items ?? [];
}

export async function saveLegalDocument(
  entityId: string,
  tenantId: string,
  body: { documentName: string; documentCode?: string; issuedDate?: string; expiredDate?: string },
  documentId?: string,
): Promise<LegalDocumentApiRow> {
  const path = documentId
    ? `/org-foundation/legal-entities/${encodeURIComponent(entityId)}/documents/${encodeURIComponent(documentId)}`
    : `/org-foundation/legal-entities/${encodeURIComponent(entityId)}/documents`;
  const envelope = await xbosFetch<{ data?: LegalDocumentApiRow }>(path, {
    method: documentId ? 'PUT' : 'POST',
    scope: documentId ? 'legal-entity.documents.update' : 'legal-entity.documents.create',
    ...scopeInit(tenantId, MEMBER_DEFAULT_COMPANY_ID, true),
    body: JSON.stringify(body),
  });
  if (!envelope?.data) throw new Error('document save returned empty payload');
  return envelope.data;
}

export async function uploadLegalDocumentFile(
  entityId: string,
  tenantId: string,
  documentId: string,
  file: File,
): Promise<LegalDocumentApiRow> {
  const form = new FormData();
  form.append('file', file);
  const init = scopeInit(tenantId);
  const envelope = await xbosFetch<{ data?: LegalDocumentApiRow }>(
    `/org-foundation/legal-entities/${encodeURIComponent(entityId)}/documents/${encodeURIComponent(documentId)}/upload`,
    {
      method: 'POST',
      scope: 'legal-entity.documents.upload',
      ...init,
      body: form,
    },
  );
  if (!envelope?.data) throw new Error('document upload returned empty payload');
  return envelope.data;
}

export async function deleteLegalDocumentApi(
  entityId: string,
  tenantId: string,
  documentId: string,
): Promise<void> {
  await xbosFetch(
    `/org-foundation/legal-entities/${encodeURIComponent(entityId)}/documents/${encodeURIComponent(documentId)}`,
    {
      method: 'DELETE',
      scope: 'legal-entity.documents.delete',
      ...scopeInit(tenantId),
    },
  );
}

export function legalDocumentViewUrl(documentId: string): string {
  return `/api/xbos/org-foundation/legal-documents/${encodeURIComponent(documentId)}/file`;
}
