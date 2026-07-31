import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { EmployeesService } from './employees.service';

describe('EmployeesService', () => {
  let service: EmployeesService;
  let db: jest.Mocked<HrmDbService>;

  beforeEach(() => {
    db = {
      query: jest.fn(),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    db.query.mockResolvedValue({ rows: [] } as never);
    service = new EmployeesService(db);
  });

  it('P1-PHASE1-BE-EMP-CREATE-PARITY-01: group CEO create persists holding + xevn tenant', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const createdRow = {
      id: 'a04b56cb-f155-4108-9969-89c5f7fe4976',
      company_id: 'holding',
      employee_code: 'MEMEMP01',
      email: 'qa.group@xe.vn',
      full_name: 'QA Group Employee',
      job_title_key: null,
      manager_id: null,
      status: 'active',
      hired_at: null,
      archived_at: null,
      avatar_url: null,
      custom_fields: { tenant_id: 'xevn' },
      created_at: '2026-06-04T00:00:00.000Z',
      updated_at: '2026-06-04T00:00:00.000Z',
    };
    db.query.mockResolvedValueOnce({ rows: [createdRow] } as never);

    const result = await service.createEmployee(
      {
        company_id: 'main',
        employee_code: 'MEMEMP01',
        email: 'qa.group@xe.vn',
        full_name: 'QA Group Employee',
      },
      `Bearer ${token}`,
      { tenantId: 'xevn' },
    );

    expect(result.company_id).toBe('holding');
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO public.employees'),
      expect.arrayContaining([
        expect.any(String),
        'holding',
        'MEMEMP01',
        'qa.group@xe.vn',
        'QA Group Employee',
        null,
        null,
        null,
        JSON.stringify({ tenant_id: 'xevn' }),
      ]),
    );
  });

  it('P1-PHASE1-BE-EMP-CREATE-PARITY-01: member CEO create persists main + member tenant', async () => {
    const token = signServiceJwt({
      sub: 'du-lich.ceo@xe.vn',
      tenantId: 'xe-du-lich',
      companyId: 'main',
      roleCode: 'subsidiary_ceo',
    });
    const createdRow = {
      id: 'b14b56cb-f155-4108-9969-89c5f7fe4977',
      company_id: 'main',
      employee_code: 'MEMEMP02',
      email: 'qa.mem@xe-du-lich.local',
      full_name: 'QA Member Employee',
      job_title_key: null,
      manager_id: null,
      status: 'active',
      hired_at: null,
      archived_at: null,
      avatar_url: null,
      custom_fields: { tenant_id: 'xe-du-lich' },
      created_at: '2026-06-04T00:00:00.000Z',
      updated_at: '2026-06-04T00:00:00.000Z',
    };
    db.query.mockResolvedValueOnce({ rows: [createdRow] } as never);

    const result = await service.createEmployee(
      {
        company_id: 'main',
        employee_code: 'MEMEMP02',
        email: 'qa.mem@xe-du-lich.local',
        full_name: 'QA Member Employee',
      },
      `Bearer ${token}`,
      { tenantId: 'xe-du-lich' },
    );

    expect(result.company_id).toBe('main');
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO public.employees'),
      expect.arrayContaining([
        expect.any(String),
        'main',
        'MEMEMP02',
        'qa.mem@xe-du-lich.local',
        'QA Member Employee',
        null,
        null,
        null,
        JSON.stringify({ tenant_id: 'xe-du-lich' }),
      ]),
    );
  });

  it('throws deterministic update error for empty payload', async () => {
    const row = {
      id: '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
      company_id: 'holding',
      employee_code: 'NV001',
      email: 'ceo@xe.vn',
      full_name: 'Nguyen Van A',
      job_title_key: 'CEO',
      manager_id: null,
      status: 'active',
      hired_at: '2024-01-01',
      archived_at: null,
      avatar_url: null,
      custom_fields: {},
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    };
    db.query.mockResolvedValueOnce({ rows: [row] } as never);

    await expect(
      service.updateEmployee('633e95b7-cf1b-469f-a0f8-4c91f3f35f80', {}, 'holding'),
    ).rejects.toMatchObject<ApiException>({
      code: 'HRM-EMP-002',
    });
  });

  it('returns employee scoped by company_id', async () => {
    const row = {
      id: '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
      company_id: 'holding',
      employee_code: 'NV001',
      email: 'ceo@xe.vn',
      full_name: 'Nguyen Van A',
      job_title_key: 'CEO',
      manager_id: null,
      status: 'active',
      hired_at: '2024-01-01',
      archived_at: null,
      avatar_url: null,
      custom_fields: {},
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    };
    db.query.mockResolvedValueOnce({ rows: [row] } as never);

    const result = await service.getEmployeeById(row.id, { company_id: 'holding' });
    expect(result.id).toBe(row.id);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('company_id = $2::text'),
      [row.id, 'holding'],
    );
  });

  it('finds employee with blank tenant_id when group CEO requests company_id=main (UAT legacy rows)', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const row = {
      id: '8d846eb9-fcf7-4fe3-8987-24c503d80ce3',
      company_id: 'holding',
      employee_code: 'NV002',
      email: 'legacy@xe.vn',
      full_name: 'Legacy Row',
      job_title_key: 'STAFF',
      manager_id: null,
      status: 'active',
      hired_at: '2024-01-01',
      archived_at: null,
      custom_fields: { tenant_id: '' },
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    };
    db.query.mockResolvedValueOnce({ rows: [row] } as never);

    const result = await service.getEmployeeById(
      row.id,
      { company_id: 'main' },
      `Bearer ${token}`,
      { tenantId: 'xevn' },
    );
    expect(result.id).toBe(row.id);
  });

  it('finds employee under holding when group CEO requests company_id=main (ADR scope rollup)', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const row = {
      id: '633e95b7-cf1b-469f-a0f8-4c91f3f35f80',
      company_id: 'holding',
      employee_code: 'NV001',
      email: 'ceo@xe.vn',
      full_name: 'Nguyen Van A',
      job_title_key: 'CEO',
      manager_id: null,
      status: 'active',
      hired_at: '2024-01-01',
      archived_at: null,
      avatar_url: null,
      custom_fields: { tenant_id: 'xevn' },
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    };
    db.query.mockResolvedValueOnce({ rows: [row] } as never);

    const result = await service.getEmployeeById(
      row.id,
      { company_id: 'main' },
      `Bearer ${token}`,
    );
    expect(result.id).toBe(row.id);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('company_id = ANY'),
      expect.arrayContaining([row.id, expect.any(Array)]),
    );
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('NULLIF(TRIM(custom_fields'),
      expect.arrayContaining(['xevn']),
    );
  });

  it('throws deterministic not-found for get-by-id', async () => {
    db.query.mockResolvedValueOnce({ rows: [] } as never);
    await expect(
      service.getEmployeeById('633e95b7-cf1b-469f-a0f8-4c91f3f35f80', { company_id: 'holding' }),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-EMP-404' });
  });

  it('throws deterministic archive error when employee missing', async () => {
    db.query
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never)
      .mockResolvedValueOnce({ rows: [] } as never);

    await expect(
      service.archiveEmployee('633e95b7-cf1b-469f-a0f8-4c91f3f35f80', 'holding'),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-EMP-404' });
  });

  it('P1-PHASE1-BE-SCOPE-P0-S5-01: restore holding archived employee under company_id=main', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    const employeeId = '633e95b7-cf1b-469f-a0f8-4c91f3f35f80';
    const archivedRow = {
      id: employeeId,
      company_id: 'holding',
      employee_code: 'EMP01',
      email: 'archived@xe.vn',
      full_name: 'Archived Employee',
      job_title_key: null,
      manager_id: null,
      status: 'inactive',
      hired_at: '2024-01-01',
      archived_at: '2026-01-01T00:00:00.000Z',
      custom_fields: { tenant_id: 'xevn' },
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    };
    const restoredRow = { ...archivedRow, archived_at: null, status: 'active' };
    db.query
      .mockResolvedValueOnce({ rows: [archivedRow] } as never)
      .mockResolvedValueOnce({ rows: [restoredRow] } as never);

    const result = await service.restoreEmployee(employeeId, 'main', `Bearer ${token}`, { tenantId: 'xevn' });
    expect(result.id).toBe(employeeId);
    expect(result.archived_at).toBeNull();
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('company_id = ANY'),
      expect.arrayContaining([employeeId, expect.any(Array)]),
    );
  });

  it('P1-PHASE1-BE-SCOPE-P0-S5-01: restore rejects out-of-scope employee id', async () => {
    db.query.mockResolvedValueOnce({ rows: [] } as never).mockResolvedValueOnce({ rows: [] } as never);

    await expect(
      service.restoreEmployee('633e95b7-cf1b-469f-a0f8-4c91f3f35f80', 'holding'),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-EMP-404' });
  });

  it('P1-PHASE1-BE-SCOPE-P0-S5-02: member CEO restore rejects holding/xevn archived employee', async () => {
    const token = signServiceJwt({
      sub: 'du-lich.ceo@xe.vn',
      tenantId: 'xe-du-lich',
      companyId: 'main',
      roleCode: 'company_ceo',
    });
    const employeeId = '633e95b7-cf1b-469f-a0f8-4c91f3f35f80';
    db.query.mockResolvedValueOnce({ rows: [] } as never);

    await expect(
      service.restoreEmployee(employeeId, 'main', `Bearer ${token}`, { tenantId: 'xe-du-lich' }),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-EMP-404' });
  });

  it('P1-PHASE1-BE-SCOPE-P0-S5-02: member CEO restore rejects cross-partition row if loaded', async () => {
    const token = signServiceJwt({
      sub: 'du-lich.ceo@xe.vn',
      tenantId: 'xe-du-lich',
      companyId: 'main',
      roleCode: 'company_ceo',
    });
    const employeeId = '633e95b7-cf1b-469f-a0f8-4c91f3f35f80';
    const archivedRow = {
      id: employeeId,
      company_id: 'holding',
      employee_code: 'EMP01',
      email: 'archived@xe.vn',
      full_name: 'Archived Employee',
      job_title_key: null,
      manager_id: null,
      status: 'inactive',
      hired_at: '2024-01-01',
      archived_at: '2026-01-01T00:00:00.000Z',
      custom_fields: { tenant_id: 'xevn' },
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    };
    db.query.mockResolvedValueOnce({ rows: [archivedRow] } as never);

    await expect(
      service.restoreEmployee(employeeId, 'main', `Bearer ${token}`, { tenantId: 'xe-du-lich' }),
    ).rejects.toMatchObject<ApiException>({ code: 'HRM-EMP-409' });
  });

  describe('MOB-W7-5-DIRECTORY-BE', () => {
    const directoryRow = {
      id: '11111111-1111-4111-8111-111111111111',
      company_id: 'holding',
      employee_code: 'NV1001',
      email: 'nguyen.van.uat@xe.vn',
      full_name: 'Nguyễn Văn UAT',
      job_title_key: 'STAFF',
      manager_id: null,
      status: 'active',
      hired_at: '2024-01-01',
      archived_at: null,
      avatar_url: '/api/hrm/files/holding/avatar.jpg',
      custom_fields: { department: 'Vận hành', tenant_id: 'xevn' },
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    };

    it('VAL-W7-DIR-02: listEmployeeDirectory applies q search with scope filters', async () => {
      const token = signServiceJwt({
        sub: 'ceo@xe.vn',
        tenantId: 'xevn',
        companyId: 'main',
        roleCode: 'group_ceo',
      });
      db.query.mockResolvedValueOnce({
        rows: [{ ...directoryRow, list_total: '1' }],
      } as never);

      const result = await service.listEmployeeDirectory(
        { company_id: 'main', view: 'directory', q: 'nguyen', page: 1, page_size: 30 },
        `Bearer ${token}`,
        { tenantId: 'xevn' },
      );

      expect(result.data[0]?.full_name).toBe('Nguyễn Văn UAT');
      expect(result.data[0]).not.toHaveProperty('email');
      expect(result.data[0]).not.toHaveProperty('custom_fields');
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        expect.arrayContaining(['%nguyen%']),
      );
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('company_id = ANY'),
        expect.any(Array),
      );
    });

    it('VAL-W7-DIR-01: getEmployeeDirectoryById finds holding employee under company_id=main', async () => {
      const token = signServiceJwt({
        sub: 'ceo@xe.vn',
        tenantId: 'xevn',
        companyId: 'main',
        roleCode: 'group_ceo',
      });
      db.query.mockResolvedValueOnce({ rows: [directoryRow] } as never);

      const result = await service.getEmployeeDirectoryById(
        directoryRow.id,
        { company_id: 'main', view: 'directory' },
        `Bearer ${token}`,
        { tenantId: 'xevn' },
      );

      expect(result.id).toBe(directoryRow.id);
      expect(result.department).toBe('Vận hành');
      expect(result).not.toHaveProperty('custom_fields');
      expect(result).not.toHaveProperty('date_of_birth');
    });

    it('listEmployeeDirectory loads attendance_today when include_attendance_today=true', async () => {
      db.query
        .mockResolvedValueOnce({ rows: [{ ...directoryRow, list_total: '1' }] } as never)
        .mockResolvedValueOnce({
          rows: [
            {
              employee_id: directoryRow.id,
              check_in_at: '2026-06-09T01:00:00.000Z',
              status: 'present',
            },
          ],
        } as never);

      const result = await service.listEmployeeDirectory({
        company_id: 'holding',
        view: 'directory',
        include_attendance_today: true,
        page: 1,
        page_size: 30,
      });

      expect(result.data[0]?.attendance_today).toEqual({
        checked_in: true,
        check_in_at: '2026-06-09T01:00:00.000Z',
        status: 'present',
      });
    });
  });

  describe('PCOMP-W4-PROFILE-AVATAR-01-BE', () => {
    const employeeId = '11111111-1111-4111-8111-111111111111';
    const avatarUrl = '/api/hrm/files/holding/uat-avatar.jpg';

    const baseRow = {
      id: employeeId,
      company_id: 'holding',
      employee_code: 'NVUAT01',
      email: 'uat.nv0001@xe.vn',
      full_name: 'UAT Employee',
      job_title_key: 'STAFF',
      manager_id: null,
      status: 'active',
      hired_at: '2024-01-01',
      archived_at: null,
      avatar_url: null,
      custom_fields: { tenant_id: 'xevn' },
      created_at: '2024-01-01T00:00:00.000Z',
      updated_at: '2024-01-01T00:00:00.000Z',
    };

    it('self PATCH avatar_url persists and returns URL', async () => {
      const token = signServiceJwt({
        sub: 'uat.nv0001@xe.vn',
        tenantId: 'xevn',
        companyId: 'holding',
        employee_id: employeeId,
        roles: ['employee'],
      });
      const updatedRow = { ...baseRow, avatar_url: avatarUrl, updated_at: '2026-06-07T00:00:00.000Z' };
      db.query
        .mockResolvedValueOnce({ rows: [baseRow] } as never)
        .mockResolvedValueOnce({ rows: [updatedRow] } as never);

      const result = await service.updateEmployee(
        employeeId,
        { avatar_url: avatarUrl },
        'holding',
        `Bearer ${token}`,
      );

      expect(result.avatar_url).toBe(avatarUrl);
      expect(db.query).toHaveBeenLastCalledWith(
        expect.stringContaining('avatar_url = $1'),
        expect.arrayContaining([avatarUrl, employeeId]),
      );
    });

    it('self PATCH full_name is forbidden', async () => {
      const token = signServiceJwt({
        sub: 'uat.nv0001@xe.vn',
        tenantId: 'xevn',
        companyId: 'holding',
        employee_id: employeeId,
        roles: ['employee'],
      });

      await expect(
        service.updateEmployee(employeeId, { full_name: 'Hacked' }, 'holding', `Bearer ${token}`),
      ).rejects.toMatchObject<ApiException>({ code: 'HRM-EMP-403' });
    });

    it('AC-ESS-01: self PATCH custom_fields phone merges and preserves HR keys', async () => {
      const token = signServiceJwt({
        sub: 'uat.nv0001@xe.vn',
        tenantId: 'xevn',
        companyId: 'holding',
        employee_id: employeeId,
        roles: ['employee'],
      });
      const existingRow = {
        ...baseRow,
        custom_fields: {
          tenant_id: 'xevn',
          gender: 'male',
          phone_number: '0901234567',
          salary: '12000000',
        },
      };
      const updatedRow = {
        ...existingRow,
        custom_fields: {
          tenant_id: 'xevn',
          gender: 'male',
          phone_number: '0911111111',
          work_phone: '0287654321',
          salary: '12000000',
        },
        updated_at: '2026-07-19T00:00:00.000Z',
      };
      db.query
        .mockResolvedValueOnce({ rows: [existingRow] } as never)
        .mockResolvedValueOnce({ rows: [updatedRow] } as never);

      const result = await service.updateEmployee(
        employeeId,
        {
          custom_fields: {
            phone_number: '0911111111',
            work_phone: '0287654321',
            gender: 'female',
            salary: '1',
            tenant_id: 'hacked',
          },
        },
        'holding',
        `Bearer ${token}`,
      );

      expect(result.custom_fields).toEqual(updatedRow.custom_fields);
      const lastCall = db.query.mock.calls[db.query.mock.calls.length - 1];
      expect(String(lastCall?.[0])).toContain('custom_fields = $1::jsonb');
      expect(JSON.parse(String(lastCall?.[1]?.[0]))).toEqual({
        tenant_id: 'xevn',
        gender: 'male',
        phone_number: '0911111111',
        work_phone: '0287654321',
        salary: '12000000',
      });
      expect(lastCall?.[1]?.[1]).toBe(employeeId);
    });

    it('self PATCH custom_fields without phone keys is forbidden', async () => {
      const token = signServiceJwt({
        sub: 'uat.nv0001@xe.vn',
        tenantId: 'xevn',
        companyId: 'holding',
        employee_id: employeeId,
        roles: ['employee'],
      });

      await expect(
        service.updateEmployee(
          employeeId,
          { custom_fields: { gender: 'female' } },
          'holding',
          `Bearer ${token}`,
        ),
      ).rejects.toMatchObject<ApiException>({ code: 'HRM-EMP-403' });
    });

    it('Option A R1: manager|hr_manager self full_name + gender-only → 403; phone merges', async () => {
      const token = signServiceJwt({
        sub: 'uat.nv0001@xe.vn',
        tenantId: 'xevn',
        companyId: 'holding',
        employee_id: employeeId,
        roles: ['employee', 'manager', 'hr_manager'],
      });

      await expect(
        service.updateEmployee(employeeId, { full_name: 'SHOULD_NOT_APPLY' }, 'holding', `Bearer ${token}`),
      ).rejects.toMatchObject<ApiException>({ code: 'HRM-EMP-403' });

      await expect(
        service.updateEmployee(
          employeeId,
          { custom_fields: { gender: 'female' } },
          'holding',
          `Bearer ${token}`,
        ),
      ).rejects.toMatchObject<ApiException>({ code: 'HRM-EMP-403' });

      const existingRow = {
        ...baseRow,
        custom_fields: {
          tenant_id: 'xevn',
          gender: 'Nữ',
          phone_number: '0901234567',
          grade: 'G5',
        },
      };
      const updatedRow = {
        ...existingRow,
        custom_fields: {
          tenant_id: 'xevn',
          gender: 'Nữ',
          phone_number: '0912222333',
          work_phone: '0281111222',
          grade: 'G5',
        },
        updated_at: '2026-07-19T12:00:00.000Z',
      };
      db.query
        .mockResolvedValueOnce({ rows: [existingRow] } as never)
        .mockResolvedValueOnce({ rows: [updatedRow] } as never);

      const result = await service.updateEmployee(
        employeeId,
        {
          custom_fields: {
            phone_number: '0912222333',
            work_phone: '0281111222',
            gender: 'female',
          },
        },
        'holding',
        `Bearer ${token}`,
      );

      expect(result.custom_fields?.gender).toBe('Nữ');
      const lastCall = db.query.mock.calls[db.query.mock.calls.length - 1];
      expect(JSON.parse(String(lastCall?.[1]?.[0]))).toEqual({
        tenant_id: 'xevn',
        gender: 'Nữ',
        phone_number: '0912222333',
        work_phone: '0281111222',
        grade: 'G5',
      });
    });

    it('listEmployees returns avatar_url in data rows', async () => {
      const rowWithAvatar = { ...baseRow, avatar_url: avatarUrl, list_total: '1' };
      db.query.mockResolvedValueOnce({ rows: [rowWithAvatar] } as never);

      const result = await service.listEmployees({ company_id: 'holding', page: 1, page_size: 20 });

      expect(result.data[0]?.avatar_url).toBe(avatarUrl);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('avatar_url'),
        expect.any(Array),
      );
    });

    it('getEmployeeById returns avatar_url', async () => {
      const rowWithAvatar = { ...baseRow, avatar_url: avatarUrl };
      db.query.mockResolvedValueOnce({ rows: [rowWithAvatar] } as never);

      const result = await service.getEmployeeById(employeeId, { company_id: 'holding' });

      expect(result.avatar_url).toBe(avatarUrl);
    });
  });
});
