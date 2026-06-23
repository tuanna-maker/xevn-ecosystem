import { resolveLegalEntityApiIdFromList, type LegalEntityIdHints } from './legalEntityIdResolver';
import type { LegalEntityApiRow } from './orgFoundationApi';
import { GROUP_HOLDING_ROOT_ID } from './tenantScopeApi';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isPersistedLegalEntityApiId(id: string): boolean {
  return UUID_RE.test(id);
}

export type LegalProfileScopeInput = {
  uiEntityId: string | null;
  tenantId: string;
  code?: string | null;
  resolvedLegalEntityApiId: string | null;
  legalEntityApiCache: LegalEntityApiRow[];
};

/**
 * UC-CC-03 / UF-XBOS-05 — map Command Center UI entity id → persisted `xbos_legal_entity.id`.
 * Holding root (`xbos-group-holding-root`) resolves via cache / `resolvedLegalEntityApiId`, not UI id.
 */
export function resolveLegalProfileScopeFromState(
  input: LegalProfileScopeInput,
): { entityId: string | null; tenantId: string } {
  const { uiEntityId, tenantId, code, resolvedLegalEntityApiId, legalEntityApiCache } = input;
  if (!uiEntityId || uiEntityId === 'new') {
    return { entityId: null, tenantId };
  }

  const hints: LegalEntityIdHints = { id: uiEntityId, tenantId, code: code ?? undefined };
  const entityId =
    resolvedLegalEntityApiId ??
    resolveLegalEntityApiIdFromList(hints, legalEntityApiCache) ??
    (isPersistedLegalEntityApiId(uiEntityId) && uiEntityId !== GROUP_HOLDING_ROOT_ID ? uiEntityId : null);

  return { entityId, tenantId };
}

export function legalProfileScopePersistMessage(uiEntityId: string | null): string {
  if (uiEntityId === GROUP_HOLDING_ROOT_ID) {
    return 'Chưa có hồ sơ tập đoàn trên XBOS — nhấn «Lưu thay đổi» để tạo hồ sơ trước khi ghi cổ đông.';
  }
  return 'Chọn hoặc lưu pháp nhân trước khi ghi cổ đông.';
}

/**
 * Shareholder CRUD must use persisted legal-entity UUID in API paths (UF-XBOS-05 / D-UF-WEB-XBOS-05-R3).
 * Holding UI root falls back to `xbos-group-holding-root` only until profile UUID is resolved.
 */
export function resolveShareholderApiEntityKey(
  uiEntityId: string | null | undefined,
  resolvedEntityId: string | null,
): string | null {
  if (!uiEntityId || uiEntityId === 'new') {
    return null;
  }
  if (uiEntityId === GROUP_HOLDING_ROOT_ID) {
    if (resolvedEntityId && isPersistedLegalEntityApiId(resolvedEntityId)) {
      return resolvedEntityId;
    }
    return GROUP_HOLDING_ROOT_ID;
  }
  if (resolvedEntityId && isPersistedLegalEntityApiId(resolvedEntityId)) {
    return resolvedEntityId;
  }
  if (isPersistedLegalEntityApiId(uiEntityId)) {
    return uiEntityId;
  }
  return null;
}
