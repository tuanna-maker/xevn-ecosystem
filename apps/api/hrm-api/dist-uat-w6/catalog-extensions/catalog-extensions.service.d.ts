import { HrmDbService } from '../db/hrm-db.service';
export declare class CatalogExtensionsService {
    private readonly db;
    constructor(db: HrmDbService);
    private ensureSchema;
    private scopedList;
    listSalesData(companyId: string, month?: number, year?: number, authorization?: string): Promise<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>;
    createSalesData(payload: Record<string, unknown>, authorization?: string): Promise<import("pg").QueryResultRow>;
    updateSalesData(id: string, companyId: string, payload: Record<string, unknown>, authorization?: string): Promise<import("pg").QueryResultRow>;
    deleteSalesData(id: string, companyId: string, authorization?: string): Promise<{
        id: string;
    }>;
    syncSalesData(companyId: string, authorization?: string): Promise<{
        synced: number;
        company_id: string;
        company_ids: string[];
    }>;
    listBonusPolicies(companyId: string, authorization?: string): Promise<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>;
    createBonusPolicy(payload: Record<string, unknown>, authorization?: string): Promise<import("pg").QueryResultRow>;
    updateBonusPolicy(id: string, companyId: string, payload: Record<string, unknown>, authorization?: string): Promise<import("pg").QueryResultRow>;
    deleteBonusPolicy(id: string, companyId: string, authorization?: string): Promise<{
        id: string;
    }>;
    listBonusPolicyParticipants(policyId: string, companyId: string, authorization?: string): Promise<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>;
    createBonusPolicyParticipant(payload: Record<string, unknown>, authorization?: string): Promise<import("pg").QueryResultRow>;
    listInsurancePolicyParticipants(companyId: string, authorization?: string): Promise<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>;
    createInsurancePolicyParticipant(payload: Record<string, unknown>, authorization?: string): Promise<import("pg").QueryResultRow>;
    updateInsurancePolicyParticipant(id: string, companyId: string, payload: Record<string, unknown>, authorization?: string): Promise<import("pg").QueryResultRow>;
    deleteInsurancePolicyParticipant(id: string, companyId: string, authorization?: string): Promise<{
        id: string;
    }>;
    listTaxPolicyParticipants(companyId: string, authorization?: string): Promise<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>;
    createTaxPolicyParticipant(payload: Record<string, unknown>, authorization?: string): Promise<import("pg").QueryResultRow>;
    updateTaxPolicyParticipant(id: string, companyId: string, payload: Record<string, unknown>, authorization?: string): Promise<import("pg").QueryResultRow>;
    deleteTaxPolicyParticipant(id: string, companyId: string, authorization?: string): Promise<{
        id: string;
    }>;
    listFaceData(companyId: string, authorization?: string): Promise<{
        total: number;
        data: {
            face_descriptor: any;
        }[];
    }>;
    upsertFaceData(payload: Record<string, unknown>, authorization?: string): Promise<{
        face_descriptor: any;
    }>;
    deleteFaceData(employeeId: string, companyId: string, authorization?: string): Promise<{
        employee_id: string;
    }>;
    getCompanySubscription(companyId: string, authorization?: string): Promise<{
        trial_days_remaining: number;
    }>;
    upgradeCompanySubscription(companyId: string, payload: Record<string, unknown>, authorization?: string): Promise<import("pg").QueryResultRow>;
    listGuideContent(companyId?: string | null): Promise<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>;
    upsertGuideContent(payload: Record<string, unknown>, authorization?: string): Promise<import("pg").QueryResultRow>;
    deleteGuideContent(payload: {
        section_id: string;
        step_index: number | null;
        company_id?: string;
    }): Promise<{
        ok: boolean;
    }>;
    storeUploadedFile(companyId: string, authorization: string | undefined, feature: string, file: {
        buffer: Buffer;
        originalname: string;
        mimetype: string;
    }): Promise<{
        url: string;
        path: string;
        filename: string;
        mimetype: string;
        company_id: string;
    }>;
    private resolveFileUploadBaseDir;
    private guessUploadedFileMime;
    readUploadedFile(companyId: string, filename: string, authorization: string | undefined): Promise<{
        buffer: Buffer;
        mimetype: string;
        filename: string;
    }>;
}
