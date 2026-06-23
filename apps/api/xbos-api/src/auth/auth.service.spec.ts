import { createHash } from 'node:crypto';
import { HttpStatus } from '@nestjs/common';
import { AuthService, PORTAL_LOGIN_JWT_TTL_DEFAULT_SEC, resolvePortalLoginJwtTtlSec } from './auth.service';
import { ApiException } from '../common/api.exception';
import { XbosDbService } from '../db/xbos-db.service';
import { TenantScopeService } from '../tenant-scope/tenant-scope.service';
import { PILOT_PORTAL_DEV_PASSWORD } from './pilot-portal-users.constants';

jest.mock('./pilot-membership.bootstrap', () => ({
  ...jest.requireActual('./pilot-membership.bootstrap'),
  ensurePilotMembershipForUser: jest.fn().mockResolvedValue(undefined),
  ensureAllPilotMemberships: jest.fn().mockResolvedValue(undefined),
}));

const DEV_PASSWORD = PILOT_PORTAL_DEV_PASSWORD;

function hashPassword(userId: string, password: string): string {
  return createHash('sha256')
    .update(`${userId}:${password}:xevn-portal-dev`)
    .digest('hex');
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  const part = token.split('.')[1];
  const padded = part.replace(/-/g, '+').replace(/_/g, '/');
  const json = Buffer.from(padded, 'base64').toString('utf8');
  return JSON.parse(json) as Record<string, unknown>;
}

describe('AuthService portal login JWT TTL', () => {
  const db = { query: jest.fn() } as unknown as XbosDbService;
  const tenantScope = { listAccessible: jest.fn() } as unknown as TenantScopeService;
  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(db, tenantScope);
  });

  it('returns expiresInSec 86400 and JWT exp aligned with 24h TTL', async () => {
    const userId = 'ceo@xe.vn';
    (db.query as jest.Mock).mockResolvedValueOnce({
      rows: [
        {
          user_id: userId,
          display_name: 'CEO Tập đoàn',
          password_hash: hashPassword(userId, DEV_PASSWORD),
          status: 'active',
        },
      ],
    });
    (tenantScope.listAccessible as jest.Mock).mockResolvedValueOnce([
      { tenantId: 'xevn', companyId: 'holding', roleCode: 'ceo_group' },
    ]);

    const result = await service.login(userId, DEV_PASSWORD);

    expect(result.expiresInSec).toBe(86400);
    expect(PORTAL_LOGIN_JWT_TTL_DEFAULT_SEC).toBe(86400);
    expect(resolvePortalLoginJwtTtlSec()).toBe(86400);
    const payload = decodeJwtPayload(result.accessToken);
    expect(payload.exp as number - (payload.iat as number)).toBe(86400);
  });

  it('UF-HRM-09/13: du-lich.hr@xe.vn login returns member HRBP JWT scope', async () => {
    const userId = 'du-lich.hr@xe.vn';
    (db.query as jest.Mock).mockResolvedValueOnce({
      rows: [
        {
          user_id: userId,
          display_name: 'HR Du lịch XeVN (HRBP)',
          password_hash: hashPassword(userId, DEV_PASSWORD),
          status: 'active',
        },
      ],
    });
    (tenantScope.listAccessible as jest.Mock).mockResolvedValueOnce([
      { tenantId: 'xe-du-lich', companyId: 'main', roleCode: 'HRBP_MANAGER' },
    ]);

    const result = await service.login(userId, DEV_PASSWORD);

    expect(result.accessToken).toBeTruthy();
    expect(result.defaultTenantId).toBe('xe-du-lich');
    expect(result.defaultCompanyId).toBe('main');
    const payload = decodeJwtPayload(result.accessToken);
    expect(payload.tenantId).toBe('xe-du-lich');
    expect(payload.roleCode).toBe('HRBP_MANAGER');
  });

  it('UF-HRM-13: du-lich.ceo@xe.vn login returns subsidiary_ceo JWT', async () => {
    const userId = 'du-lich.ceo@xe.vn';
    (db.query as jest.Mock).mockResolvedValueOnce({
      rows: [
        {
          user_id: userId,
          display_name: 'CEO Du lịch XeVN',
          password_hash: hashPassword(userId, DEV_PASSWORD),
          status: 'active',
        },
      ],
    });
    (tenantScope.listAccessible as jest.Mock).mockResolvedValueOnce([
      { tenantId: 'xe-du-lich', companyId: 'main', roleCode: 'subsidiary_ceo' },
    ]);

    const result = await service.login(userId, DEV_PASSWORD);

    expect(result.defaultTenantId).toBe('xe-du-lich');
    const payload = decodeJwtPayload(result.accessToken);
    expect(payload.roleCode).toBe('subsidiary_ceo');
  });

  it('normalizes email case before password hash compare', async () => {
    const userId = 'du-lich.hr@xe.vn';
    (db.query as jest.Mock).mockResolvedValueOnce({
      rows: [
        {
          user_id: userId,
          display_name: 'HR',
          password_hash: hashPassword(userId, DEV_PASSWORD),
          status: 'active',
        },
      ],
    });
    (tenantScope.listAccessible as jest.Mock).mockResolvedValueOnce([
      { tenantId: 'xe-du-lich', companyId: 'main', roleCode: 'HRBP_MANAGER' },
    ]);

    await expect(service.login('DU-LICH.HR@XE.VN', DEV_PASSWORD)).resolves.toMatchObject({
      user: { userId },
    });
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining('xbos_portal_user'), [userId]);
  });

  it('XBOS-AUTH-401 when portal user missing or inactive', async () => {
    (db.query as jest.Mock).mockResolvedValueOnce({ rows: [] });
    await expect(service.login('du-lich.hr@xe.vn', DEV_PASSWORD)).rejects.toMatchObject<ApiException>({
      code: 'XBOS-AUTH-401',
      status: HttpStatus.UNAUTHORIZED,
    });
  });

  it('XBOS-AUTH-403 when portal user has no tenant membership', async () => {
    const userId = 'du-lich.hr@xe.vn';
    (db.query as jest.Mock).mockResolvedValueOnce({
      rows: [
        {
          user_id: userId,
          display_name: 'HR',
          password_hash: hashPassword(userId, DEV_PASSWORD),
          status: 'active',
        },
      ],
    });
    (tenantScope.listAccessible as jest.Mock).mockResolvedValueOnce([]);

    await expect(service.login(userId, DEV_PASSWORD)).rejects.toMatchObject<ApiException>({
      code: 'XBOS-AUTH-403',
      status: HttpStatus.FORBIDDEN,
    });
  });
});
