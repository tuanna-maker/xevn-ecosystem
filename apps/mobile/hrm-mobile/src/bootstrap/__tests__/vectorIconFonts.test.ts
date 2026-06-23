import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../assets/fonts/Ionicons.ttf', () => ({ default: 12345 }));

const fontMocks = vi.hoisted(() => ({
  loadAsync: vi.fn(),
  isLoaded: vi.fn(),
}));

vi.mock('expo-font', () => ({
  loadAsync: fontMocks.loadAsync,
  isLoaded: fontMocks.isLoaded,
}));

describe('vectorIconFonts', () => {
  beforeEach(() => {
    fontMocks.loadAsync.mockReset();
    fontMocks.isLoaded.mockReset();
    vi.resetModules();
  });

  it('preloadVectorIconFonts resolves when Font.loadAsync succeeds', async () => {
    fontMocks.loadAsync.mockResolvedValue({});
    const { preloadVectorIconFonts } = await import('../vectorIconFonts');
    await expect(preloadVectorIconFonts()).resolves.toBeUndefined();
    expect(fontMocks.loadAsync).toHaveBeenCalledWith(
      expect.objectContaining({ ionicons: expect.anything() }),
    );
  });

  it('preloadVectorIconFonts swallows Font.loadAsync rejection (no unhandled rejection)', async () => {
    fontMocks.loadAsync.mockRejectedValue(new Error('ExpoAsset.downloadAsync failed'));
    const { preloadVectorIconFonts } = await import('../vectorIconFonts');
    await expect(preloadVectorIconFonts()).resolves.toBeUndefined();
  });

  it('preloadVectorIconFonts is idempotent (single loadAsync call)', async () => {
    fontMocks.loadAsync.mockResolvedValue({});
    const { preloadVectorIconFonts } = await import('../vectorIconFonts');
    await preloadVectorIconFonts();
    await preloadVectorIconFonts();
    expect(fontMocks.loadAsync).toHaveBeenCalledTimes(1);
  });
});

describe('vectorIconFontsGuard', () => {
  it('Font.loadAsync catches rejection after guard install', async () => {
    fontMocks.loadAsync.mockRejectedValue(new Error('downloadAsync ionicons'));
    await import('../vectorIconFontsGuard');
    const Font = await import('expo-font');
    await expect(Font.loadAsync({ ionicons: 1 })).resolves.toEqual({});
  });
});
