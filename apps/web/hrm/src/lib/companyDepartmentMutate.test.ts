import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/integrations/hrmApi', () => ({
  createDepartment: vi.fn(),
  deleteDepartment: vi.fn(),
  updateDepartment: vi.fn(),
}));

import {
  createDepartment,
  deleteDepartment,
  updateDepartment,
} from '@/integrations/hrmApi';
import {
  persistCompanyDepartment,
  removeCompanyDepartment,
} from '@/lib/companyDepartmentMutate';

const scope = { tenantId: 'xe-vietnam', companyId: 'main' };

describe('persistCompanyDepartment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateDepartment.mockResolvedValue({ id: 'uuid-1' });
    createDepartment.mockResolvedValue({ id: 'uuid-new' });
  });

  it('updates via departments API when editing', async () => {
    await persistCompanyDepartment(
      scope,
      { name: 'Phòng Điều Phối Hàng Hóa', code: 'phong_dphh' },
      { departmentId: 'phong_dphh', catalogCode: 'phong_dphh' },
    );

    expect(updateDepartment).toHaveBeenCalledWith(
      'phong_dphh',
      'main',
      expect.objectContaining({
        name: 'Phòng Điều Phối Hàng Hóa',
        code: 'phong_dphh',
        previous_catalog_code: 'phong_dphh',
      }),
      scope,
    );
    expect(createDepartment).not.toHaveBeenCalled();
  });

  it('creates via departments API when adding new department', async () => {
    await persistCompanyDepartment(scope, {
      name: 'Phòng mới',
      code: 'phong_moi',
    });

    expect(createDepartment).toHaveBeenCalledWith(
      expect.objectContaining({
        company_id: 'main',
        name: 'Phòng mới',
        code: 'phong_moi',
        status: 'active',
      }),
      scope,
    );
  });
});

describe('removeCompanyDepartment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    deleteDepartment.mockResolvedValue({ id: 'uuid-1' });
  });

  it('deletes via departments API using row id', async () => {
    await removeCompanyDepartment(scope, {
      id: 'phong_dphh',
      name: 'Phòng DPHH',
      code: 'phong_dphh',
    });

    expect(deleteDepartment).toHaveBeenCalledWith('phong_dphh', 'main', scope);
  });
});
