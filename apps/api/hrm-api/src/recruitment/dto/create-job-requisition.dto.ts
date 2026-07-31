/**
 * @CODE-MEMORY
 * Screen:     HRM Tuyển dụng → Yêu cầu → Thêm (portal embed)
 * UC:         UC-HRM-22 · FR-HRM-RC-01 / HRM-RC-01
 * BR:         Số lượng cần tuyển bắt buộc > 0 (khách SRS §3.7)
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.7 FR-HRM-RC-01
 * TechSpec:   docs/hrm/TECHSPEC.md §14.7 · §14.9 G-RC-01
 * Purpose:    DTO tạo yêu cầu tuyển dụng — company/title/department/type + headcount ≥1.
 *             Không nhầm với job_postings.headcount hay headcount_proposals.
 * WorkItem:   BE-HRM-G-RC-01
 * Coded:      2026-07-21
 * Callers:    recruitment.controller.ts → createJobRequisition
 * Callees:    class-validator · RecruitmentService.createJobRequisition → public.job_requisitions
 * FEActions:  Form Lưu → POST /recruitment/requisitions → list hiện số lượng
 * BEChain:    ValidationPipe → INSERT job_requisitions.headcount → RETURNING
 * Impact:     Thiếu/≤0 headcount → 400; FE không bind field → create luôn fail
 * must_keep:  headcount @IsInt @Min(1) required; workflow_instance_id LOCK không đụng ở create
 * SOLID:      SRP — create shape tách UpdateJobRequisitionDto (status/notes)
 * LastVerified: be-hrm-g-rc-01.spec.ts
 */
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateJobRequisitionDto {
  @IsString()
  @MaxLength(64)
  company_id!: string;

  @IsString()
  @MaxLength(200)
  title!: string;

  @IsString()
  @MaxLength(50)
  department!: string;

  @IsString()
  @MaxLength(20)
  employment_type!: string;

  /** FR-HRM-RC-01 — số lượng cần tuyển; bắt buộc ≥ 1 (G-RC-01). */
  @IsInt()
  @Min(1)
  headcount!: number;

  /** Snapshot from JD template (BR-CD-F6-02) — not a live FK link. */
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  job_description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  requirements?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  job_template_id?: string;
}
