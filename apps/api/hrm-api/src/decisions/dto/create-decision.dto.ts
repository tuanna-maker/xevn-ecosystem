import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateDecisionDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @Transform(
    ({ value, obj }) => value ?? obj?.decisionCode ?? obj?.decision_code,
  )
  @IsString()
  @MaxLength(64)
  decision_code?: string;

  @IsString()
  @MaxLength(64)
  decision_type!: string;

  @IsOptional()
  @Transform(({ value, obj }) => value ?? obj?.name ?? obj?.decision_title)
  @IsString()
  @MaxLength(512)
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @Transform(({ value, obj }) => value ?? obj?.decision_date)
  @IsString()
  decision_date?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsUUID()
  employee_id?: string;

  @Transform(({ value, obj }) => value ?? obj?.full_name ?? 'Unknown employee')
  @IsString()
  @MaxLength(256)
  employee_name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  employee_code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  department?: string;

  /** Catalog SoT (departments.code) — preferred for WH copy (EMP-BE-01). */
  @IsOptional()
  @IsString()
  @MaxLength(128)
  department_key?: string;

  /** Snapshot label (U72) — optional when position_key denorms from catalog. */
  @IsOptional()
  @IsString()
  @MaxLength(128)
  position?: string;

  /** Catalog SoT (job_titles.code) — E1-A MD-BIND; ≠ employees.job_title_key. */
  @IsString()
  @MaxLength(128)
  position_key!: string;

  @IsOptional()
  @IsString()
  effective_date?: string;

  @IsOptional()
  @IsString()
  expiry_date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  signer_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  signer_position?: string;

  /** Catalog SoT for signer chức danh — required when signer fields present. */
  @IsOptional()
  @IsString()
  @MaxLength(128)
  signer_position_key?: string;

  @IsOptional()
  @IsString()
  signing_date?: string;

  @IsOptional()
  @IsString()
  file_url?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
