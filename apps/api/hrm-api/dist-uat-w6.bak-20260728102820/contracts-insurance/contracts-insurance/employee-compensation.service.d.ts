import { HrmListScopeContext } from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import { CreateCompensationPackageDto, ReviseCompensationPackageDto } from './dto/create-compensation-package.dto';
import { ListCompensationQueryDto } from './dto/list-compensation.query.dto';
export type CompensationLineType = 'base' | 'probation' | 'allowance';
export type CompensationLineRow = {
    id: string;
    package_id: string;
    line_type: CompensationLineType;
    amount: string | number;
    currency: string;
    allowance_code: string | null;
    taxable: boolean;
    note: string | null;
    sort_order: number;
    created_at: string | Date;
};
export type CompensationPackageRow = {
    id: string;
    company_id: string;
    employee_id: string;
    contract_id: string | null;
    version: number;
    supersedes_package_id: string | null;
    effective_from: string;
    effective_to: string | null;
    currency: string;
    change_reason: string | null;
    created_at: string | Date;
    updated_at: string | Date;
};
export type CompensationPackageDetail = CompensationPackageRow & {
    lines: CompensationLineRow[];
};
export type CompensationHistoryRow = {
    id: string;
    company_id: string;
    employee_id: string;
    package_id: string;
    previous_package_id: string | null;
    version: number;
    change_reason: string | null;
    snapshot: Record<string, unknown>;
    created_at: string | Date;
};
export declare class EmployeeCompensationService {
    private readonly db;
    private compensationSchemaReady;
    constructor(db: HrmDbService);
    private resolvePage;
    private resolvePageSize;
    private resolveListScope;
    private isIgnorableSchemaRace;
    private runCompensationDdl;
    ensureCompensationSchema(): Promise<void>;
    private applyCompensationSchema;
    private validateLines;
    private assertEmployeeInScope;
    private isEmployeeProbation;
    private assertProbationLinesAllowed;
    private mapLine;
    private mapPackage;
    private insertLines;
    private appendHistory;
    private loadLines;
    private loadPackageRow;
    createPackage(payload: CreateCompensationPackageDto, authorization?: string): Promise<CompensationPackageDetail>;
    revisePackage(packageId: string, payload: ReviseCompensationPackageDto, requestedCompanyId: string, authorization?: string, scopeContext?: HrmListScopeContext): Promise<CompensationPackageDetail>;
    getPackageById(packageId: string, requestedCompanyId: string, authorization?: string, scopeContext?: HrmListScopeContext): Promise<CompensationPackageDetail>;
    listPackages(query: ListCompensationQueryDto, authorization?: string, scopeContext?: HrmListScopeContext): Promise<{
        total: number;
        page: number;
        page_size: number;
        data: CompensationPackageDetail[];
    }>;
    getActivePackage(query: ListCompensationQueryDto, authorization?: string, scopeContext?: HrmListScopeContext): Promise<CompensationPackageDetail | null>;
    listHistory(query: ListCompensationQueryDto, authorization?: string, scopeContext?: HrmListScopeContext): Promise<{
        total: number;
        page: number;
        page_size: number;
        data: CompensationHistoryRow[];
    }>;
}
