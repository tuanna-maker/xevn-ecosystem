import { createHash } from 'node:crypto';
import { AuthService, PORTAL_LOGIN_JWT_TTL_DEFAULT_SEC, resolvePortalLoginJwtTtlSec } from './auth.service';
import { XbosDbService } from '../db/xbos-db.service';
import { TenantScopeService } from '../tenant-scope/tenant-scope.service';

const DEV_PASSWORD = 'Xevn@2026';

function hashPassword(userId: string, password: string): string {
  return createHash('sha256')
    .update(`${userId}:${password}:xevn-portal-dev`)
    .digest('hex');
}

function decodeJwtPayload(token: string): { iat: number; exp: number } {
  const part = token.split('.')[1];
  const padded = part.replace(/-/g, '+').replace(/_/g, '/');
  const json = Buffer.from(padded, 'base64').toString('utf8');
  return JSON.parse(json) as { iat: number; exp: number };
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
    expect(payload.exp - payload.iat).toBe(86400);
  });
});
