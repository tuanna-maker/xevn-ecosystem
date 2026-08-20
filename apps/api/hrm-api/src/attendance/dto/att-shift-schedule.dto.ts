import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class UpsertAttShiftDto {
  @IsString()
  company_id: string;

  @IsString()
  code: string;

  @IsString()
  name_vi: string;

  @IsOptional()
  @IsString()
  start_time?: string;

  @IsOptional()
  @IsString()
  end_time?: string;

  @IsOptional()
  @IsInt()
  break_minutes?: number;

  @IsOptional()
  @IsBoolean()
  is_flexible?: boolean;

  @IsOptional()
  @IsBoolean()
  is_night_shift?: boolean;

  @IsOptional()
  @IsString()
  apply_to?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class UpsertAttRuleDto {
  @IsString()
  company_id: string;

  @IsString()
  code: string;

  @IsString()
  name_vi: string;

  @IsString()
  rule_type: string;

  @IsOptional()
  @IsString()
  formula_desc?: string;

  @IsOptional()
  @IsString()
  apply_to?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class UpsertAttScheduleDto {
  @IsString()
  company_id: string;

  @IsString()
  code: string;

  @IsString()
  name_vi: string;

  @IsOptional()
  @IsString()
  default_shift_code?: string;

  @IsOptional()
  @IsString()
  working_days?: string;

  @IsOptional()
  @IsString()
  apply_to?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class ListAttShiftRuleScheduleQueryDto {
  @IsString()
  company_id: string;

  @IsOptional()
  @IsString()
  q?: string;
}
