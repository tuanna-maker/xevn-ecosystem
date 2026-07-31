import { IsDateString, IsNumber, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

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
}
