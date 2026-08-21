import {
  IsOptional,
  IsNumber,
  IsIn,
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
  effectiveTo?: string;
}
