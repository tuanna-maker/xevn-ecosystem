import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import { HrmAdminService } from './hrm-admin.service';

describe('HrmAdminService', () => {
  let service: HrmAdminService;
  let db: jest.Mocked<HrmDbService>;

  beforeEach(() => {
    db = {
      query: jest.fn(),
      onModuleDestroy: jest.fn(),
    } as unknown as jest.Mocked<HrmDbService>;
    db.query.mockResolvedValue({ rows: [] } as never);
    service = new HrmAdminService(db);
  });

  it('allows group_ceo JWT without platform_admins row', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });
    db.query.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM public.profiles')) {
        return { rows: [] } as never;
      }
      if (sql.includes('INSERT INTO public.profiles')) {
        return { rows: [] } as never;
      }
      if (sql.includes('INSERT INTO public.platform_admins')) {
        return { rows: [] } as never;
      }
      return { rows: [] } as never;
    });

    const result = await service.createPlatformAdmin(`Bearer ${token}`, {
      email: 'admin@xe.vn',
      password: 'secret1234',
      full_name: 'Admin',
    });

    expect(result.success).toBe(true);
    expect(result.user_id).toBeDefined();
    expect(db.query).not.toHaveBeenCalledWith(expect.stringContaining('platform_admins WHERE'), expect.anything());
  });

  it('resetUserPassword updates profiles.password_hash via pg', async () => {
    const token = signServiceJwt({
      sub: 'ceo@xe.vn',
      tenantId: 'xevn',
      companyId: 'main',
      roleCode: 'group_ceo',
    });

    const result = await service.resetUserPassword(`Bearer ${token}`, {
      user_id: '11111111-1111-4111-8111-111111111111',
      new_password: 'newpass123',
    });

    expect(result.success).toBe(true);
    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE public.profiles SET password_hash'),
      expect.arrayContaining(['11111111-1111-4111-8111-111111111111', expect.any(String)]),
    );
  });
});
