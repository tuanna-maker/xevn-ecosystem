import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-slate-500">Đang tải phiên…</div>;
  }

  if (!isAuthenticated) {
    const allowDevBypass =
      import.meta.env.DEV &&
      Boolean(import.meta.env.VITE_INTERNAL_API_KEY?.trim()) &&
      import.meta.env.VITE_REQUIRE_LOGIN !== 'true';
    if (allowDevBypass) {
      return <>{children}</>;
    }
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return <>{children}</>;
};

export default RequireAuth;
