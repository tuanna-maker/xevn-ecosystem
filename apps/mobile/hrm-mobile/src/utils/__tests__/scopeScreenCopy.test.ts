import { describe, expect, it } from 'vitest';

import {
  resolveAuthRolesVi,
  resolveMembershipRowSubtitle,
  resolveMembershipRowTitle,
  resolveOperatingUnitRowSubtitle,
  resolveRollupOperatingUnitSubtitle,
  resolveScopeScreenSubtitle,
} from '../scopeScreenCopy';

describe('scopeScreenCopy — MOB-UX-16d ILA-07', () => {
  it('resolveAuthRolesVi maps JWT roles to Vietnamese', () => {
    expect(resolveAuthRolesVi(['manager', 'hr_manager'])).toBe('Quản lý, Quản lý nhân sự');
    expect(resolveAuthRolesVi([])).toBe('Chưa có');
  });

  it('resolveScopeScreenSubtitle is Vietnamese only', () => {
    expect(resolveScopeScreenSubtitle(true)).not.toMatch(/slug|UUID|rollup/i);
    expect(resolveScopeScreenSubtitle(false)).not.toMatch(/Member CEO/i);
  });

  it('operating unit subtitles avoid raw slug tokens', () => {
    expect(resolveRollupOperatingUnitSubtitle()).toBe('Xem dữ liệu toàn tập đoàn');
    expect(
      resolveOperatingUnitRowSubtitle({
        operating_slug: 'trsport',
        display_name_vi: 'Khối Vận tải X.E',
        rollup_order: 2,
      }),
    ).toBe('Lọc danh sách theo Khối Vận tải X.E');
  });

  it('membership row title uses Vietnamese company label', () => {
    expect(
      resolveMembershipRowTitle({
        tenant_id: 'xe-vn',
        company_id: 'trsport',
        company_uuid: 'uuid',
        employee_id: 'e1',
        employee_code: 'NV001',
        employee_name: 'Nguyễn Văn A',
        company_display: 'trsport',
        is_primary: true,
      }),
    ).toBe('Khối Vận tải X.E');
    expect(
      resolveMembershipRowSubtitle({
        tenant_id: 'xe-vn',
        company_id: 'trsport',
        company_uuid: 'uuid',
        employee_id: 'e1',
        employee_code: 'NV001',
        employee_name: 'Nguyễn Văn A',
        company_display: 'trsport',
        is_primary: true,
      }),
    ).toBe('Nguyễn Văn A · NV001');
  });
});
