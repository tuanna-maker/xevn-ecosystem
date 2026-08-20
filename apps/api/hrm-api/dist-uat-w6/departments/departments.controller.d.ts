import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { ListDepartmentsQueryDto } from './dto/list-departments.query.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';
export declare class DepartmentsController {
    private readonly service;
    constructor(service: DepartmentsService);
    private assertAccess;
    list(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: ListDepartmentsQueryDto): Promise<import("../common/api-response").ApiSuccess<{
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
    }>>;
    getById(departmentId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
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
    }>>;
    create(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, body: CreateDepartmentDto): Promise<import("../common/api-response").ApiSuccess<{
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
    }>>;
    update(departmentId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, body: UpdateDepartmentDto): Promise<import("../common/api-response").ApiSuccess<{
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
    }>>;
    remove(departmentId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
    }>>;
}
