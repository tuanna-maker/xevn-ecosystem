import * as SecureStore from 'expo-secure-store';

const BIOMETRIC_FLAG = 'hrm_mobile_biometric_enabled';

export async function isBiometricEnabled(): Promise<boolean> {
  return (await SecureStore.getItemAsync(BIOMETRIC_FLAG)) === '1';
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  if (enabled) await SecureStore.setItemAsync(BIOMETRIC_FLAG, '1');
  else await SecureStore.deleteItemAsync(BIOMETRIC_FLAG).catch(() => undefined);
}

/** MOB-403: yêu cầu Face/Touch nếu user bật — không thay refresh token. */
export async function promptBiometricIfEnabled(): Promise<boolean> {
  const enabled = await isBiometricEnabled();
  if (!enabled) return true;
  try {
    const LocalAuthentication = await import('expo-local-authentication');
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) return true;
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    if (!enrolled) return true;
    const res = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Mở khóa XeVN HRM',
      cancelLabel: 'Huỷ',
    });
    return res.success;
  } catch {
    return true;
  }
}
