import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

const NATURES = ['income', 'deduction', 'other'] as const;
const VALUE_TYPES = ['currency', 'number', 'percentage'] as const;

export class ListSalaryComponentsQueryDto {
  @IsString()
  company_id!: string;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  @IsBoolean()
  include_archived?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  @IsBoolean()
  active_only?: boolean;
}

export class CreateSalaryComponentDto {
  @IsString()
  company_id!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(64)
  code!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  name!: string;

  @IsOptional()
  @IsUUID()
  category_id?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(64)
  component_type!: string;

  @IsOptional()
  @IsIn(NATURES)
  nature?: (typeof NATURES)[number];

  @IsOptional()
  @IsIn(VALUE_TYPES)
  value_type?: (typeof VALUE_TYPES)[number];

  @IsOptional()
  @IsBoolean()
  is_taxable?: boolean;

  @IsOptional()
  @IsBoolean()
  is_insurance_base?: boolean;

  /** @deprecated Legacy hint only — use default_formula_definition_id for engine bind. */
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  formula?: string;

  @IsOptional()
  @IsUUID()
  default_formula_definition_id?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  default_value?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  min_value?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  max_value?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  applied_to?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sort_order?: number;
}

export class UpdateSalaryComponentDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  code?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  name?: string;

  @IsOptional()
  @IsUUID()
  category_id?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  component_type?: string;

  @IsOptional()
  @IsIn(NATURES)
  nature?: (typeof NATURES)[number];

  @IsOptional()
  @IsIn(VALUE_TYPES)
  value_type?: (typeof VALUE_TYPES)[number];

  @IsOptional()
  @IsBoolean()
  is_taxable?: boolean;

  @IsOptional()
  @IsBoolean()
  is_insurance_base?: boolean;

  /** @deprecated Legacy hint only — not engine SoT. */
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  formula?: string | null;

  @IsOptional()
  @IsUUID()
  default_formula_definition_id?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  default_value?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  min_value?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  max_value?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  applied_to?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sort_order?: number;
}
