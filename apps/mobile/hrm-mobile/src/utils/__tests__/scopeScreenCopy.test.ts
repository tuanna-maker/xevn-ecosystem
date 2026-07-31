import { describe, expect, it } from 'vitest';

import {
  resolveAuthRolesVi,
  resolveMembershipRowSubtitle,
  resolveMembershipRowTitle,
  resolveOperatingUnitRowSubtitle,
  resolveRollupOperatingUnitSubtitle,
  resolveScopeScreenSubtitle,
} from '../scopeScreenCopy';

const TRSPORT_PLANE_A = 'Công ty Cổ phần Thương mại và Dịch vụ X.E';

describe('scopeScreenCopy — MOB-UX-16d ILA-07', () => {
  it('resolveAuthRolesVi maps JWT roles to Vietnamese', () => {
    expect(resolveAuthRolesVi(['manager', 'hr_manager'])).toBe('Quản lý, Quản lý nhân sự');
    expect(resolveAuthRolesVi([])).toBe('Chưa có');
  });

  it('resolveScopeScreenSubtitle is Vietnamese only', () => {
    expect(resolveScopeScreenSubtitle(true)).not.toMatch(/slug|UUID|rollup/i);
    expect(resolveScopeScreenSubtitle(false)).not.toMatch(/Member CEO/i);
  });

  it('operating unit subtitles sanitize Khối API labels to Plane A', () => {
    expect(resolveRollupOperatingUnitSubtitle()).toBe('Xem dữ liệu toàn tập đoàn');
    const subtitle = resolveOperatingUnitRowSubtitle({
      operating_slug: 'trsport',
      display_name_vi: 'Khối Vận tải X.E',
      rollup_order: 2,
    });
    expect(subtitle).toBe(`Lọc danh sách theo ${TRSPORT_PLANE_A}`);
    expect(subtitle).not.toMatch(/Khối/);
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
    ).toBe(TRSPORT_PLANE_A);
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
