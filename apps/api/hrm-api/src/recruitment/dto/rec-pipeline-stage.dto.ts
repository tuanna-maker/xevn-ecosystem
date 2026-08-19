/**
 * @CODE-MEMORY
 * Screen:     DTOs — F-REC-CAT-STG-01/02 · F-REC-CAT-EFF-01
 * UC:         AC-PLT-REC-02..05
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-REC-BE-01
 * Coded:      2026-08-07
 * must_keep:  format-only stageKey · soft-delete retire · no closed enum · wfTaskTypeKey ops-only
 */
import {
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class ListRecPipelineStagesQueryDto {
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

  /** Reserved GĐ1 — no-op unless XBOS stages REF exists later. */
  @IsOptional()
  @IsString()
  @MaxLength(8)
  include_group_ref?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  q?: string;
}

export class UpsertRecPipelineStageDto {
  @IsString()
  @MaxLength(64)
  companyId!: string;

  @IsString()
  @MaxLength(64)
  stageKey!: string;

  @IsString()
  @MaxLength(256)
  nameVi!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isTerminal?: boolean;

  @IsOptional()
  @IsBoolean()
  isHiredOutcome?: boolean;

  @IsOptional()
  @IsBoolean()
  isRejectOutcome?: boolean;

  @IsOptional()
  @IsBoolean()
  allowsInterviewSchedule?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  wfTaskTypeKey?: string | null;

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

export class PatchRecPipelineStageDto {
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
  isTerminal?: boolean;

  @IsOptional()
  @IsBoolean()
  isHiredOutcome?: boolean;

  @IsOptional()
  @IsBoolean()
  isRejectOutcome?: boolean;

  @IsOptional()
  @IsBoolean()
  allowsInterviewSchedule?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  wfTaskTypeKey?: string | null;

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

export class GetRecPipelineStageQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;
}

export class ListEffectiveRecPipelineStagesQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  q?: string;
}
