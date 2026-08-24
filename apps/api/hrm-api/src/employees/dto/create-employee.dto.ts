import {
  IsDateString,
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';

/**
 * @CODE-MEMORY
 * WorkItem: R-SPINE-MGR-HIER-01-BE
 * change_mode: ADD
 * What: optional manager_id (UUID | null) on create — FR-UC-H01 QL trực tiếp
 * Why: Option B product path; leave L1 direct_manager reads employees.manager_id
 * must_keep: null clear OK; service validates same company / ≠ self / no cycle
 */
export class CreateEmployeeDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsString()
  @MaxLength(64)
  employee_code!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MaxLength(255)
  full_name!: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  job_title_key?: string;

  /** QL trực tiếp — UUID active employee same company; null clears (create = no manager). */
  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsUUID('4')
  manager_id?: string | null;

  @IsOptional()
  @IsDateString()
  hired_at?: string;

  /** Open catalog status_key — ∈ F-EMP-CAT-ST-EFF when EFF>0 (F-EMP-ST-CNS-01). */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  status?: string;

  /** Soft reason payload — ∈ F-EMP-CAT-STR-EFF when required / EFF>0 (F-EMP-ST-CNS-02). */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  status_reason_key?: string;

  @IsOptional()
  @IsObject()
  custom_fields?: Record<string, string>;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  avatar_url?: string | null;
}
