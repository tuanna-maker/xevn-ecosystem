import { CatalogSyncService } from '../catalog-sync/catalog-sync.service';
export declare class XbosCatalogWorkflowBridge {
    private readonly catalogSync;
    private readonly logger;
    constructor(catalogSync: CatalogSyncService);
    private xbosBaseUrl;
    shouldStartCatalogWorkflow(tenantId: string, companyId: string): boolean;
    startCatalogWorkflowIfConfigured(batchId: string, tenantId: string, companyId: string, requesterUserId?: string): Promise<{
        workflowInstanceId?: string;
    } | null>;
}
