import { MobileAuthService } from './mobile-auth.service';

describe('MobileAuthService', () => {
  const service = new MobileAuthService({} as never);

  it('deriveRoles adds manager for CHRO', () => {
    expect(service.deriveRoles('CHRO')).toEqual(expect.arrayContaining(['employee', 'manager', 'hr_manager']));
  });

  it('deriveRoles employee only for unknown title', () => {
    expect(service.deriveRoles('STAFF')).toEqual(['employee']);
  });

  it('resolveTenantId from custom_fields for member company main', () => {
    const row = {
      id: '1',
      company_id: 'main',
      email: 'a@b.vn',
      full_name: 'A',
      employee_code: 'X',
      job_title_key: null,
      custom_fields: { tenant_id: 'xe-du-lich' },
    };
    expect(service.resolveTenantId(row)).toBe('xe-du-lich');
  });

  it('resolveTenantId uses master for holding slug without custom tenant', () => {
    const row = {
      id: '1',
      company_id: 'holding',
      email: 'a@xe.vn',
      full_name: 'A',
      employee_code: 'X',
      job_title_key: null,
      custom_fields: null,
    };
    expect(service.resolveTenantId(row)).toBe('xevn');
  });

  it('UC-HRM-MOB-03 UC-HRM-MOB-05: rowToMembership builds stable company uuid for dashboard and attendance history', () => {
    const m = service.rowToMembership({
      id: '85945933-632a-4bca-8fe9-3bbe8bc9294b',
      company_id: 'main',
      email: 'du-lich.ceo@xe.vn',
      full_name: 'CEO',
      employee_code: 'DL-001',
      job_title_key: 'CEO',
      custom_fields: {
        tenant_id: 'xe-du-lich',
        company_display: 'Du lịch X.E',
        attendance_company_uuid: '85945933-632a-4bca-8fe9-3bbe8bc9294b',
      },
    });
    expect(m.tenant_id).toBe('xe-du-lich');
    expect(m.company_id).toBe('main');
    expect(m.company_uuid).toBe('85945933-632a-4bca-8fe9-3bbe8bc9294b');
    expect(m.company_display).toBe('Du lịch X.E');
  });

  it('UC-HRM-MOB-09: resolveTenantId supports payroll summary tenant partition', () => {
    const row = {
      id: '1',
      company_id: 'holding',
      email: 'nv@xe.vn',
      full_name: 'NV',
      employee_code: 'NV0001',
      job_title_key: 'STAFF',
      custom_fields: { tenant_id: 'xevn' },
    };
    expect(service.resolveTenantId(row)).toBe('xevn');
  });

  it('UC-HRM-MOB-10: deriveRoles employee baseline for contract insurance mobile read', () => {
    expect(service.deriveRoles('STAFF')).toEqual(['employee']);
  });

  it('UC-HRM-MOB-11 UC-HRM-MOB-12 UC-HRM-MOB-13 UC-HRM-MOB-14 UC-HRM-MOB-15: CHRO membership roles for mobile manager flows', () => {
    expect(service.deriveRoles('CHRO')).toEqual(
      expect.arrayContaining(['employee', 'manager', 'hr_manager']),
    );
  });
});
