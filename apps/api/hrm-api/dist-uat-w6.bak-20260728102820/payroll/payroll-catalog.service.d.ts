import { HrmDbService } from '../db/hrm-db.service';
export declare class PayrollCatalogService {
    private readonly db;
    constructor(db: HrmDbService);
    private ensureSalaryComponentSchema;
    private ensurePaymentBatchSchema;
    listSalaryComponents(companyId: string, authorization?: string): Promise<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>;
    listSalaryComponentCategories(companyId: string, authorization?: string): Promise<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>;
    createSalaryComponent(payload: Record<string, unknown>, authorization?: string): Promise<import("pg").QueryResultRow>;
    updateSalaryComponent(id: string, payload: Record<string, unknown>, companyId: string, authorization?: string): Promise<import("pg").QueryResultRow>;
    deleteSalaryComponent(id: string, companyId: string, authorization?: string): Promise<{
        id: string;
    }>;
    createSalaryComponentCategory(payload: Record<string, unknown>, authorization?: string): Promise<import("pg").QueryResultRow>;
    deleteSalaryComponentCategory(id: string, companyId: string, authorization?: string): Promise<{
        id: string;
    }>;
    listPaymentBatches(companyId: string, authorization?: string): Promise<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>;
    listPaymentBatchRecords(batchId: string, companyId: string, authorization?: string): Promise<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>;
    createPaymentBatch(payload: Record<string, unknown>, authorization?: string): Promise<import("pg").QueryResultRow>;
    updatePaymentBatch(id: string, payload: Record<string, unknown>, companyId: string, authorization?: string): Promise<import("pg").QueryResultRow>;
    deletePaymentBatch(id: string, companyId: string, authorization?: string): Promise<{
        id: string;
    }>;
    private refreshPaymentBatchSummary;
    addPaymentRecord(batchId: string, payload: {
        company_id: string;
        payroll_record_id?: string;
        employee_id?: string;
        employee_code: string;
        employee_name: string;
        department?: string;
        bank_name?: string;
        bank_account?: string;
        amount: number;
        notes?: string;
    }, authorization?: string): Promise<import("pg").QueryResultRow>;
    processPaymentRecord(batchId: string, recordId: string, companyId: string, payload: {
        transaction_ref?: string;
        notes?: string;
    }, authorization?: string): Promise<import("pg").QueryResultRow>;
    processAllPaymentsInBatch(batchId: string, companyId: string, payload: {
        transaction_ref?: string;
        notes?: string;
    }, authorization?: string): Promise<{
        batch: import("pg").QueryResultRow;
        processed_records: number;
    }>;
}
