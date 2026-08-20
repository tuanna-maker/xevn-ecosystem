export declare class ListEmployeesQueryDto {
    company_id: string;
    view?: string;
    keyword?: string;
    q?: string;
    status?: string;
    attendance_filter?: string;
    include_attendance_today?: boolean;
    include_archived?: boolean;
    page?: number;
    page_size?: number;
    cursor?: string;
}
