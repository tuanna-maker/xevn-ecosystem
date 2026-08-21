/**
 * @CODE-MEMORY
 * Screen:     Mobile → Đăng nhập / chọn membership / refresh JWT
 * UC:         UC-HRM-MOB-03 · UC-HRM-MOB-05 · attendance claim company_uuid
 * BR:         ADR Plane A bridge §4.3.3 — mobile UUID = Plane B′ only
 * SRS:        docs/architecture/ADR-HRM-XBOS-PLANE-A-BRIDGE-4LE-5SLUG-20260727.md §4.3
 * TechSpec:   docs/architecture/ADR-HRM-RBAC-SCOPE-LADDER.md §4 (mobile attendance key)
 * Purpose:    Mint mobile JWT với company_uuid khớp HRM_COMPANY_UUID_BY_SLUG để
 *             POST attendance/records không bị HRM-PLANE-409 sau OP/ATT persist guard.
 * WorkItem:   D-HRM-MOB-UUID-BPRIME-01
 * Coded:      2026-07-27
 * Callers:    mobile-auth.controller.ts → login / selectMembership / refresh
 * Callees:    HRM_COMPANY_UUID_BY_SLUG · isHrmMappedCompanyUuid · signServiceJwt
 * FEActions:  login → store company_uuid → attendance body company_id = claim
 * BEChain:    resolveCompanyUuid → JWT company_uuid → assertHrmMappedCompanyUuidOrThrow
 * Impact:     Sai map → mobile check-in 409; LE lọt claim → phá plane guard
 * must_keep:  LE body attendance vẫn 409; không weaken assertHrmMappedCompanyUuidOrThrow;
 *             CO-HC / OP / MD GWC không reopen; U65 zero-seed
 * SOLID:      UUID ladder tập trung ở hrm-list-scope; auth chỉ resolve claim
 * LastVerified: mobile-auth.service.spec + live uat.nv0001
 *
 * @CODE-MEMORY-CHANGE 2026-07-30
 * WorkItem: D-HDSD-MOB-UAT-AUTH-01
 * change_mode: FIX
 * What: Lazy ensure `uat.nv####@xe.vn` employee row + accept documented `xevn-uat-2026`
 *       when hash missing/stale after tenant-master reset (mirrors PORTAL-GCEO ensure).
 * Why:  QA-HDSD-MOB-CH12-01 — uat.nv0001/0002 → 401 on pilot :3001; ceo@ login OK.
 * SRS:  MOBILE_PERSONA_UX_MATRIX §2.2 · HDSD CH12 TC-MOB-003/004
 * must_keep: Chỉ pattern uat.nv#### seq 1..1000; prod cần HRM_MOBILE_UAT_PASSWORD env;
 *            không weaken verify cho email khác; U65 no bulk seed
 *
 * @CODE-MEMORY-CHANGE 2026-07-31
 * WorkItem: D-HDSD-MOB-PILOT-TXN-NET-01
 * change_mode: ADD
 * What: nv0001 lazy ensure pending leave (J-MOB-03) + pilot CORS relax + Connection:close for mob-* ESS
 * Why: QA R4 device ERR-NETWORK on transactional GET while auth 201; pending/payslip empty block list→detail
 * must_keep: U65 lazy product ensure only; seq 1..2 pilot personas; no pnpm seed:*
 *
 * @CODE-MEMORY-CHANGE 2026-07-31
 * WorkItem: D-HDSD-MOB-PILOT-DATA-PENDING-01
 * change_mode: ADD
 * What: Sau login uat.nv0001/0002 gọi ensureUatMobilePilotTransactionData — payslip + pending duyệt
 * Why:  QA-HDSD-MOB-CH12-01-R4 payslip total=0 · manager pending=0 block J-MOB-04/05
 * must_keep: U65 lazy product ensure only; không pnpm seed:*; chỉ seq 1..2 pilot personas
 *
 * @CODE-MEMORY-CHANGE 2026-07-30
 * WorkItem: D-BE-MOB-AUTH-CEO-HASH-01
 * change_mode: FIX
 * What: Lazy idempotent ensure holding PORTAL-GCEO row for portal Group CEO when
 *       employees wiped (tenant-master reset); verify portal password (Xevn@2026 dev)
 *       when no mobile_password_hash or hash mismatch for ceo@xe.vn only.
 * Why:  Post D-DEV-RESET-TENANT-MASTER-01 mobile login 401 — no employee row;
 *       prior hash blocked pilot fallback. Mirrors recruitment bridge ensure pattern.
 * SRS:  UC-HRM-MOB-03 · docs/qa/PILOT_TEST_ACCOUNTS.md (ceo@xe.vn / Xevn@2026)
 * must_keep: U65 no bulk seed; production requires HRM_PORTAL_GROUP_CEO_PASSWORD env;
 *            subsidiary CEO accounts unchanged; LE plane guard unchanged
 *
 * @CODE-MEMORY-CHANGE 2026-07-27
 * WorkItem: D-HRM-MOB-UUID-BPRIME-01
 * change_mode: FIX
 * What: resolveCompanyUuid bỏ SHA256 hash; custom attendance_company_uuid chỉ nhận
 *       UUID ∈ map; LE/unknown → map-by-slug (main→holding) hoặc HRM-AUTH-409.
 *       refresh tái resolve company_uuid từ employee row khi có.
 * Why:  QA-HRM-MOB-UUID-PLANE-01 EC-1 FAIL — live JWT hash ∉ map → HRM-PLANE-409
 * SRS:  ADR-PLANE-A-BRIDGE §4.3.3
 * must_keep: assertHrmMappedCompanyUuidOrThrow LE reject; CO-HC/OP/MD
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: W1-B-03-AUTH-BE
 * change_mode: UPGRADE
 * What: Membership display-ready — company_label / tenant_label / role_label /
 *       job_title_label; company_display không còn fallback slug thô.
 * Why:  API_CONTRACT §8.4–8.5 · OS 28 · FR-UC-M01 — FE/mobile không invent nhãn.
 * must_keep: Plane B′ company_uuid; U65; no lockout DDL; HRM-AUTH-203/201 codes
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: R-SPINE-MGR-HIER-01-PERSONA-LOCK
 * change_mode: FIX
 * What: BR-MOB-MGR-REPORTS-01 — `mobile_persona=emp` vẫn strip manager từ title,
 *       nhưng nếu countDirectReports>0 thì luôn withManagerRole (JWT + is_manager).
 * Why:  QA J-MOB-05 — HLD-0001 có ≥3 reports + pending leave nhưng personaLocksEmployee
 *       chặn promotion → ManagerApprovals không mount (tile→Thông báo).
 * SRS:  FR-UC-H03 L1 = direct_manager · J-MOB-05 · MOBILE_PERSONA_UX_MATRIX §2.1 (hierarchy supersedes seed emp)
 * must_keep: emp + 0 reports → employee only; leave manager_employee_id filter;
 *            manager_id assignment; AT-01 GWC; U65 no seed; không invent leave ladder
 */
import { HttpStatus, Injectable } from '@nestjs/common';
import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { ApiException } from '../common/api.exception';
import {
  HRM_COMPANY_UUID_BY_SLUG,
  HRM_PILOT_OPERATING_COMPANY_ID,
  isHrmMappedCompanyUuid,
} from '../common/hrm-list-scope';
import { getVerifiedInternalJwtPayload } from '../common/internal-auth';
import { signServiceJwt } from '../common/jwt-sign';
import { HrmDbService } from '../db/hrm-db.service';
import type { MobileLoginDto } from './dto/mobile-login.dto';
import type { MobileRefreshDto } from './dto/mobile-refresh.dto';
import {
  mobileCompanyLabelVi,
  mobileJobTitleLabelVi,
  mobileRoleLabelVi,
  mobileTenantLabelVi,
} from './mobile-membership-display';
import {
  ensureUatMobileEmployeeRow,
  matchesUatMobilePassword,
  parseUatMobileSeqFromLoginEmail,
  resolveCanonicalUatLoginEmail,
} from './uat-mobile-auth-ensure';
import { ensureUatMobilePilotTransactionData } from './uat-mobile-pilot-data-ensure';

type EmployeeAuthRow = {
  id: string;
  company_id: string;
  email: string;
  full_name: string;
  employee_code: string;
  job_title_key: string | null;
  custom_fields: Record<string, string> | null;
};

/** OS 28 — display-ready membership for ScopeScreen (labels from BE). */
export type MobileMembership = {
  tenant_id: string;
  company_id: string;
  company_uuid: string;
  employee_id: string;
  employee_code: string;
  employee_name: string;
  company_display: string;
  company_label: string;
  tenant_label: string;
  role_label: string;
  job_title_label: string;
  is_primary: boolean;
};

const ACCESS_TTL_SEC = 12 * 60 * 60;
const REFRESH_TTL_SEC = 30 * 24 * 60 * 60;
const MASTER_TENANT = (process.env.MASTER_TENANT_ID ?? 'xevn')
  .trim()
  .toLowerCase();
const MEMBER_COMPANY_SLUGS = new Set([
  'holding',
  'trsport',
  'logistics',
  'finance',
  'services',
]);

/** Documented portal Group CEO — mobile login after tenant-master wipe (not QA bulk seed). */
const PORTAL_GROUP_CEO_EMAIL = 'ceo@xe.vn';
const PORTAL_GROUP_CEO_EMPLOYEE_CODE = 'PORTAL-GCEO';
const PORTAL_GROUP_CEO_COMPANY_ID = 'holding';

@Injectable()
export class MobileAuthService {
  constructor(private readonly db: HrmDbService) {}

  private hashPassword(email: string, password: string): string {
    return createHash('sha256')
      .update(`${email.trim().toLowerCase()}:${password}`)
      .digest('hex');
  }

  private isPortalGroupCeoEmail(email: string): boolean {
    return email.trim().toLowerCase() === PORTAL_GROUP_CEO_EMAIL;
  }

  /** Portal password for documented Group CEO — dev default Xevn@2026; prod via env only. */
  private resolvePortalGroupCeoPassword(): string | undefined {
    const fromEnv = process.env.HRM_PORTAL_GROUP_CEO_PASSWORD?.trim();
    if (fromEnv) return fromEnv;
    if (process.env.NODE_ENV === 'production') return undefined;
    return process.env.PILOT_PORTAL_DEV_PASSWORD?.trim() || 'Xevn@2026';
  }

  private matchesPortalGroupCeoPassword(
    email: string,
    password: string,
  ): boolean {
    if (!this.isPortalGroupCeoEmail(email)) return false;
    const portalPw = this.resolvePortalGroupCeoPassword();
    if (!portalPw) return false;
    return password === portalPw;
  }

  private buildPortalGroupCeoCustomFields(
    portalPassword: string,
  ): Record<string, string> {
    const email = PORTAL_GROUP_CEO_EMAIL;
    return {
      tenant_id: MASTER_TENANT,
      is_primary: 'true',
      is_primary_membership: 'true',
      company_display: 'Tập đoàn X.E',
      mobile_password_hash: this.hashPassword(email, portalPassword),
    };
  }

  /**
   * Product ensure (not bulk seed): holding PORTAL-GCEO row for portal Group CEO
   * when tenant-master reset removed all employees — mirrors recruitment bridge ensure.
   */
  private async ensurePortalGroupCeoEmployeeRow(
    portalPassword: string,
  ): Promise<void> {
    const userKey = PORTAL_GROUP_CEO_EMAIL;
    const customFields = this.buildPortalGroupCeoCustomFields(portalPassword);

    const existing = await this.db.query<{ id: string }>(
      `
        SELECT id::text AS id
        FROM public.employees
        WHERE archived_at IS NULL
          AND status = 'active'
          AND lower(email) = $1
          AND company_id IN ($2, 'main')
        ORDER BY CASE WHEN company_id = $2 THEN 0 ELSE 1 END
        LIMIT 1;
      `,
      [userKey, PORTAL_GROUP_CEO_COMPANY_ID],
    );
    if (existing.rows[0]?.id) {
      await this.db.query(
        `
          UPDATE public.employees
          SET custom_fields = COALESCE(custom_fields, '{}'::jsonb) || $2::jsonb,
              job_title_key = COALESCE(NULLIF(job_title_key, ''), 'CEO'),
              updated_at = NOW()
          WHERE id = $1::uuid AND archived_at IS NULL;
        `,
        [existing.rows[0].id, JSON.stringify(customFields)],
      );
      return;
    }

    const byCode = await this.db.query<{ id: string }>(
      `
        SELECT id::text AS id
        FROM public.employees
        WHERE archived_at IS NULL
          AND company_id IN ($1, 'main')
          AND lower(employee_code) = lower($2)
        ORDER BY CASE WHEN company_id = $1 THEN 0 ELSE 1 END
        LIMIT 1;
      `,
      [PORTAL_GROUP_CEO_COMPANY_ID, PORTAL_GROUP_CEO_EMPLOYEE_CODE],
    );
    if (byCode.rows[0]?.id) {
      await this.db.query(
        `
          UPDATE public.employees
          SET email = $2,
              custom_fields = COALESCE(custom_fields, '{}'::jsonb) || $3::jsonb,
              job_title_key = COALESCE(NULLIF(job_title_key, ''), 'CEO'),
              updated_at = NOW()
          WHERE id = $1::uuid AND archived_at IS NULL;
        `,
        [byCode.rows[0].id, userKey, JSON.stringify(customFields)],
      );
      return;
    }

    const newId = randomUUID();
    await this.db.query(
      `
        INSERT INTO public.employees (
          id, company_id, employee_code, email, full_name, job_title_key, status, hired_at, custom_fields
        ) VALUES (
          $1::uuid, $2, $3, $4, $5, 'CEO', 'active', CURRENT_DATE, $6::jsonb
        );
      `,
      [
        newId,
        PORTAL_GROUP_CEO_COMPANY_ID,
        PORTAL_GROUP_CEO_EMPLOYEE_CODE,
        userKey,
        'CEO Tập đoàn',
        JSON.stringify(customFields),
      ],
    );
  }

  private async fetchActiveEmployeesByEmail(
    email: string,
    alsoEmail?: string,
  ): Promise<EmployeeAuthRow[]> {
    const emails = [email.trim().toLowerCase()];
    const alt = alsoEmail?.trim().toLowerCase();
    if (alt && !emails.includes(alt)) emails.push(alt);
    const res = await this.db.query<EmployeeAuthRow>(
      `
        SELECT id, company_id, email, full_name, employee_code, job_title_key, custom_fields
        FROM public.employees
        WHERE lower(email) = ANY($1::text[]) AND archived_at IS NULL AND status = 'active'
        ORDER BY company_id, employee_code;
      `,
      [emails],
    );
    return res.rows;
  }

  private verifyPassword(
    email: string,
    password: string,
    row: EmployeeAuthRow,
  ): boolean {
    const hashEmail = resolveCanonicalUatLoginEmail(email);
    const custom = row.custom_fields ?? {};
    const storedHash = custom.mobile_password_hash?.trim();
    if (storedHash) {
      const actual = Buffer.from(this.hashPassword(hashEmail, password), 'hex');
      const expected = Buffer.from(storedHash, 'hex');
      if (expected.length === actual.length) {
        const hashOk = timingSafeEqual(expected, actual);
        if (hashOk) return true;
        // Stale hash after reset/sync — documented portal CEO or UAT matrix password only.
        if (this.matchesPortalGroupCeoPassword(hashEmail, password))
          return true;
        if (matchesUatMobilePassword(hashEmail, password)) return true;
        return false;
      }
    }
    if (this.matchesPortalGroupCeoPassword(hashEmail, password)) return true;
    if (matchesUatMobilePassword(hashEmail, password)) return true;
    const pilot =
      process.env.HRM_MOBILE_PILOT_PASSWORD ??
      (process.env.NODE_ENV !== 'production' ? 'xevn-pilot' : undefined);
    if (!pilot) return false;
    return password === pilot;
  }

  deriveRoles(jobTitleKey: string | null): string[] {
    const key = (jobTitleKey ?? '').toUpperCase();
    const roles = ['employee'];
    if (
      key.includes('MANAGER') ||
      key.includes('SUPERVISOR') ||
      key.includes('CHRO') ||
      key === 'CEO' ||
      key === 'COO' ||
      key === 'CFO' ||
      key === 'CTO' ||
      key === 'DIRECTOR' ||
      key.includes('OPS_MANAGER')
    ) {
      roles.push('manager');
    }
    if (key.includes('CHRO') || key === 'CEO') {
      roles.push('hr_manager');
    }
    return [...new Set(roles)];
  }

  /** MOBILE_PERSONA_UX_MATRIX §2.1 — optional seed override (`mgr` / `emp`). */
  applyMobilePersonaRoleOverride(
    roles: string[],
    customFields: Record<string, string> | null | undefined,
  ): string[] {
    const persona = customFields?.mobile_persona?.trim().toLowerCase();
    if (
      persona === 'mgr' ||
      persona === 'manager' ||
      customFields?.is_manager === 'true'
    ) {
      return [...new Set([...roles, 'manager'])];
    }
    if (persona === 'emp' || persona === 'employee') {
      return roles.filter((r) => r !== 'manager' && r !== 'hr_manager');
    }
    return roles;
  }

  withManagerRole(roles: string[]): string[] {
    return [...new Set([...roles, 'manager'])];
  }

  isManagerRoles(roles: string[]): boolean {
    return roles.includes('manager') || roles.includes('hr_manager');
  }

  private async countDirectReports(employeeId: string): Promise<number> {
    const res = await this.db.query<{ count: number }>(
      `
        SELECT COUNT(*)::int AS count
        FROM public.employees
        WHERE manager_id = $1::uuid AND archived_at IS NULL AND status = 'active';
      `,
      [employeeId],
    );
    return res.rows[0]?.count ?? 0;
  }

  /**
   * BR-MOB-MGR-REPORTS-01 (R-SPINE-MGR-HIER-01-PERSONA-LOCK):
   * `mobile_persona=emp` strips title-based manager/hr_manager (seed EMP lane),
   * but hierarchy wins — directReports>0 always grants `manager` for L1 approvals
   * (FR-UC-H03 / J-MOB-05). Emp + 0 reports stays employee-only.
   */
  async resolveRolesForEmployee(row: EmployeeAuthRow): Promise<string[]> {
    let roles = this.deriveRoles(row.job_title_key);
    roles = this.applyMobilePersonaRoleOverride(roles, row.custom_fields);
    // Xử lý: seed emp chỉ khóa title; có cấp dưới (manager_id) → mở quyền duyệt L1.
    if (!this.isManagerRoles(roles)) {
      const directReports = await this.countDirectReports(row.id);
      if (directReports > 0) {
        roles = this.withManagerRole(roles);
      }
    }
    return roles;
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

  /**
   * Plane B′ attendance claim — ADR bridge §4.3.3 / D-HRM-MOB-UUID-BPRIME-01.
   * Custom `attendance_company_uuid` accepted only when ∈ HRM_COMPANY_UUID_BY_SLUG;
   * LE / hash / unknown → map-by-slug (`main` → holding) or reject.
   */
  resolveCompanyUuid(row: EmployeeAuthRow, _tenantId: string): string {
    const custom = row.custom_fields ?? {};
    const fromCustom = custom.attendance_company_uuid?.trim();
    // Xử lý: chỉ nhận UUID Plane B′ từ custom — LE/hash bị bỏ qua, map theo slug.
    if (fromCustom && isHrmMappedCompanyUuid(fromCustom)) {
      return fromCustom.trim().toLowerCase();
    }
    const slug = row.company_id.trim().toLowerCase();
    if (slug === HRM_PILOT_OPERATING_COMPANY_ID) {
      return HRM_COMPANY_UUID_BY_SLUG.holding;
    }
    const mapped =
      HRM_COMPANY_UUID_BY_SLUG[slug as keyof typeof HRM_COMPANY_UUID_BY_SLUG];
    if (mapped) {
      return mapped;
    }
    throw new ApiException(
      'HRM-AUTH-409',
      'Không xác định được company_uuid Plane B′ cho phạm vi nhân viên — liên hệ quản trị',
      HttpStatus.CONFLICT,
      { company_id: row.company_id, employee_id: row.id },
    );
  }

  rowToMembership(
    row: EmployeeAuthRow,
    rolesHint?: string[],
  ): MobileMembership {
    const custom = row.custom_fields ?? {};
    const tenantId = this.resolveTenantId(row);
    const companyLabel = mobileCompanyLabelVi(
      row.company_id,
      custom.company_display,
    );
    const roles = rolesHint ?? this.deriveRoles(row.job_title_key);
    return {
      tenant_id: tenantId,
      company_id: row.company_id,
      company_uuid: this.resolveCompanyUuid(row, tenantId),
      employee_id: row.id,
      employee_code: row.employee_code,
      employee_name: row.full_name,
      // Xử lý: company_display = label VI — không trả slug thô khi thiếu custom.
      company_display: companyLabel,
      company_label: companyLabel,
      tenant_label: mobileTenantLabelVi(tenantId),
      role_label: mobileRoleLabelVi(roles),
      job_title_label: mobileJobTitleLabelVi(row.job_title_key),
      is_primary:
        custom.is_primary_membership === 'true' || custom.is_primary === 'true',
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
    const refreshToken = signServiceJwt(
      { ...base, typ: 'refresh' },
      REFRESH_TTL_SEC,
    );
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in_sec: ACCESS_TTL_SEC,
      token_type: 'Bearer' as const,
    };
  }

  private pickDefaultMembership(
    memberships: MobileMembership[],
  ): MobileMembership {
    return memberships.find((m) => m.is_primary) ?? memberships[0];
  }

  private async buildLoginResponse(
    email: string,
    row: EmployeeAuthRow,
    allRows: EmployeeAuthRow[],
  ) {
    const roles = await this.resolveRolesForEmployee(row);
    const memberships = await Promise.all(
      allRows.map(async (r) => {
        const memberRoles =
          r.id === row.id ? roles : await this.resolveRolesForEmployee(r);
        return this.rowToMembership(r, memberRoles);
      }),
    );
    const active =
      memberships.find((m) => m.employee_id === row.id) ??
      this.rowToMembership(row, roles);
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
        job_title_label: mobileJobTitleLabelVi(row.job_title_key),
      },
      roles,
      is_manager: this.isManagerRoles(roles),
      memberships,
      active_membership: active,
      default_tenant_id: active.tenant_id,
      default_company_id: active.company_id,
      company_uuid: active.company_uuid,
    };
  }

  private async ensureDocumentedMobileLoginRow(
    email: string,
    password: string,
  ): Promise<void> {
    if (this.matchesPortalGroupCeoPassword(email, password)) {
      await this.ensurePortalGroupCeoEmployeeRow(password);
      return;
    }
    const uatSeq = parseUatMobileSeqFromLoginEmail(email);
    if (uatSeq && matchesUatMobilePassword(email, password)) {
      await ensureUatMobileEmployeeRow(this.db, uatSeq, password);
    }
  }

  async login(
    body: MobileLoginDto,
    scopeHint?: { tenantId?: string; companyId?: string },
  ) {
    const rawEmail = body.email.trim().toLowerCase();
    const email = resolveCanonicalUatLoginEmail(rawEmail);
    const uatSeq = parseUatMobileSeqFromLoginEmail(rawEmail);
    // Legacy nguyen.van.an.#### alias — upsert canonical row before fetch (stale legacy row parity).
    if (uatSeq && matchesUatMobilePassword(rawEmail, body.password)) {
      await ensureUatMobileEmployeeRow(this.db, uatSeq, body.password);
    }
    let rows = await this.fetchActiveEmployeesByEmail(
      email,
      rawEmail !== email ? rawEmail : undefined,
    );
    if (!rows.length) {
      await this.ensureDocumentedMobileLoginRow(rawEmail, body.password);
      rows = await this.fetchActiveEmployeesByEmail(
        email,
        rawEmail !== email ? rawEmail : undefined,
      );
    }
    let verified = rows.filter((row) =>
      this.verifyPassword(email, body.password, row),
    );
    if (!verified.length) {
      await this.ensureDocumentedMobileLoginRow(rawEmail, body.password);
      rows = await this.fetchActiveEmployeesByEmail(
        email,
        rawEmail !== email ? rawEmail : undefined,
      );
      verified = rows.filter((row) =>
        this.verifyPassword(email, body.password, row),
      );
    }
    if (!verified.length) {
      throw new ApiException(
        'HRM-AUTH-401',
        'Email hoặc mật khẩu không đúng',
        HttpStatus.UNAUTHORIZED,
      );
    }

    let selected = verified[0];
    if (scopeHint?.tenantId && scopeHint?.companyId) {
      const match = verified.find((row) => {
        try {
          const m = this.rowToMembership(row);
          return (
            m.tenant_id === scopeHint.tenantId &&
            m.company_id === scopeHint.companyId
          );
        } catch {
          return false;
        }
      });
      if (match) selected = match;
    } else if (verified.length > 1) {
      selected =
        verified.find((row) => {
          try {
            return this.rowToMembership(row).is_primary;
          } catch {
            return false;
          }
        }) ?? verified[0];
    }

    if (uatSeq && matchesUatMobilePassword(rawEmail, body.password)) {
      await ensureUatMobilePilotTransactionData(
        this.db,
        uatSeq,
        body.password,
        {
          id: selected.id,
          company_id: selected.company_id,
          employee_code: selected.employee_code,
          full_name: selected.full_name,
        },
      );
    }

    return await this.buildLoginResponse(email, selected, verified);
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
      throw new ApiException(
        'HRM-AUTH-404',
        'Không tìm thấy phạm vi nhân viên',
        HttpStatus.NOT_FOUND,
      );
    }
    const allRes = await this.db.query<EmployeeAuthRow>(
      `
        SELECT id, company_id, email, full_name, employee_code, job_title_key, custom_fields
        FROM public.employees
        WHERE lower(email) = $1 AND archived_at IS NULL AND status = 'active';
      `,
      [email.trim().toLowerCase()],
    );
    return await this.buildLoginResponse(email, row, allRes.rows);
  }

  async refresh(body: MobileRefreshDto) {
    const payload = getVerifiedInternalJwtPayload(
      `Bearer ${body.refresh_token.trim()}`,
    );
    if (!payload || payload.typ !== 'refresh') {
      throw new ApiException(
        'HRM-AUTH-401',
        'Refresh token không hợp lệ',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const tenantId = String(payload.tenantId ?? payload.tenant_id ?? '');
    const companyId = String(payload.companyId ?? payload.company_id ?? '');
    const employeeId = String(payload.employee_id ?? '');
    let companyUuid = String(payload.company_uuid ?? '');
    const email = String(payload.sub ?? '')
      .trim()
      .toLowerCase();
    if (!tenantId || !companyId || !employeeId) {
      throw new ApiException(
        'HRM-AUTH-401',
        'Refresh token thiếu phạm vi',
        HttpStatus.UNAUTHORIZED,
      );
    }
    let roles = Array.isArray(payload.roles)
      ? payload.roles.filter((r): r is string => typeof r === 'string')
      : ['employee'];
    const rowRes = await this.db.query<EmployeeAuthRow>(
      `
        SELECT id, company_id, email, full_name, employee_code, job_title_key, custom_fields
        FROM public.employees
        WHERE id = $1::uuid AND archived_at IS NULL AND status = 'active'
        LIMIT 1;
      `,
      [employeeId],
    );
    const row = rowRes.rows[0];
    if (row) {
      roles = await this.resolveRolesForEmployee(row);
      // Xử lý: nâng claim cũ (hash) → Plane B′ map khi refresh còn employee row.
      companyUuid = this.resolveCompanyUuid(row, tenantId);
    } else if (!isHrmMappedCompanyUuid(companyUuid)) {
      throw new ApiException(
        'HRM-AUTH-409',
        'Refresh token company_uuid không thuộc Plane B′ — đăng nhập lại',
        HttpStatus.CONFLICT,
        { company_uuid: companyUuid },
      );
    }
    return this.issueTokens({
      tenantId,
      companyId,
      employeeId,
      email,
      roles,
      companyUuid,
    });
  }
}
