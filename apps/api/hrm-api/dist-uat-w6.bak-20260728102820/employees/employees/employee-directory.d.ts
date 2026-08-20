import type { EmployeeRow } from './employee-directory.types';
export type DirectoryListItem = {
    id: string;
    employee_code: string;
    full_name: string;
    job_title_key: string | null;
    job_title: string | null;
    department: string | null;
    avatar_url: string | null;
    status: string;
    attendance_today?: {
        checked_in: boolean;
        check_in_at: string | null;
        status: string | null;
    };
};
export type DirectoryDetailItem = DirectoryListItem & {
    manager_id: string | null;
    phone_number: string | null;
    email?: string;
};
type AttendanceTodayRow = {
    check_in_at: string | null;
    status: string | null;
};
export declare function isDirectoryView(view: string | undefined): boolean;
export declare function resolveDirectorySearchTerm(keyword?: string, q?: string): string | undefined;
export declare function readDepartment(customFields: Record<string, string> | null | undefined): string | null;
export declare function readPhoneNumber(customFields: Record<string, string> | null | undefined): string | null;
export declare function maskDirectoryEmail(email: string): string;
export declare function mapDirectoryListItem(row: EmployeeRow, attendance?: AttendanceTodayRow | null, includeAttendanceToday?: boolean): DirectoryListItem;
export declare function mapDirectoryDetail(row: EmployeeRow, authorization: string | undefined, attendance?: AttendanceTodayRow | null, includeAttendanceToday?: boolean): DirectoryDetailItem;
export declare function directoryItemPassesAttendanceFilter(item: DirectoryListItem, filter: string | undefined): boolean;
export declare function todayIsoInHoChiMinh(): string;
export {};
