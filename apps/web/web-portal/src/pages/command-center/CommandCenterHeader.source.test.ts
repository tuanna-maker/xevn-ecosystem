/**
 * PO-HRM-UI-HEADER-JD-DND-FE-01 — single brand chrome on Command Center.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const ccSrc = readFileSync(resolve(__dirname, './CommandCenterPage.tsx'), 'utf8');
const layoutSrc = readFileSync(
  resolve(__dirname, '../../components/layout/ExecutiveDashboardLayout.tsx'),
  'utf8',
);
const topHeaderSrc = readFileSync(
  resolve(__dirname, '../../components/layout/TopHeader.tsx'),
  'utf8',
);

describe('PO-HRM-UI-HEADER-JD-DND-FE-01 CC single header', () => {
  it('shell keeps TopHeader on /command-center*', () => {
    expect(layoutSrc).toContain('showMembershipChrome ? <TopHeader');
    expect(layoutSrc).toContain('isCommandCenterShellPath');
    expect(topHeaderSrc).toContain('portal-brand-mark');
  });

  it('page removes duplicate XeVN OS / Command Center title strip', () => {
    expect(ccSrc).toContain('data-testid="cc-persona-bar"');
    expect(ccSrc).toContain('data-testid="cc-persona-switcher"');
    expect(ccSrc).toContain("label: 'BOD'");
    expect(ccSrc).toContain("label: 'Quản lý'");
    expect(ccSrc).toContain("label: 'Nhân viên'");
    // Duplicate brand hero removed from page header
    expect(ccSrc).not.toMatch(
      /page-title[\s\S]{0,80}XeVN OS[\s\S]{0,120}Command Center/,
    );
  });

  it('LayoutDashboard not referenced (no ReferenceError after import drop)', () => {
    expect(ccSrc).not.toMatch(/\bLayoutDashboard\b/);
    expect(ccSrc).toMatch(/from 'lucide-react'/);
    expect(ccSrc).toContain('Building2');
    expect(ccSrc).toContain('CircleUser');
  });
});
