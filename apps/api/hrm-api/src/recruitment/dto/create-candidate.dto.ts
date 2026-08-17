/**
 * @CODE-MEMORY
 * Screen:     HRM Tuyển dụng → Thêm ứng viên (POST /recruitment/candidates)
 * UC:         FR-HRM-RC-03 · FR-HRM-INT-01 · UF-HRM-12 / J-REC-WF-04
 * BR:         G-DB-04 dual-route · G-DB-01 hire bind
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md FR-HRM-RC-03 · HDSD CH07 §6
 * TechSpec:   docs/hrm/TECHSPEC.md §17.6 dual-route POST /candidates
 * Purpose:    DTO create candidate — Lane A (có requisition_id) + Lane B pool (thiếu requisition_id).
 * WorkItem:   PO-E2E-SPINE-01-BE-CAND-DTO-01
 * Coded:      2026-08-03
 * Callers:    recruitment.controller.ts createCandidate
 * Callees:    RecruitmentService.createCandidate · RecruitmentCatalogService.createCandidatePool
 * must_keep:  dual-route requisition_id · G-DB-01 employee_id khi hired · Leave/AUTH/EMP/CAT không đụng
 * SOLID:      Contract layer — whitelist khớp CandidateFormDialog FE payload
 * LastVerified: docs/qa/evidence/po-e2e-spine-01-be-cand-dto-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-03 PO-E2E-SPINE-01-BE-CAND-DTO-01
 * ADD optional FE form fields: position, rating, expected_start_date, nationality, hometown,
 * marital_status, employee_id — clear HRM-VAL-001 forbidNonWhitelisted từ CandidateFormDialog.
 * change_mode: ADD · must_keep G-DB-01 hire · dual-route · LV-03/04 / AUTH/EMP/CAT untouched
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-REC-UV-YCTD-BE-01
 * ADD alias recruitment_request_id · optional position_key (must match YCTD).
 * FR-05a: YCTD required on POST /candidates — no silent Lane B (pool = POST candidates-pool).
 * change_mode: ADD · must_keep ONE physical requisition_id · FORBIDDEN free-text position SoT
 */
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCandidateDto {
  @IsString()
  @MaxLength(80)
  company_id!: string;

  /** Physical soft FK → job_requisitions (ONE column — DB-01). */
  @IsOptional()
  @IsUUID()
  requisition_id?: string;

  /** Logical alias — same id as requisition_id (AV-UV-YCTD-ALIAS-01). */
  @IsOptional()
  @IsUUID()
  recruitment_request_id?: string;

  /** Optional client key — must match YCTD derived position_key when set. */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  position_key?: string | null;

  @IsString()
  @MaxLength(150)
  full_name!: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  source?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  stage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string | null;

  /** Lane B pool — free-text position snapshot (HDSD form). */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  position?: string | null;

  /** CandidateFormDialog rating 0–5. */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(5)
  rating?: number | null;

  @IsOptional()
  @IsDateString()
  applied_date?: string | null;

  @IsOptional()
  @IsDateString()
  expected_start_date?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  nationality?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  hometown?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  marital_status?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string | null;

  /** FR-HRM-INT-01 / G-DB-01 — bắt buộc khi stage=hired (pool). */
  @IsOptional()
  @IsUUID()
  employee_id?: string;
}
