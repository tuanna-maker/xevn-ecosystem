import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AppLayout } from "./components/layout/AppLayout";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { PermissionRoute } from "./components/auth/PermissionRoute";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import Employees from "./pages/Employees";
import EmployeeProfile from "./pages/EmployeeProfile";
import Recruitment from "./pages/Recruitment";
import Attendance from "./pages/Attendance";
import Payroll from "./pages/Payroll";
import Company from "./pages/Company";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Contracts from "./pages/Contracts";
import Insurance from "./pages/Insurance";
import Decisions from "./pages/Decisions";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Onboarding from "./pages/Onboarding";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import PlatformAdmin from "./pages/PlatformAdmin";
import NotFound from "./pages/NotFound";
import UniAI from "./pages/UniAI";
import UserGuide from "./pages/UserGuide";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Tasks from "./pages/Tasks";
import Processes from "./pages/Processes";
import InternalServices from "./pages/InternalServices";
import ToolsEquipment from "./pages/ToolsEquipment";
import { HRMChatWidget } from "./components/ai/HRMChatWidget";
import { PlatformAdminRoute } from "./components/auth/PlatformAdminRoute";
import { getHrmPortalMode } from "./lib/hrmPortalMode";

const queryClient = new QueryClient();

function OptionalHRMChatWidget() {
  const location = useLocation();
  if (getHrmPortalMode(location.search)) return null;
  return <HRMChatWidget />;
}

// Apply branding color on app load
const applyBrandingColor = () => {
  const saved = localStorage.getItem('branding_config');
  if (saved) {
    try {
      const config = JSON.parse(saved);
      if (config.primaryColor) {
        const root = document.documentElement;
        root.style.setProperty('--primary', config.primaryColor);
        root.style.setProperty('--ring', config.primaryColor);
        root.style.setProperty('--sidebar-primary', config.primaryColor);
        root.style.setProperty('--sidebar-ring', config.primaryColor);

        const [h, s, l] = config.primaryColor.split(' ');
        const darkerL = Math.max(parseInt(l) - 13, 20) + '%';
        root.style.setProperty('--gradient-primary', `linear-gradient(135deg, hsl(${config.primaryColor}), hsl(${h} ${s} ${darkerL}))`);
      }
    } catch (e) {
      console.error('Failed to apply branding color', e);
    }
  }
};

const App = () => {
  const routerBasename = "/hr";

  useEffect(() => {
    applyBrandingColor();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter
            basename={routerBasename}
            future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
          >
            <AuthProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/landing" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/guide" element={<UserGuide />} />
                <Route path="/platform-admin" element={
                  <PlatformAdminRoute>
                    <PlatformAdmin />
                  </PlatformAdminRoute>
                } />

                {/* Protected routes */}
                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<PermissionRoute module="dashboard"><Employees /></PermissionRoute>} />
                  <Route path="/employees" element={<PermissionRoute module="employees"><Employees /></PermissionRoute>} />
                  <Route path="/employees/:id" element={<PermissionRoute module="employees"><EmployeeProfile /></PermissionRoute>} />
                  <Route path="/recruitment" element={<PermissionRoute module="recruitment"><Recruitment /></PermissionRoute>} />
                  <Route path="/attendance" element={<PermissionRoute module="attendance"><Attendance /></PermissionRoute>} />
                  <Route path="/payroll" element={<PermissionRoute module="payroll"><Payroll /></PermissionRoute>} />
                  <Route path="/company" element={<PermissionRoute module="company"><Company /></PermissionRoute>} />
                  <Route path="/reports" element={<PermissionRoute module="reports"><Reports /></PermissionRoute>} />
                  <Route path="/settings" element={<PermissionRoute module="settings"><Settings /></PermissionRoute>} />
                  <Route path="/contracts" element={<PermissionRoute module="contracts"><Contracts /></PermissionRoute>} />
                  <Route path="/insurance" element={<PermissionRoute module="insurance"><Insurance /></PermissionRoute>} />
                  <Route path="/decisions" element={<PermissionRoute module="decisions"><Decisions /></PermissionRoute>} />
                  <Route path="/ai" element={<PermissionRoute module="ai"><UniAI /></PermissionRoute>} />
                  <Route path="/tasks" element={<PermissionRoute module="tasks"><Tasks /></PermissionRoute>} />
                  <Route path="/processes" element={<PermissionRoute module="processes"><Processes /></PermissionRoute>} />
                  <Route path="/internal-services" element={<PermissionRoute module="services"><InternalServices /></PermissionRoute>} />
                  <Route path="/tools-equipment" element={<PermissionRoute module="tools"><ToolsEquipment /></PermissionRoute>} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
              <OptionalHRMChatWidget />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
