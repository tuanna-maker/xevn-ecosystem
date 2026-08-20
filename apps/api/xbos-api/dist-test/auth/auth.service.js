"use strict";
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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = exports.PORTAL_LOGIN_JWT_TTL_SEC = exports.PORTAL_LOGIN_JWT_TTL_DEFAULT_SEC = void 0;
exports.resolvePortalLoginJwtTtlSec = resolvePortalLoginJwtTtlSec;
const node_crypto_1 = require("node:crypto");
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const jwt_sign_1 = require("../common/jwt-sign");
const xbos_db_service_1 = require("../db/xbos-db.service");
const tenant_scope_service_1 = require("../tenant-scope/tenant-scope.service");
const pilot_membership_bootstrap_1 = require("./pilot-membership.bootstrap");
const membership_display_1 = require("./membership-display");
const pilot_portal_users_constants_1 = require("./pilot-portal-users.constants");
/** Portal web login access token lifetime (24h) — probe P-CC-01-jwt expects 86400. */
exports.PORTAL_LOGIN_JWT_TTL_DEFAULT_SEC = 24 * 60 * 60;
/** Resolved at process start from `PORTAL_LOGIN_JWT_TTL_SEC` when set. */
function resolvePortalLoginJwtTtlSec() {
    const raw = process.env.PORTAL_LOGIN_JWT_TTL_SEC?.trim();
    if (raw) {
        const parsed = Number.parseInt(raw, 10);
        if (Number.isFinite(parsed) && parsed > 0) {
            return parsed;
        }
    }
    return exports.PORTAL_LOGIN_JWT_TTL_DEFAULT_SEC;
}
/** @deprecated Use {@link resolvePortalLoginJwtTtlSec} — kept for specs importing the constant. */
exports.PORTAL_LOGIN_JWT_TTL_SEC = exports.PORTAL_LOGIN_JWT_TTL_DEFAULT_SEC;
let AuthService = class AuthService {
    db;
    tenantScope;
    constructor(db, tenantScope) {
        this.db = db;
        this.tenantScope = tenantScope;
    }
    async onModuleInit() {
        await this.ensureSchema();
        await this.ensurePilotPortalUsers();
        await this.ensurePilotMemberships();
    }
    hashPassword(userId, password) {
        return (0, node_crypto_1.createHash)('sha256')
            .update(`${userId}:${password}:xevn-portal-dev`)
            .digest('hex');
    }
    async ensureSchema() {
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
    async ensurePilotPortalUsers() {
        const portalRows = [
            ...pilot_portal_users_constants_1.PILOT_PORTAL_USERS.map((u) => ({ userId: u.userId, displayName: u.displayName })),
            pilot_portal_users_constants_1.PILOT_SUPER_DEV_PORTAL_USER,
        ];
        for (const u of portalRows) {
            const userId = u.userId.trim().toLowerCase();
            await this.db.query(`INSERT INTO public.xbos_portal_user (user_id, display_name, password_hash, status)
         VALUES ($1, $2, $3, 'active')
         ON CONFLICT (user_id) DO UPDATE SET
           display_name = EXCLUDED.display_name,
           password_hash = EXCLUDED.password_hash,
           status = 'active',
           updated_at = NOW()`, [userId, u.displayName, this.hashPassword(userId, pilot_portal_users_constants_1.PILOT_PORTAL_DEV_PASSWORD)]);
        }
    }
    /** Tenant memberships required for login (XBOS-AUTH-403 when missing). */
    async ensurePilotMemberships() {
        await (0, pilot_membership_bootstrap_1.ensureAllPilotMemberships)(this.db);
    }
    /**
     * OS 28 / API_CONTRACT §8 — memberships with Vietnamese labels + membershipId.
     * Active rows only; inactive → omitted (select → XBOS-AUTH-403).
     */
    async listDisplayMemberships(userId) {
        const accessible = await this.tenantScope.listAccessible(userId);
        if (!accessible.length)
            return [];
        const idRes = await this.db.query(`SELECT id::text AS id, tenant_id
       FROM public.xbos_user_tenant_membership
       WHERE user_id = $1 AND status = 'active'`, [userId]);
        const idByTenant = new Map(idRes.rows.map((r) => [String(r.tenant_id).trim().toLowerCase(), String(r.id)]));
        return accessible.map((m) => {
            const key = m.tenantId.trim().toLowerCase();
            const membershipId = idByTenant.get(key) ?? `${userId}:${key}`;
            return (0, membership_display_1.toPortalMembershipDisplay)(m, membershipId);
        });
    }
    signPortalAccessToken(userId, membership, expiresInSec) {
        return (0, jwt_sign_1.signServiceJwt)({
            sub: userId,
            email: userId,
            tenantId: membership.tenantId,
            companyId: membership.companyId,
            roleCode: membership.roleCode,
            membershipId: membership.membershipId,
            default_company_id: membership.companyId,
        }, expiresInSec);
    }
    async login(email, password) {
        const userId = email.trim().toLowerCase();
        const res = await this.db.query(`SELECT user_id, display_name, password_hash, status
       FROM public.xbos_portal_user WHERE user_id = $1 LIMIT 1`, [userId]);
        const row = res.rows[0];
        if (!row || row.status !== 'active') {
            throw new api_exception_1.ApiException('XBOS-AUTH-401', 'Email hoặc mật khẩu không đúng', common_1.HttpStatus.UNAUTHORIZED);
        }
        const expected = Buffer.from(row.password_hash, 'hex');
        const actual = Buffer.from(this.hashPassword(userId, password), 'hex');
        if (expected.length !== actual.length || !(0, node_crypto_1.timingSafeEqual)(expected, actual)) {
            throw new api_exception_1.ApiException('XBOS-AUTH-401', 'Email hoặc mật khẩu không đúng', common_1.HttpStatus.UNAUTHORIZED);
        }
        // R-M01-LOCKOUT-COL: locked_until chưa có cột DB — NFR app-level residual; không invent DDL.
        await (0, pilot_membership_bootstrap_1.ensurePilotMembershipForUser)(this.db, userId);
        const memberships = await this.listDisplayMemberships(userId);
        if (!memberships.length) {
            throw new api_exception_1.ApiException('XBOS-AUTH-403', 'Tài khoản chưa được gán tenant', common_1.HttpStatus.FORBIDDEN);
        }
        const defaultMembership = memberships.find((m) => m.roleCode.toLowerCase().includes('ceo')) ?? memberships[0];
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
    async me(userId) {
        const memberships = await this.listDisplayMemberships(userId);
        const res = await this.db.query(`SELECT display_name FROM public.xbos_portal_user WHERE user_id = $1 LIMIT 1`, [userId]);
        return {
            user: { userId, displayName: res.rows[0]?.display_name ?? userId },
            memberships,
        };
    }
    /** FR-UC-M01 / UC-HRM-SCOPE-04 — re-issue portal JWT for selected tenant membership. */
    async selectMembership(userId, tenantId) {
        const normalizedTenant = tenantId.trim().toLowerCase();
        const memberships = await this.listDisplayMemberships(userId);
        const match = memberships.find((m) => m.tenantId.trim().toLowerCase() === normalizedTenant);
        if (!match) {
            throw new api_exception_1.ApiException('XBOS-AUTH-403', 'Membership không thuộc tài khoản hiện tại hoặc đã ngưng hiệu lực', common_1.HttpStatus.FORBIDDEN);
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
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [xbos_db_service_1.XbosDbService,
        tenant_scope_service_1.TenantScopeService])
], AuthService);
