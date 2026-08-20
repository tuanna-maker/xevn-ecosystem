import type { CatalogExtensionItemDto } from './dto/append-extension-items.dto';
export type GroupEmployeeCatalogDef = {
    catalogKey: string;
    name: string;
    domain: string;
    items: CatalogExtensionItemDto[];
};
export declare const GROUP_HRM_TENANT_SCOPES: Array<{
    tenantId: string;
    companyId: string;
}>;
export declare const GROUP_EMPLOYEE_IMPORT_CATALOGS: GroupEmployeeCatalogDef[];
