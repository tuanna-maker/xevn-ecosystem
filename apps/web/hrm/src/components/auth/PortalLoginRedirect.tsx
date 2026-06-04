import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { getHrmPortalMode, isHrmPortalEmbedFrame } from '@/lib/hrmPortalMode';
import { hasPortalSession } from '@/lib/portalAuthBridge';
import {
  getPortalLoginUrl,
  hrmReturnPathForPortalLogin,
  redirectToPortalLogin,
} from '@/lib/portalLogin';

type PortalLoginRedirectProps = {
  /** Override post-login path on portal (portal route, not HRM rel path). */
  returnPath?: string;
};

/**
 * Replaces legacy Supabase login/register screens — sends user to X-BOS Portal `/login`.
 */
export function PortalLoginRedirect({ returnPath }: PortalLoginRedirectProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const target =
    returnPath ?? hrmReturnPathForPortalLogin(location.pathname);

  useEffect(() => {
    // Command Center SSO: session already on same origin — never open /login again.
    if (hasPortalSession()) {
      navigate('/', { replace: true });
      return;
    }
    if (getHrmPortalMode(location.search) && isHrmPortalEmbedFrame()) {
      navigate('/', { replace: true });
      return;
    }
    redirectToPortalLogin(target);
  }, [target, location.search, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
        <h1 className="text-lg font-semibold text-foreground">Đăng nhập qua X-BOS Portal</h1>
        <p className="text-sm text-muted-foreground">
          HRM không còn màn đăng nhập riêng. Đang chuyển bạn tới Command Center…
        </p>
        <a
          href={getPortalLoginUrl(target)}
          className="text-sm font-medium text-primary hover:underline"
        >
          Mở trang đăng nhập
        </a>
      </div>
    </div>
  );
}
