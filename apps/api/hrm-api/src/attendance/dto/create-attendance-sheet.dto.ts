/**
 * @CODE-MEMORY
 * Screen:     HRM → Chấm công — bảng công (attendance sheet)
 * UC:         FR-UC-H03 · attendance sheets
 * BR:         Create sheet DTO validation
 * Purpose:    DTO tạo bảng chấm công (company/name/date range + optional filters).
 * WorkItem:   W1-B-01-BE-DIST-RESTORE
 * Coded:      2026-08-03
 * Callers:    attendance.controller · attendance-catalog.service
 * Callees:    class-validator
 * must_keep:  field names + MaxLength parity with dist; U65 no seed
 * SOLID:      Pure DTO — no Nest Injectable / SQL
 * LastVerified: tsc tsconfig.build.json
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: W1-B-01-BE-DIST-RESTORE
 * change_mode: ADD
 * What: Restore src from dist create-attendance-sheet.dto.js/.d.ts
 * Why: TS2307 blocked nest/tsc build (R-HRM-DIST-MISSING)
 * must_keep: company_id · name · start_date · end_date required
 */
import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAttendanceSheetDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  name!: string;

  @IsOptional()
  @IsDateString()
  start_date!: string;

  @IsOptional()
  @IsDateString()
  end_date!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  attendance_type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  standard_type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  department?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  positions?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string | null;
}
