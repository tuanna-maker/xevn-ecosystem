/**
 * @CODE-MEMORY
 * Screen:     HRM → Hồ sơ NV → Tài sản (UC-BP-CORE-05)
 * UC:         UC-BP-CORE-05 · F-CORE-AST-01 · F-CORE-AST-BB-01
 * WorkItem:   PO-HRM-MVP-GD1-CORE-05-CLUSTER-BE-01 · BE-02 (empty DATE→null)
 * Purpose:    Jest — ensureSchema BB cols · serial 409 · soft-delete · U19 · empty DATE 201 · Nest /core DENY
 * must_keep:  CORE-03 DOC/ET/CHK · CORE-02b · CORE-09d..01 · AST-02 OUT · no seed · honesty false
 * LastVerified: po-hrm-mvp-gd1-core-05-cluster-be-01.spec.ts · BE-02 R-CORE-05-EMPTY-DATE-500
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import {
  EmployeeProfileService,
  HRM_EMP_ASSET_DELETE_FORBIDDEN,
  HRM_EMP_ASSET_SERIAL_CONFLICT,
} from './employee-profile.service';
import { EmployeesService } from './employees.service';

const EMPLOYEE_ID = '633e95b7-cf1b-469f-a0f8-4c91f3f35f80';
const ASSET_ID = 'a1b2c3d4-e5f6-4789-a012-3456789abcde';
const OTHER_ASSET_ID = 'b2c3d4e5-f6a7-4890-b123-456789abcdef';

function groupCeoToken() {
  return signServiceJwt({
    sub: 'ceo@xe.vn',
    tenantId: 'xevn',
    companyId: 'main',
    roleCode: 'group_ceo',
  });
}

function isAssetPeek(sql: string): boolean {
  return (
    sql.includes('FROM public.employee_assets') &&
    sql.includes('serial_number') &&
    sql.includes('handover_confirmed_at')
  );
}

describe('PO-HRM-MVP-GD1-CORE-05-CLUSTER-BE-01 (F-CORE-AST-01/BB-01)', () => {
  let profile: EmployeeProfileService;
  let employees: jest.Mocked<EmployeesService>;
  let db: jest.Mocked<HrmDbService>;

  beforeEach(() => {
    db = { query: jest.fn().mockResolvedValue({ rows: [] }) } as unknown as jest.Mocked<HrmDbService>;
    employees = {
      getEmployeeById: jest.fn().mockResolvedValue({
        id: EMPLOYEE_ID,
        company_id: 'holding',
      }),
    } as unknown as jest.Mocked<EmployeesService>;
    profile = new EmployeeProfileService(db, employees);
  });

  it('ensureSchema ADD handover_confirmed_* soft cols · HOLD spine · DENY Nest /core dual invent', async () => {
    const token = groupCeoToken();
    db.query.mockResolvedValue({ rows: [] });
    await profile.listAssets(EMPLOYEE_ID, { company_id: 'main' }, `Bearer ${token}`);

    const ddl = db.query.mock.calls.map(([sql]) => String(sql)).join('\n');
    expect(ddl).toMatch(/handover_confirmed_at\s+TIMESTAMPTZ/i);
    expect(ddl).toMatch(/handover_confirmed_by\s+TEXT/i);
    expect(ddl).toMatch(/handover_receiver_name\s+TEXT/i);
    expect(ddl).toMatch(/CREATE TABLE IF NOT EXISTS public\.employee_assets/i);
    expect(ddl).not.toMatch(/CREATE TABLE IF NOT EXISTS public\.hrm_asset_handover/i);
    expect(ddl).not.toMatch(/UNIQUE.*serial_number/i);

    const src = readFileSync(join(__dirname, 'employee-profile.service.ts'), 'utf8');
    expect(src).not.toMatch(/@Controller\(['"]core['"]\)/);
    const ctrl = readFileSync(join(__dirname, 'employees.controller.ts'), 'utf8');
    expect(ctrl).not.toMatch(/@Controller\(['"]core['"]\)/);
    expect(ctrl).toMatch(/:employeeId\/assets/);
    // Cite OUT invent DONE only — no return/thu hồi route invent this seat
    expect(src).toMatch(/F-CORE-AST-02 OUT invent DONE/);
    expect(src).not.toMatch(/confirm-handover|\/assets\/:.*\/return/i);
  });

  it('listAssets display-ready: statusLabelVi · handoverConfirmed · handoverDocId alias', async () => {
    const token = groupCeoToken();
    db.query.mockImplementation(async (sql: string) => {
      if (typeof sql === 'string' && sql.includes('FROM public.employee_assets') && sql.includes('SELECT')) {
        if (isAssetPeek(sql)) return { rows: [] };
        if (sql.includes('ORDER BY')) {
          return {
            rows: [
              {
                id: ASSET_ID,
                employee_id: EMPLOYEE_ID,
                company_id: 'holding',
                asset_name: 'Laptop Dell',
                status: 'assigned',
                serial_number: 'SN-1',
                handover_confirmed_at: '2026-08-01T10:00:00.000Z',
                handover_confirmed_by: 'ceo@xe.vn',
                handover_receiver_name: 'Nguyễn Văn A',
              },
            ],
          };
        }
      }
      return { rows: [] };
    });

    const res = await profile.listAssets(EMPLOYEE_ID, { company_id: 'main' }, `Bearer ${token}`);
    expect(res.total).toBe(1);
    const row = res.data[0];
    expect(row.statusLabelVi).toBe('Đang sử dụng');
    expect(row.handoverConfirmed).toBe(true);
    expect(row.handoverDocId).toBe(ASSET_ID);
    expect(row.handoverReceiverName).toBe('Nguyễn Văn A');
  });

  it('createAsset default assigned · confirm NULL · empty serial allowed', async () => {
    const token = groupCeoToken();
    db.query.mockImplementation(async (sql: string) => {
      if (typeof sql === 'string' && sql.includes('INSERT INTO public.employee_assets')) {
        return {
          rows: [
            {
              id: ASSET_ID,
              employee_id: EMPLOYEE_ID,
              company_id: 'holding',
              asset_name: 'Máy in',
              status: 'assigned',
              serial_number: null,
              handover_confirmed_at: null,
            },
          ],
        };
      }
      return { rows: [] };
    });

    const row = await profile.createAsset(
      EMPLOYEE_ID,
      { company_id: 'main' },
      { assetName: 'Máy in', category: 'equipment' },
      `Bearer ${token}`,
    );
    expect(row.asset_name).toBe('Máy in');
    expect(row.handoverConfirmed).toBe(false);
    expect(row.handoverDocId).toBeNull();
    expect(row.statusLabelVi).toBe('Đang sử dụng');
    const insert = db.query.mock.calls.find(([sql]) => String(sql).includes('INSERT INTO public.employee_assets'));
    expect(insert?.[1]).toEqual(
      expect.arrayContaining([EMPLOYEE_ID, 'holding', 'Máy in', 'equipment', 'assigned']),
    );
    expect(typeof insert?.[1]?.[0]).toBe('string');
  });

  /** R-CORE-05-EMPTY-DATE-500 — FE blank assignedDate/returnDate → null · create succeeds (201). */
  it('createAsset assignedDate:\'\' / returnDate:\'\' → null DATE · 201 (not 500)', async () => {
    const token = groupCeoToken();
    db.query.mockImplementation(async (sql: string) => {
      if (typeof sql === 'string' && sql.includes('INSERT INTO public.employee_assets')) {
        return {
          rows: [
            {
              id: ASSET_ID,
              employee_id: EMPLOYEE_ID,
              company_id: 'holding',
              asset_name: 'Máy chiếu',
              status: 'assigned',
              assigned_date: null,
              return_date: null,
              serial_number: null,
              handover_confirmed_at: null,
            },
          ],
        };
      }
      return { rows: [] };
    });

    const row = await profile.createAsset(
      EMPLOYEE_ID,
      { company_id: 'main' },
      {
        assetName: 'Máy chiếu',
        category: 'equipment',
        assignedDate: '',
        returnDate: '',
      },
      `Bearer ${token}`,
    );
    expect(row.asset_name).toBe('Máy chiếu');
    expect(row.statusLabelVi).toBe('Đang sử dụng');
    expect(row.handoverConfirmed).toBe(false);

    const insert = db.query.mock.calls.find(([sql]) =>
      String(sql).includes('INSERT INTO public.employee_assets'),
    );
    expect(insert).toBeDefined();
    const sql = String(insert?.[0] ?? '');
    const params = insert?.[1] as unknown[];
    expect(sql).toMatch(/assigned_date/i);
    expect(sql).toMatch(/return_date/i);
    expect(sql).toMatch(/::date/);
    // Never pass "" to PG DATE — coerce to null (omit/null diag parity).
    expect(params).toEqual(expect.arrayContaining([null]));
    const assignedIdx = sql
      .match(/INSERT INTO public\.employee_assets \(([^)]+)\)/i)?.[1]
      ?.split(',')
      .map((c) => c.trim())
      .indexOf('assigned_date');
    const returnIdx = sql
      .match(/INSERT INTO public\.employee_assets \(([^)]+)\)/i)?.[1]
      ?.split(',')
      .map((c) => c.trim())
      .indexOf('return_date');
    expect(assignedIdx).toBeGreaterThanOrEqual(0);
    expect(returnIdx).toBeGreaterThanOrEqual(0);
    expect(params[assignedIdx!]).toBeNull();
    expect(params[returnIdx!]).toBeNull();
    expect(params).not.toContain('');
  });

  it('createAsset duplicate assigned serial → 409 HRM-EMP-ASSET-SERIAL-CONFLICT (no persist)', async () => {
    const token = groupCeoToken();
    db.query.mockImplementation(async (sql: string) => {
      if (
        typeof sql === 'string' &&
        sql.includes('FROM public.employee_assets') &&
        sql.includes("status = 'assigned'") &&
        sql.includes('TRIM')
      ) {
        return { rows: [{ id: OTHER_ASSET_ID }] };
      }
      return { rows: [] };
    });

    await expect(
      profile.createAsset(
        EMPLOYEE_ID,
        { company_id: 'main' },
        { asset_name: 'Laptop', serial_number: 'DUP-SN-001' },
        `Bearer ${token}`,
      ),
    ).rejects.toThrow(
      expect.objectContaining<ApiException>({ code: HRM_EMP_ASSET_SERIAL_CONFLICT }),
    );
    const insert = db.query.mock.calls.find(([sql]) => String(sql).includes('INSERT INTO public.employee_assets'));
    expect(insert).toBeUndefined();
  });

  it('updateAsset BB confirm SET → handoverConfirmed + handoverDocId=id (F-CORE-AST-BB-01)', async () => {
    const token = groupCeoToken();
    db.query.mockImplementation(async (sql: string) => {
      if (typeof sql === 'string' && isAssetPeek(sql)) {
        return {
          rows: [
            {
              company_id: 'holding',
              status: 'assigned',
              serial_number: 'SN-OK',
              handover_confirmed_at: null,
            },
          ],
        };
      }
      if (typeof sql === 'string' && sql.includes('SELECT company_id FROM public.employee_assets')) {
        return { rows: [{ company_id: 'holding' }] };
      }
      if (typeof sql === 'string' && sql.includes('UPDATE public.employee_assets')) {
        return {
          rows: [
            {
              id: ASSET_ID,
              employee_id: EMPLOYEE_ID,
              company_id: 'holding',
              status: 'assigned',
              asset_name: 'Laptop',
              handover_confirmed_at: '2026-08-09T06:00:00.000Z',
              handover_confirmed_by: 'ceo@xe.vn',
              handover_receiver_name: 'Tran B',
            },
          ],
        };
      }
      return { rows: [] };
    });

    const row = await profile.updateAsset(
      ASSET_ID,
      EMPLOYEE_ID,
      { company_id: 'main' },
      { handoverConfirmed: true, handoverReceiverName: 'Tran B' },
      `Bearer ${token}`,
    );
    expect(row.handoverConfirmed).toBe(true);
    expect(row.handoverDocId).toBe(ASSET_ID);
    expect(row.handoverReceiverName).toBe('Tran B');
    const updateSql = String(
      db.query.mock.calls.find(([sql]) => String(sql).includes('UPDATE public.employee_assets'))?.[0] ?? '',
    );
    expect(updateSql).toMatch(/handover_confirmed_at/);
    expect(updateSql).toMatch(/handover_confirmed_by/);
    expect(updateSql).toMatch(/handover_receiver_name/);
  });

  it('updateAsset notes-only does not invent BB confirm flags (AC-CORE-05-06)', async () => {
    const token = groupCeoToken();
    db.query.mockImplementation(async (sql: string) => {
      if (typeof sql === 'string' && isAssetPeek(sql)) {
        return {
          rows: [
            {
              company_id: 'holding',
              status: 'assigned',
              serial_number: null,
              handover_confirmed_at: null,
            },
          ],
        };
      }
      if (typeof sql === 'string' && sql.includes('SELECT company_id FROM public.employee_assets')) {
        return { rows: [{ company_id: 'holding' }] };
      }
      if (typeof sql === 'string' && sql.includes('UPDATE public.employee_assets')) {
        return {
          rows: [
            {
              id: ASSET_ID,
              status: 'assigned',
              notes: 'ghi chú tự do',
              handover_confirmed_at: null,
            },
          ],
        };
      }
      return { rows: [] };
    });

    const row = await profile.updateAsset(
      ASSET_ID,
      EMPLOYEE_ID,
      { company_id: 'main' },
      { notes: 'ghi chú tự do' },
      `Bearer ${token}`,
    );
    expect(row.handoverConfirmed).toBe(false);
    expect(row.handoverDocId).toBeNull();
    const updateSql = String(
      db.query.mock.calls.find(([sql]) => String(sql).includes('UPDATE public.employee_assets'))?.[0] ?? '',
    );
    expect(updateSql).toMatch(/notes/);
    expect(updateSql).not.toMatch(/handover_confirmed_at/);
  });

  it('updateAsset serial conflict under main rollup → 409 (U19 scope scan)', async () => {
    const token = groupCeoToken();
    db.query.mockImplementation(async (sql: string) => {
      if (typeof sql === 'string' && isAssetPeek(sql)) {
        return {
          rows: [
            {
              company_id: 'holding',
              status: 'assigned',
              serial_number: 'OLD',
              handover_confirmed_at: null,
            },
          ],
        };
      }
      if (
        typeof sql === 'string' &&
        sql.includes("status = 'assigned'") &&
        sql.includes('TRIM')
      ) {
        return { rows: [{ id: OTHER_ASSET_ID }] };
      }
      return { rows: [] };
    });

    await expect(
      profile.updateAsset(
        ASSET_ID,
        EMPLOYEE_ID,
        { company_id: 'main' },
        { serialNumber: 'DUP-SN-002' },
        `Bearer ${token}`,
      ),
    ).rejects.toThrow(
      expect.objectContaining<ApiException>({ code: HRM_EMP_ASSET_SERIAL_CONFLICT }),
    );
    const update = db.query.mock.calls.find(([sql]) => String(sql).includes('UPDATE public.employee_assets'));
    expect(update).toBeUndefined();
  });

  it('deleteAsset issued without waiver → 409 HRM-EMP-ASSET-DELETE-FORBIDDEN', async () => {
    const token = groupCeoToken();
    db.query.mockImplementation(async (sql: string) => {
      if (typeof sql === 'string' && isAssetPeek(sql)) {
        return {
          rows: [
            {
              company_id: 'holding',
              status: 'assigned',
              serial_number: 'SN',
              handover_confirmed_at: null,
            },
          ],
        };
      }
      return { rows: [] };
    });

    await expect(
      profile.deleteAsset(ASSET_ID, EMPLOYEE_ID, { company_id: 'main' }, `Bearer ${token}`),
    ).rejects.toThrow(
      expect.objectContaining<ApiException>({ code: HRM_EMP_ASSET_DELETE_FORBIDDEN }),
    );
    const del = db.query.mock.calls.find(([sql]) => String(sql).includes('DELETE FROM public.employee_assets'));
    expect(del).toBeUndefined();
  });

  it('U19: updateAsset holding row under company_id=main succeeds (list=get=mutate)', async () => {
    const token = groupCeoToken();
    db.query.mockImplementation(async (sql: string) => {
      if (typeof sql === 'string' && isAssetPeek(sql)) {
        return {
          rows: [
            {
              company_id: 'holding',
              status: 'returned',
              serial_number: null,
              handover_confirmed_at: null,
            },
          ],
        };
      }
      if (typeof sql === 'string' && sql.includes('SELECT company_id FROM public.employee_assets')) {
        return { rows: [{ company_id: 'holding' }] };
      }
      if (typeof sql === 'string' && sql.includes('UPDATE public.employee_assets')) {
        return {
          rows: [
            {
              id: ASSET_ID,
              company_id: 'holding',
              status: 'returned',
              asset_name: 'Laptop',
              handover_confirmed_at: null,
            },
          ],
        };
      }
      return { rows: [] };
    });

    const row = await profile.updateAsset(
      ASSET_ID,
      EMPLOYEE_ID,
      { company_id: 'main' },
      { status: 'returned', return_date: '2026-08-09' },
      `Bearer ${token}`,
    );
    expect(row.status).toBe('returned');
    expect(row.statusLabelVi).toBe('Đã thu hồi');
    expect(employees.getEmployeeById).toHaveBeenCalledWith(
      EMPLOYEE_ID,
      { company_id: 'main' },
      `Bearer ${token}`,
    );
  });

  it('DENY invent Asset ledger / F-CORE-AST-02 return path in this service', () => {
    const src = readFileSync(join(__dirname, 'employee-profile.service.ts'), 'utf8');
    expect(src).not.toMatch(/hrm_asset_ledger|asset_depreciation|AssetLedger/i);
    expect(src).toMatch(/HRM_EMP_ASSET_SERIAL_CONFLICT/);
    expect(src).toMatch(/handover_confirmed_at/);
    // Soft prefer — no claim CORE-06 DONE
    expect(src).toMatch(/F-CORE-AST-02 OUT invent DONE/);
  });
});
