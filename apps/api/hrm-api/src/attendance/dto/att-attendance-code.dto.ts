/**
 * @CODE-MEMORY
 * Screen:     DTOs — F-ATT-CAT-CODE-01..04 · F-ATT-CAT-CODE-EFF-01
 * UC:         AC-PLT-ATT-CODE-01*
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-CODE-CATALOG-BE-01
 * Coded:      2026-08-08
 * must_keep:  format-only code · typed flags · soft-delete · no closed enum IsIn(4)
 */
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class ListAttAttendanceCodesQueryDto {
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

  /** Merge settings-catalogs attendance_codes REF (ATT wins). */
  @IsOptional()
  @IsString()
  @MaxLength(8)
  include_group_ref?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  q?: string;
}

export class UpsertAttAttendanceCodeDto {
  @IsString()
  @MaxLength(64)
  companyId!: string;

  @IsString()
  @MaxLength(64)
  code!: string;

  @IsString()
  @MaxLength(256)
  nameVi!: string;

  @IsString()
  @MaxLength(16)
  symbol!: string;

  @IsOptional()
  sortOrder?: number;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  countsAs?: string;

  @IsOptional()
  @IsNumber()
  dayWeight?: number;

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @IsOptional()
  @IsBoolean()
  isPresent?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  color?: string;

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

export class PatchAttAttendanceCodeDto {
  @IsOptional()
  @IsString()
  @MaxLength(256)
  nameVi?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  symbol?: string;

  @IsOptional()
  sortOrder?: number;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  countsAs?: string;

  @IsOptional()
  @IsNumber()
  dayWeight?: number;

  @IsOptional()
  @IsBoolean()
  isPaid?: boolean;

  @IsOptional()
  @IsBoolean()
  isPresent?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  color?: string | null;

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

export class GetAttAttendanceCodeQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;
}

export class ListEffectiveAttAttendanceCodesQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  q?: string;
}
