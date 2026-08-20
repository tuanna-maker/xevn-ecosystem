export declare class ListAttendanceRecordsQueryDto {
    companyId?: string;
    company_id: string;
    employee_id?: string;
    status?: 'pending' | 'present' | 'absent' | 'leave';
    from_date?: string;
    to_date?: string;
    page?: number | string;
    pageSize?: number | string;
    page_size?: number | string;
}
