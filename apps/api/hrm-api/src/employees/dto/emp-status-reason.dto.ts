/**
 * @CODE-MEMORY
 * Screen:     DTOs — F-EMP-CAT-STR-01/02 · F-EMP-CAT-STR-EFF-01
 * UC:         AC-PLT-EMP-STATUS-01e
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-EMP-STATUS-CATALOG-BE-01
 * Coded:      2026-08-08
 * must_keep:  format-only reasonKey · soft applies_to · soft-delete · no hard FK
 */
import {
  IsArray,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class ListEmpStatusReasonsQueryDto {
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

  /** Optional filter — reason applies_to includes this status_key (or null applies_to = all). */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  applies_to_status_key?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  q?: string;
}

export class UpsertEmpStatusReasonDto {
  @IsString()
  @MaxLength(64)
  companyId!: string;

  @IsString()
  @MaxLength(64)
  reasonKey!: string;

  @IsString()
  @MaxLength(256)
  nameVi!: string;

  @IsOptional()
  sortOrder?: number;

  @IsOptional()
  @IsArray()
  appliesToStatusKeys?: string[];

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: string;
}

export class PatchEmpStatusReasonDto {
  @IsOptional()
  @IsString()
  @MaxLength(256)
  nameVi?: string;

  @IsOptional()
  sortOrder?: number;

  @IsOptional()
  @IsArray()
  appliesToStatusKeys?: string[] | null;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown> | null;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: string;
}

export class GetEmpStatusReasonQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;
}

export class ListEffectiveEmpStatusReasonsQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  applies_to_status_key?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  q?: string;
}
