import {
  IsOptional,
  IsNumber,
  IsIn,
  IsString,
  MaxLength,
  Min,
  Max,
  IsDateString,
} from 'class-validator';

export class UpdateInsuranceRateDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  employerRatePercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  employeeRatePercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  salaryCapMultiplier?: number;

  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @IsOptional()
  @IsDateString()
  effectiveTo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
