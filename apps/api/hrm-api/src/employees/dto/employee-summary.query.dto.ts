import { Transform } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

function toOptionalBool(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return undefined;
}

/** P1-HRM-PERF-BE-01 — dashboard aggregate filters (same scope as list, no pagination). */
export class EmployeeSummaryQueryDto {
  @IsString()
  company_id!: string;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @Transform(({ value }) => toOptionalBool(value))
  include_archived?: boolean;
}
