import { HrmDbService } from '../db/hrm-db.service';
import { CreateEmployeeBenefitDto } from './dto/create-employee-benefit.dto';
import { ListEmployeeBenefitsQueryDto } from './dto/list-employee-benefits.query.dto';
import { UpdateEmployeeBenefitDto } from './dto/update-employee-benefit.dto';
export type EmployeeBenefitRow = {
    id: string;
    employee_id: string;
    company_id: string;
    name: string;
    category: string;
    value: string | number;
    unit: string;
    frequency: string;
    start_date: string | null;
    end_date: string | null;
    status: string;
    description: string | null;
    created_at: string;
    updated_at: string;
};
export declare class EmployeeBenefitsService {
    private readonly db;
    constructor(db: HrmDbService);
    private selectColumns;
    private ensureSchema;
    private mapRow;
    list(query: ListEmployeeBenefitsQueryDto, authorization?: string): Promise<{
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
    }>;
    getById(id: string, companyId: string, authorization?: string): Promise<{
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
    }>;
    create(payload: CreateEmployeeBenefitDto, authorization?: string): Promise<{
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
    }>;
    update(id: string, payload: UpdateEmployeeBenefitDto, authorization?: string): Promise<{
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
    }>;
    remove(id: string, companyId: string, authorization?: string): Promise<{
        id: string;
    }>;
}
