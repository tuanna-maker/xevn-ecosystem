import {
  IsString,
  Matches,
  MaxLength,
  IsInt,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
  Max,
} from 'class-validator';

/** Format khớp SI catalog key — cấm enum đóng BHXH/BHYT/BHTN. */
const SI_INSURANCE_TYPE_KEY_FORMAT = /^[a-zA-Z][a-zA-Z0-9_]*$/;

export class CreateInsuranceRateDto {
  @IsString()
  @MaxLength(64)
  @Matches(SI_INSURANCE_TYPE_KEY_FORMAT, {
    message: 'insuranceType must match SI catalog key format',
  })
  insuranceType: string;

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

  /** Excel `ghi_chu` — optional free text. */
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
