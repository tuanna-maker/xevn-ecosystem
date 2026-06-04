import { describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

vi.mock('expo-notifications', () => ({
  requestPermissionsAsync: vi.fn(async () => ({ status: 'denied' })),
}));

vi.mock('expo-constants', () => ({
  default: { expoConfig: { extra: {} }, easConfig: {} },
}));

vi.mock('../hrmApiClient', () => ({
  hrmRequest: vi.fn(async () => ({ ok: true })),
}));

import { tryRegisterExpoPushToken } from '../pushRegistration';

describe('tryRegisterExpoPushToken', () => {
  it('is exported and does not throw when permissions denied', async () => {
    await expect(
      tryRegisterExpoPushToken(
        { baseUrl: 'https://example.test', tenantId: 't', companyId: 'c' },
        '00000000-0000-4000-8000-000000000001',
        'emp-1',
      ),
    ).resolves.toBeUndefined();
  });
});
