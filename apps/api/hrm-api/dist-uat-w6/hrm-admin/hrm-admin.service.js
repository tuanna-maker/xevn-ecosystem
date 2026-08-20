"use strict";
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
exports.HrmAdminService = void 0;
exports.generateInviteTempPassword = generateInviteTempPassword;
const node_crypto_1 = require("node:crypto");
const common_1 = require("@nestjs/common");
const api_exception_1 = require("../common/api.exception");
const internal_auth_1 = require("../common/internal-auth");
const hrm_db_service_1 = require("../db/hrm-db.service");
const INVITE_TEMP_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*-_=+';
const INVITE_TEMP_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const INVITE_TEMP_DIGITS = '0123456789';
const INVITE_TEMP_DEFAULT_LENGTH = 16;
function generateInviteTempPassword(length = INVITE_TEMP_DEFAULT_LENGTH) {
    const len = Math.max(12, Math.floor(length));
    const chars = [
        INVITE_TEMP_LETTERS[(0, node_crypto_1.randomInt)(INVITE_TEMP_LETTERS.length)],
        INVITE_TEMP_DIGITS[(0, node_crypto_1.randomInt)(INVITE_TEMP_DIGITS.length)],
    ];
    for (let i = chars.length; i < len; i += 1) {
        chars.push(INVITE_TEMP_CHARSET[(0, node_crypto_1.randomInt)(INVITE_TEMP_CHARSET.length)]);
    }
    for (let i = chars.length - 1; i > 0; i -= 1) {
        const j = (0, node_crypto_1.randomInt)(i + 1);
        const tmp = chars[i];
        chars[i] = chars[j];
        chars[j] = tmp;
    }
    return chars.join('');
}
let HrmAdminService = class HrmAdminService {
    db;
    internalApiKey = process.env.INTERNAL_API_KEY ?? process.env.HRM_INTERNAL_API_KEY ?? '';
    constructor(db) {
        this.db = db;
    }
    hashPassword(password) {
        return (0, node_crypto_1.createHash)('sha256').update(password).digest('hex');
    }
    async ensureAdminSchema() {
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE,
        email TEXT,
        full_name TEXT,
        password_hash TEXT,
        avatar_url TEXT,
        phone TEXT,
        job_title TEXT,
        onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.platform_admins (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE,
        email TEXT NOT NULL,
        granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        granted_by TEXT
      );
    `);
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.user_company_memberships (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        company_id TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'member',
        email TEXT,
        full_name TEXT,
        avatar_url TEXT,
        employee_id UUID,
        invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        invited_by TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        is_primary BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
        await this.db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_user_company_memberships_user_company
      ON public.user_company_memberships (user_id, company_id)
      WHERE user_id IS NOT NULL;
    `);
        await this.db.query(`
      CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        actor_user_id UUID,
        actor_sub TEXT NOT NULL,
        target_user_id UUID NOT NULL,
        action TEXT NOT NULL,
        outcome TEXT NOT NULL DEFAULT 'success',
        reason TEXT,
        detail JSONB,
        company_id TEXT,
        request_id TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_admin_audit_logs_action CHECK (
          action IN (
            'credential_password_reset',
            'credential_email_change',
            'credential_password_and_email'
          )
        ),
        CONSTRAINT chk_admin_audit_logs_outcome CHECK (outcome IN ('success', 'rejected'))
      );
    `);
        await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_admin_audit_logs_target_time
      ON public.admin_audit_logs (target_user_id, occurred_at DESC);
    `);
        await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_admin_audit_logs_actor_time
      ON public.admin_audit_logs (actor_user_id, occurred_at DESC)
      WHERE actor_user_id IS NOT NULL;
    `);
        await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_admin_audit_logs_occurred
      ON public.admin_audit_logs (occurred_at DESC);
    `);
        await this.db.query(`
      CREATE INDEX IF NOT EXISTS ix_admin_audit_logs_action_time
      ON public.admin_audit_logs (action, occurred_at DESC);
    `);
    }
    resolveActorSub(authorization) {
        const payload = (0, internal_auth_1.getVerifiedInternalJwtPayload)(authorization);
        return String(payload?.sub ?? '');
    }
    async resolveActorUserId(actorSub) {
        const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRe.test(actorSub)) {
            return null;
        }
        const res = await this.db.query(`SELECT user_id::text FROM public.profiles WHERE user_id = $1::uuid LIMIT 1;`, [actorSub]);
        return res.rows[0]?.user_id ?? null;
    }
    resolveCredentialAuditAction(passwordChanged, emailChanged) {
        if (passwordChanged && emailChanged) {
            return 'credential_password_and_email';
        }
        if (emailChanged) {
            return 'credential_email_change';
        }
        return 'credential_password_reset';
    }
    async assertPlatformAdmin(authorization) {
        if (!authorization?.startsWith('Bearer ')) {
            throw new api_exception_1.ApiException('HRM-AUTH-001', 'Unauthorized', common_1.HttpStatus.UNAUTHORIZED);
        }
        const payload = (0, internal_auth_1.getVerifiedInternalJwtPayload)(authorization);
        if (!payload?.sub) {
            throw new api_exception_1.ApiException('HRM-AUTH-001', 'Unauthorized', common_1.HttpStatus.UNAUTHORIZED);
        }
        const callerKey = String(payload.sub);
        const roleCode = String(payload.roleCode ?? payload.role ?? '').toLowerCase();
        if (roleCode === 'platform_admin' || roleCode === 'group_ceo') {
            return callerKey;
        }
        await this.ensureAdminSchema();
        const adminRes = await this.db.query(`
        SELECT user_id::text
        FROM public.platform_admins
        WHERE user_id::text = $1 OR LOWER(email) = LOWER($2)
        LIMIT 1;
      `, [callerKey, callerKey]);
        if (!adminRes.rows[0]) {
            throw new api_exception_1.ApiException('HRM-AUTH-002', 'Not a platform admin', common_1.HttpStatus.FORBIDDEN);
        }
        return adminRes.rows[0].user_id;
    }
    async findOrCreatePortalUser(email, password, fullName) {
        await this.ensureAdminSchema();
        const normalizedEmail = email.trim().toLowerCase();
        const existing = await this.db.query(`SELECT user_id::text FROM public.profiles WHERE LOWER(email) = $1 LIMIT 1;`, [normalizedEmail]);
        if (existing.rows[0]) {
            return { userId: existing.rows[0].user_id, isExisting: true };
        }
        const plain = typeof password === 'function' ? password() : password;
        const userId = (0, node_crypto_1.randomUUID)();
        await this.db.query(`
        INSERT INTO public.profiles (user_id, email, full_name, password_hash)
        VALUES ($1::uuid, $2, $3, $4);
      `, [userId, normalizedEmail, fullName, this.hashPassword(plain)]);
        return { userId, isExisting: false };
    }
    async createPlatformAdmin(authorization, payload) {
        await this.assertPlatformAdmin(authorization ?? '');
        const fullName = payload.full_name || payload.email.split('@')[0];
        const { userId } = await this.findOrCreatePortalUser(payload.email, payload.password, fullName);
        await this.db.query(`
        INSERT INTO public.platform_admins (user_id, email, granted_by)
        VALUES ($1::uuid, $2, $3)
        ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email, granted_by = EXCLUDED.granted_by;
      `, [userId, payload.email.trim().toLowerCase(), 'Platform Admin']);
        return { success: true, user_id: userId };
    }
    async createCompanyAdmin(authorization, payload) {
        await this.assertPlatformAdmin(authorization ?? '');
        const fullName = payload.full_name || payload.email.split('@')[0];
        const { userId, isExisting } = await this.findOrCreatePortalUser(payload.email, payload.password, fullName);
        await this.db.query(`
        INSERT INTO public.user_company_memberships (
          user_id, company_id, role, email, full_name, status, is_primary, invited_by
        ) VALUES ($1::uuid, $2, $3, $4, $5, 'active', FALSE, $6)
        ON CONFLICT (user_id, company_id) WHERE user_id IS NOT NULL DO UPDATE SET
          role = EXCLUDED.role,
          email = EXCLUDED.email,
          full_name = EXCLUDED.full_name,
          status = 'active',
          updated_at = NOW();
      `, [
            userId,
            payload.company_id,
            payload.role ?? 'admin',
            payload.email.trim().toLowerCase(),
            fullName,
            'Platform Admin',
        ]);
        return { success: true, user_id: userId, is_existing_user: isExisting };
    }
    async inviteEmployees(authorization, payload) {
        if (!authorization?.startsWith('Bearer ')) {
            throw new api_exception_1.ApiException('HRM-AUTH-001', 'Unauthorized', common_1.HttpStatus.UNAUTHORIZED);
        }
        const token = authorization.replace('Bearer ', '');
        const isServiceRole = Boolean(this.internalApiKey) && token === this.internalApiKey;
        if (!isServiceRole) {
            await this.assertPlatformAdmin(authorization);
        }
        const results = [];
        for (const employee of payload.employees) {
            try {
                if (!employee.email) {
                    results.push({ email: 'N/A', success: false, error: 'No email provided' });
                    continue;
                }
                const fullName = employee.full_name || employee.email.split('@')[0];
                const { userId } = await this.findOrCreatePortalUser(employee.email, () => generateInviteTempPassword(), fullName);
                await this.db.query(`
            INSERT INTO public.user_company_memberships (
              user_id, company_id, role, email, full_name, employee_id, status, is_primary, invited_by
            ) VALUES ($1::uuid, $2, 'employee', $3, $4, $5::uuid, 'active', FALSE, $6)
            ON CONFLICT (user_id, company_id) WHERE user_id IS NOT NULL DO UPDATE SET
              email = EXCLUDED.email,
              full_name = EXCLUDED.full_name,
              employee_id = EXCLUDED.employee_id,
              status = 'active',
              updated_at = NOW();
          `, [
                    userId,
                    payload.company_id,
                    employee.email.trim().toLowerCase(),
                    fullName,
                    employee.employee_id ?? null,
                    'Email Invite',
                ]);
                results.push({ email: employee.email, success: true });
            }
            catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                results.push({ email: employee.email, success: false, error: message });
            }
        }
        const invited = results.filter((item) => item.success).length;
        return {
            success: true,
            total: payload.employees.length,
            invited,
            failed: payload.employees.length - invited,
            results,
        };
    }
    async resetUserPassword(authorization, payload) {
        await this.assertPlatformAdmin(authorization ?? '');
        await this.ensureAdminSchema();
        const actorSub = this.resolveActorSub(authorization ?? '');
        const actorUserId = await this.resolveActorUserId(actorSub);
        const passwordChanged = Boolean(payload.new_password);
        const emailChanged = Boolean(payload.new_email);
        const emailAfter = emailChanged ? String(payload.new_email).trim().toLowerCase() : undefined;
        const action = this.resolveCredentialAuditAction(passwordChanged, emailChanged);
        await this.db.withTransaction(async (query) => {
            let rowsProfiles = 0;
            if (payload.new_password) {
                const updated = await query(`UPDATE public.profiles SET password_hash = $2, updated_at = NOW() WHERE user_id = $1::uuid;`, [payload.user_id, this.hashPassword(payload.new_password)]);
                rowsProfiles = Math.max(rowsProfiles, updated.rowCount ?? 0);
            }
            if (payload.new_email) {
                const email = String(payload.new_email).trim().toLowerCase();
                const updated = await query(`UPDATE public.profiles SET email = $2, updated_at = NOW() WHERE user_id = $1::uuid;`, [payload.user_id, email]);
                rowsProfiles = Math.max(rowsProfiles, updated.rowCount ?? 0);
                await query(`UPDATE public.user_company_memberships SET email = $2, updated_at = NOW() WHERE user_id = $1::uuid;`, [payload.user_id, email]);
                await query(`UPDATE public.platform_admins SET email = $2 WHERE user_id = $1::uuid;`, [payload.user_id, email]);
            }
            if (rowsProfiles < 1) {
                throw new api_exception_1.ApiException('HRM-ERR-USER-NOT-FOUND', 'User not found', common_1.HttpStatus.NOT_FOUND);
            }
            const detail = {
                password_changed: passwordChanged,
                email_changed: emailChanged,
                rows_profiles: rowsProfiles,
            };
            if (emailAfter) {
                detail.email_after = emailAfter;
            }
            await query(`
          INSERT INTO public.admin_audit_logs (
            actor_user_id, actor_sub, target_user_id, action, outcome, detail
          ) VALUES (
            $1::uuid, $2, $3::uuid, $4, 'success', $5::jsonb
          );
        `, [actorUserId, actorSub, payload.user_id, action, JSON.stringify(detail)]);
        });
        return { success: true };
    }
    async listCompanyMemberships(authorization, companyId) {
        await this.assertPlatformAdmin(authorization ?? '');
        await this.ensureAdminSchema();
        const filters = [];
        const values = [];
        if (companyId) {
            values.push(companyId);
            filters.push(`company_id = $${values.length}`);
        }
        const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
        const res = await this.db.query(`SELECT * FROM public.user_company_memberships ${where} ORDER BY created_at DESC LIMIT 1000;`, values);
        return { total: res.rows.length, data: res.rows };
    }
    async listAdminCompanies(authorization) {
        await this.assertPlatformAdmin(authorization ?? '');
        await this.ensureAdminSchema();
        const res = await this.db.query(`SELECT DISTINCT company_id FROM public.user_company_memberships ORDER BY company_id ASC;`);
        const data = res.rows.map((row) => ({
            id: row.company_id,
            name: row.company_id,
            code: row.company_id,
        }));
        return { total: data.length, data };
    }
    async updateCompanyMembership(authorization, membershipId, payload) {
        await this.assertPlatformAdmin(authorization ?? '');
        await this.ensureAdminSchema();
        const res = await this.db.query(`UPDATE public.user_company_memberships SET
        role = COALESCE($2, role),
        employee_id = CASE WHEN $3::text = '__unset__' THEN employee_id ELSE $3::uuid END,
        status = COALESCE($4, status),
        full_name = COALESCE($5, full_name),
        email = COALESCE($6, email),
        updated_at = NOW()
       WHERE id = $1::uuid RETURNING *;`, [
            membershipId,
            payload.role ?? null,
            payload.employee_id === undefined ? '__unset__' : payload.employee_id,
            payload.status ?? null,
            payload.full_name ?? null,
            payload.email ?? null,
        ]);
        if (!res.rows[0]) {
            throw new api_exception_1.ApiException('HRM-ADMIN-404', 'Membership not found', common_1.HttpStatus.NOT_FOUND);
        }
        return res.rows[0];
    }
    async deleteCompanyMembership(authorization, membershipId) {
        await this.assertPlatformAdmin(authorization ?? '');
        await this.ensureAdminSchema();
        const res = await this.db.query(`DELETE FROM public.user_company_memberships WHERE id = $1::uuid RETURNING id;`, [membershipId]);
        if (!res.rows[0]) {
            throw new api_exception_1.ApiException('HRM-ADMIN-404', 'Membership not found', common_1.HttpStatus.NOT_FOUND);
        }
        return { id: membershipId };
    }
    async upsertCompanyMembership(authorization, payload) {
        await this.assertPlatformAdmin(authorization ?? '');
        const fullName = payload.full_name || payload.email.split('@')[0];
        const { userId } = await this.findOrCreatePortalUser(payload.email, () => generateInviteTempPassword(), fullName);
        await this.db.query(`INSERT INTO public.user_company_memberships (
        user_id, company_id, role, email, full_name, employee_id, status, invited_by
      ) VALUES ($1::uuid, $2, $3, $4, $5, $6::uuid, COALESCE($7, 'active'), $8)
      ON CONFLICT (user_id, company_id) WHERE user_id IS NOT NULL DO UPDATE SET
        role = EXCLUDED.role,
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        employee_id = EXCLUDED.employee_id,
        status = EXCLUDED.status,
        updated_at = NOW()
      RETURNING *;`, [
            userId,
            payload.company_id,
            payload.role,
            payload.email.trim().toLowerCase(),
            fullName,
            payload.employee_id ?? null,
            payload.status ?? 'active',
            'Admin',
        ]);
        const listed = await this.db.query(`SELECT * FROM public.user_company_memberships WHERE user_id = $1::uuid AND company_id = $2 LIMIT 1;`, [userId, payload.company_id]);
        return listed.rows[0];
    }
};
exports.HrmAdminService = HrmAdminService;
exports.HrmAdminService = HrmAdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [hrm_db_service_1.HrmDbService])
], HrmAdminService);
//# sourceMappingURL=hrm-admin.service.js.map