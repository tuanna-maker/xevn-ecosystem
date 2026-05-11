import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

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
}
