import { createHash, randomUUID } from 'node:crypto';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiException } from '../common/api.exception';
import { getVerifiedInternalJwtPayload } from '../common/internal-auth';
import { HrmDbService } from '../db/hrm-db.service';
import { CreateCompanyAdminDto } from './dto/create-company-admin.dto';
import { CreatePlatformAdminDto } from './dto/create-platform-admin.dto';
import { InviteEmployeesDto } from './dto/invite-employees.dto';
import { ResetUserPasswordDto } from './dto/reset-user-password.dto';

@Injectable()
export class HrmAdminService {
  private readonly internalApiKey = process.env.INTERNAL_API_KEY ?? process.env.HRM_INTERNAL_API_KEY ?? '';

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
  }

  private async assertPlatformAdmin(authorization: string): Promise<string> {
    if (!authorization?.startsWith('Bearer ')) {
      throw new ApiException('HRM-AUTH-001', 'Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const payload = getVerifiedInternalJwtPayload(authorization);
    if (!payload?.sub) {
      throw new ApiException('HRM-AUTH-001', 'Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const callerKey = String(payload.sub);
    const roleCode = String(payload.roleCode ?? payload.role ?? '').toLowerCase();
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
      throw new ApiException('HRM-AUTH-002', 'Not a platform admin', HttpStatus.FORBIDDEN);
    }
    return adminRes.rows[0].user_id;
  }

  private async findOrCreatePortalUser(email: string, password: string, fullName: string) {
    await this.ensureAdminSchema();
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await this.db.query<{ user_id: string }>(
      `SELECT user_id::text FROM public.profiles WHERE LOWER(email) = $1 LIMIT 1;`,
      [normalizedEmail],
    );
    if (existing.rows[0]) {
      return { userId: existing.rows[0].user_id, isExisting: true };
    }
    const userId = randomUUID();
    await this.db.query(
      `
        INSERT INTO public.profiles (user_id, email, full_name, password_hash)
        VALUES ($1::uuid, $2, $3, $4);
      `,
      [userId, normalizedEmail, fullName, this.hashPassword(password)],
    );
    return { userId, isExisting: false };
  }

  async createPlatformAdmin(authorization: string | undefined, payload: CreatePlatformAdminDto) {
    await this.assertPlatformAdmin(authorization ?? '');
    const fullName = payload.full_name || payload.email.split('@')[0];
    const { userId } = await this.findOrCreatePortalUser(payload.email, payload.password, fullName);
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

  async createCompanyAdmin(authorization: string | undefined, payload: CreateCompanyAdminDto) {
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

  async inviteEmployees(authorization: string | undefined, payload: InviteEmployeesDto) {
    if (!authorization?.startsWith('Bearer ')) {
      throw new ApiException('HRM-AUTH-001', 'Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const token = authorization.replace('Bearer ', '');
    const isServiceRole = Boolean(this.internalApiKey) && token === this.internalApiKey;
    if (!isServiceRole) {
      await this.assertPlatformAdmin(authorization);
    }
    const results: Array<{ email: string; success: boolean; error?: string }> = [];
    for (const employee of payload.employees) {
      try {
        if (!employee.email) {
          results.push({ email: 'N/A', success: false, error: 'No email provided' });
          continue;
        }
        const fullName = employee.full_name || employee.email.split('@')[0];
        const { userId } = await this.findOrCreatePortalUser(employee.email, '12345678', fullName);
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

  async resetUserPassword(authorization: string | undefined, payload: ResetUserPasswordDto) {
    await this.assertPlatformAdmin(authorization ?? '');
    await this.ensureAdminSchema();
    if (payload.new_password) {
      await this.db.query(
        `UPDATE public.profiles SET password_hash = $2, updated_at = NOW() WHERE user_id = $1::uuid;`,
        [payload.user_id, this.hashPassword(payload.new_password)],
      );
    }
    if (payload.new_email) {
      const email = payload.new_email.trim().toLowerCase();
      await this.db.query(
        `UPDATE public.profiles SET email = $2, updated_at = NOW() WHERE user_id = $1::uuid;`,
        [payload.user_id, email],
      );
      await this.db.query(
        `UPDATE public.user_company_memberships SET email = $2, updated_at = NOW() WHERE user_id = $1::uuid;`,
        [payload.user_id, email],
      );
      await this.db.query(
        `UPDATE public.platform_admins SET email = $2 WHERE user_id = $1::uuid;`,
        [payload.user_id, email],
      );
    }
    return { success: true };
  }

  async listCompanyMemberships(authorization: string | undefined, companyId?: string) {
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
    payload: { role?: string; employee_id?: string | null; status?: string; full_name?: string; email?: string },
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
      throw new ApiException('HRM-ADMIN-404', 'Membership not found', HttpStatus.NOT_FOUND);
    }
    return res.rows[0];
  }

  async deleteCompanyMembership(authorization: string | undefined, membershipId: string) {
    await this.assertPlatformAdmin(authorization ?? '');
    await this.ensureAdminSchema();
    const res = await this.db.query(
      `DELETE FROM public.user_company_memberships WHERE id = $1::uuid RETURNING id;`,
      [membershipId],
    );
    if (!res.rows[0]) {
      throw new ApiException('HRM-ADMIN-404', 'Membership not found', HttpStatus.NOT_FOUND);
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
    const { userId } = await this.findOrCreatePortalUser(payload.email, '12345678', fullName);
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
