import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PORTAL_BASE = (import.meta.env.VITE_UNIFIED_PORTAL_URL || 'http://127.0.0.1:5173').replace(
  /\/+$/,
  '',
);

/** Command Center chỉ có trên web-portal — chuyển hướng khỏi x-bos-core dev. */
export function UnifiedPortalRedirect() {
  const location = useLocation();

  useEffect(() => {
    const target = `${PORTAL_BASE}${location.pathname}${location.search}${location.hash}`;
    window.location.replace(target);
  }, [location.pathname, location.search, location.hash]);

  return (
    <p className="p-6 text-sm text-slate-600" role="status">
      Đang chuyển sang XeVN OS (Command Center)…
    </p>
  );
}
