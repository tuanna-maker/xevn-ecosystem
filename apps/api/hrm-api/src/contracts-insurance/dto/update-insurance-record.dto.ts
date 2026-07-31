import { IsDateString, IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class UpdateInsuranceRecordDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  insurer_key?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  provider?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  policy_number?: string;

  @IsOptional()
  @IsDateString()
  expiry_date?: string;

  @IsOptional()
  @IsIn(['active', 'expired', 'cancelled'])
  status?: 'active' | 'expired' | 'cancelled';

  @IsOptional()
  @IsUUID()
  policy_id?: string;
}
