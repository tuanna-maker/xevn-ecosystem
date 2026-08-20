export declare class CreateAttendanceRecordDto {
    company_id: string;
    employee_id: string;
    attendance_date: string;
    check_in_at?: string;
    check_out_at?: string;
    status?: 'pending' | 'present' | 'absent' | 'leave';
    note?: string;
    created_by?: string;
    latitude?: number;
    longitude?: number;
}
