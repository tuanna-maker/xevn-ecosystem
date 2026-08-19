/**
 * @CODE-MEMORY
 * Screen:     DTOs · F-ATT-CAT-OTC-01/02 · EFF
 * UC:         AC-PLT-ATT-COMP-01*
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-ATT-COMP-TYPE-CATALOG-BE-01
 * Coded:      2026-08-08
 * Purpose:    DTO validate catalog att_ot_comp_type - code format-only, không cột payroll formula.
 * must_keep:  format-only code · soft-delete · no IsIn(salary|compensatory_leave) · no coeff column
 */
import { Type } from 'class-transformer';
import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class ListAttOtCompTypesQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: string;

  /** Audit - include inactive / archived rows (default list = active only). */
  @IsOptional()
  @IsString()
  @MaxLength(8)
  include_inactive?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  q?: string;
}

export class UpsertAttOtCompTypeDto {
  @IsString()
  @MaxLength(64)
  companyId!: string;

  @IsString()
  @MaxLength(64)
  code!: string;

  @IsString()
  @MaxLength(128)
  nameVi!: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  nameEn?: string;

  @IsOptional()
  @Type(() => Number)
  sortOrder?: number;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  color?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: string;
}

export class PatchAttOtCompTypeDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  nameVi?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  nameEn?: string | null;

  @IsOptional()
  @Type(() => Number)
  sortOrder?: number;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  color?: string | null;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown> | null;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: string;
}

export class GetAttOtCompTypeQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;
}

export class ListEffectiveAttOtCompTypesQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  q?: string;
}