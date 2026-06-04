import { MEMBER_DEFAULT_COMPANY_ID } from '../constants/tenant';
import { xbosFetch, xbosGetData } from './xbosHttp';

/** `entityId` must be `xbos_legal_entity.id` — use `resolveLegalEntityApiIdForCompany` when UI row id may be tenant_id. */

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
  const data = await xbosGetData<{ items?: ShareholderApiRow[] }>(
    `/org-foundation/legal-entities/${encodeURIComponent(entityId)}/shareholders`,
    { scope: 'legal-entity.shareholders.list', ...scopeInit(tenantId) },
  );
  return data?.items ?? [];
}

export async function saveShareholder(
  entityId: string,
  tenantId: string,
  body: { holderName: string; identityCode?: string; ratioPercent?: number; contributedValue?: number },
  shareholderId?: string,
): Promise<ShareholderApiRow> {
  const path = shareholderId
    ? `/org-foundation/legal-entities/${encodeURIComponent(entityId)}/shareholders/${encodeURIComponent(shareholderId)}`
    : `/org-foundation/legal-entities/${encodeURIComponent(entityId)}/shareholders`;
  const envelope = await xbosFetch<{ data?: ShareholderApiRow }>(path, {
    method: shareholderId ? 'PUT' : 'POST',
    scope: shareholderId ? 'legal-entity.shareholders.update' : 'legal-entity.shareholders.create',
    ...scopeInit(tenantId, MEMBER_DEFAULT_COMPANY_ID, true),
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
  await xbosFetch(
    `/org-foundation/legal-entities/${encodeURIComponent(entityId)}/shareholders/${encodeURIComponent(shareholderId)}`,
    {
      method: 'DELETE',
      scope: 'legal-entity.shareholders.delete',
      ...scopeInit(tenantId),
    },
  );
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
