import { HrmDbService } from '../db/hrm-db.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { ListDepartmentsQueryDto } from './dto/list-departments.query.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
export type DepartmentRow = {
    id: string;
    company_id: string;
    parent_id: string | null;
    name: string;
    code: string | null;
    description: string | null;
    manager_name: string | null;
    manager_email: string | null;
    employee_count: number;
    level: number;
    sort_order: number;
    status: string;
    created_at: string;
    updated_at: string;
};
export declare class DepartmentsService {
    private readonly db;
    constructor(db: HrmDbService);
    private ensureSchema;
    private mapRow;
    private selectColumns;
    listDepartments(query: ListDepartmentsQueryDto, authorization?: string): Promise<{
        total: number;
        data: {
            employee_count: number;
            level: number;
            sort_order: number;
            id: string;
            company_id: string;
            parent_id: string | null;
            name: string;
            code: string | null;
            description: string | null;
            manager_name: string | null;
            manager_email: string | null;
            status: string;
            created_at: string;
            updated_at: string;
        }[];
    }>;
    getDepartmentById(departmentId: string, companyId: string, authorization?: string): Promise<{
        employee_count: number;
        level: number;
        sort_order: number;
        id: string;
        company_id: string;
        parent_id: string | null;
        name: string;
        code: string | null;
        description: string | null;
        manager_name: string | null;
        manager_email: string | null;
        status: string;
        created_at: string;
        updated_at: string;
    }>;
    createDepartment(payload: CreateDepartmentDto, authorization?: string): Promise<{
        employee_count: number;
        level: number;
        sort_order: number;
        id: string;
        company_id: string;
        parent_id: string | null;
        name: string;
        code: string | null;
        description: string | null;
        manager_name: string | null;
        manager_email: string | null;
        status: string;
        created_at: string;
        updated_at: string;
    }>;
    updateDepartment(departmentId: string, payload: UpdateDepartmentDto, authorization?: string): Promise<{
        employee_count: number;
        level: number;
        sort_order: number;
        id: string;
        company_id: string;
        parent_id: string | null;
        name: string;
        code: string | null;
        description: string | null;
        manager_name: string | null;
        manager_email: string | null;
        status: string;
        created_at: string;
        updated_at: string;
    }>;
    deleteDepartment(departmentId: string, companyId: string, authorization?: string): Promise<{
        id: string;
    }>;
}
