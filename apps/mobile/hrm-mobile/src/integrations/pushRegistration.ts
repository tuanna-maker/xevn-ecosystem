import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import type { HrmAuthConfig } from './types';
import { hrmRequest } from './hrmApiClient';

export async function registerHrmPushToken(
  auth: HrmAuthConfig,
  companyId: string,
  employeeId: string,
): Promise<string | null> {
  if (!employeeId.trim() || !companyId.trim()) return null;
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return null;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;
  const tokenData = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId: String(projectId) } : undefined,
  );
  const token = tokenData.data;
  const platform = Platform.OS === 'ios' ? 'ios' : 'android';
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
}

/** Best-effort push registration on signed-in boot; must not crash the app shell. */
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
