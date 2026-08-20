import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateInsuranceRecordDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsUUID()
  employee_id!: string;

  /** Snapshot label — derived from insurer catalog when insurer_key set. */
  @IsOptional()
  @IsString()
  @MaxLength(50)
  provider?: string;

  /** E3 — soft → insurers catalog (required on new writes). */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  insurer_key?: string;

  @IsOptional()
  @IsUUID()
  policy_id?: string;

  @IsString()
  @MaxLength(60)
  policy_number!: string;

  @IsDateString()
  expiry_date!: string;
}
