import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getHrmPortalMode } from '@/lib/hrmPortalMode';
import { initPortalEmbedNavBridge } from '@/lib/portalEmbedNavBridge';
import { applyPortalEmbedSoftNavigate } from '@/lib/portalEmbedSoftNavigate';
import { syncHrmLocationToPortalParent } from '@/lib/hrmPortalUrlSync';

/**
 * Portal embed: parent postMessage nav + iframe→parent URL sync for F5 deep links.
 *
 * D-HRM-ATT-NAV-STALL-01: soft-nav must flushSync + keep embed search so
 * `v7_startTransition: true` (D-FE-CONSOLE-A11Y-DIALOG-RR-01) cannot leave
 * Attendance painted after the URL moved.
 *
 * @CODE-MEMORY-CHANGE 2026-07-19
 * work_item: CD-FB-09-SOFT-NAV
 * what: Unchanged bridge wiring; paired with AppLayout Outlet key + portal src fallback
 * why: C-CD-FB-09-01 Attendance → Tuyển dụng soft-nav
 */
export function PortalEmbedRouterSync() {
  const location = useLocation();
  const navigate = useNavigate();
  const portalEmbed = getHrmPortalMode(location.search);
  const locationRef = useRef(location);
  locationRef.current = location;

  useEffect(() => {
    if (!portalEmbed) return;
    return initPortalEmbedNavBridge((path) => {
      const current = locationRef.current;
      applyPortalEmbedSoftNavigate(navigate, path, {
        pathname: current.pathname,
        search: current.search,
      });
    });
  }, [navigate, portalEmbed]);

  useEffect(() => {
    if (!portalEmbed) return;
    syncHrmLocationToPortalParent(location.pathname);
  }, [location.pathname, portalEmbed]);

  return null;
}
