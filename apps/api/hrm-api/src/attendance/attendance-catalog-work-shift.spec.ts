/**
 * PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-SHIFT-CATALOG-BE-01
 * VAL-ATT-SHIFT-CNS-01 invent KEY · CNS-03b list active · CNS-04 soft-retire · U19 get-by-id
 */
import { HttpStatus } from '@nestjs/common';
import { signServiceJwt } from '../common/jwt-sign';
import { ApiException } from '../common/api.exception';
import {
  AttendanceCatalogService,
  HRM_ATT_SHIFT_KEY,
} from './attendance-catalog.service';

const groupCeoAuth = (() => {
  const token = signServiceJwt({
    sub: 'ceo@xe.vn',
    tenantId: 'xevn',
    companyId: 'main',
    roleCode: 'group_ceo',
  });
  return `Bearer ${token}`;
})();

function baseShift(overrides: Record<string, unknown> = {}) {
  return {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    company_id: 'holding',
    code: 'morning',
    name: 'Ca sáng',
    department: null,
    start_time: '08:00',
    end_time: '12:00',
    break_start: null,
    break_end: null,
    work_hours: 4,
    coefficient: 1,
    is_night_shift: false,
    is_overtime_shift: false,
    color: '#3b82f6',
    status: 'active',
    notes: null,
    created_at: '2026-08-08T00:00:00.000Z',
    updated_at: '2026-08-08T00:00:00.000Z',
    ...overrides,
  };
}

describe('AttendanceCatalogService work_shifts deepen (ATT-SHIFT-CATALOG-BE-01)', () => {
  let db: { query: jest.Mock };
  let service: AttendanceCatalogService;

  beforeEach(() => {
    db = { query: jest.fn() };
    service = new AttendanceCatalogService(db as never);
  });

  it('VAL-ATT-SHIFT-CNS-03b: listWorkShifts default hides inactive; include_inactive shows all', async () => {
    const rows = [
      baseShift({ id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', code: 'morning', status: 'active' }),
      baseShift({
        id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        code: 'night',
        name: 'Ca đêm',
        status: 'inactive',
      }),
    ];
    db.query.mockImplementation((sql: string) => {
      if (sql.includes('CREATE TABLE')) {
        return Promise.resolve({ rows: [] } as never);
      }
      if (sql.includes('FROM public.work_shifts') && sql.includes('SELECT id')) {
        const activeOnly = sql.includes(`status = 'active'`);
        return Promise.resolve({
          rows: activeOnly ? rows.filter((r) => r.status === 'active') : rows,
        } as never);
      }
      return Promise.resolve({ rows: [] } as never);
    });

    const activeList = await service.listWorkShifts('main', groupCeoAuth);
    expect(activeList.total).toBe(1);
    expect(activeList.data[0].code).toBe('morning');
    expect(activeList.data[0].name).toBe('Ca sáng');
    expect(activeList.data[0].coefficient).toBe(1);

    const allList = await service.listWorkShifts('main', groupCeoAuth, {
      includeInactive: true,
    });
    expect(allList.total).toBe(2);

    const eff = await service.listEffectiveWorkShifts('main', groupCeoAuth);
    expect(eff.total).toBe(1);
  });

  it('VAL-ATT-SHIFT-CNS-04: deleteWorkShift soft-retires status=inactive; hard=true deletes when no refs', async () => {
    const active = baseShift({ id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', code: 'office' });
    db.query.mockImplementation((sql: string) => {
      if (sql.includes('CREATE TABLE')) {
        return Promise.resolve({ rows: [] } as never);
      }
      if (sql.includes('FROM public.work_shifts WHERE id')) {
        return Promise.resolve({ rows: [active] } as never);
      }
      if (sql.includes('UPDATE public.work_shifts') && sql.includes(`status = 'inactive'`)) {
        return Promise.resolve({
          rows: [{ ...active, status: 'inactive' }],
        } as never);
      }
      if (sql.includes('FROM public.shift_change_requests')) {
        return Promise.resolve({ rows: [{ c: 0 }] } as never);
      }
      if (sql.includes('DELETE FROM public.work_shifts')) {
        return Promise.resolve({ rows: [] } as never);
      }
      return Promise.resolve({ rows: [] } as never);
    });

    const soft = await service.deleteWorkShift(active.id, 'main', groupCeoAuth);
    expect(soft).toMatchObject({
      id: active.id,
      status: 'inactive',
      retired: true,
      hard_deleted: false,
    });
    expect(
      db.query.mock.calls.some(
        ([sql]) =>
          String(sql).includes('UPDATE public.work_shifts') &&
          String(sql).includes(`status = 'inactive'`),
      ),
    ).toBe(true);

    const hard = await service.deleteWorkShift(active.id, 'main', groupCeoAuth, { hard: true });
    expect(hard).toMatchObject({ id: active.id, hard_deleted: true, retired: false });
    expect(
      db.query.mock.calls.some(([sql]) => String(sql).includes('DELETE FROM public.work_shifts')),
    ).toBe(true);
  });

  it('VAL-ATT-SHIFT-CNS-04: hard DELETE blocked when shift_change_requests refs exist', async () => {
    const active = baseShift({ id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', code: 'flexible' });
    db.query.mockImplementation((sql: string) => {
      if (sql.includes('CREATE TABLE')) {
        return Promise.resolve({ rows: [] } as never);
      }
      if (sql.includes('FROM public.work_shifts WHERE id')) {
        return Promise.resolve({ rows: [active] } as never);
      }
      if (sql.includes('FROM public.shift_change_requests')) {
        return Promise.resolve({ rows: [{ c: 2 }] } as never);
      }
      return Promise.resolve({ rows: [] } as never);
    });

    await expect(
      service.deleteWorkShift(active.id, 'main', groupCeoAuth, { hard: true }),
    ).rejects.toMatchObject({ code: 'HRM-WS-VAL', status: HttpStatus.CONFLICT });
  });

  it('VAL-ATT-SHIFT-CNS-01: invent shift key when active>0 → HRM-ATT-SHIFT-KEY', async () => {
    db.query.mockImplementation((sql: string) => {
      if (sql.includes('CREATE TABLE')) {
        return Promise.resolve({ rows: [] } as never);
      }
      if (sql.includes('FROM public.work_shifts') && sql.includes(`status = 'active'`)) {
        return Promise.resolve({
          rows: [baseShift()],
        } as never);
      }
      return Promise.resolve({ rows: [] } as never);
    });

    await expect(
      service.assertShiftKeysForConsumer({
        companyId: 'main',
        currentShift: 'morning',
        requestedShift: 'invent-ghost-shift',
        authorization: groupCeoAuth,
      }),
    ).rejects.toMatchObject({ code: HRM_ATT_SHIFT_KEY });

    expect(HRM_ATT_SHIFT_KEY).toBe('HRM-ATT-SHIFT-KEY');
  });

  it('VAL-ATT-SHIFT-CNS-05: active=0 → invent assert skip', async () => {
    db.query.mockImplementation((sql: string) => {
      if (sql.includes('CREATE TABLE')) {
        return Promise.resolve({ rows: [] } as never);
      }
      if (sql.includes('FROM public.work_shifts')) {
        return Promise.resolve({ rows: [] } as never);
      }
      return Promise.resolve({ rows: [] } as never);
    });

    await expect(
      service.assertShiftKeysForConsumer({
        companyId: 'main',
        currentShift: 'morning',
        requestedShift: 'afternoon',
        authorization: groupCeoAuth,
      }),
    ).resolves.toBeUndefined();
  });

  it('U19 scope_parity: getWorkShiftById uses same scope resolver as list (group CEO main→holding)', async () => {
    const row = baseShift({ company_id: 'holding' });
    db.query.mockImplementation((sql: string) => {
      if (sql.includes('CREATE TABLE')) {
        return Promise.resolve({ rows: [] } as never);
      }
      if (sql.includes('FROM public.work_shifts WHERE id')) {
        return Promise.resolve({ rows: [row] } as never);
      }
      return Promise.resolve({ rows: [] } as never);
    });

    const got = await service.getWorkShiftById(row.id, 'main', groupCeoAuth);
    expect(got.company_id).toBe('holding');
    expect(got.code).toBe('morning');
    expect(got.start_time).toBe('08:00');
  });

  it('U19: getWorkShiftById OOS → HRM-WS-409 (or 404 class)', async () => {
    const row = baseShift({ company_id: 'trsport' });
    db.query.mockImplementation((sql: string) => {
      if (sql.includes('CREATE TABLE')) {
        return Promise.resolve({ rows: [] } as never);
      }
      if (sql.includes('FROM public.work_shifts WHERE id')) {
        return Promise.resolve({ rows: [row] } as never);
      }
      return Promise.resolve({ rows: [] } as never);
    });

    const memberToken = signServiceJwt({
      sub: 'holding.mgr@xe.vn',
      tenantId: 'xevn',
      companyId: 'holding',
      roleCode: 'manager',
    });

    await expect(
      service.getWorkShiftById(row.id, 'holding', `Bearer ${memberToken}`),
    ).rejects.toBeInstanceOf(ApiException);
  });
});
