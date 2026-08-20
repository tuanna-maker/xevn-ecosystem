import { MobileLoginDto } from './dto/mobile-login.dto';
import { MobileRefreshDto } from './dto/mobile-refresh.dto';
import { MobileSelectMembershipDto } from './dto/mobile-select-membership.dto';
import { MobileAuthService } from './mobile-auth.service';
export declare class MobileAuthController {
    private readonly mobileAuth;
    constructor(mobileAuth: MobileAuthService);
    login(tenantId: string | undefined, companyId: string | undefined, body: MobileLoginDto): Promise<import("../common/api-response").ApiSuccess<{
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
        memberships: import("./mobile-auth.service").MobileMembership[];
        active_membership: import("./mobile-auth.service").MobileMembership;
        default_tenant_id: string;
        default_company_id: string;
        company_uuid: string;
        access_token: string;
        refresh_token: string;
        expires_in_sec: number;
        token_type: "Bearer";
    }>>;
    selectMembership(authorization: string | undefined, body: MobileSelectMembershipDto): Promise<import("../common/api-response").ApiSuccess<{
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
        memberships: import("./mobile-auth.service").MobileMembership[];
        active_membership: import("./mobile-auth.service").MobileMembership;
        default_tenant_id: string;
        default_company_id: string;
        company_uuid: string;
        access_token: string;
        refresh_token: string;
        expires_in_sec: number;
        token_type: "Bearer";
    }>>;
    refresh(body: MobileRefreshDto): Promise<import("../common/api-response").ApiSuccess<{
        access_token: string;
        refresh_token: string;
        expires_in_sec: number;
        token_type: "Bearer";
    }>>;
}
