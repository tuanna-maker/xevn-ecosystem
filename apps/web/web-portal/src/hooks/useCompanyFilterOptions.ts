import { useEffect, useMemo, useState } from 'react';
import type { Company } from '../data/mockData';
import type { Company as OrgCompany } from '../data/mock-data';
import { useGlobalFilter, type TenantOption } from '../contexts/GlobalFilterContext';
import { fetchCompanyUnitsForCommandCenter } from '../integrations/tenantScopeApi';
import { logApiFailure, logApiStart } from '../utils/apiLogger';

function fromOrgCompany(row: OrgCompany): Company {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    shortName: row.shortName ?? row.code,
    industry: 'Công ty thành viên',
    status: row.status,
    employeeCount: row.employeeCount,
    color: '#1E40AF',
  };
}

function fromTenantOption(row: TenantOption): Company {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    shortName: row.shortName ?? row.code,
    industry: row.industry,
    status: row.status === 'active' ? 'active' : 'inactive',
    employeeCount: row.employeeCount,
    color: row.color,
  };
}

/** Legal-entity options for Settings filters — API-only (company-units), no mockCompanies. */
export function useCompanyFilterOptions(): {
  companies: Company[];
  usingApi: boolean;
  loadFailed: boolean;
} {
  const { companies, tenants, tenantScopeStatus } = useGlobalFilter();
  const [groupMembers, setGroupMembers] = useState<Company[]>([]);
  const [groupLoadFailed, setGroupLoadFailed] = useState(false);
  const [groupLoaded, setGroupLoaded] = useState(false);

  useEffect(() => {
    if (tenantScopeStatus === 'loading') return;

    let cancelled = false;
    const url = '/api/xbos/tenant-scope/company-units';
    const startedAt = logApiStart('tenant-scope.company-units', 'GET', url);
    void fetchCompanyUnitsForCommandCenter()
      .then((rows) => {
        if (cancelled) return;
        setGroupMembers(rows.map(fromOrgCompany));
        setGroupLoadFailed(false);
        setGroupLoaded(true);
      })
      .catch((error) => {
        logApiFailure('tenant-scope.company-units', 'GET', url, startedAt, error);
        if (!cancelled) {
          setGroupMembers([]);
          setGroupLoadFailed(true);
          setGroupLoaded(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [tenantScopeStatus]);

  return useMemo(() => {
    const fromAccessible =
      companies.length > 0
        ? (companies as TenantOption[]).map(fromTenantOption)
        : tenants.map(fromTenantOption);
    const fromGroupApi = groupMembers.filter((c) => c.id !== 'all');
    const merged =
      fromGroupApi.length > 0
        ? fromGroupApi
        : fromAccessible.filter((c) => c.id !== 'all' && c.id !== '__loading__');
    const filtered = merged.length > 0 ? merged : fromAccessible;
    const usingApi = fromGroupApi.length > 0 || fromAccessible.length > 0;
    const loadFailed = groupLoaded && groupLoadFailed && fromGroupApi.length === 0 && fromAccessible.length === 0;
    return {
      companies: filtered.length > 0 ? filtered : merged,
      usingApi,
      loadFailed,
    };
  }, [companies, tenants, groupMembers, groupLoadFailed, groupLoaded]);
}
