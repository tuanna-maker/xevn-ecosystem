import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/integrations/hrmApi', () => ({
  createDepartment: vi.fn(),
  deleteDepartment: vi.fn(),
  listDepartments: vi.fn(),
  updateDepartment: vi.fn(),
  upsertSettingsCatalogItem: vi.fn(),
}));

import {
  createDepartment,
  listDepartments,
  updateDepartment,
  upsertSettingsCatalogItem,
} from '@/integrations/hrmApi';
import {
  persistCompanyDepartment,
  resolveHrmDepartmentUuid,
} from '@/lib/companyDepartmentMutate';

const scope = { tenantId: 'xe-vietnam', companyId: 'main' };

describe('resolveHrmDepartmentUuid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns UUID when departmentId is already UUID', async () => {
    const id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    const resolved = await resolveHrmDepartmentUuid(scope, 'main', {
      departmentId: id,
    });
    expect(resolved).toBe(id);
    expect(listDepartments).not.toHaveBeenCalled();
  });

  it('resolves HRM row by catalog code when row id is catalog code', async () => {
    const uuid = 'b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380a22';
    listDepartments.mockResolvedValue({
      data: [{ id: uuid, code: 'phong_dphh', name: 'Phòng DPHH' }],
    });

    const resolved = await resolveHrmDepartmentUuid(scope, 'main', {
      departmentId: 'phong_dphh',
      catalogCode: 'phong_dphh',
    });
    expect(resolved).toBe(uuid);
  });
});

describe('persistCompanyDepartment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    upsertSettingsCatalogItem.mockResolvedValue({});
    updateDepartment.mockResolvedValue({});
    createDepartment.mockResolvedValue({ id: 'new-uuid' });
  });

  it('updates existing HRM row when editing catalog-only id with matching code', async () => {
    const uuid = 'c2ffbc99-9c0b-4ef8-bb6d-6bb9bd380a33';
    listDepartments.mockResolvedValue({
      data: [{ id: uuid, code: 'phong_dphh', name: 'Phòng DPHH' }],
    });

    const result = await persistCompanyDepartment(
      scope,
      { name: 'Phòng Điều Phối Hàng Hóa', code: 'phong_dphh' },
      { departmentId: 'phong_dphh', catalogCode: 'phong_dphh' },
    );

    expect(createDepartment).not.toHaveBeenCalled();
    expect(updateDepartment).toHaveBeenCalledWith(
      uuid,
      'main',
      expect.objectContaining({
        name: 'Phòng Điều Phối Hàng Hóa',
        code: 'phong_dphh',
      }),
      scope,
    );
    expect(result.departmentId).toBe(uuid);
  });

  it('retires previous catalog code when code changes on edit', async () => {
    const uuid = 'd3ffbc99-9c0b-4ef8-bb6d-6bb9bd380a44';
    listDepartments.mockResolvedValue({
      data: [{ id: uuid, code: 'phong_moi', name: 'Phòng mới' }],
    });

    await persistCompanyDepartment(
      scope,
      { name: 'Phòng mới', code: 'phong_moi' },
      {
        departmentId: uuid,
        catalogCode: 'phong_cu',
        previousCatalogCode: 'phong_cu',
      },
    );

    expect(upsertSettingsCatalogItem).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'phong_cu', status: 'draft' }),
      scope,
    );
    expect(upsertSettingsCatalogItem).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'phong_moi', status: 'active' }),
      scope,
    );
  });
});
