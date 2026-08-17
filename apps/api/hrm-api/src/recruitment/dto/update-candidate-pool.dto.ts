/**
 * @CODE-MEMORY
 * Screen:     HRM Tuyển dụng → Sửa ứng viên (PATCH /recruitment/candidates-pool/:id)
 * UC:         FR-HRM-INT-01 · UF-HRM-12
 * BR:         G-DB-01 hire bind
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md FR-HRM-INT-01
 * TechSpec:   docs/hrm/TECHSPEC.md §17.3 G-DB-01 · §17.6 Lane B pool
 * Purpose:    DTO PATCH pool — parity với CandidateFormDialog (cùng field create).
 * WorkItem:   PO-E2E-SPINE-01-BE-CAND-DTO-01
 * Coded:      2026-08-03
 * Callers:    recruitment.controller.ts updateCandidatePool
 * Callees:    RecruitmentCatalogService.updateCandidatePool
 * must_keep:  employee_id khi stage=hired · G-DB-01 soft stamp
 * SOLID:      Contract layer — whitelist khớp FE update payload
 * LastVerified: docs/qa/evidence/po-e2e-spine-01-be-cand-dto-01.md
 *
 * @CODE-MEMORY-CHANGE 2026-08-03 PO-E2E-SPINE-01-BE-CAND-DTO-01
 * ADD optional FE form fields (position/rating/expected_start_date/nationality/hometown/marital_status)
 * — same parity as CreateCandidateDto; avoid VAL-001 on edit after create fix.
 * change_mode: ADD · must_keep G-DB-01 hire employee_id
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

export class UpdateCandidatePoolDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  full_name?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(200)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  position?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  source?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  stage?: string;

  /** FR-HRM-INT-01 / G-DB-01 — bắt buộc khi stage=hired (hoặc reverse employees.candidate_id). */
  @IsOptional()
  @IsUUID()
  employee_id?: string;

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
}
