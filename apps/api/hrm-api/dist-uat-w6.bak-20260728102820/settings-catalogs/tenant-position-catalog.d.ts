import type { CatalogExtensionItemDto } from './dto/append-extension-items.dto';
export type DepartmentPositionMap = Record<string, string[]>;
export type TenantPositionCatalog = {
    tenantId: string;
    departments: string[];
    positionsByDept: DepartmentPositionMap;
};
export declare function isTenantPositionSeedEnvAllowed(env?: NodeJS.ProcessEnv): boolean;
export declare function buildPositionCatalogItems(catalog: TenantPositionCatalog): CatalogExtensionItemDto[];
export declare function buildEmptyPositionFieldDefs(): CatalogExtensionItemDto[];
export declare const TENANT_POSITION_CATALOGS: Record<string, TenantPositionCatalog>;
export declare function getTenantPositionCatalog(tenantId: string): TenantPositionCatalog | undefined;
