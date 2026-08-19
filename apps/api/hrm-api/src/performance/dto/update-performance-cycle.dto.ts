/**
 * @CODE-MEMORY
 * Screen:     HRM → Hiệu suất — chu kỳ đánh giá (PATCH)
 * UC:         FR-UC-H05 · performance cycles
 * Purpose:    DTO cập nhật chu kỳ đánh giá (name/dates/status).
 * WorkItem:   W1-B-01-BE-DIST-RESTORE
 * Coded:      2026-08-03
 * Callers:    performance.controller · performance.service
 * must_keep:  status ∈ draft|active|closed|open; U65 no seed
 * SOLID:      Pure DTO
 * LastVerified: tsc tsconfig.build.json
 *
 * @CODE-MEMORY-CHANGE 2026-08-03
 * WorkItem: W1-B-01-BE-DIST-RESTORE
 * change_mode: ADD
 * What: Restore src from dist update-performance-cycle.dto.js/.d.ts
 * Why: TS2307 R-HRM-DIST-MISSING
 */
import { IsDateString, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdatePerformanceCycleDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  cycle_name?: string;

  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsIn(['draft', 'active', 'closed', 'open'])
  status?: 'draft' | 'active' | 'closed' | 'open';
}
