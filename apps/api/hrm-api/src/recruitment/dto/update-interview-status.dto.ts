import { IsIn } from 'class-validator';

const INTERVIEW_STATUSES = ['scheduled', 'passed', 'failed', 'cancelled'] as const;

export class UpdateInterviewStatusDto {
  @IsIn(INTERVIEW_STATUSES)
  status!: (typeof INTERVIEW_STATUSES)[number];
}
