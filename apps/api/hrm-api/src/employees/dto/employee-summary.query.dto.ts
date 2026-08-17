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

/**
 * P1-HRM-PERF-BE-01 — dashboard aggregate filters (same scope as list, no pagination).
 * PO-HRM-MVP-GD1-CORE-01 — VAL-D-06: salary bands / payroll omitted unless
 * `include=compensation_summary` (option c — not default public-ring SoT).
 */
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

  /** Comma list; `compensation_summary` unlocks payroll / salary_ranges / dept avg_salary. */
  @IsOptional()
  @IsString()
  include?: string;
}
