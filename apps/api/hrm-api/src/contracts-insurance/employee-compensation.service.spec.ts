import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { EmployeeCompensationService } from './employee-compensation.service';

/**
 * CD-FB-08-CONTRACT / F5 — compensation package versioning + history.
 * UC-HRM-CI-08..11 · BR-CD-F5-01..05 · AC-CD-F5-02..04
 */
describe('EmployeeCompensationService (CD-FB-08 / F5)', () => {
  let service: EmployeeCompensationService;
  let db: jest.Mocked<HrmDbService>;

  const employeeId = '16f5e2c5-8fbb-4500-8c82-623950f7055e';
  const contractId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
  const packageId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
  const cbAuth = () =>
    `Bearer ${signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    })}`;

  const isSchemaOrAuditSql = (sql: string): boolean =>
    sql.includes('CREATE TABLE') ||
    sql.includes('CREATE INDEX') ||
    sql.includes('ALTER TABLE') ||
    sql.includes('INSERT INTO public.hrm_cb_access_audit') ||
    sql.includes(
      'UPDATE public.employee_compensation_lines SET component_code',
    );

  beforeEach(() => {
    db = {
      query: jest.fn(),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    db.query.mockResolvedValue({ rows: [] } as never);
    service = new EmployeeCompensationService(db);
  });

  it('AC-CD-F5-02 creates package with base + probation + two allowance lines', async () => {
    db.query.mockImplementation(async (sql: string, params?: unknown[]) => {
      if (isSchemaOrAuditSql(sql)) {
        return { rows: [] } as never;
      }
      if (
        sql.includes('FROM public.employees e') &&
        sql.includes('e.id = $1::uuid')
      ) {
        return {
          rows: [
            {
              id: employeeId,
              company_id: 'holding',
              status: 'active',
              employment_status: 'probation',
            },
          ],
        } as never;
      }
      if (sql.includes('INSERT INTO public.employee_compensation_packages')) {
        return {
          rows: [
            {
              id: packageId,
              company_id: 'holding',
              employee_id: employeeId,
              contract_id: null,
              version: 1,
              supersedes_package_id: null,
              effective_from: '2026-07-01',
              effective_to: null,
              currency: 'VND',
              change_reason: 'initial',
              created_at: '2026-07-01T00:00:00.000Z',
              updated_at: '2026-07-01T00:00:00.000Z',
            },
          ],
        } as never;
      }
      if (sql.includes('INSERT INTO public.employee_compensation_lines')) {
        const lineType = params?.[2];
        return {
          rows: [
            {
              id: randomLineId(String(lineType)),
              package_id: packageId,
              line_type: lineType,
              amount: params?.[3] ?? 1,
              currency: 'VND',
              allowance_code:
                lineType === 'allowance'
                  ? String(params?.[5] ?? 'PHU_CAP')
                  : null,
              taxable: true,
              note: null,
              sort_order: 0,
              created_at: '2026-07-01T00:00:00.000Z',
            },
          ],
        } as never;
      }
      if (sql.includes('INSERT INTO public.employee_compensation_history')) {
        return { rows: [] } as never;
      }
      return { rows: [] } as never;
    });

    const result = await service.createPackage(
      {
        company_id: 'holding',
        employee_id: employeeId,
        effective_from: '2026-07-01',
        lines: [
          { line_type: 'base', amount: 15_000_000 },
          { line_type: 'probation', amount: 12_000_000 },
          {
            line_type: 'allowance',
            amount: 500_000,
            allowance_code: 'PHU_CAP_AN',
          },
          {
            line_type: 'allowance',
            amount: 300_000,
            allowance_code: 'PHU_CAP_XANG',
          },
        ],
      },
      cbAuth(),
    );

    expect(result.id).toBe(packageId);
    expect(result.lines).toHaveLength(4);
    expect(result.lines.map((l) => l.line_type)).toEqual(
      expect.arrayContaining(['base', 'probation', 'allowance']),
    );
    const historyCall = db.query.mock.calls.find(([sql]) =>
      String(sql).includes('INSERT INTO public.employee_compensation_history'),
    );
    expect(historyCall).toBeDefined();
  });

  it('BR-CD-F5-02 rejects probation line when employee is not probation', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (isSchemaOrAuditSql(sql)) {
        return { rows: [] } as never;
      }
      if (sql.includes('FROM public.employees e')) {
        return {
          rows: [
            {
              id: employeeId,
              company_id: 'holding',
              status: 'active',
              employment_status: 'active',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    await expect(
      service.createPackage(
        {
          company_id: 'holding',
          employee_id: employeeId,
          effective_from: '2026-07-01',
          lines: [
            { line_type: 'base', amount: 15_000_000 },
            { line_type: 'probation', amount: 12_000_000 },
          ],
        },
        cbAuth(),
      ),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-COMP-002' });
  });

  it('BR-CD-F5-03 rejects allowance without allowance_code', async () => {
    await expect(
      service.createPackage(
        {
          company_id: 'holding',
          employee_id: employeeId,
          effective_from: '2026-07-01',
          lines: [
            { line_type: 'base', amount: 15_000_000 },
            { line_type: 'allowance', amount: 500_000 },
          ],
        },
        cbAuth(),
      ),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-COMP-003' });
  });

  it('AC-CD-F5-04 revise creates new version and closes prior (no line overwrite)', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const newPackageId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
    let lineInsertCount = 0;

    db.query.mockImplementation(async (sql: string) => {
      if (isSchemaOrAuditSql(sql)) {
        return { rows: [] } as never;
      }
      if (
        sql.includes('FROM public.employee_compensation_packages p') &&
        sql.includes('p.id = $1::uuid')
      ) {
        return {
          rows: [
            {
              id: packageId,
              company_id: 'holding',
              employee_id: employeeId,
              contract_id: contractId,
              version: 1,
              supersedes_package_id: null,
              effective_from: '2026-01-01',
              effective_to: null,
              currency: 'VND',
              change_reason: 'initial',
              created_at: '2026-01-01T00:00:00.000Z',
              updated_at: '2026-01-01T00:00:00.000Z',
            },
          ],
        } as never;
      }
      if (sql.includes('FROM public.employees e')) {
        return {
          rows: [
            {
              id: employeeId,
              company_id: 'holding',
              status: 'active',
              employment_status: 'active',
            },
          ],
        } as never;
      }
      if (
        sql.includes('UPDATE public.employee_compensation_packages') &&
        sql.includes('effective_to')
      ) {
        return { rows: [] } as never;
      }
      if (sql.includes('INSERT INTO public.employee_compensation_packages')) {
        return {
          rows: [
            {
              id: newPackageId,
              company_id: 'holding',
              employee_id: employeeId,
              contract_id: contractId,
              version: 2,
              supersedes_package_id: packageId,
              effective_from: '2026-08-01',
              effective_to: null,
              currency: 'VND',
              change_reason: 'salary raise',
              created_at: '2026-08-01T00:00:00.000Z',
              updated_at: '2026-08-01T00:00:00.000Z',
            },
          ],
        } as never;
      }
      if (sql.includes('INSERT INTO public.employee_compensation_lines')) {
        lineInsertCount += 1;
        return {
          rows: [
            {
              id: `line-${lineInsertCount}`,
              package_id: newPackageId,
              line_type: 'base',
              amount: 18_000_000,
              currency: 'VND',
              allowance_code: null,
              taxable: true,
              note: null,
              sort_order: 0,
              created_at: '2026-08-01T00:00:00.000Z',
            },
          ],
        } as never;
      }
      if (sql.includes('INSERT INTO public.employee_compensation_history')) {
        return { rows: [] } as never;
      }
      if (sql.includes('UPDATE public.employee_contracts')) {
        return { rows: [] } as never;
      }
      return { rows: [] } as never;
    });

    const result = await service.revisePackage(
      packageId,
      {
        effective_from: '2026-08-01',
        change_reason: 'salary raise',
        lines: [{ line_type: 'base', amount: 18_000_000 }],
      },
      'main',
      `Bearer ${token}`,
    );

    expect(result.version).toBe(2);
    expect(result.supersedes_package_id).toBe(packageId);
    expect(
      db.query.mock.calls.some(([sql]) => String(sql).includes('effective_to')),
    ).toBe(true);
    expect(
      db.query.mock.calls.some(([sql]) =>
        String(sql).includes(
          'INSERT INTO public.employee_compensation_history',
        ),
      ),
    ).toBe(true);
    expect(
      db.query.mock.calls.every(
        ([sql]) =>
          !String(sql).includes('UPDATE public.employee_compensation_lines') ||
          String(sql).includes('SET component_code'),
      ),
    ).toBe(true);
  });

  it('BR-CD-F5-07 getActivePackage uses as_of window for payroll', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    db.query.mockImplementation(async (sql: string) => {
      if (isSchemaOrAuditSql(sql)) {
        return { rows: [] } as never;
      }
      if (
        sql.includes('FROM public.employee_compensation_packages p') &&
        sql.includes('effective_from')
      ) {
        expect(sql).toContain('p.effective_from <=');
        expect(sql).toContain('p.effective_to IS NULL OR p.effective_to >=');
        return {
          rows: [
            {
              id: packageId,
              company_id: 'holding',
              employee_id: employeeId,
              contract_id: null,
              version: 2,
              supersedes_package_id: null,
              effective_from: '2026-08-01',
              effective_to: null,
              currency: 'VND',
              change_reason: 'raise',
              created_at: '2026-08-01T00:00:00.000Z',
              updated_at: '2026-08-01T00:00:00.000Z',
            },
          ],
        } as never;
      }
      if (sql.includes('FROM public.employee_compensation_lines')) {
        return {
          rows: [
            {
              id: 'line-base',
              package_id: packageId,
              line_type: 'base',
              amount: '18000000',
              currency: 'VND',
              allowance_code: null,
              taxable: true,
              note: null,
              sort_order: 0,
              created_at: '2026-08-01T00:00:00.000Z',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    const active = await service.getActivePackage(
      { company_id: 'main', employee_id: employeeId, as_of: '2026-08-15' },
      `Bearer ${token}`,
    );
    expect(active?.id).toBe(packageId);
    expect(active?.lines[0]?.amount).toBe(18_000_000);
  });

  it('D-CD-FB-08 cold getActivePackage returns null (no 500) before first create', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    db.query.mockImplementation(async (sql: string) => {
      if (isSchemaOrAuditSql(sql)) {
        return { rows: [] } as never;
      }
      if (sql.includes('FROM public.employee_compensation_packages p')) {
        return { rows: [] } as never;
      }
      return { rows: [] } as never;
    });

    await expect(
      service.getActivePackage(
        { company_id: 'main', employee_id: employeeId, as_of: '2026-07-19' },
        `Bearer ${token}`,
      ),
    ).resolves.toBeNull();

    expect(
      db.query.mock.calls.some(([sql]) =>
        String(sql).includes(
          'CREATE TABLE IF NOT EXISTS public.employee_compensation_packages',
        ),
      ),
    ).toBe(true);
  });

  it('D-CD-FB-08 ensureCompensationSchema swallows pg_type_typname_nsp_index race', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const pgTypeRace = Object.assign(
      new Error(
        'duplicate key value violates unique constraint "pg_type_typname_nsp_index"',
      ),
      { code: '23505' },
    );
    db.query.mockImplementation(async (sql: string) => {
      if (
        sql.includes(
          'CREATE TABLE IF NOT EXISTS public.employee_compensation_packages',
        )
      ) {
        throw pgTypeRace;
      }
      if (isSchemaOrAuditSql(sql)) {
        return { rows: [] } as never;
      }
      if (sql.includes('FROM public.employee_compensation_packages p')) {
        return { rows: [] } as never;
      }
      return { rows: [] } as never;
    });

    await expect(
      service.getActivePackage(
        { company_id: 'main', employee_id: employeeId },
        `Bearer ${token}`,
      ),
    ).resolves.toBeNull();
  });

  it('D-CD-FB-08 concurrent list+/active single-flights ensureCompensationSchema', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    let packagesCreateInFlight = 0;
    let packagesCreateMax = 0;
    let packagesCreateCount = 0;
    db.query.mockImplementation(async (sql: string) => {
      if (
        sql.includes(
          'CREATE TABLE IF NOT EXISTS public.employee_compensation_packages',
        )
      ) {
        packagesCreateCount += 1;
        packagesCreateInFlight += 1;
        packagesCreateMax = Math.max(packagesCreateMax, packagesCreateInFlight);
        await new Promise((r) => setTimeout(r, 25));
        packagesCreateInFlight -= 1;
        return { rows: [] } as never;
      }
      if (isSchemaOrAuditSql(sql)) {
        return { rows: [] } as never;
      }
      if (sql.includes('FROM public.employee_compensation_packages')) {
        return { rows: [] } as never;
      }
      return { rows: [] } as never;
    });

    const auth = `Bearer ${token}`;
    await Promise.all([
      service.getActivePackage(
        { company_id: 'main', employee_id: employeeId },
        auth,
      ),
      service.listPackages(
        { company_id: 'main', employee_id: employeeId },
        auth,
      ),
    ]);

    expect(packagesCreateCount).toBe(1);
    expect(packagesCreateMax).toBe(1);
  });

  it('list/get scope parity for company_id=main (J-HRM-01 / BR-CD-F5-06)', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    db.query.mockImplementation(async (sql: string) => {
      if (isSchemaOrAuditSql(sql)) {
        return { rows: [] } as never;
      }
      if (sql.includes('FROM public.employee_compensation_packages p')) {
        return { rows: [] } as never;
      }
      return { rows: [] } as never;
    });

    await service.listPackages(
      { company_id: 'main', employee_id: employeeId },
      `Bearer ${token}`,
    );
    const listCall = db.query.mock.calls.find(
      ([sql]) =>
        typeof sql === 'string' &&
        sql.trimStart().toUpperCase().startsWith('SELECT') &&
        sql.includes('FROM public.employee_compensation_packages p'),
    );
    expect(listCall?.[0]).toEqual(expect.stringContaining('p.employee_id IN'));
    expect(listCall?.[0]).toEqual(
      expect.stringContaining("custom_fields->>'tenant_id'"),
    );
  });

  it('VAL-EMP-SH-06 rejects overlapping effective segments (HRM-COMP-409-OVERLAP)', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (isSchemaOrAuditSql(sql)) {
        return { rows: [] } as never;
      }
      if (sql.includes('UPDATE public.employee_compensation_lines')) {
        return { rows: [] } as never;
      }
      if (sql.includes('FROM public.employees e')) {
        return {
          rows: [
            {
              id: employeeId,
              company_id: 'holding',
              status: 'active',
              employment_status: 'active',
            },
          ],
        } as never;
      }
      if (
        sql.includes('FROM public.employee_compensation_packages p') &&
        sql.includes('effective_from::date <=')
      ) {
        return { rows: [{ id: 'other-pkg' }] } as never;
      }
      return { rows: [] } as never;
    });

    await expect(
      service.createPackage(
        {
          company_id: 'holding',
          employee_id: employeeId,
          effective_from: '2026-07-01',
          lines: [{ line_type: 'base', amount: 15_000_000 }],
        },
        cbAuth(),
      ),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-COMP-409-OVERLAP' });
  });

  it('VAL-EMP-SH-05 rejects duplicate component_code on same package payload', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (isSchemaOrAuditSql(sql)) {
        return { rows: [] } as never;
      }
      if (sql.includes('FROM public.employees e')) {
        return {
          rows: [
            {
              id: employeeId,
              company_id: 'holding',
              status: 'active',
              employment_status: 'active',
            },
          ],
        } as never;
      }
      return { rows: [] } as never;
    });

    await expect(
      service.createPackage(
        {
          company_id: 'holding',
          employee_id: employeeId,
          effective_from: '2026-07-01',
          lines: [
            { line_type: 'base', amount: 15_000_000 },
            {
              line_type: 'allowance',
              amount: 500_000,
              allowance_code: 'PHU_CAP_AN',
            },
            {
              line_type: 'allowance',
              amount: 300_000,
              allowance_code: 'PHU_CAP_AN',
            },
          ],
        },
        cbAuth(),
      ),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-COMP-005' });
  });

  it('VAL-EMP-SH-04 / VAL-PAY-CNS-02 rejects unknown explicit component_code', async () => {
    db.query.mockImplementation(async (sql: string) => {
      if (isSchemaOrAuditSql(sql)) {
        return { rows: [] } as never;
      }
      if (sql.includes('FROM public.employees e')) {
        return {
          rows: [
            {
              id: employeeId,
              company_id: 'holding',
              status: 'active',
              employment_status: 'active',
            },
          ],
        } as never;
      }
      if (
        sql.includes('FROM public.salary_components') &&
        sql.includes('COUNT(*)')
      ) {
        return { rows: [{ c: '1' }] } as never;
      }
      if (sql.includes('FROM public.salary_components')) {
        return { rows: [] } as never;
      }
      if (
        sql.includes('FROM public.employee_compensation_packages p') &&
        sql.includes('effective_from::date <=')
      ) {
        return { rows: [] } as never;
      }
      return { rows: [] } as never;
    });

    await expect(
      service.createPackage(
        {
          company_id: 'holding',
          employee_id: employeeId,
          effective_from: '2026-07-01',
          lines: [
            {
              line_type: 'base',
              amount: 15_000_000,
              component_code: 'UNKNOWN_PC',
            },
          ],
        },
        cbAuth(),
      ),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-SC-COMP-KEY' });
  });
});

function randomLineId(lineType: string): string {
  const map: Record<string, string> = {
    base: '11111111-1111-4111-8111-111111111101',
    probation: '11111111-1111-4111-8111-111111111102',
    allowance: '11111111-1111-4111-8111-111111111103',
  };
  return map[lineType] ?? '11111111-1111-4111-8111-111111111199';
}
