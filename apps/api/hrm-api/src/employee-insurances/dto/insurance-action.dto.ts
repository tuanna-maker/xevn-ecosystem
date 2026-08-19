import { IsIn, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

/** F-CORE-SI-03 — lifecycle action on enrollment SoT `employee_insurances`. */
export class InsuranceActionDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsIn(['close', 'stop', 'suspend', 'change_rate', 'resume'])
  action!: 'close' | 'stop' | 'suspend' | 'change_rate' | 'resume';

  @IsString()
  effective_from!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  employee_amount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  employer_amount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  employee_rate_pct?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  employer_rate_pct?: number;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  change_reason?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  suspend_reason?: string;
}
