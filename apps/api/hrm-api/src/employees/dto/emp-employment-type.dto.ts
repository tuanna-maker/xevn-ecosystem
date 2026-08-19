/**
 * @CODE-MEMORY
 * Screen:     DTOs — F-EMP-CAT-ET-01/02 · F-EMP-CAT-EFF-02
 * UC:         AC-PLT-EMP-04/05
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-BE-01
 * Coded:      2026-08-07
 * must_keep:  format-only employmentTypeKey · hyphen→underscore · soft-delete · no closed enum
 */
import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class ListEmpEmploymentTypesQueryDto {
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

  /** Merge settings-catalogs employment_types REF (EMP wins on collision). */
  @IsOptional()
  @IsString()
  @MaxLength(8)
  include_group_ref?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  q?: string;
}

export class UpsertEmpEmploymentTypeDto {
  @IsString()
  @MaxLength(64)
  companyId!: string;

  @IsString()
  @MaxLength(64)
  employmentTypeKey!: string;

  @IsString()
  @MaxLength(256)
  nameVi!: string;

  @IsOptional()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  countsTowardHeadcount?: boolean;

  @IsOptional()
  @IsBoolean()
  eligibleForSi?: boolean;

  @IsOptional()
  @IsBoolean()
  isContingent?: boolean;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: string;
}

export class PatchEmpEmploymentTypeDto {
  @IsOptional()
  @IsString()
  @MaxLength(256)
  nameVi?: string;

  @IsOptional()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  countsTowardHeadcount?: boolean;

  @IsOptional()
  @IsBoolean()
  eligibleForSi?: boolean;

  @IsOptional()
  @IsBoolean()
  isContingent?: boolean;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown> | null;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: string;
}

export class GetEmpEmploymentTypeQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;
}

export class ListEffectiveEmpEmploymentTypesQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  q?: string;
}
