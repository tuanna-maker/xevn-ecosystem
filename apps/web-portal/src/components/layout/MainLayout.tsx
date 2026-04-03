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
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <TopHeader />
      <main className="ml-64 pt-16 min-h-screen">
        <div className="xevn-safe-inline py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
