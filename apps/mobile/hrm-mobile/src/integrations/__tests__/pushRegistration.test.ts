import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { requestPermissionsAsync, getExpoPushTokenAsync, hrmRequest } = vi.hoisted(() => ({
  requestPermissionsAsync: vi.fn(async (): Promise<{ status: string }> => ({ status: 'denied' })),
  getExpoPushTokenAsync: vi.fn(async () => ({ data: 'ExponentPushToken[test]' })),
  hrmRequest: vi.fn(async () => ({ ok: true })),
}));

vi.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

vi.mock('expo-notifications', () => ({
  requestPermissionsAsync,
  getExpoPushTokenAsync,
}));

vi.mock('expo-constants', () => ({
  default: {
    expoConfig: { extra: { eas: { projectId: '36a4e288-7b45-4019-abaa-d2460c21c5b7' } } },
    easConfig: {},
  },
}));

vi.mock('../hrmApiClient', () => ({
  hrmRequest,
}));

import {
  isPushRegistrationEnabled,
  registerHrmPushToken,
  tryRegisterExpoPushToken,
} from '../pushRegistration';

const auth = {
  baseUrl: 'https://example.test',
  tenantId: 't',
  companyId: 'c',
};

describe('isPushRegistrationEnabled', () => {
  const prev = process.env.EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION;

  afterEach(() => {
    if (prev === undefined) delete process.env.EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION;
    else process.env.EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION = prev;
  });

  it('is false when explicitly disabled (release pilot default)', () => {
    process.env.EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION = '0';
    expect(isPushRegistrationEnabled()).toBe(false);
  });

  it('is true when explicitly enabled', () => {
    process.env.EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION = 'true';
    expect(isPushRegistrationEnabled()).toBe(true);
  });
});

describe('tryRegisterExpoPushToken', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requestPermissionsAsync.mockResolvedValue({ status: 'denied' });
    process.env.EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION = '0';
  });

  it('does not call native push APIs when registration disabled', async () => {
    await expect(
      tryRegisterExpoPushToken(auth, '00000000-0000-4000-8000-000000000001', 'emp-1'),
    ).resolves.toBeUndefined();
    expect(requestPermissionsAsync).not.toHaveBeenCalled();
    expect(getExpoPushTokenAsync).not.toHaveBeenCalled();
  });

  it('does not throw when permissions denied', async () => {
    process.env.EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION = 'true';
    await expect(
      tryRegisterExpoPushToken(auth, '00000000-0000-4000-8000-000000000001', 'emp-1'),
    ).resolves.toBeUndefined();
    expect(getExpoPushTokenAsync).not.toHaveBeenCalled();
  });

  it('swallows getExpoPushTokenAsync rejection (Firebase not initialized)', async () => {
    process.env.EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION = 'true';
    requestPermissionsAsync.mockResolvedValueOnce({ status: 'granted' });
    getExpoPushTokenAsync.mockRejectedValueOnce(
      new Error('Default FirebaseApp is not initialized'),
    );
    await expect(
      registerHrmPushToken(auth, '00000000-0000-4000-8000-000000000001', 'emp-1'),
    ).resolves.toBeNull();
    await expect(
      tryRegisterExpoPushToken(auth, '00000000-0000-4000-8000-000000000001', 'emp-1'),
    ).resolves.toBeUndefined();
  });
});
