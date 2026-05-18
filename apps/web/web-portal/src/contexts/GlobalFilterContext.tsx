import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { Company } from '../data/mockData';
import { isMasterTenant, MASTER_TENANT_ID, MEMBER_DEFAULT_COMPANY_ID } from '../constants/tenant';
import { setActiveTenantScope } from '../integrations/activeTenantScope';
import { AccessibleTenant, fetchAccessibleTenants } from '../integrations/tenantScopeApi';
import { useAuth } from './AuthContext';
import {
  allowMockFallback,
  TENANT_SCOPE_FAILED_MESSAGE,
} from '../utils/mockPolicy';
import { logApiFailure, logApiStart } from '../utils/apiLogger';

export type TenantOption = Company & {
  tenantId: string;
  tenantKind: 'master' | 'member';
  roleCode: string;
  isMaster: boolean;
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
  return {
    id: t.tenantId,
    tenantId: t.tenantId,
    code: t.tenantId.toUpperCase(),
    name: t.name,
    shortName: t.shortName,
    industry: t.isMaster ? 'Tập đoàn (X-BOS)' : 'Công ty thành viên',
    status: 'active',
    employeeCount: 0,
    color: colors[index % colors.length],
    tenantKind: t.tenantKind,
    roleCode: t.roleCode,
    isMaster: t.isMaster,
  };
}

const PLACEHOLDER_TENANT: TenantOption = {
  id: '__loading__',
  tenantId: MASTER_TENANT_ID,
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

const fallbackMaster: TenantOption = {
  id: MASTER_TENANT_ID,
  tenantId: MASTER_TENANT_ID,
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
      const preferred =
        mapped.find((t) => t.tenantId === (import.meta.env.VITE_DEFAULT_TENANT_ID ?? MASTER_TENANT_ID)) ??
        mapped.find((t) => t.isMaster) ??
        mapped[0];
      setSelectedTenant(preferred);
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
        const preferred =
          mapped.find((t) => t.tenantId === (import.meta.env.VITE_DEFAULT_TENANT_ID ?? MASTER_TENANT_ID)) ??
          mapped.find((t) => t.isMaster) ??
          mapped[0];
        setSelectedTenant(preferred);
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
        if (allowMockFallback()) {
          setTenants([fallbackMaster]);
          setSelectedTenant(fallbackMaster);
          setUsingMockTenantFallback(true);
          setTenantScopeStatus('ready');
          setTenantScopeError(null);
        } else {
          setTenants([]);
          setSelectedTenant(PLACEHOLDER_TENANT);
          setTenantScopeStatus('error');
          setTenantScopeError(TENANT_SCOPE_FAILED_MESSAGE);
          setUsingMockTenantFallback(false);
        }
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
      companyId: safeSelected.isMaster ? MASTER_TENANT_ID : MEMBER_DEFAULT_COMPANY_ID,
    });
  }, [safeSelected.tenantId, safeSelected.isMaster, safeSelected.id, tenantScopeStatus]);

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
    companyId: selectedTenant.isMaster ? MASTER_TENANT_ID : MEMBER_DEFAULT_COMPANY_ID,
    tenantScopeStatus,
    tenantScopeError,
  };
};

export default GlobalFilterContext;
