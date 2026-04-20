import { Outlet, useLocation } from 'react-router-dom';
import { getHrmPortalMode } from '@/lib/hrmPortalMode';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { TrialExpiredGuard } from './TrialExpiredGuard';
import { MobileBottomNav } from './MobileBottomNav';

export function AppLayout() {
  const location = useLocation();
  const portalEmbed = getHrmPortalMode(location.search);

  if (portalEmbed) {
    return (
      <div className="flex h-dvh w-full flex-col overflow-hidden bg-background">
        <TrialExpiredGuard>
          <main className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto px-4 py-4 md:px-6 md:py-5">
            <Outlet />
          </main>
        </TrialExpiredGuard>
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-background">
      <AppSidebar />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col md:ml-64">
        <AppHeader />
        <TrialExpiredGuard>
          <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-20 md:pb-6">
            <div className="xevn-safe-inline py-6">
              <Outlet />
            </div>
          </main>
        </TrialExpiredGuard>
      </div>
      <MobileBottomNav />
    </div>
  );
}
