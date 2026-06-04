import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { AttendanceService } from './attendance.service';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let db: jest.Mocked<HrmDbService>;

  beforeEach(() => {
    db = {
      query: jest.fn(),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    db.query.mockResolvedValue({ rows: [] } as never);
    const fanout = {
      onUpdateRequestCreated: jest.fn().mockResolvedValue(undefined),
      onUpdateRequestDecided: jest.fn().mockResolvedValue(undefined),
    };
    service = new AttendanceService(db, fanout as never);
  });

  it('BR-ATT-DATE-01: rejects epoch attendance_date on create', async () => {
    await expect(
      service.createRecord({
        company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
        employee_id: 'f76f23f7-3683-4120-81b7-5126ee997b8e',
        attendance_date: '1970-01-01',
      }),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-ATT-DATE-001' });
    const insertCalls = db.query.mock.calls.filter(
      ([sql]) => typeof sql === 'string' && sql.includes('INSERT INTO public.attendance_records'),
    );
    expect(insertCalls).toHaveLength(0);
  });

  it('BR-ATT-DATE-01: omits invalid attendance_date from list response', async () => {
    db.query.mockImplementation((sql: string) => {
      if (sql.includes('SELECT COUNT(*)::text AS total FROM public.attendance_records')) {
        return Promise.resolve({ rows: [{ total: '1' }] } as never);
      }
      if (sql.includes('FROM public.attendance_records') && sql.includes('LIMIT')) {
        return Promise.resolve({
          rows: [
            {
              id: 'r1',
              company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
              employee_id: 'f76f23f7-3683-4120-81b7-5126ee997b8e',
              attendance_date: '1970-01-01',
              check_in_at: null,
              check_out_at: null,
              status: 'present',
              note: null,
              created_by: 'qa',
              created_at: '2026-04-22T00:00:00.000Z',
              updated_at: '2026-04-22T00:00:00.000Z',
            },
          ],
        } as never);
      }
      return Promise.resolve({ rows: [] } as never);
    });

    const result = await service.listRecords({
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      page: 1,
      page_size: 20,
    });

    expect(result.data[0].attendance_date).toBeNull();
  });

  it('throws deterministic create error when insert fails', async () => {
    db.query.mockImplementation((sql: string) => {
      if (sql.includes('INSERT INTO public.attendance_records')) {
        return Promise.reject(new Error('duplicate key') as never);
      }
      return Promise.resolve({ rows: [] } as never);
    });

    await expect(
      service.createRecord({
        company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
        employee_id: 'f76f23f7-3683-4120-81b7-5126ee997b8e',
        attendance_date: '2026-04-22',
      }),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-ATT-001' });
  });

  it('persists createRecord with UUID company_id for group scope company_id=main', async () => {
    db.query.mockImplementation((sql: string) => {
      if (sql.includes('INSERT INTO public.attendance_records')) {
        return Promise.resolve({
          rows: [
            {
              id: 'r-main',
              company_id: '10000000-0000-4000-8000-000000000001',
              employee_id: 'f76f23f7-3683-4120-81b7-5126ee997b8e',
              attendance_date: '2026-04-22',
              check_in_at: null,
              check_out_at: null,
              status: 'present',
              note: null,
              created_by: 'qa',
              created_at: '2026-04-22T00:00:00.000Z',
              updated_at: '2026-04-22T00:00:00.000Z',
            },
          ],
        } as never);
      }
      return Promise.resolve({ rows: [] } as never);
    });
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });

    await service.createRecord(
      {
        company_id: 'main',
        employee_id: 'f76f23f7-3683-4120-81b7-5126ee997b8e',
        attendance_date: '2026-04-22',
      },
      `Bearer ${token}`,
      'xevn',
    );

    const insertCall = db.query.mock.calls.find((c) => String(c[0]).includes('INSERT INTO public.attendance_records'));
    expect(String(insertCall?.[0])).toContain('$2::uuid');
    expect(insertCall?.[1]?.[1]).toBe('10000000-0000-4000-8000-000000000001');
  });

  it('throws deterministic not found when updating missing record (HRM-AT-03)', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never);

    await expect(
      service.updateStatus(
        'f76f23f7-3683-4120-81b7-5126ee997b8e',
        { status: 'present' },
        '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      ),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-ATT-404' });
  });

  it('HRM-AT-02: returns paginated records with deterministic filters', async () => {
    db.query.mockImplementation((sql: string) => {
      if (sql.includes('SELECT COUNT(*)::text AS total FROM public.attendance_records')) {
        return Promise.resolve({ rows: [{ total: '1' }] } as never);
      }
      if (sql.includes('FROM public.attendance_records') && sql.includes('LIMIT')) {
        return Promise.resolve({
          rows: [
            {
              id: 'r1',
              company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
              employee_id: 'f76f23f7-3683-4120-81b7-5126ee997b8e',
              attendance_date: '2026-04-22',
              check_in_at: null,
              check_out_at: null,
              status: 'present',
              note: null,
              created_by: 'qa',
              created_at: '2026-04-22T00:00:00.000Z',
              updated_at: '2026-04-22T00:00:00.000Z',
            },
          ],
        } as never);
      }
      return Promise.resolve({ rows: [] } as never);
    });

    const result = await service.listRecords({
      company_id: '78b8a663-f5e5-4f4d-a020-b8f950ec2037',
      employee_id: 'f76f23f7-3683-4120-81b7-5126ee997b8e',
      status: 'present',
      from_date: '2026-04-01',
      to_date: '2026-04-30',
      page: 2,
      page_size: 10,
    });

    expect(result.total).toBe(1);
    expect(result.page).toBe(2);
    expect(result.page_size).toBe(10);
    expect(result.data[0]).toMatchObject({ id: 'r1', status: 'present' });
    expect(db.query).toHaveBeenLastCalledWith(expect.stringContaining('LIMIT $6 OFFSET $7'), expect.any(Array));
  });

  it('HRM-AT-05: listUpdateRequests uses workforce scope for internal key on company_id=main with tenant xevn', async () => {
    db.query.mockImplementation((sql: string) => {
      if (sql.includes('SELECT aur.*')) {
        return Promise.resolve({ rows: [{ id: 'ur-1' }] } as never);
      }
      return Promise.resolve({ rows: [] } as never);
    });
    const out = await service.listUpdateRequests({ company_id: 'main' }, undefined, 'xevn');
    const [sql] = db.query.mock.calls.find((c) => String(c[0]).includes('SELECT aur.*')) ?? [];
    expect(String(sql)).toContain('employee_id IN');
    expect(String(sql)).not.toContain('aur.company_id = $1::uuid');
    expect(out.total).toBe(1);
  });

  it('listUpdateRequests uses workforce scope for group CEO on company_id=main', async () => {
    db.query.mockImplementation((sql: string) => {
      if (sql.includes('SELECT aur.*')) {
        return Promise.resolve({ rows: [{ id: 'ur-1' }] } as never);
      }
      return Promise.resolve({ rows: [] } as never);
    });
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const out = await service.listUpdateRequests({ company_id: 'main' }, `Bearer ${token}`, 'xevn');
    const [sql] = db.query.mock.calls.find((c) => String(c[0]).includes('SELECT aur.*')) ?? [];
    expect(String(sql)).toContain('employee_id IN');
    expect(String(sql)).not.toContain('aur.company_id = $1::uuid');
    expect(out.total).toBe(1);
  });

  it('listUpdateRequests uses TEXT company_id for member CEO UUID + manager filter (P1-MOB-APK-01-BE-02)', async () => {
    const companyUuid = '7b626710-02eb-4a39-89c5-e9a90ecc74ff';
    const managerId = 'c4d59b81-b7ce-4e75-8c6d-856d5acfd02c';
    db.query.mockImplementation((sql: string) => {
      if (sql.includes('SELECT aur.*')) {
        return Promise.resolve({ rows: [] } as never);
      }
      return Promise.resolve({ rows: [] } as never);
    });
    const token = signServiceJwt({
      sub: 'du-lich.ceo@xe.vn',
      tenantId: 'xe-du-lich',
      companyId: 'main',
      roleCode: 'member_ceo',
    });
    const out = await service.listUpdateRequests(
      { company_id: companyUuid, status: 'pending', manager_employee_id: managerId },
      `Bearer ${token}`,
      'xe-du-lich',
    );
    const [sql, params] = db.query.mock.calls.find((c) => String(c[0]).includes('SELECT aur.*')) ?? [];
    expect(String(sql)).toContain('aur.company_id = $1::text');
    expect(String(sql)).not.toMatch(/aur\.company_id = \$\d+::uuid/);
    expect(String(sql)).toContain('e.manager_id');
    expect(params?.[0]).toBe(companyUuid);
    expect(out.total).toBe(0);
  });

  it('listRecords uses workforce scope for group CEO on company_id=main (P1-R1-BE-01)', async () => {
    db.query.mockImplementation((sql: string) => {
      if (sql.includes('SELECT COUNT(*)::text AS total FROM public.attendance_records')) {
        return Promise.resolve({ rows: [{ total: '0' }] } as never);
      }
      if (sql.includes('FROM public.attendance_records') && sql.includes('LIMIT')) {
        return Promise.resolve({ rows: [] } as never);
      }
      return Promise.resolve({ rows: [] } as never);
    });
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    await service.listRecords({ company_id: 'main', page: 1, page_size: 20 }, `Bearer ${token}`, {
      tenantId: 'xevn',
    });
    const listSql =
      db.query.mock.calls.find(
        (c) => String(c[0]).includes('FROM public.attendance_records') && String(c[0]).includes('LIMIT'),
      )?.[0] ?? '';
    expect(String(listSql)).toContain('employee_id IN');
    expect(String(listSql)).not.toContain('company_id = $1::uuid');
  });

  it('rejects updateStatus when row company_id is outside rollup scope (P1-R1-BE-02)', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.attendance_records WHERE id')) {
        return { rows: [{ company_id: 'other-co' }] } as never;
      }
      return { rows: [] } as never;
    });

    await expect(
      service.updateStatus(
        'f76f23f7-3683-4120-81b7-5126ee997b8e',
        { status: 'present' },
        'main',
        `Bearer ${token}`,
        'xevn',
      ),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-ATT-409' });

    const mutateCalls = db.query.mock.calls.filter(
      ([sql]) => typeof sql === 'string' && sql.includes('UPDATE public.attendance_records'),
    );
    expect(mutateCalls).toHaveLength(0);
  });

  it('HRM-AT-07: rejects approveUpdateRequest when row company_id is outside rollup scope (P1-R1-BE-02)', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.attendance_update_requests WHERE id')) {
        return { rows: [{ company_id: 'other-co' }] } as never;
      }
      return { rows: [] } as never;
    });

    await expect(
      service.approveUpdateRequest(
        '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
        { approver_name: 'HR' },
        'main',
        `Bearer ${token}`,
        'xevn',
      ),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-ATT-REQ-409' });

    const mutateCalls = db.query.mock.calls.filter(
      ([sql]) => typeof sql === 'string' && sql.includes('UPDATE public.attendance_update_requests'),
    );
    expect(mutateCalls).toHaveLength(0);
  });

  it('persists createUpdateRequest with UUID company_id for group scope company_id=main', async () => {
    db.query.mockImplementation((sql: string) => {
      if (sql.includes('INSERT INTO public.attendance_update_requests')) {
        return Promise.resolve({
          rows: [
            {
              id: 'u-main',
              company_id: '10000000-0000-4000-8000-000000000001',
              employee_id: 'f76f23f7-3683-4120-81b7-5126ee997b8e',
              employee_code: 'E001',
              employee_name: 'Nguyen Van A',
              department: null,
              position: null,
              attendance_date: '2026-04-22',
              update_type: 'check_in',
              current_check_in: null,
              current_check_out: null,
              requested_check_in: '2026-04-22T08:00:00.000Z',
              requested_check_out: null,
              reason: 'Missing punch',
              evidence_url: null,
              approver_name: null,
              status: 'pending',
              approved_at: null,
              rejected_reason: null,
              notes: null,
              created_at: '2026-04-22T00:00:00.000Z',
              updated_at: '2026-04-22T00:00:00.000Z',
            },
          ],
        } as never);
      }
      return Promise.resolve({ rows: [] } as never);
    });
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });

    await service.createUpdateRequest(
      {
        company_id: 'main',
        employee_id: 'f76f23f7-3683-4120-81b7-5126ee997b8e',
        employee_code: 'E001',
        employee_name: 'Nguyen Van A',
        attendance_date: '2026-04-22',
        update_type: 'check_in',
        requested_check_in: '2026-04-22T08:00:00.000Z',
        reason: 'Missing punch',
      },
      `Bearer ${token}`,
      'xevn',
    );

    const insertCall = db.query.mock.calls.find((c) =>
      String(c[0]).includes('INSERT INTO public.attendance_update_requests'),
    );
    expect(String(insertCall?.[0])).toContain('$2::uuid');
    expect(insertCall?.[1]?.[1]).toBe('10000000-0000-4000-8000-000000000001');
  });
});
