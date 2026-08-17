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
 *
 * @CODE-MEMORY-CHANGE
 * WorkItem:   W1-B-03-AUTH-BE
 * Date:       2026-08-03
 * change_mode: UPGRADE
 * What:       login/me/select-membership trả membership display-ready (tenant_label,
 *             company_label, role_label, tenant_kind_label, membershipId); JWT claim
 *             membershipId per API_CONTRACT §8.2. Không thêm cột locked_until (R-M01-LOCKOUT-COL).
 * Why:        OS 28 — FE không invent nhãn tenant/role từ raw key.
 * SRS:        FR-UC-M01 · Diễn biến #1–5 · API_CONTRACT_NEW §8
 * must_keep:  expiresInSec 86400; raw tenantId/roleCode/companyId; U65 zero-seed; no lockout DDL
 */

import { createHash, timingSafeEqual } from 'node:crypto';
import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { signServiceJwt } from '../common/jwt-sign';
import { XbosDbService } from '../db/xbos-db.service';
import { TenantScopeService } from '../tenant-scope/tenant-scope.service';
import { ensureAllPilotMemberships, ensurePilotMembershipForUser } from './pilot-membership.bootstrap';
import {
  toPortalMembershipDisplay,
  type PortalMembershipDisplay,
} from './membership-display';
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

  /**
   * OS 28 / API_CONTRACT §8 — memberships with Vietnamese labels + membershipId.
   * Active rows only; inactive → omitted (select → XBOS-AUTH-403).
   */
  private async listDisplayMemberships(userId: string): Promise<PortalMembershipDisplay[]> {
    const accessible = await this.tenantScope.listAccessible(userId);
    if (!accessible.length) return [];
    const idRes = await this.db.query<{ id: string; tenant_id: string }>(
      `SELECT id::text AS id, tenant_id
       FROM public.xbos_user_tenant_membership
       WHERE user_id = $1 AND status = 'active'`,
      [userId],
    );
    const idByTenant = new Map(
      idRes.rows.map((r) => [String(r.tenant_id).trim().toLowerCase(), String(r.id)]),
    );
    return accessible.map((m) => {
      const key = m.tenantId.trim().toLowerCase();
      const membershipId = idByTenant.get(key) ?? `${userId}:${key}`;
      return toPortalMembershipDisplay(m, membershipId);
    });
  }

  private signPortalAccessToken(
    userId: string,
    membership: PortalMembershipDisplay,
    expiresInSec: number,
  ): string {
    return signServiceJwt(
      {
        sub: userId,
        email: userId,
        tenantId: membership.tenantId,
        companyId: membership.companyId,
        roleCode: membership.roleCode,
        membershipId: membership.membershipId,
        default_company_id: membership.companyId,
      },
      expiresInSec,
    );
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

    // R-M01-LOCKOUT-COL: locked_until chưa có cột DB — NFR app-level residual; không invent DDL.
    await ensurePilotMembershipForUser(this.db, userId);
    const memberships = await this.listDisplayMemberships(userId);
    if (!memberships.length) {
      throw new ApiException('XBOS-AUTH-403', 'Tài khoản chưa được gán tenant', HttpStatus.FORBIDDEN);
    }
    const defaultMembership =
      memberships.find((m) => m.roleCode.toLowerCase().includes('ceo')) ?? memberships[0];
    const expiresInSec = resolvePortalLoginJwtTtlSec();
    const accessToken = this.signPortalAccessToken(userId, defaultMembership, expiresInSec);

    return {
      accessToken,
      expiresInSec,
      user: { userId, displayName: row.display_name },
      memberships,
      defaultTenantId: defaultMembership.tenantId,
      defaultCompanyId: defaultMembership.companyId,
      defaultMembershipId: defaultMembership.membershipId,
    };
  }

  async me(userId: string) {
    const memberships = await this.listDisplayMemberships(userId);
    const res = await this.db.query<{ display_name: string }>(
      `SELECT display_name FROM public.xbos_portal_user WHERE user_id = $1 LIMIT 1`,
      [userId],
    );
    return {
      user: { userId, displayName: res.rows[0]?.display_name ?? userId },
      memberships,
    };
  }

  /** FR-UC-M01 / UC-HRM-SCOPE-04 — re-issue portal JWT for selected tenant membership. */
  async selectMembership(userId: string, tenantId: string) {
    const normalizedTenant = tenantId.trim().toLowerCase();
    const memberships = await this.listDisplayMemberships(userId);
    const match = memberships.find((m) => m.tenantId.trim().toLowerCase() === normalizedTenant);
    if (!match) {
      throw new ApiException(
        'XBOS-AUTH-403',
        'Membership không thuộc tài khoản hiện tại hoặc đã ngưng hiệu lực',
        HttpStatus.FORBIDDEN,
      );
    }
    const expiresInSec = resolvePortalLoginJwtTtlSec();
    const accessToken = this.signPortalAccessToken(userId, match, expiresInSec);
    return {
      accessToken,
      expiresInSec,
      membership: match,
      memberships,
      defaultTenantId: match.tenantId,
      defaultCompanyId: match.companyId,
      defaultMembershipId: match.membershipId,
    };
  }
}
