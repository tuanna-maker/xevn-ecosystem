/**
 * @CODE-MEMORY
 * Screen:     HRM Settings / HĐ — template · clause · pack · preview DTOs
 * UC:         FR-UC-BP-CORE-09 · 09a · 09b · 09c · 09d
 * WorkItem:   PO-HRM-CONTRACT-LEGAL-PRINT-BE-01
 * Coded:      2026-08-06
 * must_keep:  salary off body; pack codes GENERAL|IT_OFFICE|DRIVER|LOGISTICS; no 9th XEVN
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-BE-01
 * change_mode: EXPAND
 * What: matrix=xevn query; template duration/title; preview template_code; CFG settings DTOs
 * Why: XEVN-TPL-API-01 F.1 deepen FR-09d
 * must_keep: UF-HRM-02 nullable template; pack_code derive when template set
 *
 * @CODE-MEMORY-CHANGE 2026-08-07 PO-HRM-CONTRACT-LEGAL-PRINT-XEVN-TPL-BE-02
 * change_mode: FIX
 * What: (no DTO field change) — confirm EXPAND fields stay on Upsert/Update for nest rebuild ship
 * Why: QA-01 live dist whitelist reject default_term_type…; rebuild unblocks AC-11
 * must_keep: open catalog · company-settings DTOs · printable=false
 */
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ListContractTemplatesQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  pack_code?: string;

  /** `xevn` → matrix_family=XEVN_MATRIX AND code IN 8-set. */
  @IsOptional()
  @IsString()
  @MaxLength(16)
  matrix?: string;
}

export class UpsertContractTemplateDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsString()
  @MaxLength(64)
  code!: string;

  @IsString()
  @MaxLength(256)
  name_vi!: string;

  @IsString()
  @MaxLength(32)
  pack_code!: string;

  @IsOptional()
  @IsObject()
  layout_json?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  keyword_map?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  status?: 'draft' | 'active' | 'retired';

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @MaxLength(32)
  default_term_type?: 'probation' | 'definite' | 'indefinite' | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsInt()
  default_duration_days?: number | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsInt()
  default_duration_months?: number | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @MaxLength(256)
  title_print_vi?: string | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @MaxLength(32)
  matrix_family?: 'XEVN_MATRIX' | 'LEGACY' | null;

  /** Ordered clause ids for FE DnD (attach/reorder). */
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  clause_ids?: string[];
}

export class UpdateContractTemplateDto {
  @IsOptional()
  @IsString()
  @MaxLength(256)
  name_vi?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  pack_code?: string;

  @IsOptional()
  @IsObject()
  layout_json?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  keyword_map?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  status?: 'draft' | 'active' | 'retired';

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @MaxLength(32)
  default_term_type?: 'probation' | 'definite' | 'indefinite' | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsInt()
  default_duration_days?: number | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsInt()
  default_duration_months?: number | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @MaxLength(256)
  title_print_vi?: string | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @MaxLength(32)
  matrix_family?: 'XEVN_MATRIX' | 'LEGACY' | null;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  clause_ids?: string[];
}

export class PutTemplateClausesDto {
  @IsArray()
  @ArrayMinSize(0)
  @IsUUID('4', { each: true })
  clause_ids!: string[];
}

export class ListContractClausesQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  clause_group?: string;

  @IsOptional()
  @IsString()
  pack_code?: string;
}

export class UpsertContractClauseDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsString()
  @MaxLength(64)
  code!: string;

  @IsString()
  @MaxLength(256)
  title_vi!: string;

  @IsString()
  body_vi!: string;

  @IsString()
  @MaxLength(64)
  clause_group!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  apply_to_packs?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;

  @IsOptional()
  @IsBoolean()
  mandatory?: boolean;

  @IsOptional()
  @IsString()
  status?: 'draft' | 'active' | 'retired';

  @IsOptional()
  @IsDateString()
  effective_from?: string;
}

export class UpdateContractClauseDto {
  @IsOptional()
  @IsString()
  @MaxLength(256)
  title_vi?: string;

  @IsOptional()
  @IsString()
  body_vi?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  clause_group?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  apply_to_packs?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;

  @IsOptional()
  @IsBoolean()
  mandatory?: boolean;

  @IsOptional()
  @IsString()
  status?: 'draft' | 'active' | 'retired';

  @IsOptional()
  @IsDateString()
  effective_from?: string;
}

export class ListContractPackRulesQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;
}

export class ContractPackRuleItemDto {
  @IsString()
  match_type!: 'job_family' | 'fallback';

  @IsOptional()
  @IsString()
  match_value?: string | null;

  @IsString()
  pack_code!: string;

  @IsOptional()
  @IsInt()
  priority?: number;
}

export class PutContractPackRulesDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContractPackRuleItemDto)
  rules!: ContractPackRuleItemDto[];
}

export class PackResolveQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsUUID()
  employee_id!: string;
}

export class ContractPreviewDto {
  @IsOptional()
  @IsUUID()
  template_id?: string;

  /** Resolve active template by code when template_id omitted (FR-09d). */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  template_code?: string;

  /** Optional when template resolved — must match XEVN pack when set. */
  @ValidateIf((o: ContractPreviewDto) => !o.template_id && !o.template_code)
  @IsString()
  @MaxLength(32)
  pack_code?: string;

  @IsOptional()
  @IsObject()
  field_overrides?: Record<string, unknown>;

  /** When true, attempt unmasked C&B (caller ACL — GĐ1 default allow if package linked). */
  @IsOptional()
  @IsBoolean()
  can_view_cb?: boolean;

  /** Ephemeral clause order override (F-CORE-CTR-PREV-01 EXPAND — per-contract overlay, not template junction). */
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  clause_ids?: string[];
}

/** F-CORE-CTR-OVERLAY-01 — persist draft clause order on employee_contracts. */
export class PutContractPrintOverlayDto {
  @IsArray()
  @IsUUID('4', { each: true })
  clause_ids!: string[];
}

export class CreatePrintVersionDto {
  @IsOptional()
  @IsUUID()
  template_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  template_code?: string;

  @ValidateIf((o: CreatePrintVersionDto) => !o.template_id && !o.template_code)
  @IsString()
  @MaxLength(32)
  pack_code?: string;

  @IsOptional()
  @IsObject()
  field_overrides?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  can_view_cb?: boolean;
}

/** F-CORE-CTR-CFG-01 — contract number Settings. */
export class GetContractCompanySettingQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsString()
  @MaxLength(64)
  key!: string;
}

export class PutContractCompanySettingDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsString()
  @MaxLength(64)
  setting_key!: string;

  @IsObject()
  value!: Record<string, unknown>;
}

/** F-CORE-CTR-PUB-01 — body company_id forbidden (query scope only). */
export class PublishContractLibraryDto {
  @IsOptional()
  @IsString()
  @MaxLength(256)
  label_vi?: string;
}

export class ListContractLibraryPublishesQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  company_id?: string;
}

export class PullContractLibraryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  publish_version?: number;

  @IsOptional()
  @IsBoolean()
  force?: boolean;
}

export class ApplyContractLibraryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  publish_version?: number;
}
