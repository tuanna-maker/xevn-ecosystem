import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { Company } from '../data/mockData';
import { isMasterTenant, MASTER_TENANT_ID, MEMBER_DEFAULT_COMPANY_ID } from '../constants/tenant';
import { setActiveTenantScope } from '../integrations/activeTenantScope';
import { getJwtCompanyId, getJwtTenantId, isGroupCompanyId } from '../integrations/identityScope';
import { AccessibleTenant, fetchAccessibleTenants } from '../integrations/tenantScopeApi';
import { useAuth } from './AuthContext';
import { resolveTenantScopeAccessibleFailure } from '../utils/tenantScopeStrictMode';
import { logApiFailure, logApiStart } from '../utils/apiLogger';

export type TenantOption = Company & {
  tenantId: string;
  companyId: string;
  tenantKind: 'master' | 'member';
  roleCode: string;
  isMaster: boolean;
  /** OS 28 — bind from auth BE; empty/— only when missing (no FE invent). */
  membershipId?: string;
  modules?: string[];
  tenant_label?: string;
  company_label?: string;
  role_label?: string;
  tenant_kind_label?: string;
};

export type TenantScopeStatus = 'loading' | 'ready' | 'error';

interface GlobalFilterContextType {
  /** Tenant đang active (mỗi công ty = 1 tenant). */
  selectedTenant: TenantOption;
  setSelectedTenant: (tenant: TenantOption) => void;
  /** Danh sách tenant user được phép (membership). */
  tenants: TenantOption[];
  tenantScopeStatus: TenantScopeStatus;
  tenantScopeError: string | null;
  usingMockTenantFallback: boolean;
  /** @deprecated dùng tenants — giữ tương thích UI cũ */
  companies: Company[];
  selectedCompany: Company;
  setSelectedCompany: (company: Company) => void;
  canAccessMaster: boolean;
  isMasterContext: boolean;
}

const GlobalFilterContext = createContext<GlobalFilterContextType | undefined>(undefined);

function mapTenantToOption(t: AccessibleTenant, index: number): TenantOption {
  const colors = ['#3b82f6', '#059669', '#D97706', '#7C3AED', '#E11D48', '#0891B2'];
  const tenantLabel = (t.tenant_label ?? '').trim();
  const kindLabel = (t.tenant_kind_label ?? '').trim();
  return {
    id: t.tenantId,
    tenantId: t.tenantId,
    companyId: t.companyId?.trim() || MEMBER_DEFAULT_COMPANY_ID,
    code: t.tenantId.toUpperCase(),
    name: tenantLabel || t.name,
    shortName: t.shortName,
    // OS 28: prefer BE tenant_kind_label; missing → «—» (no FE invent slug/kind map)
    industry: kindLabel || '—',
    status: 'active',
    employeeCount: 0,
    color: colors[index % colors.length],
    tenantKind: t.tenantKind,
    roleCode: t.roleCode,
    isMaster: t.isMaster,
    membershipId: t.membershipId,
    modules: t.modules,
    tenant_label: t.tenant_label,
    company_label: t.company_label,
    role_label: t.role_label,
    tenant_kind_label: t.tenant_kind_label,
  };
}

function pickPreferredTenant(mapped: TenantOption[]): TenantOption {
  const jwtTenant = getJwtTenantId()?.trim().toLowerCase();
  const jwtIsMember = Boolean(jwtTenant && !isMasterTenant(jwtTenant));

  if (jwtTenant) {
    const jwtMatch = mapped.find((t) => t.tenantId.toLowerCase() === jwtTenant);
    if (jwtMatch) return jwtMatch;
  }

  if (!jwtIsMember) {
    const envDefault = (import.meta.env.VITE_DEFAULT_TENANT_ID ?? MASTER_TENANT_ID).trim().toLowerCase();
    const envMatch = mapped.find((t) => t.tenantId.toLowerCase() === envDefault);
    if (envMatch) return envMatch;
    const masterMatch = mapped.find((t) => t.isMaster);
    if (masterMatch) return masterMatch;
  }

  const memberOnly = mapped.find((t) => !t.isMaster);
  if (memberOnly) return memberOnly;

  return mapped[0];
}

function resolveTenantCompanyId(tenant: TenantOption): string {
  const fromMembership = tenant.companyId?.trim();
  if (fromMembership && !isGroupCompanyId(fromMembership)) {
    return fromMembership;
  }
  const jwtCompany = getJwtCompanyId();
  const jwtTenant = getJwtTenantId()?.trim().toLowerCase();
  if (
    jwtCompany &&
    !isGroupCompanyId(jwtCompany) &&
    (!jwtTenant || jwtTenant === tenant.tenantId.toLowerCase())
  ) {
    return jwtCompany;
  }
  return MEMBER_DEFAULT_COMPANY_ID;
}

const PLACEHOLDER_TENANT: TenantOption = {
  id: '__loading__',
  tenantId: MASTER_TENANT_ID,
  companyId: MEMBER_DEFAULT_COMPANY_ID,
  code: '…',
  name: 'Đang tải phạm vi tenant…',
  shortName: 'Đang tải…',
  industry: 'Tập đoàn (X-BOS)',
  status: 'active',
  employeeCount: 0,
  color: '#94a3b8',
  tenantKind: 'master',
  roleCode: '—',
  isMaster: true,
};

function buildMockFallbackMasterTenant(): TenantOption {
  return {
    id: MASTER_TENANT_ID,
    tenantId: MASTER_TENANT_ID,
    companyId: MEMBER_DEFAULT_COMPANY_ID,
    code: 'XEVN',
    name: 'Tập đoàn XeVN (mock fallback)',
    shortName: 'Tập đoàn',
    industry: 'Tập đoàn (X-BOS)',
    status: 'active',
    employeeCount: 0,
    color: '#1E40AF',
    tenantKind: 'master',
    roleCode: 'group_ceo',
    isMaster: true,
  };
}

export const GlobalFilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { memberships, isAuthenticated } = useAuth();
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<TenantOption>(PLACEHOLDER_TENANT);
  const [tenantScopeStatus, setTenantScopeStatus] = useState<TenantScopeStatus>('loading');
  const [tenantScopeError, setTenantScopeError] = useState<string | null>(null);
  const [usingMockTenantFallback, setUsingMockTenantFallback] = useState(false);

  useEffect(() => {
    if (isAuthenticated && memberships.length) {
      const mapped = memberships.map(mapTenantToOption);
      setTenants(mapped);
      setTenantScopeStatus('ready');
      setTenantScopeError(null);
      setUsingMockTenantFallback(false);
      // Keep explicit membership choice after select-membership; only pick default when unknown.
      setSelectedTenant((prev) => {
        const still = mapped.find((t) => t.tenantId === prev.tenantId);
        if (still && prev.id !== '__loading__') return still;
        return pickPreferredTenant(mapped);
      });
      return;
    }

    setTenantScopeStatus('loading');
    setTenantScopeError(null);
    setUsingMockTenantFallback(false);

    const startedAt = logApiStart('tenant-scope.accessible', 'GET', '/api/xbos/tenant-scope/accessible');
    void fetchAccessibleTenants()
      .then((rows) => {
        if (!rows.length) {
          setTenants([]);
          setSelectedTenant(PLACEHOLDER_TENANT);
          setTenantScopeStatus('error');
          setTenantScopeError('Không có tenant accessible cho user hiện tại.');
          return;
        }
        const mapped = rows.map(mapTenantToOption);
        setTenants(mapped);
        setSelectedTenant(pickPreferredTenant(mapped));
        setTenantScopeStatus('ready');
      })
      .catch((error) => {
        logApiFailure(
          'tenant-scope.accessible',
          'GET',
          '/api/xbos/tenant-scope/accessible',
          startedAt,
          error,
        );
        const failure = resolveTenantScopeAccessibleFailure(
          buildMockFallbackMasterTenant,
          PLACEHOLDER_TENANT,
        );
        setTenants(failure.tenants);
        setSelectedTenant(failure.selectedTenant);
        setUsingMockTenantFallback(failure.usingMockTenantFallback);
        setTenantScopeStatus(failure.tenantScopeStatus);
        setTenantScopeError(failure.tenantScopeError);
      });
  }, [isAuthenticated, memberships]);

  const safeSelected = useMemo(() => {
    if (tenantScopeStatus === 'loading') return PLACEHOLDER_TENANT;
    return tenants.find((t) => t.tenantId === selectedTenant.tenantId) ?? tenants[0] ?? selectedTenant;
  }, [tenants, selectedTenant, tenantScopeStatus]);

  const canAccessMaster = useMemo(() => tenants.some((t) => t.isMaster), [tenants]);
  const isMasterContext = isMasterTenant(safeSelected.tenantId);

  useEffect(() => {
    if (tenantScopeStatus !== 'ready' || safeSelected.id === '__loading__') return;
    setActiveTenantScope({
      tenantId: safeSelected.tenantId,
      companyId: resolveTenantCompanyId(safeSelected),
    });
  }, [
    safeSelected.tenantId,
    safeSelected.companyId,
    safeSelected.isMaster,
    safeSelected.id,
    tenantScopeStatus,
  ]);

  const companiesCompat = tenants;
  const selectedCompanyCompat: Company = safeSelected;

  return (
    <GlobalFilterContext.Provider
      value={{
        selectedTenant: safeSelected,
        setSelectedTenant,
        tenants,
        tenantScopeStatus,
        tenantScopeError,
        usingMockTenantFallback,
        companies: companiesCompat,
        selectedCompany: selectedCompanyCompat,
        setSelectedCompany: (c) => {
          const matched = tenants.find((t) => t.id === c.id || t.tenantId === c.id);
          if (matched) setSelectedTenant(matched);
        },
        canAccessMaster,
        isMasterContext,
      }}
    >
      {children}
    </GlobalFilterContext.Provider>
  );
};

export const useGlobalFilter = (): GlobalFilterContextType => {
  const context = useContext(GlobalFilterContext);
  if (!context) {
    throw new Error('useGlobalFilter must be used within a GlobalFilterProvider');
  }
  return context;
};

export const useTenantScope = () => {
  const { selectedTenant, tenants, canAccessMaster, isMasterContext, tenantScopeStatus, tenantScopeError } =
    useGlobalFilter();
  return {
    selectedTenant,
    tenants,
    canAccessMaster,
    isMasterContext,
    tenantId: selectedTenant.tenantId,
    companyId: resolveTenantCompanyId(selectedTenant),
    tenantScopeStatus,
    tenantScopeError,
  };
};

export default GlobalFilterContext;
