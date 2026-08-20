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
exports.MobileAuthService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const api_exception_1 = require("../common/api.exception");
const hrm_list_scope_1 = require("../common/hrm-list-scope");
const internal_auth_1 = require("../common/internal-auth");
const jwt_sign_1 = require("../common/jwt-sign");
const hrm_db_service_1 = require("../db/hrm-db.service");
const ACCESS_TTL_SEC = 12 * 60 * 60;
const REFRESH_TTL_SEC = 30 * 24 * 60 * 60;
const MASTER_TENANT = (process.env.MASTER_TENANT_ID ?? 'xevn').trim().toLowerCase();
const MEMBER_COMPANY_SLUGS = new Set(['holding', 'trsport', 'logistics', 'finance', 'services']);
let MobileAuthService = class MobileAuthService {
    db;
    constructor(db) {
        this.db = db;
    }
    hashPassword(email, password) {
        return (0, node_crypto_1.createHash)('sha256').update(`${email.trim().toLowerCase()}:${password}`).digest('hex');
    }
    verifyPassword(email, password, row) {
        const custom = row.custom_fields ?? {};
        const storedHash = custom.mobile_password_hash?.trim();
        if (storedHash) {
            const actual = Buffer.from(this.hashPassword(email, password), 'hex');
            const expected = Buffer.from(storedHash, 'hex');
            if (expected.length === actual.length) {
                return (0, node_crypto_1.timingSafeEqual)(expected, actual);
            }
        }
        const pilot = process.env.HRM_MOBILE_PILOT_PASSWORD ??
            (process.env.NODE_ENV !== 'production' ? 'xevn-pilot' : undefined);
        if (!pilot)
            return false;
        return password === pilot;
    }
    deriveRoles(jobTitleKey) {
        const key = (jobTitleKey ?? '').toUpperCase();
        const roles = ['employee'];
        if (key.includes('MANAGER') ||
            key.includes('SUPERVISOR') ||
            key.includes('CHRO') ||
            key === 'CEO' ||
            key === 'COO' ||
            key === 'CFO' ||
            key === 'CTO' ||
            key === 'DIRECTOR' ||
            key.includes('OPS_MANAGER')) {
            roles.push('manager');
        }
        if (key.includes('CHRO') || key === 'CEO') {
            roles.push('hr_manager');
        }
        return [...new Set(roles)];
    }
    applyMobilePersonaRoleOverride(roles, customFields) {
        const persona = customFields?.mobile_persona?.trim().toLowerCase();
        if (persona === 'mgr' ||
            persona === 'manager' ||
            customFields?.is_manager === 'true') {
            return [...new Set([...roles, 'manager'])];
        }
        if (persona === 'emp' || persona === 'employee') {
            return roles.filter((r) => r !== 'manager' && r !== 'hr_manager');
        }
        return roles;
    }
    withManagerRole(roles) {
        return [...new Set([...roles, 'manager'])];
    }
    isManagerRoles(roles) {
        return roles.includes('manager') || roles.includes('hr_manager');
    }
    async countDirectReports(employeeId) {
        const res = await this.db.query(`
        SELECT COUNT(*)::int AS count
        FROM public.employees
        WHERE manager_id = $1::uuid AND archived_at IS NULL AND status = 'active';
      `, [employeeId]);
        return res.rows[0]?.count ?? 0;
    }
    async resolveRolesForEmployee(row) {
        let roles = this.deriveRoles(row.job_title_key);
        roles = this.applyMobilePersonaRoleOverride(roles, row.custom_fields);
        const persona = row.custom_fields?.mobile_persona?.trim().toLowerCase();
        const personaLocksEmployee = persona === 'emp' || persona === 'employee';
        if (!personaLocksEmployee && !this.isManagerRoles(roles)) {
            const directReports = await this.countDirectReports(row.id);
            if (directReports > 0) {
                roles = this.withManagerRole(roles);
            }
        }
        return roles;
    }
    resolveTenantId(row) {
        const custom = row.custom_fields ?? {};
        const fromCustom = custom.tenant_id?.trim().toLowerCase();
        if (fromCustom)
            return fromCustom;
        if (MEMBER_COMPANY_SLUGS.has(row.company_id.trim().toLowerCase())) {
            return MASTER_TENANT;
        }
        if (row.company_id.trim().toLowerCase() === 'main') {
            throw new api_exception_1.ApiException('HRM-AUTH-403', 'Nhân viên thiếu tenant_id trong hồ sơ — liên hệ quản trị', common_1.HttpStatus.FORBIDDEN, { employee_id: row.id });
        }
        return MASTER_TENANT;
    }
    resolveCompanyUuid(row, _tenantId) {
        const custom = row.custom_fields ?? {};
        const fromCustom = custom.attendance_company_uuid?.trim();
        if (fromCustom && (0, hrm_list_scope_1.isHrmMappedCompanyUuid)(fromCustom)) {
            return fromCustom.trim().toLowerCase();
        }
        const slug = row.company_id.trim().toLowerCase();
        if (slug === hrm_list_scope_1.HRM_PILOT_OPERATING_COMPANY_ID) {
            return hrm_list_scope_1.HRM_COMPANY_UUID_BY_SLUG.holding;
        }
        const mapped = hrm_list_scope_1.HRM_COMPANY_UUID_BY_SLUG[slug];
        if (mapped) {
            return mapped;
        }
        throw new api_exception_1.ApiException('HRM-AUTH-409', 'Không xác định được company_uuid Plane B′ cho phạm vi nhân viên — liên hệ quản trị', common_1.HttpStatus.CONFLICT, { company_id: row.company_id, employee_id: row.id });
    }
    rowToMembership(row) {
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
    issueTokens(input) {
        const base = {
            sub: input.email,
            tenantId: input.tenantId,
            companyId: input.companyId,
            employee_id: input.employeeId,
            company_uuid: input.companyUuid,
            roles: input.roles,
        };
        const accessToken = (0, jwt_sign_1.signServiceJwt)(base, ACCESS_TTL_SEC);
        const refreshToken = (0, jwt_sign_1.signServiceJwt)({ ...base, typ: 'refresh' }, REFRESH_TTL_SEC);
        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in_sec: ACCESS_TTL_SEC,
            token_type: 'Bearer',
        };
    }
    pickDefaultMembership(memberships) {
        return memberships.find((m) => m.is_primary) ?? memberships[0];
    }
    async buildLoginResponse(email, row, allRows) {
        const memberships = allRows.map((r) => this.rowToMembership(r));
        const active = this.rowToMembership(row);
        const roles = await this.resolveRolesForEmployee(row);
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
            is_manager: this.isManagerRoles(roles),
            memberships,
            active_membership: active,
            default_tenant_id: active.tenant_id,
            default_company_id: active.company_id,
            company_uuid: active.company_uuid,
        };
    }
    async login(body, scopeHint) {
        const email = body.email.trim().toLowerCase();
        const res = await this.db.query(`
        SELECT id, company_id, email, full_name, employee_code, job_title_key, custom_fields
        FROM public.employees
        WHERE lower(email) = $1 AND archived_at IS NULL AND status = 'active'
        ORDER BY company_id, employee_code;
      `, [email]);
        const verified = res.rows.filter((row) => this.verifyPassword(email, body.password, row));
        if (!verified.length) {
            throw new api_exception_1.ApiException('HRM-AUTH-401', 'Email hoặc mật khẩu không đúng', common_1.HttpStatus.UNAUTHORIZED);
        }
        let selected = verified[0];
        if (scopeHint?.tenantId && scopeHint?.companyId) {
            const match = verified.find((row) => {
                try {
                    const m = this.rowToMembership(row);
                    return m.tenant_id === scopeHint.tenantId && m.company_id === scopeHint.companyId;
                }
                catch {
                    return false;
                }
            });
            if (match)
                selected = match;
        }
        else if (verified.length > 1) {
            selected = verified.find((row) => {
                try {
                    return this.rowToMembership(row).is_primary;
                }
                catch {
                    return false;
                }
            }) ?? verified[0];
        }
        return await this.buildLoginResponse(email, selected, verified);
    }
    async selectMembership(email, employeeId) {
        const res = await this.db.query(`
        SELECT id, company_id, email, full_name, employee_code, job_title_key, custom_fields
        FROM public.employees
        WHERE id = $1::uuid AND lower(email) = $2 AND archived_at IS NULL AND status = 'active'
        LIMIT 1;
      `, [employeeId, email.trim().toLowerCase()]);
        const row = res.rows[0];
        if (!row) {
            throw new api_exception_1.ApiException('HRM-AUTH-404', 'Không tìm thấy phạm vi nhân viên', common_1.HttpStatus.NOT_FOUND);
        }
        const allRes = await this.db.query(`
        SELECT id, company_id, email, full_name, employee_code, job_title_key, custom_fields
        FROM public.employees
        WHERE lower(email) = $1 AND archived_at IS NULL AND status = 'active';
      `, [email.trim().toLowerCase()]);
        return await this.buildLoginResponse(email, row, allRes.rows);
    }
    async refresh(body) {
        const payload = (0, internal_auth_1.getVerifiedInternalJwtPayload)(`Bearer ${body.refresh_token.trim()}`);
        if (!payload || payload.typ !== 'refresh') {
            throw new api_exception_1.ApiException('HRM-AUTH-401', 'Refresh token không hợp lệ', common_1.HttpStatus.UNAUTHORIZED);
        }
        const tenantId = String(payload.tenantId ?? payload.tenant_id ?? '');
        const companyId = String(payload.companyId ?? payload.company_id ?? '');
        const employeeId = String(payload.employee_id ?? '');
        let companyUuid = String(payload.company_uuid ?? '');
        const email = String(payload.sub ?? '').trim().toLowerCase();
        if (!tenantId || !companyId || !employeeId) {
            throw new api_exception_1.ApiException('HRM-AUTH-401', 'Refresh token thiếu phạm vi', common_1.HttpStatus.UNAUTHORIZED);
        }
        let roles = Array.isArray(payload.roles)
            ? payload.roles.filter((r) => typeof r === 'string')
            : ['employee'];
        const rowRes = await this.db.query(`
        SELECT id, company_id, email, full_name, employee_code, job_title_key, custom_fields
        FROM public.employees
        WHERE id = $1::uuid AND archived_at IS NULL AND status = 'active'
        LIMIT 1;
      `, [employeeId]);
        const row = rowRes.rows[0];
        if (row) {
            roles = await this.resolveRolesForEmployee(row);
            companyUuid = this.resolveCompanyUuid(row, tenantId);
        }
        else if (!(0, hrm_list_scope_1.isHrmMappedCompanyUuid)(companyUuid)) {
            throw new api_exception_1.ApiException('HRM-AUTH-409', 'Refresh token company_uuid không thuộc Plane B′ — đăng nhập lại', common_1.HttpStatus.CONFLICT, { company_uuid: companyUuid });
        }
        return this.issueTokens({ tenantId, companyId, employeeId, email, roles, companyUuid });
    }
};
exports.MobileAuthService = MobileAuthService;
exports.MobileAuthService = MobileAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [hrm_db_service_1.HrmDbService])
], MobileAuthService);
//# sourceMappingURL=mobile-auth.service.js.map