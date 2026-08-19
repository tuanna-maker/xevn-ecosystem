/**
 * @CODE-MEMORY
 * Screen:     HRM Tuyển dụng → YCTD → Pipeline flags (MVP)
 * UC:         UC-BP-REC-02 · F-REC-YCTD-04 · Y-S13 · UC-BP-REC-04
 * BR:         VAL-10/11/13/14 · REC-03 OUT · BR-BP-CV-01
 * SRS:        FR-UC-BP-REC-02 Thành công «sẵn sàng nhận hồ sơ» · FR-UC-BP-REC-04
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01.md §5.4 · §6.2
 *             docs/program/specs/PO-HRM-MVP-GD1-REC-04-CLUSTER-API-01.md §5.4 · §6.1
 * Purpose:    PATCH pipeline_flags_json on YCTD — DENY Campaign entity.
 * WorkItem:   PO-HRM-MVP-GD1-REC-02-CLUSTER-BE-01
 * Coded:      2026-08-09
 * Callers:    recruitment.controller → patchRequisitionPipelineFlags
 * must_keep:  receivable gate · O4 MODE-UNCLASSIFIED · U65 no seed · REC-03 OUT
 * LastVerified: po-hrm-mvp-gd1-rec-02-cluster-be-01.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-04-CLUSTER-BE-01
 * ADD optional internal_scan_done|skipped|skip_reason — synonym F-REC-CV-SCAN-02/03;
 * RETAIN posted/has_cv/interview_started/cv_intake_allowed (no wipe).
 * change_mode: UPGRADE · API-01 §5.4 · §6.1
 */
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class PatchRequisitionPipelineFlagsDto {
  @IsOptional()
  @IsBoolean()
  posted?: boolean;

  @IsOptional()
  @IsBoolean()
  has_cv?: boolean;

  @IsOptional()
  @IsBoolean()
  interview_started?: boolean;

  @IsOptional()
  @IsBoolean()
  cv_intake_allowed?: boolean;

  @IsOptional()
  @IsBoolean()
  internal_scan_done?: boolean;

  @IsOptional()
  @IsBoolean()
  internal_scan_skipped?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  internal_scan_skip_reason?: string;
}
