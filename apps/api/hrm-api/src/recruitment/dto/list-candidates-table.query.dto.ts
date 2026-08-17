/**
 * @CODE-MEMORY
 * Screen:     HRM Tuyển dụng → Quét kho CV (candidates-pool)
 * UC:         UC-BP-REC-04 · F-REC-CV-SCAN-01
 * BR:         BR-REC-CV-CRITERIA · O3/O4 · U19
 * SRS:        FR-UC-BP-REC-04 Diễn biến #1
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-REC-04-CLUSTER-API-01.md §5.1 · §6.3
 * Purpose:    GET candidates-pool query — scope + optional YCTD scan criteria (title+skill/exp).
 * WorkItem:   PO-HRM-MVP-GD1-REC-04-CLUSTER-BE-01
 * Coded:      2026-08-09
 * must_keep:  company_id · stage RETAIN · Lane B public.candidates · DENY mega-EAV
 * LastVerified: po-hrm-mvp-gd1-rec-04-cluster-be-01.spec.ts
 */
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

/** Supabase `candidates` table (distinct from recruitment_candidates). */
export class ListCandidatesTableQueryDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  stage?: string;

  /** YCTD context for Quét kho — F-REC-CV-SCAN-01. */
  @IsOptional()
  @IsUUID()
  requisition_id?: string;

  @IsOptional()
  @IsIn(['internal_scan'])
  for?: 'internal_scan';

  @IsOptional()
  @IsString()
  @MaxLength(128)
  position_code?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  position?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  q_position?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  skill?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  q_skill?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  experience?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  experience_min_years?: number;
}
