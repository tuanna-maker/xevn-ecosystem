/**
 * @CODE-MEMORY-CHANGE 2026-08-09 PO-HRM-MVP-GD1-REC-06A-CLUSTER-BE-01
 * UPGRADE: ADD `no_show` ∈ TERMINAL · optional `cancel_reason` (CFG required).
 * must_keep: soft status only · INVALID-TRANSITION in service · no hard DELETE
 */
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

const INTERVIEW_STATUSES = [
  'scheduled',
  'confirmed',
  'cancelled',
  'completed',
  'no_show',
  // Backward-compatible statuses kept for old rows.
  'passed',
  'failed',
] as const;

export class UpdateInterviewStatusDto {
  @IsIn(INTERVIEW_STATUSES)
  status!: (typeof INTERVIEW_STATUSES)[number];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  cancel_reason?: string;
}
