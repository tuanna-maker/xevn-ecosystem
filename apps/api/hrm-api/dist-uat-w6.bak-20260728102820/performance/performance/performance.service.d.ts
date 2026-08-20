import { HrmDbService } from '../db/hrm-db.service';
import { CreatePerformanceCycleDto } from './dto/create-performance-cycle.dto';
import { CreatePerformanceEvaluationDto } from './dto/create-performance-evaluation.dto';
import { ListPerformanceCyclesQueryDto, ListPerformanceEvaluationsQueryDto } from './dto/list-performance.query.dto';
type PerformanceCycleRow = {
    id: string;
    company_id: string;
    cycle_name: string;
    start_date: string;
    end_date: string;
    status: 'draft' | 'active' | 'closed';
    created_by: string | null;
    created_at: string;
    updated_at: string;
};
type PerformanceEvaluationRow = {
    id: string;
    company_id: string;
    employee_id: string;
    cycle_id: string;
    score: number;
    summary: string;
    reviewer: string;
    created_at: string;
    updated_at: string;
};
export declare class PerformanceService {
    private readonly db;
    constructor(db: HrmDbService);
    private ensureSchema;
    createCycle(payload: CreatePerformanceCycleDto, authorization?: string): Promise<PerformanceCycleRow>;
    listCycles(query: ListPerformanceCyclesQueryDto, authorization?: string): Promise<{
        total: number;
        data: PerformanceCycleRow[];
    }>;
    createEvaluation(payload: CreatePerformanceEvaluationDto, authorization?: string): Promise<PerformanceEvaluationRow>;
    listEvaluations(query: ListPerformanceEvaluationsQueryDto, authorization?: string): Promise<{
        total: number;
        data: PerformanceEvaluationRow[];
    }>;
}
export {};
