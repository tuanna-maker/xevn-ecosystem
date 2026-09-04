/**
 * @CODE-MEMORY
 * Screen:     HRM · Cài đặt · Thang bảng lương (Grade-Step)
 * UC:         UC-E1-01, UC-E1-02, UC-E1-03
 * SRS:        docs/hrm/SRS_HRM_PAYROLL_POLICY_ENGINE_v1.md §3
 * TechSpec:   TECHSPEC_HRM_POLICY_ENGINE_v1.md §8
 * Purpose:    DTOs (request body shapes) for GradeModule.
 *             Pure data classes — no I/O, no side-effects.
 * WorkItem:   HRM-POLICY-E1-01
 * Coded:      2026-08-22
 * SOLID:      SRP — data shapes only
 * FORBIDDEN:  DB calls · HTTP calls · NestJS DI decorators
 */

/** Một bậc lương trong ngạch */
export class GradeStepDto {
  /** Bậc số (1–9) */
  step_number!: number;
  /** Mức lương VND nguyên */
  monthly_salary_vnd!: number;
}

/** Tạo grade definition mới (theo QĐ) */
export class CreateGradeDto {
  /** Mã ngạch (D1, M1, E2...) */
  grade_code!: string;
  /** Tên ngạch đầy đủ */
  grade_name!: string;
  /** Ngày bắt đầu hiệu lực (YYYY-MM-DD) */
  effective_from!: string;
  /** Danh sách bậc lương */
  steps!: GradeStepDto[];
}

/** Update mức lương các bậc */
export class UpdateStepsDto {
  steps!: GradeStepDto[];
}

/** Gán ngạch-bậc cho nhân viên */
export class GradeAssignmentDto {
  grade_code!: string;
  step_number!: number;
  effective_from!: string;
  reason?: string;
}

/** Tạo đề xuất nâng bậc */
export class GradePromotionDto {
  employee_id!: string;
  proposed_step!: number;
  reason?: string;
}

/** Response types */
export type GradeStepResponse = {
  step_number: number;
  monthly_salary_vnd: string; // BigInt as string
};

export type GradeDefinitionResponse = {
  id: string;
  grade_code: string;
  grade_name: string;
  effective_from: string;
  effective_to: string | null;
  steps: GradeStepResponse[];
  created_by: string;
  created_at: string;
};

export type GradeAssignmentResponse = {
  assignment_id: string;
  employee_id: string;
  grade_code: string;
  step_number: number;
  effective_from: string;
  monthly_salary_vnd: string;
  grade_name: string;
};

export type PromotionAutoChecks = {
  years_of_service: number;
  kpi_avg_4_quarters: number | null;
  has_active_discipline: boolean;
  all_passed: boolean;
};

export type PromotionRequestResponse = {
  promotion_id: string;
  employee_id: string;
  current_step: number;
  proposed_step: number;
  status: string;
  auto_checks: PromotionAutoChecks;
};
