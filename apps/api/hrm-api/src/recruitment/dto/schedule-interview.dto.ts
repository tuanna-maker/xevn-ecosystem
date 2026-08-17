/**
 * @CODE-MEMORY-CHANGE 2026-08-06 PO-HRM-REC-IV-ONE-ACTIVE-BE-02
 * company_id: @IsUUID → @IsString max 80 — scope slug main/holding (match CreateCandidateDto).
 * must_keep: candidate_id UUID · one-active invariant in service layer
 */
import { IsISO8601, IsString, IsUUID, MaxLength } from 'class-validator';

export class ScheduleInterviewDto {
  @IsString()
  @MaxLength(80)
  company_id!: string;

  @IsUUID()
  candidate_id!: string;

  @IsISO8601()
  scheduled_at!: string;

  @IsString()
  @MaxLength(120)
  interviewer!: string;
}
