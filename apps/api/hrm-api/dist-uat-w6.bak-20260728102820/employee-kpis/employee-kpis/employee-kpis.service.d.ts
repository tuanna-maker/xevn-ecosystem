import { HrmDbService } from '../db/hrm-db.service';
import { CreateEmployeeKpiDto } from './dto/create-employee-kpi.dto';
import { ListEmployeeKpisQueryDto } from './dto/list-employee-kpis.query.dto';
export declare class EmployeeKpisService {
    private readonly db;
    constructor(db: HrmDbService);
    private ensureSchema;
    list(query: ListEmployeeKpisQueryDto, authorization?: string): Promise<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>;
    create(payload: CreateEmployeeKpiDto, authorization?: string): Promise<import("pg").QueryResultRow>;
    remove(id: string, companyId: string, authorization?: string): Promise<{
        id: string;
    }>;
}
