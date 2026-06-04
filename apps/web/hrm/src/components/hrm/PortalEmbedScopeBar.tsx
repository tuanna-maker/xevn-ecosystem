import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getHrmPortalMode } from '@/lib/hrmPortalMode';
import {
  getPortalJwtCompanyId,
  getPortalJwtTenantId,
  resolveHrmSpreadsheetScope,
} from '@/lib/hrmSpreadsheetScope';

function scopeTierLabel(companyId: string, isGroupJwt: boolean): string {
  if (isGroupJwt || companyId === 'main') {
    return 'Tập đoàn (companyId=main) — pilot rollup';
  }
  return 'Công ty thành viên';
}

/**
 * Portal iframe: show active tenant/company scope (group CEO vs member CEO alignment).
 */
export function PortalEmbedScopeBar() {
  const location = useLocation();
  const { currentCompanyId, memberships } = useAuth();
  const portalEmbed = getHrmPortalMode(location.search);

  const scope = useMemo(
    () => resolveHrmSpreadsheetScope(currentCompanyId, location.search),
    [currentCompanyId, location.search],
  );

  if (!portalEmbed) return null;

  const jwtCompany = getPortalJwtCompanyId();
  const jwtTenant = getPortalJwtTenantId();
  const effectiveCompany = scope?.companyId ?? jwtCompany ?? currentCompanyId ?? '—';
  const effectiveTenant = scope?.tenantId ?? jwtTenant ?? '—';
  const isGroupJwt = !jwtCompany || jwtCompany === 'main';
  const membershipCount = memberships.length;
  const activeMembership = memberships.find((m) => m.company_id === currentCompanyId);

  return (
    <div className="mb-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
      <span className="font-semibold text-slate-900">Phạm vi portal: </span>
      <span>
        tenant <code className="rounded bg-white px-1">{effectiveTenant}</code>
        {' · '}
        company <code className="rounded bg-white px-1">{effectiveCompany}</code>
        {' · '}
        {scopeTierLabel(effectiveCompany, isGroupJwt)}
      </span>
      {membershipCount > 1 ? (
        <span className="ml-2 text-slate-500">
          ({membershipCount} membership — đổi công ty trên portal header khi không nhúng iframe)
        </span>
      ) : activeMembership?.company?.name ? (
        <span className="ml-2 text-slate-500">· {activeMembership.company.name}</span>
      ) : null}
    </div>
  );
}
