import { OnModuleDestroy } from '@nestjs/common';
import { QueryResult, QueryResultRow } from 'pg';
export type HrmDbQueryFn = <T extends QueryResultRow = QueryResultRow>(text: string, values?: unknown[]) => Promise<QueryResult<T>>;
export declare class HrmDbService implements OnModuleDestroy {
    private readonly pool;
    constructor();
    query<T extends QueryResultRow = QueryResultRow>(text: string, values?: unknown[]): Promise<QueryResult<T>>;
    withTransaction<T>(fn: (query: HrmDbQueryFn) => Promise<T>): Promise<T>;
    onModuleDestroy(): Promise<void>;
}
