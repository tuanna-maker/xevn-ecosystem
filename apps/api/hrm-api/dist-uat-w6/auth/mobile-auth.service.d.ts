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
export declare class MobileAuthService {
    private readonly db;
    constructor(db: HrmDbService);
    private hashPassword;
    private verifyPassword;
    deriveRoles(jobTitleKey: string | null): string[];
    applyMobilePersonaRoleOverride(roles: string[], customFields: Record<string, string> | null | undefined): string[];
    withManagerRole(roles: string[]): string[];
    isManagerRoles(roles: string[]): boolean;
    private countDirectReports;
    resolveRolesForEmployee(row: EmployeeAuthRow): Promise<string[]>;
    resolveTenantId(row: EmployeeAuthRow): string;
    resolveCompanyUuid(row: EmployeeAuthRow, _tenantId: string): string;
    rowToMembership(row: EmployeeAuthRow): MobileMembership;
    private issueTokens;
    private pickDefaultMembership;
    private buildLoginResponse;
    login(body: MobileLoginDto, scopeHint?: {
        tenantId?: string;
        companyId?: string;
    }): Promise<{
        employee: {
            id: string;
            company_id: string;
            email: string;
            full_name: string;
            employee_code: string;
            job_title_key: string | null;
        };
        roles: string[];
        is_manager: boolean;
        memberships: MobileMembership[];
        active_membership: MobileMembership;
        default_tenant_id: string;
        default_company_id: string;
        company_uuid: string;
        access_token: string;
        refresh_token: string;
        expires_in_sec: number;
        token_type: "Bearer";
    }>;
    selectMembership(email: string, employeeId: string): Promise<{
        employee: {
            id: string;
            company_id: string;
            email: string;
            full_name: string;
            employee_code: string;
            job_title_key: string | null;
        };
        roles: string[];
        is_manager: boolean;
        memberships: MobileMembership[];
        active_membership: MobileMembership;
        default_tenant_id: string;
        default_company_id: string;
        company_uuid: string;
        access_token: string;
        refresh_token: string;
        expires_in_sec: number;
        token_type: "Bearer";
    }>;
    refresh(body: MobileRefreshDto): Promise<{
        access_token: string;
        refresh_token: string;
        expires_in_sec: number;
        token_type: "Bearer";
    }>;
}
export {};
