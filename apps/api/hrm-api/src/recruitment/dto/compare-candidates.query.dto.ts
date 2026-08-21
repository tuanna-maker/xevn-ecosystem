/**
 * @CODE-MEMORY
 * Screen:     HRM So sánh ứng viên · GET /recruitment/compare
 * UC:         FR-UC-BP-REC-06b · Diễn biến #5
 * BR:         BR-BP-REC-CMP-01 · AC-REC-CMP-04
 * SRS:        SRS_HRM_ENTERPRISE.md v0.11 · REC-06b
 * TechSpec:   PO-HRM-REC-UV-YCTD-TECH-01 · F-REC-CMP-02
 * API:        PO-HRM-REC-UV-YCTD-API-01 · MAX-N · YCTD-MIX
 * Purpose:    Query DTO compare matrix — YCTD filter + candidate_ids ≤ N.
 * WorkItem:   PO-HRM-REC-UV-YCTD-BE-01
 * Coded:      2026-08-06
 * must_keep:  ONE physical requisition_id alias · FORBIDDEN job_posting_id SoT
 * LastVerified: po-hrm-rec-uv-yctd-be-01.spec.ts
 */
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';

function pickScalar(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    const first = value[0];
    return first == null ? undefined : String(first).trim();
  }
  if (value == null) return undefined;
  return String(value).trim();
}

export class CompareCandidatesQueryDto {
  @IsString()
  @Transform(
    ({ value, obj }) =>
      pickScalar(value) ??
      pickScalar(obj?.companyId) ??
      pickScalar(obj?.company_id),
  )
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

  /** Comma-separated or repeated query candidate UUIDs. */
  @IsOptional()
  @Transform(({ value, obj }) => {
    const raw = value ?? obj?.candidate_ids ?? obj?.candidateIds;
    if (raw == null) return undefined;
    if (Array.isArray(raw))
      return raw
        .map((v) => String(v).trim())
        .filter(Boolean)
        .join(',');
    return String(raw).trim();
  })
  @IsString()
  candidate_ids?: string;

  @IsOptional()
  @Transform(({ value, obj }) => {
    const raw = value ?? obj?.application_ids ?? obj?.applicationIds;
    if (raw == null) return undefined;
    if (Array.isArray(raw))
      return raw
        .map((v) => String(v).trim())
        .filter(Boolean)
        .join(',');
    return String(raw).trim();
  })
  @IsString()
  application_ids?: string;
}
