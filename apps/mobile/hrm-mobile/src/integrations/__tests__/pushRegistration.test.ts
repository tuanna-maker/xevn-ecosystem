import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';



const { requestPermissionsAsync, getExpoPushTokenAsync, hrmRequest } = vi.hoisted(() => ({

  requestPermissionsAsync: vi.fn(async (): Promise<{ status: string }> => ({ status: 'denied' })),

  getExpoPushTokenAsync: vi.fn(async () => ({ data: 'ExponentPushToken[test]' })),

  hrmRequest: vi.fn(async () => ({ ok: true, code: 'HRM-NOTIF-201' })),

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



vi.mock('../../config/qaLogin', () => ({

  isQaDeepLinkLoginEnabled: () => true,

}));



import {

  buildQaDeviceFallbackExpoPushToken,

  isPushRegistrationEnabled,

  isQaPushTokenFallbackEnabled,

  registerHrmPushToken,

  resolvePushTokenPlatformForApi,

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



describe('isQaPushTokenFallbackEnabled', () => {

  const prev = process.env.EXPO_PUBLIC_QA_PUSH_TOKEN_FALLBACK;



  afterEach(() => {

    if (prev === undefined) delete process.env.EXPO_PUBLIC_QA_PUSH_TOKEN_FALLBACK;

    else process.env.EXPO_PUBLIC_QA_PUSH_TOKEN_FALLBACK = prev;

  });



  it('is false by default (release)', () => {

    delete process.env.EXPO_PUBLIC_QA_PUSH_TOKEN_FALLBACK;

    expect(isQaPushTokenFallbackEnabled()).toBe(false);

  });



  it('is true when qa-device flag set', () => {

    process.env.EXPO_PUBLIC_QA_PUSH_TOKEN_FALLBACK = '1';

    expect(isQaPushTokenFallbackEnabled()).toBe(true);

  });

});



describe('resolvePushTokenPlatformForApi', () => {

  it('returns expo for HRM register-push-token.dto', () => {

    expect(resolvePushTokenPlatformForApi()).toBe('expo');

  });

});



describe('buildQaDeviceFallbackExpoPushToken', () => {

  it('returns Expo-shaped token with employee slug', () => {

    expect(buildQaDeviceFallbackExpoPushToken('b06422c0-aaaa-bbbb-cccc-dddddddddddd')).toBe(

      'ExponentPushToken[qa-device-b06422c0aaaabbbbccccdddd]',

    );

  });

});



describe('tryRegisterExpoPushToken', () => {

  beforeEach(() => {

    vi.clearAllMocks();

    requestPermissionsAsync.mockResolvedValue({ status: 'denied' });

    process.env.EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION = '0';

    process.env.EXPO_PUBLIC_QA_PUSH_TOKEN_FALLBACK = '0';

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

    process.env.EXPO_PUBLIC_QA_PUSH_TOKEN_FALLBACK = '0';

    requestPermissionsAsync.mockResolvedValueOnce({ status: 'granted' });

    getExpoPushTokenAsync.mockRejectedValueOnce(

      new Error('Default FirebaseApp is not initialized'),

    );

    await expect(

      registerHrmPushToken(auth, '00000000-0000-4000-8000-000000000001', 'emp-1'),

    ).resolves.toBeNull();

    expect(hrmRequest).not.toHaveBeenCalled();

  });



  it('qa-device fallback POSTs Expo-format token when FirebaseApp missing', async () => {

    process.env.EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION = 'true';

    process.env.EXPO_PUBLIC_QA_PUSH_TOKEN_FALLBACK = '1';

    requestPermissionsAsync.mockResolvedValueOnce({ status: 'granted' });

    getExpoPushTokenAsync.mockRejectedValueOnce(

      new Error('Default FirebaseApp is not initialized'),

    );

    hrmRequest.mockResolvedValueOnce({ ok: true, code: 'HRM-NOTIF-201' });



    const employeeId = 'b06422c0-0000-4000-8000-000000000007';

    const token = await registerHrmPushToken(

      auth,

      '00000000-0000-4000-8000-000000000001',

      employeeId,

    );



    expect(token).toBe(buildQaDeviceFallbackExpoPushToken(employeeId));

    expect(hrmRequest).toHaveBeenCalledWith(

      auth,

      '/notifications/push-tokens',

      expect.objectContaining({

        method: 'POST',

        body: JSON.stringify({

          company_id: '00000000-0000-4000-8000-000000000001',

          employee_id: employeeId,

          platform: 'expo',

          token: buildQaDeviceFallbackExpoPushToken(employeeId),

        }),

      }),

    );

  });



  it('POST push-tokens body uses platform expo (not android/ios)', async () => {

    process.env.EXPO_PUBLIC_ENABLE_PUSH_REGISTRATION = 'true';

    requestPermissionsAsync.mockResolvedValueOnce({ status: 'granted' });

    getExpoPushTokenAsync.mockResolvedValueOnce({ data: 'ExponentPushToken[device-qa]' });

    hrmRequest.mockResolvedValueOnce({ ok: true, code: 'HRM-NOTIF-201' });



    await registerHrmPushToken(

      auth,

      '00000000-0000-4000-8000-000000000001',

      '00000000-0000-4000-8000-000000000002',

    );



    expect(hrmRequest).toHaveBeenCalledWith(

      auth,

      '/notifications/push-tokens',

      expect.objectContaining({

        method: 'POST',

        body: JSON.stringify({

          company_id: '00000000-0000-4000-8000-000000000001',

          employee_id: '00000000-0000-4000-8000-000000000002',

          platform: 'expo',

          token: 'ExponentPushToken[device-qa]',

        }),

      }),

    );

  });

});


