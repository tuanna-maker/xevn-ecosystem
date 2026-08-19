import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

function pickScalar(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    const first = value[0];
    return first == null ? undefined : String(first).trim();
  }
  if (value == null) return undefined;
  return String(value).trim();
}

function parseIncludeSegments(value: unknown): boolean | undefined {
  const raw = pickScalar(value);
  if (raw == null || raw === '') return undefined;
  const lower = raw.toLowerCase();
  if (['0', 'false', 'no', 'off'].includes(lower)) return false;
  return true;
}

/** Query for F-PAY-PAYSLIP-01 GET by id / lines — company_id required for scope_parity with list. */
export class GetPayrollPayslipQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  companyId?: string;

  @Transform(({ value, obj }) => {
    return pickScalar(value) ?? pickScalar(obj?.companyId) ?? pickScalar(obj?.company_id);
  })
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @Transform(({ value, obj }) =>
    parseIncludeSegments(value ?? obj?.includeSegments ?? obj?.include_segments),
  )
  @IsBoolean()
  include_segments?: boolean;
}
