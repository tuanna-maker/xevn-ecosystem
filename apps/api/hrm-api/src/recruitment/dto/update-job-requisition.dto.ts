/**
 * @CODE-MEMORY-CHANGE 2026-07-21 BE-HRM-G-RC-01
 * ADD optional headcount @IsInt @Min(1) — FR-HRM-RC-01 / TechSpec §14.7 G-RC-01.
 * must_keep: status + notes (UF-HRM-12); workflow_instance_id LOCK stays in service.
 */
import { IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

const REQUISITION_STATUSES = [
  'open',
  'closed',
  'on_hold',
  'draft',
  'pending_approval',
  'approved',
  'rejected',
  'cancelled',
] as const;

export class UpdateJobRequisitionDto {
  @IsIn(REQUISITION_STATUSES)
  status!: (typeof REQUISITION_STATUSES)[number];

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
}
