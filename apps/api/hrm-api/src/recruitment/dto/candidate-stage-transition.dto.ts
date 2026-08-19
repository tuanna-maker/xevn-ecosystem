/**
 * @CODE-MEMORY
 * Screen:     HRM Tuyển dụng → UV theo YCTD → Đổi trạng thái / Timeline
 * UC:         UC-BP-REC-05 · F-REC-APP-02
 * BR:         BR-BP-CV-02 · VAL-REC-STG-03/05/06/08/09/24 · O1–O6
 * SRS:        SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-05 Diễn biến #1
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-REC-05-CLUSTER-API-01.md §5.1
 * Purpose:    Body POST …/candidates/:id/transitions — to_stage + optional note/salary/reverse.
 * WorkItem:   PO-HRM-MVP-GD1-REC-05-CLUSTER-BE-01
 * Coded:      2026-08-09
 * Callers:    recruitment.controller → transitionCandidateStage
 * must_keep:  physical /recruitment only · reject note · DENY Nest /rec · U65 no seed
 * LastVerified: po-hrm-mvp-gd1-rec-05-cluster-be-01.spec.ts
 */
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CandidateStageTransitionDto {
  /** Target pipeline stage_key (open catalog · EFF assert when EFF>0). */
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  to_stage!: string;

  /** Required when to_stage is reject-class (is_reject_outcome / fallback keys). */
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;

  /** Optional salary snapshot on history row (BR-BP-CV-02 depth). */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  desired_salary?: number;

  /** Explicit reverse intent when FE knows; also inferred from EFF sort_order. */
  @IsOptional()
  @IsBoolean()
  is_reverse?: boolean;
}

export class ListCandidateStageHistoryQueryDto {
  @IsOptional()
  @IsString()
  company_id?: string;

  @IsOptional()
  @IsString()
  requisition_id?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  cursor?: string;
}
