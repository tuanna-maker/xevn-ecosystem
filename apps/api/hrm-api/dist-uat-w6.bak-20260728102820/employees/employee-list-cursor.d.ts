export type EmployeeListCursor = {
    createdAt: string;
    id: string;
};
export declare function toEmployeeListCursorIso(createdAt: string | Date): string;
export declare function encodeEmployeeListCursor(createdAt: string | Date, id: string): string;
export declare function decodeEmployeeListCursor(raw: string): EmployeeListCursor;
export declare function encodeEmployeeListCursorFromRow(row: {
    id: string;
    created_at: string | Date;
    created_at_cursor?: string | null;
}): string;
