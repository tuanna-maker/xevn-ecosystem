import { StreamableFile } from '@nestjs/common';
import type { Response } from 'express';
import { CatalogExtensionsService } from './catalog-extensions.service';
export declare class CatalogExtensionsController {
    private readonly service;
    constructor(service: CatalogExtensionsService);
    private assertAccess;
    listSalesData(authorization: string | undefined, internalApiKey: string | undefined, companyId: string, periodMonth?: string, periodYear?: string): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>>;
    createSalesData(authorization: string | undefined, internalApiKey: string | undefined, body: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    updateSalesData(id: string, authorization: string | undefined, internalApiKey: string | undefined, companyId: string, body: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    deleteSalesData(id: string, authorization: string | undefined, internalApiKey: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
    }>>;
    syncSalesData(authorization: string | undefined, internalApiKey: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        synced: number;
        company_id: string;
        company_ids: string[];
    }>>;
    listBonusPolicies(authorization: string | undefined, internalApiKey: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>>;
    createBonusPolicy(authorization: string | undefined, internalApiKey: string | undefined, body: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    updateBonusPolicy(id: string, authorization: string | undefined, internalApiKey: string | undefined, companyId: string, body: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    deleteBonusPolicy(id: string, authorization: string | undefined, internalApiKey: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
    }>>;
    listBonusParticipants(policyId: string, authorization: string | undefined, internalApiKey: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>>;
    createBonusParticipant(authorization: string | undefined, internalApiKey: string | undefined, body: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    listInsuranceParticipants(authorization: string | undefined, internalApiKey: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>>;
    createInsuranceParticipant(authorization: string | undefined, internalApiKey: string | undefined, body: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    updateInsuranceParticipant(id: string, authorization: string | undefined, internalApiKey: string | undefined, companyId: string, body: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    deleteInsuranceParticipant(id: string, authorization: string | undefined, internalApiKey: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
    }>>;
    listTaxParticipants(authorization: string | undefined, internalApiKey: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>>;
    createTaxParticipant(authorization: string | undefined, internalApiKey: string | undefined, body: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    updateTaxParticipant(id: string, authorization: string | undefined, internalApiKey: string | undefined, companyId: string, body: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    deleteTaxParticipant(id: string, authorization: string | undefined, internalApiKey: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        id: string;
    }>>;
    listFaceData(authorization: string | undefined, internalApiKey: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: {
            face_descriptor: any;
        }[];
    }>>;
    upsertFaceData(authorization: string | undefined, internalApiKey: string | undefined, body: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<{
        face_descriptor: any;
    }>>;
    deleteFaceData(employeeId: string, authorization: string | undefined, internalApiKey: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        employee_id: string;
    }>>;
    getSubscription(authorization: string | undefined, internalApiKey: string | undefined, companyId: string): Promise<import("../common/api-response").ApiSuccess<{
        trial_days_remaining: number;
    }>>;
    upgradeSubscription(authorization: string | undefined, internalApiKey: string | undefined, companyId: string, body: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    listGuideContent(authorization: string | undefined, internalApiKey: string | undefined, companyId?: string): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>>;
    upsertGuideContent(authorization: string | undefined, internalApiKey: string | undefined, body: Record<string, unknown>): Promise<import("../common/api-response").ApiSuccess<import("pg").QueryResultRow>>;
    deleteGuideContent(authorization: string | undefined, internalApiKey: string | undefined, body: {
        section_id: string;
        step_index: number | null;
        company_id?: string;
    }): Promise<import("../common/api-response").ApiSuccess<{
        ok: boolean;
    }>>;
    getUploadedFile(companyId: string, filename: string, authorization: string | undefined, res: Response): Promise<StreamableFile>;
    uploadFile(file: Express.Multer.File | undefined, feature: string, companyId: string | undefined, authorization: string | undefined, internalApiKey: string | undefined): Promise<import("../common/api-response").ApiSuccess<{
        url: string;
        path: string;
        filename: string;
        mimetype: string;
        company_id: string;
    }>>;
}
