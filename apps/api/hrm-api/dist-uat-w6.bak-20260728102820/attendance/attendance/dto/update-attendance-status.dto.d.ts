export declare class UpdateAttendanceStatusDto {
    status: 'pending' | 'present' | 'absent' | 'leave';
    note?: string;
    updated_by?: string;
}
