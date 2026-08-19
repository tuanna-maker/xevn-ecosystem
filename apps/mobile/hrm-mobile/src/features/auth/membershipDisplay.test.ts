import { describe, expect, it } from 'vitest';

import type { MobileMembership } from '../../context/AuthContext';
import {
  resolveMembershipCompanyLabel,
  resolveMembershipJobTitleLabel,
  resolveMembershipRoleLabel,
  resolveMembershipScopeMeta,
  resolveMembershipTenantLabel,
} from './membershipDisplay';

const base: MobileMembership = {
  tenant_id: 'xevn',
  company_id: 'holding',
  company_uuid: '10000000-0000-4000-8000-000000000001',
  employee_id: 'e1',
  employee_code: 'NV001',
  employee_name: 'Nguyễn Văn A',
  company_display: 'Tập đoàn X.E (Holding)',
  company_label: 'Tập đoàn X.E (Holding)',
  tenant_label: 'Tập đoàn XeVN',
  role_label: 'Nhân viên',
  job_title_label: 'CEO',
  is_primary: true,
};

describe('membershipDisplay — W1-B-04-AUTH-MOB', () => {
  it('prefers company_label over company_display', () => {
    expect(
      resolveMembershipCompanyLabel({
        ...base,
        company_label: 'Tập đoàn X.E (Holding)',
        company_display: 'holding',
      }),
    ).toBe('Tập đoàn X.E (Holding)');
  });

  it('uses company_display when company_label empty — never company_id', () => {
    expect(
      resolveMembershipCompanyLabel({
        company_label: '',
        company_display: 'Vận tải X.E',
      }),
    ).toBe('Vận tải X.E');
    expect(
      resolveMembershipCompanyLabel({
        company_label: '',
        company_display: '',
      }),
    ).toBe('—');
  });

  it('binds tenant/role/job_title labels from BE without raw keys', () => {
    expect(resolveMembershipTenantLabel(base)).toBe('Tập đoàn XeVN');
    expect(resolveMembershipTenantLabel({ tenant_label: '' })).toBe('—');
    expect(resolveMembershipRoleLabel(base)).toBe('Nhân viên');
    expect(resolveMembershipJobTitleLabel(base)).toBe('CEO');
    expect(resolveMembershipScopeMeta(base)).toBe('Nhân viên · Kiêm nhiệm chính');
  });
});
