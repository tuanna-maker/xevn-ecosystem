export declare class ListAttendanceUpdateRequestsQueryDto {
    companyId?: string;
    company_id: string;
    status?: 'pending' | 'approved' | 'rejected';
    employee_id?: string;
    manager_employee_id?: string;
    page?: number | string;
    pageSize?: number | string;
    page_size?: number | string;
}
