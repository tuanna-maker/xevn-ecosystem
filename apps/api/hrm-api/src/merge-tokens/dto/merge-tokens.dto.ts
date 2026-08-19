/**
 * @CODE-MEMORY
 * Screen:     DTOs — F-PLT-TOK-01..03
 * UC:         BR-PLT-01 · AC-PLT-CTR-05
 * WorkItem:   PO-HRM-DYNAMIC-CONFIG-PLATFORM-BE-01
 * Coded:      2026-08-07
 * must_keep:  format-only tokenKey validation · soft-delete retire · no closed enum
 */
import {
  IsArray,
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class ListMergeTokensQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  domain?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  ring?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  origin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  include_archived?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  q?: string;
}

export class UpsertMergeTokenDto {
  @IsString()
  @MaxLength(64)
  companyId!: string;

  @IsString()
  @MaxLength(128)
  tokenKey!: string;

  @IsString()
  @MaxLength(256)
  sourcePath!: string;

  @IsString()
  @MaxLength(16)
  ring!: string;

  @IsString()
  @MaxLength(8)
  domain!: string;

  @IsString()
  @MaxLength(256)
  labelVi!: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  origin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  extensionFieldRef?: string;

  @IsOptional()
  @IsObject()
  meta?: Record<string, unknown>;
}

export class PatchMergeTokenDto {
  @IsOptional()
  @IsString()
  @MaxLength(256)
  sourcePath?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  ring?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  domain?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  labelVi?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  origin?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  extensionFieldRef?: string;

  @IsOptional()
  @IsObject()
  meta?: Record<string, unknown>;
}

export class ResolveMergePreviewDto {
  @IsString()
  @MaxLength(64)
  companyId!: string;

  @IsOptional()
  @IsUUID()
  templateId?: string;

  @IsOptional()
  @IsUUID()
  contractId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(8)
  domain?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tokenKeys?: string[];

  @IsOptional()
  @IsObject()
  fieldOverrides?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  canViewCb?: boolean;

  @IsOptional()
  @IsBoolean()
  strict?: boolean;
}
