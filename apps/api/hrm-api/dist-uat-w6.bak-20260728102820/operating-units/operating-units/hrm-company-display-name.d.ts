import type { QueryResultRow } from 'pg';
export type CompanyDisplayQueryFn = <T extends QueryResultRow = QueryResultRow>(sql: string, params?: unknown[]) => Promise<{
    rows: T[];
}>;
export declare function isLegacyKhoiDisplayName(name: string | null | undefined): boolean;
export declare function resolveCompanyDisplayNameVi(companySlug: string | null | undefined, fromDb?: string | null): string | null;
export declare function ensureCompanySlugMapLegalDisplayNames(query: CompanyDisplayQueryFn): Promise<void>;
export declare function loadCompanyDisplayNameBySlug(query: CompanyDisplayQueryFn, slugs?: readonly string[]): Promise<Map<string, string>>;
