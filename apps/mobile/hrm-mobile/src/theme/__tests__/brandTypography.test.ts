import { describe, expect, it, beforeEach } from 'vitest';

import {
  isBrandFontsReady,
  resolveBrandFontFamily,
  setBrandFontsReady,
} from '../brandTypography';
import { typography } from '../tokens';

describe('brandTypography — ADR §16', () => {
  beforeEach(() => {
    setBrandFontsReady(false);
  });

  it('falls back to System when fonts not loaded', () => {
    expect(isBrandFontsReady()).toBe(false);
    expect(resolveBrandFontFamily('display')).toBe(typography.fontFamily.sans);
    expect(resolveBrandFontFamily('body')).toBe(typography.fontFamily.sans);
  });

  it('uses Montserrat / Source Sans 3 when loaded', () => {
    setBrandFontsReady(true);
    expect(resolveBrandFontFamily('display')).toBe(typography.fontFamily.display);
    expect(resolveBrandFontFamily('body')).toBe(typography.fontFamily.body);
  });
});
