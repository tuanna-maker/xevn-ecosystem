import { IsISO8601, IsString, IsUUID, MaxLength } from 'class-validator';

export class ScheduleInterviewDto {
  @IsUUID()
  company_id!: string;

  @IsUUID()
  candidate_id!: string;

  @IsISO8601()
  scheduled_at!: string;

  @IsString()
  @MaxLength(120)
  interviewer!: string;
}
