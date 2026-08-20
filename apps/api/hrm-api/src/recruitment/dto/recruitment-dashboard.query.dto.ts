/**
 * @CODE-MEMORY
 * Screen:     GET /api/hrm/recruitment/dashboard* query DTO
 * UC:         UC-BP-REC-08 · VAL-REC-DASH-01
 * WorkItem:   PO-HRM-MVP-GD1-REC-08-CLUSTER-BE-01
 * Purpose:    Period + scope + drill pagination query for F-REC-DASH-01/02.
 */
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';

function pickScalar(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    const first = value[0];
    return first == null ? undefined : String(first).trim();
  }
  if (value == null) return undefined;
  return String(value).trim();
}

export class RecruitmentDashboardQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  @Transform(
    ({ value, obj }) =>
      pickScalar(value) ??
      pickScalar(obj?.companyId) ??
      pickScalar(obj?.company_id),
  )
  company_id?: string;

  @IsOptional()
  @Transform(({ value }) => pickScalar(value))
  year?: string;

  @IsOptional()
  @IsString()
  @MaxLength(7)
  @Transform(({ value }) => pickScalar(value))
  from?: string;

  @IsOptional()
  @IsString()
  @MaxLength(7)
  @Transform(({ value }) => pickScalar(value))
  to?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  @Transform(({ value }) => pickScalar(value))
  department_key?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  @Transform(({ value }) => pickScalar(value))
  position_key?: string;

  /** `yctd` → attach by_yctd drill (same as GET …/dashboard/yctd). */
  @IsOptional()
  @IsString()
  @MaxLength(32)
  @Transform(({ value }) => pickScalar(value))
  include?: string;

  @IsOptional()
  @Transform(({ value }) => pickScalar(value))
  page?: string;

  @IsOptional()
  @Transform(({ value }) => pickScalar(value))
  page_size?: string;
}
