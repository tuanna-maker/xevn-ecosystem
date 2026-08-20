import { CatalogSyncService } from './catalog-sync.service';
export declare class CatalogSyncController {
    private readonly catalogSyncService;
    constructor(catalogSyncService: CatalogSyncService);
    private assertSyncAccess;
    pullFromXbos(catalogKey: string, tenantId?: string, companyId?: string, queryTenantId?: string, queryCompanyId?: string, authorization?: string, internalApiKey?: string): Promise<import("../common/api-response").ApiSuccess<import("./catalog-sync.service").HrmSyncedCatalog>>;
    getCatalogSyncStatus(tenantId?: string, companyId?: string, queryTenantId?: string, queryCompanyId?: string, authorization?: string, internalApiKey?: string): Promise<import("../common/api-response").ApiSuccess<import("./catalog-sync.service").HrmCatalogSyncStatus>>;
    getLocalCatalog(catalogKey: string, tenantId?: string, companyId?: string, queryTenantId?: string, queryCompanyId?: string, authorization?: string, internalApiKey?: string): Promise<import("../common/api-response").ApiSuccess<import("./catalog-sync.service").HrmSyncedCatalog>>;
    listLocalCatalogs(tenantId?: string, companyId?: string, queryTenantId?: string, queryCompanyId?: string, authorization?: string, internalApiKey?: string): Promise<import("../common/api-response").ApiSuccess<{
        total: number;
        data: import("./catalog-sync.service").HrmSyncedCatalog[];
    }>>;
}
