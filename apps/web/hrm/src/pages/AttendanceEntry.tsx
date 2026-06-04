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
      <Loader2 className="h-8 w-8 animate-spin text-orange-500" aria-hidden />
      <p className="text-sm text-muted-foreground">Đang tải module chấm công…</p>
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
