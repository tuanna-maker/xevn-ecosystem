import * as SecureStore from 'expo-secure-store';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { HrmAuthConfig } from '../integrations/types';
import { getDefaultBaseUrl } from '../integrations/hrmApiClient';
import { EXPO_DEFAULT_TENANT_ID } from '../config/tenantDefaults';
import { STORAGE } from '../storage/keys';
import { isUuid } from '../utils/uuid';

export type AuthState = {
  hydrated: boolean;
  signedIn: boolean;
  baseUrl: string;
  accessToken: string;
  internalApiKey: string;
  tenantId: string;
  companyId: string;
  companyUuid: string;
  employeeId: string;
};

export type SignInPayload = Omit<AuthState, 'hydrated' | 'signedIn'>;

const defaultState: AuthState = {
  hydrated: false,
  signedIn: false,
  baseUrl: '',
  accessToken: '',
  internalApiKey: '',
  tenantId: '',
  companyId: 'holding',
  companyUuid: '',
  employeeId: '',
};

type AuthContextValue = AuthState & {
  signIn: (payload: SignInPayload) => Promise<void>;
  signOut: () => Promise<void>;
  updateLocal: (partial: Partial<AuthState>) => void;
  getHrmAuth: () => HrmAuthConfig;
  /** UUID dùng cho attendance/payroll (SRS: company_id UUID trên một số endpoint). */
  getAttendanceCompanyId: () => string;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function readAll(): Promise<Partial<AuthState>> {
  const [
    baseUrl,
    accessToken,
    internalApiKey,
    tenantId,
    companyId,
    companyUuid,
    employeeId,
  ] = await Promise.all([
    SecureStore.getItemAsync(STORAGE.BASE_URL),
    SecureStore.getItemAsync(STORAGE.ACCESS_TOKEN),
    SecureStore.getItemAsync(STORAGE.INTERNAL_KEY),
    SecureStore.getItemAsync(STORAGE.TENANT_ID),
    SecureStore.getItemAsync(STORAGE.COMPANY_ID),
    SecureStore.getItemAsync(STORAGE.COMPANY_UUID),
    SecureStore.getItemAsync(STORAGE.EMPLOYEE_ID),
  ]);
  return {
    baseUrl: baseUrl ?? '',
    accessToken: accessToken ?? '',
    internalApiKey: internalApiKey ?? '',
    tenantId: tenantId?.trim() || EXPO_DEFAULT_TENANT_ID || '',
    companyId: companyId ?? 'holding',
    companyUuid: companyUuid ?? '',
    employeeId: employeeId ?? '',
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(defaultState);

  useEffect(() => {
    void (async () => {
      const loaded = await readAll();
      const base = loaded.baseUrl?.trim() || getDefaultBaseUrl();
      const hasAuth = Boolean(loaded.accessToken?.trim() || loaded.internalApiKey?.trim());
      setState((s) => ({
        ...s,
        ...loaded,
        baseUrl: base,
        hydrated: true,
        signedIn: hasAuth && Boolean(loaded.tenantId?.trim()) && Boolean(loaded.companyId?.trim()),
      }));
    })();
  }, []);

  const signIn = useCallback(async (payload: SignInPayload) => {
    const next: AuthState = {
      hydrated: true,
      signedIn: true,
      baseUrl: payload.baseUrl.trim() || getDefaultBaseUrl(),
      accessToken: payload.accessToken.trim(),
      internalApiKey: payload.internalApiKey.trim(),
      tenantId: payload.tenantId.trim(),
      companyId: payload.companyId.trim(),
      companyUuid: payload.companyUuid.trim(),
      employeeId: payload.employeeId.trim(),
    };
    setState(next);
    await SecureStore.setItemAsync(STORAGE.BASE_URL, next.baseUrl.trim());
    await SecureStore.setItemAsync(STORAGE.ACCESS_TOKEN, payload.accessToken.trim());
    await SecureStore.setItemAsync(STORAGE.INTERNAL_KEY, payload.internalApiKey.trim());
    await SecureStore.setItemAsync(STORAGE.TENANT_ID, payload.tenantId.trim());
    await SecureStore.setItemAsync(STORAGE.COMPANY_ID, payload.companyId.trim());
    await SecureStore.setItemAsync(STORAGE.COMPANY_UUID, payload.companyUuid.trim());
    await SecureStore.setItemAsync(STORAGE.EMPLOYEE_ID, payload.employeeId.trim());
  }, []);

  const signOut = useCallback(async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(STORAGE.ACCESS_TOKEN).catch(() => undefined),
      SecureStore.deleteItemAsync(STORAGE.INTERNAL_KEY).catch(() => undefined),
      SecureStore.deleteItemAsync(STORAGE.TENANT_ID).catch(() => undefined),
      SecureStore.deleteItemAsync(STORAGE.COMPANY_ID).catch(() => undefined),
      SecureStore.deleteItemAsync(STORAGE.COMPANY_UUID).catch(() => undefined),
      SecureStore.deleteItemAsync(STORAGE.EMPLOYEE_ID).catch(() => undefined),
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

  const getHrmAuth = useCallback((): HrmAuthConfig => {
    return {
      baseUrl: state.baseUrl.trim() || getDefaultBaseUrl(),
      accessToken: state.accessToken.trim() || undefined,
      internalApiKey: state.internalApiKey.trim() || undefined,
      tenantId: state.tenantId.trim(),
      companyId: state.companyId.trim(),
    };
  }, [state]);

  const getAttendanceCompanyId = useCallback((): string => {
    if (state.companyUuid.trim() && isUuid(state.companyUuid.trim())) return state.companyUuid.trim();
    if (isUuid(state.companyId.trim())) return state.companyId.trim();
    return '';
  }, [state.companyId, state.companyUuid]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      signIn,
      signOut,
      updateLocal,
      getHrmAuth,
      getAttendanceCompanyId,
    }),
    [state, signIn, signOut, updateLocal, getHrmAuth, getAttendanceCompanyId],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
