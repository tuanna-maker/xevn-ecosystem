import { CreatePerformanceCycleDto } from './dto/create-performance-cycle.dto';
import { CreatePerformanceEvaluationDto } from './dto/create-performance-evaluation.dto';
import { ListPerformanceCyclesQueryDto, ListPerformanceEvaluationsQueryDto } from './dto/list-performance.query.dto';
import { PerformanceService } from './performance.service';
export declare class PerformanceController {
    private readonly service;
    constructor(service: PerformanceService);
    private assertAccess;
    createCycle(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, body: CreatePerformanceCycleDto): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
        company_id: string;
        cycle_name: string;
        start_date: string;
        end_date: string;
        status: "draft" | "active" | "closed";
        created_by: string | null;
        created_at: string;
        updated_at: string;
    }>>;
    listCycles(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: ListPerformanceCyclesQueryDto): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: {
            id: string;
            company_id: string;
            cycle_name: string;
            start_date: string;
            end_date: string;
            status: "draft" | "active" | "closed";
            created_by: string | null;
            created_at: string;
            updated_at: string;
        }[];
    }>>;
    createEvaluation(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, body: CreatePerformanceEvaluationDto): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
        company_id: string;
        employee_id: string;
        cycle_id: string;
        score: number;
        summary: string;
        reviewer: string;
        created_at: string;
        updated_at: string;
    }>>;
    listEvaluations(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: ListPerformanceEvaluationsQueryDto): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: {
            id: string;
            company_id: string;
            employee_id: string;
            cycle_id: string;
            score: number;
            summary: string;
            reviewer: string;
            created_at: string;
            updated_at: string;
        }[];
    }>>;
}
