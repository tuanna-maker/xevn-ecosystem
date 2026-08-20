export declare class CatalogExtensionItemDto {
    code: string;
    label: string;
    unit?: string;
    status?: 'active' | 'draft';
}
export declare class AppendExtensionItemsDto {
    bulkSync?: boolean;
    items: CatalogExtensionItemDto[];
}
