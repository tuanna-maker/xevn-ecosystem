import { HrmAdminService } from './hrm-admin.service';
import { CreateCompanyAdminDto } from './dto/create-company-admin.dto';
import { CreatePlatformAdminDto } from './dto/create-platform-admin.dto';
import { InviteEmployeesDto } from './dto/invite-employees.dto';
import { ResetUserPasswordDto } from './dto/reset-user-password.dto';
export declare class HrmAdminController {
    private readonly hrmAdminService;
    constructor(hrmAdminService: HrmAdminService);
    createPlatformAdmin(authorization: string | undefined, body: CreatePlatformAdminDto): Promise<import("../common/api-response").ApiSuccess<{
        success: boolean;
        user_id: string;
    }>>;
    createCompanyAdmin(authorization: string | undefined, body: CreateCompanyAdminDto): Promise<import("../common/api-response").ApiSuccess<{
        success: boolean;
        user_id: string;
        is_existing_user: boolean;
    }>>;
    inviteEmployees(authorization: string | undefined, body: InviteEmployeesDto): Promise<import("../common/api-response").ApiSuccess<{
        success: boolean;
        total: number;
        invited: number;
        failed: number;
        results: {
            email: string;
            success: boolean;
            error?: string;
        }[];
    }>>;
    resetUserPassword(authorization: string | undefined, body: ResetUserPasswordDto): Promise<import("../common/api-response").ApiSuccess<{
        success: boolean;
    }>>;
    listAdminCompanies(authorization: string | undefined): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: {
            id: string;
            name: string;
            code: string;
        }[];
    }>>;
    listCompanyMemberships(authorization: string | undefined, companyId?: string): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>>;
    upsertCompanyMembership(authorization: string | undefined, body: {
        email: string;
        full_name: string;
        role: string;
        company_id: string;
        employee_id?: string | null;
        status?: string;
    }): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    updateCompanyMembership(authorization: string | undefined, membershipId: string, body: {
        role?: string;
        employee_id?: string | null;
        status?: string;
        full_name?: string;
        email?: string;
    }): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    deleteCompanyMembership(authorization: string | undefined, membershipId: string): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
    }>>;
}
