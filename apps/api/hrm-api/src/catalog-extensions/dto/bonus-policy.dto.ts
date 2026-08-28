import { Type } from 'class-transformer';
import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsNumber, 
  IsArray, 
  ValidateNested, 
  IsIn, 
  IsDateString 
} from 'class-validator';

export class BonusExtraDataDto {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsString()
  @IsNotEmpty()
  source: string;

  @IsOptional()
  default_value?: any;
}

export class BonusTierDto {
  @IsNumber()
  from: number;

  @IsNumber()
  to: number;

  @IsNumber()
  value: number;

  @IsString()
  @IsIn(['fixed', 'percentage'])
  type: 'fixed' | 'percentage';
}

export class CreateBonusPolicyDto {
  @IsOptional()
  @IsString()
  company_id?: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  component_type?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  calculation_method: string;

  @IsNumber()
  base_value: number;

  @IsOptional()
  @IsString()
  percentage_base?: string;

  @IsOptional()
  @IsString()
  formula?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BonusTierDto)
  tiers?: BonusTierDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BonusExtraDataDto)
  extra_data?: BonusExtraDataDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  conditions?: string[];

  @IsDateString()
  effective_date: string;

  @IsOptional()
  @IsDateString()
  expiry_date?: string;

  @IsString()
  @IsIn(['active', 'inactive', 'draft'])
  status: 'active' | 'inactive' | 'draft';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applied_departments?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applied_positions?: string[];
}
