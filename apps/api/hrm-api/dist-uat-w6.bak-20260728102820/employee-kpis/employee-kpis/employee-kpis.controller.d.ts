import { CreateEmployeeKpiDto } from './dto/create-employee-kpi.dto';
import { ListEmployeeKpisQueryDto } from './dto/list-employee-kpis.query.dto';
import { EmployeeKpisService } from './employee-kpis.service';
export declare class EmployeeKpisController {
    private readonly service;
    constructor(service: EmployeeKpisService);
    private assertAccess;
    list(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: ListEmployeeKpisQueryDto): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>>;
    create(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, body: CreateEmployeeKpiDto): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    remove(kpiId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
    }>>;
}
