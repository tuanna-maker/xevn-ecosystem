import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class CreatePayrollPeriodTimesheetBindItemDto {
  @IsUUID()
  timesheetHeaderId!: string;

  @IsOptional()
  @IsString()
  transferKind?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

export class CreatePayrollPeriodDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsString()
  @MaxLength(100)
  period_label!: string;

  @IsDateString()
  start_date!: string;

  @IsDateString()
  end_date!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  created_by?: string;

  /** AMIS mẫu bảng lương — NOT salary_templates enroll pack id. */
  @IsOptional()
  @IsUUID()
  paySheetTemplateId?: string;

  @IsOptional()
  @IsUUID()
  pay_sheet_template_id?: string;

  /** Optional scoped payroll group (F-PAY-GROUP-01). */
  @IsOptional()
  @IsUUID()
  payroll_group_id?: string | null;

  /** AMIS Step4 — optional chuyển công binds on period create (F-PAY-PERIOD-01 EXPAND). */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePayrollPeriodTimesheetBindItemDto)
  timesheetBinds?: CreatePayrollPeriodTimesheetBindItemDto[];
}
