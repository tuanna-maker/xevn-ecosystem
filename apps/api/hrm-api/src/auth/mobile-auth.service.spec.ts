import { signServiceJwt } from '../common/jwt-sign';
import { signServiceJwt } from '../common/jwt-sign';
import { MobileAuthService } from './mobile-auth.service';

describe('MobileAuthService', () => {
  const service = new MobileAuthService({} as never);

  it('deriveRoles adds manager for CHRO', () => {
    expect(service.deriveRoles('CHRO')).toEqual(expect.arrayContaining(['employee', 'manager', 'hr_manager']));
  });

  it('deriveRoles adds manager for COO (J-MOB-37 uat.nv0002)', () => {
    expect(service.deriveRoles('COO')).toEqual(expect.arrayContaining(['employee', 'manager']));
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

  it('P1-G3-JMOB-05: applyMobilePersonaRoleOverride mgr promotes COO seed row', () => {
    expect(
      service.applyMobilePersonaRoleOverride(['employee'], { mobile_persona: 'mgr' }),
    ).toEqual(expect.arrayContaining(['employee', 'manager']));
  });

  it('P1-G3-JMOB-05: applyMobilePersonaRoleOverride emp strips manager for nv0001 lane', () => {
    expect(
      service.applyMobilePersonaRoleOverride(['employee', 'manager', 'hr_manager'], {
        mobile_persona: 'emp',
      }),
    ).toEqual(['employee']);
  });

  it('P1-G3-JMOB-05: resolveRolesForEmployee adds manager when direct reports exist', async () => {
    const db = {
      query: jest.fn().mockResolvedValue({ rows: [{ count: 2 }] }),
    };
    const svc = new MobileAuthService(db as never);
    const roles = await svc.resolveRolesForEmployee({
      id: 'mgr-uuid',
      company_id: 'trsport',
      email: 'uat.nv0002@xe.vn',
      full_name: 'UAT MGR',
      employee_code: 'TRS-0002',
      job_title_key: 'STAFF',
      custom_fields: null,
    });
    expect(roles).toEqual(expect.arrayContaining(['employee', 'manager']));
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('manager_id'), ['mgr-uuid']);
  });

  it('P1-G3-JMOB-05: resolveRolesForEmployee COO title yields manager without DB fallback', async () => {
    const db = { query: jest.fn() };
    const svc = new MobileAuthService(db as never);
    const roles = await svc.resolveRolesForEmployee({
      id: 'coo-uuid',
      company_id: 'trsport',
      email: 'uat.nv0002@xe.vn',
      full_name: 'UAT COO',
      employee_code: 'TRS-0002',
      job_title_key: 'COO',
      custom_fields: { mobile_persona: 'mgr' },
    });
    expect(roles).toEqual(expect.arrayContaining(['employee', 'manager']));
    expect(db.query).not.toHaveBeenCalled();
  });

  it('P1-G3-JMOB-05: applyMobilePersonaRoleOverride is_manager promotes seed row', () => {
    expect(
      service.applyMobilePersonaRoleOverride(['employee'], { is_manager: 'true' }),
    ).toEqual(expect.arrayContaining(['employee', 'manager']));
  });

  it('P1-G3-JMOB-05: refresh re-derives manager roles from employee row', async () => {
    const employeeId = 'coo-uuid';
    const db = {
      query: jest.fn().mockResolvedValue({
        rows: [
          {
            id: employeeId,
            company_id: 'trsport',
            email: 'uat.nv0002@xe.vn',
            full_name: 'UAT COO',
            employee_code: 'TRS-0002',
            job_title_key: 'COO',
            custom_fields: { mobile_persona: 'mgr', is_manager: 'true' },
          },
        ],
      }),
    };
    const svc = new MobileAuthService(db as never);
    const refreshToken = signServiceJwt(
      {
        sub: 'uat.nv0002@xe.vn',
        tenantId: 'xevn',
        companyId: 'trsport',
        employee_id: employeeId,
        company_uuid: '32a3cdcb-c534-4e47-80f9-d2f156e65094',
        roles: ['employee'],
        typ: 'refresh',
      },
      3600,
    );
    const tokens = await svc.refresh({ refresh_token: refreshToken });
    const payload = JSON.parse(
      Buffer.from(tokens.access_token.split('.')[1], 'base64url').toString('utf8'),
    );
    expect(payload.roles).toEqual(expect.arrayContaining(['employee', 'manager']));
  });
});
