/**
 * @CODE-MEMORY
 * Screen:     DTOs F-ALLOW-CAT-01..04
 * UC:         UC-SET-DEF-03
 * WorkItem:   PO-HRM-ALLOWANCE-CATALOG-SYNC-BE-01
 * Purpose:    Wire camelCase request DTOs for Settings PC/KT catalog.
 * Coded:      2026-08-07
 */
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  ALLOWANCE_CALC_MODES,
  ALLOWANCE_ENTRY_KINDS,
  ALLOWANCE_NATURES,
  ALLOWANCE_STATUSES,
  ALLOWANCE_VALUE_TYPES,
} from '../allowance-catalog.constants';

export class ListAllowanceDeductionTypesQueryDto {
  @IsString()
  company_id!: string;

  @IsOptional()
  @IsIn(ALLOWANCE_ENTRY_KINDS)
  entry_kind?: (typeof ALLOWANCE_ENTRY_KINDS)[number];

  @IsOptional()
  @IsIn(ALLOWANCE_STATUSES)
  status?: (typeof ALLOWANCE_STATUSES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(128)
  q?: string;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  @IsBoolean()
  include_retired?: boolean;
}

export class CreateAllowanceDeductionTypeDto {
  @IsString()
  companyId!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(64)
  code!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(256)
  nameVi!: string;

  @IsIn(ALLOWANCE_ENTRY_KINDS)
  entryKind!: (typeof ALLOWANCE_ENTRY_KINDS)[number];

  @IsOptional()
  @IsIn(ALLOWANCE_NATURES)
  nature?: (typeof ALLOWANCE_NATURES)[number];

  @IsOptional()
  @IsIn(ALLOWANCE_VALUE_TYPES)
  valueType?: (typeof ALLOWANCE_VALUE_TYPES)[number];

  @IsOptional()
  @IsBoolean()
  isTaxable?: boolean;

  @IsOptional()
  @IsBoolean()
  isInsuranceBase?: boolean;

  @IsOptional()
  @IsIn(ALLOWANCE_CALC_MODES)
  calcMode?: (typeof ALLOWANCE_CALC_MODES)[number];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  defaultValue?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minValue?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxValue?: number | null;

  @IsOptional()
  @IsUUID()
  defaultFormulaDefinitionId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  componentType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsIn(ALLOWANCE_STATUSES)
  status?: (typeof ALLOWANCE_STATUSES)[number];
}

export class UpdateAllowanceDeductionTypeDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(64)
  code?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(256)
  nameVi?: string;

  @IsOptional()
  @IsIn(ALLOWANCE_ENTRY_KINDS)
  entryKind?: (typeof ALLOWANCE_ENTRY_KINDS)[number];

  @IsOptional()
  @IsIn(ALLOWANCE_NATURES)
  nature?: (typeof ALLOWANCE_NATURES)[number];

  @IsOptional()
  @IsIn(ALLOWANCE_VALUE_TYPES)
  valueType?: (typeof ALLOWANCE_VALUE_TYPES)[number];

  @IsOptional()
  @IsBoolean()
  isTaxable?: boolean;

  @IsOptional()
  @IsBoolean()
  isInsuranceBase?: boolean;

  @IsOptional()
  @IsIn(ALLOWANCE_CALC_MODES)
  calcMode?: (typeof ALLOWANCE_CALC_MODES)[number];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  defaultValue?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minValue?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxValue?: number | null;

  @IsOptional()
  @IsUUID()
  defaultFormulaDefinitionId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  componentType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsIn(ALLOWANCE_STATUSES)
  status?: (typeof ALLOWANCE_STATUSES)[number];
}

export class RetireAllowanceDeductionTypeDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
