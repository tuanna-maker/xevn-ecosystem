/**
 * @CODE-MEMORY
 * Screen:     DTO update attendance status — open day-code
 * UC:         FR-HRM-AT-01 · AC-PLT-ATT-CODE-01*
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BE-01
 * Coded:      2026-08-08
 * change_mode: UPGRADE
 * What: DROP closed @IsIn(4) — open catalog key; service assert HRM-ATT-CODE-KEY when EFF>0
 * must_keep: no product ceiling IsIn(4)
 */
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAttendanceStatusDto {
  @IsString()
  @MaxLength(64)
  status!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  note?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  updated_by?: string;
}
