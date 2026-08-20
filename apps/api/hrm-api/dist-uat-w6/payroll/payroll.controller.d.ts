import { CreatePayrollPeriodDto } from './dto/create-payroll-period.dto';
import { ListPayrollPeriodsQueryDto } from './dto/list-payroll-periods.query.dto';
import { ListPayrollPayslipsQueryDto } from './dto/list-payroll-payslips.query.dto';
import { CreateSalaryTemplateDto } from './dto/create-salary-template.dto';
import { ListSalaryTemplatesQueryDto } from './dto/list-salary-templates.query.dto';
import { UpdateSalaryTemplateDto } from './dto/update-salary-template.dto';
import { CreateAdvanceRequestDto } from './dto/create-advance-request.dto';
import { DecideAdvanceRequestDto } from './dto/decide-advance-request.dto';
import { ListAdvanceRequestsQueryDto } from './dto/list-advance-requests.query.dto';
import { AddPaymentRecordDto } from './dto/add-payment-record.dto';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { PayrollService } from './payroll.service';
import { PayrollCatalogService } from './payroll-catalog.service';
export declare class PayrollController {
    private readonly payrollService;
    private readonly payrollCatalog;
    constructor(payrollService: PayrollService, payrollCatalog: PayrollCatalogService);
    private assertBusinessAccess;
    createPayrollPeriod(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, body: CreatePayrollPeriodDto): Promise<import("../common/api-response").ApiSuccess<{
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
    }>>;
    listPayrollPeriods(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: ListPayrollPeriodsQueryDto): Promise<import("../common/api-response").ApiSuccess<{
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
    }>>;
    processPayrollPeriod(periodId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, companyId: string | undefined): Promise<import("../common/api-response").ApiSuccess<{
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
    }>>;
    closePayrollPeriod(periodId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, companyId: string | undefined): Promise<import("../common/api-response").ApiSuccess<{
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
    }>>;
    listPayslips(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: ListPayrollPayslipsQueryDto, headers?: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<{
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
    }>>;
    listSalaryTemplates(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: ListSalaryTemplatesQueryDto): Promise<import("../common/api-response").ApiSuccess<{
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
    }>>;
    createSalaryTemplate(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, body: CreateSalaryTemplateDto): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    updateSalaryTemplate(templateId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, body: UpdateSalaryTemplateDto): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    listSalaryTemplateComponents(templateId: string, authorization: string | undefined, internalApiKey: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
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
    }>>;
    addSalaryTemplateComponent(templateId: string, authorization: string | undefined, internalApiKey: string | undefined, body: {
        company_id: string;
        component_id: string;
        default_value?: number;
        is_required?: boolean;
        sort_order?: number;
    }): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    updateSalaryTemplateComponent(componentRowId: string, authorization: string | undefined, internalApiKey: string | undefined, companyId: string, body: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    removeSalaryTemplateComponent(componentRowId: string, authorization: string | undefined, internalApiKey: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
    }>>;
    duplicateSalaryTemplate(templateId: string, authorization: string | undefined, internalApiKey: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    deleteSalaryTemplate(templateId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
    }>>;
    payrollReconciliationSummary(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, companyId?: string): Promise<import("../common/api-response").ApiSuccess<{
        draft: number;
        processed: number;
        closed: number;
    }>>;
    listAdvanceRequests(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, headerCompanyId: string | undefined, query: ListAdvanceRequestsQueryDto): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>>;
    createAdvanceRequest(authorization: string | undefined, internalApiKey: string | undefined, body: CreateAdvanceRequestDto): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    listAdvanceRequestEmployees(requestId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, companyId: string | undefined, queryCompanyId?: string): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>>;
    approveAdvanceRequest(requestId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, companyId: string | undefined, body: DecideAdvanceRequestDto): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    rejectAdvanceRequest(requestId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, companyId: string | undefined, body: DecideAdvanceRequestDto): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    listSalaryComponents(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>>;
    listSalaryComponentCategories(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>>;
    createSalaryComponent(authorization: string | undefined, internalApiKey: string | undefined, body: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    updateSalaryComponent(componentId: string, authorization: string | undefined, internalApiKey: string | undefined, companyId: string, body: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    deleteSalaryComponent(componentId: string, authorization: string | undefined, internalApiKey: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
    }>>;
    createSalaryComponentCategory(authorization: string | undefined, internalApiKey: string | undefined, body: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    deleteSalaryComponentCategory(categoryId: string, authorization: string | undefined, internalApiKey: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
    }>>;
    listPaymentBatches(authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>>;
    listPaymentBatchRecords(batchId: string, authorization: string | undefined, internalApiKey: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>>;
    createPaymentBatch(authorization: string | undefined, internalApiKey: string | undefined, body: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    updatePaymentBatch(batchId: string, authorization: string | undefined, internalApiKey: string | undefined, companyId: string, body: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    deletePaymentBatch(batchId: string, authorization: string | undefined, internalApiKey: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
    }>>;
    addPaymentBatchRecord(batchId: string, authorization: string | undefined, internalApiKey: string | undefined, body: AddPaymentRecordDto): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    processPaymentRecord(batchId: string, recordId: string, authorization: string | undefined, internalApiKey: string | undefined, companyId: string, body: ProcessPaymentDto): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    processPaymentBatch(batchId: string, authorization: string | undefined, internalApiKey: string | undefined, companyId: string, body: ProcessPaymentDto): Promise<import("../common/api-response").ApiSuccess<{
        batch: import("pg").QueryResultRow;
        processed_records: number;
    }>>;
    markAdvanceRequestPaid(requestId: string, authorization: string | undefined, internalApiKey: string | undefined, tenantId: string | undefined, companyId: string | undefined, body: DecideAdvanceRequestDto): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
}
