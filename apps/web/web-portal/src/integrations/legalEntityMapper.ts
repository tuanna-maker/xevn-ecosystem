import type { Company } from '../data/mock-data';
import type { LegalEntityApiRow } from './orgFoundationApi';

export function mapLegalEntityRowToCompany(row: LegalEntityApiRow): Company {
  const payload = (row.payload ?? {}) as Record<string, unknown>;
  const companyForm = payload.companyForm as Record<string, unknown> | undefined;
  return {
    id: String(row.id),
    tenantId: row.tenant_id,
    code: row.code,
    name: row.name,
    shortName: (companyForm?.shortName as string) ?? row.code,
    status: 'active',
    employeeCount: 0,
    revenue: 0,
    address: row.address ?? '',
    establishedDate: row.established_at?.slice(0, 10) ?? '2020-01-01',
    entityLevel: row.entity_type === 'holding' ? 'parent' : 'subsidiary',
    parentEntityId: null,
  };
}
