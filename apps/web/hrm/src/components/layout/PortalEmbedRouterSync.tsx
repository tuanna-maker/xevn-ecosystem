import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getHrmPortalMode } from '@/lib/hrmPortalMode';
import { initPortalEmbedNavBridge } from '@/lib/portalEmbedNavBridge';
import { syncHrmLocationToPortalParent } from '@/lib/hrmPortalUrlSync';

/**
 * Portal embed: parent postMessage nav + iframe→parent URL sync for F5 deep links.
 */
export function PortalEmbedRouterSync() {
  const location = useLocation();
  const navigate = useNavigate();
  const portalEmbed = getHrmPortalMode(location.search);

  useEffect(() => {
    if (!portalEmbed) return;
    return initPortalEmbedNavBridge((path) => {
      navigate(path);
    });
  }, [navigate, portalEmbed]);

  useEffect(() => {
    if (!portalEmbed) return;
    syncHrmLocationToPortalParent(location.pathname);
  }, [location.pathname, portalEmbed]);

  return null;
}
