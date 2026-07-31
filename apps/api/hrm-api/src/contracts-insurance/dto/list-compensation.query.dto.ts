import { Transform } from 'class-transformer';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

function pickScalar(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    const first = value[0];
    return first == null ? undefined : String(first).trim();
  }
  if (value == null) return undefined;
  return String(value).trim();
}

export class ListCompensationQueryDto {
  @IsString()
  @Transform(({ value, obj }) => pickScalar(value) ?? pickScalar(obj?.companyId) ?? pickScalar(obj?.company_id))
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  employee_id?: string;

  @IsOptional()
  @IsString()
  package_id?: string;

  /** ISO date for active package lookup (payroll as-of). Defaults to CURRENT_DATE. */
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  as_of?: string;

  @IsOptional()
  @Transform(({ value, obj }) => pickScalar(value) ?? pickScalar(obj?.page))
  @Matches(/^\d+$/)
  page?: number | string = '1';

  @IsOptional()
  @Transform(({ value, obj }) => pickScalar(value) ?? pickScalar(obj?.page_size) ?? pickScalar(obj?.pageSize))
  @Matches(/^\d+$/)
  page_size?: number | string = '20';
}
