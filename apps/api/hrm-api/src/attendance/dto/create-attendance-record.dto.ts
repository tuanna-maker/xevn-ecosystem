/**
 * @CODE-MEMORY
 * Screen:     DTO create attendance record — open day-code status
 * UC:         FR-HRM-AT-01 · AC-PLT-ATT-CODE-01*
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BE-01
 * Coded:      2026-08-08
 * change_mode: UPGRADE
 * What: DROP closed @IsIn(['pending','present','absent','leave']) — open catalog key;
 *       membership assert in AttendanceService → HRM-ATT-CODE-KEY when EFF>0.
 * must_keep: format MaxLength only · no product ceiling IsIn(4) · CNS-05 check_in_method
 */
import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateAttendanceRecordDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsUUID()
  employee_id!: string;

  @IsDateString()
  attendance_date!: string;

  @IsOptional()
  @IsDateString()
  check_in_at?: string;

  @IsOptional()
  @IsDateString()
  check_out_at?: string;

  /** Open day-code — validated ∈ F-ATT-CAT-CODE-EFF when count>0 (L-ATT-CODE-04/05). */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  created_by?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  /**
   * Optional CNS-05 signal — `gps` requires lat/lon when gps_enabled + active sites >0.
   * Omit / `manual` → soft-skip geofence when coords absent (BR-PLT-ATT-WS-08).
   */
  @IsOptional()
  @IsIn(['gps', 'manual', 'qr', 'wifi', 'face'])
  check_in_method?: 'gps' | 'manual' | 'qr' | 'wifi' | 'face';
}
