import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * ExecutiveDashboardLayout - Full-width expansive layout for Chairman Cockpit
 * NO SIDEBAR - Maximizes viewport for data visualization
 * Header is built into the page component for full control
 */
const ExecutiveDashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full">
      {/* Full-width main content - NO padding, NO sidebar */}
      <main className="w-full min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default ExecutiveDashboardLayout;