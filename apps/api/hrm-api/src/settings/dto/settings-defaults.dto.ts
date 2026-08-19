/**
 * @CODE-MEMORY
 * Screen:     DTOs F-SET-TAX/SI/POS
 * UC:         UC-SET-DEF-01..05
 * WorkItem:   PO-HRM-SETTINGS-DEFAULTS-BE-01
 * Purpose:    Wire camelCase request DTOs for Settings tax / SI / position policy.
 * Coded:      2026-08-07
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-SETTINGS-DEFAULTS-BE-02
 * change_mode: FIX
 * What: PutSettingsCompanySettingDto.value — @Allow() so forbidNonWhitelisted accepts pay_tax_* UPSERT body
 * must_keep: shape still validated in SettingsTaxParamsService (HRM-SET-TAX-400-SHAPE)
 */
import { Transform, Type } from 'class-transformer';
import {
  Allow,
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { POS_CALC_MODES, POS_STATUSES, SI_STATUSES } from '../settings-defaults.constants';

function toBool(value: unknown): boolean {
  return value === true || value === 'true' || value === '1' || value === 'TRUE';
}

export class GetSettingsCompanySettingsQueryDto {
  @IsString()
  company_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  key?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  prefix?: string;
}

export class PutSettingsCompanySettingDto {
  @IsString()
  companyId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(128)
  settingKey!: string;

  /**
   * Typed JSON per pay_tax_* shape — validated in service (VAL-SET-TAX-01/02).
   * Must carry a class-validator decorator or ValidationPipe forbidNonWhitelisted
   * rejects with HRM-VAL-001 «property value should not exist» (D-SETDEF-QA-TAX-01).
   */
  @Allow()
  value!: unknown;
}

export class ListInsuranceRateCfgQueryDto {
  @IsString()
  company_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  insurance_type_key?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  ou_id?: string;

  @IsOptional()
  @IsIn(SI_STATUSES)
  status?: (typeof SI_STATUSES)[number];

  @IsOptional()
  @IsString()
  as_of?: string;

  @IsOptional()
  @Transform(({ value }) => toBool(value))
  @IsBoolean()
  include_retired?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page_size?: number;
}

export class CreateInsuranceRateCfgDto {
  @IsString()
  companyId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  ouId?: string | null;

  @IsString()
  @MinLength(1)
  @MaxLength(64)
  insuranceTypeKey!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  employeeRatePct!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  employerRatePct!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  ceilingAmount?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  currency?: string;

  @IsString()
  effectiveFrom!: string;

  @IsOptional()
  @IsString()
  effectiveTo?: string | null;

  @IsOptional()
  @IsIn(SI_STATUSES)
  status?: (typeof SI_STATUSES)[number];

  @IsOptional()
  @IsUUID()
  supersedesId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string | null;
}

export class PatchInsuranceRateCfgDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  employeeRatePct?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  employerRatePct?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  ceilingAmount?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  currency?: string;

  @IsOptional()
  @IsString()
  effectiveFrom?: string;

  @IsOptional()
  @IsString()
  effectiveTo?: string | null;

  @IsOptional()
  @IsIn(SI_STATUSES)
  status?: (typeof SI_STATUSES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  ouId?: string | null;
}

export class PositionPolicyLineDto {
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  componentCode!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsIn(POS_CALC_MODES)
  calcMode?: (typeof POS_CALC_MODES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(8)
  currency?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsUUID()
  salaryComponentId?: string | null;

  @IsOptional()
  @IsUUID()
  allowanceTypeId?: string | null;
}

export class ListPositionCompensationPoliciesQueryDto {
  @IsString()
  company_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  position_key?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  ou_id?: string;

  @IsOptional()
  @IsIn(POS_STATUSES)
  status?: (typeof POS_STATUSES)[number];

  @IsOptional()
  @IsString()
  as_of?: string;

  @IsOptional()
  @Transform(({ value }) => toBool(value))
  @IsBoolean()
  include_retired?: boolean;
}

export class CreatePositionCompensationPolicyDto {
  @IsString()
  companyId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  ouId?: string | null;

  @IsString()
  @MinLength(1)
  @MaxLength(128)
  positionKey!: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  nameVi?: string | null;

  @IsString()
  effectiveFrom!: string;

  @IsOptional()
  @IsString()
  effectiveTo?: string | null;

  @IsOptional()
  @IsIn(POS_STATUSES)
  status?: (typeof POS_STATUSES)[number];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => PositionPolicyLineDto)
  lines?: PositionPolicyLineDto[];
}

export class PatchPositionCompensationPolicyDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  ouId?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  positionKey?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  nameVi?: string | null;

  @IsOptional()
  @IsString()
  effectiveFrom?: string;

  @IsOptional()
  @IsString()
  effectiveTo?: string | null;

  @IsOptional()
  @IsIn(POS_STATUSES)
  status?: (typeof POS_STATUSES)[number];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(200)
  @ValidateNested({ each: true })
  @Type(() => PositionPolicyLineDto)
  lines?: PositionPolicyLineDto[];
}

export class ResolvePositionCompensationQueryDto {
  @IsString()
  company_id!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(128)
  positionKey!: string;

  @IsOptional()
  @IsString()
  asOf?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  ouId?: string;

  @IsOptional()
  @IsUUID()
  employeeId?: string;
}
