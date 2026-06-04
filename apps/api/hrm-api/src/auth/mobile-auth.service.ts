import { HttpStatus, Injectable } from '@nestjs/common';
import { createHash, timingSafeEqual } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import { getVerifiedInternalJwtPayload } from '../common/internal-auth';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import type { MobileLoginDto } from './dto/mobile-login.dto';
import type { MobileRefreshDto } from './dto/mobile-refresh.dto';

type EmployeeAuthRow = {
  id: string;
  company_id: string;
  email: string;
  full_name: string;
  employee_code: string;
  job_title_key: string | null;
  custom_fields: Record<string, string> | null;
};

export type MobileMembership = {
  tenant_id: string;
  company_id: string;
  company_uuid: string;
  employee_id: string;
  employee_code: string;
  employee_name: string;
  company_display: string;
  is_primary: boolean;
};

const ACCESS_TTL_SEC = 12 * 60 * 60;
const REFRESH_TTL_SEC = 30 * 24 * 60 * 60;
const MASTER_TENANT = (process.env.MASTER_TENANT_ID ?? 'xevn').trim().toLowerCase();
const MEMBER_COMPANY_SLUGS = new Set(['holding', 'trsport', 'logistics', 'finance', 'services']);

@Injectable()
export class MobileAuthService {
  constructor(private readonly db: HrmDbService) {}

  private hashPassword(email: string, password: string): string {
    return createHash('sha256').update(`${email.trim().toLowerCase()}:${password}`).digest('hex');
  }

  private verifyPassword(email: string, password: string, row: EmployeeAuthRow): boolean {
    const custom = row.custom_fields ?? {};
    const storedHash = custom.mobile_password_hash?.trim();
    if (storedHash) {
      const actual = Buffer.from(this.hashPassword(email, password), 'hex');
      const expected = Buffer.from(storedHash, 'hex');
      if (expected.length === actual.length) {
        return timingSafeEqual(expected, actual);
      }
    }
    const pilot =
      process.env.HRM_MOBILE_PILOT_PASSWORD ??
      (process.env.NODE_ENV !== 'production' ? 'xevn-pilot' : undefined);
    if (!pilot) return false;
    return password === pilot;
  }

  deriveRoles(jobTitleKey: string | null): string[] {
    const key = (jobTitleKey ?? '').toUpperCase();
    const roles = ['employee'];
    if (key.includes('MANAGER') || key.includes('CHRO') || key === 'CEO' || key.includes('OPS_MANAGER')) {
      roles.push('manager');
    }
    if (key.includes('CHRO') || key === 'CEO') {
      roles.push('hr_manager');
    }
    return [...new Set(roles)];
  }

  resolveTenantId(row: EmployeeAuthRow): string {
    const custom = row.custom_fields ?? {};
    const fromCustom = custom.tenant_id?.trim().toLowerCase();
    if (fromCustom) return fromCustom;
    if (MEMBER_COMPANY_SLUGS.has(row.company_id.trim().toLowerCase())) {
      return MASTER_TENANT;
    }
    if (row.company_id.trim().toLowerCase() === 'main') {
      throw new ApiException(
        'HRM-AUTH-403',
        'Nhân viên thiếu tenant_id trong hồ sơ — liên hệ quản trị',
        HttpStatus.FORBIDDEN,
        { employee_id: row.id },
      );
    }
    return MASTER_TENANT;
  }

  resolveCompanyUuid(row: EmployeeAuthRow, tenantId: string): string {
    const custom = row.custom_fields ?? {};
    const fromCustom = custom.attendance_company_uuid?.trim();
    if (fromCustom && /^[0-9a-f-]{36}$/i.test(fromCustom)) return fromCustom;
    const h = createHash('sha256').update(`hrm-scope:${tenantId}:${row.company_id}`).digest('hex');
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`;
  }

  rowToMembership(row: EmployeeAuthRow): MobileMembership {
    const custom = row.custom_fields ?? {};
    const tenantId = this.resolveTenantId(row);
    return {
      tenant_id: tenantId,
      company_id: row.company_id,
      company_uuid: this.resolveCompanyUuid(row, tenantId),
      employee_id: row.id,
      employee_code: row.employee_code,
      employee_name: row.full_name,
      company_display: custom.company_display?.trim() || row.company_id,
      is_primary: custom.is_primary_membership === 'true' || custom.is_primary === 'true',
    };
  }

  private issueTokens(input: {
    tenantId: string;
    companyId: string;
    employeeId: string;
    email: string;
    roles: string[];
    companyUuid: string;
  }) {
    const base = {
      sub: input.email,
      tenantId: input.tenantId,
      companyId: input.companyId,
      employee_id: input.employeeId,
      company_uuid: input.companyUuid,
      roles: input.roles,
    };
    const accessToken = signServiceJwt(base, ACCESS_TTL_SEC);
    const refreshToken = signServiceJwt({ ...base, typ: 'refresh' }, REFRESH_TTL_SEC);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in_sec: ACCESS_TTL_SEC,
      token_type: 'Bearer' as const,
    };
  }

  private pickDefaultMembership(memberships: MobileMembership[]): MobileMembership {
    return memberships.find((m) => m.is_primary) ?? memberships[0];
  }

  private buildLoginResponse(email: string, row: EmployeeAuthRow, allRows: EmployeeAuthRow[]) {
    const memberships = allRows.map((r) => this.rowToMembership(r));
    const active = this.rowToMembership(row);
    const roles = this.deriveRoles(row.job_title_key);
    const tokens = this.issueTokens({
      tenantId: active.tenant_id,
      companyId: active.company_id,
      employeeId: row.id,
      email,
      roles,
      companyUuid: active.company_uuid,
    });
    return {
      ...tokens,
      employee: {
        id: row.id,
        company_id: row.company_id,
        email: row.email,
        full_name: row.full_name,
        employee_code: row.employee_code,
        job_title_key: row.job_title_key,
      },
      roles,
      memberships,
      active_membership: active,
      default_tenant_id: active.tenant_id,
      default_company_id: active.company_id,
      company_uuid: active.company_uuid,
    };
  }

  async login(body: MobileLoginDto, scopeHint?: { tenantId?: string; companyId?: string }) {
    const email = body.email.trim().toLowerCase();
    const res = await this.db.query<EmployeeAuthRow>(
      `
        SELECT id, company_id, email, full_name, employee_code, job_title_key, custom_fields
        FROM public.employees
        WHERE lower(email) = $1 AND archived_at IS NULL AND status = 'active'
        ORDER BY company_id, employee_code;
      `,
      [email],
    );
    const verified = res.rows.filter((row) => this.verifyPassword(email, body.password, row));
    if (!verified.length) {
      throw new ApiException('HRM-AUTH-401', 'Email hoặc mật khẩu không đúng', HttpStatus.UNAUTHORIZED);
    }

    let selected = verified[0];
    if (scopeHint?.tenantId && scopeHint?.companyId) {
      const match = verified.find((row) => {
        try {
          const m = this.rowToMembership(row);
          return m.tenant_id === scopeHint.tenantId && m.company_id === scopeHint.companyId;
        } catch {
          return false;
        }
      });
      if (match) selected = match;
    } else if (verified.length > 1) {
      selected = verified.find((row) => {
        try {
          return this.rowToMembership(row).is_primary;
        } catch {
          return false;
        }
      }) ?? verified[0];
    }

    return this.buildLoginResponse(email, selected, verified);
  }

  async selectMembership(email: string, employeeId: string) {
    const res = await this.db.query<EmployeeAuthRow>(
      `
        SELECT id, company_id, email, full_name, employee_code, job_title_key, custom_fields
        FROM public.employees
        WHERE id = $1::uuid AND lower(email) = $2 AND archived_at IS NULL AND status = 'active'
        LIMIT 1;
      `,
      [employeeId, email.trim().toLowerCase()],
    );
    const row = res.rows[0];
    if (!row) {
      throw new ApiException('HRM-AUTH-404', 'Không tìm thấy phạm vi nhân viên', HttpStatus.NOT_FOUND);
    }
    const allRes = await this.db.query<EmployeeAuthRow>(
      `
        SELECT id, company_id, email, full_name, employee_code, job_title_key, custom_fields
        FROM public.employees
        WHERE lower(email) = $1 AND archived_at IS NULL AND status = 'active';
      `,
      [email.trim().toLowerCase()],
    );
    return this.buildLoginResponse(email, row, allRes.rows);
  }

  async refresh(body: MobileRefreshDto) {
    const payload = getVerifiedInternalJwtPayload(`Bearer ${body.refresh_token.trim()}`);
    if (!payload || payload.typ !== 'refresh') {
      throw new ApiException('HRM-AUTH-401', 'Refresh token không hợp lệ', HttpStatus.UNAUTHORIZED);
    }
    const tenantId = String(payload.tenantId ?? payload.tenant_id ?? '');
    const companyId = String(payload.companyId ?? payload.company_id ?? '');
    const employeeId = String(payload.employee_id ?? '');
    const companyUuid = String(payload.company_uuid ?? '');
    const email = String(payload.sub ?? '');
    const roles = Array.isArray(payload.roles)
      ? payload.roles.filter((r): r is string => typeof r === 'string')
      : ['employee'];
    if (!tenantId || !companyId || !employeeId) {
      throw new ApiException('HRM-AUTH-401', 'Refresh token thiếu phạm vi', HttpStatus.UNAUTHORIZED);
    }
    return this.issueTokens({ tenantId, companyId, employeeId, email, roles, companyUuid });
  }
}
