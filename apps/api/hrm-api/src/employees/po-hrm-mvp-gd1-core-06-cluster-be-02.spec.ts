/**
 * @CODE-MEMORY
 * Screen:     HRM → Hồ sơ NV → Tài sản / Checklist thu hồi (UC-BP-CORE-06)
 * UC:         UC-BP-CORE-06 · R-CORE-06-TERM-CHK-01 · R-CORE-06-STATUS-QUERY-400
 * WorkItem:   PO-HRM-MVP-GD1-CORE-06-CLUSTER-BE-02
 * Purpose:    Jest — whitelist status query · listAssets SQL filter assigned · Nest /core DENY · CORE-05 must_keep
 * must_keep:  BB/serial/DELETE-FORBIDDEN · no hrm_termination · no Nest /core · honesty false · no seed
 * LastVerified: po-hrm-mvp-gd1-core-06-cluster-be-02.spec.ts
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { EmployeeProfileService } from './employee-profile.service';
import { EmployeesService } from './employees.service';

const EMPLOYEE_ID = '633e95b7-cf1b-469f-a0f8-4c91f3f35f80';
const ASSIGNED_ID = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
const RETURNED_ID = 'b2c3d4e5-f6a7-4890-b123-456789abcdef';

function groupCeoToken() {
  return signServiceJwt({
    sub: 'ceo@xe.vn',
    tenantId: 'xevn',
    companyId: 'main',
    roleCode: 'group_ceo',
  });
}

describe('PO-HRM-MVP-GD1-CORE-06-CLUSTER-BE-02 (R-CORE-06-STATUS-QUERY-400)', () => {
  let profile: EmployeeProfileService;
  let employees: jest.Mocked<EmployeesService>;
  let db: jest.Mocked<HrmDbService>;

  beforeEach(() => {
    db = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
    } as unknown as jest.Mocked<HrmDbService>;
    employees = {
      getEmployeeById: jest.fn().mockResolvedValue({
        id: EMPLOYEE_ID,
        company_id: 'holding',
      }),
    } as unknown as jest.Mocked<EmployeesService>;
    profile = new EmployeeProfileService(db, employees);
  });

  it('DTO whitelist: status + soft termination_context_id declared (deny invent hrm_termination)', () => {
    const dtoSrc = readFileSync(
      join(__dirname, 'dto/employee-profile-list.query.dto.ts'),
      'utf8',
    );
    expect(dtoSrc).toMatch(/status\?:/);
    expect(dtoSrc).toMatch(/termination_context_id\?:/);
    expect(dtoSrc).toMatch(/IsIn\(\[\.\.\.EMPLOYEE_ASSET_LIST_STATUSES\]\)/);
    expect(dtoSrc).toMatch(/assigned/);
    expect(dtoSrc).not.toMatch(/CREATE TABLE/i);

    const svc = readFileSync(
      join(__dirname, 'employee-profile.service.ts'),
      'utf8',
    );
    expect(svc).toMatch(/PO-HRM-MVP-GD1-CORE-06-CLUSTER-BE-02/);
    expect(svc).toMatch(/R-CORE-06-STATUS-QUERY-400/);
    expect(svc).not.toMatch(/@Controller\(['"]core['"]\)/);
    expect(svc).not.toMatch(
      /CREATE TABLE IF NOT EXISTS public\.hrm_termination/i,
    );

    const ctrl = readFileSync(
      join(__dirname, 'employees.controller.ts'),
      'utf8',
    );
    expect(ctrl).not.toMatch(/@Controller\(['"]core['"]\)/);
    expect(ctrl).toMatch(/:employeeId\/assets/);
  });

  it('listAssets status=assigned → SQL status filter · assigned-only rows · display-ready', async () => {
    const token = groupCeoToken();
    db.query.mockImplementation(async (sql: string) => {
      const s = String(sql);
      if (s.includes('FROM public.employee_assets') && s.includes('SELECT *')) {
        expect(s).toMatch(/status\s*=\s*\$\d+/);
        return {
          rows: [
            {
              id: ASSIGNED_ID,
              employee_id: EMPLOYEE_ID,
              company_id: 'holding',
              asset_name: 'Laptop Dell',
              asset_code: 'AST-01',
              status: 'assigned',
              serial_number: 'SN-A',
              handover_confirmed_at: null,
              handover_confirmed_by: null,
              handover_receiver_name: null,
              updated_at: new Date().toISOString(),
            },
          ],
        };
      }
      return { rows: [] };
    });

    const res = await profile.listAssets(
      EMPLOYEE_ID,
      {
        company_id: 'main',
        status: 'assigned',
        termination_context_id: 'soft-ctx-1',
      },
      `Bearer ${token}`,
    );

    expect(employees.getEmployeeById).toHaveBeenCalled();
    expect(res.total).toBe(1);
    expect(res.data).toHaveLength(1);
    expect(res.data[0].status).toBe('assigned');
    expect(res.data[0].statusLabelVi).toBe('Đang sử dụng');
    expect(res.data.every((r) => r.status === 'assigned')).toBe(true);

    const listSql = db.query.mock.calls
      .map(([sql]) => String(sql))
      .find(
        (s) =>
          s.includes('FROM public.employee_assets') && s.includes('SELECT *'),
      );
    expect(listSql).toBeDefined();
    expect(listSql!).toMatch(/status\s*=/);

    const listArgs = db.query.mock.calls.find(
      ([sql]) =>
        String(sql).includes('FROM public.employee_assets') &&
        String(sql).includes('SELECT *'),
    )?.[1];
    expect(listArgs).toContain('assigned');
    // soft termination_context_id must NOT invent SQL join / TERM table filter
    expect(listSql!).not.toMatch(/termination_context/i);
  });

  it('listAssets without status → no status SQL filter (full list RETAIN)', async () => {
    const token = groupCeoToken();
    db.query.mockImplementation(async (sql: string) => {
      const s = String(sql);
      if (s.includes('FROM public.employee_assets') && s.includes('SELECT *')) {
        expect(s).not.toMatch(/status\s*=/);
        return {
          rows: [
            {
              id: ASSIGNED_ID,
              employee_id: EMPLOYEE_ID,
              company_id: 'holding',
              asset_name: 'Laptop',
              status: 'assigned',
              updated_at: new Date().toISOString(),
            },
            {
              id: RETURNED_ID,
              employee_id: EMPLOYEE_ID,
              company_id: 'holding',
              asset_name: 'Phone',
              status: 'returned',
              updated_at: new Date().toISOString(),
            },
          ],
        };
      }
      return { rows: [] };
    });

    const res = await profile.listAssets(
      EMPLOYEE_ID,
      { company_id: 'main' },
      `Bearer ${token}`,
    );
    expect(res.total).toBe(2);
    expect(res.data.map((r) => r.status).sort()).toEqual([
      'assigned',
      'returned',
    ]);
  });

  it('must_keep CORE-05 seals still present (BB · serial · DELETE-FORBIDDEN · Nest /core DENY)', () => {
    const svc = readFileSync(
      join(__dirname, 'employee-profile.service.ts'),
      'utf8',
    );
    expect(svc).toMatch(/HRM_EMP_ASSET_SERIAL_CONFLICT/);
    expect(svc).toMatch(/HRM_EMP_ASSET_DELETE_FORBIDDEN/);
    expect(svc).toMatch(/handover_confirmed_at/);
    expect(svc).toMatch(/Nest \/core DENY/);
    expect(svc).not.toMatch(
      /CREATE TABLE IF NOT EXISTS public\.hrm_asset_handover/i,
    );
  });
});
