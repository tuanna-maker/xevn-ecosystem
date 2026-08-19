/**
 * @CODE-MEMORY
 * Screen:     HRM → Tuyển dụng — JD template (create)
 * UC:         FR-UC-H04 · job templates
 * Purpose:    DTO tạo mẫu mô tả công việc / JD library.
 * WorkItem:   W1-B-01-BE-DIST-RESTORE
 * Coded:      2026-08-03
 * Callers:    recruitment.controller
 * must_keep:  company_id · code · title · position_code required
 * SOLID:      Pure DTO
 * LastVerified: tsc tsconfig.build.json
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: W1-B-01-BE-DIST-RESTORE
 * change_mode: ADD
 * What: Restore src from dist create-job-template.dto.js/.d.ts
 * Why: TS2307 R-HRM-DIST-MISSING
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-JD-DYNAMIC-BE-01
 * ADD values_json / layout_snapshot / layout_version / job_family for pack resolve (ARCH-02 F-JD-02).
 * must_keep: position_code · HRM-REC-JD-POS · FORBIDDEN job_postings dual-write
 */
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateJobTemplateDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsString()
  @MaxLength(64)
  code!: string;

  @IsString()
  @MaxLength(200)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  position_name?: string;

  @IsString()
  @MaxLength(64)
  position_code!: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  job_description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  requirements?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  /** Ignored on create — F-JD-02 always forces draft (P04). */
  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: string;

  /** Dynamic field values (flat map). Alias: values */
  @IsOptional()
  @IsObject()
  values_json?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  values?: Record<string, unknown>;

  /** Q6 snapshot v2 (groups[]) or omit → materialize from pack resolve */
  @IsOptional()
  @IsObject()
  layout_snapshot?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  layout_snapshot_json?: Record<string, unknown>;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  layout_version?: number;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  job_family?: string;

  @IsOptional()
  optional_group_codes?: string[];
}
