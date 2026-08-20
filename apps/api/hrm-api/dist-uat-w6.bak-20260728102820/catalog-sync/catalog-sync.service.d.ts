import { HrmDbService } from '../db/hrm-db.service';
export interface HrmSyncedCatalog {
    tenantId: string;
    companyId: string;
    key: string;
    source: 'xbos';
    version: number;
    checksum: string;
    syncedAt: string;
    payload: unknown;
}
export interface HrmCatalogSyncStatus {
    tenantId: string;
    companyId: string;
    key: 'status';
    source: 'hrm';
    status: 'connected';
    hasSyncedCatalogs: boolean;
    totalSyncedCatalogs: number;
    lastSyncedAt: string | null;
}
export declare function resolveXbosApiBaseUrl(): string;
export declare class CatalogSyncService {
    private readonly db;
    private get xbosApiUrl();
    constructor(db: HrmDbService);
    buildXbosUpstreamHeaders(authorization?: string, scope?: {
        tenantId: string;
        companyId: string;
    }): Record<string, string>;
    private normalizeScopeId;
    private ensureSchema;
    pullCatalogFromXbos(catalogKey: string, tenantId: string, companyId: string, authorization?: string): Promise<HrmSyncedCatalog>;
    getSyncedCatalog(catalogKey: string, tenantId: string, companyId: string): Promise<HrmSyncedCatalog>;
    listSyncedCatalogs(tenantId: string, companyId: string): Promise<{
        total: number;
        data: HrmSyncedCatalog[];
    }>;
    getCatalogSyncStatus(tenantId: string, companyId: string): Promise<HrmCatalogSyncStatus>;
    listRemoteCatalogsFromXbos(tenantId: string, companyId: string, authorization?: string): Promise<{
        total: number;
        target: string;
        tenantId: string;
        companyId: string;
        data: unknown[];
    }>;
}
