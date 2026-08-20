import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateInsurancePolicyDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  policy_code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  policy_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  insurer_key?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  insurance_type?: string;

  @IsOptional()
  @IsDateString()
  effective_date?: string;

  @IsOptional()
  @IsDateString()
  expiry_date?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsOptional()
  @IsIn(['draft', 'active', 'expired', 'cancelled'])
  status?: 'draft' | 'active' | 'expired' | 'cancelled';
}
