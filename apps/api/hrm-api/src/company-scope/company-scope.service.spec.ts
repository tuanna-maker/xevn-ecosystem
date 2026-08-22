import { HttpStatus } from '@nestjs/common';
import { createHmac } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  CompanyScopeService,
  membershipResolvedTenantSql,
} from './company-scope.service';
import { EmployeesService } from '../employees/employees.service';
import { HrmDbService } from '../db/hrm-db.service';

function createInternalJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString(
    'base64url',
  );
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const secret = process.env.SERVICE_JWT_SECRET ?? 'xevn-dev-jwt-secret';
  const sig = createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `Bearer ${header}.${body}.${sig}`;
}

describe('CompanyScopeService', () => {
  const dbMock = { query: jest.fn() };
  const employeesMock = {
    getEmployeesSummary: jest.fn(),
  };
  let service: CompanyScopeService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CompanyScopeService(
      dbMock as unknown as HrmDbService,
      employeesMock as unknown as EmployeesService,
    );
    process.env.HRM_TENANT_ONLY_SCOPE = 'true';
    process.env.SERVICE_JWT_SECRET = 'xevn-dev-jwt-secret';
  });

  it('membershipResolvedTenantSql maps legacy OU slug logistics → visun', () => {
    expect(membershipResolvedTenantSql('m')).toContain("WHEN 'logistics' THEN 'visun'");
  });

  it('listScopedCompanies returns visun row for subsidiary CEO', async () => {
    const auth = createInternalJwt({
      sub: 'ceo2@xe.vn',
      tenantId: 'visun',
      roleCode: 'subsidiary_ceo',
    });
    employeesMock.getEmployeesSummary.mockResolvedValue({
      total: 220,
      by_tenant: [{ tenant_id: 'visun', total: 220, active_count: 200, inactive_count: 20, archived_count: 0 }],
    });

    const result = await service.listScopedCompanies(auth, { tenantId: 'visun' });
    expect(result.total).toBe(1);
    expect(result.data[0]).toMatchObject({
      tenant_id: 'visun',
      company_id: 'main',
      employee_count: 220,
    });
  });

  it('listScopedMemberships rejects unauthorized role', async () => {
    const auth = createInternalJwt({
      sub: 'emp@xe.vn',
      tenantId: 'visun',
      roleCode: 'employee',
    });
    dbMock.query.mockImplementation(async (sql: string) => {
      if (String(sql).includes('platform_admins')) {
        return { rows: [] };
      }
      return { rows: [] };
    });
    await expect(
      service.listScopedMemberships(auth, 'main', { tenantId: 'visun' }),
    ).rejects.toMatchObject({
      code: 'HRM-AUTH-002',
    });
  });

  it('listScopedMemberships filters by tenant scope', async () => {
    const auth = createInternalJwt({
      sub: 'ceo2@xe.vn',
      tenantId: 'visun',
      roleCode: 'subsidiary_ceo',
    });
    dbMock.query.mockImplementation(async (sql: string) => {
      if (String(sql).includes('FROM public.user_company_memberships m')) {
        return {
          rows: [{ id: 'm1', email: 'u@xe.vn', company_id: 'main', tenant_id: 'visun' }],
        };
      }
      return { rows: [] };
    });

    const result = await service.listScopedMemberships(auth, 'main', {
      tenantId: 'visun',
    });
    expect(result.total).toBe(1);
  });
});
