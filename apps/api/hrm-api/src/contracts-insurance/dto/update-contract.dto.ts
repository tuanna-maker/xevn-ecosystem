import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class UpdateContractDto {
  @IsOptional()
  @IsString()
  @MaxLength(40)
  contract_type?: string;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsString()
  status?: 'active' | 'expired' | 'terminated';

  /** @deprecated F5 — use compensation package APIs; ignored by BE. */
  @IsOptional()
  @IsNumber()
  salary?: number;

  /** Link to active compensation package (UC-HRM-CI-08 / BR-CD-F5-01). */
  @IsOptional()
  @IsUUID()
  compensation_package_id?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  position_key?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  position?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  department?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  department_key?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  signer_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  signer_position?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  signer_position_key?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  pack_code?: string;

  @IsOptional()
  @IsUUID()
  template_id?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  template_code?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  term_type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  work_location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  work_location_scope?: string;

  @IsOptional()
  @IsString()
  job_description_text?: string;

  @IsOptional()
  @IsNumber()
  probation_days?: number;

  @IsOptional()
  @IsDateString()
  probation_end?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  license_class?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  driver_license_class?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  driver_license_number?: string;

  @IsOptional()
  @IsDateString()
  driver_license_issued_on?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  driver_license_issued_place?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  vehicle_plate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  route_or_region?: string;

  @IsOptional()
  @IsDateString()
  signed_at?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  contract_name?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  work_arrangement?: string | null;

  @IsOptional()
  @IsNumber()
  salary_ratio_percent?: number | null;

  @IsOptional()
  @IsIn(['candidate', 'employee'])
  subject_type?: 'candidate' | 'employee';

  @IsOptional()
  @IsUUID()
  candidate_id?: string | null;

  @IsOptional()
  @IsUUID()
  requisition_id?: string | null;

  @IsOptional()
  @IsDateString()
  signing_date?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  work_form?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  contract_abstract?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  abstract?: string | null;

  @IsOptional()
  @IsBoolean()
  registry_only?: boolean;
}
