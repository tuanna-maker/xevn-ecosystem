/**
 * @CODE-MEMORY
 * Screen:     HRM So sánh · GET /recruitment/applications
 * UC:         FR-UC-BP-REC-06b · Diễn biến #3–#4 · #6
 * BR:         BR-BP-REC-CMP-01 · AC-REC-CMP-03/05
 * SRS:        SRS_HRM_ENTERPRISE.md v0.11 · REC-06b
 * TechSpec:   PO-HRM-REC-UV-YCTD-TECH-01 · F-REC-CMP-01
 * Purpose:    List UV applications by YCTD (+ optional evals). Lane A spine = recruitment_candidates.
 * WorkItem:   PO-HRM-REC-UV-YCTD-BE-01
 * Coded:      2026-08-06
 * must_keep:  Filter SoT = requisition_id · FORBIDDEN job_posting_id
 * LastVerified: po-hrm-rec-uv-yctd-be-01.spec.ts
 */
import { Transform } from 'class-transformer';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

function pickScalar(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    const first = value[0];
    return first == null ? undefined : String(first).trim();
  }
  if (value == null) return undefined;
  return String(value).trim();
}

export class ListApplicationsQueryDto {
  @IsString()
  @Transform(({ value, obj }) => pickScalar(value) ?? pickScalar(obj?.companyId) ?? pickScalar(obj?.company_id))
  @MaxLength(64)
  company_id!: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  requisition_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  recruitment_request_id?: string;

  /** include=evals → LEFT JOIN latest evaluation display. */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  include?: string;

  @IsOptional()
  @Transform(({ value, obj }) => pickScalar(value) ?? pickScalar(obj?.page))
  @Matches(/^\d+$/)
  page?: number | string = '1';

  @IsOptional()
  @Transform(({ value, obj }) => pickScalar(value) ?? pickScalar(obj?.page_size) ?? pickScalar(obj?.pageSize))
  @Matches(/^\d+$/)
  page_size?: number | string = '50';
}
