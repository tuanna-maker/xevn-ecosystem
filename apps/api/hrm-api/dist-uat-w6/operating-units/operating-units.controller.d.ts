import { OperatingUnitsService } from './operating-units.service';
export declare class OperatingUnitsController {
    private readonly service;
    constructor(service: OperatingUnitsService);
    private assertAccess;
    list(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined): Promise<import("../common/api-response").ApiSuccess<import("./hrm-operating-unit-registry").HrmOperatingUnitRow[]>>;
}
