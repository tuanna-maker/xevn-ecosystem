import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { borderWidth, colors, radius } from '../tokens';

/**
 * MOB-XEVN-BRAND-SHELL-L3-01 — gate: splash/login/tab/header + stub modals consume L1/L2 DNA.
 * Static source audit (no RN render) — U65 zero-seed · no L4c ESS claim.
 */

const ROOT = resolve(__dirname, '../..');

function readSrc(rel: string): string {
  return readFileSync(resolve(ROOT, rel), 'utf8');
}

/** Drop block comments so CODE-MEMORY prose does not false-fail. */
function codeWithoutBlockComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '');
}

describe('L3 brand shell — token wiring', () => {
  it('locks shell DNA SoT (radius.card|modal · borderWidth · brandShell)', () => {
    expect(radius.card).toBe(12);
    expect(radius.modal).toBe(12);
    expect(radius.input).toBe(8);
    expect(borderWidth.hairline).toBe(0.5);
    expect(borderWidth.thin).toBe(1);
    expect(colors.border).toBe('#E5E7EB');
    expect(colors.brandShell).toBe('#000000');
    expect(colors.primary).toBe('#1E40AF');
  });

  it('SplashIntro uses colors.brandShell + colors.splashGlow', () => {
    const src = readSrc('components/brand/SplashIntro.tsx');
    expect(src).toMatch(/colors\.brandShell/);
    expect(src).toMatch(/colors\.splashGlow/);
    expect(codeWithoutBlockComments(src)).not.toMatch(/backgroundColor:\s*['"]#000000['"]/);
  });

  it('BrandedLoginCard uses radius.card + borderWidth.hairline + colors.border', () => {
    const src = readSrc('components/auth/BrandedLoginCard.tsx');
    const code = codeWithoutBlockComments(src);
    expect(src).toMatch(/radius\.card/);
    expect(src).toMatch(/borderWidth\.hairline/);
    expect(src).toMatch(/colors\.border/);
    expect(code).not.toMatch(/radius\.lg/);
    expect(code).not.toMatch(/StyleSheet\.hairlineWidth/);
  });

  it('LoginScreen inputs/devBox use borderWidth.thin + radius.input|card', () => {
    const src = readSrc('features/auth/LoginScreen.tsx');
    const code = codeWithoutBlockComments(src);
    expect(src).toMatch(/borderWidth\.thin/);
    expect(src).toMatch(/radius\.input/);
    expect(src).toMatch(/radius\.card/);
    expect(src).toMatch(/XevnLogo/);
    expect(src).toMatch(/BrandedLoginCard/);
    expect(code).not.toMatch(/borderWidth:\s*1\b/);
  });

  it('ScopeScreen consumes L1 text tokens + SurfaceCard shell', () => {
    const src = readSrc('features/auth/ScopeScreen.tsx');
    expect(src).toMatch(/SurfaceCard/);
    expect(src).toMatch(/AppScreenLayout/);
    expect(src).toMatch(/colors\.text/);
    expect(src).toMatch(/colors\.textSecondary/);
  });

  it('RootNavigator tab bar uses colors.primary|border + borderWidth.thin', () => {
    const src = readSrc('navigation/RootNavigator.tsx');
    expect(src).toMatch(/tabBarActiveTintColor:\s*colors\.primary/);
    expect(src).toMatch(/borderTopColor:\s*colors\.primary/);
    expect(src).toMatch(/borderTopWidth:\s*brand\.barWidth/);
  });

  it('AppScreenLayout header chrome uses radius.card + borderWidth.thin', () => {
    const src = readSrc('components/ui/AppScreenLayout.tsx');
    const code = codeWithoutBlockComments(src);
    expect(src).toMatch(/borderWidth\.thin/);
    expect(src).toMatch(/radius\.card/);
    expect(src).toMatch(/colors\.text/);
    expect(code).not.toMatch(/borderWidth:\s*1\b/);
  });

  it('Phase2StubModal uses radius.modal + borderWidth.thin + colors.border', () => {
    const src = readSrc('components/home/Phase2StubModal.tsx');
    const code = codeWithoutBlockComments(src);
    expect(src).toMatch(/radius\.modal/);
    expect(src).toMatch(/borderWidth\.thin/);
    expect(src).toMatch(/colors\.border/);
    expect(code).not.toMatch(/radius\.lg/);
  });

  it('ChatStubModal uses radius.modal + borderWidth.thin + colors.border', () => {
    const src = readSrc('components/home/ChatStubModal.tsx');
    const code = codeWithoutBlockComments(src);
    expect(src).toMatch(/radius\.modal/);
    expect(src).toMatch(/borderWidth\.thin/);
    expect(src).toMatch(/colors\.border/);
    expect(code).not.toMatch(/radius\.lg/);
  });
});
