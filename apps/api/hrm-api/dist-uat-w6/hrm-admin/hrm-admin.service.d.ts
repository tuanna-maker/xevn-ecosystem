import { HrmDbService } from '../db/hrm-db.service';
import { CreateCompanyAdminDto } from './dto/create-company-admin.dto';
import { CreatePlatformAdminDto } from './dto/create-platform-admin.dto';
import { InviteEmployeesDto } from './dto/invite-employees.dto';
import { ResetUserPasswordDto } from './dto/reset-user-password.dto';
export declare function generateInviteTempPassword(length?: number): string;
export declare class HrmAdminService {
    private readonly db;
    private readonly internalApiKey;
    constructor(db: HrmDbService);
    private hashPassword;
    private ensureAdminSchema;
    private resolveActorSub;
    private resolveActorUserId;
    private resolveCredentialAuditAction;
    private assertPlatformAdmin;
    private findOrCreatePortalUser;
    createPlatformAdmin(authorization: string | undefined, payload: CreatePlatformAdminDto): Promise<{
        success: boolean;
        user_id: string;
    }>;
    createCompanyAdmin(authorization: string | undefined, payload: CreateCompanyAdminDto): Promise<{
        success: boolean;
        user_id: string;
        is_existing_user: boolean;
    }>;
    inviteEmployees(authorization: string | undefined, payload: InviteEmployeesDto): Promise<{
        success: boolean;
        total: number;
        invited: number;
        failed: number;
        results: {
            email: string;
            success: boolean;
            error?: string;
        }[];
    }>;
    resetUserPassword(authorization: string | undefined, payload: ResetUserPasswordDto): Promise<{
        success: boolean;
    }>;
    listCompanyMemberships(authorization: string | undefined, companyId?: string): Promise<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>;
    listAdminCompanies(authorization: string | undefined): Promise<{
        total: number;
        data: {
            id: string;
            name: string;
            code: string;
        }[];
    }>;
    updateCompanyMembership(authorization: string | undefined, membershipId: string, payload: {
        role?: string;
        employee_id?: string | null;
        status?: string;
        full_name?: string;
        email?: string;
    }): Promise<import("pg").QueryResultRow>;
    deleteCompanyMembership(authorization: string | undefined, membershipId: string): Promise<{
        id: string;
    }>;
    upsertCompanyMembership(authorization: string | undefined, payload: {
        email: string;
        full_name: string;
        role: string;
        company_id: string;
        employee_id?: string | null;
        status?: string;
    }): Promise<import("pg").QueryResultRow>;
}
