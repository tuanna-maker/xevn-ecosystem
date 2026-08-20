import { CreateEmployeeBenefitDto } from './dto/create-employee-benefit.dto';
import { ListEmployeeBenefitsQueryDto } from './dto/list-employee-benefits.query.dto';
import { UpdateEmployeeBenefitDto } from './dto/update-employee-benefit.dto';
import { EmployeeBenefitsService } from './employee-benefits.service';
export declare class EmployeeBenefitsController {
    private readonly service;
    constructor(service: EmployeeBenefitsService);
    private assertAccess;
    list(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: ListEmployeeBenefitsQueryDto): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: {
            value: number;
            id: string;
            employee_id: string;
            company_id: string;
            name: string;
            category: string;
            unit: string;
            frequency: string;
            start_date: string | null;
            end_date: string | null;
            status: string;
            description: string | null;
            created_at: string;
            updated_at: string;
        }[];
    }>>;
    getById(benefitId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        value: number;
        id: string;
        employee_id: string;
        company_id: string;
        name: string;
        category: string;
        unit: string;
        frequency: string;
        start_date: string | null;
        end_date: string | null;
        status: string;
        description: string | null;
        created_at: string;
        updated_at: string;
    }>>;
    create(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, body: CreateEmployeeBenefitDto): Promise<import("../common/api-response").ApiSuccess<{
        value: number;
        id: string;
        employee_id: string;
        company_id: string;
        name: string;
        category: string;
        unit: string;
        frequency: string;
        start_date: string | null;
        end_date: string | null;
        status: string;
        description: string | null;
        created_at: string;
        updated_at: string;
    }>>;
    update(benefitId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, body: UpdateEmployeeBenefitDto): Promise<import("../common/api-response").ApiSuccess<{
        value: number;
        id: string;
        employee_id: string;
        company_id: string;
        name: string;
        category: string;
        unit: string;
        frequency: string;
        start_date: string | null;
        end_date: string | null;
        status: string;
        description: string | null;
        created_at: string;
        updated_at: string;
    }>>;
    remove(benefitId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
    }>>;
}
