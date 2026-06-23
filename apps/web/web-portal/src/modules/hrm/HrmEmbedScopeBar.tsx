import React from 'react';
import { useGlobalFilter } from '../../contexts/GlobalFilterContext';
import { getJwtCompanyId, getJwtTenantId, isGroupCompanyId, resolveIdentityScope } from '../../integrations/identityScope';
import {
  SETTINGS_CONTROL_TEXT,
  SETTINGS_PAGE_SUBTITLE_CLASS,
  SETTINGS_RADIUS_CARD,
} from '../../pages/command-center/settings-form-pattern';

/**
 * Command Center HRM iframe routes: show tenant/company scope (group vs member CEO).
 */
export const HrmEmbedScopeBar: React.FC = () => {
  const { selectedTenant, tenants, tenantScopeStatus } = useGlobalFilter();
  let scopeError: string | null = null;
  let scope: { tenantId: string; companyId: string } | null = null;
  try {
    scope = resolveIdentityScope(selectedTenant.tenantId, null);
  } catch (e) {
    scopeError = e instanceof Error ? e.message : 'Không xác định được scope';
  }

  const jwtCompany = getJwtCompanyId();
  const jwtTenant = getJwtTenantId();
  const companyId = scope?.companyId ?? jwtCompany ?? '—';
  const tenantId = scope?.tenantId ?? jwtTenant ?? selectedTenant.tenantId;
  const groupContext = isGroupCompanyId(companyId) || selectedTenant.isMaster;

  return (
    <div
      className={`mb-3 flex flex-wrap items-center justify-between gap-2 border border-xevn-border bg-slate-50/90 px-3 py-2 text-sm ${SETTINGS_RADIUS_CARD}`}
    >
      <div className="min-w-0">
        <span className="font-semibold text-xevn-text">Phạm vi HRM embed: </span>
        <span className={SETTINGS_CONTROL_TEXT}>
          <code className="rounded bg-white px-1 text-xs">{tenantId}</code>
          {' / '}
          <code className="rounded bg-white px-1 text-xs">{companyId}</code>
          {' · '}
          {groupContext ? 'Tập đoàn (rollup pilot)' : 'Công ty thành viên'}
        </span>
        {scopeError ? (
          <p className="mt-1 text-xs text-red-700">{scopeError}</p>
        ) : (
          <p className={`mt-0.5 ${SETTINGS_PAGE_SUBTITLE_CLASS}`}>
            {groupContext
              ? 'Tập đoàn: iframe nhận JWT + companyId=main (rollup).'
              : 'Công ty thành viên: iframe nhận JWT tenant + companyId=main.'}
          </p>
        )}
      </div>
      {tenants.length > 1 && tenantScopeStatus === 'ready' ? (
        <span className="text-xs text-slate-500">{tenants.length} membership khả dụng</span>
      ) : null}
    </div>
  );
};
