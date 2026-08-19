/**
 * @CODE-MEMORY
 * Screen:     DTOs — F-EMP-CAT-DOC-01/02 · F-EMP-CAT-EFF-01
 * UC:         AC-PLT-EMP-02/03/06
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-BE-01
 * Coded:      2026-08-07
 * must_keep:  format-only documentTypeKey · soft-delete retire · no closed enum
 */
import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class ListEmpDocumentTypesQueryDto {
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

  /** Reserved GĐ1 — no-op unless XBOS DOC partition exists later. */
  @IsOptional()
  @IsString()
  @MaxLength(8)
  include_group_ref?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  q?: string;
}

export class UpsertEmpDocumentTypeDto {
  @IsString()
  @MaxLength(64)
  companyId!: string;

  @IsString()
  @MaxLength(64)
  documentTypeKey!: string;

  @IsString()
  @MaxLength(256)
  nameVi!: string;

  @IsOptional()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  requiredByDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresExpiry?: boolean;

  @IsOptional()
  @IsBoolean()
  blocksActivation?: boolean;

  @IsOptional()
  @IsBoolean()
  isIdentityDoc?: boolean;

  @IsOptional()
  allowedMime?: unknown;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: string;
}

export class PatchEmpDocumentTypeDto {
  @IsOptional()
  @IsString()
  @MaxLength(256)
  nameVi?: string;

  @IsOptional()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  requiredByDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresExpiry?: boolean;

  @IsOptional()
  @IsBoolean()
  blocksActivation?: boolean;

  @IsOptional()
  @IsBoolean()
  isIdentityDoc?: boolean;

  @IsOptional()
  allowedMime?: unknown | null;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown> | null;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: string;
}

export class GetEmpDocumentTypeQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;
}

export class ListEffectiveEmpDocumentTypesQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  q?: string;
}
