import { OnModuleInit } from '@nestjs/common';
import { HrmDbService } from '../db/hrm-db.service';
export type FleetVehicleRow = {
    id: string;
    tenant_id: string;
    company_id: string;
    license_plate: string;
    fleet_fields: Record<string, unknown>;
    status: string;
    created_at: string;
    updated_at: string;
};
export declare class FleetService implements OnModuleInit {
    private readonly db;
    constructor(db: HrmDbService);
    onModuleInit(): Promise<void>;
    ensureSchema(): Promise<void>;
    private mapRow;
    listVehicles(tenantId: string, companyIds: string[], opts?: {
        status?: string;
        limit?: number;
    }): Promise<{
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
    }>;
    upsertVehicle(input: {
        tenantId: string;
        companyId: string;
        licensePlate: string;
        fleetFields: Record<string, unknown>;
        status?: string;
    }): Promise<{
        id: string;
        tenant_id: string;
        company_id: string;
        license_plate: string;
        fleet_fields: Record<string, unknown>;
        status: string;
        created_at: string;
        updated_at: string;
    }>;
}
