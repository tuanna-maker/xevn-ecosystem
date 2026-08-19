import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

export class GetSickLeaveFundOrderQueryDto {
  @IsOptional()
  @IsString()
  company_id?: string;
}

export class PutSickLeaveFundOrderDto {
  @IsOptional()
  @IsString()
  company_id?: string;

  @IsArray()
  @IsString({ each: true })
  fund_sequence!: string[];

  @IsOptional()
  @IsBoolean()
  annual_first_enabled?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  insurance_day_cap?: number | null;

  @ValidateIf((o: PutSickLeaveFundOrderDto) => o.insurance_day_cap != null)
  @IsIn(['company_topup', 'unpaid'])
  over_insurance_action?: 'company_topup' | 'unpaid' | null;

  @IsOptional()
  @IsString()
  effective_from?: string;

  @IsOptional()
  @IsIn(['active', 'retired'])
  status?: 'active' | 'retired';
}
