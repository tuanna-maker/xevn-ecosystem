/**
 * @CODE-MEMORY
 * Screen:     DTOs — F-ATT-CAT-OT-01/02 · EFF
 * UC:         AC-PLT-ATT-OT-01*
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-OT-TYPE-CATALOG-BE-01
 * Coded:      2026-08-08
 * must_keep:  format-only code · defaultCoeff display-ready ≠ formula · soft-delete · no IsIn(3)
 */
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class ListAttOtTypesQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: string;

  /** Audit — include inactive / archived rows (default list = active only). */
  @IsOptional()
  @IsString()
  @MaxLength(8)
  include_inactive?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  q?: string;
}

export class UpsertAttOtTypeDto {
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

  /** Display-ready default hệ số — ≠ payroll formula LIVE. */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  defaultCoeff?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
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

export class PatchAttOtTypeDto {
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
  @IsNumber()
  @Min(0)
  defaultCoeff?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
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

export class GetAttOtTypeQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;
}

export class ListEffectiveAttOtTypesQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  q?: string;
}
