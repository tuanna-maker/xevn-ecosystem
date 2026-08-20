import { CreateEmployeeInsuranceDto } from './dto/create-employee-insurance.dto';
import { ListEmployeeInsurancesQueryDto } from './dto/list-employee-insurances.query.dto';
import { UpdateEmployeeInsuranceDto } from './dto/update-employee-insurance.dto';
import { EmployeeInsurancesService } from './employee-insurances.service';
export declare class EmployeeInsurancesController {
    private readonly service;
    constructor(service: EmployeeInsurancesService);
    private assertAccess;
    list(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: ListEmployeeInsurancesQueryDto): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: {
            contribution: number;
            employer_contribution: number;
            id: string;
            employee_id: string;
            company_id: string;
            type: string;
            provider: string;
            policy_number: string | null;
            start_date: string | null;
            end_date: string | null;
            status: string;
            notes: string | null;
            created_at: string;
            updated_at: string;
        }[];
    }>>;
    getById(insuranceId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        contribution: number;
        employer_contribution: number;
        id: string;
        employee_id: string;
        company_id: string;
        type: string;
        provider: string;
        policy_number: string | null;
        start_date: string | null;
        end_date: string | null;
        status: string;
        notes: string | null;
        created_at: string;
        updated_at: string;
    }>>;
    create(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, body: CreateEmployeeInsuranceDto): Promise<import("../common/api-response").ApiSuccess<{
        contribution: number;
        employer_contribution: number;
        id: string;
        employee_id: string;
        company_id: string;
        type: string;
        provider: string;
        policy_number: string | null;
        start_date: string | null;
        end_date: string | null;
        status: string;
        notes: string | null;
        created_at: string;
        updated_at: string;
    }>>;
    update(insuranceId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, body: UpdateEmployeeInsuranceDto): Promise<import("../common/api-response").ApiSuccess<{
        contribution: number;
        employer_contribution: number;
        id: string;
        employee_id: string;
        company_id: string;
        type: string;
        provider: string;
        policy_number: string | null;
        start_date: string | null;
        end_date: string | null;
        status: string;
        notes: string | null;
        created_at: string;
        updated_at: string;
    }>>;
    remove(insuranceId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
    }>>;
}
