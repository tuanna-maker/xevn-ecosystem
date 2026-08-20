import { FleetService } from './fleet.service';
export declare class FleetController {
    private readonly fleet;
    constructor(fleet: FleetService);
    private assertAccess;
    listVehicles(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, companyId: string | undefined, queryCompanyId?: string, status?: string, limitRaw?: string): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: {
            id: string;
            tenant_id: string;
            company_id: string;
            license_plate: string;
            fleet_fields: Record<string, unknown>;
            status: string;
            created_at: string;
            updated_at: string;
        }[];
    }>>;
}
