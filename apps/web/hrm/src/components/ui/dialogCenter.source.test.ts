/**
 * PO-HRM-UI-DIALOG-CENTER-01 / R2 — source lock for viewport-centered Dialog primitives.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const dialogSrc = readFileSync(resolve(__dirname, './dialog.tsx'), 'utf8');
const alertSrc = readFileSync(resolve(__dirname, './alert-dialog.tsx'), 'utf8');
const hrmCss = readFileSync(resolve(__dirname, '../../index.css'), 'utf8');
const portalCss = readFileSync(
  resolve(__dirname, '../../../../web-portal/src/index.css'),
  'utf8',
);

describe('PO-HRM-UI-DIALOG-CENTER-01 DialogContent center', () => {
  it('DialogContent uses inset-0 m-auto h-fit max-h scroll (not top/translate 50%)', () => {
    expect(dialogSrc).toContain('fixed inset-0');
    expect(dialogSrc).toContain('m-auto');
    expect(dialogSrc).toContain('h-fit');
    expect(dialogSrc).toContain('max-h-[90vh]');
    expect(dialogSrc).toContain('overflow-y-auto');
    expect(dialogSrc).not.toContain('top-[50%]');
    expect(dialogSrc).not.toContain('translate-y-[-50%]');
    expect(dialogSrc).not.toContain('slide-in-from-top-[48%]');
  });

  it('PO-HRM-UI-HEADER-JD-DND-FE-01: DialogContent supports portalScope iframe|parent', () => {
    expect(dialogSrc).toContain('portalScope?: "iframe" | "parent"');
    expect(dialogSrc).toContain('getRadixPortalContainer(portalScope)');
    expect(dialogSrc).toContain('isHrmDialogMountedToPortalParent(portalScope)');
  });

  it('PO-HRM-UI-HEADER-JD-DND-FE-01: no bare getDialogPortalContainer call (ReferenceError guard)', () => {
    // Must resolve mount via getRadixPortalContainer(portalScope) — never call unbound helper
    expect(dialogSrc).toContain('getRadixPortalContainer(portalScope)');
    expect(dialogSrc).not.toMatch(/\bgetDialogPortalContainer\s*\(/);
  });

  it('AlertDialogContent mirrors the same center contract', () => {
    expect(alertSrc).toContain('fixed inset-0');
    expect(alertSrc).toContain('m-auto');
    expect(alertSrc).toContain('max-h-[90vh]');
    expect(alertSrc).not.toContain('top-[50%]');
    expect(alertSrc).not.toContain('translate-y-[-50%]');
  });

  it('keeps DialogHeader brand chrome (glass + wordmark)', () => {
    expect(dialogSrc).toContain('xevn-dialog-header-glass');
    expect(dialogSrc).toContain('xevn-dialog-wordmark');
    expect(dialogSrc).toContain('brandChrome');
  });
});

describe('PO-HRM-UI-P0-LOGO-FONT-TITLE-01 wordmark white pad + root scale', () => {
  it('Dialog/AlertDialog wordmark forces white pad class', () => {
    expect(dialogSrc).toContain('xevn-dialog-wordmark !bg-white');
    expect(alertSrc).toContain('xevn-dialog-wordmark !bg-white');
  });

  it('HRM/portal .xevn-dialog-wordmark uses SURFACE not brand-shell', () => {
    const hrmWm = hrmCss.match(/\.xevn-dialog-wordmark\s*\{[^}]+\}/)?.[0] ?? '';
    const portalWm = portalCss.match(/\.xevn-dialog-wordmark\s*\{[^}]+\}/)?.[0] ?? '';
    expect(hrmWm).toMatch(/--xevn-color-surface/);
    expect(hrmWm).not.toMatch(/--xevn-color-brand-shell/);
    expect(portalWm).toMatch(/--xevn-color-surface/);
    expect(portalWm).not.toMatch(/--xevn-color-brand-shell/);
  });

  it('HRM html root is 100% (not 87.5% ops compress)', () => {
    expect(hrmCss).toMatch(/html\s*\{\s*font-size:\s*100%;/);
    expect(hrmCss).not.toMatch(/html\s*\{\s*font-size:\s*87\.5%;/);
  });
});

describe('PO-HRM-UI-DIALOG-CENTER-01-R2 surface CSS does not override fixed', () => {
  it('HRM .xevn-dialog-surface scopes position/overflow to :not(.fixed)', () => {
    expect(hrmCss).toContain('.xevn-dialog-surface:not(.fixed)');
    // Base block must not unconditionally force relative (DEF-DIALOG-CENTER-CSS-OVERRIDE)
    const baseMatch = hrmCss.match(
      /\.xevn-dialog-surface\s*\{[^}]+\}/,
    );
    expect(baseMatch?.[0] ?? '').not.toMatch(/position:\s*relative/);
    expect(baseMatch?.[0] ?? '').not.toMatch(/overflow:\s*hidden/);
    expect(hrmCss).toMatch(
      /\.xevn-dialog-surface:not\(\.fixed\)\s*\{[^}]*position:\s*relative/,
    );
  });

  it('web-portal lockstep same :not(.fixed) surface rule (CC parent CSS)', () => {
    expect(portalCss).toContain('.xevn-dialog-surface:not(.fixed)');
    const baseMatch = portalCss.match(
      /\.xevn-dialog-surface\s*\{[^}]+\}/,
    );
    expect(baseMatch?.[0] ?? '').not.toMatch(/position:\s*relative/);
    expect(baseMatch?.[0] ?? '').not.toMatch(/overflow:\s*hidden/);
  });

  it('keeps ::before brand bar on surface', () => {
    expect(hrmCss).toContain('.xevn-dialog-surface::before');
    expect(portalCss).toContain('.xevn-dialog-surface::before');
  });
});
