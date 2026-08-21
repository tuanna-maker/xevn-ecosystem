/**
 * @CODE-MEMORY
 * Screen:     HRM → Hiệu suất — phiếu đánh giá (PATCH)
 * UC:         FR-UC-H05 · performance evaluations
 * Purpose:    DTO cập nhật đánh giá (score/summary/status/KPI keys).
 * WorkItem:   W1-B-01-BE-DIST-RESTORE
 * Coded:      2026-08-03
 * Callers:    performance.controller · performance.service
 * must_keep:  score 0..100; status ∈ draft|submitted|approved|completed
 * SOLID:      Pure DTO
 * LastVerified: tsc tsconfig.build.json
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: W1-B-01-BE-DIST-RESTORE
 * change_mode: ADD
 * What: Restore src from dist update-performance-evaluation.dto.js/.d.ts
 * Why: TS2307 R-HRM-DIST-MISSING
 */
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdatePerformanceEvaluationDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  score?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  summary?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  reviewer?: string;

  @IsOptional()
  @IsIn(['draft', 'submitted', 'approved', 'completed'])
  status?: 'draft' | 'submitted' | 'approved' | 'completed';

  @IsOptional()
  @IsString()
  @MaxLength(64)
  kpi_code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  job_grade_key?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  department_key?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  kpi_name?: string;
}
