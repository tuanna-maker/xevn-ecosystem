export declare function normalizeHrmCatalogSyncRequestCompanyId(authorization: string | undefined, requestedCompanyId: string | undefined): string | undefined;
export type HrmCatalogSyncScope = {
    tenantId: string;
    catalogCompanyId: string;
};
export declare function resolveHrmCatalogSyncScope(authorization: string | undefined, requested: {
    tenantId?: string;
    companyId?: string;
}): HrmCatalogSyncScope;
