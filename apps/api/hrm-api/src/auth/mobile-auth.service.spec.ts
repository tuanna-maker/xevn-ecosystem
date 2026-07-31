import { createHash } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { HRM_COMPANY_UUID_BY_SLUG } from '../common/hrm-list-scope';
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

  it('D-HRM-MOB-UUID-BPRIME-01: holding slug → Plane B′ map UUID', () => {
    expect(
      service.resolveCompanyUuid(
        {
          id: '1',
          company_id: 'holding',
          email: 'uat.nv0001@xe.vn',
          full_name: 'NV',
          employee_code: 'NV0001',
          job_title_key: 'STAFF',
          custom_fields: null,
        },
        'xevn',
      ),
    ).toBe(HRM_COMPANY_UUID_BY_SLUG.holding);
  });

  it('D-HRM-MOB-UUID-BPRIME-01: main → holding B′ map', () => {
    expect(
      service.resolveCompanyUuid(
        {
          id: '1',
          company_id: 'main',
          email: 'a@b.vn',
          full_name: 'A',
          employee_code: 'X',
          job_title_key: null,
          custom_fields: { tenant_id: 'xe-du-lich' },
        },
        'xe-du-lich',
      ),
    ).toBe(HRM_COMPANY_UUID_BY_SLUG.holding);
  });

  it('D-HRM-MOB-UUID-BPRIME-01: services slug → …0005', () => {
    expect(
      service.resolveCompanyUuid(
        {
          id: '1',
          company_id: 'services',
          email: 'uat.nv1000@xe.vn',
          full_name: 'NV',
          employee_code: 'NV1000',
          job_title_key: 'STAFF',
          custom_fields: null,
        },
        'xevn',
      ),
    ).toBe(HRM_COMPANY_UUID_BY_SLUG.services);
  });

  it('D-HRM-MOB-UUID-BPRIME-01: custom attendance_company_uuid accepts mapped B′ only', () => {
    expect(
      service.resolveCompanyUuid(
        {
          id: '1',
          company_id: 'trsport',
          email: 'a@xe.vn',
          full_name: 'A',
          employee_code: 'X',
          job_title_key: null,
          custom_fields: { attendance_company_uuid: HRM_COMPANY_UUID_BY_SLUG.trsport },
        },
        'xevn',
      ),
    ).toBe(HRM_COMPANY_UUID_BY_SLUG.trsport);
  });

  it('D-HRM-MOB-UUID-BPRIME-01: LE / hash custom → map-by-slug (not echo LE)', () => {
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
        // Plane A LE — must not become JWT company_uuid
        attendance_company_uuid: '85945933-632a-4bca-8fe9-3bbe8bc9294b',
      },
    });
    expect(m.tenant_id).toBe('xe-du-lich');
    expect(m.company_id).toBe('main');
    expect(m.company_uuid).toBe(HRM_COMPANY_UUID_BY_SLUG.holding);
    expect(m.company_display).toBe('Du lịch X.E');
  });

  it('D-HRM-MOB-UUID-BPRIME-01: unknown company_id without map → HRM-AUTH-409', () => {
    expect(() =>
      service.resolveCompanyUuid(
        {
          id: '1',
          company_id: 'unknown-co',
          email: 'a@xe.vn',
          full_name: 'A',
          employee_code: 'X',
          job_title_key: null,
          custom_fields: null,
        },
        'xevn',
      ),
    ).toThrow(ApiException);
    try {
      service.resolveCompanyUuid(
        {
          id: '1',
          company_id: 'unknown-co',
          email: 'a@xe.vn',
          full_name: 'A',
          employee_code: 'X',
          job_title_key: null,
          custom_fields: null,
        },
        'xevn',
      );
    } catch (err) {
      expect(err).toMatchObject({ code: 'HRM-AUTH-409' });
    }
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

  it('P1-G3-JMOB-05 / BPRIME: refresh re-derives manager roles and upgrades company_uuid to B′ map', async () => {
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
        // Legacy hash claim — refresh must replace with B′ map
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
    expect(payload.company_uuid).toBe(HRM_COMPANY_UUID_BY_SLUG.trsport);
  });

  describe('D-BE-MOB-AUTH-CEO-HASH-01 — portal Group CEO after tenant-master reset', () => {
    const portalPassword = 'Xevn@2026';
    const ceoEmail = 'ceo@xe.vn';
    const expectedHash = createHash('sha256')
      .update(`${ceoEmail}:${portalPassword}`)
      .digest('hex');

    it('login ensures PORTAL-GCEO row and returns tokens when employees table empty', async () => {
      const insertCalls: unknown[][] = [];
      const db = {
        query: jest.fn(async (sql: string, params?: unknown[]) => {
          if (sql.includes('SELECT id, company_id, email') && sql.includes('lower(email)')) {
            if (insertCalls.length > 0) {
              return {
                rows: [
                  {
                    id: 'portal-gceo-uuid',
                    company_id: 'holding',
                    email: ceoEmail,
                    full_name: 'CEO Tập đoàn',
                    employee_code: 'PORTAL-GCEO',
                    job_title_key: 'CEO',
                    custom_fields: {
                      tenant_id: 'xevn',
                      mobile_password_hash: expectedHash,
                      is_primary_membership: 'true',
                    },
                  },
                ],
              };
            }
            return { rows: [] };
          }
          if (sql.includes('SELECT id::text AS id') && sql.includes('lower(email)')) {
            return { rows: [] };
          }
          if (sql.includes('lower(employee_code)')) {
            return { rows: [] };
          }
          if (sql.includes('INSERT INTO public.employees')) {
            insertCalls.push(params ?? []);
            return { rows: [] };
          }
          if (sql.includes('manager_id')) {
            return { rows: [{ count: 0 }] };
          }
          return { rows: [] };
        }),
      };
      const svc = new MobileAuthService(db as never);
      const res = await svc.login({ email: ceoEmail, password: portalPassword });
      expect(res.access_token).toBeTruthy();
      expect(res.employee.email).toBe(ceoEmail);
      expect(res.employee.employee_code).toBe('PORTAL-GCEO');
      expect(res.company_uuid).toBe(HRM_COMPANY_UUID_BY_SLUG.holding);
      expect(res.roles).toEqual(expect.arrayContaining(['employee', 'manager', 'hr_manager']));
      expect(insertCalls.length).toBe(1);
      expect(insertCalls[0]?.[2]).toBe('PORTAL-GCEO');
    });

    it('login rejects wrong password when no employee row', async () => {
      const db = {
        query: jest.fn(async () => ({ rows: [] })),
      };
      const svc = new MobileAuthService(db as never);
      await expect(svc.login({ email: ceoEmail, password: 'wrong-password' })).rejects.toMatchObject({
        code: 'HRM-AUTH-401',
      });
    });

    it('verifyPassword accepts portal password when stale mobile_password_hash present', async () => {
      const db = { query: jest.fn() };
      const svc = new MobileAuthService(db as never);
      const row = {
        id: '1',
        company_id: 'holding',
        email: ceoEmail,
        full_name: 'CEO',
        employee_code: 'PORTAL-GCEO',
        job_title_key: 'CEO',
        custom_fields: { mobile_password_hash: 'deadbeef'.repeat(8) },
      };
      const verified = (svc as unknown as { verifyPassword: (e: string, p: string, r: typeof row) => boolean })
        .verifyPassword(ceoEmail, portalPassword, row);
      expect(verified).toBe(true);
    });
  });

  describe('D-HDSD-MOB-UAT-AUTH-01 — UAT NV persona after tenant-master reset', () => {
    const uatPassword = 'xevn-uat-2026';
    const uatEmail = 'uat.nv0001@xe.vn';
    const expectedHash = createHash('sha256')
      .update(`${uatEmail}:${uatPassword}`)
      .digest('hex');

    it('login ensures UAT row and returns tokens when employees table empty', async () => {
      const insertCalls: unknown[][] = [];
      const db = {
        query: jest.fn(async (sql: string, params?: unknown[]) => {
          if (sql.includes('SELECT id, company_id, email') && sql.includes('lower(email)')) {
            if (insertCalls.length > 0) {
              return {
                rows: [
                  {
                    id: '3796d949-4513-45c0-88fa-33030a062b17',
                    company_id: 'holding',
                    email: uatEmail,
                    full_name: 'Nguyễn Văn An',
                    employee_code: 'HLD-0001',
                    job_title_key: 'STAFF',
                    custom_fields: {
                      tenant_id: 'xevn',
                      mobile_password_hash: expectedHash,
                      mobile_persona: 'emp',
                    },
                  },
                ],
              };
            }
            return { rows: [] };
          }
          if (sql.includes('SELECT id::text AS id') && sql.includes('lower(email)')) {
            return { rows: [] };
          }
          if (sql.includes('INSERT INTO public.employees')) {
            insertCalls.push(params ?? []);
            return { rows: [] };
          }
          if (sql.includes('manager_id')) {
            return { rows: [{ count: 0 }] };
          }
          return { rows: [] };
        }),
      };
      const svc = new MobileAuthService(db as never);
      const res = await svc.login({ email: uatEmail, password: uatPassword });
      expect(res.access_token).toBeTruthy();
      expect(res.employee.email).toBe(uatEmail);
      expect(res.employee.employee_code).toBe('HLD-0001');
      expect(res.company_uuid).toBe(HRM_COMPANY_UUID_BY_SLUG.holding);
      expect(res.roles).toEqual(['employee']);
      expect(insertCalls.length).toBe(1);
    });

    it('login rejects wrong password for UAT email when no row', async () => {
      const db = {
        query: jest.fn(async () => ({ rows: [] })),
      };
      const svc = new MobileAuthService(db as never);
      await expect(svc.login({ email: uatEmail, password: 'wrong-password' })).rejects.toMatchObject({
        code: 'HRM-AUTH-401',
      });
    });

    it('verifyPassword accepts UAT matrix password when stale hash present', () => {
      const svc = new MobileAuthService({} as never);
      const row = {
        id: '1',
        company_id: 'holding',
        email: uatEmail,
        full_name: 'NV',
        employee_code: 'HLD-0001',
        job_title_key: 'STAFF',
        custom_fields: { mobile_password_hash: 'deadbeef'.repeat(8), mobile_persona: 'emp' },
      };
      const verified = (svc as unknown as { verifyPassword: (e: string, p: string, r: typeof row) => boolean })
        .verifyPassword(uatEmail, uatPassword, row);
      expect(verified).toBe(true);
    });

    it('login ensures UAT row from legacy nguyen.van.an.0001 email', async () => {
      const legacyEmail = 'nguyen.van.an.0001@xe.vn';
      const insertCalls: unknown[][] = [];
      const db = {
        query: jest.fn(async (sql: string, params?: unknown[]) => {
          if (sql.includes('SELECT id, company_id, email') && sql.includes('ANY')) {
            if (insertCalls.length > 0) {
              return {
                rows: [
                  {
                    id: '3796d949-4513-45c0-88fa-33030a062b17',
                    company_id: 'holding',
                    email: uatEmail,
                    full_name: 'Nguyễn Văn An',
                    employee_code: 'HLD-0001',
                    job_title_key: 'STAFF',
                    custom_fields: {
                      tenant_id: 'xevn',
                      mobile_password_hash: expectedHash,
                      mobile_persona: 'emp',
                    },
                  },
                ],
              };
            }
            return { rows: [] };
          }
          if (sql.includes('SELECT id::text AS id') && sql.includes('lower(email)')) {
            return { rows: [] };
          }
          if (sql.includes('INSERT INTO public.employees')) {
            insertCalls.push(params ?? []);
            return { rows: [] };
          }
          if (sql.includes('manager_id')) {
            return { rows: [{ count: 0 }] };
          }
          return { rows: [] };
        }),
      };
      const svc = new MobileAuthService(db as never);
      const res = await svc.login({ email: legacyEmail, password: uatPassword });
      expect(res.access_token).toBeTruthy();
      expect(res.employee.email).toBe(uatEmail);
      expect(insertCalls.length).toBe(1);
    });
  });
});
