import type { Company } from '../data/mock-data';
import type { LegalEntityApiRow } from './orgFoundationApi';
import { GROUP_HOLDING_ROOT_ID } from './tenantScopeApi';

export type LegalEntityIdHints = Pick<Company, 'id'> & {
  tenantId?: string | null;
  code?: string | null;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * UC-CC-03/04 — map Command Center member-unit row id → persisted `xbos_legal_entity.id`.
 * Handles legacy rows where UI id was tenant_id instead of legal-entity UUID.
 */
export function resolveLegalEntityApiIdFromList(
  company: LegalEntityIdHints | null | undefined,
  legalEntities: LegalEntityApiRow[],
): string | null {
  if (!company?.id) {
    return null;
  }

  if (company.id === GROUP_HOLDING_ROOT_ID) {
    const tenantId = company.tenantId?.trim();
    if (!tenantId) return null;
    const holding = legalEntities.find(
      (row) => row.tenant_id === tenantId && row.entity_type === 'holding',
    );
    return holding ? String(holding.id) : null;
  }

  const uiId = String(company.id).trim();
  const tenantId = company.tenantId?.trim();
  const code = company.code?.trim();

  const direct = legalEntities.find((row) => String(row.id) === uiId);
  if (direct) {
    return String(direct.id);
  }

  if (tenantId && code) {
    const byTenantCode = legalEntities.find(
      (row) => row.tenant_id === tenantId && row.code === code,
    );
    if (byTenantCode) {
      return String(byTenantCode.id);
    }
  }

  if (tenantId && uiId === tenantId) {
    const byTenant = legalEntities.find((row) => row.tenant_id === tenantId);
    if (byTenant) {
      return String(byTenant.id);
    }
  }

  if (tenantId) {
    const byTenantOnly = legalEntities.find((row) => row.tenant_id === tenantId);
    if (byTenantOnly) {
      return String(byTenantOnly.id);
    }
  }

  if (UUID_RE.test(uiId)) {
    return uiId;
  }

  return null;
}
