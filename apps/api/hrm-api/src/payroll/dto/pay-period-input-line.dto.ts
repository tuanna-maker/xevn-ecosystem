import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class ListPeriodInputLinesQueryDto {
  @IsOptional()
  @IsString()
  company_id?: string;

  @IsOptional()
  @IsUUID()
  employee_id?: string;

  @IsOptional()
  @IsString()
  component_code?: string;

  @IsOptional()
  @IsString()
  source_kind?: string;

  @IsOptional()
  include_archived?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsString()
  cursor?: string;
}

export class CreatePeriodInputLineDto {
  @IsUUID()
  employeeId!: string;

  @IsString()
  @MaxLength(64)
  componentCode!: string;

  @IsNumber()
  amount!: number;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  sourceKind?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  sourceRef?: string;

  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class UpdatePeriodInputLineDto {
  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @IsOptional()
  @IsDateString()
  effectiveDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  sourceKind?: string;
}

export class BridgeAdvanceToPeriodDto {
  @IsUUID()
  payrollPeriodId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  componentCode?: string;
}

export class MarkAdvancePaidDto {
  @IsString()
  @MaxLength(128)
  reviewer_name!: string;

  @IsOptional()
  @IsUUID()
  reviewer_employee_id?: string;

  @IsOptional()
  @IsString()
  rejected_reason?: string;

  @IsUUID()
  payrollPeriodId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  componentCode?: string;
}
