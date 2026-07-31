import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { getHrmPortalMode } from '@/lib/hrmPortalMode';
import { coerceHrmListCompanyId, HRM_LIST_DEFAULT_COMPANY_ID, HRM_MASTER_TENANT_ID } from '@/lib/hrmListScope';
import {
  applyStandaloneSessionScope,
  clearPortalSession,
  getPortalAccessToken,
  getPortalSessionUser,
  hasPortalSession,
  PORTAL_SESSION_READY_EVENT,
} from '@/lib/portalAuthBridge';
import { mobileLogin, persistMobileSession } from '@/integrations/hrmMobileAuth';
import { ApiClientError } from '@/lib/apiError';

export type AuthUser = {
  id: string;
  email?: string | null;
};

export type AuthSession = {
  access_token: string;
};

export type OAuthProvider = 'google';

interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  job_title: string | null;
  onboarding_completed: boolean;
}

interface CompanyMembership {
  id: string;
  company_id: string;
  role: string;
  is_primary: boolean | null;
  employee_id: string | null;
  company?: {
    id: string;
    name: string;
    code: string | null;
    logo_url: string | null;
  };
}

interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  profile: Profile | null;
  memberships: CompanyMembership[];
  currentCompanyId: string | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithOAuth: (provider: OAuthProvider) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshMemberships: () => Promise<void>;
  setCurrentCompanyId: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function portalMembership(companyId: string): CompanyMembership {
  return {
    id: 'portal-membership',
    company_id: companyId,
    role: 'portal',
    is_primary: true,
    employee_id: null,
    company: { id: companyId, name: companyId, code: null, logo_url: null },
  };
}

function profileFromPortal(email: string, displayName: string): Profile {
  return {
    id: email,
    user_id: email,
    email,
    full_name: displayName,
    avatar_url: null,
    phone: null,
    job_title: null,
    onboarding_completed: true,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const portalParam = searchParams.get('portal');
  const tenantIdFromQuery = searchParams.get('tenantId');
  const isPortalMode =
    portalParam != null && (portalParam === '1' || portalParam.toLowerCase() === 'true');
  const embedActive = getHrmPortalMode(location.search);
  const storedPortalCompanyId =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('hrm_current_company_id') ||
        sessionStorage.getItem('hrm_current_company_id')
      : null;
  const portalCompanyIdRaw =
    isPortalMode || embedActive
      ? searchParams.get('companyId') || storedPortalCompanyId
      : null;
  const portalCompanyId = portalCompanyIdRaw ? coerceHrmListCompanyId(portalCompanyIdRaw) : null;

  if (isPortalMode) {
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('hrm_portal_mode', '1');
    if (typeof localStorage !== 'undefined') localStorage.setItem('hrm_portal_mode', '1');
  }

  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [memberships, setMemberships] = useState<CompanyMembership[]>(
    portalCompanyId ? [portalMembership(portalCompanyId)] : [],
  );
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(portalCompanyId ?? null);
  const [loading, setLoading] = useState(true);

  const hydrateFromPortalToken = () => {
    const token = getPortalAccessToken();
    const portalUser = getPortalSessionUser();
    if (!token) return false;
    setSession({ access_token: token });
    const email = portalUser?.userId ?? 'portal-user';
    setUser({ id: email, email });
    setProfile(profileFromPortal(email, portalUser?.displayName ?? email));
    const companyId =
      portalCompanyId ??
      (storedPortalCompanyId ? coerceHrmListCompanyId(storedPortalCompanyId) : null) ??
      coerceHrmListCompanyId('main');
    if (companyId) {
      setMemberships([portalMembership(companyId)]);
      setCurrentCompanyId(companyId);
    }
    return true;
  };

  useEffect(() => {
    if (typeof localStorage === 'undefined' || typeof sessionStorage === 'undefined') return;
    if (currentCompanyId) {
      localStorage.setItem('hrm_current_company_id', currentCompanyId);
      sessionStorage.setItem('hrm_current_company_id', currentCompanyId);
    }
    const storedTenant =
      localStorage.getItem('hrm_current_tenant_id') ||
      sessionStorage.getItem('hrm_current_tenant_id');
    const tenant = tenantIdFromQuery?.trim() || storedTenant;
    if (tenant) {
      localStorage.setItem('hrm_current_tenant_id', tenant);
      sessionStorage.setItem('hrm_current_tenant_id', tenant);
    }
  }, [currentCompanyId, tenantIdFromQuery]);

  useEffect(() => {
    const portalEmbed = getHrmPortalMode(location.search);
    if (portalEmbed && (portalCompanyId || embedActive)) {
      const effectiveCompanyId = portalCompanyId ?? coerceHrmListCompanyId('main');
      setMemberships([portalMembership(effectiveCompanyId)]);
      setCurrentCompanyId(effectiveCompanyId);
    }

    if (hydrateFromPortalToken()) {
      setLoading(false);
      return;
    }

    setLoading(false);

    const onReady = () => {
      if (hydrateFromPortalToken()) setLoading(false);
    };
    window.addEventListener(PORTAL_SESSION_READY_EVENT, onReady);
    return () => window.removeEventListener(PORTAL_SESSION_READY_EVENT, onReady);
  }, [location.search, portalCompanyId, isPortalMode, embedActive]);

  const signUp = async (_email: string, _password: string, _fullName: string) => {
    return {
      error: new ApiClientError({
        status: 501,
        code: 'HRM-AUTH-SIGNUP',
        message: 'Đăng ký chỉ khả dụng trên Portal X-BOS.',
      }),
    };
  };

  const signIn = async (email: string, password: string) => {
    try {
      const result = await mobileLogin(email, password);
      persistMobileSession(result, email);
      hydrateFromPortalToken();
      if (result.memberships?.length) {
        const primary =
          result.memberships.find((m) => m.is_primary)?.company_id ??
          result.memberships.find((m) => m.company_id)?.company_id ??
          HRM_LIST_DEFAULT_COMPANY_ID;
        const tenantId =
          result.memberships.find((m) => m.is_primary)?.tenant_id ??
          result.memberships.find((m) => m.tenant_id)?.tenant_id ??
          result.default_tenant_id ??
          HRM_MASTER_TENANT_ID;
        const companyId = coerceHrmListCompanyId(primary);
        setCurrentCompanyId(companyId);
        applyStandaloneSessionScope({ tenantId, companyId });
        setMemberships(
          result.memberships.map((m, i) => ({
            id: `mobile-${i}`,
            company_id: coerceHrmListCompanyId(m.company_id),
            role: m.role ?? 'employee',
            is_primary: i === 0,
            employee_id: m.employee_id ?? null,
            company: {
              id: coerceHrmListCompanyId(m.company_id),
              name: m.company_id,
              code: null,
              logo_url: null,
            },
          })),
        );
      }
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithOAuth = async (_provider: OAuthProvider) => {
    return {
      error: new ApiClientError({
        status: 501,
        code: 'HRM-AUTH-OAUTH',
        message: 'Đăng nhập Google chỉ khả dụng trên Portal X-BOS.',
      }),
    };
  };

  const signOut = async () => {
    clearPortalSession();
    setUser(null);
    setSession(null);
    setProfile(null);
    setMemberships([]);
    setCurrentCompanyId(null);
  };

  const refreshProfile = async () => {
    hydrateFromPortalToken();
  };

  const refreshMemberships = async () => {
    if (hasPortalSession() && currentCompanyId) {
      setMemberships([portalMembership(currentCompanyId)]);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        memberships,
        currentCompanyId,
        loading,
        signUp,
        signIn,
        signInWithOAuth,
        signOut,
        refreshProfile,
        refreshMemberships,
        setCurrentCompanyId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
