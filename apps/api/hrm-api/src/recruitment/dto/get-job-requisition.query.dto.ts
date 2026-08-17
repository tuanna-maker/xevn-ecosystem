/**
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-REC-UV-YCTD-BE-01
 * ADD for / bind_check / preview — UV bind-target STATUS gate (F-REC-UV-YCTD-02).
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

export class GetJobRequisitionQueryDto {
  @IsString()
  @Transform(({ value, obj }) => pickScalar(value) ?? pickScalar(obj?.companyId) ?? pickScalar(obj?.company_id))
  @MaxLength(64)
  company_id!: string;

  /** for=uv → assert receivable or HRM-REC-UV-YCTD-STATUS. */
  @IsOptional()
  @IsString()
  @MaxLength(32)
  for?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  bind_check?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  preview?: string;
}
