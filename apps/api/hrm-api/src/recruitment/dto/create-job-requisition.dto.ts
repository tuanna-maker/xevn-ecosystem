/**
 * @CODE-MEMORY
 * Screen:     HRM Tuyển dụng → Yêu cầu → Thêm (portal embed)
 * UC:         UC-HRM-22 · FR-HRM-RC-01 · UC-BP-REC-02/02b
 * BR:         G-RC-01 headcount ≥1 · VAL-REC-YCTD-01..07
 * SRS:        docs/client-delivery/hrm/SRS_HRM_KHACH.md §3.7 FR-HRM-RC-01
 * TechSpec:   docs/program/specs/PO-HRM-MVP-GD1-REC-02-CLUSTER-API-01.md §6.1
 * Purpose:    DTO tạo YCTD — Wave-2 mode/hire/cell/out + JD soft FK.
 * WorkItem:   BE-HRM-G-RC-01 · PO-HRM-MVP-GD1-REC-02-CLUSTER-BE-01
 * Coded:      2026-07-21
 * Callers:    recruitment.controller.ts → createJobRequisition
 * Callees:    class-validator · RecruitmentService.createJobRequisition
 * must_keep:  headcount @IsInt @Min(1); workflow_instance_id LOCK không đụng ở create
 * SOLID:      SRP — create shape tách UpdateJobRequisitionDto
 * LastVerified: po-hrm-mvp-gd1-rec-02-cluster-be-01.spec.ts
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-JD-YCTD-REF-BE-01
 * ADD alias job_description_id ↔ job_template_id (ONE physical soft FK).
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-02-CLUSTER-BE-01
 * ADD headcount_mode · headcount_cell_id · hire_reason · replace_employee_id
 * · out_of_plan_reason · target_month · plan/keys — create → draft (Y-S7).
 * change_mode: UPGRADE · must_keep G-RC-01 · JD soft FK · spawn UQ · U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-02-TARGET-MONTH-BE-01
 * target_month: accept YYYY-MM | YYYY-MM-01 at service (normalizeTargetMonthOrThrow);
 * DTO remains optional string — invalid → HRM-YCTD-VAL-400 not PG 500.
 * change_mode: FIX · residual R-REC-02-TARGET-MONTH-DATE
 */
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

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

  /** Preferred on create; required on submit (VAL-01). */
  @IsOptional()
  @IsString()
  @MaxLength(32)
  headcount_mode?: string;

  /** Required when headcount_mode=in_plan. */
  @IsOptional()
  @IsUUID()
  headcount_cell_id?: string;

  /** YYYY-MM | YYYY-MM-01 — coerced to first-of-month DATE in service. */
  @IsOptional()
  @IsString()
  @MaxLength(32)
  target_month?: string;

  @IsOptional()
  @IsUUID()
  recruitment_plan_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  department_key?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  position_key?: string;

  /** AC-SET-CONSUMER-JG-REC-01 — catalog job_grades code when EFF>0. */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  job_grade_key?: string;

  /** new | replace (alias replacement→replace). Required on submit. */
  @IsOptional()
  @IsString()
  @MaxLength(32)
  hire_reason?: string;

  @IsOptional()
  @IsUUID()
  replace_employee_id?: string;

  /** Required when out_of_plan on submit; optional on draft. */
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  out_of_plan_reason?: string;

  /** Optional one-way snapshot text on YCTD (≠ template values_json SoT). */
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  job_description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  requirements?: string;

  /** Physical soft FK → job_description_templates.id (DB-01). */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  job_template_id?: string;

  /** Logical enterprise alias — same value as job_template_id (API-01 §2). */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  job_description_id?: string;
}
