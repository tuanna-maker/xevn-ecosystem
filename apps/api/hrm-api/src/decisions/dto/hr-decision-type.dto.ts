/**
 * @CODE-MEMORY
 * Screen:     DTOs — F-DEC-CAT-TYP-01/02 · F-DEC-CAT-EFF-01
 * UC:         AC-PLT-DEC-01..06
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-DEC-BE-01
 * Coded:      2026-08-07
 * must_keep:  format-only decisionTypeKey · soft-delete retire · no closed enum · typed flags SoT
 */
import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  IsInt,
  Min,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ListHrDecisionTypesQueryDto {
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

  /** Merge settings-catalogs hr_decision_types REF (DEC wins on collision). */
  @IsOptional()
  @IsString()
  @MaxLength(8)
  include_group_ref?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  person_bound_only?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  q?: string;
}

export class UpsertHrDecisionTypeDto {
  @IsString()
  @MaxLength(64)
  companyId!: string;

  @IsString()
  @MaxLength(64)
  decisionTypeKey!: string;

  @IsString()
  @MaxLength(256)
  nameVi!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isPersonBound?: boolean;

  @IsOptional()
  @IsBoolean()
  writesWorkHistory?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  whEventType?: string | null;

  @IsOptional()
  @IsBoolean()
  requiresPositionKey?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  legacyAliasKeys?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(64)
  colorToken?: string | null;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: string;
}

export class PatchHrDecisionTypeDto {
  @IsOptional()
  @IsString()
  @MaxLength(256)
  nameVi?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isPersonBound?: boolean;

  @IsOptional()
  @IsBoolean()
  writesWorkHistory?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  whEventType?: string | null;

  @IsOptional()
  @IsBoolean()
  requiresPositionKey?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  legacyAliasKeys?: string[] | null;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  colorToken?: string | null;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown> | null;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: string;
}

export class GetHrDecisionTypeQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;
}

export class ListEffectiveHrDecisionTypesQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  q?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  person_bound_only?: string;
}
