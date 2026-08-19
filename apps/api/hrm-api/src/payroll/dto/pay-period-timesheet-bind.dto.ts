import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class CreateTimesheetBindItemDto {
  @IsUUID()
  timesheetHeaderId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  transferKind?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class CreateTimesheetBindDto {
  @IsUUID()
  timesheetHeaderId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  transferKind?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class ListTimesheetBindsQueryDto {
  @IsOptional()
  @IsString()
  company_id?: string;

  @IsOptional()
  include_archived?: boolean;

  @IsOptional()
  @IsString()
  transfer_kind?: string;
}

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

export class CreatePayrollPeriodWithBindsDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePayrollPeriodTimesheetBindItemDto)
  timesheetBinds?: CreatePayrollPeriodTimesheetBindItemDto[];
}
