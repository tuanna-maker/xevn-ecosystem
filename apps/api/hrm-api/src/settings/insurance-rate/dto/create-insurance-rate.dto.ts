import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
  Max,
} from 'class-validator';

export class CreateInsuranceRateDto {
  @IsIn(['BHXH', 'BHYT', 'BHTN'])
  insuranceType: 'BHXH' | 'BHYT' | 'BHTN';

  @IsInt()
  @Min(2000)
  @Max(2100)
  effectiveYear: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  employerRatePercent: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  employeeRatePercent: number;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  salaryCapMultiplier?: number; // default 20

  @IsOptional()
  @IsDateString()
  effectiveFrom?: string; // default Jan 1 of year

  @IsOptional()
  @IsDateString()
  effectiveTo?: string; // default Dec 31 of year
}
