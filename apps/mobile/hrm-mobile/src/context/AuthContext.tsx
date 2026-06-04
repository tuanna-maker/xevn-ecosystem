import * as SecureStore from 'expo-secure-store';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import type { HrmAuthConfig } from '../integrations/types';

import { getDefaultBaseUrl, hrmRequest } from '../integrations/hrmApiClient';

import { resolvePayrollQueryCompanyId, resolveWireCompanyId } from '../integrations/companyWireScope';

import { isManagerRole, parseJwtClaims } from '../integrations/jwtClaims';

import { registerHrmPushToken } from '../integrations/pushRegistration';

import { STORAGE } from '../storage/keys';

import { isUuid } from '../utils/uuid';



export type MobileMembership = {

  tenant_id: string;

  company_id: string;

  company_uuid: string;

  employee_id: string;

  employee_code: string;

  employee_name: string;

  company_display: string;

  is_primary: boolean;

};



export type AuthState = {

  hydrated: boolean;

  signedIn: boolean;

  baseUrl: string;

  accessToken: string;

  refreshToken: string;

  internalApiKey: string;

  tenantId: string;

  companyId: string;

  companyUuid: string;

  employeeId: string;

  roles: string[];

  memberships: MobileMembership[];

};



export type SignInPayload = Omit<AuthState, 'hydrated' | 'signedIn'>;



export type MobileLoginResult = {

  access_token: string;

  refresh_token: string;

  employee: { id: string; full_name: string; email: string };

  roles: string[];

  memberships?: MobileMembership[];

  active_membership?: MobileMembership;

  default_tenant_id?: string;

  default_company_id?: string;

  company_uuid?: string;

};



const defaultState: AuthState = {

  hydrated: false,

  signedIn: false,

  baseUrl: '',

  accessToken: '',

  refreshToken: '',

  internalApiKey: '',

  tenantId: '',

  companyId: 'holding',

  companyUuid: '',

  employeeId: '',

  roles: [],

  memberships: [],

};



type AuthContextValue = AuthState & {

  signIn: (payload: SignInPayload) => Promise<void>;

  signInWithMobileLogin: (payload: SignInPayload & { login: MobileLoginResult }) => Promise<void>;

  selectMembership: (employeeId: string) => Promise<boolean>;

  refreshAccessToken: () => Promise<boolean>;

  signOut: () => Promise<void>;

  updateLocal: (partial: Partial<AuthState>) => void;

  getHrmAuth: () => HrmAuthConfig;

  getAttendanceCompanyId: () => string;

  getPayrollQueryCompanyId: () => string;

  isManager: boolean;

};



const AuthContext = createContext<AuthContextValue | null>(null);



function buildHrmAuthConfig(state: AuthState): HrmAuthConfig {
  const wireCompanyId = resolveWireCompanyId({
    companyUuid: state.companyUuid,
    companyId: state.companyId,
    accessToken: state.accessToken,
    memberships: state.memberships,
    employeeId: state.employeeId,
    tenantId: state.tenantId,
  });

  return {
    baseUrl: state.baseUrl.trim() || getDefaultBaseUrl(),
    accessToken: state.accessToken.trim() || undefined,
    internalApiKey: state.internalApiKey.trim() || undefined,
    tenantId: state.tenantId.trim(),
    companyId: wireCompanyId || state.companyId.trim(),
    companyUuid: wireCompanyId || state.companyUuid.trim(),
  };
}

function enrichLoadedScope(loaded: Partial<AuthState>): Partial<AuthState> {
  const wireCompanyId = resolveWireCompanyId({
    companyUuid: loaded.companyUuid,
    companyId: loaded.companyId,
    accessToken: loaded.accessToken,
    memberships: loaded.memberships,
    employeeId: loaded.employeeId,
    tenantId: loaded.tenantId,
  });
  if (!wireCompanyId) return loaded;
  return {
    ...loaded,
    companyUuid: wireCompanyId,
  };
}

async function readAll(): Promise<Partial<AuthState>> {

  const [

    baseUrl,

    accessToken,

    refreshToken,

    internalApiKey,

    tenantId,

    companyId,

    companyUuid,

    employeeId,

    rolesJson,

    membershipsJson,

  ] = await Promise.all([

    SecureStore.getItemAsync(STORAGE.BASE_URL),

    SecureStore.getItemAsync(STORAGE.ACCESS_TOKEN),

    SecureStore.getItemAsync(STORAGE.REFRESH_TOKEN),

    SecureStore.getItemAsync(STORAGE.INTERNAL_KEY),

    SecureStore.getItemAsync(STORAGE.TENANT_ID),

    SecureStore.getItemAsync(STORAGE.COMPANY_ID),

    SecureStore.getItemAsync(STORAGE.COMPANY_UUID),

    SecureStore.getItemAsync(STORAGE.EMPLOYEE_ID),

    SecureStore.getItemAsync(STORAGE.ROLES_JSON),

    SecureStore.getItemAsync(STORAGE.MEMBERSHIPS_JSON),

  ]);

  let roles: string[] = [];

  if (rolesJson) {

    try {

      const parsed = JSON.parse(rolesJson) as unknown;

      if (Array.isArray(parsed)) roles = parsed.filter((r): r is string => typeof r === 'string');

    } catch {

      roles = [];

    }

  }

  let memberships: MobileMembership[] = [];

  if (membershipsJson) {

    try {

      const parsed = JSON.parse(membershipsJson) as unknown;

      if (Array.isArray(parsed)) memberships = parsed as MobileMembership[];

    } catch {

      memberships = [];

    }

  }

  if (!roles.length && accessToken) {

    roles = parseJwtClaims(accessToken)?.roles ?? [];

  }

  return enrichLoadedScope({

    baseUrl: baseUrl ?? '',

    accessToken: accessToken ?? '',

    refreshToken: refreshToken ?? '',

    internalApiKey: internalApiKey ?? '',

    tenantId: tenantId ?? '',

    companyId: companyId ?? 'holding',

    companyUuid: companyUuid ?? '',

    employeeId: employeeId ?? '',

    roles,

    memberships,

  });

}



async function persistAuth(next: AuthState) {

  await SecureStore.setItemAsync(STORAGE.BASE_URL, next.baseUrl.trim());

  await SecureStore.setItemAsync(STORAGE.ACCESS_TOKEN, next.accessToken.trim());

  await SecureStore.setItemAsync(STORAGE.REFRESH_TOKEN, next.refreshToken.trim());

  await SecureStore.setItemAsync(STORAGE.INTERNAL_KEY, next.internalApiKey.trim());

  await SecureStore.setItemAsync(STORAGE.TENANT_ID, next.tenantId.trim());

  await SecureStore.setItemAsync(STORAGE.COMPANY_ID, next.companyId.trim());

  await SecureStore.setItemAsync(STORAGE.COMPANY_UUID, next.companyUuid.trim());

  await SecureStore.setItemAsync(STORAGE.EMPLOYEE_ID, next.employeeId.trim());

  await SecureStore.setItemAsync(STORAGE.ROLES_JSON, JSON.stringify(next.roles));

  await SecureStore.setItemAsync(STORAGE.MEMBERSHIPS_JSON, JSON.stringify(next.memberships));

}



function scopeFromLogin(login: MobileLoginResult): {

  tenantId: string;

  companyId: string;

  companyUuid: string;

  employeeId: string;

  memberships: MobileMembership[];

} {

  const active = login.active_membership;

  const memberships = login.memberships ?? (active ? [active] : []);

  return {

    tenantId: active?.tenant_id ?? login.default_tenant_id ?? '',

    companyId: active?.company_id ?? login.default_company_id ?? '',

    companyUuid: active?.company_uuid ?? login.company_uuid ?? '',

    employeeId: active?.employee_id ?? login.employee.id,

    memberships,

  };

}



export function AuthProvider({ children }: { children: React.ReactNode }) {

  const [state, setState] = useState<AuthState>(defaultState);



  useEffect(() => {

    void (async () => {

      const loaded = await readAll();

      const storedUuid = (await SecureStore.getItemAsync(STORAGE.COMPANY_UUID)) ?? '';

      const base = loaded.baseUrl?.trim() || getDefaultBaseUrl();

      const hasAuth = Boolean(loaded.accessToken?.trim() || loaded.internalApiKey?.trim());

      const nextState: AuthState = {

        ...defaultState,

        ...loaded,

        baseUrl: base,

        hydrated: true,

        signedIn: hasAuth && Boolean(loaded.tenantId?.trim()) && Boolean(loaded.companyId?.trim()),

        roles: loaded.roles ?? [],

        memberships: loaded.memberships ?? [],

      };

      setState(nextState);

      if (nextState.companyUuid?.trim() && nextState.companyUuid.trim() !== storedUuid.trim()) {

        await SecureStore.setItemAsync(STORAGE.COMPANY_UUID, nextState.companyUuid.trim());

      }

    })();

  }, []);



  const signIn = useCallback(async (payload: SignInPayload) => {

    const wireCompanyId = resolveWireCompanyId({

      companyUuid: payload.companyUuid,

      companyId: payload.companyId,

      accessToken: payload.accessToken,

      memberships: payload.memberships,

      employeeId: payload.employeeId,

      tenantId: payload.tenantId,

    });

    const next: AuthState = {

      hydrated: true,

      signedIn: true,

      baseUrl: payload.baseUrl.trim() || getDefaultBaseUrl(),

      accessToken: payload.accessToken.trim(),

      refreshToken: payload.refreshToken.trim(),

      internalApiKey: payload.internalApiKey.trim(),

      tenantId: payload.tenantId.trim(),

      companyId: payload.companyId.trim(),

      companyUuid: wireCompanyId || payload.companyUuid.trim(),

      employeeId: payload.employeeId.trim(),

      roles: payload.roles ?? parseJwtClaims(payload.accessToken)?.roles ?? [],

      memberships: payload.memberships ?? [],

    };

    setState(next);

    await persistAuth(next);

    const cid = next.companyUuid && isUuid(next.companyUuid) ? next.companyUuid : '';

    if (cid && next.employeeId) {

      void registerHrmPushToken(buildHrmAuthConfig(next), cid, next.employeeId);

    }

  }, []);



  const signInWithMobileLogin = useCallback(

    async (payload: SignInPayload & { login: MobileLoginResult }) => {

      const scope = scopeFromLogin(payload.login);

      await signIn({

        ...payload,

        accessToken: payload.login.access_token,

        refreshToken: payload.login.refresh_token,

        tenantId: scope.tenantId,

        companyId: scope.companyId,

        companyUuid: scope.companyUuid,

        employeeId: scope.employeeId,

        roles: payload.login.roles,

        memberships: scope.memberships,

      });

    },

    [signIn],

  );



  const selectMembership = useCallback(

    async (employeeId: string): Promise<boolean> => {

      const res = await hrmRequest<MobileLoginResult>(buildHrmAuthConfig(state), '/auth/mobile/select-membership', {
        method: 'POST',
        body: JSON.stringify({ employee_id: employeeId }),
      });

      if (!res.ok) return false;

      const scope = scopeFromLogin(res.data);

      const wireCompanyId = resolveWireCompanyId({
        companyUuid: scope.companyUuid,
        companyId: scope.companyId,
        accessToken: res.data.access_token,
        memberships: scope.memberships,
        employeeId: scope.employeeId,
        tenantId: scope.tenantId,
      });

      const next: AuthState = {

        ...state,

        accessToken: res.data.access_token,

        refreshToken: res.data.refresh_token,

        tenantId: scope.tenantId,

        companyId: scope.companyId,

        companyUuid: wireCompanyId || scope.companyUuid,

        employeeId: scope.employeeId,

        roles: res.data.roles,

        memberships: scope.memberships,

      };

      setState(next);

      await persistAuth(next);

      return true;

    },

    [state],

  );



  const refreshAccessToken = useCallback(async (): Promise<boolean> => {

    const rt = state.refreshToken.trim();

    if (!rt) return false;

    const res = await hrmRequest<{

      access_token: string;

      refresh_token: string;

    }>(buildHrmAuthConfig(state), '/auth/mobile/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: rt }),
    });

    if (!res.ok) return false;

    const next = {

      ...state,

      accessToken: res.data.access_token,

      refreshToken: res.data.refresh_token,

      companyUuid:
        resolveWireCompanyId({
          companyUuid: state.companyUuid,
          companyId: state.companyId,
          accessToken: res.data.access_token,
          memberships: state.memberships,
          employeeId: state.employeeId,
          tenantId: state.tenantId,
        }) || state.companyUuid,

    };

    setState(next);

    await persistAuth(next);

    return true;

  }, [state]);



  const signOut = useCallback(async () => {

    await Promise.all([

      SecureStore.deleteItemAsync(STORAGE.ACCESS_TOKEN).catch(() => undefined),

      SecureStore.deleteItemAsync(STORAGE.REFRESH_TOKEN).catch(() => undefined),

      SecureStore.deleteItemAsync(STORAGE.INTERNAL_KEY).catch(() => undefined),

      SecureStore.deleteItemAsync(STORAGE.TENANT_ID).catch(() => undefined),

      SecureStore.deleteItemAsync(STORAGE.COMPANY_ID).catch(() => undefined),

      SecureStore.deleteItemAsync(STORAGE.COMPANY_UUID).catch(() => undefined),

      SecureStore.deleteItemAsync(STORAGE.EMPLOYEE_ID).catch(() => undefined),

      SecureStore.deleteItemAsync(STORAGE.ROLES_JSON).catch(() => undefined),

      SecureStore.deleteItemAsync(STORAGE.MEMBERSHIPS_JSON).catch(() => undefined),

    ]);

    setState((s) => ({

      ...defaultState,

      hydrated: true,

      signedIn: false,

      baseUrl: s.baseUrl || getDefaultBaseUrl(),

    }));

  }, []);



  const updateLocal = useCallback((partial: Partial<AuthState>) => {

    setState((s) => ({ ...s, ...partial }));

  }, []);



  const getHrmAuth = useCallback((): HrmAuthConfig => buildHrmAuthConfig(state), [state]);

  const getAttendanceCompanyId = useCallback((): string => {
    return resolveWireCompanyId({
      companyUuid: state.companyUuid,
      companyId: state.companyId,
      accessToken: state.accessToken,
      memberships: state.memberships,
      employeeId: state.employeeId,
      tenantId: state.tenantId,
    });
  }, [state]);

  const getPayrollQueryCompanyId = useCallback((): string => {
    return resolvePayrollQueryCompanyId({
      companyUuid: state.companyUuid,
      companyId: state.companyId,
      accessToken: state.accessToken,
      memberships: state.memberships,
      employeeId: state.employeeId,
      tenantId: state.tenantId,
    });
  }, [state]);

  const isManager = isManagerRole(state.roles);



  const value = useMemo<AuthContextValue>(

    () => ({

      ...state,

      signIn,

      signInWithMobileLogin,

      selectMembership,

      refreshAccessToken,

      signOut,

      updateLocal,

      getHrmAuth,

      getAttendanceCompanyId,

      getPayrollQueryCompanyId,

      isManager,

    }),

    [
      state,
      signIn,
      signInWithMobileLogin,
      selectMembership,
      refreshAccessToken,
      signOut,
      updateLocal,
      getHrmAuth,
      getAttendanceCompanyId,
      getPayrollQueryCompanyId,
      isManager,
    ],

  );



  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;

}



export function useAuth(): AuthContextValue {

  const ctx = useContext(AuthContext);

  if (!ctx) throw new Error('useAuth must be used within AuthProvider');

  return ctx;

}

