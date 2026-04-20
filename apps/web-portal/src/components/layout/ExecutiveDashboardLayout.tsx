import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * ExecutiveDashboardLayout - Full-width expansive layout for Chairman Cockpit
 * NO SIDEBAR - Maximizes viewport for data visualization
 * Header is built into the page component for full control
 */
const ExecutiveDashboardLayout: React.FC = () => {
  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden">
      <main className="min-h-0 w-full flex-1 overflow-y-auto overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default ExecutiveDashboardLayout;