import { afterEach, describe, expect, it, vi } from 'vitest';

const platformState: { os: 'android' | 'ios'; version: number | string } = { os: 'android', version: 33 };

vi.mock('react-native', () => ({
  Platform: {
    get OS() {
      return platformState.os;
    },
    get Version() {
      return platformState.version;
    },
  },
  Alert: { alert: vi.fn() },
  Linking: { openSettings: vi.fn() },
}));

describe('hrmImagePicker', () => {
  afterEach(() => {
    platformState.os = 'android';
    platformState.version = 33;
    vi.resetModules();
  });

  it('skips media-library permission on Android 33+', async () => {
    platformState.os = 'android';
    platformState.version = 33;
    const { shouldRequestMediaLibraryPermission } = await import('../hrmImagePicker');
    expect(shouldRequestMediaLibraryPermission()).toBe(false);
  });

  it('requires media-library permission on Android 32', async () => {
    platformState.os = 'android';
    platformState.version = 32;
    const { shouldRequestMediaLibraryPermission } = await import('../hrmImagePicker');
    expect(shouldRequestMediaLibraryPermission()).toBe(true);
  });

  it('requires media-library permission on iOS', async () => {
    platformState.os = 'ios';
    platformState.version = '17.0';
    const { shouldRequestMediaLibraryPermission } = await import('../hrmImagePicker');
    expect(shouldRequestMediaLibraryPermission()).toBe(true);
  });
});
