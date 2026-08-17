/**
 * @CODE-MEMORY
 * Screen:     /attendance — AttendanceEntry lazy shell (S90)
 * Purpose:    Thin route shell — sync banner visible while Attendance workbench chunk loads.
 * WorkItem:   PO-HRM-UI-BRAND-W3-ATT-F
 * ADR:        docs/architecture/ADR-XEVN-PRECISION-MOTION-TOKENS-20260805.md §8–§10
 * must_keep:  lazy import + Suspense; RouteErrorBoundary; no Attendance CLOSED; no Nest/seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-05 PO-HRM-UI-BRAND-W3-ATT-F
 * change_mode: UPGRADE
 * What: Loading chrome orange → xevn-primary; sharp secondary label
 * Why: ADR pale ban · inventory W3-ATT-F S90
 */
import { lazy, Suspense, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { RouteErrorBoundary } from '@/components/common/RouteErrorBoundary';

const attendanceWorkbenchImport = import('./Attendance');
const AttendanceWorkbench = lazy(() => attendanceWorkbenchImport);

function AttendanceLoading() {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-3 p-12"
      data-testid="attendance-entry-loading"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="h-8 w-8 animate-spin text-xevn-primary" aria-hidden />
      <p className="text-[15px] text-xevn-textSecondary">Đang tải module chấm công…</p>
    </div>
  );
}

/**
 * Thin route shell — mounts immediately under AppLayout (sync banner + scope bar visible)
 * while the large Attendance workbench chunk loads on HTTPS pilot / Vite dev cold compile.
 */
export default function AttendanceEntry() {
  useEffect(() => {
    void attendanceWorkbenchImport;
  }, []);

  return (
    <RouteErrorBoundary routeLabel="attendance">
      <Suspense fallback={<AttendanceLoading />}>
        <AttendanceWorkbench />
      </Suspense>
    </RouteErrorBoundary>
  );
}
