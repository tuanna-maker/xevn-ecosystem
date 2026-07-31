/**
 * @CODE-MEMORY
 * Screen:     POST /api/xbos/auth/login · POST /api/xbos/auth/select-membership — portal JWT session
 * UC:         UC-XBOS-AUTH-01 · UC-HRM-SCOPE-04
 * BR:         P-CC-01-jwt — portal access token TTL 24h (`expiresInSec=86400`)
 * SRS:        docs/ecosystem/BRD_TONG_HOP_HE_SINH_THAI_XEVN.md UC-XBOS-AUTH-01/02; PILOT matrix P-CC-01
 * TechSpec:   apps/api/xbos-api auth + jwt-sign; deploy PORTAL_LOGIN_JWT_TTL_SEC
 * Purpose:    Authenticate portal users, issue HS256 service JWT with tenant/company/role claims,
 *             and re-issue JWT on membership switch. Login + selectMembership share the same TTL resolver.
 * WorkItem:   P1-EX-BE-HTTPS-P-CC-01-JWT-01
 * Coded:      2026-05-29 (TTL 86400); refreshed 2026-07-19
 *
 * Callers:
 *   - auth.controller.ts → login() / selectMembership() / me()
 *
 * Callees:
 *   - login → ensurePilotMembershipForUser → tenantScope.listAccessible → signServiceJwt
 *   - selectMembership → tenantScope.listAccessible → signServiceJwt
 *   - resolvePortalLoginJwtTtlSec → env PORTAL_LOGIN_JWT_TTL_SEC | PORTAL_LOGIN_JWT_TTL_DEFAULT_SEC
 *
 * FE-Actions:
 *   | User action        | Handler                         | Lib / RPC                          |
 *   |--------------------|---------------------------------|------------------------------------|
 *   | Đăng nhập portal   | AuthContext login               | POST /api/xbos/auth/login          |
 *   | Đổi membership     | AuthContext selectMembership    | POST /api/xbos/auth/select-membership |
 *
 * BE-Chain:
 *   login → xbos_portal_user + membership list → JWT (sub,tenantId,companyId,roleCode) exp=iat+TTL
 *
 * Impact:     Wrong TTL breaks P-CC-01-jwt HTTPS probe and session refresh math (FE expiresInSec).
 * must_keep:  expiresInSec === JWT exp-iat; default 86400; env override only via PORTAL_LOGIN_JWT_TTL_SEC
 * SOLID:      SRP — portal credential + JWT issue; scope listing stays in TenantScopeService
 * LastVerified: auth.service.spec.ts · scripts/tmp-p1-ex-qa-https-01-probe.mjs P-CC-01-jwt · 2026-07-28 (PM re-dispatch freshness)
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem:   P1-EX-BE-HTTPS-P-CC-01-JWT-01
 * Date:       2026-07-25 evening
 * Change:     QC GWC re-dispatch — live HTTPS already expiresInSec=86400 / jwt_delta=86400; no TTL math change.
 *             Probe hardened to assert body TTL AND JWT exp−iat === 86400 (parity must_keep).
 * must_keep:  default TTL 86400; response expiresInSec mirrors signServiceJwt ttl
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem:   P1-EX-BE-HTTPS-P-CC-01-JWT-01
 * Date:       2026-07-27
 * Change:     PM re-dispatch QC GWC residual — freshness verify live dev-portal dual assert 86400/86400;
 *             full probe EXIT=0 (L2 23/23 L2.5 7/7); no TTL math / deploy change (HOLD_DEPLOY).
 * must_keep:  expiresInSec === jwt_delta === 86400; probe body+JWT parity assert
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem:   P1-EX-BE-HTTPS-P-CC-01-JWT-01
 * Date:       2026-07-28
 * Change:     QC GWC residual re-dispatch — live dev-portal still expiresInSec=86400 / jwt_delta=86400;
 *             full probe EXIT=0 (L2 23/23 L2.5 7/7); jest auth+jwt-sign 10/10; no TTL math / deploy (HOLD_DEPLOY).
 * must_keep:  expiresInSec === jwt_delta === 86400; existing auth/scope; U65 zero-seed
 */

import { createHash, timingSafeEqual } from 'node:crypto';
import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { XbosDbService } from '../db/xbos-db.service';
import { TenantScopeService } from '../tenant-scope/tenant-scope.service';
import { ensureAllPilotMemberships, ensurePilotMembershipForUser } from './pilot-membership.bootstrap';
import {
  PILOT_PORTAL_DEV_PASSWORD,
  PILOT_PORTAL_USERS,
  PILOT_SUPER_DEV_PORTAL_USER,
} from './pilot-portal-users.constants';
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
    await this.ensurePilotPortalUsers();
    await this.ensurePilotMemberships();
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

  /** Idempotent pilot portal credentials — runs in production (VPS :8088 UAT personas). */
  private async ensurePilotPortalUsers() {
    const portalRows = [
      ...PILOT_PORTAL_USERS.map((u) => ({ userId: u.userId, displayName: u.displayName })),
      PILOT_SUPER_DEV_PORTAL_USER,
    ];
    for (const u of portalRows) {
      const userId = u.userId.trim().toLowerCase();
      await this.db.query(
        `INSERT INTO public.xbos_portal_user (user_id, display_name, password_hash, status)
         VALUES ($1, $2, $3, 'active')
         ON CONFLICT (user_id) DO UPDATE SET
           display_name = EXCLUDED.display_name,
           password_hash = EXCLUDED.password_hash,
           status = 'active',
           updated_at = NOW()`,
        [userId, u.displayName, this.hashPassword(userId, PILOT_PORTAL_DEV_PASSWORD)],
      );
    }
  }

  /** Tenant memberships required for login (XBOS-AUTH-403 when missing). */
  private async ensurePilotMemberships() {
    await ensureAllPilotMemberships(this.db);
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

    await ensurePilotMembershipForUser(this.db, userId);
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

  /** UC-HRM-SCOPE-04 — re-issue portal JWT for selected tenant membership (ADR §5.3). */
  async selectMembership(userId: string, tenantId: string) {
    const normalizedTenant = tenantId.trim().toLowerCase();
    const memberships = await this.tenantScope.listAccessible(userId);
    const match = memberships.find((m) => m.tenantId.trim().toLowerCase() === normalizedTenant);
    if (!match) {
      throw new ApiException(
        'XBOS-AUTH-403',
        'Membership không thuộc tài khoản hiện tại',
        HttpStatus.FORBIDDEN,
      );
    }
    const expiresInSec = resolvePortalLoginJwtTtlSec();
    const accessToken = signServiceJwt(
      {
        sub: userId,
        email: userId,
        tenantId: match.tenantId,
        companyId: match.companyId,
        roleCode: match.roleCode,
      },
      expiresInSec,
    );
    return {
      accessToken,
      expiresInSec,
      membership: match,
      memberships,
      defaultTenantId: match.tenantId,
      defaultCompanyId: match.companyId,
    };
  }
}
