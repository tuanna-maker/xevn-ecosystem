/**
 * Sponsor/pilot release APK: `EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN=0` (email+password only).
 * QA-device APK: `pnpm run android:apk:qa-device` sets flag `1` (dev JWT form + deep link).
 */
export function isQaDevLoginEnabled(): boolean {
  const flag = process.env.EXPO_PUBLIC_ENABLE_QA_DEV_LOGIN?.trim().toLowerCase();
  if (flag === '0' || flag === 'false' || flag === 'no') return false;
  if (flag === '1' || flag === 'true' || flag === 'yes') return true;
  return typeof __DEV__ !== 'undefined' && __DEV__;
}

export function isQaDeepLinkLoginEnabled(): boolean {
  const flag = process.env.EXPO_PUBLIC_ENABLE_QA_DEEP_LINK?.trim().toLowerCase();
  if (flag === '0' || flag === 'false' || flag === 'no') return false;
  if (flag === '1' || flag === 'true' || flag === 'yes') return true;
  return isQaDevLoginEnabled();
}
