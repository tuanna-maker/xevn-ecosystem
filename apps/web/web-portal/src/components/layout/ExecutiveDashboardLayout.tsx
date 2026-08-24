/**
 * @CODE-MEMORY
 * Screen: Portal shell — ExecutiveDashboardLayout (CC / cockpit / unified)
 * UC: FR-UC-M01 · WP-SHELL-HEADER
 * BR: OS 28 display-ready membership labels
 * SRS: docs/brand-new-documents-20270801/SRS_NEW.md v1.1 §3.2 · FR-UC-M01
 * TechSpec: docs/brand-new-documents-20270801/TECH_SPEC_NEW.md · TS-MOB-AUTH · ref_srs FR-UC-M01
 * Purpose: Layout full-width không sidebar cho Cockpit/CC; mount TopHeader (membership chip
 *          BE *_label) trên shell /command-center* — không chỉ /dashboard/* MainLayout.
 * WorkItem: W1-B-04-AUTH-FE-CC-CHIP-01
 * Coded: 2026-08-03
 * Callers: App.tsx Route path="/"
 * Callees: TopHeader · react-router Outlet
 * FEActions: outlet pages; membership select sống trong TopHeader
 * BEChain: authSession *_label via TopHeader → AuthContext / GlobalFilter
 * Impact: Không mount TopHeader → QA Case B/C FAIL (chip missing trên CC)
 * must_keep: authSession *_label helpers; không invent scopeRoleLabels; Inbox/CC transform 200
 * SOLID: Shell chrome tách khỏi page hero (persona BOD ≠ membership)
 * LastVerified: ExecutiveDashboardLayout.test.tsx + QA W1-B-04-AUTH-FE-QA-RET4
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem: W1-B-04-AUTH-FE-CC-CHIP-01 · 2026-08-03
 * Change: ADD TopHeader trên pathname /command-center*; main flex-1 min-h-0 để page h-full
 * must_keep: không mount chrome trùng trên UnifiedShell `/`; không đụng authSession invent map
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem: PO-HRM-UI-BRAND-W3-PORT-A · 2026-08-05
 * change_mode: UPGRADE
 * Change: Cite ADR-20260805 §9 — portal owns CC chrome (TopHeader); light ops canvas under Outlet
 * must_keep: membership chip on /command-center*; no duplicate shell on UnifiedShell
 */
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { isCommandCenterHrmPath } from '../../modules/hrm/commandCenterUrl';
import { stripTenantPrefixFromPathname } from '../../modules/hrm/paths';
import TopHeader from './TopHeader';

/** Membership chrome required on CC shell (not UnifiedShell / cockpit / HRM embed). */
export function isCommandCenterShellPath(pathname: string): boolean {
  const stripped = stripTenantPrefixFromPathname(pathname);
  return stripped === '/command-center' || stripped.startsWith('/command-center/');
}

/**
 * ExecutiveDashboardLayout — full-width expansive layout for Chairman Cockpit / CC.
 * NO SIDEBAR — maximizes viewport. Portal membership chrome via TopHeader on CC paths.
 */
const ExecutiveDashboardLayout: React.FC = () => {
  const { pathname } = useLocation();
  const showMembershipChrome =
    isCommandCenterShellPath(pathname) && !isCommandCenterHrmPath(pathname);

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-xevn-background text-xevn-text">
      {showMembershipChrome ? <TopHeader /> : null}
      <main className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default ExecutiveDashboardLayout;
