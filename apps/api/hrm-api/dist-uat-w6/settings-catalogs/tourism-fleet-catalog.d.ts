import type { CatalogExtensionItemDto } from './dto/append-extension-items.dto';
export declare const TOURISM_TENANT_ID = "xe-du-lich";
export declare const TOURISM_COMPANY_ID = "main";
export type TourismFleetCatalogDef = {
    catalogKey: string;
    name: string;
    domain: string;
    items: CatalogExtensionItemDto[];
};
export declare const TOURISM_FLEET_CATALOGS: TourismFleetCatalogDef[];
