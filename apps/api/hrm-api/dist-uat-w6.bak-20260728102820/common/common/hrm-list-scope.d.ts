export declare const HRM_GROUP_MEMBER_COMPANY_SLUGS: readonly ["holding", "trsport", "logistics", "finance", "services"];
export declare const HRM_PILOT_OPERATING_COMPANY_ID = "main";
export declare const HRM_COMPANY_UUID_BY_SLUG: Record<(typeof HRM_GROUP_MEMBER_COMPANY_SLUGS)[number], string>;
export declare function resolveHrmCompanyUuidForSlug(companySlug: string): string | null;
export declare function resolveHrmCompanySlugForId(companyId: string): string;
export declare const MASTER_TENANT_ID = "xevn";
export type HrmListScope = {
    companyIds: string[];
    masterTenantPartition: boolean;
    memberTenantId?: string;
};
export type HrmListScopeContext = {
    tenantId?: string;
};
export declare function normalizePayrollListCompanyId(authorization: string | undefined, requestedCompanyId: string): string;
export declare function normalizeHomeSummaryCompanyId(authorization: string | undefined, requestedCompanyId: string): string;
export declare function expandHrmTextCompanyIds(scope: HrmListScope, authorization: string | undefined, requestedCompanyId?: string): string[];
export declare function resolveHrmListScope(authorization: string | undefined, requestedCompanyId: string, context?: HrmListScopeContext): HrmListScope;
export declare function pushCompanyIdFilter(filters: string[], values: unknown[], companyIds: string[]): void;
export declare function pushCompanyIdUuidFilter(filters: string[], values: unknown[], companyIds: string[]): void;
export declare function resolveHrmOperationsPersistCompanyId(authorization: string | undefined, requestedCompanyId: string, context?: HrmListScopeContext): string;
export declare function resolveHrmPersistCompanyIdText(authorization: string | undefined, requestedCompanyId: string, context?: HrmListScopeContext): string;
export declare function pushCompanyIdTextColumnFilter(filters: string[], values: unknown[], companyIds: string[]): void;
export declare function pushEmployeeListScopeFilters(filters: string[], values: unknown[], scope: HrmListScope, options?: {
    skipTenantPartition?: boolean;
}): void;
export declare function pushWorkforceEmployeeScopeFilter(filters: string[], values: unknown[], scope: HrmListScope, employeeIdColumn?: string): void;
export declare function resolveHrmSettingsCatalogCompanyId(authorization: string | undefined, tenantId: string, companyId: string): string;
export declare function assertResourceInHrmScope(resource: {
    company_id?: string | null;
    custom_fields?: Record<string, unknown> | null;
} | null | undefined, scope: HrmListScope, options?: {
    notFoundCode?: string;
    mismatchCode?: string;
}): void;
