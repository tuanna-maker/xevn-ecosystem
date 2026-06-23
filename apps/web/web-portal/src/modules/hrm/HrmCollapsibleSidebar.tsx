import React, { useCallback, useState } from 'react';
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { HrmSidebar } from './HrmSidebar';
import { readHrmSidebarCollapsed, writeHrmSidebarCollapsed } from './hrmEmbedNavStorage';
import {
  NAV_SUBSIDEBAR_WIDTH_CLASS,
  NAV_SUBSIDEBAR_WIDTH_COLLAPSED_CLASS,
  SETTINGS_RADIUS_CARD,
} from '../../pages/command-center/settings-form-pattern';

function useMaxMd(): boolean {
  const [maxMd, setMaxMd] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false,
  );
  React.useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = () => setMaxMd(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return maxMd;
}

/**
 * HRM menu trong Command Center — thu gọn còn icon; nút bật/tắt để ưu tiên vùng iframe.
 * Mobile: ẩn hẳn, mở overlay khi chạm nút menu.
 */
export const HrmCollapsibleSidebar: React.FC = () => {
  const isMobile = useMaxMd();
  const [collapsed, setCollapsed] = useState(readHrmSidebarCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggle = useCallback(() => {
    if (isMobile) {
      setMobileOpen((o) => !o);
      return;
    }
    setCollapsed((prev) => {
      const next = !prev;
      writeHrmSidebarCollapsed(next);
      return next;
    });
  }, [isMobile]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  if (isMobile) {
    return (
      <>
        <button
          type="button"
          onClick={toggle}
          className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-xevn-border bg-white text-slate-700 shadow-sm hover:bg-slate-50 md:hidden"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Đóng menu HRM' : 'Mở menu HRM'}
          title={mobileOpen ? 'Đóng menu HRM' : 'Mở menu HRM'}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        {mobileOpen ? (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 bg-black/30 md:hidden"
              aria-label="Đóng menu HRM"
              onClick={closeMobile}
            />
            <aside
              className={`fixed inset-y-0 left-14 z-50 flex w-[min(16rem,78vw)] flex-col overflow-hidden border border-xevn-border bg-xevn-surface shadow-xl ${SETTINGS_RADIUS_CARD} px-2 py-3 md:hidden`}
            >
              <HrmSidebar collapsed={false} />
            </aside>
          </>
        ) : null}
      </>
    );
  }

  return (
    <div
      className={`relative hidden h-full min-h-0 shrink-0 flex-col transition-[width] duration-200 ease-out md:flex ${
        collapsed ? NAV_SUBSIDEBAR_WIDTH_COLLAPSED_CLASS : NAV_SUBSIDEBAR_WIDTH_CLASS
      }`}
    >
      <button
        type="button"
        onClick={toggle}
        title={collapsed ? 'Mở menu HRM' : 'Thu gọn menu HRM'}
        aria-expanded={!collapsed}
        aria-label={collapsed ? 'Mở menu HRM' : 'Thu gọn menu HRM'}
        className="absolute -right-3 top-3 z-20 flex h-7 w-7 items-center justify-center rounded-full border border-xevn-border bg-white text-slate-600 shadow-md hover:bg-slate-50"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
      <aside
        className={`flex min-h-0 flex-1 flex-col overflow-hidden border border-xevn-border bg-xevn-surface/95 shadow-soft ${SETTINGS_RADIUS_CARD} ${
          collapsed ? 'px-1 py-3' : 'px-2 py-3'
        }`}
      >
        {collapsed ? (
          <div className="flex min-h-0 flex-1 flex-col items-center">
            <button
              type="button"
              onClick={toggle}
              className="mb-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
              title="Mở menu HRM"
            >
              <Menu className="h-5 w-5" />
            </button>
            <HrmSidebar collapsed />
          </div>
        ) : (
          <HrmSidebar collapsed={false} />
        )}
      </aside>
    </div>
  );
};
