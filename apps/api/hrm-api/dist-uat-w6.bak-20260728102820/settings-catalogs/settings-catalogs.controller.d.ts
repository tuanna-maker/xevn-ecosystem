import { AppendExtensionItemsDto } from './dto/append-extension-items.dto';
import { ListCatalogPickerQueryDto } from './dto/list-catalog-picker.query.dto';
import { RequestCatalogFieldRemovalDto } from './dto/request-removal.dto';
import { SettingsCatalogsService } from './settings-catalogs.service';
import { SettingsCatalogItemMutationDto } from './dto/settings-catalog-item.dto';
export declare class SettingsCatalogsController {
    private readonly settingsCatalogs;
    constructor(settingsCatalogs: SettingsCatalogsService);
    private assertAccess;
    private resolveCatalogMutationCompanyId;
    overview(authorization?: string, internalApiKey?: string, tenantId?: string, companyId?: string, queryCompanyId?: string): Promise<import("../common/api-response").ApiSuccess<{
        catalogs: import("./settings-catalogs.service").SettingsCatalogOverviewRow[];
    }>>;
    createCatalogItem(body: SettingsCatalogItemMutationDto, authorization?: string, internalApiKey?: string, tenantId?: string, companyId?: string): Promise<import("../common/api-response").ApiSuccess<{
        upserted: number;
        item_key: string;
        category_key: string;
        status: string;
    }>>;
    updateCatalogItem(body: SettingsCatalogItemMutationDto, authorization?: string, internalApiKey?: string, tenantId?: string, companyId?: string): Promise<import("../common/api-response").ApiSuccess<{
        upserted: number;
        item_key: string;
        category_key: string;
        status: string;
    }>>;
    deleteCatalogItem(body: Pick<SettingsCatalogItemMutationDto, 'company_id' | 'category_key' | 'item_key'>, authorization?: string, internalApiKey?: string, tenantId?: string, companyId?: string): Promise<import("../common/api-response").ApiSuccess<{
        item_key: string;
        category_key: string;
        status: "draft";
    }>>;
    syncFromXbos(authorization?: string, internalApiKey?: string, tenantId?: string, companyId?: string): Promise<import("../common/api-response").ApiSuccess<{
        pulledKeys: string[];
    }>>;
    seedGroupEmployeeImportAll(authorization?: string, internalApiKey?: string): Promise<import("../common/api-response").ApiSuccess<{
        scopes: Array<{
            tenantId: string;
            companyId: string;
            catalogs: Array<{
                catalogKey: string;
                upserted: number;
            }>;
            totalUpserted: number;
        }>;
        totalUpserted: number;
    }>>;
    seedGroupEmployeeImport(authorization?: string, internalApiKey?: string, tenantId?: string, companyId?: string): Promise<import("../common/api-response").ApiSuccess<{
        tenantId: string;
        companyId: string;
        catalogs: Array<{
            catalogKey: string;
            upserted: number;
        }>;
        totalUpserted: number;
    }>>;
    seedTourismFleet(authorization?: string, internalApiKey?: string): Promise<import("../common/api-response").ApiSuccess<{
        tenantId: string;
        companyId: string;
        catalogs: Array<{
            catalogKey: string;
            upserted: number;
        }>;
        totalUpserted: number;
    }>>;
    seedTenantPositionCatalogAll(authorization?: string, internalApiKey?: string): Promise<import("../common/api-response").ApiSuccess<{
        scopes: Array<{
            tenantId: string;
            companyId: string;
            departmentOptions: number;
            positionOptions: number;
            upserted: number;
            source: "bootstrap_hardcode";
            sot: "deprecated_use_xbos_settings";
        }>;
    }>>;
    seedTenantPositionCatalog(authorization?: string, internalApiKey?: string, tenantId?: string, companyId?: string): Promise<import("../common/api-response").ApiSuccess<{
        tenantId: string;
        companyId: string;
        departmentOptions: number;
        positionOptions: number;
        upserted: number;
        source: "bootstrap_hardcode";
        sot: "deprecated_use_xbos_settings";
    }>>;
    getBatch(batchId: string, authorization?: string, internalApiKey?: string, tenantId?: string, companyId?: string, queryCompanyId?: string): Promise<import("../common/api-response").ApiSuccess<{
        batchId: string;
        items: import("pg").QueryResultRow[];
    }>>;
    attachWorkflow(batchId: string, body: {
        workflowInstanceId: string;
    }, authorization?: string, internalApiKey?: string, tenantId?: string, companyId?: string, queryCompanyId?: string): Promise<import("../common/api-response").ApiSuccess<{
        batchId: string;
        workflowInstanceId: string;
    }>>;
    reviewBatch(batchId: string, body: {
        decision: 'approved' | 'rejected';
        review_note?: string;
    }, authorization?: string, internalApiKey?: string, tenantId?: string, companyId?: string, queryCompanyId?: string, reviewerUserId?: string): Promise<import("../common/api-response").ApiSuccess<{
        batchId: string;
        decision: "approved" | "rejected";
        reviewed: number;
        results: {
            requestId: string;
            status: "approved" | "rejected";
            catalogKey: string;
            code: string;
        }[];
    }>>;
    listExtensionRequests(status?: string, tenantId?: string, companyId?: string, authorization?: string, internalApiKey?: string): Promise<import("../common/api-response").ApiSuccess<{
        items: {
            id: string;
            batch_id: string;
            tenant_id: string;
            company_id: string;
            catalog_key: string;
            code: string;
            label: string;
            unit: string | null;
            status: string;
            requested_by_user_id: string | null;
            requested_by_email: string | null;
            created_at: string;
        }[];
    }>>;
    approveExtensionRequest(requestId: string, body: {
        review_note?: string;
    }, authorization?: string, internalApiKey?: string, reviewerUserId?: string): Promise<import("../common/api-response").ApiSuccess<{
        requestId: string;
        status: "approved" | "rejected";
        catalogKey: string;
        code: string;
    }>>;
    rejectExtensionRequest(requestId: string, body: {
        review_note?: string;
    }, authorization?: string, internalApiKey?: string, reviewerUserId?: string): Promise<import("../common/api-response").ApiSuccess<{
        requestId: string;
        status: "approved" | "rejected";
        catalogKey: string;
        code: string;
    }>>;
    seedEmployeeProfileTemplate(authorization?: string, internalApiKey?: string, tenantId?: string, companyId?: string): Promise<import("../common/api-response").ApiSuccess<{
        catalogs: Array<{
            catalogKey: string;
            upserted: number;
        }>;
        totalUpserted: number;
    }>>;
    listCatalogPickerItems(catalogKey: string, query: ListCatalogPickerQueryDto, authorization?: string, internalApiKey?: string, tenantId?: string, companyId?: string): Promise<import("../common/api-response").ApiSuccess<{
        catalog_key: string;
        company_id: string;
        total: number;
        data: import("./settings-catalogs.service").SettingsCatalogItem[];
    }>>;
    appendExtension(catalogKey: string, body: AppendExtensionItemsDto, authorization?: string, internalApiKey?: string, tenantId?: string, companyId?: string, catalogWriteMode?: string, userId?: string): Promise<import("../common/api-response").ApiSuccess<{
        upserted: number;
    }>> | Promise<import("../common/api-response").ApiSuccess<{
        batchId: string;
        submitted: number;
        status: string;
        message: string;
        workflowInstanceId: string | null;
    }>>;
    requestFieldRemoval(catalogKey: string, body: RequestCatalogFieldRemovalDto, authorization?: string, internalApiKey?: string, tenantId?: string, companyId?: string): Promise<import("../common/api-response").ApiSuccess<{
        requestId: string;
        status: string;
        leadershipEmails: string[];
        createdAt: string;
        message: string;
    }>>;
}
