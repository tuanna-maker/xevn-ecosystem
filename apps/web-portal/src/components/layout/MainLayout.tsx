import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import { PORTAL_UNLOCK_STORAGE_KEY } from '../../constants/portal-flow';

const MainLayout: React.FC = () => {
  const unlocked =
    typeof sessionStorage !== 'undefined' &&
    sessionStorage.getItem(PORTAL_UNLOCK_STORAGE_KEY) === '1';

  if (!unlocked) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="ml-64 flex min-h-0 min-w-0 flex-1 flex-col">
        <TopHeader />
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          <div className="xevn-safe-inline py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
