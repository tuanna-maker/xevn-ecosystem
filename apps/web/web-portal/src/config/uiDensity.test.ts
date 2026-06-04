import { describe, expect, it, vi } from 'vitest';
import { resolveUiDensity } from './uiDensity';

describe('resolveUiDensity', () => {
  it('defaults to 0.9 when env unset', () => {
    vi.stubEnv('VITE_UI_DENSITY', '');
    expect(resolveUiDensity()).toBe(0.9);
  });

  it('parses valid env and clamps to [0.75, 1]', () => {
    vi.stubEnv('VITE_UI_DENSITY', '0.85');
    expect(resolveUiDensity()).toBe(0.85);
    vi.stubEnv('VITE_UI_DENSITY', '2');
    expect(resolveUiDensity()).toBe(1);
    vi.stubEnv('VITE_UI_DENSITY', '0.5');
    expect(resolveUiDensity()).toBe(0.75);
  });

  it('falls back on invalid env', () => {
    vi.stubEnv('VITE_UI_DENSITY', 'not-a-number');
    expect(resolveUiDensity()).toBe(0.9);
  });
});
