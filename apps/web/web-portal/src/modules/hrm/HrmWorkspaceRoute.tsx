import React, { useRef, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  hrmPortalPath,
  hrmPortalSuffixFromPathname,
  hrmPortalPrimaryView,
  hrmProxyPathFromSuffix,
} from './paths';
import { HRM_DEFAULT_VIEW, isHrmWorkspaceView } from './registry';
import { useGlobalFilter } from '../../contexts/GlobalFilterContext';
import { resolveHrmOperationalCompanyId } from '../../integrations/commandCenterScope';
import { resolveIdentityScope, ScopeContextError } from '../../integrations/identityScope';
import { ApiLoadBanner } from '../../components/common/ApiLoadBanner';
import { API_LOAD_FAILED_MESSAGE } from '../../utils/mockPolicy';
import { usePortalEmbedSessionPublisher } from './portalEmbedSessionBridge';

/**
 * Route con: `/command-center/hrm/*` — hỗ trợ deep link (vd. `employees/:id`).
 * Segment không hợp lệ → redirect view mặc định.
 */
export const HrmWorkspaceRoute: React.FC = () => {
  const location = useLocation();
  const { selectedTenant } = useGlobalFilter();
  const { accessToken } = useAuth();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeLoadFailed, setIframeLoadFailed] = useState(false);

  const portalSuffix = hrmPortalSuffixFromPathname(location.pathname);
  const primaryView = hrmPortalPrimaryView(portalSuffix);
  const viewValid = isHrmWorkspaceView(primaryView);

  let scopeError: string | null = null;
  let scope:
    | {
        tenantId: string;
        companyId: string;
      }
    | null = null;
  if (viewValid) {
    try {
      scope = resolveIdentityScope(selectedTenant.tenantId, null);
    } catch (error) {
      if (error instanceof ScopeContextError) {
        scopeError = `${error.message} [${error.code}]`;
      } else {
        scopeError = 'Không xác định được scope identity [SCOPE_RESOLVE_FAILED]';
      }
    }
  }

  usePortalEmbedSessionPublisher(iframeRef, viewValid && scope != null, accessToken);

  if (!viewValid) {
    return <Navigate to={hrmPortalPath(HRM_DEFAULT_VIEW)} replace />;
  }

  if (!scope) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {scopeError}
      </div>
    );
  }

  const target = hrmProxyPathFromSuffix(portalSuffix, {
    portal: true,
    tenantId: scope.tenantId,
    companyId: resolveHrmOperationalCompanyId(scope.tenantId, scope.companyId),
  });

  return (
    <div className="flex h-full min-h-[min(32rem,70dvh)] w-full min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-xevn-border bg-white shadow-soft">
      <div className="shrink-0 space-y-2 border-b border-xevn-border bg-white px-3 py-2">
        {iframeLoading && !iframeLoadFailed ? (
          <p className="text-sm text-slate-600" role="status">
            Đang tải module HRM…
          </p>
        ) : null}
        {iframeLoadFailed ? (
          <ApiLoadBanner
            loadFailed
            title="Trạng thái HRM embed"
            message={API_LOAD_FAILED_MESSAGE}
          />
        ) : null}
      </div>
      <iframe
        ref={iframeRef}
        key={target}
        src={target}
        title="HRM Workspace"
        className="min-h-[min(24rem,55dvh)] min-w-0 w-full flex-1 border-0 bg-background"
        onLoad={() => {
          setIframeLoading(false);
          setIframeLoadFailed(false);
        }}
        onError={() => {
          setIframeLoading(false);
          setIframeLoadFailed(true);
        }}
      />
    </div>
  );
};
