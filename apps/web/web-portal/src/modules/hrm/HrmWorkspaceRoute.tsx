import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import {
  hrmAppRelPathFromPortalSuffix,
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
import { NavTransitionShell } from '../../components/common/NavTransitionShell';
import { useNavTransitionShell } from '../../components/common/useNavTransitionShell';
import { API_LOAD_FAILED_MESSAGE } from '../../utils/mockPolicy';
import { usePortalEmbedSessionPublisher } from './portalEmbedSessionBridge';
import { postPortalEmbedNavigate } from './portalEmbedNavBridge';
import { HrmEmbedScopeBar } from './HrmEmbedScopeBar';

/**
 * Route con: `/command-center/hrm/*` — hỗ trợ deep link (vd. `employees/:id`).
 *
 * P1-HRM-PERF-FE-01 / P1-HRM-SCALE-FE-W1 / D-P1-HRM-EMP-PROFILE-REQ-DEDUPE-01:
 * - iframe `key` = tenant+company+scopeRevision only (never path)
 * - `src` locked per scope remount; path changes → postMessage soft nav
 */
export const HrmWorkspaceRoute: React.FC = () => {
  const location = useLocation();
  const { selectedTenant, tenantScopeStatus } = useGlobalFilter();
  const { accessToken } = useAuth();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeLoadFailed, setIframeLoadFailed] = useState(false);
  /** Bust embed only on membership/JWT change — not tab/detail nav. */
  const [scopeRevision, setScopeRevision] = useState(0);
  const softNavReadyRef = useRef(false);
  const lastSoftNavPathRef = useRef<string | null>(null);
  const [lockedEmbedSrc, setLockedEmbedSrc] = useState<string | null>(null);

  const portalSuffix = hrmPortalSuffixFromPathname(location.pathname);
  const primaryView = hrmPortalPrimaryView(portalSuffix);
  const viewValid = isHrmWorkspaceView(primaryView);
  const { shellVisible: embedNavShellVisible } = useNavTransitionShell(portalSuffix);
  const softNavPath = hrmAppRelPathFromPortalSuffix(portalSuffix);

  const tenantReady = tenantScopeStatus === 'ready' && selectedTenant.id !== '__loading__';

  const scopeResolution = useMemo(() => {
    if (!viewValid || !tenantReady) {
      return { scope: null as { tenantId: string; companyId: string } | null, scopeError: null as string | null };
    }
    try {
      return {
        scope: resolveIdentityScope(selectedTenant.tenantId, null),
        scopeError: null,
      };
    } catch (error) {
      if (error instanceof ScopeContextError) {
        return { scope: null, scopeError: `${error.message} [${error.code}]` };
      }
      return { scope: null, scopeError: 'Không xác định được scope identity [SCOPE_RESOLVE_FAILED]' };
    }
  }, [viewValid, tenantReady, selectedTenant.tenantId]);

  const { scope, scopeError } = scopeResolution;

  const embedCompanyId = scope
    ? resolveHrmOperationalCompanyId(scope.tenantId, scope.companyId)
    : null;

  const embedScopeKey =
    scope && embedCompanyId != null
      ? `${scope.tenantId}:${embedCompanyId}:${scopeRevision}`
      : null;

  useEffect(() => {
    setScopeRevision(Date.now());
    setIframeLoading(true);
    setIframeLoadFailed(false);
    softNavReadyRef.current = false;
    lastSoftNavPathRef.current = null;
    setLockedEmbedSrc(null);
  }, [selectedTenant.tenantId, accessToken]);

  // Lock document src to the path at scope remount; later path changes use soft nav only.
  useEffect(() => {
    if (!scope || !embedCompanyId || !embedScopeKey) return;
    const src = hrmProxyPathFromSuffix(portalSuffix, {
      portal: true,
      tenantId: scope.tenantId,
      companyId: embedCompanyId,
      cacheBust: scopeRevision > 0 ? scopeRevision : null,
    });
    setLockedEmbedSrc(src);
    softNavReadyRef.current = false;
    lastSoftNavPathRef.current = softNavPath;
    setIframeLoading(true);
    setIframeLoadFailed(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally only when scope key remounts
  }, [embedScopeKey]);

  useEffect(() => {
    if (!softNavReadyRef.current) return;
    if (lastSoftNavPathRef.current === softNavPath) return;
    lastSoftNavPathRef.current = softNavPath;
    postPortalEmbedNavigate(iframeRef.current?.contentWindow, softNavPath);
  }, [softNavPath]);

  usePortalEmbedSessionPublisher(iframeRef, viewValid && scope != null, accessToken);

  if (!viewValid) {
    return <Navigate to={hrmPortalPath(HRM_DEFAULT_VIEW)} replace />;
  }

  if (!tenantReady) {
    return (
      <div className="flex min-h-[min(24rem,55dvh)] flex-1 items-center justify-center rounded-lg border border-xevn-border bg-slate-50 p-6 text-sm text-slate-600">
        <NavTransitionShell
          variant="embed"
          className="w-full max-w-2xl"
          label="Đang đồng bộ phạm vi tenant…"
        />
      </div>
    );
  }

  if (!scope) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {scopeError}
      </div>
    );
  }

  if (!embedScopeKey || !lockedEmbedSrc) {
    return (
      <div className="flex min-h-[min(24rem,55dvh)] flex-1 items-center justify-center rounded-lg border border-xevn-border bg-slate-50 p-6 text-sm text-slate-600">
        <NavTransitionShell
          variant="embed"
          className="w-full max-w-2xl"
          label="Đang khởi tạo HRM embed…"
        />
      </div>
    );
  }

  const showEmbedShell = iframeLoading || embedNavShellVisible;

  return (
    <div className="flex h-full min-h-[min(32rem,70dvh)] w-full min-w-0 flex-1 flex-col gap-0">
      <HrmEmbedScopeBar />
      <div className="relative flex min-h-[min(32rem,70dvh)] w-full min-w-0 flex-1 flex-col overflow-hidden rounded-lg border border-xevn-border bg-slate-50 shadow-soft">
        {showEmbedShell && !iframeLoadFailed ? (
          <div className="absolute inset-0 z-10 animate-in fade-in duration-200">
            <NavTransitionShell variant="embed" className="h-full" label="Đang tải module HRM…" />
          </div>
        ) : null}
        {iframeLoadFailed ? (
          <div className="shrink-0 border-b border-xevn-border bg-white px-3 py-2">
            <ApiLoadBanner
              loadFailed
              title="Trạng thái HRM embed"
              message={API_LOAD_FAILED_MESSAGE}
            />
          </div>
        ) : null}
        <iframe
          ref={iframeRef}
          key={embedScopeKey}
          src={lockedEmbedSrc}
          title="HRM Workspace"
          className={`min-h-[min(24rem,55dvh)] min-w-0 w-full flex-1 border-0 bg-slate-50 transition-opacity duration-200 ${
            showEmbedShell ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={() => {
            setIframeLoading(false);
            setIframeLoadFailed(false);
            softNavReadyRef.current = true;
            lastSoftNavPathRef.current = softNavPath;
          }}
          onError={() => {
            setIframeLoading(false);
            setIframeLoadFailed(true);
          }}
        />
      </div>
    </div>
  );
};
