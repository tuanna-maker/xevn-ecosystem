/**
 * @CODE-MEMORY
 * Screen:     DTOs — F-EMP-CAT-ST-01..04 · F-EMP-CAT-ST-EFF-01
 * UC:         AC-PLT-EMP-STATUS-01*
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BE-01
 * Coded:      2026-08-08
 * must_keep:  format-only statusKey · typed flags · soft-delete · no closed enum
 */
import {
  IsArray,
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class ListEmpEmploymentStatusesQueryDto {
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

  /** Merge settings-catalogs employee_statuses/employment_statuses REF (EMP wins). */
  @IsOptional()
  @IsString()
  @MaxLength(8)
  include_group_ref?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  q?: string;
}

export class UpsertEmpEmploymentStatusDto {
  @IsString()
  @MaxLength(64)
  companyId!: string;

  @IsString()
  @MaxLength(64)
  statusKey!: string;

  @IsString()
  @MaxLength(256)
  nameVi!: string;

  @IsOptional()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isWorkforceActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isTerminal?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresReason?: boolean;

  @IsOptional()
  @IsBoolean()
  countsTowardHeadcount?: boolean;

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

export class PatchEmpEmploymentStatusDto {
  @IsOptional()
  @IsString()
  @MaxLength(256)
  nameVi?: string;

  @IsOptional()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isWorkforceActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isTerminal?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresReason?: boolean;

  @IsOptional()
  @IsBoolean()
  countsTowardHeadcount?: boolean;

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

export class GetEmpEmploymentStatusQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;
}

export class ListEffectiveEmpEmploymentStatusesQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  q?: string;
}
