/**
 * @CODE-MEMORY
 * Screen:     DTO create overtime request — overtime_type open string
 * UC:         AC-PLT-ATT-OT-01*
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-BE-01
 * Coded:      2026-08-08
 * Purpose:    Giữ overtime_type @IsString mở — membership assert ở service vs EFF catalog.
 * must_keep:  FORBIDDEN @IsIn(['weekday','weekend','holiday']) product ceiling
 *
 * @CODE-MEMORY-CHANGE 2026-08-08
 * WorkItem: PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-BE-01
 * change_mode: ADD
 * What: Document open-string lock; invent KEY lives in AttOtTypeService assert (not DTO).
 *
 * @CODE-MEMORY-CHANGE 2026-08-08
 * WorkItem: PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-BE-01
 * change_mode: ADD
 * What: compensation_type stays optional open @IsString(); invent KEY (HRM-ATT-OT-COMP-KEY)
 *       lives in AttOtCompTypeService.assertCompTypeInEffectiveCatalog — NOT DTO.
 * must_keep: FORBIDDEN @IsIn(['salary','compensatory_leave']) product ceiling; KEEP TEXT soft key.
 */
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateOvertimeRequestDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsUUID()
  employee_id!: string;

  @IsString()
  employee_code!: string;

  @IsString()
  employee_name!: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsString()
  overtime_date!: string;

  @IsString()
  start_time!: string;

  @IsString()
  end_time!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  total_hours!: number;

  @IsString()
  overtime_type!: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  coefficient?: number;

  @IsString()
  reason!: string;

  @IsOptional()
  @IsString()
  compensation_type?: string;

  @IsOptional()
  @IsString()
  approver_name?: string;
}
