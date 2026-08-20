import { OnModuleDestroy } from '@nestjs/common';
import { QueryResultRow } from 'pg';
export declare class HrmDbService implements OnModuleDestroy {
    private readonly pool;
    constructor();
    query<T extends QueryResultRow = QueryResultRow>(text: string, values?: unknown[]): Promise<import("pg").QueryResult<T>>;
    onModuleDestroy(): Promise<void>;
}
