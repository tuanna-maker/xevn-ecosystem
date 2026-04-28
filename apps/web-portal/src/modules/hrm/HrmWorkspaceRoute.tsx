import React from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { hrmPortalPath, hrmProxyPath, HRM_PORTAL_BASE } from './paths';
import { HRM_DEFAULT_VIEW, isHrmWorkspaceView, parseHrmWorkspaceView } from './registry';
import { HrmWorkspacePanel } from './HrmWorkspacePanel';
import { useGlobalFilter } from '../../contexts/GlobalFilterContext';

/**
 * Route con: `/command-center/hrm/:view`
 * Segment không hợp lệ → redirect về view mặc định (tránh URL “chết”).
 */
export const HrmWorkspaceRoute: React.FC = () => {
  const { view } = useParams<{ view: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedCompany } = useGlobalFilter();

  // Be defensive: in some cases `useParams()` can be undefined if the segment is missing.
  // We then derive the `view` from pathname to avoid incorrectly falling back to `dashboard`.
  const normalizedPath = location.pathname.replace(/\/+$/, '');
  let viewFromPath: string | undefined;
  if (normalizedPath.startsWith(`${HRM_PORTAL_BASE}/`)) {
    const seg = normalizedPath.slice(`${HRM_PORTAL_BASE}/`.length);
    viewFromPath = seg ? decodeURIComponent(seg) : undefined;
  } else if (normalizedPath === HRM_PORTAL_BASE) {
    viewFromPath = undefined;
  }

  const requestedView = viewFromPath ?? view;

  if (requestedView != null && !isHrmWorkspaceView(requestedView)) {
    return <Navigate to={hrmPortalPath(HRM_DEFAULT_VIEW)} replace />;
  }

  const key = parseHrmWorkspaceView(requestedView);

  /**
   * Native HRM workspace (không iframe) — triển khai đầy đủ nghiệp vụ ngay trong portal.
   * Nếu cần fallback tạm thời, bật iframe qua `?iframe=1`.
   */
  const params = new URLSearchParams(location.search);
  const iframe = params.get('iframe') === '1';

  if (!iframe) {
    return (
      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
        <HrmWorkspacePanel view={key} />
      </div>
    );
  }

  const target = hrmProxyPath(key, { portal: true, companyId: selectedCompany?.id ?? null });
  const openNative = () => {
    const next = new URLSearchParams(location.search);
    next.delete('iframe');
    const qs = next.toString();
    navigate(`${location.pathname}${qs ? `?${qs}` : ''}`, { replace: false });
  };
  const copyLink = async () => {
    const url = `${window.location.origin}${location.pathname}${location.search}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // ignore
    }
  };
  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-xevn-border bg-xevn-surface shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-xevn-border bg-white/70 px-3 py-2 backdrop-blur-md">
        <div className="text-sm font-semibold text-xevn-text">Bản iframe (đối chiếu)</div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-xevn-border bg-white px-3 text-sm font-semibold text-xevn-text transition active:scale-95 hover:bg-slate-50"
            onClick={copyLink}
          >
            Copy link
          </button>
          <button
            type="button"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-xevn-primary px-3 text-sm font-semibold text-white shadow-soft transition active:scale-95 hover:opacity-90"
            onClick={openNative}
          >
            Mở bản native
          </button>
        </div>
      </div>
      <iframe
        key={target}
        src={target}
        title="Không gian làm việc HRM"
        className="min-h-[min(18rem,45dvh)] min-w-0 w-full flex-1 border-0 bg-xevn-background"
        allow="clipboard-read; clipboard-write"
      />
    </div>
  );
};
