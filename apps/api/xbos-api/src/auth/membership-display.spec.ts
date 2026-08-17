import {
  portalCompanyLabelVi,
  portalRoleLabelVi,
  portalTenantKindLabelVi,
  toPortalMembershipDisplay,
} from './membership-display';

describe('membership-display (W1-B-03 OS 28)', () => {
  it('maps known role codes to Vietnamese labels', () => {
    expect(portalRoleLabelVi('group_ceo')).toBe('CEO Tập đoàn');
    expect(portalRoleLabelVi('HRBP_MANAGER')).toBe('HRBP');
    expect(portalRoleLabelVi('subsidiary_ceo')).toBe('CEO công ty thành viên');
  });

  it('maps company slug and tenant kind', () => {
    expect(portalCompanyLabelVi('holding')).toBe('Công ty mẹ (Holding)');
    expect(portalCompanyLabelVi('main', 'Du lịch')).toBe('Công ty chính');
    expect(portalTenantKindLabelVi('master')).toBe('Tập đoàn');
    expect(portalTenantKindLabelVi('member')).toBe('Công ty thành viên');
  });

  it('toPortalMembershipDisplay keeps raw keys and adds labels', () => {
    const row = toPortalMembershipDisplay(
      {
        tenantId: 'xevn',
        name: 'XeVN Group',
        shortName: 'XeVN',
        tenantKind: 'master',
        roleCode: 'group_ceo',
        companyId: 'holding',
        isMaster: true,
      },
      'mid-1',
    );
    expect(row.membershipId).toBe('mid-1');
    expect(row.tenantId).toBe('xevn');
    expect(row.roleCode).toBe('group_ceo');
    expect(row.tenant_label).toBe('XeVN Group');
    expect(row.role_label).toBe('CEO Tập đoàn');
    expect(row.company_label).toBe('Công ty mẹ (Holding)');
  });
});
