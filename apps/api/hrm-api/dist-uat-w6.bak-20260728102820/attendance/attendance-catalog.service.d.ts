import { CreateAttendanceSheetDto } from './dto/create-attendance-sheet.dto';
import { UpdateAttendanceSheetDto } from './dto/update-attendance-sheet.dto';
import { HrmDbService } from '../db/hrm-db.service';
export declare class AttendanceCatalogService {
    private readonly db;
    constructor(db: HrmDbService);
    private ensureWorkShiftSchema;
    private ensureAttendanceSheetSchema;
    listWorkShifts(companyId: string, authorization?: string): Promise<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>;
    createWorkShift(payload: Record<string, unknown>, authorization?: string): Promise<import("pg").QueryResultRow>;
    updateWorkShift(id: string, payload: Record<string, unknown>, companyId: string, authorization?: string): Promise<import("pg").QueryResultRow>;
    deleteWorkShift(id: string, companyId: string, authorization?: string): Promise<{
        id: string;
    }>;
    listAttendanceSheets(companyId: string, authorization?: string): Promise<{
        total: number;
        data: import("pg").QueryResultRow[];
    }>;
    createAttendanceSheet(payload: CreateAttendanceSheetDto, authorization?: string): Promise<import("pg").QueryResultRow>;
    updateAttendanceSheet(id: string, payload: UpdateAttendanceSheetDto, companyId: string, authorization?: string): Promise<import("pg").QueryResultRow>;
    deleteAttendanceSheet(id: string, companyId: string, authorization?: string): Promise<{
        id: string;
    }>;
}
