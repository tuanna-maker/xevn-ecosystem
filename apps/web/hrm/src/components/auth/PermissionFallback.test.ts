/**
 * D-UX-PERMISSION-FALLBACK-FE-01 — PermissionFallback SoT + wiring guards
 */
import { createElement } from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import viLocale from '@/i18n/locales/vi.json';
import enLocale from '@/i18n/locales/en.json';
import {
  PERMISSION_FALLBACK_DEFAULT_CONTACT_HREF,
  PERMISSION_FALLBACK_EN,
  PERMISSION_FALLBACK_I18N,
  PERMISSION_FALLBACK_TEST_IDS,
  PERMISSION_FALLBACK_VI,
} from './permissionFallbackSot';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: { defaultValue?: string }) => {
      const map: Record<string, string> = {
        [PERMISSION_FALLBACK_I18N.title]: PERMISSION_FALLBACK_VI.title,
        [PERMISSION_FALLBACK_I18N.message]: PERMISSION_FALLBACK_VI.message,
        [PERMISSION_FALLBACK_I18N.contactHr]: PERMISSION_FALLBACK_VI.contactHr,
      };
      return map[key] ?? opts?.defaultValue ?? key;
    },
  }),
}));

import { PermissionFallback } from './PermissionFallback';

describe.skip('D-UX-PERMISSION-FALLBACK-FE-01 — SoT i18n + CTA', () => {
  afterEach(() => {
    cleanup();
  });

  it('vi/en locale leaves match SoT constants', () => {
    const viPf = viLocale.employeeProfile.permissionFallback;
    const enPf = enLocale.employeeProfile.permissionFallback;
    expect(viPf.title).toBe(PERMISSION_FALLBACK_VI.title);
    expect(viPf.message).toBe(PERMISSION_FALLBACK_VI.message);
    expect(viPf.contactHr).toBe(PERMISSION_FALLBACK_VI.contactHr);
    expect(enPf.title).toBe(PERMISSION_FALLBACK_EN.title);
    expect(enPf.message).toBe(PERMISSION_FALLBACK_EN.message);
    expect(enPf.contactHr).toBe(PERMISSION_FALLBACK_EN.contactHr);
  });

  it('renders VI title, message, and CTA with SoT testids + mailto', () => {
    render(createElement(PermissionFallback));
    const root = screen.getByTestId(PERMISSION_FALLBACK_TEST_IDS.root);
    expect(root.getAttribute('data-variant')).toBe('default');
    expect(screen.getByText(PERMISSION_FALLBACK_VI.title)).toBeTruthy();
    expect(screen.getByText(PERMISSION_FALLBACK_VI.message)).toBeTruthy();
    const cta = screen.getByTestId(PERMISSION_FALLBACK_TEST_IDS.contactHr);
    expect(cta.textContent).toBe(PERMISSION_FALLBACK_VI.contactHr);
    expect(cta.getAttribute('href')).toBe(PERMISSION_FALLBACK_DEFAULT_CONTACT_HREF);
    expect(PERMISSION_FALLBACK_DEFAULT_CONTACT_HREF.startsWith('mailto:hr@xe.vn')).toBe(true);
  });

  it('compact variant keeps CTA testid and marks data-variant', () => {
    render(createElement(PermissionFallback, { variant: 'compact' }));
    expect(screen.getByTestId(PERMISSION_FALLBACK_TEST_IDS.root).getAttribute('data-variant')).toBe(
      'compact',
    );
    expect(screen.getByTestId(PERMISSION_FALLBACK_TEST_IDS.contactHr)).toBeTruthy();
  });

  it('allows contactHref override without dropping CTA testid', () => {
    render(createElement(PermissionFallback, { contactHref: 'mailto:helpdesk@xe.vn' }));
    const cta = screen.getByTestId(PERMISSION_FALLBACK_TEST_IDS.contactHr);
    expect(cta.getAttribute('href')).toBe('mailto:helpdesk@xe.vn');
  });

  it('EmployeeProfile has no silent null fallback on view_salary gates', () => {
    const src = readFileSync(join(process.cwd(), 'src/pages/EmployeeProfile.tsx'), 'utf8');
    const codeOnly = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    expect(codeOnly).not.toMatch(/action=["']view_salary["'][\s\S]{0,80}fallback=\{null\}/);
    expect(codeOnly).not.toMatch(/fallback=\{null\}[\s\S]{0,120}view_salary/);
    expect(codeOnly).not.toMatch(
      /PermissionGate\s+module=["']employees["']\s+action=["']view_salary["']\s+fallback=\{null\}/,
    );
    const fallbackCount = (codeOnly.match(/fallback=\{<PermissionFallback/g) ?? []).length;
    expect(fallbackCount).toBeGreaterThanOrEqual(5);
  });
});
