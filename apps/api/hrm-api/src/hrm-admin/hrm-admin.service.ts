/**
 * @CODE-MEMORY
 * Screen:     HRM → Quản trị BE (FR-HRM-02..05)
 * UC:         UC-HRM-02..05
 * BR:         assertPlatformAdmin · UPSERT membership TEXT company_id · profiles UUID user_id
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.24–3.27 · FR-HRM-05 Diễn biến #6/#8 · NFR-HRM-04
 * TechSpec:   docs/hrm/TECHSPEC.md §16.2 · docs/hrm/DB_DESIGN_HRM_ADMIN.md §5 · API_DESIGN_HRM_ADMIN.md §D/D.1
 * Purpose:    Persist admin plane — profiles UUID + memberships TEXT company_id; không unify XBOS Auth TEXT email user_id.
 * WorkItem:   BE-HRM-ADMIN-DTO-01 · BE-HRM-ADM-AUDIT-01
 * Coded:      2026-07-27
 * Callers:    HrmAdminController
 * Callees:    HrmDbService.query · withTransaction · internal JWT · ensureAdminSchema
 * FEActions:  N/A (BE)
 * BEChain:    assert → findOrCreatePortalUser → INSERT/UPSERT SQL · reset → TX UPDATE profiles + INSERT admin_audit_logs
 * Impact:     Ép company_id UUID-only ở DTO chặn slug; đổi hash scheme phá login HRM admin; thiếu audit INSERT = mất NFR-HRM-04
 * must_keep:  FR-02..05 · Auth/Tenant cite · Fleet/OP · U65 no-seed · HOLD_DEPLOY · no plaintext/hash in audit detail · G-ADM-01-READ non-goal
 * SOLID:      Service owns schema ensure + privilege; DTO owns wire validation
 * LastVerified: hrm-admin.service.spec.ts · dto.spec · 2026-07-27
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: BE-HRM-ADMIN-DTO-01
 * change_mode: ADD
 * What: Xác nhận SQL bind company_id TEXT; DTO đã bỏ @IsUUID — G-ADM-DTO-01 CLOSED
 * Why: Plane B slug ladder khớp leave/fleet; user_id reset vẫn UUID
 * must_keep: dual credential plane vs docs/xbos/API_DESIGN_XBOS_AUTH_TENANT.md
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: BE-HRM-ADM-AUDIT-01
 * change_mode: ADD
 * What: ensureAdminSchema CREATE admin_audit_logs + indexes; resetUserPassword same-TX INSERT audit (action vocab · detail no secrets); fail-closed nếu audit fail
 * Why: G-ADM-01 DESIGN READY → implement FR-HRM-05 #6/#8 · NFR-HRM-04
 * SRS: FR-HRM-05 Diễn biến #6 Lưu thành công · #8 nhật ký · UC-HRM-05 «ghi nhật ký»
 * TechSpec: DB_DESIGN_HRM_ADMIN.md §5 · API_DESIGN_HRM_ADMIN.md §D.1
 * must_keep: G-ADM-DTO-01 CLOSED · OpenAPI admin F.1 CLOSED · no GET audit list invent · no password in detail
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: BE-HRM-ADM-05-01
 * change_mode: ADD
 * What: resetUserPassword — 0-row profiles UPDATE → HTTP 404 HRM-ERR-USER-NOT-FOUND (không còn silent 2xx); success path vẫn INSERT admin_audit_logs cùng TX
 * Why: Đóng residual G-ADM-05 · khớp SRS UC-HRM-05 «tài khoản không tồn tại»
 * SRS: docs/hrm/SRS.md UC-HRM-05 · API_DESIGN_HRM_ADMIN.md §D Errors
 * must_keep: G-ADM-01 audit TX · G-ADM-DTO-01 CLOSED · OpenAPI admin F.1 CLOSED · no plaintext in detail · no GET audit invent
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: BE-HRM-ADM-INVITE-04
 * change_mode: FIX
 * What: inviteEmployees — bỏ literal `12345678`; CSPRNG temp (≥12, charset §C.1) chỉ khi tạo profile mới; hash-only; response không plaintext
 * Why: Đóng G-ADM-04 DESIGN READY → CLOSED · BR-ADM-04-TEMP-PWD-01..08 · AC-ADM-04-TEMP-01..05
 * SRS: docs/hrm/SRS.md UC-HRM-04 AC-ADM-04-TEMP-* · API_DESIGN_HRM_ADMIN.md §C / §C.1 · DB_DESIGN_HRM_ADMIN.md password_hash
 * must_keep: hash path SHA-256 · batch continue-on-error · soft employee_id · U65 · G-ADM-01/05 · HOLD outbox/accept-SM · no plaintext on wire
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: BE-HRM-ADM-UPSERT-PWD-01
 * change_mode: FIX
 * What: upsertCompanyMembership — bỏ literal temp; factory generateInviteTempPassword chỉ khi INSERT profile mới; existing không đè password_hash
 * Why: Đóng sibling P3 residual sau G-ADM-04 · §C.1 BR-ADM-04-TEMP-PWD-01/02 trên path membership upsert
 * SRS: API_DESIGN_HRM_ADMIN.md §C.1 sibling note · findOrCreatePortalUser factory
 * must_keep: G-ADM-04 invite CSPRNG · G-ADM-01/05 · DTO/OA · no plaintext in response · HOLD outbox · create* dùng payload.password
 */
import { createHash, randomInt, randomUUID } from 'node:crypto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { getVerifiedInternalJwtPayload } from '../common/internal-auth';
import { HrmDbService } from '../db/hrm-db.service';
import { CreateCompanyAdminDto } from './dto/create-company-admin.dto';
import { CreatePlatformAdminDto } from './dto/create-platform-admin.dto';
import { InviteEmployeesDto } from './dto/invite-employees.dto';
import { ResetUserPasswordDto } from './dto/reset-user-password.dto';

/** §C.1 charset: A–Z a–z 0–9 + optional symbols (no whitespace/quotes). */
const INVITE_TEMP_CHARSET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*-_=+';
const INVITE_TEMP_LETTERS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const INVITE_TEMP_DIGITS = '0123456789';
const INVITE_TEMP_DEFAULT_LENGTH = 16;

/**
 * CSPRNG temporary password for invite create (new profile only).
 * BR-ADM-04-TEMP-PWD-03..05 · AC-ADM-04-TEMP-05
 */
export function generateInviteTempPassword(
  length = INVITE_TEMP_DEFAULT_LENGTH,
): string {
  const len = Math.max(12, Math.floor(length));
  const chars: string[] = [
    INVITE_TEMP_LETTERS[randomInt(INVITE_TEMP_LETTERS.length)],
    INVITE_TEMP_DIGITS[randomInt(INVITE_TEMP_DIGITS.length)],
  ];
  for (let i = chars.length; i < len; i += 1) {
    chars.push(INVITE_TEMP_CHARSET[randomInt(INVITE_TEMP_CHARSET.length)]);
  }
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    const tmp = chars[i];
    chars[i] = chars[j]!;
    chars[j] = tmp;
  }
  return chars.join('');
}

@Injectable()
export class HrmAdminService {
  private readonly internalApiKey =
    process.env.INTERNAL_API_KEY ?? process.env.HRM_INTERNAL_API_KEY ?? '';

  constructor(private readonly db: HrmDbService) {}

  private hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
  }

  private async ensureAdminSchema() {
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
    // G-ADM-01 / FR-HRM-05 — append-only sensitive credential audit (DB_DESIGN §5)
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

  private resolveActorSub(authorization: string): string {
    const payload = getVerifiedInternalJwtPayload(authorization);
    return String(payload?.sub ?? '');
  }

  private async resolveActorUserId(actorSub: string): Promise<string | null> {
    const uuidRe =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRe.test(actorSub)) {
      return null;
    }
    const res = await this.db.query<{ user_id: string }>(
      `SELECT user_id::text FROM public.profiles WHERE user_id = $1::uuid LIMIT 1;`,
      [actorSub],
    );
    return res.rows[0]?.user_id ?? null;
  }

  private resolveCredentialAuditAction(
    passwordChanged: boolean,
    emailChanged: boolean,
  ):
    | 'credential_password_reset'
    | 'credential_email_change'
    | 'credential_password_and_email' {
    if (passwordChanged && emailChanged) {
      return 'credential_password_and_email';
    }
    if (emailChanged) {
      return 'credential_email_change';
    }
    return 'credential_password_reset';
  }

  private async assertPlatformAdmin(authorization: string): Promise<string> {
    if (!authorization?.startsWith('Bearer ')) {
      throw new ApiException(
        'HRM-AUTH-001',
        'Unauthorized',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const payload = getVerifiedInternalJwtPayload(authorization);
    if (!payload?.sub) {
      throw new ApiException(
        'HRM-AUTH-001',
        'Unauthorized',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const callerKey = String(payload.sub);
    const roleCode = String(
      payload.roleCode ?? payload.role ?? '',
    ).toLowerCase();
    if (roleCode === 'platform_admin' || roleCode === 'group_ceo') {
      return callerKey;
    }
    await this.ensureAdminSchema();
    const adminRes = await this.db.query<{ user_id: string }>(
      `
        SELECT user_id::text
        FROM public.platform_admins
        WHERE user_id::text = $1 OR LOWER(email) = LOWER($2)
        LIMIT 1;
      `,
      [callerKey, callerKey],
    );
    if (!adminRes.rows[0]) {
      throw new ApiException(
        'HRM-AUTH-002',
        'Not a platform admin',
        HttpStatus.FORBIDDEN,
      );
    }
    return adminRes.rows[0].user_id;
  }

  /**
   * Resolve portal profile by email. Existing → membership-only (no password mutate).
   * `password` may be a factory so invite CSPRNG runs only on new-profile INSERT (BR-ADM-04-TEMP-PWD-02).
   */
  private async findOrCreatePortalUser(
    email: string,
    password: string | (() => string),
    fullName: string,
  ) {
    await this.ensureAdminSchema();
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await this.db.query<{ user_id: string }>(
      `SELECT user_id::text FROM public.profiles WHERE LOWER(email) = $1 LIMIT 1;`,
      [normalizedEmail],
    );
    if (existing.rows[0]) {
      return { userId: existing.rows[0].user_id, isExisting: true };
    }
    const plain = typeof password === 'function' ? password() : password;
    const userId = randomUUID();
    await this.db.query(
      `
        INSERT INTO public.profiles (user_id, email, full_name, password_hash)
        VALUES ($1::uuid, $2, $3, $4);
      `,
      [userId, normalizedEmail, fullName, this.hashPassword(plain)],
    );
    return { userId, isExisting: false };
  }

  async createPlatformAdmin(
    authorization: string | undefined,
    payload: CreatePlatformAdminDto,
  ) {
    await this.assertPlatformAdmin(authorization ?? '');
    const fullName = payload.full_name || payload.email.split('@')[0];
    const { userId } = await this.findOrCreatePortalUser(
      payload.email,
      payload.password,
      fullName,
    );
    await this.db.query(
      `
        INSERT INTO public.platform_admins (user_id, email, granted_by)
        VALUES ($1::uuid, $2, $3)
        ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email, granted_by = EXCLUDED.granted_by;
      `,
      [userId, payload.email.trim().toLowerCase(), 'Platform Admin'],
    );
    return { success: true, user_id: userId };
  }

  async createCompanyAdmin(
    authorization: string | undefined,
    payload: CreateCompanyAdminDto,
  ) {
    await this.assertPlatformAdmin(authorization ?? '');
    const fullName = payload.full_name || payload.email.split('@')[0];
    const { userId, isExisting } = await this.findOrCreatePortalUser(
      payload.email,
      payload.password,
      fullName,
    );
    await this.db.query(
      `
        INSERT INTO public.user_company_memberships (
          user_id, company_id, role, email, full_name, status, is_primary, invited_by
        ) VALUES ($1::uuid, $2, $3, $4, $5, 'active', FALSE, $6)
        ON CONFLICT (user_id, company_id) WHERE user_id IS NOT NULL DO UPDATE SET
          role = EXCLUDED.role,
          email = EXCLUDED.email,
          full_name = EXCLUDED.full_name,
          status = 'active',
          updated_at = NOW();
      `,
      [
        userId,
        payload.company_id,
        payload.role ?? 'admin',
        payload.email.trim().toLowerCase(),
        fullName,
        'Platform Admin',
      ],
    );
    return { success: true, user_id: userId, is_existing_user: isExisting };
  }

  async inviteEmployees(
    authorization: string | undefined,
    payload: InviteEmployeesDto,
  ) {
    if (!authorization?.startsWith('Bearer ')) {
      throw new ApiException(
        'HRM-AUTH-001',
        'Unauthorized',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const token = authorization.replace('Bearer ', '');
    const isServiceRole =
      Boolean(this.internalApiKey) && token === this.internalApiKey;
    if (!isServiceRole) {
      await this.assertPlatformAdmin(authorization);
    }
    const results: Array<{ email: string; success: boolean; error?: string }> =
      [];
    for (const employee of payload.employees) {
      try {
        if (!employee.email) {
          results.push({
            email: 'N/A',
            success: false,
            error: 'No email provided',
          });
          continue;
        }
        const fullName = employee.full_name || employee.email.split('@')[0];
        // New profile only: CSPRNG temp → hash (G-ADM-04 §C.1). Existing: factory never runs.
        const { userId } = await this.findOrCreatePortalUser(
          employee.email,
          () => generateInviteTempPassword(),
          fullName,
        );
        await this.db.query(
          `
            INSERT INTO public.user_company_memberships (
              user_id, company_id, role, email, full_name, employee_id, status, is_primary, invited_by
            ) VALUES ($1::uuid, $2, 'employee', $3, $4, $5::uuid, 'active', FALSE, $6)
            ON CONFLICT (user_id, company_id) WHERE user_id IS NOT NULL DO UPDATE SET
              email = EXCLUDED.email,
              full_name = EXCLUDED.full_name,
              employee_id = EXCLUDED.employee_id,
              status = 'active',
              updated_at = NOW();
          `,
          [
            userId,
            payload.company_id,
            employee.email.trim().toLowerCase(),
            fullName,
            employee.employee_id ?? null,
            'Email Invite',
          ],
        );
        results.push({ email: employee.email, success: true });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
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

  async resetUserPassword(
    authorization: string | undefined,
    payload: ResetUserPasswordDto,
  ) {
    await this.assertPlatformAdmin(authorization ?? '');
    await this.ensureAdminSchema();
    const actorSub = this.resolveActorSub(authorization ?? '');
    const actorUserId = await this.resolveActorUserId(actorSub);
    const passwordChanged = Boolean(payload.new_password);
    const emailChanged = Boolean(payload.new_email);
    const emailAfter = emailChanged
      ? String(payload.new_email).trim().toLowerCase()
      : undefined;
    const action = this.resolveCredentialAuditAction(
      passwordChanged,
      emailChanged,
    );

    // Same TX preferred — fail-closed if audit INSERT fails (API_DESIGN §D / §D.1)
    await this.db.withTransaction(async (query) => {
      let rowsProfiles = 0;
      if (payload.new_password) {
        const updated = await query(
          `UPDATE public.profiles SET password_hash = $2, updated_at = NOW() WHERE user_id = $1::uuid;`,
          [payload.user_id, this.hashPassword(payload.new_password)],
        );
        rowsProfiles = Math.max(rowsProfiles, updated.rowCount ?? 0);
      }
      if (payload.new_email) {
        const email = String(payload.new_email).trim().toLowerCase();
        const updated = await query(
          `UPDATE public.profiles SET email = $2, updated_at = NOW() WHERE user_id = $1::uuid;`,
          [payload.user_id, email],
        );
        rowsProfiles = Math.max(rowsProfiles, updated.rowCount ?? 0);
        await query(
          `UPDATE public.user_company_memberships SET email = $2, updated_at = NOW() WHERE user_id = $1::uuid;`,
          [payload.user_id, email],
        );
        await query(
          `UPDATE public.platform_admins SET email = $2 WHERE user_id = $1::uuid;`,
          [payload.user_id, email],
        );
      }

      // G-ADM-05 CLOSED: missing target profile → explicit 404 (not silent 2xx / phantom audit)
      if (rowsProfiles < 1) {
        throw new ApiException(
          'HRM-ERR-USER-NOT-FOUND',
          'User not found',
          HttpStatus.NOT_FOUND,
        );
      }

      // detail: never password / password_hash / plaintext (DB_DESIGN §5.4)
      const detail: Record<string, unknown> = {
        password_changed: passwordChanged,
        email_changed: emailChanged,
        rows_profiles: rowsProfiles,
      };
      if (emailAfter) {
        detail.email_after = emailAfter;
      }

      await query(
        `
          INSERT INTO public.admin_audit_logs (
            actor_user_id, actor_sub, target_user_id, action, outcome, detail
          ) VALUES (
            $1::uuid, $2, $3::uuid, $4, 'success', $5::jsonb
          );
        `,
        [
          actorUserId,
          actorSub,
          payload.user_id,
          action,
          JSON.stringify(detail),
        ],
      );
    });

    return { success: true };
  }

  async listCompanyMemberships(
    authorization: string | undefined,
    companyId?: string,
  ) {
    await this.assertPlatformAdmin(authorization ?? '');
    await this.ensureAdminSchema();
    const filters: string[] = [];
    const values: unknown[] = [];
    if (companyId) {
      values.push(companyId);
      filters.push(`company_id = $${values.length}`);
    }
    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const res = await this.db.query(
      `SELECT * FROM public.user_company_memberships ${where} ORDER BY created_at DESC LIMIT 1000;`,
      values,
    );
    return { total: res.rows.length, data: res.rows };
  }

  async listAdminCompanies(authorization: string | undefined) {
    await this.assertPlatformAdmin(authorization ?? '');
    await this.ensureAdminSchema();
    const res = await this.db.query<{ company_id: string }>(
      `SELECT DISTINCT company_id FROM public.user_company_memberships ORDER BY company_id ASC;`,
    );
    const data = res.rows.map((row) => ({
      id: row.company_id,
      name: row.company_id,
      code: row.company_id,
    }));
    return { total: data.length, data };
  }

  async updateCompanyMembership(
    authorization: string | undefined,
    membershipId: string,
    payload: {
      role?: string;
      employee_id?: string | null;
      status?: string;
      full_name?: string;
      email?: string;
    },
  ) {
    await this.assertPlatformAdmin(authorization ?? '');
    await this.ensureAdminSchema();
    const res = await this.db.query(
      `UPDATE public.user_company_memberships SET
        role = COALESCE($2, role),
        employee_id = CASE WHEN $3::text = '__unset__' THEN employee_id ELSE $3::uuid END,
        status = COALESCE($4, status),
        full_name = COALESCE($5, full_name),
        email = COALESCE($6, email),
        updated_at = NOW()
       WHERE id = $1::uuid RETURNING *;`,
      [
        membershipId,
        payload.role ?? null,
        payload.employee_id === undefined ? '__unset__' : payload.employee_id,
        payload.status ?? null,
        payload.full_name ?? null,
        payload.email ?? null,
      ],
    );
    if (!res.rows[0]) {
      throw new ApiException(
        'HRM-ADMIN-404',
        'Membership not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return res.rows[0];
  }

  async deleteCompanyMembership(
    authorization: string | undefined,
    membershipId: string,
  ) {
    await this.assertPlatformAdmin(authorization ?? '');
    await this.ensureAdminSchema();
    const res = await this.db.query(
      `DELETE FROM public.user_company_memberships WHERE id = $1::uuid RETURNING id;`,
      [membershipId],
    );
    if (!res.rows[0]) {
      throw new ApiException(
        'HRM-ADMIN-404',
        'Membership not found',
        HttpStatus.NOT_FOUND,
      );
    }
    return { id: membershipId };
  }

  async upsertCompanyMembership(
    authorization: string | undefined,
    payload: {
      email: string;
      full_name: string;
      role: string;
      company_id: string;
      employee_id?: string | null;
      status?: string;
    },
  ) {
    await this.assertPlatformAdmin(authorization ?? '');
    const fullName = payload.full_name || payload.email.split('@')[0];
    // New profile only: CSPRNG temp → hash (§C.1 sibling). Existing: factory never runs.
    const { userId } = await this.findOrCreatePortalUser(
      payload.email,
      () => generateInviteTempPassword(),
      fullName,
    );
    await this.db.query(
      `INSERT INTO public.user_company_memberships (
        user_id, company_id, role, email, full_name, employee_id, status, invited_by
      ) VALUES ($1::uuid, $2, $3, $4, $5, $6::uuid, COALESCE($7, 'active'), $8)
      ON CONFLICT (user_id, company_id) WHERE user_id IS NOT NULL DO UPDATE SET
        role = EXCLUDED.role,
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        employee_id = EXCLUDED.employee_id,
        status = EXCLUDED.status,
        updated_at = NOW()
      RETURNING *;`,
      [
        userId,
        payload.company_id,
        payload.role,
        payload.email.trim().toLowerCase(),
        fullName,
        payload.employee_id ?? null,
        payload.status ?? 'active',
        'Admin',
      ],
    );
    const listed = await this.db.query(
      `SELECT * FROM public.user_company_memberships WHERE user_id = $1::uuid AND company_id = $2 LIMIT 1;`,
      [userId, payload.company_id],
    );
    return listed.rows[0];
  }
}
