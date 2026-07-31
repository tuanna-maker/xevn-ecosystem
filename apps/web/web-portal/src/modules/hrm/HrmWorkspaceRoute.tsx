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
import { shouldForceEmbedSrcReload } from './portalEmbedSoftNavGuard';

/**
 * @CODE-MEMORY
 * Screen:     /command-center/hrm/* — HrmWorkspaceRoute (CC HRM iframe shell)
 * UC:         J-HRM-05 / P-CC-06 / embed tab soft-nav
 * BR:         Soft click remounts target HRM content; scope remount only on tenant/JWT
 * SRS:        docs/program/PROGRAM_JOURNEY_MAP.md J-HRM-*; CUSTOMER_DEMO_HRM_DELTA §6 F6
 * TechSpec:   docs/qa/evidence/p1-hrm-perf-fe-01-20260620.md (postMessage soft nav)
 * Purpose:    Stable iframe shell for Command Center HRM — embedScopeKey ignores path;
 *             tab/detail changes use postMessage soft-nav; CD-FB-09 verifies path and
 *             falls back to document src reload when Attendance→Tuyển dụng stalls.
 * WorkItem:   P1-HRM-PERF-FE-01 / CD-FB-09-SOFT-NAV
 * Coded:      2026-06-20
 *
 * Callers:
 *   - App.tsx → <Route path="hrm/*" element={<HrmWorkspaceRoute />} />
 *
 * Callees:
 *   - postPortalEmbedNavigate → iframe PortalEmbedRouterSync
 *   - shouldForceEmbedSrcReload → portalEmbedSoftNavGuard
 *   - hrmProxyPathFromSuffix → locked iframe src
 *
 * FEActions:
 *   | User action                         | Handler                    | Lib                         |
 *   |-------------------------------------|----------------------------|-----------------------------|
 *   | Soft click Tuyển dụng (sidebar)     | softNavPath effect         | postMessage → verify → src  |
 *   | Hard nav /command-center/hrm/recruitment | initial locked src   | hrmProxyPathFromSuffix      |
 *   | Membership / JWT change             | scopeRevision bump         | iframe key remount          |
 *
 * Impact:     Soft-nav stall leaves Attendance painted while portal URL shows recruitment
 * must_keep:  key=embedScopeKey (never path); F6 JD/funnel ACs; P-CC-06 hard path; TopHeader membership
 * SOLID:      Shell owns transport + fallback; HRM SPA owns route Outlet
 * LastVerified: portalEmbedSoftNavGuard.test.ts + CD-FB-09-SOFT-NAV evidence
 *
 * @CODE-MEMORY-CHANGE 2026-07-19
 * work_item: CD-FB-09-SOFT-NAV
 * what: Pending soft-nav while iframe loading; onLoad catch-up; postMessage verify +
 *       document src fallback when path still Attendance (C-CD-FB-09-01) without
 *       changing embedScopeKey.
 * why: Soft click Tuyển dụng from Attendance left iframe on /hr/attendance while
 *      portal URL already said recruitment; hard reload worked.
 * must_keep: PERF no per-tab key remount; F6 product ACs; hard-nav P-CC-06
 *
 * @CODE-MEMORY-CHANGE 2026-07-19 CD-FB-04-PERF-FIX / P1-HRM-PERF-FE-01
 * what: Reconfirm cache-bust `_v` only on scopeRevision (JWT/tenant), never on tab path
 * why: Customer demo F7 — HRM chậm / quá nhiều API from iframe remount storm
 * must_keep: soft-nav postMessage path; CD-FB-09 verify fallback; F3–F6 green
 *
 * @CODE-MEMORY-CHANGE 2026-07-20 CD-FB-06-REMOVE-SCOPE-ANNOTATIONS
 * what: Stop rendering HrmEmbedScopeBar above iframe (Ngữ cảnh / JWT / AC hint strip)
 * why: Sponsor — annotation wastes space; F3 ACs remain via TopHeader + iframe OU filter
 * must_keep: membership switch TopHeader (AC-CD-F3-04); iframe OU filter (AC-CD-F3-03)
 */

/** Soft-nav verify window — long enough for flushSync navigate, short for UX. */
const SOFT_NAV_VERIFY_MS = 400;

/**
 * Route con: `/command-center/hrm/*` — hỗ trợ deep link (vd. `employees/:id`).
 *
 * P1-HRM-PERF-FE-01 / P1-HRM-SCALE-FE-W1 / D-P1-HRM-EMP-PROFILE-REQ-DEDUPE-01:
 * - iframe `key` = tenant+company+scopeRevision only (never path)
 * - `src` locked per scope remount; path changes → postMessage soft nav
 * CD-FB-09-SOFT-NAV: if soft-nav does not move iframe path, reload document via `src`
 * (content remount) without bumping embedScopeKey.
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
  /** Path requested while iframe was not ready — applied on onLoad. */
  const pendingSoftNavPathRef = useRef<string | null>(null);
  const softNavVerifyTimerRef = useRef<number | null>(null);
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

  const clearSoftNavVerifyTimer = () => {
    if (softNavVerifyTimerRef.current != null) {
      window.clearTimeout(softNavVerifyTimerRef.current);
      softNavVerifyTimerRef.current = null;
    }
  };

  const buildLockedSrc = (suffix: string) => {
    if (!scope || !embedCompanyId) return null;
    return hrmProxyPathFromSuffix(suffix, {
      portal: true,
      tenantId: scope.tenantId,
      companyId: embedCompanyId,
      cacheBust: scopeRevision > 0 ? scopeRevision : null,
    });
  };

  /** Reload iframe document to current portal suffix — content remount, same embedScopeKey. */
  const forceEmbedDocumentReload = (suffix: string) => {
    const nextSrc = buildLockedSrc(suffix);
    if (!nextSrc) return;
    clearSoftNavVerifyTimer();
    softNavReadyRef.current = false;
    setIframeLoading(true);
    setIframeLoadFailed(false);
    setLockedEmbedSrc(nextSrc);
  };

  const dispatchSoftNavToIframe = (path: string, suffixForFallback: string) => {
    const win = iframeRef.current?.contentWindow ?? null;
    const posted = postPortalEmbedNavigate(win, path);
    lastSoftNavPathRef.current = path;
    pendingSoftNavPathRef.current = null;

    if (!posted) {
      forceEmbedDocumentReload(suffixForFallback);
      return;
    }

    clearSoftNavVerifyTimer();
    softNavVerifyTimerRef.current = window.setTimeout(() => {
      softNavVerifyTimerRef.current = null;
      if (!softNavReadyRef.current) return;
      if (lastSoftNavPathRef.current !== path) return;
      try {
        const iframePath = iframeRef.current?.contentWindow?.location.pathname;
        if (shouldForceEmbedSrcReload(iframePath, path)) {
          forceEmbedDocumentReload(suffixForFallback);
        }
      } catch {
        // Cross-origin iframe — cannot verify; soft-nav message already sent.
      }
    }, SOFT_NAV_VERIFY_MS);
  };

  useEffect(() => {
    setScopeRevision(Date.now());
    setIframeLoading(true);
    setIframeLoadFailed(false);
    softNavReadyRef.current = false;
    lastSoftNavPathRef.current = null;
    pendingSoftNavPathRef.current = null;
    clearSoftNavVerifyTimer();
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
    clearSoftNavVerifyTimer();
    setLockedEmbedSrc(src);
    softNavReadyRef.current = false;
    lastSoftNavPathRef.current = softNavPath;
    pendingSoftNavPathRef.current = null;
    setIframeLoading(true);
    setIframeLoadFailed(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally only when scope key remounts
  }, [embedScopeKey]);

  useEffect(() => {
    if (lastSoftNavPathRef.current === softNavPath) {
      pendingSoftNavPathRef.current = null;
      return;
    }
    if (!softNavReadyRef.current) {
      pendingSoftNavPathRef.current = softNavPath;
      return;
    }
    dispatchSoftNavToIframe(softNavPath, portalSuffix);
    // portalSuffix tracked with softNavPath (derived from same location)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- soft-nav only on path change
  }, [softNavPath]);

  useEffect(() => () => clearSoftNavVerifyTimer(), []);

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
            const targetPath = pendingSoftNavPathRef.current ?? softNavPath;
            pendingSoftNavPathRef.current = null;
            // Document loaded from locked src (path at remount). Catch up if parent
            // soft-navigated while the iframe was still loading (C-CD-FB-09-01 race).
            if (lastSoftNavPathRef.current !== targetPath) {
              dispatchSoftNavToIframe(targetPath, portalSuffix);
            } else {
              lastSoftNavPathRef.current = targetPath;
            }
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
