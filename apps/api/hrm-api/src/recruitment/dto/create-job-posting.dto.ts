import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * E1-A MD-BIND — position_key catalog SoT; position = optional label snapshot.
 * must_keep: Lane B ≠ FR-RC-01 SoT (job_requisitions).
 */
export class CreateJobPostingDto {
  @IsOptional()
  @IsString()
  owner_id?: string;

  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsString()
  @MaxLength(256)
  title!: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  department_key?: string;

  /** Snapshot label — denorm from catalog when omitted. */
  @IsOptional()
  @IsString()
  @MaxLength(256)
  position?: string;

  /** Catalog SoT (job_titles.code). Required at service layer — free-text position alone forbidden. */
  @IsOptional()
  @IsString()
  @MaxLength(128)
  position_key?: string;

  @IsOptional()
  @IsString()
  employment_type?: string;

  @IsOptional()
  @IsString()
  work_location?: string;

  @IsOptional()
  @IsNumber()
  salary_min?: number;

  @IsOptional()
  @IsNumber()
  salary_max?: number;

  @IsOptional()
  @IsBoolean()
  is_salary_visible?: boolean;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  requirements?: string;

  @IsOptional()
  @IsString()
  benefits?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  headcount?: number;

  @IsOptional()
  @IsString()
  deadline?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsString()
  status?: string;

  /** REC-JP-JD-LINK-BE-01 — optional JD template UUID to link to this posting. */
  @IsOptional()
  @IsString()
  jd_template_id?: string;

  @IsOptional()
  @IsString()
  workflow_id?: string;
}
