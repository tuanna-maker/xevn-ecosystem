import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import type { HrmAuthConfig } from './types';
import { hrmRequest } from './hrmApiClient';

/** Pilot release APK ships without google-services.json — skip native FCM until explicitly enabled. */
export function isPushRegistrationEnabled(): boolean {
  const flag = process.env.EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION?.trim().toLowerCase();
  if (flag === '1' || flag === 'true' || flag === 'yes') return true;
  if (flag === '0' || flag === 'false' || flag === 'no') return false;
  return typeof __DEV__ !== 'undefined' && __DEV__;
}

function resolveExpoProjectId(): string | undefined {
  const raw =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  const id = raw != null ? String(raw).trim() : '';
  return id || undefined;
}

async function safeGetExpoPushToken(projectId?: string): Promise<string | null> {
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    const token = tokenData?.data?.trim();
    return token || null;
  } catch {
    /* Firebase not initialized / missing FCM credentials — non-fatal on pilot release */
    return null;
  }
}

export async function registerHrmPushToken(
  auth: HrmAuthConfig,
  companyId: string,
  employeeId: string,
): Promise<string | null> {
  if (!isPushRegistrationEnabled()) return null;
  if (!employeeId.trim() || !companyId.trim()) return null;

  let status: Notifications.PermissionStatus;
  try {
    ({ status } = await Notifications.requestPermissionsAsync());
  } catch {
    return null;
  }
  if (status !== 'granted') return null;

  const token = await safeGetExpoPushToken(resolveExpoProjectId());
  if (!token) return null;

  const platform = Platform.OS === 'ios' ? 'ios' : 'android';
  try {
    const res = await hrmRequest<unknown>(auth, '/notifications/push-tokens', {
      method: 'POST',
      body: JSON.stringify({
        company_id: companyId,
        employee_id: employeeId,
        platform,
        token,
      }),
    });
    return res.ok ? token : null;
  } catch {
    return null;
  }
}

/** Best-effort push registration on signed-in boot; must not surface RN unhandled rejections. */
export async function tryRegisterExpoPushToken(
  auth: HrmAuthConfig,
  companyId: string,
  employeeId: string,
): Promise<void> {
  try {
    await registerHrmPushToken(auth, companyId, employeeId);
  } catch {
    /* permissions / network / missing EAS project — non-fatal */
  }
}
