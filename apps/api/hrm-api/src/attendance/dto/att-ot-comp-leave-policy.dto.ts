import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

export class GetOtCompLeavePolicyQueryDto {
  @IsOptional()
  @IsString()
  company_id?: string;
}

export class PutOtCompLeavePolicyDto {
  @IsOptional()
  @IsString()
  company_id?: string;

  @IsBoolean()
  mode_enabled!: boolean;

  @ValidateIf((o: PutOtCompLeavePolicyDto) => o.mode_enabled === true)
  @IsNumber()
  @Min(0.01)
  hours_per_leave_day?: number | null;

  @IsOptional()
  @IsString()
  comp_balance_key?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  maps_comp_codes?: string[];

  @IsOptional()
  @IsString()
  effective_from?: string;
}
