export declare class SettingsCatalogItemMutationDto {
    company_id: string;
    category_key: string;
    item_key: string;
    item_name: string;
    item_value?: string;
    status?: 'active' | 'draft';
    metadata?: Record<string, unknown>;
}
