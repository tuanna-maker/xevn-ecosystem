import { useEffect, useMemo, useState } from 'react';
import type { Company } from '../data/mockData';
import type { Company as OrgCompany } from '../data/mock-data';
import { useGlobalFilter, type TenantOption } from '../contexts/GlobalFilterContext';
import { fetchGroupMemberUnitsForCommandCenter } from '../integrations/tenantScopeApi';
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

/** Company options for Settings / filters — prefers API-backed tenants from GlobalFilter. */
export function useCompanyFilterOptions(): {
  companies: Company[];
  usingApi: boolean;
  loadFailed: boolean;
} {
  const { companies, tenants, tenantScopeStatus } = useGlobalFilter();
  const [groupMembers, setGroupMembers] = useState<Company[]>([]);
  const [groupLoadFailed, setGroupLoadFailed] = useState(false);

  useEffect(() => {
    const fromFilter = companies.length > 0 ? companies : tenants;
    if (fromFilter.length > 1 || tenantScopeStatus === 'loading') return;

    let cancelled = false;
    const url = '/api/xbos/tenant-scope/group-member-units';
    const startedAt = logApiStart('tenant-scope.group-member-units', 'GET', url);
    void fetchGroupMemberUnitsForCommandCenter()
      .then((rows) => {
        if (cancelled) return;
        setGroupMembers(rows.map(fromOrgCompany));
        setGroupLoadFailed(false);
      })
      .catch((error) => {
        logApiFailure('tenant-scope.group-member-units', 'GET', url, startedAt, error);
        if (!cancelled) {
          setGroupMembers([]);
          setGroupLoadFailed(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [companies.length, tenants.length, tenantScopeStatus]);

  return useMemo(() => {
    const fromApi =
      companies.length > 0
        ? (companies as TenantOption[]).map(fromTenantOption)
        : tenants.map(fromTenantOption);
    const merged = fromApi.length > 0 ? fromApi : groupMembers;
    const filtered = merged.filter((c) => c.id !== 'all');
    return {
      companies: filtered.length > 0 ? filtered : merged,
      usingApi: fromApi.length > 0 || groupMembers.length > 0,
      loadFailed: groupLoadFailed && merged.length === 0,
    };
  }, [companies, tenants, groupMembers, groupLoadFailed]);
}
