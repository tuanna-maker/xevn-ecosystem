/**
 * @CODE-MEMORY
 * Screen: Unified Shell entry (WP-SHELL-UNIFIED · PORT-02)
 * UC: portal entry · L-OPS
 * BR: ADR-XEVN-PRECISION-MOTION-TOKENS · inventory FE-PORTAL
 * Purpose: Cổng vào — mark XeVN + CTA Cockpit / Command Center; không KPI chip thừa.
 * WorkItem: XEVN-THM-FE-W1
 * Coded: 2026-07-22
 * must_keep: mark+wordmark; primary CTA Cockpit; không stats strip
 * LastVerified: visual + theme-contrast
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem: PO-HRM-UI-BRAND-W3-PORT-A · 2026-08-05
 * change_mode: UPGRADE
 * What: Sticky header glass + xevn tokens confirmed; cite ADR-20260805 §9 light ops canvas
 * Why: PORT-02 ops home chrome remaster batch
 * must_keep: no marketing hero / stats strip; Cockpit + CC CTAs
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, ArrowRight } from 'lucide-react';

const UnifiedShellPage: React.FC = () => {
  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-xevn-background">
      <header className="shrink-0 border-b border-xevn-border bg-xevn-surface/80 backdrop-blur-md shadow-soft">
        <div className="xevn-safe-inline mx-auto flex h-14 w-full max-w-[1920px] items-center justify-between">
          <div className="flex h-10 items-center gap-3">
            <img
              src="/xevn-logo.png"
              alt="XeVN"
              className="h-10 w-10 object-contain"
              width={40}
              height={40}
            />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-xevn-textSecondary">
                XeVN OS
              </p>
              <h1 className="text-lg font-bold text-xevn-text">Unified Shell</h1>
            </div>
          </div>
          <span className="hidden text-sm text-xevn-textSecondary sm:inline">
            Cổng vào duy nhất
          </span>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto overflow-x-hidden px-8 py-16">
        <div className="w-full max-w-lg space-y-8 text-center">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-xevn-primary/10 text-xevn-primary">
            <LayoutDashboard className="h-10 w-10" strokeWidth={1.5} />
          </div>
          <div className="space-y-3">
            <h2 className="xevn-type-title tracking-tight text-xevn-text md:text-3xl">
              Chào mừng đến hệ điều hành tập đoàn
            </h2>
            <p className="xevn-type-body leading-relaxed text-xevn-textSecondary">
              Bắt đầu từ lớp Unified, sau đó mở Bảng điều hành (Executive Cockpit). Khi đã vào cockpit,
              workspace nghiệp vụ (sidebar) mới được mở khóa.
            </p>
          </div>

          <div className="flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
            <Link
              to="/cockpit"
              className="inline-flex items-center justify-center gap-2 rounded-card bg-xevn-primary px-8 py-4 text-sm font-semibold text-white shadow-soft transition-transform hover:bg-xevn-primaryPressed active:scale-95"
            >
              Vào Bảng điều hành
              <ArrowRight className="h-5 w-5" strokeWidth={1.5} />
            </Link>
            <Link
              to="/command-center"
              className="inline-flex items-center justify-center rounded-card border border-xevn-border bg-xevn-surface px-8 py-4 text-sm font-semibold text-xevn-text shadow-sm transition-transform hover:bg-xevn-background active:scale-95"
            >
              Command Center
            </Link>
          </div>

          <p className="text-xs text-xevn-textSecondary">
            Workspace portal: <code className="text-xevn-text">/dashboard/*</code> — chỉ khả dụng sau khi
            đã vào <code className="text-xevn-text">/cockpit</code>
          </p>
        </div>
      </main>
    </div>
  );
};

export default UnifiedShellPage;
