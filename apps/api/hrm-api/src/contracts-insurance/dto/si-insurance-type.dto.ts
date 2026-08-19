/**
 * @CODE-MEMORY
 * Screen:     DTOs — F-SI-CAT-TYP-01/02 · F-SI-CAT-EFF-01
 * UC:         AC-PLT-SI-INS-01..01d
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-SI-INS-CATALOG-BE-01
 * Coded:      2026-08-08
 * must_keep:  format-only insuranceTypeKey · soft-delete retire · no closed enum · insurers OUT
 */
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class ListSiInsuranceTypesQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  include_archived?: string;

  /** Merge settings-catalogs insurance_types REF (SI wins on collision). */
  @IsOptional()
  @IsString()
  @MaxLength(8)
  include_group_ref?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  q?: string;
}

export class UpsertSiInsuranceTypeDto {
  @IsString()
  @MaxLength(64)
  companyId!: string;

  @IsString()
  @MaxLength(64)
  insuranceTypeKey!: string;

  @IsString()
  @MaxLength(256)
  nameVi!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isStatutory?: boolean;

  @IsOptional()
  @IsBoolean()
  eligibleForRateCfg?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresPolicy?: boolean;

  @IsOptional()
  @IsArray()
  legacyAliasKeys?: string[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: string;
}

export class PatchSiInsuranceTypeDto {
  @IsOptional()
  @IsString()
  @MaxLength(256)
  nameVi?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isStatutory?: boolean;

  @IsOptional()
  @IsBoolean()
  eligibleForRateCfg?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresPolicy?: boolean;

  @IsOptional()
  @IsArray()
  legacyAliasKeys?: string[] | null;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown> | null;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: string;
}

export class GetSiInsuranceTypeQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;
}

export class ListEffectiveSiInsuranceTypesQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  q?: string;
}
