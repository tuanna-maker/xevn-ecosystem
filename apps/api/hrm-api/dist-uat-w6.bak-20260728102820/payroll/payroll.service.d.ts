import { HrmListScopeContext } from '../common/hrm-list-scope';
import { HrmDbService } from '../db/hrm-db.service';
import { CreatePayrollPeriodDto } from './dto/create-payroll-period.dto';
import { ListPayrollPeriodsQueryDto } from './dto/list-payroll-periods.query.dto';
import { CreateAdvanceRequestDto } from './dto/create-advance-request.dto';
import { DecideAdvanceRequestDto } from './dto/decide-advance-request.dto';
import { ListAdvanceRequestsQueryDto } from './dto/list-advance-requests.query.dto';
export declare class PayrollService {
    private readonly db;
    constructor(db: HrmDbService);
    private ensureSchema;
    private mapPeriod;
    private queryPeriodInScope;
    getPeriodById(periodId: string, requestedCompanyId: string, authorization?: string): Promise<{
        id: string;
        company_id: string;
        period_label: string;
        start_date: string;
        end_date: string;
        status: "draft" | "processed" | "closed";
        created_by: string | null;
        processed_at: string | null;
        closed_at: string | null;
        created_at: string;
        updated_at: string;
    }>;
    createPayrollPeriod(payload: CreatePayrollPeriodDto): Promise<{
        id: string;
        company_id: string;
        period_label: string;
        start_date: string;
        end_date: string;
        status: "draft" | "processed" | "closed";
        created_by: string | null;
        processed_at: string | null;
        closed_at: string | null;
        created_at: string;
        updated_at: string;
    }>;
    listPayrollPeriods(query: ListPayrollPeriodsQueryDto, authorization?: string): Promise<{
        total: number;
        data: {
            id: string;
            company_id: string;
            period_label: string;
            start_date: string;
            end_date: string;
            status: "draft" | "processed" | "closed";
            created_by: string | null;
            processed_at: string | null;
            closed_at: string | null;
            created_at: string;
            updated_at: string;
        }[];
    }>;
    processPayrollPeriod(periodId: string, requestedCompanyId: string, authorization?: string): Promise<{
        id: string;
        company_id: string;
        period_label: string;
        start_date: string;
        end_date: string;
        status: "draft" | "processed" | "closed";
        created_by: string | null;
        processed_at: string | null;
        closed_at: string | null;
        created_at: string;
        updated_at: string;
    }>;
    closePayrollPeriod(periodId: string, requestedCompanyId: string, authorization?: string): Promise<{
        id: string;
        company_id: string;
        period_label: string;
        start_date: string;
        end_date: string;
        status: "draft" | "processed" | "closed";
        created_by: string | null;
        processed_at: string | null;
        closed_at: string | null;
        created_at: string;
        updated_at: string;
    }>;
    getPayrollReconciliationSummary(companyId: string, authorization?: string): Promise<{
        draft: number;
        processed: number;
        closed: number;
    }>;
    private mapPayslip;
    listPayslips(query: {
        company_id: string;
        period_id?: string;
        employee_id?: string;
        page?: number | string;
        page_size?: number | string;
        pageSize?: number | string;
    }, authorization?: string, scopeContext?: HrmListScopeContext): Promise<{
        total: number;
        data: {
            period_label: string;
            id: string;
            company_id: string;
            period_id: string;
            employee_id: string;
            employee_code: string;
            employee_name: string;
            gross_amount: number;
            deduction_amount: number;
            net_amount: number;
            currency: string;
            status: string;
            created_at: string;
            updated_at: string;
        }[];
    }>;
    private ensureSalaryTemplateSchema;
    listSalaryTemplates(query: {
        company_id: string;
        status?: string;
    }, authorization?: string): Promise<{
        total: number;
        data: {
            id: string;
            company_id: string;
            code: string;
            name: string;
            description: string | null;
            is_default: boolean;
            status: string;
            created_at: string;
            updated_at: string;
        }[];
    }>;
    createSalaryTemplate(payload: {
        company_id: string;
        code: string;
        name: string;
        description?: string;
        is_default?: boolean;
    }, authorization?: string): Promise<import("pg").QueryResultRow>;
    updateSalaryTemplate(templateId: string, payload: {
        company_id: string;
        code?: string;
        name?: string;
        description?: string;
        is_default?: boolean;
        status?: string;
    }, authorization?: string): Promise<import("pg").QueryResultRow>;
    deleteSalaryTemplate(templateId: string, companyId: string, authorization?: string): Promise<{
        id: string;
    }>;
    listSalaryTemplateComponents(templateId: string, companyId: string, authorization?: string): Promise<{
        total: number;
        data: {
            id: any;
            template_id: any;
            component_id: any;
            default_value: number;
            is_required: boolean;
            sort_order: number;
            created_at: any;
            component: {
                id: any;
                code: any;
                name: any;
                component_type: any;
                nature: any;
                value_type: any;
            } | undefined;
        }[];
    }>;
    addSalaryTemplateComponent(templateId: string, payload: {
        company_id: string;
        component_id: string;
        default_value?: number;
        is_required?: boolean;
        sort_order?: number;
    }, authorization?: string): Promise<import("pg").QueryResultRow>;
    updateSalaryTemplateComponent(componentRowId: string, companyId: string, payload: Record<string, unknown>, authorization?: string): Promise<import("pg").QueryResultRow>;
    removeSalaryTemplateComponent(componentRowId: string, companyId: string, authorization?: string): Promise<{
        id: string;
    }>;
    duplicateSalaryTemplate(templateId: string, companyId: string, authorization?: string): Promise<import("pg").QueryResultRow>;
    upsertPayslip(input: {
        company_id: string;
        period_id: string;
        employee_id: string;
        employee_code: string;
        employee_name: string;
        gross_amount: number;
        deduction_amount: number;
        net_amount: number;
        status?: string;
    }): Promise<{
        id: string;
        company_id: string;
        period_id: string;
        employee_id: string;
        employee_code: string;
        employee_name: string;
        gross_amount: number;
        deduction_amount: number;
        net_amount: number;
        currency: string;
        status: string;
        created_at: string;
        updated_at: string;
    }>;
    listAdvanceRequests(query: ListAdvanceRequestsQueryDto, authorization?: string, tenantId?: string): Promise<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>;
    createAdvanceRequest(body: CreateAdvanceRequestDto, authorization?: string): Promise<import("pg").QueryResultRow>;
    listAdvanceRequestEmployees(requestId: string, companyId: string, authorization?: string, tenantId?: string): Promise<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>;
    private loadAdvanceRequestScopeRow;
    approveAdvanceRequest(requestId: string, _body: DecideAdvanceRequestDto, requestedCompanyId: string, authorization?: string, tenantId?: string): Promise<import("pg").QueryResultRow>;
    rejectAdvanceRequest(requestId: string, _body: DecideAdvanceRequestDto, requestedCompanyId: string, authorization?: string, tenantId?: string): Promise<import("pg").QueryResultRow>;
    markAdvanceRequestPaid(requestId: string, _body: DecideAdvanceRequestDto, requestedCompanyId: string, authorization?: string, tenantId?: string): Promise<import("pg").QueryResultRow>;
}
