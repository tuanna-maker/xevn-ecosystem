import { createHash, timingSafeEqual } from 'node:crypto';
import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { XbosDbService } from '../db/xbos-db.service';
import { TenantScopeService } from '../tenant-scope/tenant-scope.service';

const DEV_PASSWORD = 'Xevn@2026';
/** Portal web login access token lifetime (24h) — probe P-CC-01-jwt expects 86400. */
export const PORTAL_LOGIN_JWT_TTL_DEFAULT_SEC = 24 * 60 * 60;

/** Resolved at process start from `PORTAL_LOGIN_JWT_TTL_SEC` when set. */
export function resolvePortalLoginJwtTtlSec(): number {
  const raw = process.env.PORTAL_LOGIN_JWT_TTL_SEC?.trim();
  if (raw) {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return PORTAL_LOGIN_JWT_TTL_DEFAULT_SEC;
}

/** @deprecated Use {@link resolvePortalLoginJwtTtlSec} — kept for specs importing the constant. */
export const PORTAL_LOGIN_JWT_TTL_SEC = PORTAL_LOGIN_JWT_TTL_DEFAULT_SEC;

type PortalUserRow = {
  user_id: string;
  display_name: string;
  password_hash: string;
  status: string;
};

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private readonly db: XbosDbService,
    private readonly tenantScope: TenantScopeService,
  ) {}

  async onModuleInit() {
    await this.ensureSchema();
    await this.ensureDevUsers();
  }

  private hashPassword(userId: string, password: string): string {
    return createHash('sha256')
      .update(`${userId}:${password}:xevn-portal-dev`)
      .digest('hex');
  }

  private async ensureSchema() {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.xbos_portal_user (
        user_id TEXT PRIMARY KEY,
        display_name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }

  private async ensureDevUsers() {
    if (process.env.NODE_ENV === 'production' && process.env.SEED_PORTAL_USERS !== 'true') {
      return;
    }
    const users: Array<{ userId: string; displayName: string }> = [
      { userId: 'admin@xe.vn', displayName: 'Admin Dev (đa tenant)' },
      { userId: 'ceo@xe.vn', displayName: 'CEO Tập đoàn' },
      { userId: 'du-lich.ceo@xe.vn', displayName: 'CEO Du lịch XeVN' },
      { userId: 'du-lich.hr@xe.vn', displayName: 'HR Du lịch XeVN (HRBP)' },
      { userId: 'vietnam.ceo@xe.vn', displayName: 'CEO X.E Việt Nam' },
      { userId: 'tmdv.ceo@xe.vn', displayName: 'CEO TM-DV' },
      { userId: 'visun.ceo@xe.vn', displayName: 'CEO Visun' },
    ];
    for (const u of users) {
      await this.db.query(
        `INSERT INTO public.xbos_portal_user (user_id, display_name, password_hash, status)
         VALUES ($1, $2, $3, 'active')
         ON CONFLICT (user_id) DO UPDATE SET
           display_name = EXCLUDED.display_name,
           password_hash = EXCLUDED.password_hash,
           status = 'active',
           updated_at = NOW()`,
        [u.userId, u.displayName, this.hashPassword(u.userId, DEV_PASSWORD)],
      );
    }
  }

  async login(email: string, password: string) {
    const userId = email.trim().toLowerCase();
    const res = await this.db.query<PortalUserRow>(
      `SELECT user_id, display_name, password_hash, status
       FROM public.xbos_portal_user WHERE user_id = $1 LIMIT 1`,
      [userId],
    );
    const row = res.rows[0];
    if (!row || row.status !== 'active') {
      throw new ApiException('XBOS-AUTH-401', 'Email hoặc mật khẩu không đúng', HttpStatus.UNAUTHORIZED);
    }
    const expected = Buffer.from(row.password_hash, 'hex');
    const actual = Buffer.from(this.hashPassword(userId, password), 'hex');
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      throw new ApiException('XBOS-AUTH-401', 'Email hoặc mật khẩu không đúng', HttpStatus.UNAUTHORIZED);
    }

    const memberships = await this.tenantScope.listAccessible(userId);
    if (!memberships.length) {
      throw new ApiException('XBOS-AUTH-403', 'Tài khoản chưa được gán tenant', HttpStatus.FORBIDDEN);
    }
    const defaultMembership = memberships.find((m) => m.roleCode.includes('ceo')) ?? memberships[0];
    const expiresInSec = resolvePortalLoginJwtTtlSec();
    const accessToken = signServiceJwt(
      {
        sub: userId,
        email: userId,
        tenantId: defaultMembership.tenantId,
        companyId: defaultMembership.companyId,
        roleCode: defaultMembership.roleCode,
      },
      expiresInSec,
    );

    return {
      accessToken,
      expiresInSec,
      user: { userId, displayName: row.display_name },
      memberships,
      defaultTenantId: defaultMembership.tenantId,
      defaultCompanyId: defaultMembership.companyId,
    };
  }

  async me(userId: string) {
    const memberships = await this.tenantScope.listAccessible(userId);
    const res = await this.db.query<{ display_name: string }>(
      `SELECT display_name FROM public.xbos_portal_user WHERE user_id = $1 LIMIT 1`,
      [userId],
    );
    return {
      user: { userId, displayName: res.rows[0]?.display_name ?? userId },
      memberships,
    };
  }
}
