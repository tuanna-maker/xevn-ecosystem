import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { User, Session, Provider } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  memberships: CompanyMembership[];
  currentCompanyId: string | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithOAuth: (provider: Provider) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshMemberships: () => Promise<void>;
  setCurrentCompanyId: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const portalParam = searchParams.get('portal');
  const isPortalMode =
    portalParam != null && (portalParam === '1' || portalParam.toLowerCase() === 'true');
  const portalCompanyId = isPortalMode ? searchParams.get('companyId') : null;

  // Integration hint: keep portal-mode sticky inside HRM origin.
  // This prevents late redirects if `portal` query gets dropped during internal navigation.
  if (isPortalMode) {
    if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('hrm_portal_mode', '1');
    if (typeof localStorage !== 'undefined') localStorage.setItem('hrm_portal_mode', '1');
  }

  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [memberships, setMemberships] = useState<CompanyMembership[]>(
    portalCompanyId
      ? [
          {
            id: 'portal-membership',
            company_id: portalCompanyId,
            role: 'portal',
            is_primary: true,
            employee_id: null,
            company: {
              id: portalCompanyId,
              name: portalCompanyId,
              code: null,
              logo_url: null,
            },
          },
        ]
      : []
  );
  const [currentCompanyId, setCurrentCompanyId] = useState<string | null>(portalCompanyId ?? null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      setProfile(data as Profile);
      return data as Profile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const fetchMemberships = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_company_memberships')
        .select(`
          id,
          company_id,
          role,
          is_primary,
          employee_id,
          companies:company_id (
            id,
            name,
            code,
            logo_url
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;
      
      const formattedMemberships = (data || []).map((m: any) => ({
        id: m.id,
        company_id: m.company_id,
        role: m.role,
        is_primary: m.is_primary,
        employee_id: m.employee_id || null,
        company: m.companies,
      }));
      
      setMemberships(formattedMemberships);
      
      // Portal-mode: ưu tiên dùng `companyId` nếu thuộc quyền của user.
      // Nếu không thuộc quyền hoặc không có portalCompanyId -> lấy primary/first.
      if (formattedMemberships.length > 0) {
        const portalTarget =
          portalCompanyId && formattedMemberships.some((m) => m.company_id === portalCompanyId)
            ? portalCompanyId
            : null;

        const primary = formattedMemberships.find((m) => m.is_primary);
        const fallback = primary?.company_id || formattedMemberships[0].company_id;

        setCurrentCompanyId(portalTarget ?? (!currentCompanyId ? fallback : currentCompanyId ?? fallback));
      }
      
      return formattedMemberships;
    } catch (error) {
      console.error('Error fetching memberships:', error);
      return [];
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Use setTimeout to avoid potential deadlocks
          setTimeout(async () => {
            await fetchProfile(session.user.id);
            await fetchMemberships(session.user.id);
            setLoading(false);
          }, 0);
        } else {
          setProfile(null);
          if (portalCompanyId && isPortalMode) {
            setMemberships([
              {
                id: 'portal-membership',
                company_id: portalCompanyId,
                role: 'portal',
                is_primary: true,
                employee_id: null,
                company: {
                  id: portalCompanyId,
                  name: portalCompanyId,
                  code: null,
                  logo_url: null,
                },
              },
            ]);
            setCurrentCompanyId(portalCompanyId);
          } else {
            setMemberships([]);
            setCurrentCompanyId(null);
          }
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: fullName,
          },
        },
      });
      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithOAuth = async (provider: Provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/onboarding`,
        },
      });
      return { error: error as Error | null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setMemberships([]);
    setCurrentCompanyId(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const refreshMemberships = async () => {
    if (user) {
      await fetchMemberships(user.id);
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
