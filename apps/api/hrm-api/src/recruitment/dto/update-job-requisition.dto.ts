/**
 * @CODE-MEMORY-CHANGE 2026-07-21 BE-HRM-G-RC-01
 * ADD optional headcount @IsInt @Min(1) — FR-HRM-RC-01 / TechSpec §14.7 G-RC-01.
 * must_keep: status + notes (UF-HRM-12); workflow_instance_id LOCK stays in service.
 *
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-JD-YCTD-REF-BE-01
 * ADD optional JD re-bind fields (alias) · F-YCTD-JD-04 · status may stay when only rebinding.
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-02-CLUSTER-BE-01
 * ADD classify fields (mode/cell/hire/out) · EXPAND status open_for_hire.
 * FORBIDDEN client patch status→open_for_hire to skip WF (use transitions).
 * change_mode: UPGRADE · must_keep UF-HRM-12 notes · JD soft FK · U65 no seed
 *
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-02-TARGET-MONTH-BE-01
 * ADD optional target_month — service normalizeTargetMonthOrThrow before ::date.
 * change_mode: FIX · residual R-REC-02-TARGET-MONTH-DATE
 */
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

const REQUISITION_STATUSES = [
  'open',
  'open_for_hire',
  'closed',
  'on_hold',
  'draft',
  'pending_approval',
  'approved',
  'rejected',
  'cancelled',
] as const;

export class UpdateJobRequisitionDto {
  /** Optional when patch only rebinds JD (service keeps prior status). */
  @IsOptional()
  @IsIn(REQUISITION_STATUSES)
  status?: (typeof REQUISITION_STATUSES)[number];

  /** UF-HRM-12 — portal probe sends notes; must not 400 forbidNonWhitelisted. */
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  /** G-RC-01 — optional revise quantity; when set must be ≥ 1. */
  @IsOptional()
  @IsInt()
  @Min(1)
  headcount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  headcount_mode?: string;

  @IsOptional()
  @IsUUID()
  headcount_cell_id?: string;

  /** YYYY-MM | YYYY-MM-01 — coerced to first-of-month DATE in service. */
  @IsOptional()
  @IsString()
  @MaxLength(32)
  target_month?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  hire_reason?: string;

  @IsOptional()
  @IsUUID()
  replace_employee_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  out_of_plan_reason?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  job_template_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  job_description_id?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  job_description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  requirements?: string;

  /** AC-SET-CONSUMER-JG-REC-01 — catalog job_grades code; null clears. */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  job_grade_key?: string | null;
}
