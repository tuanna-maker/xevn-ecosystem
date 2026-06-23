import * as SecureStore from 'expo-secure-store';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import type { HrmAuthConfig } from '../integrations/types';

import { getDefaultBaseUrl, hrmRequest, type HrmRequestResult } from '../integrations/hrmApiClient';

import { computeTokenExpiresAt, isMobileTokenExpired } from '../integrations/mobileAuthSession';

import {
  resolveHomeSummaryQueryCompanyId,
  resolveLeaveBalanceQueryCompanyId,
  resolvePayrollQueryCompanyId,
  resolveWireCompanyId,
} from '../integrations/companyWireScope';
import {
  resolveHrmOperatingUnitQueryCompanyId,
  type HrmOperatingUnitSlug,
} from '../integrations/hrmListScope';

import { isManagerRole, parseJwtClaims } from '../integrations/jwtClaims';

import { tryRegisterExpoPushToken } from '../integrations/pushRegistration';

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

  /** Epoch ms — refreshed from login/refresh `expires_in_sec` (portal 86400 parity). */
  tokenExpiresAt: number;

  /** Cached from GET /employees/:id — MOB-UX-13e persona resolve. */
  jobTitleKey: string;

  /** GET /home/summary viewer.is_manager — null until first Home load. */
  summaryIsManager: boolean | null;

};



export type SignInPayload = Omit<
  AuthState,
  'hydrated' | 'signedIn' | 'tokenExpiresAt' | 'jobTitleKey' | 'summaryIsManager'
> & {
  tokenExpiresAt?: number;
  jobTitleKey?: string;
  summaryIsManager?: boolean | null;
};



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

  expires_in_sec?: number;

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

  tokenExpiresAt: 0,

  jobTitleKey: '',

  summaryIsManager: null,

};



type AuthContextValue = AuthState & {

  signIn: (payload: SignInPayload) => Promise<void>;

  signInWithMobileLogin: (payload: SignInPayload & { login: MobileLoginResult }) => Promise<void>;

  selectMembership: (employeeId: string) => Promise<boolean>;

  /** U39 — narrow list API scope; JWT unchanged (group CEO operating-unit filter). */
  selectOperatingUnitFilter: (selection: 'all' | HrmOperatingUnitSlug) => Promise<void>;

  refreshAccessToken: () => Promise<boolean>;

  signOut: () => Promise<void>;

  updateLocal: (partial: Partial<AuthState>) => void;

  getHrmAuth: () => HrmAuthConfig;

  getAttendanceCompanyId: () => string;

  getPayrollQueryCompanyId: () => string;

  getHomeSummaryQueryCompanyId: () => string;

  getLeaveBalanceQueryCompanyId: () => string;

  /** Ensures JWT is fresh (refresh when near expiry) then calls HRM API. */
  requestHrm: <T>(
    path: string,
    init?: RequestInit & { timeoutMs?: number },
  ) => Promise<HrmRequestResult<T>>;

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
    companyId: state.companyId.trim(),
    companyUuid: wireCompanyId || state.companyUuid.trim(),
    employeeId: state.employeeId.trim() || undefined,
    memberships: state.memberships,
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
  let companyId = loaded.companyId ?? 'holding';
  if (isUuid(companyId.trim())) {
    const recoveredSlug = resolveLeaveBalanceQueryCompanyId({
      companyUuid: wireCompanyId || loaded.companyUuid,
      companyId,
      accessToken: loaded.accessToken,
      memberships: loaded.memberships,
      employeeId: loaded.employeeId,
      tenantId: loaded.tenantId,
    });
    if (recoveredSlug && !isUuid(recoveredSlug)) companyId = recoveredSlug;
  }
  if (!wireCompanyId) {
    return { ...loaded, companyId };
  }
  return {
    ...loaded,
    companyUuid: wireCompanyId,
    companyId,
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

    tokenExpiresRaw,

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

    SecureStore.getItemAsync(STORAGE.TOKEN_EXPIRES_AT),

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

  let tokenExpiresAt = Number(tokenExpiresRaw ?? 0);
  if (!Number.isFinite(tokenExpiresAt) || tokenExpiresAt <= 0) tokenExpiresAt = 0;

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

    tokenExpiresAt,

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

  await SecureStore.setItemAsync(STORAGE.TOKEN_EXPIRES_AT, String(next.tokenExpiresAt || 0));

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

  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);


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

      tokenExpiresAt: payload.tokenExpiresAt || 0,

      jobTitleKey: payload.jobTitleKey?.trim() ?? '',

      summaryIsManager: payload.summaryIsManager ?? null,

    };

    setState(next);

    await persistAuth(next);

    const cid = next.companyUuid && isUuid(next.companyUuid) ? next.companyUuid : '';

    if (cid && next.employeeId) {
      void tryRegisterExpoPushToken(buildHrmAuthConfig(next), cid, next.employeeId).catch(
        () => undefined,
      );
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

        tokenExpiresAt: computeTokenExpiresAt(payload.login.expires_in_sec),

      });

    },

    [signIn],

  );



  const selectOperatingUnitFilter = useCallback(
    async (selection: 'all' | HrmOperatingUnitSlug): Promise<void> => {
      const listCompanyId = resolveHrmOperatingUnitQueryCompanyId(selection);
      const next: AuthState = {
        ...state,
        companyId: listCompanyId,
      };
      setState(next);
      await SecureStore.setItemAsync(STORAGE.COMPANY_ID, listCompanyId);
    },
    [state],
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

        tokenExpiresAt: computeTokenExpiresAt(res.data.expires_in_sec),

        jobTitleKey: '',

        summaryIsManager: null,

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

      expires_in_sec?: number;

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

      tokenExpiresAt: computeTokenExpiresAt(res.data.expires_in_sec),

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

      SecureStore.deleteItemAsync(STORAGE.TOKEN_EXPIRES_AT).catch(() => undefined),

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

  const requestHrm = useCallback(
    async <T,>(
      path: string,
      init: RequestInit & { timeoutMs?: number } = {},
    ): Promise<HrmRequestResult<T>> => {
      let current = stateRef.current;
      if (isMobileTokenExpired(current.tokenExpiresAt) && current.refreshToken.trim()) {
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
          return {
            ok: false,
            code: 'HRM-AUTH-401',
            message: 'Phiên đăng nhập hết hạn — vui lòng đăng nhập lại',
            requestId: 'mob-auth-expired',
            httpStatus: 401,
          };
        }
        current = stateRef.current;
      }
      return hrmRequest<T>(buildHrmAuthConfig(current), path, init);
    },
    [refreshAccessToken],
  );

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

  const getHomeSummaryQueryCompanyId = useCallback((): string => {
    return resolveHomeSummaryQueryCompanyId({
      companyUuid: state.companyUuid,
      companyId: state.companyId,
      accessToken: state.accessToken,
      memberships: state.memberships,
      employeeId: state.employeeId,
      tenantId: state.tenantId,
    });
  }, [state]);

  const getLeaveBalanceQueryCompanyId = useCallback((): string => {
    return resolveLeaveBalanceQueryCompanyId({
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

      selectOperatingUnitFilter,

      refreshAccessToken,

      signOut,

      updateLocal,

      getHrmAuth,

      requestHrm,

      getAttendanceCompanyId,

      getPayrollQueryCompanyId,

      getHomeSummaryQueryCompanyId,

      getLeaveBalanceQueryCompanyId,

      isManager,

    }),

    [
      state,
      signIn,
      signInWithMobileLogin,
      selectMembership,
      selectOperatingUnitFilter,
      refreshAccessToken,
      signOut,
      updateLocal,
      getHrmAuth,
      requestHrm,
      getAttendanceCompanyId,
      getPayrollQueryCompanyId,
      getHomeSummaryQueryCompanyId,
      getLeaveBalanceQueryCompanyId,
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

