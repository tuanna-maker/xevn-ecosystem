/**
 * @CODE-MEMORY
 * Screen:     HRM Tuyển dụng → YCTD → Quét kho CV nội bộ
 * UC:         UC-BP-REC-04 · F-REC-CV-SCAN-02/03
 * BR:         BR-BP-CV-01 · BR-REC-CV-ZERO · BR-REC-CV-SKIP · O2/O5/O7
 * SRS:        docs/client-delivery/hrm-enterprise-blueprint/SRS_HRM_ENTERPRISE.md FR-UC-BP-REC-04 Diễn biến #2
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-REC-04-CLUSTER-API-01.md §5.2–§5.3 · §6.2
 * Purpose:    POST …/requisitions/:id/internal-scan — stamp internal_scan_* on pipeline_flags_json only.
 * WorkItem:   PO-HRM-MVP-GD1-REC-04-CLUSTER-BE-01
 * Coded:      2026-08-09
 * Callers:    recruitment.controller → postRequisitionInternalScan
 * Callees:    recruitment.service · yctd-requisition-gates
 * must_keep:  JSON keys only · DENY scan-event sole SoT · DENY Nest /rec dual · U65 no seed
 * SOLID:      DTO validation only — service owns merge + scope
 * LastVerified: po-hrm-mvp-gd1-rec-04-cluster-be-01.spec.ts
 */
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class InternalScanCriteriaSnapshotDto {
  @IsOptional()
  @IsString()
  @MaxLength(128)
  position_code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  skill?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  experience?: string;
}

export class InternalScanDto {
  @IsOptional()
  @IsIn(['complete', 'skip'])
  action?: 'complete' | 'skip';

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  skip_reason?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  hit_count?: number;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => InternalScanCriteriaSnapshotDto)
  criteria_snapshot?: InternalScanCriteriaSnapshotDto;
}
