import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { hrmRequest } from './hrmApiClient';
import type { HrmAuthConfig } from './types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: true,
  }),
});

function resolveEasProjectId(): string | undefined {
  const extra = Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined;
  const fromExtra = extra?.eas?.projectId?.trim();
  if (fromExtra) return fromExtra;
  const fromEnv = process.env.EXPO_PUBLIC_EAS_PROJECT_ID?.trim();
  return fromEnv || undefined;
}

/** Đăng ký Expo push token lên `hrm-api` (bỏ qua lỗi nếu Expo Go / thiếu projectId). */
export async function tryRegisterExpoPushToken(
  auth: HrmAuthConfig,
  companyUuid: string,
  employeeId: string,
): Promise<void> {
  if (Platform.OS === 'web' || !employeeId.trim() || !companyUuid.trim()) return;
  try {
    const perm = await Notifications.getPermissionsAsync();
    const status =
      perm.status === 'granted' ? perm.status : (await Notifications.requestPermissionsAsync()).status;
    if (status !== 'granted') return;

    const projectId = resolveEasProjectId();
    const expo = projectId
      ? await Notifications.getExpoPushTokenAsync({ projectId })
      : await Notifications.getExpoPushTokenAsync();

    await hrmRequest(auth, '/notifications/push-tokens', {
      method: 'POST',
      body: JSON.stringify({
        company_id: companyUuid,
        employee_id: employeeId.trim(),
        platform: 'expo',
        token: expo.data,
      }),
    });
  } catch {
    /* pilot: Expo Go / missing EAS project — ignore */
  }
}
