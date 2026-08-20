export declare class CreateAttendanceSheetDto {
    company_id: string;
    name: string;
    start_date: string;
    end_date: string;
    attendance_type?: string;
    standard_type?: string;
    department?: string | null;
    positions?: string | null;
    notes?: string | null;
}
