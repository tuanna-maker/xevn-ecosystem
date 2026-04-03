import { Outlet } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { TrialExpiredGuard } from './TrialExpiredGuard';
import { MobileBottomNav } from './MobileBottomNav';

export function AppLayout() {
  return (
    <div className="min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="min-h-screen flex flex-col min-w-0 md:ml-64">
        <AppHeader />
        <TrialExpiredGuard>
          <main className="flex-1 pt-16 pb-20 md:pb-6 overflow-auto">
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
