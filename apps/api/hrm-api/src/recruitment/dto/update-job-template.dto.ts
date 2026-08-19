/**
 * @CODE-MEMORY
 * Screen:     HRM → Tuyển dụng — JD template (PATCH)
 * UC:         FR-UC-H04 · job templates
 * Purpose:    DTO cập nhật mẫu JD (không đổi company_id).
 * WorkItem:   W1-B-01-BE-DIST-RESTORE
 * Coded:      2026-08-03
 * Callers:    recruitment.controller
 * must_keep:  all fields optional; no company_id (dist parity)
 * SOLID:      Pure DTO
 * LastVerified: tsc tsconfig.build.json
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: W1-B-01-BE-DIST-RESTORE
 * change_mode: ADD
 * What: Restore src from dist update-job-template.dto.js/.d.ts
 * Why: TS2307 R-HRM-DIST-MISSING
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-JD-DYNAMIC-BE-01
 * ADD values/layout_snapshot patch (Q6 snapshot only unless Settings publish).
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

export class UpdateJobTemplateDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  position_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  position_code?: string;

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

  /** Optional synonym: status=active | action=publish → publishJobDescriptionTemplate. */
  @IsOptional()
  @IsString()
  @MaxLength(16)
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  action?: string;

  @IsOptional()
  @IsObject()
  values_json?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  values?: Record<string, unknown>;

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
}
