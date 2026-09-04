import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

function toOptionalInt(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toOptionalBool(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return undefined;
}

export class ListEmployeesQueryDto {
  @IsString()
  company_id!: string;

  @IsOptional()
  @IsString()
  view?: string;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  department?: string;


  @IsOptional()
  @IsString()
  attendance_filter?: string;

  @IsOptional()
  @Transform(({ value }) => toOptionalBool(value))
  include_attendance_today?: boolean;

  @IsOptional()
  @Transform(({ value }) => toOptionalBool(value))
  include_archived?: boolean;

  @IsOptional()
  @Transform(({ value }) => toOptionalInt(value))
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }) => toOptionalInt(value))
  @IsInt()
  @Min(1)
  /** Nest hard cap 100 (unchanged). UI tables: prefer 30–50 (ADR-HRM-SCALE §5.2). */
  @Max(100)
  page_size?: number;

  /**
   * CD-FB-05 / ADR-HRM-SCALE §5.4 — opaque keyset cursor (created_at + id).
   * When set, OFFSET `page` is ignored; response includes `next_cursor`.
   */
  @IsOptional()
  @IsString()
  cursor?: string;
}
