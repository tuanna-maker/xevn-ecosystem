/**
 * @CODE-MEMORY
 * Screen:     HRM AppLayout (portal embed + standalone shell)
 * UC:         J-HRM-* embed soft-nav
 * BR:         Portal embed Outlet must remount when soft-nav path commits
 * SRS:        docs/program/PROGRAM_JOURNEY_MAP.md J-HRM-*
 * TechSpec:   docs/qa/evidence/d-hrm-att-nav-stall-01-20260717.md
 * Purpose:    App chrome + Outlet host. In portal iframe mode, key Outlet by
 *             pathname so soft-nav away from heavy routes (Attendance → Tuyển dụng)
 *             cannot leave a stale page tree painted after history moved.
 * WorkItem:   CD-FB-09-SOFT-NAV
 * Coded:      2026-07-19
 * Callers:    App.tsx protected layout route
 * Callees:    Outlet, HrmOperatingUnitFilter
 * FEActions:  postMessage soft-nav → navigate → Outlet key swap → page mount
 * Impact:     Missing Outlet key → C-CD-FB-09-01 soft-nav stall class
 * must_keep:  portal embed chrome; standalone sidebar layout; PERF soft-nav (no iframe key); OU filter
 * SOLID:      Layout chrome only — route pages stay in pages/*
 * LastVerified: PortalEmbedRouterSync.test.ts (attendance→recruitment)
 *
 * @CODE-MEMORY-CHANGE 2026-07-19
 * work_item: CD-FB-09-SOFT-NAV
 * what: Portal embed `<Outlet key={location.pathname} />` so soft-nav remounts page tree
 * why: C-CD-FB-09-01 Attendance→Tuyển dụng could keep prior view after URL move
 * must_keep: embedScopeKey ignores path (portal parent); F6 product ACs
 *
 * @CODE-MEMORY-CHANGE 2026-07-20 CD-FB-06-REMOVE-SCOPE-ANNOTATIONS
 * what: Stop rendering PortalEmbedScopeBar (JWT/role/AC annotation strip)
 * why: Sponsor — annotation wastes space; F3 switch/filter stay via OU + portal header
 * must_keep: HrmOperatingUnitFilter (AC-CD-F3-03); membership switch on portal header (AC-CD-F3-04)
 *
 * @CODE-MEMORY-CHANGE 2026-07-22 BM-FE-ROLE-SWITCH-01
 * what: OU filter bar carries compact role VI (+ member static ĐVTV·role) — not annotation strip
 * why: BM-AC-02-01 clarity on HRM embed after strip removal
 * must_keep: no Ngữ cảnh/JWT/AC chrome; TopHeader membership; OU ≠ JWT mutate; soft-nav Outlet key
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-PORT-A
 * change_mode: UPGRADE
 * what: Shell canvas `bg-xevn-background` + sharp text; cite ADR-20260805 §9 (PORT-08)
 * why: Dual-surface — HRM inside iframe light ops; portal owns outer TopHeader
 * must_keep: embed Outlet key; OU filter; HrmApiSyncBanner honesty; no invent Face web
 */
import { Outlet, useLocation } from 'react-router-dom';
import { getHrmPortalMode } from '@/lib/hrmPortalMode';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { TrialExpiredGuard } from './TrialExpiredGuard';
import { MobileBottomNav } from './MobileBottomNav';
import { HrmOperatingUnitFilter } from '@/components/hrm/HrmOperatingUnitFilter';
import { HrmApiSyncBanner } from '@/components/layout/HrmApiSyncBanner';
import { cn } from '@/lib/utils';

function isHrmSettingsPath(pathname: string): boolean {
  return pathname === '/settings' || pathname.startsWith('/settings/');
}

export function AppLayout() {
  const location = useLocation();
  const portalEmbed = getHrmPortalMode(location.search);
  const settingsDense = isHrmSettingsPath(location.pathname);

  if (portalEmbed) {
    return (
      <div className="flex h-dvh w-full flex-col overflow-hidden bg-xevn-background text-xevn-text">
        <TrialExpiredGuard>
          <HrmOperatingUnitFilter />
          <main
            className={cn(
              'flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto',
              settingsDense ? 'px-2 py-2 md:px-3 md:py-2.5' : 'px-4 py-4 md:px-6 md:py-5',
            )}
          >
            {/* CD-FB-09-SOFT-NAV: remount page tree when soft-nav path commits */}
            <Outlet key={location.pathname} />
          </main>
        </TrialExpiredGuard>
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-xevn-background text-xevn-text">
      <AppSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col md:ml-64">
        <AppHeader />
        <TrialExpiredGuard>
          <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-20 md:pb-6">
            <div className="xevn-safe-inline py-6">
              <HrmApiSyncBanner />
              <Outlet />
            </div>
          </main>
        </TrialExpiredGuard>
      </div>
      <MobileBottomNav />
    </div>
  );
}
