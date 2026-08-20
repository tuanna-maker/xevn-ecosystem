import { CatalogSyncService } from '../catalog-sync/catalog-sync.service';
import { HrmDbService } from '../db/hrm-db.service';
import type { CatalogExtensionItemDto } from './dto/append-extension-items.dto';
import type { RequestCatalogFieldRemovalDto } from './dto/request-removal.dto';
import { XbosCatalogWorkflowBridge } from './xbos-catalog-workflow.bridge';
import { SettingsCatalogItemMutationDto } from './dto/settings-catalog-item.dto';
export type SettingsCatalogItem = {
    code: string;
    label: string;
    unit: string | null;
    status: 'active' | 'draft';
    origin: 'xbos' | 'hrm';
};
export type SettingsCatalogOverviewRow = {
    catalogKey: string;
    catalog_key: string;
    key: string;
    name: string | null;
    domain: string | null;
    xbosVersion: number | null;
    xbosSyncedAt: string | null;
    xbosItems: SettingsCatalogItem[];
    hrmExtensionItems: SettingsCatalogItem[];
    extension_items: SettingsCatalogItem[];
    extensionItems: SettingsCatalogItem[];
    items: SettingsCatalogItem[];
    effectiveItems: SettingsCatalogItem[];
};
export declare class SettingsCatalogsService {
    private readonly db;
    private readonly catalogSync;
    private readonly xbosWorkflow;
    constructor(db: HrmDbService, catalogSync: CatalogSyncService, xbosWorkflow: XbosCatalogWorkflowBridge);
    private normalizeCatalogKey;
    private ensureExtensionSchema;
    private parseLeadershipEmails;
    private parsePayloadItems;
    private toXbosOriginItems;
    private mergeEffective;
    private matchesPickerQuery;
    private matchesActiveFilter;
    getEffectiveItemsForKey(tenantId: string, companyId: string, catalogKey: string): Promise<SettingsCatalogItem[]>;
    listPickerItems(tenantId: string, companyId: string, catalogKey: string, query?: {
        q?: string;
        active?: string;
        status?: 'active' | 'draft' | 'all';
    }): Promise<{
        catalog_key: string;
        company_id: string;
        total: number;
        data: SettingsCatalogItem[];
    }>;
    assertCodeInEffectiveCatalog(opts: {
        tenantId: string;
        companyId: string;
        catalogKey: string;
        code: string;
        errorCode: string;
        errorMessage?: string;
    }): Promise<SettingsCatalogItem>;
    getOverview(tenantId: string, companyId: string): Promise<{
        catalogs: SettingsCatalogOverviewRow[];
    }>;
    syncAllFromXbos(tenantId: string, companyId: string, authorization?: string): Promise<{
        pulledKeys: string[];
    }>;
    submitExtensionItemsForApproval(tenantId: string, companyId: string, catalogKey: string, items: CatalogExtensionItemDto[], requestedBy?: {
        userId?: string;
        email?: string;
    }): Promise<{
        batchId: string;
        submitted: number;
        status: string;
        message: string;
        workflowInstanceId: string | null;
    }>;
    listExtensionRequests(filters: {
        status?: string;
        tenantId?: string;
        companyId?: string;
    }): Promise<{
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
    }>;
    private assertExtensionBatchInCatalogScope;
    attachWorkflowToBatch(batchId: string, workflowInstanceId: string, tenantId: string, catalogCompanyId: string, authorization?: string): Promise<void>;
    reviewExtensionBatch(batchId: string, decision: 'approved' | 'rejected', reviewerUserId: string, reviewNote: string | undefined, tenantId: string, catalogCompanyId: string, authorization?: string): Promise<{
        batchId: string;
        decision: "approved" | "rejected";
        reviewed: number;
        results: {
            requestId: string;
            status: "approved" | "rejected";
            catalogKey: string;
            code: string;
        }[];
    }>;
    getExtensionBatchDetail(batchId: string, tenantId: string, catalogCompanyId: string, authorization?: string): Promise<{
        batchId: string;
        items: import("pg").QueryResultRow[];
    }>;
    reviewExtensionRequest(requestId: string, decision: 'approved' | 'rejected', reviewerUserId: string, reviewNote?: string): Promise<{
        requestId: string;
        status: "approved" | "rejected";
        catalogKey: string;
        code: string;
    }>;
    appendExtensionItems(tenantId: string, companyId: string, catalogKey: string, items: CatalogExtensionItemDto[]): Promise<{
        upserted: number;
    }>;
    upsertCatalogItem(tenantId: string, body: SettingsCatalogItemMutationDto): Promise<{
        upserted: number;
        item_key: string;
        category_key: string;
        status: string;
    }>;
    deleteCatalogItem(tenantId: string, body: Pick<SettingsCatalogItemMutationDto, 'company_id' | 'category_key' | 'item_key'>): Promise<{
        item_key: string;
        category_key: string;
        status: "draft";
    }>;
    requestFieldRemoval(tenantId: string, companyId: string, catalogKey: string, payload: RequestCatalogFieldRemovalDto): Promise<{
        requestId: string;
        status: string;
        leadershipEmails: string[];
        createdAt: string;
        message: string;
    }>;
    countActivePosMasterItems(tenantId: string, companyId: string): Promise<number>;
    private assertTenantPositionHardcodeSeedAllowed;
    seedEmployeeProfileTemplate(tenantId: string, companyId: string): Promise<{
        catalogs: Array<{
            catalogKey: string;
            upserted: number;
        }>;
        totalUpserted: number;
    }>;
    private upsertGroupCatalogMeta;
    seedGroupEmployeeImportCatalog(tenantId: string, companyId: string): Promise<{
        tenantId: string;
        companyId: string;
        catalogs: Array<{
            catalogKey: string;
            upserted: number;
        }>;
        totalUpserted: number;
    }>;
    seedGroupEmployeeImportCatalogAllTenants(): Promise<{
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
    }>;
    seedTourismFleetCatalog(): Promise<{
        tenantId: string;
        companyId: string;
        catalogs: Array<{
            catalogKey: string;
            upserted: number;
        }>;
        totalUpserted: number;
    }>;
    seedTenantPositionCatalog(tenantId: string, companyId: string): Promise<{
        tenantId: string;
        companyId: string;
        departmentOptions: number;
        positionOptions: number;
        upserted: number;
        source: 'bootstrap_hardcode';
        sot: 'deprecated_use_xbos_settings';
    }>;
    seedTenantPositionCatalogAllTenants(): Promise<{
        scopes: Array<{
            tenantId: string;
            companyId: string;
            departmentOptions: number;
            positionOptions: number;
            upserted: number;
            source: 'bootstrap_hardcode';
            sot: 'deprecated_use_xbos_settings';
        }>;
    }>;
}
