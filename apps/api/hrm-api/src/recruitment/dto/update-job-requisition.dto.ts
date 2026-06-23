import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

const REQUISITION_STATUSES = ['open', 'closed', 'on_hold'] as const;

export class UpdateJobRequisitionDto {
  @IsIn(REQUISITION_STATUSES)
  status!: (typeof REQUISITION_STATUSES)[number];

  /** UF-HRM-12 — portal probe sends notes; must not 400 forbidNonWhitelisted. */
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
