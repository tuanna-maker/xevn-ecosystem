import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

function pickScalar(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    const first = value[0];
    return first == null ? undefined : String(first).trim();
  }
  if (value == null) return undefined;
  return String(value).trim();
}

/** ESS self-service list — company_id optional (defaults from JWT). */
export class ListMyPayslipsQueryDto {
  @IsOptional()
  @Transform(
    ({ value, obj }) =>
      pickScalar(value) ??
      pickScalar(obj?.companyId) ??
      pickScalar(obj?.company_id),
  )
  @IsString()
  @MaxLength(64)
  company_id?: string;

  @IsOptional()
  @IsUUID()
  period_id?: string;
}
