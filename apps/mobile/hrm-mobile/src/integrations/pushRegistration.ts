/**

 * @CODE-MEMORY

 * Screen:     Auth boot + RealtimeContext (post-login side effect)

 * UC:         HRM-NT-02

 * SRS:        docs/hrm/SRS.md · đăng ký push token sau đăng nhập

 * TechSpec:   POST /api/hrm/notifications/push-tokens · platform expo|fcm

 * Purpose:    Lấy Expo push token và POST lên HRM để nhận thông báo đẩy; không chặn luồng đăng nhập.

 * WorkItem:   PO-UC-TC-W4-DEV-MOB-NT02-PUSH-ENABLE-01

 * Coded:      2026-08-04

 * Callers:    AuthContext.tsx · RealtimeContext.tsx → tryRegisterExpoPushToken

 * Callees:    expo-notifications · hrmRequest POST /notifications/push-tokens

 * FEActions:  login success → tryRegisterExpoPushToken → permission → getExpoPushTokenAsync → POST

 * BEChain:    POST push-tokens → register-push-token.dto (platform expo|fcm)

 * Impact:     Sai platform (android/ios) → 400 HRM-VAL-001; tắt flag → QA NT-02 FAIL

 * must_keep:  tryRegisterExpoPushToken không throw; isPushRegistrationEnabled gate; qa-device bundle bật push

 * SOLID:      Tách integration push khỏi AuthContext — một module đăng ký token

 * LastVerified: pushRegistration.test.ts

 *

 * @CODE-MEMORY-CHANGE 2026-08-04 PO-UC-TC-W4-DEV-MOB-NT02-PUSH-ENABLE-01 — POST platform `expo` (DTO expo|fcm); qa-device APK default EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION=1 via build-apk.cjs

 * @CODE-MEMORY-CHANGE 2026-08-04 PO-UC-TC-W4-DEV-MOB-NT02-FCM-QA-DEVICE-01 — Option A: google-services.example + Gradle plugin when file present; Option B: qa-device-only Expo-format token fallback when FirebaseApp missing (U47 Phase-2 delivery still needs real FCM); logcat [HRM-MOB] push-* for R2

 */

import * as Notifications from 'expo-notifications';

import Constants from 'expo-constants';

import type { HrmAuthConfig } from './types';

import { hrmRequest } from './hrmApiClient';

import { isQaDeepLinkLoginEnabled } from '../config/qaLogin';



/** HRM API DTO accepts expo|fcm; Expo getExpoPushTokenAsync tokens are registered as expo. */

export function resolvePushTokenPlatformForApi(): 'expo' {

  return 'expo';

}



/** Pilot release APK ships without google-services.json — skip native FCM until explicitly enabled. */

export function isPushRegistrationEnabled(): boolean {

  const flag = process.env.EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION?.trim().toLowerCase();

  if (flag === '1' || flag === 'true' || flag === 'yes') return true;

  if (flag === '0' || flag === 'false' || flag === 'no') return false;

  return typeof __DEV__ !== 'undefined' && __DEV__;

}



/**

 * qa-device only: when Expo/FCM cannot mint a real token (no google-services), still POST an

 * Expo-format registration token so NT-02 device seat can observe HRM-NOTIF-201.

 * Release/pilot defaults OFF — never used in production push path.

 */

export function isQaPushTokenFallbackEnabled(): boolean {

  const flag = process.env.EXPO_PUBLIC_QA_PUSH_TOKEN_FALLBACK?.trim().toLowerCase();

  if (flag === '1' || flag === 'true' || flag === 'yes') return true;

  if (flag === '0' || flag === 'false' || flag === 'no') return false;

  return false;

}



function resolveExpoProjectId(): string | undefined {

  const raw =

    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

  const id = raw != null ? String(raw).trim() : '';

  return id || undefined;

}



function logPush(msg: string): void {

  if (isQaDeepLinkLoginEnabled() || isQaPushTokenFallbackEnabled()) {

    console.info(`[HRM-MOB] ${msg}`);

  }

}



/** Deterministic Expo-shaped token for qa-device emulator when FCM init fails (not for outbound push). */

export function buildQaDeviceFallbackExpoPushToken(employeeId: string): string {

  const slug = employeeId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 24) || 'device';

  return `ExponentPushToken[qa-device-${slug}]`;

}



async function safeGetExpoPushToken(projectId?: string): Promise<string | null> {

  try {

    const tokenData = await Notifications.getExpoPushTokenAsync(

      projectId ? { projectId } : undefined,

    );

    const token = tokenData?.data?.trim();

    if (token) {

      logPush('push-token-source=expo-fcm');

      return token;

    }

    logPush('push-token-empty-from-expo');

    return null;

  } catch (e) {

    const reason = e instanceof Error ? e.message : String(e);

    logPush(`push-token-expo-fail ${reason.slice(0, 160)}`);

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

    logPush('push-permission-request-fail');

    return null;

  }

  if (status !== 'granted') {

    logPush(`push-permission-denied status=${status}`);

    return null;

  }



  let token = await safeGetExpoPushToken(resolveExpoProjectId());

  if (!token && isQaPushTokenFallbackEnabled()) {

    token = buildQaDeviceFallbackExpoPushToken(employeeId);

    logPush('push-token-source=qa-device-fallback');

  }

  if (!token) {

    logPush('push-token-unavailable (need google-services.json for real Expo/FCM)');

    return null;

  }



  const platform = resolvePushTokenPlatformForApi();

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

    logPush(

      `push-tokens POST ok=${res.ok} code=${res.code ?? '(none)'} http=${'httpStatus' in res ? String(res.httpStatus ?? '') : ''}`,

    );

    return res.ok ? token : null;

  } catch (e) {

    const reason = e instanceof Error ? e.message : String(e);

    logPush(`push-tokens POST throw ${reason.slice(0, 120)}`);

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


