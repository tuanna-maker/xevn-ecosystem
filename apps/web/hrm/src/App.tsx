/**
 * @CODE-MEMORY
 * Screen:     HRM SPA root (QueryClient + routes)
 * UC:         J-HRM-* embed
 * Purpose:    App shell; default RQ staleTime 60s reduces remount/focus refetch storm.
 * WorkItem:   P1-HRM-PERF-FE-04 / CD-FB-04-PERF-FIX
 * Coded:      2026-06-20
 *
 * @CODE-MEMORY-CHANGE 2026-07-19 CD-FB-04-PERF-FIX
 * what: Confirm QueryClient default staleTime 60_000 (FE-04); no product route changes
 * why: Dashboard + catalogs rely on shared cache across soft-nav remounts
 * must_keep: F3–F6 routes; portal embed mode hides chat widget
 *
 * @CODE-MEMORY-CHANGE 2026-07-27 D-FE-HRM-FLEET-CATALOG-UX-01
 * change_mode: ADD
 * What: Lazy Route /fleet → Fleet page (FL-01 list-only · G-FL-07 empty/catalog UX)
 * Why: Close G-FL-07 — honest empty + catalog-missing VI · keyword q · no invent create
 * must_keep: F3–F6 routes · staleTime 60s · U65 · HOLD_DEPLOY · soft U72 maps untouched
 *
 * @CODE-MEMORY-CHANGE 2026-08-04 PO-UC-TC-W4-FE-NT01-INBOX-MARK-READ-01
 * change_mode: ADD
 * What: Route `/notifications` → InboxNotifications (HRM-NT-01 list + mark read)
 * Why: Web embed inbox surface for QA U65 · parity mobile
 */
import React, { lazy, Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AppLayout } from "./components/layout/AppLayout";
import { AuthProvider } from "./contexts/AuthContext";
import { HrmOperatingUnitFilterProvider } from "./contexts/HrmOperatingUnitFilterContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { PermissionRoute } from "./components/auth/PermissionRoute";
import { PlatformAdminRoute } from "./components/auth/PlatformAdminRoute";
import { getHrmPortalMode } from "./lib/hrmPortalMode";
import { HrmRouteFallback, HrmProfileRouteFallback } from "./components/common/HrmRouteFallback";
import { PortalEmbedRouterSync } from "./components/layout/PortalEmbedRouterSync";

const Index = lazy(() => import("./pages/Index"));
const Landing = lazy(() => import("./pages/Landing"));
const Employees = lazy(() => import("./pages/Employees"));
const EmployeeProfile = lazy(() => import("./pages/EmployeeProfile"));
const Recruitment = lazy(() => import("./pages/Recruitment"));
const Attendance = lazy(() => import("./pages/Attendance"));
const Payroll = lazy(() => import("./pages/Payroll"));
const Performance = lazy(() => import("./pages/Performance"));
const Company = lazy(() => import("./pages/Company"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));
const SettingsCatalogsPage = lazy(() => import("./pages/SettingsCatalogsPage"));
const EmployeeMetadataPage = lazy(() => import("./pages/EmployeeMetadataPage"));
const Contracts = lazy(() => import("./pages/Contracts"));
const Insurance = lazy(() => import("./pages/Insurance"));
const Decisions = lazy(() => import("./pages/Decisions"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const PlatformAdmin = lazy(() => import("./pages/PlatformAdmin"));
const NotFound = lazy(() => import("./pages/NotFound"));
const UniAI = lazy(() => import("./pages/UniAI"));
const UserGuide = lazy(() => import("./pages/UserGuide"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Processes = lazy(() => import("./pages/Processes"));
const InternalServices = lazy(() => import("./pages/InternalServices"));
const ToolsEquipment = lazy(() => import("./pages/ToolsEquipment"));
const Fleet = lazy(() => import("./pages/Fleet"));
const InboxNotifications = lazy(() => import("./pages/InboxNotifications"));
const PayrollSetupHub = lazy(() =>
  import("./components/payroll/setup/PayrollSetupHub").then((m) => ({ default: m.PayrollSetupHub })),
);
const HRMChatWidget = lazy(() =>
  import("./components/ai/HRMChatWidget").then((module) => ({ default: module.HRMChatWidget })),
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
    },
  },
});

function OptionalHRMChatWidget() {
  const location = useLocation();
  if (getHrmPortalMode(location.search)) return null;
  return (
    <Suspense fallback={null}>
      <HRMChatWidget />
    </Suspense>
  );
}

function withSuspense(
  element: React.ReactNode,
  fallback: React.ReactNode = <HrmRouteFallback />,
) {
  return <Suspense fallback={fallback}>{element}</Suspense>;
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
            // D-FE-CONSOLE-A11Y-DIALOG-RR-01: opt-in RR v7 flags (silence Future Flag Warning).
            // D-HRM-ATT-NAV-STALL-01 / CD-FB-09: soft-nav still uses flushSync + navigate
            // `{ flushSync: true }` in applyPortalEmbedSoftNavigate — must_keep that path
            // so Attendance → other tabs commit sync even with v7_startTransition on.
            future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
          >
            <AuthProvider>
              <HrmOperatingUnitFilterProvider>
              <PortalEmbedRouterSync />
              <Routes>
                {/* Public routes */}
                <Route path="/landing" element={withSuspense(<Landing />)} />
                <Route path="/login" element={withSuspense(<Login />)} />
                <Route path="/register" element={withSuspense(<Register />)} />
                <Route path="/onboarding" element={withSuspense(<Onboarding />)} />
                <Route path="/forgot-password" element={withSuspense(<ForgotPassword />)} />
                <Route path="/reset-password" element={withSuspense(<ResetPassword />)} />
                <Route path="/privacy-policy" element={withSuspense(<PrivacyPolicy />)} />
                <Route path="/guide" element={withSuspense(<UserGuide />)} />
                <Route path="/platform-admin" element={
                  <PlatformAdminRoute>
                    {withSuspense(<PlatformAdmin />)}
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
                  <Route path="/" element={withSuspense(<Index />)} />
                  <Route path="/dashboard" element={<PermissionRoute module="dashboard">{withSuspense(<Employees />)}</PermissionRoute>} />
                  <Route path="/employees" element={<PermissionRoute module="employees">{withSuspense(<Employees />)}</PermissionRoute>} />
                  <Route path="/employees/:id" element={<PermissionRoute module="employees">{withSuspense(<EmployeeProfile />, <HrmProfileRouteFallback />)}</PermissionRoute>} />
                  <Route path="/recruitment" element={<PermissionRoute module="recruitment">{withSuspense(<Recruitment />)}</PermissionRoute>} />
                  <Route path="/attendance" element={<PermissionRoute module="attendance">{withSuspense(<Attendance />)}</PermissionRoute>} />
                  <Route path="/payroll" element={<PermissionRoute module="payroll">{withSuspense(<Payroll />)}</PermissionRoute>} />
                  <Route path="/payroll/setup" element={<PermissionRoute module="payroll">{withSuspense(<PayrollSetupHub />)}</PermissionRoute>} />
                  <Route path="/performance" element={withSuspense(<Performance />)} />
                  <Route path="/company" element={<PermissionRoute module="company">{withSuspense(<Company />)}</PermissionRoute>} />
                  <Route path="/reports" element={<PermissionRoute module="reports">{withSuspense(<Reports />)}</PermissionRoute>} />
                  <Route path="/settings" element={<PermissionRoute module="settings">{withSuspense(<Settings />)}</PermissionRoute>} />
                  <Route path="/notifications" element={withSuspense(<InboxNotifications />)} />
                  <Route path="/settings-catalogs" element={<PermissionRoute module="settings">{withSuspense(<SettingsCatalogsPage />)}</PermissionRoute>} />
                  <Route path="/employee-metadata" element={<PermissionRoute module="settings">{withSuspense(<EmployeeMetadataPage />)}</PermissionRoute>} />
                  <Route path="/contracts" element={<PermissionRoute module="contracts">{withSuspense(<Contracts />)}</PermissionRoute>} />
                  <Route path="/insurance" element={<PermissionRoute module="insurance">{withSuspense(<Insurance />)}</PermissionRoute>} />
                  <Route path="/decisions" element={<PermissionRoute module="decisions">{withSuspense(<Decisions />)}</PermissionRoute>} />
                  <Route path="/ai" element={<PermissionRoute module="ai">{withSuspense(<UniAI />)}</PermissionRoute>} />
                  <Route path="/tasks" element={<PermissionRoute module="tasks">{withSuspense(<Tasks />)}</PermissionRoute>} />
                  <Route path="/processes" element={<PermissionRoute module="processes">{withSuspense(<Processes />)}</PermissionRoute>} />
                  <Route path="/internal-services" element={<PermissionRoute module="services">{withSuspense(<InternalServices />)}</PermissionRoute>} />
                  <Route path="/internal_services" element={<Navigate to="/internal-services" replace />} />
                  <Route path="/tools-equipment" element={<PermissionRoute module="tools">{withSuspense(<ToolsEquipment />)}</PermissionRoute>} />
                  <Route path="/tools_equipment" element={<Navigate to="/tools-equipment" replace />} />
                  {/* FL-01 list-only — portal bypass; no invent create (G-FL-07 / G-FL-UPSERT) */}
                  <Route path="/fleet" element={withSuspense(<Fleet />)} />
                </Route>

                <Route path="*" element={withSuspense(<NotFound />)} />
              </Routes>
              <OptionalHRMChatWidget />
              </HrmOperatingUnitFilterProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
