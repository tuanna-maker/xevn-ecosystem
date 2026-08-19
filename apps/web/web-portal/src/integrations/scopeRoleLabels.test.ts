import { describe, expect, it } from 'vitest';
import { formatRoleCodeVi, membershipTenantMatchesJwt } from './scopeRoleLabels';

describe('scopeRoleLabels (AC-CD-F3-01)', () => {
  it('formatRoleCodeVi maps known portal roles', () => {
    expect(formatRoleCodeVi('group_ceo')).toBe('Tổng giám đốc tập đoàn');
    expect(formatRoleCodeVi('ceo')).toBe('Tổng giám đốc');
    expect(formatRoleCodeVi('member_ceo')).toBe('TGĐ công ty thành viên');
    // Pilot JWT SoT (du-lich.ceo@xe.vn) — R-CD-FB-06-01
    expect(formatRoleCodeVi('subsidiary_ceo')).toBe('TGĐ công ty thành viên');
    expect(formatRoleCodeVi('SUBSIDIARY_CEO')).toBe('TGĐ công ty thành viên');
  });

  it('formatRoleCodeVi keeps prior F3 PASS labels (no English underscore fallback)', () => {
    expect(formatRoleCodeVi('group_ceo')).not.toBe('group ceo');
    expect(formatRoleCodeVi('hrbp_manager')).toBe('HRBP');
    expect(formatRoleCodeVi('ceo_group')).toBe('Tổng giám đốc tập đoàn');
  });

  it('formatRoleCodeVi avoids empty UUID-like blank chips', () => {
    expect(formatRoleCodeVi('')).toBe('—');
    expect(formatRoleCodeVi(undefined)).toBe('—');
  });

  it('membershipTenantMatchesJwt is case-insensitive', () => {
    expect(membershipTenantMatchesJwt('XEVN', 'xevn')).toBe(true);
    expect(membershipTenantMatchesJwt('xevn', 'xe-du-lich')).toBe(false);
  });
});
