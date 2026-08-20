import { HrmDbService } from '../db/hrm-db.service';
import { CreateEmployeeInsuranceDto } from './dto/create-employee-insurance.dto';
import { ListEmployeeInsurancesQueryDto } from './dto/list-employee-insurances.query.dto';
import { UpdateEmployeeInsuranceDto } from './dto/update-employee-insurance.dto';
export type EmployeeInsuranceRow = {
    id: string;
    employee_id: string;
    company_id: string;
    type: string;
    provider: string;
    policy_number: string | null;
    start_date: string | null;
    end_date: string | null;
    contribution: string | number;
    employer_contribution: string | number;
    status: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
};
export declare class EmployeeInsurancesService {
    private readonly db;
    constructor(db: HrmDbService);
    private selectColumns;
    private ensureSchema;
    private mapRow;
    list(query: ListEmployeeInsurancesQueryDto, authorization?: string): Promise<{
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
    }>;
    getById(id: string, companyId: string, authorization?: string): Promise<{
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
    }>;
    create(payload: CreateEmployeeInsuranceDto, authorization?: string): Promise<{
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
    }>;
    update(id: string, payload: UpdateEmployeeInsuranceDto, authorization?: string): Promise<{
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
    }>;
    remove(id: string, companyId: string, authorization?: string): Promise<{
        id: string;
    }>;
}
